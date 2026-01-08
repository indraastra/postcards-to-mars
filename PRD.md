# Product Requirement Document (PRD)

**Project Name:** Postcards to Mars (Thematic Memory Engine)
**Version:** 2.0 (Multiverse Edition)
**Date:** January 8, 2026
**Status:** In Development

## 1. Executive Summary

"Postcards to Mars" is a diegetic creative tool that transforms ordinary photos into stylized "memory artifacts" from alternative realities.
**Core Pivot:** We have moved from a single-purpose "Mars" filter to a **multi-theme platform**. Users act as "Travelers" sending memories back from various timelines (Mars, Noir, Fantasy, Cyberpunk, etc.).
**Key Value:** High-quality, diegetic storytelling combined with AI visual styling, grounded in a "Darkroom" model where experimentation is encouraged but "Developing" (High-Res AI) is the monetization driver.

## 2. The "Multiverse" Concept (5 Themes)

We launch with 5 distinct "Destinations," each with a unique Visual Style (Image Prompt) and Narrative Voice (System Prompt).

| ID | Theme Name | Visual Aesthetic | Narrative Voice ("The Poet") |
| :--- | :--- | :--- | :--- |
| `mars` | **Postcards to Mars** | Rusty, vintage vector, halftone, indigo shadows, amber highlights. | **The Colonist:** Longing, isolation, warmth across distance. (Original) |
| `tokyo` | **Trains to Tokyo** | Wet neon reflections, cool blues/purples, Makoto Shinkai anime style. | **The Traveler:** Melancholic, cinematic, observing the city blur. |
| `noir` | **Shadows of the City** | High-contrast B&W, heavy grain, dramatic lighting, Frank Miller style. | **The Detective:** Cynical, clipped, hard-boiled, shadows & secrets. |
| `wild` | **Whispers from the Wild** | Ethereal, soft-focus, watercolor & ink, Studio Ghibli nature. | **The Druid:** Wonder, ancient, connected to the living spirit. |
| `retro` | **Polaroids from Yesterday** | 90s Lo-fi, vaporwave palette (Pink/Cyan), VHS distortion, flash photo. | **The Teenager:** Nostalgic, fleeting youth, raw honesty. |

## 3. User Flow & Experience

### 3.1 Phase 1: The Capture (Input)
*   **Action:** User takes a photo or uploads one.
*   **State:** The photo is held in a "Latent State" (Raw).

### 3.2 Phase 2: The Calibration (Theme Selection)
*   **UI:** A "Destination Frequency" selector.
*   **Action:** User selects their intended destination (e.g., "Trains to Tokyo").
*   **Effect:** Sets the `activeTheme` context for Poem generation and UI styling (fonts, colors).

### 3.3 Phase 3: The Poet (Text Generation - Free)
*   **Engine:** `Gemini 2.0 Flash` (Multimodal).
*   **Action:** App generates:
    1.  **3-Act Poem:** Based on the *selected theme's persona*.
    2.  **Visual Tags:** Semantic description of the scene for the image generator.
*   **Display:** User interacts with the poem acts interactively.

### 3.4 Phase 4: The Darkroom (Result & Development)
*   **Visuals:** The UI dynamically re-skins (CSS Variables) to match the theme (e.g., `font-family: 'Orbitron'` for Tokyo, `'Courier Prime'` for Noir).
*   **Image State:**
    *   **Developing:** A placeholder loader.
    *   **Developed:** The high-fidelity AI image (generated via `Gemini 2.0 Flash/Pro`).
*   **Interactions:**
    *   **Tune Signal:** Edit the prompt to regenerate the image.
    *   **Upload to Uplink:** Share via native share sheet.
    *   **Save:** Download the composited artifact.

## 4. Technical Architecture

### 4.1 Theme Engine (`src/core/theme.config.ts`)
A centralized configuration object drives the entire experience. Adding a new theme requires zero code changes to components, only a new entry in the config array.

```typescript
export interface ThemeConfig {
  id: string;
  name: string;
  textPersona: string; // System Instruction for Poem
  visualStyle: {
    promptTemplate: string; // Template for Img2Img
    primaryColor: string;   // UI Accent
    backgroundColor: string; // Card Background
    textColor: string;      // Card Text
    fontFamilyHeader: string;
    fontFamilyBody: string;
  };
}
```

### 4.2 Gemini Service
*   **Single Pass Analysis:** We optimize latency by asking Gemini to return both the **Poem Structure** and **Visual Tags** in a single JSON response.
*   **Parallel Processing:** Image generation starts immediately after theme selection/analysis to minimize wait time during the poem reveal.

## 5. Monetization Strategy (The "Darkroom" Model)

*   **Film Rolls:** A virtual currency.
*   **Cost:** 1 Film Roll = 1 High-Fidelity AI Image Generation.
*   **Free Tier:**
    *   Users can generate unlimited **Poems**.
    *   Users can preview the "Raw" image (Original Photo + CSS Filter) for free.
    *   "Developing" the memory (AI Generation) costs a credit.

## 6. Roadmap

*   **v1.0 (MVP):** 5 Themes, basic flow, local storage for history.
*   **v1.1:** "Film Strip" UI to switch themes for the same photo instantly.
*   **v1.2:** Physical Print integration.
