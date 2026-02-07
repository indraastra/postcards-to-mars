import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { GeminiService } from '../services/gemini.service';
import { PoemAct, Artifact } from '../core/types';
import { ThemeService } from '../services/theme.service';
import { ThemeConfig } from '../core/theme.config';

export type AppState = 'landing' | 'analyzing' | 'dialogue' | 'generating' | 'result' | 'error';

@Injectable({
    providedIn: 'root'
})
export class SessionStore {
    private geminiService = inject(GeminiService);
    private themeService = inject(ThemeService);

    // State
    // State
    // We assume ThemeService always has at least one theme (base set)
    readonly theme = signal<ThemeConfig>(this.themeService.allThemes()[0]);
    readonly reflectionMode = signal<'full' | 'visual'>('full'); // Renamed from transmissionMode to fit diegetic
    readonly originalImage = signal<string | null>(null);
    readonly visualTags = signal<string[]>([]);

    // Poem Generation
    readonly poemActs = signal<PoemAct[]>([]);
    readonly currentActIndex = signal<number>(0);
    readonly poemHistory = signal<any[]>([]); // Using any[] to match component needs, ideally fully typed

    // Result
    readonly finalPoem = signal<string>('');
    readonly stylizedImage = signal<string | null>(null);
    readonly generatedPrompt = signal<string>('');
    readonly promptVersion = signal<string>('');

    // Error
    readonly errorMessage = signal<string>('Something went wrong.');

    // Computed
    readonly isReadyForPoem = computed(() => !!this.originalImage() && this.poemActs().length > 0);
    readonly hasArtifact = computed(() => !!this.stylizedImage());

    // Cache
    readonly artifactCache = signal<Map<string, Artifact>>(new Map());

    private readonly STORAGE_KEY_MODE = 'ptm_reflection_mode';

    constructor() {
        // Load persisted state
        const savedMode = localStorage.getItem(this.STORAGE_KEY_MODE);
        if (savedMode === 'full' || savedMode === 'visual') {
            this.reflectionMode.set(savedMode);
        }

        // Auto-save on changes
        effect(() => {
            localStorage.setItem(this.STORAGE_KEY_MODE, this.reflectionMode());
        });
    }

    // Actions
    setTheme(themeId: string) {
        // Use ThemeService to find the theme from the unified list
        const found = this.themeService.getTheme(themeId);

        if (found) {
            this.theme.set(found);

            // Check Cache
            const cached = this.artifactCache().get(themeId);
            if (cached) {
                console.log(`[SessionStore] Restoring cached artifact for ${themeId}`);
                this.stylizedImage.set(cached.imageUrl);
                this.generatedPrompt.set(cached.prompt);
                this.promptVersion.set(cached.version);
                this.finalPoem.set(cached.poem);
            } else {
                // Clear artifact signals if no cache (clean slate for new theme)
                this.stylizedImage.set(null);
                this.generatedPrompt.set('');
                this.finalPoem.set('');
            }
        }
    }

    setReflectionMode(mode: 'full' | 'visual') {
        this.reflectionMode.set(mode);
    }

    setImage(base64: string) {
        this.originalImage.set(base64);
    }

    setAnalysis(acts: PoemAct[], tags: string[]) {
        this.poemActs.set(acts);
        this.visualTags.set(tags);
    }

    addPoemLine(line: any) {
        this.poemHistory.update(prev => [...prev, line]);
    }

    finalizePoem() {
        const history = this.poemHistory();
        const finalPoemStr = history
            .map(line => {
                const cleanPrefix = line.prefix.replace(/_{2,}/g, '').trim();
                const sep = new RegExp('^[\\.,;:\\?!]').test(line.suffix) ? '' : ' ';
                let fullLine = `${cleanPrefix} [${line.userInput}]${sep}${line.suffix}`.trim();

                // Ensure line ends with punctuation
                const hasPunctuation = /[.!?]$/.test(fullLine) || /[.!?]\]$/.test(fullLine);
                if (!hasPunctuation) {
                    fullLine += '.';
                }
                return fullLine;
            })
            .join('\n');
        this.finalPoem.set(finalPoemStr);
        this.updateCache(); // Auto-update cache on finalization
    }

    updateArtifactImage(image: string, prompt: string) {
        this.stylizedImage.set(image);
        this.generatedPrompt.set(prompt);
        this.updateCache(); // Auto-update cache on image update
    }

    setFinalPoem(poem: string) {
        this.finalPoem.set(poem);
        this.updateCache(); // Auto-update cache on poem edit
    }

    // Helper to sync current state to cache
    private updateCache() {
        const themeId = this.theme().id;
        const image = this.stylizedImage();
        const poem = this.finalPoem();

        // Cache as soon as we have an image (poem can be empty/in-progress)
        if (image) {
            this.artifactCache.update(map => {
                const newMap = new Map(map);
                newMap.set(themeId, {
                    themeId,
                    imageUrl: image,
                    poem: poem || '', // Allow empty poems
                    prompt: this.generatedPrompt(),
                    version: this.promptVersion(),
                    timestamp: Date.now()
                });
                return newMap;
            });
        }
    }

    setArtifact(image: string, prompt: string, version: string, poem: string) {
        this.stylizedImage.set(image);
        this.generatedPrompt.set(prompt);
        this.promptVersion.set(version);
        this.finalPoem.set(poem);
        this.updateCache();
    }

    getCachedArtifact(themeId: string): Artifact | undefined {
        return this.artifactCache().get(themeId);
    }

    setError(msg: string) {
        this.errorMessage.set(msg);
    }

    reset() {
        // Keep current mode and theme, just reset session data
        this.originalImage.set(null);
        this.poemActs.set([]);
        this.poemHistory.set([]);
        this.visualTags.set([]);
        this.stylizedImage.set(null);
        this.generatedPrompt.set('');
        this.finalPoem.set('');
        this.currentActIndex.set(0);
        this.errorMessage.set('');
    }
}
