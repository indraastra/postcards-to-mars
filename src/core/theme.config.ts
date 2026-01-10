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
  captureButtonLabel: string;
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
  generatingText: string;
  finalizeLabel: string;
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
    landingSubtitle: 'Establishing connection...',
    uploadButtonLabel: 'Begin Transmission',
    captureButtonLabel: 'Consult Archive',
    headerStatus: 'LIFE SUPPORT: NOMINAL',
    generatingText: 'Transmission in Progress',
    finalizeLabel: 'Finalize Transmission',
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
* **GUIDANCE:**
    * **Focus:** An open-ended observation about the light, the air, or a specific object.
    * **Make it:** Concrete and simple. (Under 10 words).
    * **Example:** "The dust motes danced like tiny stars."

**ACT 2: THE SENSATION**
* **GOAL:** A tactile feeling or micro-interaction.
* **GUIDANCE:**
    * **Focus:** Touch, sound, or a fleeting sensation.
    * **Make it:** Visceral and immediate. (Under 10 words).
    * **Example:** "I could almost feel the static on your skin."

**ACT 3: THE CONNECTION**
* **GOAL:** A bridge to the recipient on Mars.
* **GUIDANCE:**
    * **Focus:** Bridging the distance or expressing longing.
    * **Make it:** Warm and hopeful. (Under 10 words).
    * **Example:** "Distance is just a number we haven't solved yet."
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
    captureButtonLabel: 'Travel Log',
    headerStatus: 'NEXT STOP: TOKYO',
    generatingText: 'Journey in Progress',
    finalizeLabel: 'Depart Station',
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
* **GUIDANCE:**
    * **Focus:** The sky or water.
    * **Constraint:** MUST be 5 syllables exactly.
    * **Example:** "Blue sea climbs the sky"

**ACT 2: THE COMPANION (7 Syllables)**
* **GOAL:** A shadow, spirit, or feeling of presence.
* **GUIDANCE:**
    * **Focus:** Strange but gentle company.
    * **Constraint:** MUST be 7 syllables exactly.
    * **Example:** "Shadows sit silently here"

**ACT 3: THE MEMORY (5 Syllables)**
* **GOAL:** A gentle closing thought.
* **GUIDANCE:**
    * **Focus:** Nostalgia or distance.
    * **Constraint:** MUST be 5 syllables exactly.
    * **Example:** "Summer never ends"
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
    id: 'wild',
    name: 'Whispers from the Wild',
    shortName: 'Wild',
    originLabel: 'Region',
    postcardOrigin: 'Deep Woods',
    idLabel: 'Species Id',
    landingTitle: 'Field Journal',
    landingSubtitle: 'Documenting the unseen...',
    uploadButtonLabel: 'Sketch Observation',
    captureButtonLabel: 'Recall Memory',
    headerStatus: 'NATURE STATUS: BLOOMING',
    generatingText: 'Field Notes Updating',
    finalizeLabel: 'Close Journal',
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
* **GUIDANCE:**
    * **Focus:** A gentle observation of a natural detail or "spirit".
    * **Make it:** Whimsical and ancient.
    * **Example:** "The light touched the leaves like a blessing."

**ACT 2: THE COMMUNION**
* **GOAL:** Describe the feeling of being close to nature.
* **GUIDANCE:**
    * **Focus:** The air, the sound, or the feeling of the earth.
    * **Make it:** Sensory and soft.
    * **Example:** "The earth breathed a sigh of ancient relief."

**ACT 3: THE LESSON**
* **GOAL:** What does nature teach us here?
* **GUIDANCE:**
    * **Focus:** Growth, time, cycles, or roots.
    * **Make it:** Wise and metaphorical.
    * **Example:** "Time here moves at the speed of a blooming flower."
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
    id: 'magic',
    name: 'The Wizarding Archive',
    shortName: 'Wizard',
    originLabel: 'Sent Via',
    postcardOrigin: 'Owl Post',
    idLabel: 'Owl Id',
    landingTitle: 'Owl Post Service',
    landingSubtitle: 'Awaiting delivery via Owl Post...',
    uploadButtonLabel: 'Send Owl',
    captureButtonLabel: 'Read Scroll',
    headerStatus: 'OWL STATUS: EN ROUTE',
    generatingText: 'Casting Spell',
    finalizeLabel: 'Seal Scroll',
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
* **GUIDANCE:**
    * **Focus:** A magical incantation or mystical observation.
    * **Make it:** Whimsical and wondrous.
    * **Example:** "The air shimmered with invisible pixie dust."

**ACT 2: THE CHARM**
* **GOAL:** A specific magical interaction.
* **GUIDANCE:**
    * **Focus:** Casting a charm or a spell effect.
    * **Make it:** Playful or mysterious.
    * **Example:** "I whispered a charm to keep the shadows at bay."

**ACT 3: THE VOW**
* **GOAL:** A promise or magical bond.
* **GUIDANCE:**
    * **Focus:** A solemn vow or magical promise.
    * **Make it:** Binding and ancient.
    * **Example:** "I solemnly swear that this magic will never fade."
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
  },
  {
    id: 'looking-glass',
    name: 'Through the Looking Glass',
    shortName: 'Wonderland',
    originLabel: 'Looking Glass',
    postcardOrigin: 'The Garden',
    idLabel: 'Curiosity',
    landingTitle: 'Down the Rabbit Hole',
    landingSubtitle: 'Impossible things before breakfast...',
    uploadButtonLabel: 'Drink Me',
    captureButtonLabel: 'Eat Me',
    headerStatus: 'MADNESS: ABSOLUTE',
    generatingText: 'Falling Down Rabbit Hole',
    finalizeLabel: 'Wake Up',
    loadingText: 'Consulting the Caterpillar...',
    loadingMessages: [
      'Chasing the White Rabbit...',
      'Painting the roses red...',
      'Solving a riddle...',
      'Attending a tea party...',
      'Waking up...'
    ],
    regenLabel: 'Change Specie',
    editPoemLabel: 'Rewrite Logic',
    textPersona: `
**ROLE:** You are the narrator of a Lewis Carroll story (Alice in Wonderland).
**VOICE:** Witty, absurd, paradoxical, courteous but nonsensical.
**STYLE:** Present Tense. Logic puzzles. Nursery rhyme cadence. Do not be generic. Be weird.
    `,
    poemStructure: `
**ACT 1: THE IMPOSSIBILITY**
* **GOAL:** State a visual fact that cannot be true.
* **GUIDANCE:**
    * **Focus:** An impossible action done casually.
    * **Make it:** Absurd and factual.
    * **Example:** "The cat is late for its own shadow."

**ACT 2: THE FALLACY**
* **GOAL:** Apply strict logic to a nonsensical premise.
* **GUIDANCE:**
    * **Focus:** A logical requirement for a silly object.
    * **Make it:** Paradoxical.
    * **Example:** "If it were a fish, it would carry an umbrella."

**ACT 3: THE AWAKENING**
* **GOAL:** Dismiss the reality of the scene entirely.
* **GUIDANCE:**
    * **Focus:** A playful conclusion about existence or dreams.
    * **Make it:** Witty and philosophical.
    * **Example:** "We're all mad here, except the teapots."
    `,
    visualStyle: {
      promptTemplate: `A high-contrast wood engraving in the distinct style of Sir John Tenniel's Alice in Wonderland. The image must feature "{visual_modifiers}" reimagined as a whimsical Victorian character (e.g. anthropomorphic features, period clothing, waistcoat, oversize pocket watch).

Technical specifications:
- Medium: Simulation of 19th-century woodblock print.
- Line Work: Sharp, deliberate black lines with heavy cross-hatching to define volume and shadow.
- Composition: Theatrical staging with a vignette style (fading to white edges), avoiding wall-to-wall background noise.
- Mood: Grotesque realism, surreal, and strictly monochrome (1-bit color depth).
- No text, no greyscale gradients, only pure black lines on white.`,
      primaryColor: '#d946ef', // Fuchsia-500
      backgroundColor: '#2e1065', // Violet-950
      textColor: '#e9d5ff', // Purple-200
      fontFamilyHeader: '"Cinzel", serif',
      fontFamilyBody: '"Cormorant Garamond", serif',
      filterRaw: 'grayscale(1) contrast(1.4) brightness(1.1) sepia(0.1)'
    }
  },
  {
    id: 'cyberiad',
    name: 'Parables of the Constructor',
    shortName: 'Constructor',
    originLabel: 'Algorithm',
    postcardOrigin: 'The Infinite Workshop',
    idLabel: 'Hash',
    landingTitle: 'Constructor API',
    landingSubtitle: 'Compiling infinite probabilities...',
    uploadButtonLabel: 'Execute Algorithm',
    captureButtonLabel: 'Debug Logic',
    headerStatus: 'EPSILON: RECURSIVE',
    generatingText: 'Compiling Algorithm...',
    finalizeLabel: 'Execute Function',
    loadingText: 'Initializing Recursion...',
    loadingMessages: [
      'Calculating probability gears...',
      'Greasing the axioms...',
      'Consulting the Blueprint...',
      'Expanding the finite tape...',
      'Optimizing happiness algorithms...'
    ],
    regenLabel: 'Recompile',
    editPoemLabel: 'Refactor Code',
    textPersona: `
**ROLE:** You are a Grand Constructor of infinite machines in a fable about technology.
**VOICE:** Loquacious, technical-fabulous, arachic-scientific, witty, satirical, confident but prone to hubris.
**STYLE:** Use mock-heroic language. Combine high philosophy with mechanical grit. Use words like "automaton", "algorithm", "cybernetic", "infinite", "probability", "dragons of probability".
    `,
    poemStructure: `
**ACT 1: THE GRAND DESIGN**
* **GOAL:** Define the subject with overwhelming technical pomposity.
* **GUIDANCE:**
    * **Focus:** Define the object as if it were a complex machine or variable.
    * **Make it:** Grandiose, overly specific, slightly absurd.
    * **Example:** "The sun was merely a fusion reactor running on legacy code."

**ACT 2: THE GLITCH IN LOGIC**
* **GOAL:** Reveal the irony or the flaw in the universe's programming.
* **GUIDANCE:**
    * **Focus:** The absurdity of existence, rust, or a calculation error.
    * **Make it:** Wry, humorous, cynical.
    * **Example:** "But alas, the entropy coefficient was set to 'maximum'."

**ACT 3: THE CONSTRUCTOR'S FIX**
* **GOAL:** A solution that is technically brilliant but practically silly.
* **GUIDANCE:**
    * **Focus:** A "patch", a new machine, or a philosophical workaround.
    * **Make it:** Triumphant techno-babble.
    * **Example:** "Therefore I deduced: if one cannot fix the sky, one must patch the eye."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a complex lithograph in the style of M.C. Escher. The scene should be monochrome (slate grey/black/white) and feature impossible geometry, infinite staircases, and tessellated patterns. If a person is present, transform them into a stylized geometric figure or an automaton. The texture should look like a woodcut or stone lithograph. High detail, mathematical precision, surreal architecture.`,
      primaryColor: '#22d3ee', // Cyan-400 (Electric, Cybernetic)
      backgroundColor: '#020617', // Slate-950 (Deep Dark)
      textColor: '#f1f5f9', // Slate-100 (Crisp Light Text)
      fontFamilyHeader: '"Space Mono", monospace',
      fontFamilyBody: '"Roboto Slab", serif',
      filterRaw: 'grayscale(1) contrast(1.1) brightness(1.05)'
    }
  }
];