# Postcards to Mars (Thematic Memory Engine)

> *"Ideally, a postcard is a bridge. It says 'I am here, you are there, and I am thinking of you.'"*

**Postcards to Mars** is a diegetic creative tool that transforms ordinary photos into stylized "memory artifacts" from alternative realities. Unlike standard photo filters, it uses Multimodal AI (Gemini) to extract the *emotional context* of a scene, co-write a short poem with you, and render a high-fidelity artistic interpretation of the memory.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-beta-orange.svg)
![Powered By](https://img.shields.io/badge/AI-Google%20Gemini-purple.svg)

## 🌌 The Multiverse (Themes)

The engine supports 5 distinct narrative and visual "frequencies." Each theme changes not just the image style, but the **persona** of the AI poet and the **fonts/colors** of the UI.

1.  🔴 **Postcards to Mars:** Vintage vector art, indigo shadows. Voice: *The Colonist.*
2.  🚅 **Trains to Tokyo:** Wet neon, anime aesthetic (Shinkai-style). Voice: *The Traveler.*
3.  🕵️ **Shadows of the City:** High-contrast Noir, gritty B&W. Voice: *The Detective.*
4.  🌿 **Whispers from the Wild:** Soft watercolor & ink, Ghibli-nature. Voice: *The Druid.*
5.  📼 **Polaroids from Yesterday:** 90s Lo-fi, vaporwave, glitch. Voice: *The Teenager.*

## 🛠 Tech Stack

*   **Framework:** Angular 19 (Standalone Components, Signals)
*   **AI Model:** Google Gemini 2.0 Flash (Text & Vision)
*   **Styling:** Tailwind CSS + Dynamic CSS Variables
*   **Build Tool:** Vite / Angular CLI

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+)
*   A Google Cloud Project with the **Gemini API** enabled.
*   An API Key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/postcards-to-mars.git
    cd postcards-to-mars
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory (or use the existing setup script):
    ```bash
    echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```
    The app will launch at `http://localhost:4200`.

## 📂 Project Structure

```
src/
├── app.component.ts          # Main orchestrator (State Machine)
├── core/
│   └── theme.config.ts       # The "Brain" - Definitions for all 5 themes
├── components/
│   ├── theme-selector.ts     # The "Calibration" UI
│   ├── dialogue.component.ts # The interactive Poem builder
│   └── postcard-result.ts    # The final artifact renderer (Canvas)
└── services/
    └── gemini.service.ts     # Gemini API integration (Text & Vision)
```

## 🧠 Architecture Highlights

*   **Thematic Engine:** The app uses a "Universal Receiver" pattern. The UI components (`postcard-result`) are generic skeletons that accept a `ThemeConfig` object. This allows us to radically change the look and feel (fonts, colors, borders) without rewriting HTML.
*   **Parallel AI Processing:** To mask latency, the Image Generation (`Img2Img`) triggers immediately in the background while the user is engaging with the Poem Generation (`Text-to-Text`) flow.
*   **Diegetic UI:** The interface pretends to be a terminal uplink, using terms like "Calibration," "Artifacts," and "Signal Tuning" to immerse the user.

## 🤝 Contributing

This project is a creative experiment. Feel free to fork it and add your own "Themes" to `src/core/theme.config.ts`!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingTheme`)
3.  Commit your Changes (`git commit -m 'Add AmazingTheme'`)
4.  Push to the Branch (`git push origin feature/AmazingTheme`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.