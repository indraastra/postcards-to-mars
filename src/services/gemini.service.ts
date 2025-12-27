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
  // 1. ANALYZE IMAGE (Line 1)
  // ---------------------------------------------------------------------------
  async analyzeImage(imageBase64: string): Promise<{ starter: string; mood: string; visualDescription: string; narrativeArc: string; suggestions: string[] }> {
    const promptText = `You're writing a postcard from Earth to a colony on Mars. You're documenting what remains.

**Voice:** Liminal spaces, quiet americana, the poetry of distance. Wistful but warm. Tender observation of the uncanny. Things that glow in the dark.

**Your Task:**
Study this image. Write one incomplete sentence (under 15 words) starting with "Today I..." in past tense, ending with "____". 

**The Lens:**
Look at the image through a dreamlike filter. Don't just list objects. Describe the *quality* of the scene.
- If it's a person: Describe the light on them, or the quiet of their pose.
- If it's nature: Describe the movement or the stillness.
- If it's an object: Describe its texture or presence.

**Suggestions:**
Provide 3 phrases to complete the blank.
- MUST relate to visual details in *this specific image*.
- Turn ordinary details into poetry.
- Strange but comforting.

**Examples:**
"Today I watched the light settle on the floor like ____"
→ ["dust from a previous life", "warm water", "gold spilled from a jar"]

"Today I found the silence in the room felt like ____"
→ ["a heavy blanket", "holding your breath", "the space between notes"]

Return JSON: starter, mood, visualDescription, narrativeArc, suggestions`;

    console.log('\n=== [Gemini] ANALYZE IMAGE PROMPT ===');
    console.log(promptText);
    console.log('=====================================\n');

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: promptText }
          ]
        },
        config: {
          temperature: 0.9, 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              starter: { type: Type.STRING },
              mood: { type: Type.STRING },
              visualDescription: { type: Type.STRING },
              narrativeArc: { type: Type.STRING },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['starter', 'mood', 'visualDescription', 'narrativeArc', 'suggestions']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      if (result.starter && !result.starter.includes('____')) {
        result.starter = result.starter.replace(/[.,;!]+$/, '') + ' ____';
      }
      
      console.log('=== [Gemini] ANALYZE RESULT ===');
      console.log(result);
      console.log('===============================\n');

      return result;
    } catch (error) {
      console.error('Analysis failed', error);
      return {
        starter: "Today the light hit the wall and looked like ____",
        mood: "Surreal",
        visualDescription: "A quiet scene on Earth.",
        narrativeArc: "Connection",
        suggestions: ["a forgotten code", "liquid glass", "a memory of rain"]
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 2. GENERATE NEXT LINE (Lines 2 & 3)
  // ---------------------------------------------------------------------------
  async generateNextLine(
    history: string[], 
    mood: string, 
    visualDescription: string,
    narrativeArc: string,
    imageBase64: string
  ): Promise<{ starter: string; suggestions: string[] }> {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      const isFinalLine = history.length >= 2;

      // --- UNIVERSAL PROMPTS ---
      const promptText = isFinalLine 
        ? `You're writing the closing line of a postcard from Earth to Mars.
        
**Context:**
- **Story so far:** "${history.join(' ')}"
- **Theme:** ${narrativeArc}
- **Mood:** ${mood}

**Final Line Task: THE ANCHOR**
1. **Look at the image one last time.** Find the *main focal point*—whatever it is (a face, a tree, a shadow, a messy desk, a building).
2. **The Sentence Stem:** Describe that focal point simply. "The [subject] looked...", "I realized the [subject] was...", "The way the [subject] moved..."
3. **The Blank:** The blank is for the *feeling* that this subject evokes about distance and connection.

**Style:** - Wistful, warm, intimate.
- **Do not be too abstract.** Ground the feeling in the image.
- **Do not be too literal.** The image is a metaphor for missing someone.

**Suggestions (The Connection):**
Provide 3 phrases (5-10 words each) to complete it.
- **Goal:** Connect the visual details to the theme of "${narrativeArc}".
- **Examples:** "like a promise kept", "the shape of your laughter", "a signal waiting to be caught", "warmth that travels forever".

Return JSON: starter, suggestions`
        : `You're writing line two of a postcard from Earth to Mars.

**Context:**
- **Story so far:** "${history.join(' ')}"
- **Image Context:** ${visualDescription}
- **Theme:** ${narrativeArc}

**Second Line Task: DEEPENING THE ATMOSPHERE**
Create an incomplete sentence that focuses on a **sensory detail** in the image (Light, Texture, Color, Sound) that reinforces the theme of "${narrativeArc}".

**The Vibe:**
- If the image is busy, find the stillness.
- If the image is empty, find the presence.
- If the image is dark, find the glow.

**Sentence Stem:**
- Past tense.
- End with " ____".
- Must be incomplete.

**Suggestions:**
- 3 poetic phrases describing that sensory detail.
- Strange, dreamy, specific to Earth.

Return JSON: starter, suggestions`;

      console.log('\n=== [Gemini] NEXT LINE PROMPT ===');
      console.log(promptText);
      console.log('=================================\n');

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
          temperature: 0.9, 
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
        
        // Safety cleanup for repeated history
        const historyStr = history.join(' ');
        if (history.length > 0 && s.startsWith(historyStr.substring(0, 20))) {
          s = s.replace(historyStr, '').trim();
          if (s.length < 5) s = "It felt like";
        }

        if (!s.includes('____')) {
          s = s.replace(/[.,;!]+$/, '');
          s += ' ____';
        }
        result.starter = s;
      }

      console.log('=== [Gemini] NEXT LINE RESULT ===');
      console.log(result);
      console.log('=================================\n');

      return result;
    } catch (error) {
      console.error('Next line generation failed', error);
      return { 
        starter: "It felt like ____", 
        suggestions: ["a dream waking up", "static on the line", "the color of time"] 
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 3. IDENTIFY KEY ELEMENTS TO PRESERVE
  // ---------------------------------------------------------------------------
  private async identifyKeyElements(imageBase64: string, poem: string): Promise<string> {
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
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: promptText }
          ]
        },
        config: { temperature: 0.5 }
      });
      
      return response.text?.trim() || "Main subject and composition";
    } catch (e) {
      console.error('Element identification failed', e);
      return "Main subject and composition";
    }
  }

  // ---------------------------------------------------------------------------
  // 4. GENERATE STYLIZED IMAGE
  // ---------------------------------------------------------------------------
  async generateStylizedImage(originalBase64: string, mood: string, poem: string): Promise<{ image: string | null; prompt: string }> {
    try {
      console.log('Step 1: Identifying key elements to preserve...');
      const cleanBase64 = originalBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      const keyElements = await this.identifyKeyElements(cleanBase64, poem);
      
      console.log('=== [Gemini] KEY ELEMENTS ===');
      console.log(keyElements);
      console.log('=============================\n');

      const fullPrompt = `Apply stylized visual treatment to this photograph while preserving its content.

**CRITICAL: Preserve These Elements**
${keyElements}

Keep these recognizable. Do not add new objects.

**Style to Apply: "Mars-Tinged Memory Postcard"**
- **Palette:** Deep Indigo/Black shadows vs. Warm Rust/Amber/Gold highlights.
- **Aesthetic:** Flat vector shapes + Aged Analog Texture.
- **Lighting:** Theatrical "stage" lighting. High contrast.
- **Texture:** Apply heavy **film grain, dust, scratches, and worn paper texture** to simulate an aged physical postcard found on Mars.
- **Forms:** Simplify details into cleaner geometric shapes (Low Poly/Vector) but keep the organic feel of the subject.

**Technical Requirements:**
- 1:1 square aspect ratio
- Same composition and framing as original
- Subjects remain recognizable
- NO photorealism. Target look: "A vector illustration printed on old, coarse cardstock."

**The Goal:**
Transform the photo's visual style (colors, edges, lighting) while preserving what's actually in it. Like an artistic filter, not a reimagining.`;

      const image = await this.generateImageFromPrompt(originalBase64, fullPrompt);
      return { image, prompt: fullPrompt };

    } catch (error) {
      console.error('Image stylization failed', error);
      return { image: null, prompt: '' };
    }
  }

  // ---------------------------------------------------------------------------
  // 5. GENERATE FROM PROMPT (Helper)
  // ---------------------------------------------------------------------------
  async generateImageFromPrompt(originalBase64: string, prompt: string): Promise<string | null> {
    try {
       const cleanBase64 = originalBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
       
       console.log('\n=== [Gemini] GENERATE FROM PROMPT ===');
       console.log(prompt);
       console.log('=====================================\n');

       const response = await this.ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: prompt }
          ]
        }
      });

      const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

      if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
      }
      return null;
    } catch (error) {
      console.error('Generation from prompt failed', error);
      return null;
    }
  }
}