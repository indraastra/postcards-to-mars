import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraUploadComponent } from './components/camera-upload.component';
import { DialogueComponent, PoemLine } from './components/dialogue.component';
import { PostcardResultComponent } from './components/postcard-result.component';
import { GeminiService, PoemAct } from './services/gemini.service';

type AppState = 'upload' | 'analyzing' | 'dialogue' | 'generating' | 'result';

@Component({
  selector: 'app-root',
  imports: [CommonModule, CameraUploadComponent, DialogueComponent, PostcardResultComponent],
  templateUrl: './app.component.html',
  styles: [`
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

  state = signal<AppState>('upload');
  loadingNextLine = signal(false);
  isRegenerating = signal(false);
  
  // Lore/Info State
  showLore = signal(false);
  showAbout = signal(false);
  
  // Data State
  originalImage = signal<string | null>(null);
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
    this.state.set('analyzing');
    
    // Start parallel image generation
    this.imageGenerationPromise = this.geminiService.generateStylizedImage(base64);
    
    // Generate the full poem structure (3 acts) at once
    const acts = await this.geminiService.generatePoemStructure(base64);
    
    this.poemActs.set(acts);
    this.currentActIndex.set(0);
    this.poemHistory.set([]); 
    
    // Load first act
    if (acts.length > 0) {
      this.currentStarter.set(acts[0].starter);
      this.currentSuggestions.set(acts[0].suggestions);
    }
    
    this.state.set('dialogue');
  }

  onLineCompleted(line: PoemLine) {
    this.poemHistory.update(lines => [...lines, line]);
    
    const nextIndex = this.currentActIndex() + 1;
    const allActs = this.poemActs();

    // Check if we have more acts to display
    if (nextIndex < allActs.length) {
      // Simulate "thinking" delay for the UX rhythm
      this.loadingNextLine.set(true);
      
      // Random delay between 1s (1000ms) and 3s (3000ms)
      const delay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;

      setTimeout(() => {
        this.currentActIndex.set(nextIndex);
        this.currentStarter.set(allActs[nextIndex].starter);
        this.currentSuggestions.set(allActs[nextIndex].suggestions);
        this.loadingNextLine.set(false);
      }, delay); 
      
    } else {
      // Finished all acts
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
        // Smart spacing for final construction
        const sep = /^[\.,;:\?!]/.test(line.suffix) ? '' : ' ';
        let fullLine = `${line.prefix} [${line.userInput}]${sep}${line.suffix}`.trim();
        
        // Ensure line ends with punctuation, checking both the very end AND inside the bracket
        // Matches: "sentence." or "sentence [word.]" or "sentence [word!]"
        const hasPunctuation = /[.!?]$/.test(fullLine) || /[.!?]\]$/.test(fullLine);

        if (!hasPunctuation) {
            fullLine += '.';
        }
        return fullLine;
      })
      .join('\n');
      
    this.finalPoem.set(finalPoemStr);
    
    // Generate AI Art (Nano Banana) - Image to Image
    // Ensure minimum random delay between 2s and 4s for UX pacing
    const randomDelayMs = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
    const minDelay = new Promise(resolve => setTimeout(resolve, randomDelayMs));
    
    let imageResult: { image: string | null; prompt: string; version: string };
    const original = this.originalImage();
    
    try {
      if (this.imageGenerationPromise) {
        // Wait for the parallel request to complete + the min delay
        const [result] = await Promise.all([this.imageGenerationPromise, minDelay]);
        imageResult = result;
      } else if (original) {
        // Fallback if promise missing
        const [result] = await Promise.all([this.geminiService.generateStylizedImage(original), minDelay]);
        imageResult = result;
      } else {
         await minDelay;
         imageResult = { image: null, prompt: '', version: 'ERR-0.0' };
      }
    } catch (err) {
      console.error('Image generation failed', err);
      imageResult = { image: null, prompt: '', version: 'ERR-0.0' };
    }
    
    this.stylizedImage.set(imageResult.image || original); // Fallback to original
    this.generatedPrompt.set(imageResult.prompt);
    this.promptVersion.set(imageResult.version || 'SEQ-84.X');
    
    this.stopLoadingCycle();
    this.state.set('result');
  }

  async onRegenerateImage(newPrompt: string) {
    const original = this.originalImage();
    if (!original) return;

    this.isRegenerating.set(true);
    this.generatedPrompt.set(newPrompt); // Update prompt state

    const newImage = await this.geminiService.generateImageFromPrompt(original, newPrompt);
    
    if (newImage) {
      this.stylizedImage.set(newImage);
    }
    
    this.isRegenerating.set(false);
  }

  reset() {
    this.stopLoadingCycle();
    this.state.set('upload');
    this.originalImage.set(null);
    this.imageGenerationPromise = null;
    this.poemHistory.set([]);
    this.poemActs.set([]);
    this.currentActIndex.set(0);
    this.currentSuggestions.set([]);
    this.stylizedImage.set(null);
    this.generatedPrompt.set('');
    this.promptVersion.set('');
  }
}