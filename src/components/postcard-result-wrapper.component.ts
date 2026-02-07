import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostcardResultComponent } from './postcard-result.component';
import { FilmStripComponent } from './film-strip.component';
import { SessionStore } from '../store/session.store';
import { GeminiService } from '../services/gemini.service';
import { ThemeService } from '../services/theme.service';
import { AnalyticsService } from '../services/analytics.service';
import { Artifact } from '../core/types';

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
    themeService = inject(ThemeService);
    analytics = inject(AnalyticsService);
    router = inject(Router);

    isRegenerating = signal(false);

    ngOnInit() {
        // If we don't have an original image (e.g. page refresh), go back to home
        if (!this.session.originalImage()) {
            this.router.navigate(['/']);
        }
    }

    async onRegenerateImage(newPrompt: string) {
        const original = this.session.originalImage();
        if (!original) return;

        this.isRegenerating.set(true);

        try {
            const newImage = await this.geminiService.generateImageFromPrompt(original, newPrompt);

            if (newImage) {
                // Update Store (which now auto-updates cache)
                this.session.updateArtifactImage(newImage, newPrompt);
                this.analytics.trackRegeneration(this.session.theme().id, 'image');
            }
        } catch (e) {
            console.error('Regeneration failed', e);
        } finally {
            this.isRegenerating.set(false);
        }
    }

    onPoemChanged(newPoem: string) {
        this.session.setFinalPoem(newPoem);
    }

    async onThemeSwitched(newThemeId: string) {
        // 1. Set the new theme
        this.session.setTheme(newThemeId);

        // 2. Check if we already have a valid artifact for this theme (Cache Hit)
        // SessionStore.setTheme automatically restores it if available.
        if (this.session.hasArtifact()) {
            return; // Done! Instant switch.
        }

        // 3. Regeneration Path (Cache Miss)
        const theme = this.session.theme();
        let mode = this.session.reflectionMode();

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
            // Pass mode and theme to analysis
            const analysis = await this.geminiService.analyzeImage(base64, theme, mode);
            let finalPoem = '';

            if (mode === 'visual') {
                finalPoem = (analysis as any).caption || '';
            } else {
                finalPoem = analysis.acts.map(act => {
                    const cleanStarter = act.starter.replace(/_{2,}/g, '').trim();
                    const suggestion = act.suggestions[0];
                    return `${cleanStarter} [${suggestion}]`;
                }).join('\n');
            }

            this.session.setFinalPoem(finalPoem);

            const modifiers = analysis.visual_tags.join(', ');
            let imageRes;

            const usePoemContext = this.session.theme().usePoemForImageGeneration && mode === 'full';

            if (usePoemContext) {
                imageRes = await this.geminiService.generateStylizedImage(base64, theme, modifiers, finalPoem);
            } else {
                imageRes = await this.geminiService.generateStylizedImage(base64, theme, modifiers);
            }

            if (imageRes.image) {
                // Setting artifact auto-updates the SessionStore cache
                this.session.setArtifact(imageRes.image, imageRes.prompt, imageRes.version, finalPoem);
                this.analytics.trackGeneration(newThemeId, mode === 'visual' ? 'visual' : 'full', usePoemContext);
            }

        } catch (e) {
            console.error(e);
        } finally {
            this.isRegenerating.set(false);
        }
    }
}
