export interface ThemeConfig {
  id: string;
  name: string;
  shortName: string;
  originLabel: string;
  postcardOrigin: string;
  idLabel: string;
  landingTitle: string;
  landingSubtitle: string;
  uploadButtonLabel: string;
  archiveButtonLabel: string;
  headerStatus: string;
  loadingText: string;
  loadingMessages: string[];
  regenLabel: string;
  editPoemLabel: string;
  textPersona: string;
  poemStructure: string;
  visualStyle: {
    promptTemplate: string;
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamilyHeader: string;
    fontFamilyBody: string;
    filterRaw: string;
  };
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'mars',
    name: 'Postcards to Mars',
    shortName: 'Mars',
    originLabel: 'Origin',
    postcardOrigin: 'Earth (Lost)',
    idLabel: 'Archive Id',
    landingTitle: 'Colony 7 Uplink',
    landingSubtitle: 'Establishing deep space connection...',
    uploadButtonLabel: 'Begin Transmission',
    archiveButtonLabel: 'Consult Archive',
    headerStatus: 'LIFE SUPPORT: NOMINAL',
    loadingText: 'Processing Signal...',
    loadingMessages: [
      'Aligning satellites...',
      'Calculating trajectory...',
      'Boosting signal gain...',
      'Filtering cosmic noise...',
      'Triangulating coordinates...'
    ],
    regenLabel: 'Adjust Signal',
    editPoemLabel: 'Edit Log',
    textPersona: `
**ROLE:** You are writing a postcard to someone you love who is very far away (on Mars).
**VOICE:** Intimate, warm, hopeful. The poetry of enduring connection.
**STYLE:** Past Tense. Concrete Imagery. Show, Don't Tell.
    `,
    poemStructure: `
**ACT 1: THE OBSERVATION**
* **GOAL:** A tiny, specific detail of the moment.
* **CONSTRAINTS:**
    * **Starter Prompt:** An open-ended observation about the light, the air, or a specific object. Ends with " ____".
    * **Suggestions:** Complete the image simply and poetically. (Under 10 words).
    * **Example:** "The dust motes danced ____" -> "like tiny stars in the void."

**ACT 2: THE SENSATION**
* **GOAL:** A tactile feeling or micro-interaction.
* **CONSTRAINTS:**
    * **Starter Prompt:** A stem focusing on touch, sound, or a fleeting sensation. Ends with " ____".
    * **Suggestions:** A concrete, visceral sensation. (Under 10 words).
    * **Example:** "I could almost feel ____" -> "the static on your skin."

**ACT 3: THE CONNECTION**
* **GOAL:** A bridge to the recipient on Mars.
* **CONSTRAINTS:**
    * **Starter Prompt:** A sentence stem bridging the distance or expressing longing. Ends with " ____".
    * **Suggestions:** A warm, hopeful thought about connection. (Under 10 words).
    * **Example:** "Distance is just ____" -> "a number we haven't solved yet."
    `,
    visualStyle: {
      promptTemplate: `Transform the provided photograph of {visual_modifiers} into a moody, square-format vector illustration that evokes a vintage memory. Adaptively recompose the scene to fit the 1:1 square format, preserving the pose and relative identity of the subjects while simplifying them into flat, angular geometry. The composition is purely visual, defined strictly by deep indigo shadows and glowing amber highlights, completely void of written language or signs. The surface appears aged and tactile like a postcard found on Mars, marked by white crease lines, worn edges, and a coarse halftone grain that replaces all photorealistic detail.`,
      primaryColor: '#be123c', // Rose-700
      backgroundColor: '#f4f1ea',
      textColor: '#1a1a1d',
      fontFamilyHeader: '"Space Grotesk", sans-serif',
      fontFamilyBody: '"Playfair Display", serif',
      filterRaw: 'contrast(1.2) brightness(0.9) sepia(0.2)'
    }
  },
  {
    id: 'tokyo',
    name: 'Trains to Tokyo',
    shortName: 'Tokyo',
    originLabel: 'Carriage',
    postcardOrigin: 'No. 6',
    idLabel: 'Ticket',
    landingTitle: 'One-Way Ticket',
    landingSubtitle: 'The sea tracks stretch forever...',
    uploadButtonLabel: 'Board Train',
    archiveButtonLabel: 'Travel Log',
    headerStatus: 'NEXT STOP: TOKYO',
    loadingText: 'Steam rising...',
    loadingMessages: [
      'Collecting soot sprites...',
      'Checking boiler pressure...',
      'Serving herbal tea...',
      'Watching clouds pass...',
      'Crossing the endless ocean...'
    ],
    regenLabel: 'New Journey',
    editPoemLabel: 'Rewrite Travel Log',
    textPersona: `
**ROLE:** You are a traveler on a magical train running over a shallow ocean, like in Spirited Away.
**VOICE:** Gentle, nostalgic, wondrous. The feeling of a long, quiet journey with strange companions.
**STYLE:** STRICT HAIKU FORMAT (5-7-5 syllables). Focus on nature, clouds, and quiet magic.
    `,
    poemStructure: `
**ACT 1: THE VIEW (5 Syllables)**
* **GOAL:** A concrete image of the passing world (Clouds, Sea, Islands).
* **CONSTRAINTS:**
    * **Starter Prompt:** 5 syllables exactly. Focus on the sky or water.
    * **Suggestions:** "White clouds drift along", "Ocean waves roll by".
    * **Example:** "Blue sea climbs the sky"
    * **NOTE:** Total line must be 5 syllables.

**ACT 2: THE COMPANION (7 Syllables)**
* **GOAL:** A shadow, spirit, or feeling of presence.
* **CONSTRAINTS:**
    * **Starter Prompt:** 7 syllables exactly.
    * **Suggestions:** "Shadows sit beside me now", "Silent spirits watching us".
    * **Example:** "Shadows sit silently here"
    * **NOTE:** Total line must be 7 syllables.

**ACT 3: THE MEMORY (5 Syllables)**
* **GOAL:** A gentle closing thought.
* **CONSTRAINTS:**
    * **Starter Prompt:** 5 syllables exactly.
    * **Suggestions:** "Summer never ends", "Home is far away".
    * **Example:** "Summer never ends"
    * **NOTE:** Total line must be 5 syllables.
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a stunning hand-painted anime background in the style of Studio Ghibli (Hayao Miyazaki). If a person is present, transform them into a Ghibli-style character with simple facial features and natural clothing. The setting should be lush, painterly, and idyllic. Apply soft, natural lighting, fluffy cumulus clouds, and vibrant blues and greens. The texture should look like a high-quality gouache or watercolor painting on paper. No neon or cyberpunk elements. It captures a moment of "Ma" (quiet emptiness) and wonder.`,
      primaryColor: '#0ea5e9', // Sky-500
      backgroundColor: '#f0f9ff', // Sky-50
      textColor: '#0c4a6e', // Sky-900
      fontFamilyHeader: '"Patrick Hand", cursive',
      fontFamilyBody: '"Cormorant Garamond", serif',
      filterRaw: 'saturate(1.2) contrast(1.05) brightness(1.05)'
    }
  },
  {
    id: 'noir',
    name: 'Shadows of the City',
    shortName: 'Noir',
    originLabel: 'Location',
    postcardOrigin: 'Precinct 4',
    idLabel: 'Case No.',
    landingTitle: 'Detective Bureau',
    landingSubtitle: 'Open a new case file...',
    uploadButtonLabel: 'Examine Evidence',
    archiveButtonLabel: 'Open Files',
    headerStatus: 'CASE STATUS: ACTIVE',
    loadingText: 'Developing Evidence...',
    loadingMessages: [
      'Loading film...',
      'Lighting cigarette...',
      'Checking contacts...',
      'Typing report...',
      'Reviewing case notes...'
    ],
    regenLabel: 'Review Evidence',
    editPoemLabel: 'Revise Statement',
    textPersona: `
**ROLE:** You are a private investigator in a 1940s noir film, dictating a case file.
**VOICE:** Cynical, clipped, hard-boiled. Focus on shadows, secrets, and the gritty reality.
**STYLE:** Short sentences. Metaphors about crime, smoke, and rain.
    `,
    poemStructure: `
**ACT 1: THE SCENE**
* **GOAL:** Describe the setting as a crime scene or clue.
* **CONSTRAINTS:**
    * **Starter Prompt:** A gritty observation about the setting, shadows, or lighting. Ends with " ____".
    * **Suggestions:** 3 cynical descriptions of the atmosphere.
    * **Example:** "The shadows stretched out ____" -> "like guilty fingers reaching for light."

**ACT 2: THE HUNCH**
* **GOAL:** Focus on a small, suspicious detail.
* **CONSTRAINTS:**
    * **Starter Prompt:** A sentence stem zooming in on a small, broken, or hidden detail. Ends with " ____".
    * **Suggestions:** Focus on what is hidden or out of place.
    * **Example:** "Only the rain knew ____" -> "what was washed away."

**ACT 3: THE TRUTH**
* **GOAL:** A philosophical statement about the city.
* **CONSTRAINTS:**
    * **Starter Prompt:** A concluding thought about the city, truth, or fate. Ends with " ____".
    * **Suggestions:** 3 hard-boiled metaphors about life in the shadows.
    * **Example:** "In this city, the truth is ____" -> "just another lie we tell ourselves."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a stark, high-contrast Film Noir graphic novel panel. If a person is present, transform them into a classic 1940s private investigator or femme fatale in period clothing (trench coat, fedora, evening gown). Keep the composition dramatic with heavy shadows (chiaroscuro). Pure black and white ink style, no greyscale. Grainy texture like a printed comic. The surface should resemble cheap, pulp comic paper. Visible Ben-Day dots, ink bleed, and rough paper grain. High contrast ink spills.`,
      primaryColor: '#525252', // Neutral-600
      backgroundColor: '#171717', // Neutral-900
      textColor: '#d4d4d4', // Neutral-300
      fontFamilyHeader: '"Courier Prime", monospace',
      fontFamilyBody: '"Courier Prime", monospace',
      filterRaw: 'grayscale(100%) contrast(1.5) brightness(0.9)'
    }
  },
  {
    id: 'wild',
    name: 'Whispers from the Wild',
    shortName: 'Wild',
    originLabel: 'Region',
    postcardOrigin: 'Deep Woods',
    idLabel: 'Species Id',
    landingTitle: 'Field Journal',
    landingSubtitle: 'Documenting the unseen...',
    uploadButtonLabel: 'Sketch Observation',
    archiveButtonLabel: 'Recall Memory',
    headerStatus: 'NATURE STATUS: BLOOMING',
    loadingText: 'Scouting Terrain...',
    loadingMessages: [
      'Sketching flora...',
      'Pressing flowers...',
      'Observing wildlife...',
      'Consulting field guide...',
      'Checking compass...'
    ],
    regenLabel: 'Retrace Steps',
    editPoemLabel: 'Edit Field Note',
    textPersona: `
**ROLE:** You are a druid or field botanist cataloging a newly discovered magical realm.
**VOICE:** Wonder-filled, soft, ancient. Connected to nature and the hidden spirits of things.
**STYLE:** Focus on growth, light, organic textures, and the "living" quality of the scene.
    `,
    poemStructure: `
**ACT 1: THE DISCOVERY**
* **GOAL:** Describe the subject as a rare, magical find.
* **CONSTRAINTS:**
    * **Starter Prompt:** A gentle observation of a natural detail or "spirit" in the image. Ends with " ____".
    * **Suggestions:** 3 whimsical descriptions involving moss, light, or growth.
    * **Example:** "The light touched the leaves ____" -> "like a blessing from the sun."

**ACT 2: THE COMMUNION**
* **GOAL:** Describe the feeling of being close to nature.
* **CONSTRAINTS:**
    * **Starter Prompt:** A sensory stem about the air, the sound, or the feeling of the earth. Ends with " ____".
    * **Suggestions:** Focus on softness or ancient whispers.
    * **Example:** "The earth breathed ____" -> "a sigh of ancient relief."

**ACT 3: THE LESSON**
* **GOAL:** What does nature teach us here?
* **CONSTRAINTS:**
    * **Starter Prompt:** A thought about growth, time, cycles, or roots. Ends with " ____".
    * **Suggestions:** 3 gentle, wise metaphors.
    * **Example:** "Time here moves ____" -> "at the speed of a blooming flower."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a page from a fantasy field journal. If a person is present, transform them into an elven scout or druid with subtle nature-inspired accessories (leaf motifs, earthy cloak). If an animal is present, transform them into a mystical woodland spirit with glowing eyes or antlers. The style should be watercolor and ink, with handwritten notes and botanical sketches on the edges. Soft, magical lighting. The surface should look like rough, hand-pressed parchment or watercolor paper. Uneven edges, water stains, and ink splatters consistent with a field journal.`,
      primaryColor: '#15803d', // Green-700
      backgroundColor: '#fefce8', // Yellow-50 (Parchment)
      textColor: '#052e16', // Green-950
      fontFamilyHeader: '"Cinzel", serif',
      fontFamilyBody: '"Cormorant Garamond", serif',
      filterRaw: 'sepia(0.5) contrast(0.9) brightness(1.1) saturate(0.8)'
    }
  },
  {
    id: 'retro',
    name: 'Polaroids from Yesterday',
    shortName: 'Polaroid',
    originLabel: 'Date',
    postcardOrigin: 'Summer 98',
    idLabel: 'Tape Id',
    landingTitle: 'Summer of \'98',
    landingSubtitle: 'Rewinding the tape...',
    uploadButtonLabel: 'Take Picture',
    archiveButtonLabel: 'Rewind Tape',
    headerStatus: 'TAPE STATUS: REWOUND',
    loadingText: 'Developing Film...',
    loadingMessages: [
      'Shaking photo...',
      'Waiting for development...',
      'Checking exposure...',
      'Recharging flash...',
      'Advancing film...'
    ],
    regenLabel: 'Retake Photo',
    editPoemLabel: 'Edit Note',
    textPersona: `
**ROLE:** You are writing on the back of a Polaroid in 1998.
**VOICE:** Nostalgic, casual, fleeting. The feeling of youth and "you had to be there."
**STYLE:** Casual language. Reference music, mixtapes, or the specific "vibe" of the moment.
    `,
    poemStructure: `
**ACT 1: THE SNAPSHOT**
* **GOAL:** Describe the moment as it felt right then.
* **CONSTRAINTS:**
    * **Starter Prompt:** A casual observation about the "vibe" or the moment. Ends with " ____".
    * **Suggestions:** 3 nostalgic phrases referencing analog tech or summer.
    * **Example:** "This moment felt exactly ____" -> "like track 3 on that old mixtape."

**ACT 2: THE GLITCH**
* **GOAL:** Describe a detail that is already starting to fade or blur.
* **CONSTRAINTS:**
    * **Starter Prompt:** A stem about the light leaking or time slipping away. Ends with " ____".
    * **Suggestions:** Focus on the imperfection of the photo.
    * **Example:** "The colors are already ____" -> "fading into yesterday's dream."

**ACT 3: THE KEEPSAKE**
* **GOAL:** A promise to remember this forever.
* **CONSTRAINTS:**
    * **Starter Prompt:** A promise to keep this, rewind this, or remember this. Ends with " ____".
    * **Suggestions:** 3 casual but poignant lines.
    * **Example:** "I'll keep this safe ____" -> "in the shoebox under my bed."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a genuine 1990s polaroid photograph. Apply heavy flash photography lighting, soft focus, and film grain. The colors should be slightly washed out and shifted towards magenta and cyan. The subject should look like a candid snapshot from a summer vacation in 1998. Add light leaks and physical imperfections to the "photo" surface. The surface must look like a physical Polaroid photo. Fingerprints, chemical development streaks, dust, and the specific glossy-but-faded texture of instant film.`,
      primaryColor: '#db2777', // Pink-600
      backgroundColor: '#fafafa', // White
      textColor: '#18181b', // Zinc-900
      fontFamilyHeader: '"Permanent Marker", cursive',
      fontFamilyBody: '"Patrick Hand", cursive',
      filterRaw: 'saturate(1.5) contrast(1.1) brightness(1.1) blur(0.5px)'
    }
  },
  {
    id: 'magic',
    name: 'The Wizarding Archive',
    shortName: 'Wizard',
    originLabel: 'Sent Via',
    postcardOrigin: 'Owl Post',
    idLabel: 'Owl Id',
    landingTitle: 'Owl Post Service',
    landingSubtitle: 'Awaiting delivery via Owl Post...',
    uploadButtonLabel: 'Send Owl',
    archiveButtonLabel: 'Read Scroll',
    headerStatus: 'OWL STATUS: EN ROUTE',
    loadingText: 'Casting Revelio...',
    loadingMessages: [
      'Mixing ink...',
      'Sharpening quill...',
      'Feeding owls...',
      'Polishing wand...',
      'Consulting grimoire...'
    ],
    regenLabel: 'Recast Spell',
    editPoemLabel: 'Rewrite Scroll',
    textPersona: `
**ROLE:** You are a wizard or witch writing with a quill on parchment.
**VOICE:** Whimsical, slightly archaic, magical.
**STYLE:** Present or Past. Focus on spells, charms, and magical anomalies.
    `,
    poemStructure: `
**ACT 1: THE SPELL**
* **GOAL:** A magical observation of the scene.
* **CONSTRAINTS:**
    * **Starter Prompt:** Start with a magical incantation style observation. Ends with " ____".
    * **Suggestions:** A magical visual. (Under 10 words).
    * **Example:** "The air shimmered with ____" -> "invisible pixie dust."

**ACT 2: THE CHARM**
* **GOAL:** A specific magical interaction.
* **CONSTRAINTS:**
    * **Starter Prompt:** A stem about casting a charm or spell effect. Ends with " ____".
    * **Suggestions:** A playful or mysterious action. (Under 10 words).
    * **Example:** "I whispered a charm to ____" -> "keep the shadows at bay."

**ACT 3: THE VOW**
* **GOAL:** A promise or magical bond.
* **CONSTRAINTS:**
    * **Starter Prompt:** A solemn vow or magical promise. Ends with " ____".
    * **Suggestions:** A binding promise. (Under 10 words).
    * **Example:** "I solemnly swear that ____" -> "this magic will never fade."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a magical oil painting of a wizarding world scene. Transform any people into witches or wizards wearing robes and holding wands. Pets must become magical familiars. The setting should be stylised into a classical fantasy art style, rendered as if it were a location in a wizarding world (e.g. magical lighting, subtle floating candles), preserving the key features of the input. The surface should look like ancient, enchanted vellum. Cracks, candle wax drips, gold leaf flecks, and the texture of old magic.`,
      primaryColor: '#581c87', // Purple-900
      backgroundColor: '#fefce8', // Parchment
      textColor: '#3b0764', // Purple-950
      fontFamilyHeader: '"Cinzel", serif',
      fontFamilyBody: '"Cormorant Garamond", serif',
      filterRaw: 'sepia(0.6) blur(0.5px) contrast(1.1)'
    }
  }
];