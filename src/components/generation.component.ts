import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GeminiService } from '../services/gemini.service';
import { SessionStore } from '../store/session.store';

@Component({
    selector: 'app-generation',
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
              {{ theme().generatingText }}
          </h3>
          <p class="text-[10px] uppercase tracking-wider min-h-[1rem]"
             [style.color]="'gray'">
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
  `]
})
export class GenerationComponent implements OnInit, OnDestroy {
    session = inject(SessionStore);
    geminiService = inject(GeminiService);
    router = inject(Router);

    theme = this.session.theme;
    loadingMessage = signal('Processing Signal...');
    loadingInterval: any;

    ngOnInit() {
        if (!this.session.originalImage()) {
            this.router.navigate(['/']);
            return;
        }
        this.startLoadingCycle();
        this.finalizeGeneration();
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

    async finalizeGeneration() {
        // No artificial delay
        const original = this.session.originalImage();
        const existingArtifact = this.session.stylizedImage();

        if (existingArtifact) {
            // Already generated (parallel)
            this.router.navigate(['/result']);
        } else if (original) {
            // Sequential: Generate now
            const modifiers = this.session.visualTags().join(', ');
            const poem = this.session.finalPoem();

            try {
                const result = await this.geminiService.generateStylizedImage(original, modifiers, poem);
                if (result.image) {
                    this.session.setArtifact(result.image, result.prompt, result.version, poem);

                    // Cache
                    this.geminiService.cacheArtifact(this.theme().id, {
                        themeId: this.theme().id,
                        imageUrl: result.image,
                        poem: poem,
                        prompt: result.prompt,
                        version: result.version,
                        timestamp: Date.now()
                    });
                }
                this.router.navigate(['/result']);
            } catch (e) {
                this.session.setError('Generation failed.');
                this.router.navigate(['/error']);
            }
        }
    }
}
