import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  
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
Study this image from Earth. Write one incomplete sentence (under 15 words) starting with "Today I..." in past tense, ending with "____". 

Capture something specific but dreamlike from what you see—the kind of detail that feels like it means more than it says. A moment between sleep and waking. Ordinary things made strange by attention.

Then provide 3 phrases to complete the blank:
- MUST relate to what's visible in this image
- Abstract, textural descriptions of Earth things
- Strange but comforting
- Turn ordinary Earth details into poetry

**Examples:**
"Today I watched the overpass lights bend into ____"
→ ["a question nobody asked", "the static between stations", "tomorrow's architecture"]

"Today I found the parking lot had grown ____"
→ ["a second sky", "the bones of a song", "its own weather"]

IMPORTANT: Your suggestions must describe things FROM THIS IMAGE, not Mars or space. You're documenting Earth.

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
          temperature: 0.8, 
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
  // 2. GENERATE NEXT LINE (Lines 2, 3)
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

      const promptText = isFinalLine 
        ? `You're writing the closing line of a postcard from Earth to Mars. The story so far:

"${history.join(' ')}"

**Final Line Structure:** Create an INCOMPLETE sentence that needs the blank filled.

Your sentence stem must:
- Be 8-12 words maximum
- Use past tense
- End with " ____" (with space before it)
- Be grammatically incomplete—it MUST need the suggestions to make sense

**Good incomplete sentences:**
✓ "It felt like ____"
✓ "I remembered ____"
✓ "It reminded me of ____"
✓ "I could almost touch ____"

**Bad (already complete):**
✗ "It felt like a whispered secret traveling light-years"
This doesn't need the blank—it's already done.

**Pivot inward:** Shift from what you saw to what you felt. Connection across distance. The feeling of driving through night toward something you can't name.

Provide 3 phrases (5-10 words each) to complete it:
- Warm, hopeful metaphors about connection and memory
- Distance and intimacy between Earth and Mars
- NOT literal Mars descriptions—focus on the feeling
- Examples: "a voice carried on light", "warmth that travels forever", "the shape of your laughter"

Return JSON: starter, suggestions`
        : `You're writing line two of a postcard from Earth to Mars. The story begins:

"${history.join(' ')}"

**Image context:** ${visualDescription}

**Second Line Structure:** Create an INCOMPLETE sentence that needs the blank filled.

Your sentence stem must:
- Be 8-12 words maximum
- Use past tense
- End with " ____" (with space before it)
- Be grammatically incomplete—it MUST need the suggestions to make sense
- Find a dreamlike detail in the image

**Good incomplete sentences:**
✓ "The shadows stretched toward ____"
✓ "The light seemed to hum with ____"
✓ "Everything glowed like ____"

**Bad (already complete):**
✗ "Its bright orange path seemed to glow against the muted grass"
This doesn't need the blank.

Go deeper into the scene. Find what glows, the wrong color, the uncanny geometry. Build atmosphere without repeating.

Provide 3 sensory phrases that describe things FROM THIS EARTH IMAGE:
- Textures, colors, sounds you can see in the photo
- Turn concrete details into poetic abstractions
- NOT Mars imagery—describe Earth things made strange

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
          temperature: 0.8, 
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
        
        // Safety cleanup
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
  // 3. CREATE VISUAL PROMPT
  // ---------------------------------------------------------------------------
  private async createVisualPrompt(mood: string, poem: string): Promise<string> {
    const promptText = `You're describing how to apply a stylized visual treatment to an existing photograph.

**The Poem:**
"${poem.replace(/\[|\]/g, '').substring(0, 300)}"

**Visual Treatment (Applied to Existing Content):**
- Keep all key subjects, poses, and spatial relationships from the original
- Apply theatrical lighting: enhance existing light sources into amber/gold glows against deep blue-teal shadows
- Stylize edges into cleaner geometric shapes while preserving recognizable details
- Use flat color areas with hard-edged shadows instead of gradients
- Create atmospheric mood through color temperature shifts

**Style Reference:**
Flat vector aesthetic, low poly geometry, minimalist theatrical lighting, silhouetted figures against glowing backgrounds. Deep indigos and teals punctured by warm amber highlights.

Write 2-3 sentences describing how to apply this visual filter while keeping the original composition and subjects intact.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: promptText,
        config: { temperature: 0.7 }
      });
      
      return response.text?.trim() || "Preserve the original composition, poses, and key subjects exactly. Apply a visual filter that shifts colors toward deep cyan-blue shadows with warm amber highlights, simplifies edges into cleaner geometric forms, and replaces gradients with flat color planes and hard shadows.";
    } catch (e) {
      console.error('Visual prompt generation failed', e);
      return "Preserve the original composition, poses, and key subjects exactly. Apply a visual filter that shifts colors toward deep cyan-blue shadows with warm amber highlights, simplifies edges into cleaner geometric forms, and replaces gradients with flat color planes and hard shadows.";
    }
  }

  // ---------------------------------------------------------------------------
  // 4. GENERATE STYLIZED IMAGE
  // ---------------------------------------------------------------------------
  async generateStylizedImage(originalBase64: string, mood: string, poem: string): Promise<string | null> {
    try {
      console.log('Step 1: Generating style description...');
      const visualPrompt = await this.createVisualPrompt(mood, poem);
      
      console.log('=== [Gemini] STYLE DESCRIPTION ===');
      console.log(visualPrompt);
      console.log('==================================\n');

      const cleanBase64 = originalBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      
      const fullPrompt = `Apply a stylized visual treatment to this photograph as a filter.

**CRITICAL: Preserve the Original**
- Keep all subjects, figures, poses, and spatial relationships exactly as they are
- Maintain the original composition and framing
- Preserve recognizable details and key characteristics
- This is STYLIZATION, not reimagining

**Style Treatment to Apply:**
${visualPrompt}

**Visual Adjustments:**
- Shift color palette: deepen shadows to blue-teal, warm highlights to amber-gold
- Simplify edges and forms into cleaner geometric shapes while keeping subjects recognizable
- Replace subtle gradients with flat color areas and hard-edged shadows
- Enhance contrast between lit and shadowed areas
- Add theatrical mood through lighting and color temperature

**Technical Requirements:**
- 1:1 square aspect ratio
- Flat vector aesthetic with geometric shapes
- High contrast between deep shadow planes and isolated warm light sources
- Minimalist: remove small details, focus on shape and light

**The Goal:**
Same scene, same subjects, same composition—but rendered through a stylized visual language. Like applying an artistic filter that transforms the mood while preserving the content.`;

      console.log('\n=== [Gemini] IMAGE GENERATION PROMPT ===');
      console.log(fullPrompt);
      console.log('========================================\n');

      const response = await this.ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: fullPrompt }
          ]
        }
      });

      const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

      if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
      }
      
      console.warn('No image in response, returning null');
      return null;
    } catch (error) {
      console.error('Image stylization failed', error);
      return null;
    }
  }
}