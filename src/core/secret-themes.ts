import { ThemeConfig } from './theme.config';

const SANDS_THEME: ThemeConfig = {
    id: 'sands',
    name: 'Sonnets in the Sand',
    shortName: 'The Sands',
    originLabel: 'Scribe',
    postcardOrigin: 'The Empty Quarter',
    idLabel: 'Seal No.',
    landingSubtitle: 'Whispers under the stars',
    uploadButtonLabel: 'Seal Message',
    captureButtonLabel: 'View Night',
    headerStatus: 'CONNECTION: ESTABLISHED',
    generatingText: 'Consulting the stars...',
    narrativeModuleLabel: 'Night Whisper',
    loadingText: 'Mapping Constellations',
    loadingMessages: [
        'Tracing the Milky Way...',
        'Stoking the campfire...',
        'Listening to the silence...',
        'Watching the dunes shift...',
        'Waiting for the moon...'
    ],
    regenLabel: 'Rewrite Star',
    editPoemLabel: 'Edit Sonnet',
    textPersona: `
**ROLE:** You are writing a deeply romantic sonnet/letter to a lover far away, from the perspective of someone in the quiet, starry desert night.
**VOICE:** Whispering, lyrical, intimate, peaceful.
**THEMES:** The vastness of the night sky, the warmth of a fire, silence, endurance of love across distance.
**KEY ELEMENTS:**
- Focus on the *stars* and the *night sky* (indigo, silver, gold).
- Contrast the cool night with the warmth of memory or a fire.
- Mention "Habibi" or "My Love".
- Avoid harsh daylight imagery; this is a nocturnal theme.
`,
    poemStructure: `
**STRUCTURE:**
1. **The Star:** Start with the guiding light above (a specific star or the moon).
2. **The Silence:** Describe the peace of the desert night around you.
3. **The Promise:** End with a promise that the same stars watch over them.
`,
    visualStyle: {
        promptTemplate: "A hot, arid, desert-like scene featuring {visual_modifiers} composed of shifting sand and sun-bleached textures. The lighting should be harsh, bright, and golden, evoking the feeling of high noon in the deep desert. Use a palette of burnt orange, ochre, and blinding white. Add a shimmering heat haze effect. The subject should feel ancient and weathered, as if it has been standing in the wind for centuries.",
        primaryColor: '#eab308', // Starlight Gold (keeping gold as primary accent)
        backgroundColor: '#1e1b4b', // Indigo 950 (Deep night sky)
        textColor: '#fef3c7', // Amber 100 (Warm white)
        fontFamilyHeader: '"Playfair Display", serif',
        fontFamilyBody: '"Lora", serif',
        filterRaw: 'contrast(1.2) brightness(0.9) saturate(1.1)' // Night look
    }
};

const VAN_GOGH_THEME: ThemeConfig = {
    id: 'van-gogh',
    name: 'Saffron & Amethyst',
    shortName: 'Van Gogh',
    originLabel: 'Canvas',
    postcardOrigin: 'Arles, France',
    idLabel: 'Study No.',
    landingSubtitle: 'Nature is not silent',
    uploadButtonLabel: 'Set Easel',
    captureButtonLabel: 'Capture Light',
    headerStatus: 'PALETTE: VIBRANT',
    generatingText: 'Applying thick paint...',
    narrativeModuleLabel: 'Artist Letters',
    loadingText: 'Mixing Oils',
    loadingMessages: [
        'Squeezing yellow ochre...',
        'Swirling the sky...',
        'Planting wild irises...',
        'Chasing the sun...',
        'Applying thick impasto...'
    ],
    regenLabel: 'Scrape Canvas',
    editPoemLabel: 'Refine Brushwork',
    textPersona: `
**ROLE:** You are Vincent van Gogh writing to your brother Theo about a new painting.
**VOICE:** Passionate, intense, humble, observant.
**THEMES:** The vibration of color, the consolation of nature, the simple beauty of flowers.
`,
    poemStructure: `
**VISUAL NOTES (NO NARRATIVE):**
* **GOAL:** List 3 vivid visual details about the light and color in the scene.
* **STYLE:** Fragmented, observational, painterly notes. No story. No "I".
* **Example:** "Violet shadows. Chrome yellow sun. Thick, swirling sky."
`,
    visualStyle: {
        promptTemplate: "Transform this scene of {visual_modifiers} in the style of a Vincent van Gogh impasto oil painting. Use thick, swirling brushstrokes and heavy paint application. Surround the primary subjects in the scene with swirling, brightly colored yellow and purple flowers, and apply bright and floral textures to all surfaces (walls, floors, ceilings, fabrics) liberally throughout the scene. Reconfigure the color and lighting and reduce the detail in the background to suit an oil painting.",
        primaryColor: '#facc15', // Sunflower Yellow
        backgroundColor: '#1e3a8a', // Starry Night Blue
        textColor: '#fef9c3', // Pale Yellow
        fontFamilyHeader: '"Playfair Display", serif',
        fontFamilyBody: '"Cormorant Garamond", serif',
        filterRaw: 'saturate(1.3) contrast(1.1) brightness(1.05)'
    },
    usePoemForImageGeneration: false,
    disableNarrative: true
};

const SECRET_THEMES: Record<string, ThemeConfig> = {
    '20260131': SANDS_THEME,
    '20260129': VAN_GOGH_THEME
};

export const getSecretTheme = (code: string): ThemeConfig | undefined => {
    return SECRET_THEMES[code.toUpperCase()];
};

export const getAllSecretThemes = (): ThemeConfig[] => {
    return Object.values(SECRET_THEMES);
};

