import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

export interface PoemAct {
  starter: string;
  suggestions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  // Diegetic Versioning for the Prompt Logic - Increment after every tweak!
  public readonly PROMPT_VERSION = 'SEQ-84.4';
  // Do not change model versions.
  private readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private readonly IMAGE_MODEL = 'gemini-3-pro-image-preview';

  // Persona: Intimate, Hopeful, Open
  private readonly SYSTEM_VOICE = `
    **ROLE:** You are writing a postcard to someone you love who is very far away (on Mars).
    **VOICE:** Intimate, warm, hopeful. The poetry of enduring connection.
    **STYLE:** - **Past Tense ONLY.**
    - **Concrete Imagery:** Anchor emotions in what's depicted in the image.
    - **Show, Don't Tell:** Focus on the feeling of the scene.
  `;

  constructor() {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const p = (window as any).env?.apiKey;
    if (!p) {
      console.error('Gemini API Key is missing. Please check .env file or deployment config.');
    }
    this.ai = new GoogleGenAI({ apiKey: p });
  }


  private cleanBase64(data: string): string {
    return data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  }

  // ---------------------------------------------------------------------------
  // 1. GENERATE FULL POEM STRUCTURE (One-Shot)
  // ---------------------------------------------------------------------------
  async generatePoemStructure(imageBase64: string): Promise<PoemAct[]> {
    const cleanData = this.cleanBase64(imageBase64);
    const randomSeed = Math.floor(Math.random() * 1000000000);

    // RESTORED: The exact text/examples from the original multi-step prompts
    const promptText = `${this.SYSTEM_VOICE}

**TASK:** Analyze the image and write a cohesive 3-line poem structure.
Return a JSON array where each item represents one "Act" of the poem.

**THE NARRATIVE ARC:**

**ACT 1: THE SETUP (The Observation)**
* **GOAL:** A specific, dreamlike observation of the **moment**. This is the setting. Just observe the world as it presents itself before the mind wanders to the recipient.
* **EXAMPLES:**
    * "Today I watched the horizon dissolve into ____" -> ["white ink.", "gold dust.", "a soft blur."]
    * "Today I noticed the quiet in the room felt like ____" -> ["a warm coat.", "a static hum.", "a held breath."]
* **CONSTRAINTS:**
    * **Starter:** MUST start with "Today I..." followed by a pithy past tense observation (under 12 words).
    * **Suggestions:** 3 distinct, evocative phrases to fill the blank.

**ACT 2: THE BODY (Specific Micro-Interaction)**
* **GOAL:** Describe a **Specific Micro-Interaction** in the scene. Bridge the visual setup of Act 1 with the emotional pivot of Act 3 by focusing on the **tactile reality** of the moment.
* **INSTRUCTIONS:** Identify the Interaction: What are the hands holding? What is the wind moving? What is the light touching?
* **EXAMPLES:**
    * "The cinnamon steam curled around ____" -> ["my frozen knuckles.", "the silence between us.", "the streetlamp's glow."]
    * "The carousel lights painted ____" -> ["stripes of gold across our coats.", "a halo on the wet pavement.", "shadows that danced like ghosts."]
    * "My fingers brushed against ____" -> ["the rough grain of the paper.", "the cold metal railing.", "empty air where your hand should be."]
* **CONSTRAINTS:**
    * **Starter:** A pithy, past tense sentence stem (under 12 words). End with " ____".
    * **Suggestions:** Focus on the **tactile** or **specific** outcome of that interaction.

**ACT 3: THE RESOLUTION (The Emotional Pivot)**
* **GOAL:** **Pivot inward.** Shift from what is seen to what is felt. Connection across distance. The feeling of driving through night toward something you can't name.
* **EXAMPLES:**
    * "The soft light on the stone was ____" -> ["a bridge of memory that stretched across the stars.", "a signal flare from yesterday.", "warmth that traveled light-years."]
    * "I realized the distance between us was ____" -> ["only a trick of the light.", "thinner than a sheet of paper.", "folded like a map in my pocket."]
* **CONSTRAINTS:**
    * **Starter:** A past tense sentence stem (under 12 words) that can be concrete ("The light...") OR abstract ("The distance...", "It felt like...", "The silence..."). Set up a comparison between "Here" (me) and "There" (you).
    * **Suggestions:** 3 warm, hopeful metaphors about connection and memory to bridge the distance between Earth (me) and Mars (you).

**GLOBAL RULES:**
1.  **Flow:** The lines must read naturally as a sequence.
2.  **No Repetition:** Do not repeat nouns or adjectives between acts.
3.  **Grammar:** Ensure every Starter + Suggestion combination forms a complete sentence ending in a period.
4.  **Format:** Every starter must end with " ____".

Return JSON object with property "acts".`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanData } },
            { text: promptText }
          ]
        },
        config: {
          temperature: 0.8,
          seed: randomSeed,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              acts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    starter: { type: Type.STRING },
                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['starter', 'suggestions']
                }
              }
            },
            required: ['acts']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');

      if (result.acts && Array.isArray(result.acts)) {
        return result.acts.map((act: any, index: number) => {
          let s = act.starter.trim();

          // 1. Enforce Act 1 "Today I" convention
          if (index === 0) {
            if (!s.toLowerCase().startsWith('today i')) {
              s = 'Today I ' + s.replace(/^(today\s?|i\s?)+/i, '');
            }
          }

          // 2. Prevent "Today I" in Acts 2 and 3
          if (index > 0 && s.toLowerCase().startsWith('today i')) {
            s = s.replace(/^today i\s+/i, 'The ');
            s = s.charAt(0).toUpperCase() + s.slice(1);
          }

          // 3. Formatting cleanup
          if (!s.includes('____')) s += ' ____';
          if (s.endsWith('.')) s = s.slice(0, -1);

          const cleanedSuggestions = (act.suggestions || []).map((sg: string) => {
            let clean = sg.trim();
            if (!clean.endsWith('.')) clean += '.';
            return clean;
          });

          return { starter: s, suggestions: cleanedSuggestions };
        });
      }

      throw new Error('Invalid JSON structure');
    } catch (error) {
      console.error('Poem structure generation failed', error);
      // Fallback Structure
      return [
        {
          starter: "Today I watched the light hit the wall like ____",
          suggestions: ["a forgotten code.", "liquid glass.", "a memory of rain."]
        },
        {
          starter: "The silence felt like ____",
          suggestions: ["a heavy coat.", "static on the line.", "holding my breath."]
        },
        {
          starter: "I realized the distance was ____",
          suggestions: ["just a trick of the light.", "thinner than paper.", "folded like a map."]
        }
      ];
    }
  }

  // ---------------------------------------------------------------------------
  // 2. IDENTIFY KEY ELEMENTS
  // ---------------------------------------------------------------------------
  private async identifyKeyElements(imageBase64: string): Promise<string> {
    const randomSeed = Math.floor(Math.random() * 1000000000);
    const cleanData = this.cleanBase64(imageBase64);

    const promptText = `
**TASK:** List the 3 most prominent physical subjects in this image.
- **Rules:** Nouns only. Be specific (e.g., "a carousel", "two hands").
- **Output:** A simple comma-separated list.
`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanData } },
            { text: promptText }
          ]
        },
        config: { temperature: 0.5, seed: randomSeed }
      });

      const text = response.text?.trim();
      return (text && text.length > 3) ? text : "the main silhouette and light source";
    } catch (e) {
      return "the main silhouette and light source";
    }
  }

  // ---------------------------------------------------------------------------
  // 3. GENERATE STYLIZED IMAGE
  // ---------------------------------------------------------------------------
  async generateStylizedImage(originalBase64: string): Promise<{ image: string | null; prompt: string; version: string }> {
    const cleanData = this.cleanBase64(originalBase64);
    const keyElements = await this.identifyKeyElements(cleanData);

    // Semantic Negative Prompting applied here:
    const fullPrompt = `Transform the provided photograph of ${keyElements} into a moody, square-format vector illustration that evokes a vintage memory. Adaptively recompose the scene to fit the 1:1 square format, preserving the pose and relative identity of the subjects while simplifying them into flat, angular geometry. The composition is purely visual, defined strictly by deep indigo shadows and glowing amber highlights, completely void of written language or signs. The surface appears aged and tactile like a postcard found on Mars, marked by white crease lines, worn edges, and a coarse halftone grain that replaces all photorealistic detail.`;

    const image = await this.generateImageFromPrompt(cleanData, fullPrompt);
    return { image, prompt: fullPrompt, version: this.PROMPT_VERSION };
  }

  async generateImageFromPrompt(imageBase64: string, prompt: string): Promise<string | null> {
    const randomSeed = Math.floor(Math.random() * 1000000000);
    const cleanData = this.cleanBase64(imageBase64);

    try {
      console.log('\n=== [Gemini] GENERATE IMAGE PROMPT ===');
      console.log(prompt);

      const response = await this.ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: {
          role: 'user',
          parts: [{ inlineData: { mimeType: 'image/jpeg', data: cleanData } }, { text: prompt }]
        },
        config: {
          seed: randomSeed,
        }
      });
      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
      return imagePart?.inlineData ? `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` : null;
    } catch (error) {
      console.error('Generation from prompt failed', error);
      return null;
    }
  }
}