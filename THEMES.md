# Theme Style Guide: Postcards to Mars

> [!NOTE]
> This guide outlines the philosophy and technical specifications for creating themes. It is designed to ensure consistency while maximizing the creative potential of the Gemini API.

## 1. Philosophy of "The Gap"

The core aesthetic of *Postcards to Mars* is **Friction**. A theme should never just "describe the image." It should create a gap between what is seen (Visual) and what is said (Text).

*   **The visual is the dream.** It transforms the user's reality into a stylized, impossible world.
*   **The text is the anchor.** It applies a rigid, specific logic to that dream (a manual, a legal document, a scientific log, a lost diary).
*   **The magic happens in between.** When a dreamlike watercolor is described as a "fading memory," or a whimsical papercut is described as a "construction project," the user feels a sense of narrative discovery.

### Guiding Principles
1.  **Balance of Tone**: We strive for a 50/50 split between "Dark/Melancholic" (e.g., Mars, Amnesiac) and "Light/Whimsical" (e.g., Wonderland, Inverse).
2.  **Visual Distinctiveness**: Each theme must have a unique color palette and medium (e.g., Oil, Watercolor, Line Art, Vector). No two themes should look similar at a glance.
3.  **Non-Prescriptive Creativity**: Stems and prompts are *launchpads*, not cages. They provide structure (Act 1, 2, 3) but leave the content entirely to Gemini's interpretation of the user's image.

---

## 2. Visual Prompting Guide (Gemini API)

Our image generation leverages Gemini's ability to simulate physical media. Prompts should follow this structure based on [Google Vertex AI guidelines](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/gemini-3-prompting-guide).

### Structure
```javascript
promptTemplate: `
[Medium/Art Style Declaration]
1. SUBJECT: [How to transform the user's input]
2. TECHNIQUE: [Specific art techniques, e.g., "wet-on-wet", "impasto", "cross-hatch"]
3. LIGHTING & COLOR: [Palette constraints and light source]
4. VIBE: [Emotional keywords]
`
```

### Best Practices
*   **Physicality**: Don't just ask for "watercolor style." Ask for "rough paper grain," "bleeding edges," "granulating pigment."
*   **Depth**: Enforce depth cues like "drop shadows" (for papercut) or "atmospheric perspective" (for landscapes).
*   **Semantic Negative Prompts**: Instead of saying "no cars" or "no text," describe the desired state positively.
    *   *Bad:* "No people."
    *   *Good:* "A deserted, empty landscape devoid of human presence."

---

## 3. Narrative Writing Guide

We use a **3-Act Micro-Narrative** structure for every poem. The goal is to move from observation to emotion/conclusion in three short lines.

### The 3 Stems
This structure is a guide for the *kind* of thought required, not a rigid template.

*   **Line 1: The Anchor (Observation)**
    *   *Goal:* Ground the poem in a specific visual detail from the image.
    *   *Tone:* Objective, descriptive, or technical.
*   **Line 2: The Twist (Complication)**
    *   *Goal:* Introduce a conflict, a feeling, or a "glitch" in the logic.
    *   *Tone:* Subjective, emotional, or paradoxical.
*   **Line 3: The Echo (Resolution)**
    *   *Goal:* Leave a lingering thought or a bridge to the recipient ("Mars").
    *   *Tone:* Final, resonant, or witty.

---

## 4. Theme Examples

Below are validated examples incorporating expert feedback.

### Example A: The Amnesiac’s Journal (Watercolor)
*Philosophy: Bleeding visual edges mirror fading memory.*

**Visual Logic:**
"Wet-on-wet" technique handles the "Happy Accidents" of memory—blending facts with emotions. Faces should be indeterminate.

**Prompt Template:**
```text
Create a soft, dreamlike watercolor painting using a "wet-on-wet" technique.
1. SUBJECT: Paint a fleeting memory of "{visual_modifiers}". The subject should not have hard outlines; let the edges bleed into the paper.
2. TECHNIQUE: Use broad, translucent washes of color. Leave areas of raw white paper to represent blinding light.
3. MOOD: Nostalgic, melancholic. Colors: Diluted indigo, washed-out sepia, and rose.
```

**Writing Structure:**
*   **Stem 1 (The Spark):** "I vividly remember the..."
    *   *Why:* establishes confidence in the memory.
*   **Stem 2 (The Blur):** "But the rain washed it into a..."
    *   *Why:* introduces the loss/degradation of the data.
*   **Stem 3 (The Residue):** "Now it only tastes like..."
    *   *Why:* Synesthesia—shifting from sight (unreliable) to taste/feeling (visceral).

### Example B: Papercut Dreams (Shadowbox)
*Philosophy: Transforming surreal concepts into a cozy, handmade arts & crafts project.*

**Visual Logic:**
Instead of a god-like figure folding reality, the narrator is a hobbyist sitting at a desk with scissors, glue, and glitter. The text focuses on the joy of making something small, cute, and tactile.

**Prompt Template:**
```text
Create a whimsical "Papercut Shadowbox" illustration in a soft, pastel palette.
1. SUBJECT & MEDIUM: Assemble the scene "{visual_modifiers}" using layers of textured colored paper. The aesthetic should be "Cozy Arts & Crafts"—clean cuts, playful shapes, and a handmade feel.
2. COMPOSITION (The Diorama): Frame the image like a small theater stage or a shoebox diorama. Use "Multi-plane Camera" depth: A blurry foreground frame, a sharp mid-ground subject, and a distant background layer.
3. LIGHTING & COLOR: Soft, diffused backlighting (nightlight glow). Colors: Mint greens, baby blues, pale pinks, cream, and lavender.
```

**Writing Structure:**
*   **Stem 1 (The Snip):** "With your smallest scissors, snip a shape like..."
    *   *Why:* "Snipping" grounds the surreal image in a safe, physical action.
*   **Stem 2 (The Glue):** "Use a dab of glue to paste it behind the..."
    *   *Why:* Emphasizes construction and the "hidden" layers of the diorama.
*   **Stem 3 (The Hanging):** "Finally, hang a tiny paper charm of a..."
    *   *Why:* The "charm" adds a sense of preciousness and finality to the scene.
