import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraUploadComponent } from './components/camera-upload.component';
import { DialogueComponent, PoemLine } from './components/dialogue.component';
import { PostcardResultComponent } from './components/postcard-result.component';
import { GeminiService, PoemAct } from './services/gemini.service';
import { FilmStripComponent } from './components/film-strip.component';
import { DestinationGalleryComponent } from './components/destination-gallery.component';

type AppState = 'landing' | 'analyzing' | 'dialogue' | 'generating' | 'result';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    CameraUploadComponent, 
    DialogueComponent, 
    PostcardResultComponent, 
    FilmStripComponent,
    DestinationGalleryComponent
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
export class AppComponent implements OnDestroy {
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
  loadingMessage = signal('Compressing Artifact');
  private intervalId: any;
  private readonly LOADING_MESSAGES = [
    "Compressing visual data...",
    "Allocating bandwidth...",
    "Packet loss detected... Retrying...",
    "Encrypting memory artifact...",
    "Bypassing atmospheric interference...",
    "Handshake with Colony 7 verified...",
    "Uploading to deep space network...",
    "Optimizing signal-to-noise ratio..."
  ];

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
    let i = 0;
    this.loadingMessage.set(this.LOADING_MESSAGES[0]);
    this.stopLoadingCycle();
    this.intervalId = setInterval(() => {
      i = (i + 1) % this.LOADING_MESSAGES.length;
      this.loadingMessage.set(this.LOADING_MESSAGES[i]);
    }, 1800);
  }

  stopLoadingCycle() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
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
    
    // 2. Start parallel image generation using the visual tags
    const modifiers = analysis.visual_tags.join(', ');
    this.imageGenerationPromise = this.geminiService.generateStylizedImage(base64, modifiers);
    
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
      const delay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;

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
    
    const randomDelayMs = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
    const minDelay = new Promise(resolve => setTimeout(resolve, randomDelayMs));
    
    let imageResult: { image: string | null; prompt: string; version: string };
    const original = this.originalImage();
    const modifiers = this.visualTags().join(', ');
    const activeThemeId = this.geminiService.activeTheme().id;
    
    try {
      if (this.imageGenerationPromise) {
        const [result] = await Promise.all([this.imageGenerationPromise, minDelay]);
        imageResult = result;
      } else if (original) {
        // Fallback
        const [result] = await Promise.all([this.geminiService.generateStylizedImage(original, modifiers), minDelay]);
        imageResult = result;
      } else {
         await minDelay;
         imageResult = { image: null, prompt: '', version: 'ERR-0.0' };
      }
    } catch (err) {
      console.error('Image generation failed', err);
      imageResult = { image: null, prompt: '', version: 'ERR-0.0' };
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
          }, 800); // Small artificial delay for "Tuning" feel
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
          const imageRes = await this.geminiService.generateStylizedImage(base64, modifiers);
          
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