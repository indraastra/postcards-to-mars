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
            // Slow Path - Regenerate
            // For simplicity in this wrapper, we route to a "re-generating" state
            // Or we utilize the 'generating' component by routing there?
            // BUT 'generating' component expects to finalize a poem.
            // In the original code, onThemeSwitched did:
            // 1. Analyze (if no cache)
            // 2. Generate Poem
            // 3. Generate Image
            // It basically re-ran the flow but skipping the Dialogue UI.

            this.session.setArtifact(null!, '', '', 'Aligning narrative sensors...'); // Loading state in result?
            // Actually, the Result component can show loading if stylizedImage is null?
            // But looking at the original code, it navigated to 'generating' state effectively?
            // No, it stayed in 'result' state but updated signals.

            // Let's implement the generation logic here to keep Result wrapper self-contained.
            const base64 = this.session.originalImage();
            if (!base64) return;

            // We'll mimic the "Analysis + Generation" flow but purely programmatically
            // Since we are in the Result view, we might want to show some loading indicator.
            // PostcardResult component accepts [isRegenerating].
            // Maybe we can hijack that?

            // NOTE: Using isRegenerating here might be misleading if we are switching whole context,
            // but it's better than nothing.
            this.isRegenerating.set(true);

            try {
                const analysis = await this.geminiService.analyzeImage(base64);
                // Create auto poem
                const autoPoem = analysis.acts.map(act => {
                    const cleanStarter = act.starter.replace(/_{2,}/g, '').trim();
                    const suggestion = act.suggestions[0];
                    return `${cleanStarter} [${suggestion}]`;
                }).join('\n');

                this.session.setFinalPoem(autoPoem);

                const modifiers = analysis.visual_tags.join(', ');
                let imageRes;

                if (this.session.theme().usePoemForImageGeneration) {
                    imageRes = await this.geminiService.generateStylizedImage(base64, modifiers, autoPoem);
                } else {
                    imageRes = await this.geminiService.generateStylizedImage(base64, modifiers);
                }

                if (imageRes.image) {
                    this.session.setArtifact(imageRes.image, imageRes.prompt, imageRes.version, autoPoem);
                    this.geminiService.cacheArtifact(newThemeId, {
                        themeId: newThemeId,
                        imageUrl: imageRes.image,
                        poem: autoPoem,
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
