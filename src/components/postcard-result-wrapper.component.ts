import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostcardResultComponent } from './postcard-result.component';
import { FilmStripComponent } from './film-strip.component';
import { SessionStore } from '../store/session.store';
import { GeminiService } from '../services/gemini.service';

@Component({
    selector: 'app-result-wrapper',
    standalone: true,
    imports: [CommonModule, PostcardResultComponent, FilmStripComponent],
    template: `
    <div class="min-h-full w-full max-w-2xl mx-auto flex flex-col items-center justify-center px-4 pt-20 pb-8">
      <app-postcard-result 
        [poem]="session.finalPoem()" 
        [stylizedImageSrc]="session.stylizedImage()" 
        [imagePrompt]="session.generatedPrompt()"
        [version]="session.promptVersion()" 
        [isRegenerating]="isRegenerating()"
        (regenerate)="onRegenerateImage($event)"
        (poemChange)="onPoemChanged($event)">
      </app-postcard-result>

      <app-film-strip (themeSwitch)="onThemeSwitched($event)"></app-film-strip>
    </div>
  `
})
export class PostcardResultWrapperComponent {
    session = inject(SessionStore);
    geminiService = inject(GeminiService);
    router = inject(Router);

    isRegenerating = signal(false);

    async onRegenerateImage(newPrompt: string) {
        const original = this.session.originalImage();
        if (!original) return;

        this.isRegenerating.set(true);

        try {
            const newImage = await this.geminiService.generateImageFromPrompt(original, newPrompt);

            if (newImage) {
                // Update Store
                this.session.updateArtifactImage(newImage, newPrompt);

                // Update Cache
                const theme = this.session.theme();
                this.geminiService.cacheArtifact(theme.id, {
                    themeId: theme.id,
                    imageUrl: newImage,
                    poem: this.session.finalPoem(),
                    prompt: newPrompt,
                    version: this.session.promptVersion(), // Keep version or update? Keeping for now.
                    timestamp: Date.now()
                });
            }
        } catch (e) {
            console.error('Regeneration failed', e);
            // Optional: Notify user of failure via a toast or store error
        } finally {
            this.isRegenerating.set(false);
        }
    }

    onPoemChanged(newPoem: string) {
        this.session.setFinalPoem(newPoem);
    }

    async onThemeSwitched(newThemeId: string) {
        this.session.setTheme(newThemeId);

        const cached = this.geminiService.getArtifact(newThemeId);
        if (cached) {
            // Fast Path
            this.session.setArtifact(cached.imageUrl, cached.prompt, cached.version, cached.poem);
        } else {
            // Regeneration Path
            const theme = this.session.theme();
            let mode = this.session.reflectionMode(); // Honor current mode

            // Override mode if theme disables narrative
            if (theme.disableNarrative) {
                mode = 'visual';
            }

            const placeholder = mode === 'visual' ? '' : 'Aligning narrative sensors...';

            this.session.setArtifact(null!, '', '', placeholder);
            this.isRegenerating.set(true);

            const base64 = this.session.originalImage();

            if (!base64) {
                this.isRegenerating.set(false);
                return;
            }

            try {
                // Pass mode to analysis
                const analysis = await this.geminiService.analyzeImage(base64, mode);
                let finalPoem = '';

                if (mode === 'visual') {
                    // Visual Mode: No poem, or empty string from service
                    finalPoem = (analysis as any).caption || '';
                } else {
                    // Full Mode: Create auto poem from acts
                    finalPoem = analysis.acts.map(act => {
                        const cleanStarter = act.starter.replace(/_{2,}/g, '').trim();
                        const suggestion = act.suggestions[0];
                        return `${cleanStarter} [${suggestion}]`;
                    }).join('\n');
                }

                this.session.setFinalPoem(finalPoem);

                const modifiers = analysis.visual_tags.join(', ');
                let imageRes;

                // If visual mode or theme doesn't use poem context
                const usePoemContext = this.session.theme().usePoemForImageGeneration && mode === 'full';

                if (usePoemContext) {
                    imageRes = await this.geminiService.generateStylizedImage(base64, modifiers, finalPoem);
                } else {
                    imageRes = await this.geminiService.generateStylizedImage(base64, modifiers);
                }

                if (imageRes.image) {
                    this.session.setArtifact(imageRes.image, imageRes.prompt, imageRes.version, finalPoem);
                    this.geminiService.cacheArtifact(newThemeId, {
                        themeId: newThemeId,
                        imageUrl: imageRes.image,
                        poem: finalPoem,
                        prompt: imageRes.prompt,
                        version: imageRes.version,
                        timestamp: Date.now()
                    });
                }

            } catch (e) {
                console.error(e);
            } finally {
                this.isRegenerating.set(false);
            }
        }
    }
}
