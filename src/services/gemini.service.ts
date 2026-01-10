import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { THEMES, ThemeConfig } from '../core/theme.config';

export interface PoemAct {
  starter: string;
  suggestions: string[];
}

export interface AnalysisResult {
  acts: PoemAct[];
  visual_tags: string[];
}

export interface Artifact {
  themeId: string;
  imageUrl: string;
  poem: string;
  prompt: string;
  version: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  public readonly PROMPT_VERSION = 'SEQ-85.3';
  private readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private readonly IMAGE_MODEL = 'gemini-3-pro-image-preview';
  private readonly REASONING_MODEL = 'gemini-3-flash-preview';

  // State
  activeTheme = signal<ThemeConfig>(THEMES[0]);
  customThemes = signal<ThemeConfig[]>([]); // Store custom themes

  // Session State (Multiverse Cache)
  // Map<themeId, Artifact>
  private artifactCache = new Map<string, Artifact>();

  constructor() {
    const p = (window as any).env?.apiKey;
    if (!p) {
      console.error('Gemini API Key is missing. Please check .env file or deployment config.');
    }
    this.ai = new GoogleGenAI({ apiKey: p });
  }

  setTheme(themeId: string) {
    let theme = THEMES.find(t => t.id === themeId);

    // Check custom themes if not found in built-ins
    if (!theme) {
      theme = this.customThemes().find(t => t.id === themeId);
    }

    if (theme) {
      this.activeTheme.set(theme);
    }
  }

  getAllThemes() {
    return [...THEMES, ...this.customThemes()];
  }

  addCustomTheme(theme: ThemeConfig) {
    this.customThemes.update(themes => [...themes, theme]);
  }

  // Cache Management
  cacheArtifact(themeId: string, artifact: Artifact) {
    this.artifactCache.set(themeId, artifact);
  }

  getArtifact(themeId: string): Artifact | undefined {
    return this.artifactCache.get(themeId);
  }

  clearCache() {
    this.artifactCache.clear();
  }

  private cleanBase64(data: string): string {
    return data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  }

  // --------------------------------------------------------------------------- 
  // CUSTOM THEME GENERATOR
  // --------------------------------------------------------------------------- 
  async generateCustomTheme(userPrompt: string): Promise<ThemeConfig | null> {
    const randomId = 'custom-' + Math.random().toString(36).substr(2, 9);

    const prompt = `
      **TASK:** Create a complete "Postcards to Mars" Theme Configuration based on the user's request: "${userPrompt}".
      
      **OUTPUT:** A single JSON object adhering to the ThemeConfig structure.
      
      **REQUIREMENTS:**
      1. **Name:** A poetic, 2-4 word title (e.g., "Neon Rain", "Velvet Void").
      2. **Short Name:** A 1-word punchy version for small UI chips (e.g. "Neon", "Void").
      3. **Text Persona:** A detailed system prompt defining who the "Poet" is (e.g., a time traveler, a ghost, a cat).
      4. **Visual Style:**
         - **Prompt Template:** A highly detailed Image-to-Image prompt for Gemini Pro Vision. It must include "{visual_modifiers}" placeholder. It should describe the art style, lighting, texture, and mood.
         - **Colors:** Pick a primary accent color, a dark background color, and a readable text color that fits the vibe.
         - **Fonts:** Choose from these available Google Fonts ONLY: 'Space Grotesk', 'Playfair Display', 'Orbitron', 'Roboto Mono', 'Courier Prime', 'Cinzel', 'Cormorant Garamond', 'Permanent Marker', 'Patrick Hand'.
      5. **Poem Structure:** Define a 3-Act narrative structure (Setup -> Interaction -> Resolution) with examples, similar to the provided examples.
      6. **UI Labels & Text:** 
         - **Landing Title/Subtitle:** Creative welcome text.
         - **Buttons:** Label for Upload (e.g. "Open Channel") and Archive (e.g. "View Log").
         - **Header Status:** A short, all-caps diegetic status message (e.g., "SIGNAL: STABLE").
         - **Loading Text:** Main loading state (e.g. "PROCESSING...").
         - **Loading Messages:** An array of 5 thematic strings for the loading cycle (e.g. "Aligning...", "Tuning...").
         - **Labels:** 
            - originLabel (e.g. "Sector"), postcardOrigin (e.g. "Earth"), idLabel (e.g. "Ref No").
            - regenLabel (e.g. "Retune"), editPoemLabel (e.g. "Rewrite").
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.REASONING_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              shortName: { type: Type.STRING },
              landingTitle: { type: Type.STRING },
              landingSubtitle: { type: Type.STRING },
              uploadButtonLabel: { type: Type.STRING },
              captureButtonLabel: { type: Type.STRING },
              headerStatus: { type: Type.STRING },
              loadingText: { type: Type.STRING },
              loadingMessages: { type: Type.ARRAY, items: { type: Type.STRING } },
              originLabel: { type: Type.STRING },
              postcardOrigin: { type: Type.STRING },
              idLabel: { type: Type.STRING },
              regenLabel: { type: Type.STRING },
              editPoemLabel: { type: Type.STRING },
              textPersona: { type: Type.STRING },
              poemStructure: { type: Type.STRING },
              visualStyle: {
                type: Type.OBJECT,
                properties: {
                  promptTemplate: { type: Type.STRING },
                  primaryColor: { type: Type.STRING },
                  backgroundColor: { type: Type.STRING },
                  textColor: { type: Type.STRING },
                  fontFamilyHeader: { type: Type.STRING },
                  fontFamilyBody: { type: Type.STRING },
                  filterRaw: { type: Type.STRING }
                },
                required: ['promptTemplate', 'primaryColor', 'backgroundColor', 'textColor', 'fontFamilyHeader', 'fontFamilyBody', 'filterRaw']
              }
            },
            required: ['name', 'shortName', 'landingTitle', 'landingSubtitle', 'uploadButtonLabel', 'archiveButtonLabel', 'headerStatus', 'loadingText', 'loadingMessages', 'originLabel', 'postcardOrigin', 'idLabel', 'regenLabel', 'editPoemLabel', 'textPersona', 'poemStructure', 'visualStyle']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');

      // Ensure the generated font families are wrapped in quotes if needed or just pass them raw if simple strings
      // The prompt requested valid font names. We trust the model somewhat but could validate.

      return {
        id: randomId,
        ...data
      };

    } catch (e) {
      console.error('Theme generation failed', e);
      return null;
    }
  }

  // --------------------------------------------------------------------------- 
  // 1. ANALYZE IMAGE (Poem Structure + Visual Tags)
  // --------------------------------------------------------------------------- 
  async analyzeImage(imageBase64: string): Promise<AnalysisResult> {
    const cleanData = this.cleanBase64(imageBase64);
    const randomSeed = Math.floor(Math.random() * 1000000000);
    const theme = this.activeTheme();

    const promptText = `${theme.textPersona}

**TASK:** Analyze the image and return a JSON object containing:
1. "acts": A cohesive 3-line poem structure.
2. "visual_tags": A list of 3-5 concise descriptors identifying the MAIN SUBJECTS (e.g. "a woman standing", "a cat sleeping"). Focus on physical presence.

**THE POEM NARRATIVE ARC:**
${theme.poemStructure}

**GLOBAL RULES:**
1.  **Flow:** The lines must read naturally as a sequence.
2.  **Grammar:** [Starter] + [Suggestion] MUST form a single, grammatically perfect sentence.
3.  **BREVITY (CRITICAL):** 
    - Keep it short. This is a small postcard.
    - **Starter:** Max 6 words.
    - **Suggestion:** Max 8 words.
    - **TOTAL LINE LENGTH:** Must be under 15 words.
4.  **RELEVANCE:**
    - The poem MUST be explicitly grounded in the specific visual details of the image.
    - If you see a person, pet, or object, weave them into the narrative arc.
    - Do not write generic text; look at what is actually there.
5.  **No Placeholders:** Starters must end with " ____". Suggestions must be text only.
6.  **Formatting:** Suggestions should NOT include leading spaces.

Return JSON object.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanData } },
            { text: promptText + "\nIMPORTANT: You must provide exactly 3 distinct suggestions for each act." }
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
                    suggestions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of exactly 3 distinct suggestions"
                    }
                  },
                  required: ['starter', 'suggestions']
                }
              },
              visual_tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['acts', 'visual_tags']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');

      // Post-processing acts
      const processedActs = (result.acts || []).map((act: any, index: number) => {
        let s = act.starter.trim();

        // Note: Removing strict "Today I" enforcement as themes now vary significantly
        if (!s.includes('____')) s += ' ____';
        if (s.endsWith('.')) s = s.slice(0, -1);

        const cleanedSuggestions = (act.suggestions || []).map((sg: string) => {
          let clean = sg.trim();
          if (!clean.endsWith('.')) clean += '.';
          return clean;
        });

        return { starter: s, suggestions: cleanedSuggestions };
      });

      return {
        acts: processedActs.length === 3 ? processedActs : this.getFallbackActs(),
        visual_tags: result.visual_tags || ["a memory from earth"]
      };

    } catch (error) {
      console.error('Analysis failed', error);
      return {
        acts: this.getFallbackActs(),
        visual_tags: ["a memory from earth"]
      };
    }
  }

  // --------------------------------------------------------------------------- 
  // 2. GENERATE STYLIZED IMAGE (Img2Img)
  // --------------------------------------------------------------------------- 
  async generateStylizedImage(originalBase64: string, visualModifiers: string): Promise<{ image: string | null; prompt: string; version: string }> {
    const cleanData = this.cleanBase64(originalBase64);
    const theme = this.activeTheme();

    // Check Cache First
    const cached = this.getArtifact(theme.id);
    if (cached) {
      console.log(`[Cache Hit] Returning artifact for ${theme.id}`);
      return { image: cached.imageUrl, prompt: cached.prompt, version: cached.version };
    }

    const BASE_PROMPT_CONSTRAINTS = `
    
    GLOBAL CONSTRAINTS:
    1. FRAMING: Adaptively recompose the scene to fit the 1:1 square format.
    2. PRESERVATION: Retain the main recognized subjects, their poses, and the overall composition. Ensure the result is recognizable as the original scene, but allow flexibility in framing and details to fit the style.
    3. VISUALS ONLY: The image must be purely visual and completely void of any written language, text, numbers, or signs, except for what was present in the original image.
    `;

    const fullPrompt = theme.visualStyle.promptTemplate.replace('{visual_modifiers}', visualModifiers) + BASE_PROMPT_CONSTRAINTS;

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

  private getFallbackActs(): PoemAct[] {
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