import { Injectable, signal, computed, inject } from '@angular/core';
import { PoemAct, Artifact, GeminiService } from '../services/gemini.service';
import { ThemeConfig, THEMES } from '../core/theme.config';

export type AppState = 'landing' | 'analyzing' | 'dialogue' | 'generating' | 'result' | 'error';

@Injectable({
    providedIn: 'root'
})
export class SessionStore {
    private geminiService = inject(GeminiService);

    // State
    readonly theme = signal<ThemeConfig>(THEMES[0]);
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

    // Actions
    setTheme(themeId: string) {
        const found = THEMES.find(t => t.id === themeId);
        if (found) {
            this.theme.set(found);
            this.geminiService.activeTheme.set(found);
        }
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
    }

    updateArtifactImage(image: string, prompt: string) {
        this.stylizedImage.set(image);
        this.generatedPrompt.set(prompt);
    }

    setFinalPoem(poem: string) {
        this.finalPoem.set(poem);
    }

    setArtifact(image: string, prompt: string, version: string, poem: string) {
        this.stylizedImage.set(image);
        this.generatedPrompt.set(prompt);
        this.promptVersion.set(version);
        this.finalPoem.set(poem);
    }

    setError(msg: string) {
        this.errorMessage.set(msg);
    }

    reset() {
        this.originalImage.set(null);
        this.poemActs.set([]);
        this.poemHistory.set([]);
        this.visualTags.set([]);
        this.stylizedImage.set(null);
        this.generatedPrompt.set('');
        this.finalPoem.set('');
        this.currentActIndex.set(0);
        this.errorMessage.set('');
        this.geminiService.clearCache();
    }
}
