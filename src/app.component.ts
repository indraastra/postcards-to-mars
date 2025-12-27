import { Component, inject, signal } from '@angular/core';
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
export class AppComponent {
  geminiService = inject(GeminiService);

  state = signal<AppState>('upload');
  loadingNextLine = signal(false);
  isRegenerating = signal(false);
  
  // Lore State
  showLore = signal(false);
  
  // Data State
  originalImage = signal<string | null>(null);
  analysisResult = signal<{ starter: string; mood: string; visualDescription: string; narrativeArc: string } | null>(null);
  
  poemHistory = signal<PoemLine[]>([]);
  
  currentStarter = signal<string>('');
  currentSuggestions = signal<string[]>([]);
  
  finalPoem = signal<string>('');
  stylizedImage = signal<string | null>(null);
  generatedPrompt = signal<string>('');

  toggleLore() {
    this.showLore.update(v => !v);
  }

  async onImageSelected(base64: string) {
    this.originalImage.set(base64);
    this.state.set('analyzing');
    
    const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const analysis = await this.geminiService.analyzeImage(cleanBase64);
    this.analysisResult.set(analysis);
    this.currentStarter.set(analysis.starter);
    this.currentSuggestions.set(analysis.suggestions || []);
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
    const analysis = this.analysisResult();
    const currentTextHistory = this.poemHistory().map(l => l.fullText);
    const image = this.originalImage();
    
    if (analysis && image) {
      const next = await this.geminiService.generateNextLine(
        currentTextHistory,
        analysis.mood,
        analysis.visualDescription,
        analysis.narrativeArc,
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
    
    const historyLines = this.poemHistory();

    const finalPoemStr = historyLines
      .map(line => {
        // Smart spacing for final construction
        const sep = /^[\.,;:\?!]/.test(line.suffix) ? '' : ' ';
        return `${line.prefix} [${line.userInput}]${sep}${line.suffix}`;
      })
      .join('\n');
      
    this.finalPoem.set(finalPoemStr);
    
    // Generate AI Art (Nano Banana) - Image to Image
    const analysis = this.analysisResult();
    const original = this.originalImage();
    
    if (analysis && original) {
      // Pass the original image AND poem to be stylized
      const result = await this.geminiService.generateStylizedImage(original, analysis.mood, finalPoemStr);
      this.stylizedImage.set(result.image || original); // Fallback to original
      this.generatedPrompt.set(result.prompt);
    } else {
      this.stylizedImage.set(original);
    }
    
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
    this.state.set('upload');
    this.originalImage.set(null);
    this.analysisResult.set(null);
    this.poemHistory.set([]);
    this.currentSuggestions.set([]);
    this.stylizedImage.set(null);
    this.generatedPrompt.set('');
  }
}