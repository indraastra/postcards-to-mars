import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraUploadComponent } from './components/camera-upload.component';
import { DialogueComponent, PoemLine } from './components/dialogue.component';
import { PostcardResultComponent } from './components/postcard-result.component';
import { GeminiService } from './services/gemini.service';

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
  
  poemHistory = signal<PoemLine[]>([]);
  
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
    
    const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const result = await this.geminiService.generateFirstLine(cleanBase64);
    this.currentStarter.set(result.starter);
    this.currentSuggestions.set(result.suggestions || []);
    this.poemHistory.set([]); 
    this.state.set('dialogue');
  }

  async onLineCompleted(line: PoemLine) {
    this.poemHistory.update(lines => [...lines, line]);
    
    // Limit to 3 lines for a concise postcard
    // After 3rd line is added, length is 3.
    if (this.poemHistory().length >= 3) { 
      this.finishCreation();
      return;
    }

    this.loadingNextLine.set(true);
    const currentTextHistory = this.poemHistory().map(l => l.fullText);
    const image = this.originalImage();
    
    if (image) {
      const next = await this.geminiService.generateNextLine(
        currentTextHistory,
        image
      );
      this.currentStarter.set(next.starter);
      this.currentSuggestions.set(next.suggestions || []);
    }
    this.loadingNextLine.set(false);
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
    const original = this.originalImage();
    
    if (original) {
      // Pass the original image AND poem to be stylized
      // Passing default 'nostalgic' mood as arg is unused but required by signature
      const result = await this.geminiService.generateStylizedImage(original, 'nostalgic', finalPoemStr);
      this.stylizedImage.set(result.image || original); // Fallback to original
      this.generatedPrompt.set(result.prompt);
    } else {
      this.stylizedImage.set(original);
    }
    
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
    // If it fails, we keep the old image but prompt is updated, which is fine for retry
    
    this.isRegenerating.set(false);
  }

  reset() {
    this.stopLoadingCycle();
    this.state.set('upload');
    this.originalImage.set(null);
    this.poemHistory.set([]);
    this.currentSuggestions.set([]);
    this.stylizedImage.set(null);
    this.generatedPrompt.set('');
  }
}