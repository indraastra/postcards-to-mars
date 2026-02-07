import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ThemeService } from '../services/theme.service';

interface GenerationLog {
    visualModifiers: string;
    promptTemplate: string;
    resultImage: string | null;
    timestamp: Date;
}

@Component({
    selector: 'app-image-debug',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './image-debug.component.html',
})
export class ImageDebugComponent {
    geminiService = inject(GeminiService);
    themeService = inject(ThemeService);

    // Inputs
    uploadedImage = signal<string | null>(null);
    visualModifiers = signal<string>('');
    promptTemplate = signal<string>('Transform this image of {visual_modifiers} into a ...');

    // State
    isAnalyzing = signal(false);
    isGenerating = signal(false);
    logs = signal<GenerationLog[]>([]);

    async onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        this.isAnalyzing.set(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            this.uploadedImage.set(base64);

            // Automatic Analysis
            try {
                // Use default theme for debug analysis
                const defaultTheme = this.themeService.allThemes()[0];
                const analysis = await this.geminiService.analyzeImage(base64, defaultTheme);
                this.visualModifiers.set(analysis.visual_tags.join(', '));
            } catch (err) {
                console.error('Analysis failed', err);
            } finally {
                this.isAnalyzing.set(false);
            }
        };
        reader.readAsDataURL(file);
    }

    async generate() {
        const base64 = this.uploadedImage();
        const modifiers = this.visualModifiers();
        const template = this.promptTemplate();

        if (!base64 || !template) return;

        this.isGenerating.set(true);

        const fullPrompt = template.replace('{visual_modifiers}', modifiers);

        try {
            const resultImage = await this.geminiService.generateImageFromPrompt(base64, fullPrompt);

            this.logs.update(prev => [{
                visualModifiers: modifiers,
                promptTemplate: template,
                resultImage,
                timestamp: new Date()
            }, ...prev]);

        } catch (err) {
            console.error('Generation failed', err);
        } finally {
            this.isGenerating.set(false);
        }
    }
}
