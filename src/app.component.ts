import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogueComponent, PoemLine } from './components/dialogue.component';
import { PostcardResultComponent } from './components/postcard-result.component';
import { GeminiService, PoemAct } from './services/gemini.service';
import { FilmStripComponent } from './components/film-strip.component';
import { DestinationGalleryComponent } from './components/destination-gallery.component';
import { ImageDebugComponent } from './components/image-debug.component';

type AppState = 'landing' | 'analyzing' | 'dialogue' | 'generating' | 'result' | 'error' | 'debug';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    DialogueComponent,
    PostcardResultComponent,
    FilmStripComponent,
    DestinationGalleryComponent,
    ImageDebugComponent
  ],
  templateUrl: './app.component.html',
  styles: [
    `
    .animate-progress {
      animation: progress 2s ease-in-out infinite;
    }
    @keyframes progress {
      0% { width: 0%; transform: translateX(-100%); }
      50% { width: 100%; transform: translateX(0); }
      100% { width: 0%; transform: translateX(100%); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AppComponent implements OnDestroy, OnInit {
  geminiService = inject(GeminiService);

  state = signal<AppState>('landing'); // Start at landing
  loadingNextLine = signal(false);
  isRegenerating = signal(false);

  // Lore/Info State
  showLore = signal(false);
  showAbout = signal(false);

  // Data State
  originalImage = signal<string | null>(null);
  visualTags = signal<string[]>([]);
  imageGenerationPromise: Promise<{ image: string | null; prompt: string; version: string }> | null = null;
  promptVersion = signal<string>('');

  // Poem Generation State
  poemActs = signal<PoemAct[]>([]);
  currentActIndex = signal<number>(0);

  poemHistory = signal<PoemLine[]>([]);

  // Current Display Props
  currentStarter = signal<string>('');
  currentSuggestions = signal<string[]>([]);

  finalPoem = signal<string>('');
  stylizedImage = signal<string | null>(null);
  generatedPrompt = signal<string>('');

  // Loading State
  loadingMessage = signal('Processing Signal...');
  loadingInterval: any;

  // Error State
  errorMessage = signal('Something went wrong.');
  retryAction = () => { };



  ngOnInit() {
    // Hidden Debug Route Check
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/debug') || search.includes('mode=debug')) {
      console.log('Entering Debug Mode');
      this.state.set('debug');
    }
  }

  ngOnDestroy() {
    this.stopLoadingCycle();
  }

  toggleLore() {
    this.showLore.update(v => !v);
  }

  toggleAbout() {
    this.showAbout.update(v => !v);
  }

  startLoadingCycle() {
    this.stopLoadingCycle(); // Clear any existing interval
    let index = 0;
    const messages = this.geminiService.activeTheme().loadingMessages;

    // Set initial message
    if (messages && messages.length > 0) {
      this.loadingMessage.set(messages[0]);
    } else {
      this.loadingMessage.set('Loading...'); // Fallback
    }

    this.loadingInterval = setInterval(() => {
      index = (index + 1) % messages.length;
      this.loadingMessage.set(messages[index]);
    }, 1000);
  }

  stopLoadingCycle() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }
  }

  async onImageSelected(base64: string) {
    this.originalImage.set(base64);

    // Skip calibration, go straight to analyzing
    this.state.set('analyzing');
    this.startLoadingCycle();

    // 1. Analyze Image (Poem Structure + Visual Tags)
    const analysis = await this.geminiService.analyzeImage(base64);

    this.poemActs.set(analysis.acts);
    this.visualTags.set(analysis.visual_tags);
    this.currentActIndex.set(0);
    this.poemHistory.set([]);

    // 2. Start parallel image generation using the visual tags (IF NOT Sequential)
    const modifiers = analysis.visual_tags.join(', ');
    const useSequential = this.geminiService.activeTheme().usePoemForImageGeneration;

    if (!useSequential) {
      this.imageGenerationPromise = this.geminiService.generateStylizedImage(base64, modifiers);
    } else {
      console.log('Sequential Mode: Waiting for poem completion before generating image...');
      this.imageGenerationPromise = null;
    }

    this.stopLoadingCycle();

    // Load first act
    if (analysis.acts.length > 0) {
      this.currentStarter.set(analysis.acts[0].starter);
      this.currentSuggestions.set(analysis.acts[0].suggestions);
    }

    this.state.set('dialogue');
  }

  onLineCompleted(line: PoemLine) {
    this.poemHistory.update(lines => [...lines, line]);

    const nextIndex = this.currentActIndex() + 1;
    const allActs = this.poemActs();

    if (nextIndex < allActs.length) {
      this.loadingNextLine.set(true);
      const delay = Math.floor(Math.random() * (800 - 400 + 1)) + 400;

      setTimeout(() => {
        this.currentActIndex.set(nextIndex);
        this.currentStarter.set(allActs[nextIndex].starter);
        this.currentSuggestions.set(allActs[nextIndex].suggestions);
        this.loadingNextLine.set(false);
      }, delay);

    } else {
      this.finishCreation();
    }
  }

  async finishCreation(lastLine?: PoemLine) {
    if (lastLine) {
      this.poemHistory.update(lines => [...lines, lastLine]);
    }

    this.state.set('generating');
    this.startLoadingCycle();

    const historyLines = this.poemHistory();

    const finalPoemStr = historyLines
      .map(line => {
        const cleanPrefix = line.prefix.replace(/_{2,}/g, '').trim();
        const sep = new RegExp('^[\\.,;:\\?!]').test(line.suffix) ? '' : ' ';
        let fullLine = `${cleanPrefix} [${line.userInput}]${sep}${line.suffix}`.trim();

        // Ensure line ends with punctuation, checking both the very end AND inside the bracket
        const hasPunctuation = /[.!?]$/.test(fullLine) || /[.!?]\]$/.test(fullLine);

        if (!hasPunctuation) {
          fullLine += '.';
        }
        return fullLine;
      })
      .join('\n');

    this.finalPoem.set(finalPoemStr);

    const randomDelayMs = Math.floor(Math.random() * (900 - 600 + 1)) + 600;
    const minDelay = new Promise(resolve => setTimeout(resolve, randomDelayMs));

    let imageResult: { image: string | null; prompt: string; version: string };
    const original = this.originalImage();
    const modifiers = this.visualTags().join(', ');
    const activeThemeId = this.geminiService.activeTheme().id;

    try {
      if (this.imageGenerationPromise) {
        // Parallel Mode: Image likely ready or generating
        const [result] = await Promise.all([this.imageGenerationPromise, minDelay]);
        imageResult = result;
      } else if (original) {
        // Sequential Mode (or Fallback): Generate NOW using the poem context
        console.log('Generating image with poem context:', finalPoemStr);
        // If sequential, we pass the poem. If fallback, we might not have it but the method handles optional.
        const [result] = await Promise.all([
          this.geminiService.generateStylizedImage(original, modifiers, finalPoemStr),
          minDelay
        ]);
        imageResult = result;
      } else {
        await minDelay;
        imageResult = { image: null, prompt: '', version: 'ERR-0.0' };
      }
    } catch (err) {
      console.error('Image generation failed', err);
      // ERROR HANDLING
      this.state.set('error');
      this.errorMessage.set('Unable to connect to server.');
      this.retryAction = () => this.finishCreation();
      return;
    }

    // Save to Cache
    if (imageResult.image) {
      this.geminiService.cacheArtifact(activeThemeId, {
        themeId: activeThemeId,
        imageUrl: imageResult.image,
        poem: finalPoemStr,
        prompt: imageResult.prompt,
        version: imageResult.version,
        timestamp: Date.now()
      });
    }

    this.stylizedImage.set(imageResult.image || original);
    this.generatedPrompt.set(imageResult.prompt);
    this.promptVersion.set(imageResult.version || 'SEQ-84.X');

    this.stopLoadingCycle();
    this.state.set('result');
    this.imageGenerationPromise = null; // Clear promise after consumption
  }

  // SWITCH THEME HANDLER
  async onThemeSwitched(newThemeId: string) {
    if (this.state() !== 'result') return;

    this.geminiService.setTheme(newThemeId);
    this.startLoadingCycle();
    this.loadingMessage.set("Re-calibrating destination frequency...");

    const cached = this.geminiService.getArtifact(newThemeId);

    if (cached) {
      // 1. FAST PATH: We have everything cached
      setTimeout(() => {
        this.finalPoem.set(cached.poem);
        this.stylizedImage.set(cached.imageUrl);
        this.generatedPrompt.set(cached.prompt);
        this.promptVersion.set(cached.version);
        this.stopLoadingCycle();
      }, 400); // Small artificial delay for "Tuning" feel
    } else {
      // 2. SLOW PATH: We need to generate a new poem (Cheap) + Generate Image (Expensive)

      // Reset UI to loading state immediately
      this.stylizedImage.set(null);
      this.finalPoem.set('Aligning narrative sensors...');

      const base64 = this.originalImage();
      if (!base64) return;

      const analysis = await this.geminiService.analyzeImage(base64);

      const autoPoem = analysis.acts.map(act => {
        const cleanStarter = act.starter.replace(/_{2,}/g, '').trim();
        const suggestion = act.suggestions[0]; // Pick first
        const sep = new RegExp('^[\.,;:\?!]').test(suggestion) ? '' : ' ';
        return `${cleanStarter} [${suggestion}]`;
      }).join('\n');

      this.finalPoem.set(autoPoem); // Show poem immediately while image generates

      // B. Generate Image
      const modifiers = this.visualTags().join(', '); // Reuse tags
      let imageRes;
      try {
        imageRes = await this.geminiService.generateStylizedImage(base64, modifiers);
      } catch (e) {
        this.state.set('error');
        this.errorMessage.set('Failed to generate image.');
        this.retryAction = () => this.onThemeSwitched(newThemeId);
        return;
      }

      // Save to Cache
      if (imageRes.image) {
        this.geminiService.cacheArtifact(newThemeId, {
          themeId: newThemeId,
          imageUrl: imageRes.image,
          poem: autoPoem,
          prompt: imageRes.prompt,
          version: imageRes.version,
          timestamp: Date.now()
        });
      }

      this.stylizedImage.set(imageRes.image);
      this.generatedPrompt.set(imageRes.prompt);
      this.promptVersion.set(imageRes.version);
      this.stopLoadingCycle();
    }
  }


  // Retry Handler
  retry() {
    this.state.set('generating');
    this.retryAction();
  }

  async onRegenerateImage(newPrompt: string) {
    const original = this.originalImage();
    if (!original) return;

    this.isRegenerating.set(true);
    this.generatedPrompt.set(newPrompt);

    const newImage = await this.geminiService.generateImageFromPrompt(original, newPrompt);

    if (newImage) {
      this.stylizedImage.set(newImage);
      // Update cache
      const themeId = this.geminiService.activeTheme().id;
      const cached = this.geminiService.getArtifact(themeId);
      if (cached) {
        cached.imageUrl = newImage;
        cached.prompt = newPrompt;
        this.geminiService.cacheArtifact(themeId, cached);
      }
    }

    this.isRegenerating.set(false);
  }

  onPoemChanged(newPoem: string) {
    this.finalPoem.set(newPoem);

    // Update cache
    const themeId = this.geminiService.activeTheme().id;
    const cached = this.geminiService.getArtifact(themeId);
    if (cached) {
      cached.poem = newPoem;
      this.geminiService.cacheArtifact(themeId, cached);
    }
  }

  reset() {
    this.stopLoadingCycle();
    this.state.set('landing'); // Return to landing
    this.originalImage.set(null);
    this.imageGenerationPromise = null;
    this.poemHistory.set([]);
    this.poemActs.set([]);
    this.currentActIndex.set(0);
    this.currentSuggestions.set([]);
    this.stylizedImage.set(null);
    this.generatedPrompt.set('');
    this.promptVersion.set('');
    this.visualTags.set([]);
    this.geminiService.clearCache(); // New session = Clear cache
  }
}