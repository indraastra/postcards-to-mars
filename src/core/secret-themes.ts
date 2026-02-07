import { ThemeConfig } from './theme.config';

const SANDS_THEME: ThemeConfig = {
    id: 'sands',
    name: 'Sonnets in the Sand',
    shortName: 'Arabia',
    originLabel: 'Scribe',
    postcardOrigin: 'The Empty Quarter',
    idLabel: 'Seal No.',
    landingSubtitle: "Resting under the stars",
    uploadButtonLabel: 'Seal Message',
    captureButtonLabel: 'View Night',
    headerStatus: 'DESERT: ENDLESS',
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
**ROLE:** You are writing a deeply romantic sonnet/letter to a lover far away, from the perspective of someone traveling with a caravan in the quiet, starry desert night.
**VOICE:** Whispering, lyrical, intimate, peaceful.
**THEMES:** The vastness of the night sky, the warmth of a fire, silence, endurance of love across distance, the slow pace of the camels.
**KEY ELEMENTS:**
- Focus on the *stars* and the *night sky* (indigo, silver, gold).
- Contrast the cool night with the warmth of memory or a fire.
- Mention "Habibi" or "My Love".
- Mention the "Caravan" or the "Journey".
`,
    poemStructure: `
**STRUCTURE:**
1. **The Star:** Start with the guiding light above (a specific star or the moon).
2. **The Silence:** Describe the peace of the desert night around you.
3. **The Promise:** End with a promise that the same stars watch over them.
`,
    visualStyle: {
        promptTemplate: "A hot, arid, desert-like scene featuring {visual_modifiers} composed of shifting sand and sun-bleached textures. The lighting should be harsh, bright, and golden, evoking the feeling of high noon in the deep desert. Use a palette of burnt orange, ochre, and blinding white. Add a shimmering heat haze effect. The subject should feel ancient and weathered. Include subtle silhouettes of camels or caravan tracks in the distance.",
        primaryColor: '#eab308', // Starlight Gold (keeping gold as primary accent)
        backgroundColor: '#1e1b4b', // Indigo 950 (Deep night sky)
        textColor: '#fef3c7', // Amber 100 (Warm white)
        fontFamilyHeader: '"Playfair Display", serif',
        fontFamilyBody: '"Lora", serif',
        filterRaw: 'contrast(1.2) brightness(0.9) saturate(1.1)' // Night look
    }
};

const BUTTERFLY_THEME: ThemeConfig = {
    id: 'butterfly',
    name: 'Saffron & Amethyst',
    shortName: 'Butterfly',
    originLabel: 'Aria',
    postcardOrigin: 'Nagasaki Harbor',
    idLabel: 'Act No.',
    landingSubtitle: 'Un bel dì, vedremo',
    uploadButtonLabel: 'Wait',
    captureButtonLabel: 'Watch Horizon',
    headerStatus: 'ARIA: SOARING',
    generatingText: 'Singing Aria...',
    narrativeModuleLabel: 'The Aria',
    loadingText: 'Waiting for the ship',
    loadingMessages: [
        'Scanning the horizon...',
        'Watching the robin nest...',
        'Counting the cherry blossoms...',
        'Singing to the sea...',
        'Waiting for the cannon shot...'
    ],
    regenLabel: 'Sing Again',
    editPoemLabel: 'Rewrite Aria',
    textPersona: `
**ROLE:** You are Cio-Cio-San (Madama Butterfly), writing a letter of undying hope and tragic love while waiting for a ship to return.
**VOICE:** Passionate, intense, fragile but determined, operatic.
**THEMES:** The vibration of color, the consolation of nature, the simple beauty of flowers, and the certainty of love's return.
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

const LONDON_FROST_THEME: ThemeConfig = {
    id: 'london-frost',
    name: 'The Edge of Winter',
    shortName: 'Valentine',
    originLabel: 'Vantage',
    postcardOrigin: 'The Heath',
    idLabel: 'Print No.',
    landingSubtitle: 'Snowfall on the capital',
    uploadButtonLabel: 'Walk Path',
    captureButtonLabel: 'Etch Scene',
    headerStatus: 'FROST: ETERNAL',
    generatingText: 'Carving Woodblock...',
    narrativeModuleLabel: 'Winter Walk',
    loadingText: 'Falling Snow',
    loadingMessages: [
        'Looking from Alexandra Palace...',
        'Walking the reservoirs...',
        'Watching the swans freeze...',
        'Inking the woodblock...',
        'Pressing the paper...'
    ],
    regenLabel: 'Re-Ink Block',
    editPoemLabel: 'Rewrite Verse',
    textPersona: `
**ROLE:** You are a romantic flâneur walking through a snowy London, specifically the high points of the North (Alexandra Palace, Hampstead Heath) or the quiet waters of the East (Walthamstow Wetlands).
**VOICE:** Observational, quiet, appreciative. Mixing the urban brick with the natural snow.
**STYLE:** Focus on the specific geography of London (The Palace, The Ponds, The Reservoirs).
`,
    poemStructure: `
**ACT 1: THE VISTA**
* **GOAL:** Establish the location and the view.
* **GUIDANCE:**
* **Focus:** Looking out over the city from a high point, or across a frozen reservoir.
* **Make it:** Specific (Ally Pally, The Heath).
* **Example:** "From the Palace hill, the city is a sleeping giant."

**ACT 2: THE FROST**
* **GOAL:** Describe the texture of winter on the city.
* **GUIDANCE:**
* **Focus:** Ice on red brick, breath in the air, the crunch of snow.
* **Make it:** Tactile.
* **Example:** "Frost clings to the iron gates like lace."

**ACT 3: THE WALTZ**
* **GOAL:** A moment of movement or connection.
* **GUIDANCE:**
* **Focus:** Skaters, walking arm in arm, or the "dance" of winter.
* **Make it:** Romantic and shared.
* **Example:** "We skate on the edge of the thaw, hand in hand."
`,
    visualStyle: {
        promptTemplate: "Transform this image of {visual_modifiers} into a Shin-hanga style Japanese woodblock print set in a snowy Victorian London. FUSION STYLE: Combine the red brick architecture and ironwork of London landmarks (Alexandra Palace, Hampstead Heath) with the flat composition, bold outlines, and bokashi gradients of Hiroshige. FEATURES: Heavy falling snow, glowing gas lamps, deep Prussian blue skies, stark white snow, and brick red accents. COMPOSITION: Flatten the perspective, use wood grain texture, and emphasize the contrast between the warmth of the lamps and the cold of the snow.",
        primaryColor: '#b91c1c', // Brick Red
        backgroundColor: '#eff6ff', // Ice Blue
        textColor: '#172554', // Deep Indigo
        fontFamilyHeader: '"Cinzel", serif',
        fontFamilyBody: '"Spectrale", serif',
        filterRaw: 'contrast(1.1) saturate(1.2) sepia(0.2)'
    },
    usePoemForImageGeneration: true
};

const SECRET_THEMES: Record<string, ThemeConfig> = {
    '20260131': SANDS_THEME,
    '20260129': BUTTERFLY_THEME,
    '20260214': LONDON_FROST_THEME
};

export const getSecretTheme = (code: string): ThemeConfig | undefined => {
    return SECRET_THEMES[code.toUpperCase()];
};

export const getAllSecretThemes = (): ThemeConfig[] => {
    return Object.values(SECRET_THEMES);
};

