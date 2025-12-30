import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  
  // Specific model versions requested
  private readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private readonly IMAGE_MODEL = 'gemini-3-pro-image-preview';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  // ---------------------------------------------------------------------------
  // 1. GENERATE FIRST LINE (Act 1: The Observation)
  // ---------------------------------------------------------------------------
  async generateFirstLine(imageBase64: string): Promise<{ starter: string; suggestions: string[] }> {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const promptText = `You're writing a postcard from Earth to a colony on Mars. You're documenting what remains.

**Voice:** Liminal spaces, quiet americana, the poetry of distance. Wistful but warm. Tender observation of the uncanny. Things that glow in the dark.

**Your Task:**
Study this image. Write one opening sentence starting with "Today I..." in past tense, ending with "____". 

**The Lens:**
Look at the image through a dreamlike filter, turn ordinary details into strange but comforting poetry. Don't just list objects. Describe the *quality* of the scene.
- If it's a person: Describe the light on them, or the quiet of their pose.
- If it's nature: Describe the movement or the stillness.
- If it's an object: Describe its texture or presence.

**Constraints:**
1. **Stem Length:** UNDER 15 WORDS (Set the scene).
2. **Suggestion Length:** UNDER 8 WORDS.
3. **PAST TENSE ONLY.**.
4. **Subject + Verb.** DO NOT use fragments.
5. **End with " ____".**

**Examples:**
"Today I watched the light settle on the floor like ____"
→ ["dust from a previous life", "warm water", "gold spilled from a jar"]

"Today I found the silence in the room felt like ____"
→ ["a heavy blanket", "holding your breath", "the space between notes"]

Return JSON: starter, suggestions`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: promptText }
          ]
        },
        config: {
          temperature: 1.3, 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              starter: { type: Type.STRING },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['starter', 'suggestions']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.starter) {
        let s = result.starter.trim();
        if (!s.toLowerCase().startsWith('today i')) {
             s = 'Today I ' + s.replace(/^(today\s?|i\s?)+/i, ''); 
        }
        if (!s.includes('____')) s = s.replace(/[.,;!]+$/, '') + ' ____';
        result.starter = s;
      }

      if (result.suggestions && Array.isArray(result.suggestions)) {
        result.suggestions = result.suggestions.map((s: string) => {
          let clean = s.trim();
          if (!clean.endsWith('.')) clean += '.';
          return clean;
        });
      }
      
      return result;
    } catch (error) {
      console.error('First line failed', error);
      return {
        starter: "Today the light hit the wall and looked like ____",
        suggestions: ["a forgotten code.", "liquid glass.", "a memory of rain."]
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 2. GENERATE NEXT LINE (Act 2: Atmosphere / Act 3: The Punchline)
  // ---------------------------------------------------------------------------
  async generateNextLine(
    history: string[], 
    imageBase64: string
  ): Promise<{ starter: string; suggestions: string[] }> {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      const isFinalLine = history.length >= 2;
      const historyText = history.join(' ');

      const promptText = isFinalLine 
        ? `You're writing the closing line of a postcard from Earth to Mars.
        
**Context:**
- **Story so far:** "${historyText}"
- **Theme:** Optimism. Connection that defies physics. "Spooky action at a distance."

**Task: THE WARM CONNECTION**
1. **The Focal Point:** Look at the image one last time. Find the *main focal point*.
2. **The Stem:** Describe that focal point simply. e.g. "The [subject] looked...", "I realized the [subject] was...", "The way the [subject] moved..."
3. **The Blank:** The blank is for the *feeling* that this subject evokes about distance and connection - tending toward wistful, warm, and intimate to bridge that distance.

**Constraints:**
1. **Stem Length:** UNDER 15 WORDS.
2. **Suggestion Length:** UNDER 8 WORDS.
3. **PAST TENSE ONLY.**
4. **DIRECT ADDRESS:** You MUST use **"You"**, **"We"**, or **"Us"**.
5. **NO REPETITION:** Do NOT repeat nouns/adjectives from the story so far.

**Examples (Cosmic & Intimate):**
* "The light stretching across the floor looked like ____" -> ["a bridge across the stars.", "a tether to your orbit.", "a path for your return."]
* "I realized the distance between us was just ____" -> ["folding like a paper map.", "the space between two breaths.", "a trick of the light."]
* "The stillness in the room felt exactly like ____" -> ["time pooling on the floorboards.", "a deep breath held across the void.", "gravity remembering your weight."]

Return JSON: starter, suggestions`
        : `You're writing line two of a postcard from Earth to Mars.

**Context:**
- **Story so far:** "${historyText}"
- **Theme:** Deepening the atmosphere.

**Task: SENSORY DETAIL**
1. **Focus:** Find a specific sensory detail in the image (Light, Texture, Color, Sound).
2. **Pivot:** Describe the specific quality or "vibe" of that detail.

**Constraints:**
1. **Stem Length:** STRICTLY UNDER 12 WORDS.
2. **Suggestion Length:** STRICTLY UNDER 8 WORDS.
3. **PAST TENSE ONLY.**
4. **Structure:** [Subject] [Verb] [Simile/Metaphor stem] ____.
5. **NO REPETITION:** Do NOT repeat nouns/adjectives from the story so far.

**Examples:**
* "The air in the room tasted like ____" -> ["ozone and memory.", "rain on hot asphalt.", "waiting for thunder."]
* "The highway hummed in the distance like ____" -> ["a choir of ghosts.", "electric patience.", "ocean waves."]
* "The texture of the wall felt like ____" -> ["a map of time.", "braille for the lonely.", "cold stone."]

Return JSON: starter, suggestions`;

      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: promptText }
          ]
        },
        config: {
          temperature: 1.2, 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              starter: { type: Type.STRING },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['starter', 'suggestions']
          }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      
      if (result.starter) {
        let s = result.starter.trim();
        
        // Remove history repetition if the model ignored the instruction
        if (historyText.length > 0 && s.startsWith(historyText.substring(0, 20))) {
          s = s.replace(historyText, '').trim();
          if (s.length < 5) s = "It felt like";
        }

        // Prevent "Today I" repetition in Act 2/3
        if (s.toLowerCase().startsWith('today i ')) {
           s = s.substring(8).trim();
           s = s.charAt(0).toUpperCase() + s.slice(1);
        }

        // Ensure starter ends cleanly
        if (!s.includes('____')) s = s.replace(/[.,;!]+$/, '') + ' ____';
        result.starter = s;
      }

       if (result.suggestions && Array.isArray(result.suggestions)) {
        result.suggestions = result.suggestions.map((s: string) => {
          let clean = s.trim();
          if (!clean.endsWith('.')) clean += '.';
          return clean;
        });
      }

      return result;
    } catch (error) {
      console.error('Next line generation failed', error);
      return { 
        starter: "It felt like ____", 
        suggestions: ["a dream waking up.", "static on the line.", "the color of time."] 
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 3. IDENTIFY KEY ELEMENTS
  // ---------------------------------------------------------------------------
  private async identifyKeyElements(imageBase64: string, poem: string): Promise<string> {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    // USES OLD PROMPT (Reads Poem)
    const promptText = `You're analyzing a photograph to identify what must be preserved when applying artistic stylization.

**The Poem about this image:**
"${poem.replace(/\[|\]/g, '').substring(0, 300)}"

**Your Task:**
List the 3-5 most important visual elements that must remain recognizable.
- **IGNORE TEXT:** Do NOT list signage, street names, logos, or text.
- **Focus on Forms:** Identify main subjects (people, animals, objects) and key spatial relationships.
- **Atmosphere:** Note the light source if it's prominent.

Be specific but concise. Format as a comma-separated list.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: promptText }
          ]
        },
        config: { temperature: 0.5 }
      });
      
      const text = response.text?.trim();
      return (text && text.length > 3) ? text : "the main subject and light";
    } catch (e) {
      return "the main subject and light";
    }
  }

  // ---------------------------------------------------------------------------
  // 4. GENERATE STYLIZED IMAGE
  // ---------------------------------------------------------------------------
  async generateStylizedImage(originalBase64: string, poem: string): Promise<{ image: string | null; prompt: string }> {
    const keyElements = await this.identifyKeyElements(originalBase64, poem);
    
    // USES NEW PROMPT (Indigo/Amber Vector)
    const fullPrompt = `Stylize this photograph of ${keyElements} into a warm, wistful postcard illustration while preserving their recognizable features and spatial relationships.
    
    Style Treatment:
    - Square 1:1 format (recompose if needed but keep subjects clear)
    - Flat vector aesthetic with soft geometric shapes
    - Color palette: deep indigo shadows with glowing amber-gold highlights
    - Slightly dreamlike but grounded—think quiet americana, liminal spaces, things that glow
    - Aged postcard texture: subtle crease lines, worn edges, fine halftone grain
    - NO text, signs, or written language anywhere
    
    Preserve:
    - Pose and position of ${keyElements}
    - Key spatial relationships
    - Recognizable features
    
    Goal: A tender, nostalgic illustration that feels like a memory made tangible—warm light in darkness, concrete but slightly ethereal.`;

    const image = await this.generateImageFromPrompt(originalBase64, fullPrompt);
    return { image, prompt: fullPrompt };
  }

  public async generateImageFromPrompt(imageBase64: string, prompt: string): Promise<string | null> {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    try {
      const response = await this.ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: {
          role: 'user',
          parts: [{ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }, { text: prompt }]
        },
        config: { temperature: 1.5 }
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
      return imagePart?.inlineData ? `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` : null;
    } catch (error) {
      console.error('Generation from prompt failed', error);
      return null;
    }
  }
}