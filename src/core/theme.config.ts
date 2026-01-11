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
  usePoemForImageGeneration?: boolean;
}

export const RAW_THEMES: ThemeConfig[] = [
  {
    id: 'mars',
    name: 'Postcards to Mars',
    shortName: 'Mars',
    originLabel: 'Origin',
    postcardOrigin: 'Earth (Lost)',
    idLabel: 'Archive Id',
    landingTitle: 'Colony 7 Uplink',
    landingSubtitle: 'Establishing connection',
    uploadButtonLabel: 'Begin Transmission',
    captureButtonLabel: 'Consult Archive',
    headerStatus: 'LIFE SUPPORT: NOMINAL',
    generatingText: 'Transmission in Progress',
    finalizeLabel: 'Finalize Transmission',
    loadingText: 'Processing Signal',
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
    id: 'cyberiad',
    name: 'Parables of the Constructor',
    shortName: 'Constructor',
    originLabel: 'Algorithm',
    postcardOrigin: 'The Infinite Workshop',
    idLabel: 'Hash',
    landingTitle: 'Constructor API',
    landingSubtitle: 'Compiling infinite probabilities',
    uploadButtonLabel: 'Execute Algorithm',
    captureButtonLabel: 'Debug Logic',
    headerStatus: 'EPSILON: RECURSIVE',
    generatingText: 'Compiling Algorithm',
    finalizeLabel: 'Execute Function',
    loadingText: 'Initializing Recursion',
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
  },
  {
    id: 'tokyo',
    name: 'Trains to Tokyo',
    shortName: 'Tokyo',
    originLabel: 'Carriage',
    postcardOrigin: 'No. 6',
    idLabel: 'Ticket',
    landingTitle: 'One-Way Ticket',
    landingSubtitle: 'The sea tracks stretch forever',
    uploadButtonLabel: 'Board Train',
    captureButtonLabel: 'Travel Log',
    headerStatus: 'NEXT STOP: TOKYO',
    generatingText: 'Journey in Progress',
    finalizeLabel: 'Depart Station',
    loadingText: 'Steam rising',
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
      fontFamilyHeader: '"Quicksand", sans-serif',
      fontFamilyBody: '"Cormorant Garamond", serif',
      filterRaw: 'saturate(1.2) contrast(1.05) brightness(1.05)'
    }
  },
  {
    id: 'neon',
    name: 'Neon of the Night',
    shortName: 'Neon',
    originLabel: 'Sector',
    postcardOrigin: 'Night City',
    idLabel: 'Data Packet',
    landingTitle: 'Grid Uplink',
    landingSubtitle: 'The city never sleeps',
    uploadButtonLabel: 'Jack In',
    captureButtonLabel: 'Scan Net',
    headerStatus: 'CONNECTION: SECURE',
    generatingText: 'Uploading to Grid',
    finalizeLabel: 'Send Packet',
    loadingText: 'Handshaking',
    loadingMessages: [
      'Bypassing firewalls...',
      'Synthesizing neon...',
      'Rendering chrome...',
      'Route encrypted...',
      'Establishing neural link...'
    ],
    regenLabel: 'Re-Glitch',
    editPoemLabel: 'Hack Data',
    textPersona: `
**ROLE:** You are a courier in a cyberpunk megacity (like Blade Runner or Neuromancer).
**VOICE:** Cool, detached, street-smart. Slang-heavy (tech-noir).
**STYLE:** Focus on lights, rain, chrome, data, and the high-tech/low-life contrast.
    `,
    poemStructure: `
**ACT 1: THE SIGNAL**
* **GOAL:** Describe the subject as it appears in the neon light.
* **GUIDANCE:**
    * **Focus:** Color, reflection, or digital noise.
    * **Make it:** Vivid and electric.
    * **Example:** "Chrome reflects the neon rain like liquid television."

**ACT 2: THE GLITCH**
* **GOAL:** A moment of interference or human reality breaking through.
* **GUIDANCE:**
    * **Focus:** A heartbeat, a flaw, or a feeling of isolation.
    * **Make it:** Noir and lonely.
    * **Example:** "Even in high-def, loneliness looks the same."

**ACT 3: THE UPLOAD**
* **GOAL:** Sending this memory away into the cloud.
* **GUIDANCE:**
    * **Focus:** Data, memory, or fading away.
    * **Make it:** Fleeting.
    * **Example:** "Lost like tears in the digital rain."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a 1980s Retrowave / Synthwave aesthetic artwork. Major themes: Cyberpunk, Outrun, Neon, Chrome. The lighting should be dramatic with heavy use of magenta, cyan, and violet. Add a glowing wireframe grid on the floor or background. If a person is present, give them cool sunglasses or a leather jacket with glowing accents. The texture should look like an airbrushed VHS cover or a sleek digital illustration. High contrast, glowing edges, CRT scanlines effect.`,
      primaryColor: '#e879f9', // Fuchsia-400 (Neon Pink)
      backgroundColor: '#2a0a3b', // Deep Purple Background
      textColor: '#22d3ee', // Cyan-400 (Neon Blue)
      fontFamilyHeader: '"Orbitron", sans-serif',
      fontFamilyBody: '"Roboto Mono", monospace',
      filterRaw: 'saturate(1.5) contrast(1.2)'
    }
  },
  {
    id: 'garden',
    name: 'The Painted Garden',
    shortName: 'Garden',
    originLabel: 'Easel',
    postcardOrigin: 'Giverny',
    idLabel: 'Study No.',
    landingTitle: 'En Plein Air',
    landingSubtitle: 'Capturing the fleeting moment',
    uploadButtonLabel: 'Set Easel',
    captureButtonLabel: 'Capture Light',
    headerStatus: 'LIGHT: GOLDEN HOUR',
    generatingText: 'Mixing Pigments',
    finalizeLabel: 'Sign Canvas',
    loadingText: 'Chasing the light',
    loadingMessages: [
      'Mixing cerulean blue...',
      'Dabbing sunlight touches...',
      'Softening the edges...',
      'Observing the shadows...',
      'Waiting for the clouds...'
    ],
    regenLabel: 'Scrape Canvas',
    editPoemLabel: 'Rewrite Verse',
    textPersona: `
**ROLE:** You are a Romantic poet (like Keats) or an Impressionist painter writing a letter from a blooming garden.
**VOICE:** Lyrical, sensory, emotional, vivid. Obsessed with light, color, and the fleeting nature of beauty.
**STYLE:** Use words like "dappled", "gossamer", "verdant", "fleeting". Focus on the *impression* of the scene, not just the facts.
    `,
    poemStructure: `
**ACT 1: THE PALETTE**
* **GOAL:** Describe the colors and light of the scene.
* **GUIDANCE:**
    * **Focus:** How light hits the subject. "Dappled", "Awash", "Gilded".
    * **Make it:** Vibrant and painterly.
    * **Example:** "The light spills like liquid gold across the path."

**ACT 2: THE BREATH**
* **GOAL:** The sensory feeling of the moment.
* **GUIDANCE:**
    * **Focus:** Scent, warmth, or the breeze.
    * **Make it:** Intimate and breathing.
    * **Example:** "The air holds the sweet, heavy breath of noon."

**ACT 3: THE IMMORTALITY**
* **GOAL:** Freeze this fleeting moment forever.
* **GUIDANCE:**
    * **Focus:** Preservation, memory, or art.
    * **Make it:** Poetic and profound.
    * **Example:** "Let us keep this silence before it fades."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a vibrant Impressionist watercolor painting.
1. STYLE: Loose, expressive brushstrokes and 'wet-on-wet' technique. Style of Claude Monet or John Singer Sargent.
2. LIGHTING: Dappled sunlight (chiaroscuro), soft edges, and glowing highlights.
3. COLORS: A rich, vibrant palette. Cerulean blues, Viridian greens, Rose madders, Napthol yellows. No black shadows—use deep purple or indigo instead.
4. VIBE: Romantic, idyllic, airy, fleeting.
5. DETAILS: The subject should feel like it is dissolving slightly into the light and atmosphere.`,
      primaryColor: '#db2777', // Pink-600 (Rose)
      backgroundColor: '#fff1f2', // Rose-50
      textColor: '#881337', // Rose-900
      fontFamilyHeader: '"Playfair Display", serif',
      fontFamilyBody: '"Lora", serif',
      filterRaw: 'saturate(1.3) brightness(1.1) contrast(1.1)'
    },
    usePoemForImageGeneration: true
  },
  {
    id: 'inverse',
    name: 'Echoes from the Inverse',
    shortName: 'Inverse',
    originLabel: 'Zone',
    postcardOrigin: 'The Funhouse',
    idLabel: 'Warp No.',
    landingTitle: 'Welcome to the Wackiness',
    landingSubtitle: 'Gravity is just a suggestion!',
    uploadButtonLabel: 'Unzip Gravity',
    captureButtonLabel: 'Snag a Glitch',
    headerStatus: 'LOGIC: RUBBERIZED',
    generatingText: 'Inflating Reality',
    finalizeLabel: 'Boing!',
    loadingText: 'Making it weird',
    loadingMessages: [
      'Tickling the atoms...',
      'Painting the sky plaid...',
      'Teaching fish to walk...',
      'Melting the clocks...',
      'Bouncing off the walls...'
    ],
    regenLabel: 'Re-Bounce',
    editPoemLabel: 'Twist Truth',
    textPersona: `
**ROLE:** You are a manic, sugar-rushed cartoon narrator in a Bizarro World where logic is inverted and silly.
**VOICE:** High-energy, whimsical, absurd. Think Alice in Wonderland meets Saturday Morning Cartoons.
**STYLE:** Use playground logic. "It's floating because it forgot to fall!" "The wall is made of grape jelly!"
    `,
    poemStructure: `
**ACT 1: THE SILLY INVERSION**
* **GOAL:** Describe the subject but flip a key property whimsically.
* **GUIDANCE:**
    * **Focus:** Hard is soft, heavy is light, serious is goofy.
    * **Make it:** Playful and confusing.
    * **Example:** "The mountain tried to fly but its shoes were too loose."

**ACT 2: THE PLAYGROUND LOGIC**
* **GOAL:** Explain *why* it is doing that with nonsense logic.
* **GUIDANCE:**
    * **Focus:** Anthropomorphism or cartoon physics.
    * **Make it:** Funny.
    * **Example:** "It's hiding from the Tuesday afternoon nap."

**ACT 3: THE PUNCHLINE**
* **GOAL:** A joyful, chaotic conclusion.
* **GUIDANCE:**
    * **Focus:** Energy, bouncing, or color.
    * **Make it:** A celebration of weirdness.
    * **Example:** "And that is why the sky tastes like blueberry fizz!"
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a whimsical, madcap "Bizarro World" interpretation.
1. SUBJECT INVERSION: Reinterpret these elements using "Playground Logic". If serious, make it chaotic and goofy (Wario/Looney Tunes energy). If an object, invert its physics (square clouds, melting clocks, rubber machines).
2. STYLE: High-energy cartoon illustration with exaggerated, squash-and-stretch proportions (rubber-hose or absurdist comic).
3. COLORS: A hyper-saturated "candy-color" explosion. Bright magentas, electric blues, lime greens, sunny yellows. No dark shadows.
4. VIBE: Joyfully chaotic, frenetic, topsy-turvy perspective. Floating objects, bouncing items.`,
      primaryColor: '#a3e635', // Lime-400 (Toxic Green)
      backgroundColor: '#312e81', // Indigo-900 (Deep Blue/Purple mix)
      textColor: '#ecfccb', // Lime-100
      fontFamilyHeader: '"Carter One", display', // Playful display
      fontFamilyBody: '"Comic Neue", cursive', // Readable comic style
      filterRaw: 'saturate(1.8) hue-rotate(-20deg) contrast(1.1)'
    },
    usePoemForImageGeneration: true
  },
  {
    id: 'paper',
    name: 'Papercut Dreams',
    shortName: 'Paper',
    originLabel: 'Layer',
    postcardOrigin: 'The Shoebox',
    idLabel: 'Cut No.',
    landingTitle: 'The Paper Theater',
    landingSubtitle: 'A world of layers',
    uploadButtonLabel: 'Open Box',
    captureButtonLabel: 'Freeze Scene',
    headerStatus: 'DEPTH: CALCULATED',
    generatingText: 'Cutting Paper',
    finalizeLabel: 'Paste Layer',
    loadingText: 'Assembling Diorama',
    loadingMessages: [
      'Sharpening scissors...',
      'Selecting cardstock...',
      'Applying glue...',
      'Stacking layers...',
      'Adjusting depth...'
    ],
    regenLabel: 'Recut Scene',
    editPoemLabel: 'Fold Paper',
    textPersona: `
**ROLE:** You are a cozy hobbyist creating a tiny diorama at your crafting desk.
**VOICE:** Gentle, instructional, cute, tactile. Focus on "snipping", "gluing", "hanging", and "shapes".
**STYLE:** Write instructions for building the scene out of paper. Keep it small and precious.
    `,
    poemStructure: `
**ACT 1: THE SNIP**
* **GOAL:** Cut out the main subject from paper.
* **GUIDANCE:**
    * **Focus:** Scissors, shapes, or the outline.
    * **Make it:** Precise and cute.
    * **Example:** "With your smallest scissors, snip a shape like a cloud."

**ACT 2: THE GLUE**
* **GOAL:** Place the subject into the scene.
* **GUIDANCE:**
    * **Focus:** Glue, paste, layers, or hiding things behind others.
    * **Make it:** Constructive.
    * **Example:** "Use a dab of glue to paste it behind the moon."

**ACT 3: THE HANGING**
* **GOAL:** Add a final decorative detail.
* **GUIDANCE:**
    * **Focus:** Hanging, dangling, charms, or strings.
    * **Make it:** A finishing touch.
    * **Example:** "Finally, hang a tiny paper charm of a star."
    `,
    visualStyle: {
      promptTemplate: `Create a whimsical "Papercut Shadowbox" illustration in a soft, pastel palette.
1. SUBJECT & MEDIUM: Assemble the scene "{visual_modifiers}" using layers of textured colored paper. The aesthetic should be "Cozy Arts & Crafts"—clean cuts, playful shapes, and a handmade feel. Avoid sharp, jagged menace. Use rounded edges.
2. COMPOSITION (The Diorama): Frame the image like a small theater stage or a shoebox diorama. Use "Multi-plane Camera" depth: A blurry foreground frame, a sharp mid-ground subject, and a distant background layer. Create separation between layers using drop shadows (simulating foam spacers).
3. LIGHTING & COLOR: Lighting: Soft, diffused backlighting that makes the paper glow warmly (like a nightlight). Colors: Mint greens, baby blues, pale pinks, cream, and lavender. High key (bright), not dark.`,
      primaryColor: '#2dd4bf', // Teal-400
      backgroundColor: '#f0fdfa', // Teal-50
      textColor: '#134e4a', // Teal-900
      fontFamilyHeader: '"Quicksand", sans-serif',
      fontFamilyBody: '"Cormorant Garamond", serif',
      filterRaw: 'contrast(1.1) brightness(1.05)',
    },
    usePoemForImageGeneration: true
  },
  {
    id: 'looking-glass',
    name: 'Through the Looking Glass',
    shortName: 'Wonderland',
    originLabel: 'Looking Glass',
    postcardOrigin: 'The Garden',
    idLabel: 'Curiosity',
    landingTitle: 'Down the Rabbit Hole',
    landingSubtitle: 'Impossible things before breakfast',
    uploadButtonLabel: 'Drink Me',
    captureButtonLabel: 'Eat Me',
    headerStatus: 'MADNESS: ABSOLUTE',
    generatingText: 'Falling Down Rabbit Hole',
    finalizeLabel: 'Wake Up',
    loadingText: 'Consulting the Caterpillar',
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
      primaryColor: '#e11d48', // Rose-600 (Queen of Hearts Red)
      backgroundColor: '#171717', // Neutral-900 (Dark)
      textColor: '#f5f5f5', // Neutral-100
      fontFamilyHeader: '"Cinzel", serif',
      fontFamilyBody: '"Cormorant Garamond", serif',
      filterRaw: 'grayscale(1) contrast(1.4) brightness(1.1) sepia(0.1)'
    },
    usePoemForImageGeneration: true
  },
  {
    id: 'magic',
    name: 'The Wizarding Archive',
    shortName: 'Wizard',
    originLabel: 'Sent Via',
    postcardOrigin: 'Owl Post',
    idLabel: 'Owl Id',
    landingTitle: 'Owl Post Service',
    landingSubtitle: 'Awaiting delivery via Owl Post',
    uploadButtonLabel: 'Send Owl',
    captureButtonLabel: 'Read Scroll',
    headerStatus: 'OWL STATUS: EN ROUTE',
    generatingText: 'Casting Spell',
    finalizeLabel: 'Seal Scroll',
    loadingText: 'Casting Revelio',
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
    id: 'stars',
    name: 'The Golden Record',
    shortName: 'Record',
    originLabel: 'Artifact',
    postcardOrigin: 'Voyager 1',
    idLabel: 'Disc Track',
    landingTitle: 'Interstellar Message',
    landingSubtitle: 'Hello from the children of planet Earth...',
    uploadButtonLabel: 'Etch to Gold',
    captureButtonLabel: 'Record Sample',
    headerStatus: 'VELOCITY: ESCAPE',
    generatingText: 'Engraving Disc',
    finalizeLabel: 'Launch Probe',
    loadingText: 'Encoding binary',
    loadingMessages: [
      'Translating to hydrogen frequency...',
      'Encoding greetings in 55 languages...',
      'Calibrating the stylus...',
      'Etching the sound of rain...',
      'Pointing antenna to deep space...'
    ],
    regenLabel: 'Re-Record',
    editPoemLabel: 'Edit Data',
    textPersona: `
**ROLE:** You are a scientist (like Carl Sagan) curating the Voyager Golden Record.
**VOICE:** Objective, universal, profound, scientific yet deeply human.
**STYLE:** Describe human experiences as "data", "frequencies", or "samples" for an alien audience.
    `,
    poemStructure: `
**ACT 1: THE SAMPLE**
* **GOAL:** Define the subject as a data point for aliens.
* **GUIDANCE:**
    * **Focus:** "Specimen", "Audio Sample", "Visual Data".
    * **Make it:** Clinical but beautiful.
    * **Example:** "Sample 42: The frequency of a human heartbeat."

**ACT 2: THE TRANSLATION**
* **GOAL:** Explain the hidden emotion behind the data.
* **GUIDANCE:**
    * **Focus:** What the data *means* to a human.
    * **Make it:** A universal truth.
    * **Example:** "It signifies the persistence of hope against entropy."

**ACT 3: THE TRANSMISSION**
* **GOAL:** Sending it into the void.
* **GUIDANCE:**
    * **Focus:** Distance, preservation, or the future.
    * **Make it:** A message in a bottle.
    * **Example:** "Play this when our sun has gone quiet."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a gold-etched diagram in the style of the NASA Voyager Golden Record cover.
1. STYLE: Minimalist scientific line art engraved into a gold metal surface.
2. DETAILS: Convert the subject into a schematic wireframe or pulsar map style. Surround the subject with binary code rings, hydrogen hyperfine transition symbols, and radial instruction lines.
3. COLOR: Monochrome Gold (#fbbf24) on a Deep Space Black (#000000) background.
4. TEXTURE: Brushed metal, etched grooves, vector precision.
5. VIBE: Scientific, lonely, profound, interstellar.`,
      primaryColor: '#fbbf24', // Amber-400 (Gold)
      backgroundColor: '#020617', // Slate-950 (Space Black)
      textColor: '#fef3c7', // Amber-100
      fontFamilyHeader: '"Orbitron", sans-serif', // Sci-Fi Technical
      fontFamilyBody: '"Space Mono", monospace', // Data Code
      filterRaw: 'grayscale(1) sepia(1) hue-rotate(5deg) contrast(1.3)'
    },
    usePoemForImageGeneration: true
  },
  {
    id: 'medieval',
    name: 'From Medieval Margins',
    shortName: 'Medieval',
    originLabel: 'Folio',
    postcardOrigin: 'The Monastery',
    idLabel: 'Verse',
    landingTitle: 'The Scriptorium',
    landingSubtitle: 'Beware the snails',
    uploadButtonLabel: 'Open Tome',
    captureButtonLabel: 'Illuminate',
    headerStatus: 'INK: DRYING',
    generatingText: 'Scribing...',
    finalizeLabel: 'Seal Wax',
    loadingText: 'Sharpening Quill',
    loadingMessages: [
      'Chasing rabbits...',
      'Mixing gold leaf...',
      'Complaining about back pain...',
      'Drawing distinct feet...',
      'Fighting a snail...'
    ],
    regenLabel: 'Scrap Vellum',
    editPoemLabel: 'Correct Latin',
    textPersona: `
**ROLE:** You are a bored 14th-century monk doodling in the margins of a sacred text.
**VOICE:** Tired, cynical, historically specific but absurd.
**STYLE:** Complain about your work. Reference "Killer Rabbits", "Fighting Snails", "Flat Earth". Physics do not apply.
    `,
    poemStructure: `
**ACT 1: THE DOODLE**
* **GOAL:** Describe the subject as a weird drawing.
* **GUIDANCE:**
    * **Focus:** Strange anatomy, stiff poses, or lack of perspective.
    * **Make it:** Absurd.
    * **Example:** "I drew a man, but his feet are backwards."

**ACT 2: THE MARGIN**
* **GOAL:** Add a classic marginalia element (snail/rabbit).
* **GUIDANCE:**
    * **Focus:** e.g. A snail knight, a rabbit with an axe, or a trumpet in a butt, etc.
    * **Make it:** Historically accurate weirdness.
    * **Example:** "A snail is attacking him with a lance."

**ACT 3: THE COMPLAINT**
* **GOAL:** A complaint about the work or the abbot.
* **GUIDANCE:**
    * **Focus:** Cold ink, candle wax, or tiredness.
    * **Make it:** Relatable but old.
    * **Example:** "The Abbot will not be pleased with this nonsense."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a bizarre 14th-century illuminated manuscript marginalia doodle.
1. PERSPECTIVE: ZERO depth. Everything is completely flat and stacked vertically. No foreshortening.
2. STYLE: Stiff, awkward poses typical of medieval art. Weird proportions.
3. ELEMENTS: Add gold leaf accents. If animals are present, make them "human-like" or violent (e.g., rabbits with swords).
4. BACKGROUND: Aged parchment texture with latin text fragments or floral borders.
5. VIBE: Absurdist, unintentional humor, historical.`,
      primaryColor: '#d97706', // Amber-600
      backgroundColor: '#fffbeb', // Amber-50 (Parchment)
      textColor: '#451a03', // Amber-950
      fontFamilyHeader: '"Cinzel", serif',
      fontFamilyBody: '"Cormorant Garamond", serif',
      filterRaw: 'sepia(0.8) contrast(1.1)',
    },
    usePoemForImageGeneration: true
  },
  {
    id: 'codex',
    name: 'Sketches from the Codex',
    shortName: 'Codex',
    originLabel: 'Volume',
    postcardOrigin: 'The Laboratory',
    idLabel: 'Page No.',
    landingTitle: 'The Alchemist\'s Table',
    landingSubtitle: 'Transmuting lead into gold',
    uploadButtonLabel: 'Analyze Matter',
    captureButtonLabel: 'Study Form',
    headerStatus: 'TRANSMUTATION: ACTIVE',
    generatingText: 'Distilling Essence',
    finalizeLabel: 'Inscribe Page',
    loadingText: 'Consulting the Tablets',
    loadingMessages: [
      'Mixing reagents...',
      'Drawing geometric proofs...',
      'Aligning the celestial spheres...',
      'Deciphering ancient runes...',
      'Heating the crucible...'
    ],
    regenLabel: 'Redraw Diagram',
    editPoemLabel: 'Refine Theory',
    textPersona: `
**ROLE:** You are Leonardo da Vinci or an ancient alchemist documenting a new discovery in a secret codex.
**VOICE:** Academic, obsessive, visionary. Focused on anatomy, geometry, and the "divine proportion" of things.
**STYLE:** Use terms like "ratio", "divine", "essence", "mechanism". Write as if observing the hidden machinery of nature.
    `,
    poemStructure: `
**ACT 1: THE ANATOMY**
* **GOAL:** Describe the physical structure or geometry of the subject.
* **GUIDANCE:**
    * **Focus:** Angles, curves, lines, or mechanics.
    * **Make it:** Analytical but beautiful.
    * **Example:** "The curve of the wing follows the golden spiral."

**ACT 2: THE ESSENCE**
* **GOAL:** Hypothesize the hidden purpose or soul of the object.
* **GUIDANCE:**
    * **Focus:** What is it *for*? What makes it alive?
    * **Make it:** Visionary.
    * **Example:** "It holds the breath of the wind itself."

**ACT 3: THE TRANSMUTATION**
* **GOAL:** A concluding thought on transforming this knowledge.
* **GUIDANCE:**
    * **Focus:** Preservation, invention, or enlightenment.
    * **Make it:** Profound.
    * **Example:** "Thus we prove that flight is merely a matter of will."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a vintage Leonardo da Vinci style sketch on old parchment. The image should look like a study from a codex, with ink contour lines, cross-hatching to define volume, and handwritten mirror-writing marginalia. The color palette should be strictly sepia, brown ink, and yellowed paper. If a person is present, show them with Vitruvian proportions or anatomical overlay lines circles and geometry. The texture should be rough, aged paper with ink stains and fading. High detail, ink and quill style.`,
      primaryColor: '#d97706', // Amber-600
      backgroundColor: '#fef3c7', // Amber-100 (Parchment)
      textColor: '#451a03', // Amber-950 (Ink)
      fontFamilyHeader: '"Cinzel", serif',
      fontFamilyBody: '"Courier Prime", monospace', // Typewriter/Notes style
      filterRaw: 'sepia(0.8) contrast(1.1) brightness(1.05)'
    }
  },
  {
    id: 'chalk',
    name: 'The Unsolved Equation',
    shortName: 'Equation',
    originLabel: 'Theorem',
    postcardOrigin: 'The Classroom',
    idLabel: 'Proof',
    landingTitle: 'The Blackboard',
    landingSubtitle: 'Solving for X',
    uploadButtonLabel: 'Prove Theorem',
    captureButtonLabel: 'Erase Board',
    headerStatus: 'Q.E.D.',
    generatingText: 'Calculating',
    finalizeLabel: 'Publish Proof',
    loadingText: 'Deriving formula',
    loadingMessages: [
      'Chalk dust filling the air...',
      'Checking the axiom...',
      'Finding the limit...',
      'Erasing the mistake...',
      'Dividing by zero...'
    ],
    regenLabel: 'Recompute',
    editPoemLabel: 'Refine Logic',
    textPersona: `
**ROLE:** You are a brilliant but obsessed mathematician trying to solve the equation of a memory.
**VOICE:** Analytical, desperate, beautiful. Mixing math with longing.
**STYLE:** Use concepts like "limits", "variables", "constants", "infinity", "coordinates".
    `,
    poemStructure: `
**ACT 1: THE VARIABLE**
* **GOAL:** Define the subject as a variable in an equation.
* **GUIDANCE:**
    * **Focus:** X, Y, or an unknown quantity.
    * **Make it:** Analytical.
    * **Example:** "Let X be the moment you looked away."

**ACT 2: THE CALCULATION**
* **GOAL:** Attempt to solve or measure the feeling.
* **GUIDANCE:**
    * **Focus:** Geometry, addition, subtraction, or calculus.
    * **Make it:** Precise but futile.
    * **Example:** "I integrated the silence over infinite time."

**ACT 3: THE PROOF**
* **GOAL:** The final result of the equation.
* **GUIDANCE:**
    * **Focus:** A solution, a constant, or an impossibility.
    * **Make it:** Absolute.
    * **Example:** "The remainder is always zero."
    `,
    visualStyle: {
      promptTemplate: `Transform this image of {visual_modifiers} into a colorful academic chalkboard diagram.
1. STYLE: The entire scene must be rendered as a vintage classroom diagram drawn on a dusty blackboard. The subject should be depicted as a technical or biological sketch with cross-sections, angular breakdown lines, or geometric analysis.
2. COLORS: Use a classic "Teacher's Chalk" palette: Dusty White, Pale Yellow, Mint Green, and Soft Pink against a dark slate background.
3. DETAILS: Add dotted guidelines, force vectors, labeled dimensions (A, B, θ), and explanatory notes in cursive chalk.
4. TEXTURE: Heavy slate texture, eraser smudges, and chalk dust.
5. VIBE: Educational, analytical, vintage schoolhouse.`,
      primaryColor: '#fde047', // Yellow-300 (Chalk Yellow)
      backgroundColor: '#1c1917', // Stone-900 (Blackboard)
      textColor: '#e7e5e4', // Stone-200
      fontFamilyHeader: '"Space Mono", monospace',
      fontFamilyBody: '"Roboto Slab", serif',
      filterRaw: 'contrast(1.1) saturate(1.1)'
    },
    usePoemForImageGeneration: false
  }
];

// --- Sorting Logic ---

function getLuminance(hex: string): number {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  return Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );
}

function sortThemes(themes: ThemeConfig[]): ThemeConfig[] {
  const mars = themes.find(t => t.id === 'mars');
  const others = themes.filter(t => t.id !== 'mars');

  if (!mars) return themes; // Safety check

  // Threshold for "Dark" background (approx < 130 is dark)
  const isDark = (t: ThemeConfig) => getLuminance(t.visualStyle.backgroundColor) < 128;

  const darks = others.filter(isDark);
  const lights = others.filter(t => !isDark(t));

  const sorted: ThemeConfig[] = [mars];

  // Mars is Light (usually), so next should be Dark.
  // We want to alternate: L (Mars) -> D -> L -> D...

  const maxLength = Math.max(darks.length, lights.length);

  for (let i = 0; i < maxLength; i++) {
    if (darks[i]) sorted.push(darks[i]);
    if (lights[i]) sorted.push(lights[i]);
  }

  return sorted;
}

export const THEMES = sortThemes(RAW_THEMES);