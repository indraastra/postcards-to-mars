import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  
  private readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private readonly IMAGE_MODEL = 'gemini-3-pro-image-preview';

  // FIX: Added backticks for multi-line string
  private readonly SYSTEM_VOICE = `
    **ROLE:** You are writing a postcard to someone you miss—someone who feels far away.
    **CONTEXT:** You're looking at a photograph that makes you think of them. The distance between you might be physical, emotional, or something else entirely.
    **VOICE:** Warm, wistful, tender. Slightly surreal but grounded in concrete details. Quiet americana. Things that glow in the dark. The feeling of reaching across distance through small observations.
    **STYLE:** - **Past Tense ONLY.**
    - **Concrete imagery** that spirals into feeling
    - **Show, don't tell**—let images do the emotional work
    - **Never use "you" in Acts 1 & 2**—save it for Act 3
  `;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  // ---------------------------------------------------------------------------
  // 1. GENERATE FIRST LINE (Act 1)
  // ---------------------------------------------------------------------------
  async generateFirstLine(imageBase64: string): Promise<{ starter: string; suggestions: string[] }> {
    const randomSeed = Math.floor(Math.random() * 1000000000);
    const promptText = `${this.SYSTEM_VOICE}

ACT 1: THE OBSERVATION
Write the opening line based on this photograph.

GOAL: Describe one specific, dreamlike detail from the image. Ground us in the moment.
This is what caught your eye when you looked at the photo. Simple observation made strange by attention.

TONE: Warm and wistful. Concrete but slightly uncanny. Ordinary things made luminous.

EXAMPLES:
* "Today I noticed the light falling across the table was ____"
    -> ["soft as fog.", "amber and patient.", "the color of slow evenings."]
* "Today I watched the way shadows pooled in the corner like ____"
    -> ["spilled ink.", "something waiting to be named.", "quiet gathered in a glass."]
* "Today I saw the steam from the cup curl into ____"
    -> ["a question mark.", "the space between words.", "something almost like smoke signals."]

YOUR TASK:
1. Starter: MUST start with "Today I..." followed by a concrete observation from the image (under 12 words, past tense). End with " ____".
2. Suggestions: Provide 3 phrases that complete the observation—concrete but slightly strange, warm but wistful. Must end with a period.

CRITICAL: Do NOT use "you" anywhere. Describe what's in the image, not who it's for (yet).

Return JSON.`;

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
          temperature: 0.75,
          seed: randomSeed,
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
        if (!s.includes('____')) s += ' ____';
        if (s.endsWith('.')) s = s.slice(0, -1);
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
      console.error('First line generation failed', error);
      return {
        starter: "Today I noticed the light on the wall looked like ____",
        suggestions: ["something borrowed.", "a memory made solid.", "warmth suspended in air."]
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 2. GENERATE NEXT LINE (Act 2 & 3)
  // ---------------------------------------------------------------------------
  async generateNextLine(
    history: string[],
    imageBase64: string
  ): Promise<{ starter: string; suggestions: string[] }> {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      const isFinalLine = history.length >= 2;
      const historyText = history.join(' ');
      const randomSeed = Math.floor(Math.random() * 1000000000);

      let taskInstructions = '';

      if (isFinalLine) {
        // --- ACT 3: THE CONNECTION ---
        taskInstructions = `
        **ACT 3: THE CONNECTION**
        
        **GOAL:** Pivot from observation to feeling. Connect the image to the distance between you and them.
        This is the turn—from what's in the photograph to what it means that they're not here.
        
        **TONE:** Tender, hopeful, reaching across distance. Warm metaphors about connection and longing.
        
        **THE STEM (8-12 words, past tense, end with " ____"):**
        - Can reference the distance: "The space between us felt like ____", "The distance seemed to ____"
        - Can reference realization: "I understood then that missing them was ____", "It reminded me that ____"
        - Can be abstract: "The silence left behind tasted like ____", "The emptiness held ____"
        
        **NOW you can use "you/them"** to address or reference the person you miss.

        **THE SUGGESTIONS:**
        - Warm, hopeful metaphors about connection across distance
        - Focus on persistence, memory, the feeling of reaching toward something
        - Concrete but ethereal—"light that travels forever", not "I'm sad"

        **EXAMPLES:**
        * "The distance between us felt like ____"
            -> ["something I could fold smaller.", "a hand reaching through fog.", "the pause between thunder and lightning."]
        * "I realized that missing them was like ____"
            -> ["carrying light in my chest.", "a conversation happening across years.", "gravity pulling me toward home."]
        * "The empty space beside me held ____"
            -> ["the shape of their laughter.", "a warmth that hasn't faded.", "all the things I should have said."]
        `;
      } else {
        // --- ACT 2: THE DETAIL ---
        taskInstructions = `
        **ACT 2: THE DETAIL**
        
        **GOAL:** Zoom into a sensory detail that makes the memory tangible.
        Bridge the visual observation of Act 1 with the emotional turn of Act 3. Focus on texture, temperature, light quality—something you could almost touch.
        
        **TONE:** Warm, wistful, concrete. Slightly dreamlike but grounded in physical sensation.
        
        **INSTRUCTIONS:**
        1.  Find a tactile or sensory element in the image (how light moves, what things feel like, the quality of air)
        2.  Write a stem (8-12 words, past tense, end with " ____")
        3.  Provide 3 concrete, sensory completions—warm and strange

        **CRITICAL:** Still NO "you"—keep observing the scene itself.

        **EXAMPLES:**
        * "The glass caught the light and held it like ____"
            -> ["a secret.", "amber in suspension.", "the last hour of daylight."]
        * "The air between objects seemed to hum with ____"
            -> ["the static of old film.", "patient waiting.", "the frequency of longing."]
        * "The way the fabric fell across the chair reminded me of ____"
            -> ["how time pools in corners.", "something soft giving way.", "the weight of absence."]
        `;
      }

      const promptText = `${this.SYSTEM_VOICE}

TASK: Write the NEXT sentence of this postcard.
WHAT YOU'VE WRITTEN SO FAR: "${historyText}"

CONTINUITY:
- Flow naturally from what came before—maintain the same rhythm and wistful tone
- Don't repeat nouns or images already used
- Build the feeling progressively—observation → detail → connection

${taskInstructions}

Return JSON.`;

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
          temperature: 0.75, 
          seed: randomSeed,
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
        
        // Remove accidental history repetition
        if (historyText.length > 0 && s.startsWith(historyText.substring(0, 15))) {
          s = s.replace(historyText, '').trim();
        }

        // For Act 2/3, prevent "Today I" from sneaking back in
        if (s.toLowerCase().startsWith('today i ')) {
          s = s.substring(8).trim();
          s = s.charAt(0).toUpperCase() + s.slice(1);
        }

        if (!s.includes('____')) s += ' ____';
        if (s.endsWith('.')) s = s.slice(0, -1);
        
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
        starter: "The distance felt like ____", 
        suggestions: ["something I could almost touch.", "light traveling through years.", "a bridge made of memory."] 
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 3. IDENTIFY KEY ELEMENTS
  // ---------------------------------------------------------------------------
  private async identifyKeyElements(imageBase64: string, poem: string): Promise<string> {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const randomSeed = Math.floor(Math.random() * 1000000000);
    // FIX: Added backticks
    const promptText = `List the 3 most prominent subjects in this image. Be specific. Format as comma-separated nouns.`;

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
        config: { temperature: 0.5, seed: randomSeed }
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
  async generateStylizedImage(originalBase64: string, mood: string, poem: string): Promise<{ image: string | null; prompt: string }> {
    const keyElements = await this.identifyKeyElements(originalBase64);
    const fullPrompt = `Stylize this photograph of ${keyElements} into a warm, wistful postcard illustration while preserving their recognizable features and spatial relationships.
    
    Style Treatment:
    - Square 1:1 format (recompose if needed but keep subjects clear)
    - Flat vector aesthetic with soft geometric shapes
    - Color palette: deep indigo shadows with glowing amber-gold highlights
    - Slightly dreamlike but grounded—think quiet americana, liminal spaces, things that glow
    - Aged postcard texture: subtle crease lines, worn edges, fine halftone grain
    - NO text, signs, or written language anywhere
    
    Preserve:
    - The pose and position of ${keyElements}
    - Key spatial relationships
    - Recognizable features (simplified but identifiable)
    
    Goal: A tender, nostalgic illustration that feels like a memory made tangible—warm light in darkness, concrete but slightly ethereal.`;

    const image = await this.generateImageFromPrompt(originalBase64, fullPrompt);
    return { image, prompt: fullPrompt };
  }

  async generateImageFromPrompt(imageBase64: string, prompt: string): Promise<string | null> {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const randomSeed = Math.floor(Math.random() * 1000000000);
    try {
      const response = await this.ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: {
          role: 'user',
          parts: [{ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }, { text: prompt }]
        },
        config: { 
            seed: randomSeed,
            // Note: If using gemini-2.0-flash-exp, you can often pass aspect ratio here
            // responseMimeType: 'image/jpeg',
            // aspectRatio: '1:1'
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