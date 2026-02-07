import { Component, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GeminiService } from '../services/gemini.service';
import { SessionStore } from '../store/session.store';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full w-full max-w-2xl mx-auto flex flex-col items-center justify-center px-4 pt-20 pb-8">
      <div class="flex flex-col items-center gap-6 text-center px-6 animate-fade-in">
        <!-- Linear Loader -->
        <div class="w-24 h-px relative overflow-hidden" [style.background-color]="theme().visualStyle.textColor"
          style="opacity: 0.2">
          <div class="absolute h-full animate-progress" 
               [style.background-color]="theme().visualStyle.primaryColor"
               style="opacity: 1 !important"></div>
        </div>

        <div class="font-mono space-y-2">
          <h3 class="text-xs tracking-widest uppercase" 
              [style.color]="theme().visualStyle.primaryColor">
              {{ theme().loadingText }}
          </h3>
          <p class="text-[10px] uppercase tracking-wider min-h-[1rem] opacity-90"
             [style.color]="theme().visualStyle.textColor">
             {{ loadingMessage() }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-progress {
      animation: progress 2s ease-in-out infinite;
      width: 100%;
    }
    @keyframes progress {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0); }
      100% { transform: translateX(100%); }
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
export class AnalysisComponent implements OnInit, OnDestroy {
  session = inject(SessionStore);
  geminiService = inject(GeminiService);
  router = inject(Router);

  theme = this.session.theme;
  loadingMessage = signal('Processing Signal...');
  loadingInterval: any;

  ngOnInit() {
    // Redirect if no image
    if (!this.session.originalImage()) {
      this.router.navigate(['/']);
      return;
    }

    this.startLoadingCycle();
    this.startAnalysis();
  }

  ngOnDestroy() {
    this.stopLoadingCycle();
  }

  startLoadingCycle() {
    this.stopLoadingCycle();
    let index = 0;
    const messages = this.theme().loadingMessages;

    if (messages && messages.length > 0) {
      this.loadingMessage.set(messages[0]);
    } else {
      this.loadingMessage.set('Loading...');
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

  async startAnalysis() {
    const base64 = this.session.originalImage();
    const mode = this.session.reflectionMode();

    if (!base64) return;

    try {
      const analysis = await this.geminiService.analyzeImage(base64, this.theme(), mode);
      this.session.setAnalysis(analysis.acts, analysis.visual_tags);

      // Parallel Image Generation Trigger
      const modifiers = analysis.visual_tags.join(', ');

      // In Visual Mode, we use the caption immediately
      if (mode === 'visual') {
        const caption = (analysis as any).caption || "";
        this.session.setFinalPoem(caption);
      }

      const isVisualBypass = mode === 'visual' || this.theme().disableNarrative;

      const useSequential = this.theme().usePoemForImageGeneration && mode === 'full';

      // Only use parallel generation if we have a sequential flow (Full Mode) AND the theme allows it
      // Visual mode goes straight to 'Generating', so let that component handle it to avoid race conditions.
      const shouldGenerateParallel = useSequential === false && mode === 'full' && !isVisualBypass;

      if (shouldGenerateParallel) {
        // Fire and forget - store result in cache/store later
        this.geminiService.generateStylizedImage(base64, this.theme(), modifiers).then(res => {
          if (res.image) {
            this.session.updateArtifactImage(res.image, res.prompt);
          }
        });
      }

      if (isVisualBypass) {
        // Skip Dialogue, go to Generating/Result
        this.router.navigate(['/generating']);
      } else {
        this.router.navigate(['/compose']);
      }

    } catch (e) {
      console.error('Analysis failed', e);
      this.session.setError('Analysis failed. Please try again.');
      this.router.navigate(['/error']);
    }
  }
}
