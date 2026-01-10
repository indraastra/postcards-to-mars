import { Component, input, output, signal, effect, ElementRef, ViewChild, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GeminiService } from '../services/gemini.service';

interface TextSegment {
  text: string;
  isHighlight: boolean;
}

@Component({
  selector: 'app-postcard-result',
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      class="flex flex-col items-center justify-center w-full animate-fade-in"
      [style.--theme-primary]="theme().visualStyle.primaryColor"
      [style.--theme-bg]="theme().visualStyle.backgroundColor"
      [style.--theme-text]="theme().visualStyle.textColor"
      [style.--font-header]="theme().visualStyle.fontFamilyHeader"
      [style.--font-body]="theme().visualStyle.fontFamilyBody"
    >
      


      <!-- The Card Container (Preview) -->
      <div 
        class="relative p-5 pb-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transform rotate-1 transition-transform hover:rotate-0 duration-700 max-w-sm w-full mx-auto rounded-sm border border-white/10 group bg-[var(--theme-bg)]"
      >
        
        <!-- Header text on card -->
        <div class="w-full text-center mb-4 pt-2">
          <span 
            class="font-bold uppercase text-[10px] tracking-[0.3em] border-b pb-1 text-[var(--theme-text)] border-[var(--theme-text)]/40 font-[family-name:var(--font-header)]"
          >
            {{ theme().name }}
          </span>
        </div>

        <!-- Main Art Image Area -->
        <div class="w-full relative shadow-lg mb-6">
           <div class="aspect-square w-full bg-zinc-100 overflow-hidden relative grayscale-[0.1] contrast-105 sepia-[0.15]">
            @if (stylizedImageSrc()) {
              <img [src]="stylizedImageSrc()" class="w-full h-full object-cover transition-opacity duration-500" [class.opacity-50]="isRegenerating()" alt="AI Art" (load)="onImageLoad()">
            } @else {
              <div class="w-full h-full flex flex-col items-center justify-center bg-zinc-200 text-zinc-400 gap-3">
                 <!-- Linear Loader -->
                 <div class="w-12 h-px bg-zinc-300 relative overflow-hidden">
                    <div class="absolute h-full bg-zinc-500 animate-progress"></div>
                 </div>
                  <div class="flex flex-col items-center gap-1">
                     <span class="text-[10px] uppercase tracking-widest font-bold">{{ theme().generatingText }}</span>
                     <span class="text-[10px] uppercase tracking-widest opacity-90 font-medium">{{ loadingMessage() }}</span>
                  </div>
               </div>
            }

            @if (isRegenerating()) {
              <div class="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-fade-in">
                 <div class="w-24 h-px relative overflow-hidden" [style.background-color]="'var(--theme-text)'" style="opacity: 0.2">
                    <div class="absolute h-full animate-progress bg-[var(--theme-primary)]" style="opacity: 1 !important"></div>
                 </div>
                 <p class="text-[10px] tracking-[0.3em] uppercase text-[var(--theme-primary)] animate-pulse">{{ theme().generatingText }}</p>
              </div>
            }

            <div class="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" 
                 style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E');">
            </div>
          </div>
          
          <!-- Tune Signal Button -->
          <button 
             (click)="openEditor('stylisation')"
             [disabled]="isRegenerating()"
             class="absolute -bottom-3 right-2 bg-black/80 text-gray-400 hover:text-white text-[9px] font-mono uppercase tracking-widest px-2 py-1 border border-gray-700 transition-colors z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:border-[var(--theme-primary)]"
          >
            [ {{ theme().regenLabel }} ]
          </button>
        </div>

        <!-- The Poem Preview -->
        <div class="px-1 text-left">
           <div 
              class="text-lg leading-relaxed italic whitespace-pre-wrap pl-4 border-l-2 mb-8 font-[family-name:var(--font-body)] text-[var(--theme-text)] border-[var(--theme-primary)]/40 relative group/poem"
              [innerHTML]="safePoemHtml()">
           </div>
           
           <!-- Poem Editor Button (Moved here) -->
           <button 
              (click)="openEditor('poem')"
              class="absolute bottom-24 right-6 bg-[var(--theme-bg)]/80 backdrop-blur-sm text-[var(--theme-text)] hover:text-[var(--theme-primary)] text-[9px] font-mono uppercase tracking-widest px-2 py-1 border border-[var(--theme-text)]/20 transition-colors z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:border-[var(--theme-primary)]"
           >
             [ {{ theme().editPoemLabel }} ]
           </button>
          
          <!-- Footer Metadata -->
          <div class="flex justify-between items-end border-t pt-3 border-[var(--theme-text)]/20">
            <div class="flex flex-col">
               <p class="text-[8px] tracking-widest uppercase font-sans text-[var(--theme-text)]/60">{{ theme().originLabel }}</p>
               <p class="text-[10px] tracking-widest uppercase font-sans font-bold text-[var(--theme-text)]">{{ theme().postcardOrigin }}</p>
            </div>
            <div class="flex flex-col items-end">
              <p class="text-[8px] tracking-widest uppercase font-sans text-[var(--theme-text)]/60">{{ theme().idLabel }}</p>
              <p class="text-[10px] tracking-widest uppercase font-sans text-[var(--theme-text)]">
                {{ randomId }} <span class="opacity-50 mx-1">|</span> {{ version() }}
              </p>
            </div>
          </div>
        </div>
        </div>

      <!-- Controls -->
      <div class="mt-8 mb-20 w-full max-w-sm flex flex-col items-center gap-3 z-10">
        <button 
          (click)="share()"
          class="w-full flex items-center justify-center gap-3 text-white px-6 py-3 rounded-sm shadow-lg transition-all font-mono uppercase tracking-widest text-[10px] group bg-[var(--theme-primary)] hover:opacity-90 shadow-[var(--theme-primary)]/40"
        >
          <span class="group-hover:animate-pulse">●</span> Upload to Uplink
        </button>
        
        <button 
          (click)="download()"
          class="w-full border border-gray-700 hover:border-[var(--theme-primary)] text-gray-400 hover:text-[var(--theme-primary)] px-6 py-3 rounded-sm font-mono uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
        >
          Save to Local Drive
        </button>
      </div>

      <!-- Prompt Editor Modal -->
      @if (showEditor()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
           <div class="w-full max-w-lg bg-[#0f0f11] border p-1 shadow-2xl border-[var(--theme-primary)]/40">
              <div class="bg-[#1a1a1d] p-4 flex flex-col gap-4">
                 <div class="flex justify-between items-center border-b pb-2 border-[var(--theme-primary)]/30">
                    <h3 class="font-mono text-xs tracking-widest uppercase text-[var(--theme-primary)]">
                      /// {{ editorMode() === 'stylisation' ? 'VISUAL_DATA_OVERRIDE' : 'MESSAGE_LOG_OVERRIDE' }} ///
                    </h3>
                    <button (click)="closeEditor()" class="text-gray-500 hover:text-white font-mono text-xs">[X]</button>
                 </div>
                                 <div class="relative">
                    @if (editorMode() === 'stylisation') {
                      <textarea 
                        [(ngModel)]="editablePrompt" 
                        class="w-full h-64 bg-black border border-gray-800 p-3 font-mono text-[11px] text-gray-300 focus:outline-none leading-relaxed resize-none custom-scrollbar focus:border-[var(--theme-primary)]/50"
                        spellcheck="false"
                      ></textarea>
                      <div class="absolute bottom-2 right-2 text-[9px] text-gray-600 font-mono pointer-events-none">RAW_DATA_INPUT</div>
                    } @else {
                      <textarea 
                        [(ngModel)]="editablePoem" 
                        class="w-full h-64 bg-black border border-gray-800 p-3 font-serif italic text-lg text-gray-300 focus:outline-none leading-relaxed resize-none custom-scrollbar focus:border-[var(--theme-primary)]/50"
                        spellcheck="false"
                      ></textarea>
                      <div class="absolute bottom-2 right-2 text-[9px] text-gray-600 font-mono pointer-events-none">LOG_ENTRY_INPUT</div>
                    }
                 </div>

                 <div class="flex gap-2 pt-2">
                    <button 
                       (click)="closeEditor()"
                       class="flex-1 py-3 border border-gray-700 hover:bg-gray-800 text-gray-400 font-mono text-[10px] uppercase tracking-widest transition-colors"
                    >
                       Cancel
                    </button>
                    <button 
                       (click)="submitRegeneration()"
                       class="flex-1 py-3 border font-mono text-[10px] uppercase tracking-widest transition-colors bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/50 text-[var(--theme-primary)]"
                    >
                       Execute_Changes
                    </button>
                 </div>
              </div>
           </div>
        </div>
      }

      <canvas #canvas class="hidden"></canvas>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 1s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-progress {
      animation: progress 2s ease-in-out infinite;
    }
    @keyframes progress {
      0% { width: 0%; transform: translateX(-100%); }
      50% { width: 100%; transform: translateX(0); }
      100% { width: 0%; transform: translateX(100%); }
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #333;
    }
  `]
})
export class PostcardResultComponent {
  geminiService = inject(GeminiService);
  sanitizer = inject(DomSanitizer);
  theme = this.geminiService.activeTheme;

  poem = input.required<string>();
  stylizedImageSrc = input.required<string | null>();
  imagePrompt = input<string>('');
  isRegenerating = input<boolean>(false);
  version = input<string>('SEQ-84.X');

  regenerate = output<string>();
  poemChange = output<string>();

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  imageLoaded = false;
  dateDisplay = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  randomId = Math.floor(Math.random() * 90000) + 10000;

  // Editor State
  showEditor = signal(false);
  editorMode = signal<'stylisation' | 'poem'>('stylisation');
  editablePrompt = signal('');
  editablePoem = signal('');

  // Loading State
  loadingMessage = signal('Developing...');
  loadingInterval: any;

  safePoemHtml = computed(() => {
    const color = this.theme().visualStyle.primaryColor;
    const html = this.poem().replace(/\[(.*?)\]/g, `<span style="color: ${color}; font-weight: 600;">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  constructor() {
    effect(() => {
      if (!this.showEditor() && this.imagePrompt()) {
        this.editablePrompt.set(this.imagePrompt());
      }
    });

    // Start loading cycle
    this.startLoadingCycle();
  }

  ngOnDestroy() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }
  }

  startLoadingCycle() {
    let index = 0;
    const messages = this.theme().loadingMessages || ['Developing...'];

    // Initial set
    this.loadingMessage.set(messages[0]);

    this.loadingInterval = setInterval(() => {
      index = (index + 1) % messages.length;
      this.loadingMessage.set(messages[index]);
    }, 600);
  }

  openEditor(mode: 'stylisation' | 'poem') {
    this.editorMode.set(mode);
    if (mode === 'stylisation') {
      const currentPrompt = this.imagePrompt();
      const poemContext = `\n\nMatch the image to this poem:\n${this.poem()}`;

      // Only append if not already there to avoid duplication on repeated opens
      if (!currentPrompt.includes('Match the image to this poem:')) {
        this.editablePrompt.set(currentPrompt + poemContext);
      } else {
        this.editablePrompt.set(currentPrompt);
      }
    } else {
      this.editablePoem.set(this.poem());
    }
    this.showEditor.set(true);
  }

  closeEditor() {
    this.showEditor.set(false);
  }

  submitRegeneration() {
    this.showEditor.set(false);

    if (this.editorMode() === 'stylisation') {
      this.regenerate.emit(this.editablePrompt());
    } else {
      this.poemChange.emit(this.editablePoem());
    }
  }

  onImageLoad() {
    this.imageLoaded = true;
  }

  async share() {
    const blob = await this.bakeImage();
    if (!blob) return;

    const file = new File([blob], 'postcard.jpg', { type: 'image/jpeg' });

    if (navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: this.theme().name,
          text: 'A memory artifact.'
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      this.download();
    }
  }

  async download() {
    const blob = await this.bakeImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postcard_${this.theme().id}_${this.randomId}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private parsePoemToWords(poem: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const lines = poem.split('\n');

    lines.forEach((line, lineIndex) => {
      const parts = line.split(/(\[.*?\])/g);
      parts.forEach(part => {
        if (!part) return;
        const isHighlight = part.startsWith('[') && part.endsWith(']');
        const content = isHighlight ? part.slice(1, -1) : part;
        const words = content.trim().split(/\s+/);
        words.forEach(word => {
          if (!word) return;
          segments.push({ text: word, isHighlight });
        });
      });
      if (lineIndex < lines.length - 1) {
        segments.push({ text: '\n', isHighlight: false });
      }
    });
    return segments;
  }

  private drawGrain(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
  }

  async bakeImage(): Promise<Blob | null> {
    if (!this.stylizedImageSrc() || !this.imageLoaded) return null;
    await document.fonts.ready;

    const theme = this.theme().visualStyle;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const width = 1200;
    const height = 1800;
    canvas.width = width;
    canvas.height = height;

    // 1. Background
    ctx.fillStyle = theme.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Header
    const headerY = 80;
    const fontHeader = theme.fontFamilyHeader.replace(/"/g, '');
    const fontBody = theme.fontFamilyBody.replace(/"/g, '');

    ctx.font = `bold 24px ${fontHeader}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.6;
    // @ts-ignore
    ctx.letterSpacing = '8px';
    ctx.fillText(this.theme().name.toUpperCase(), width / 2, headerY);
    // @ts-ignore
    ctx.letterSpacing = '0px';
    ctx.globalAlpha = 1.0;

    // 3. Image
    const padding = 60;
    const topMargin = 160;
    const imgSize = width - (padding * 2);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.stylizedImageSrc()!;
    await new Promise(resolve => {
      if (img.complete) resolve(true);
      img.onload = () => resolve(true);
    });

    // Add Drop Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    let sourceX = 0, sourceY = 0, sourceSide = 0;
    if (img.width > img.height) {
      sourceSide = img.height;
      sourceX = (img.width - img.height) / 2;
    } else {
      sourceSide = img.width;
      sourceY = (img.height - img.width) / 2;
    }

    ctx.drawImage(img, sourceX, sourceY, sourceSide, sourceSide, padding, topMargin, imgSize, imgSize);
    ctx.restore();

    // 4. Text
    const textBorderX = padding + 15;
    const textContentX = textBorderX + 45;
    const textWidth = (width - padding) - textContentX;

    const textAreaY = topMargin + imgSize + 60;
    const footerY = height - 120;
    const maxTextHeight = footerY - textAreaY - 20;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = theme.textColor;

    const words = this.parsePoemToWords(this.poem());

    let fontSize = 48;
    const minFontSize = 18;
    let finalLines: { words: any[], y: number }[] = [];
    let lineHeight = 0;

    while (fontSize >= minFontSize) {
      lineHeight = fontSize * 1.5;

      ctx.font = `italic 400 ${fontSize}px ${fontBody}`;
      const spaceW = ctx.measureText(' ').width;

      let cursorX = 0;
      let cursorY = lineHeight;
      let currentLineWords: any[] = [];
      let lines = [];

      for (const word of words) {
        if (word.text === '\n') {
          lines.push({ words: currentLineWords, y: cursorY });
          currentLineWords = [];
          cursorX = 0;
          cursorY += lineHeight;
          continue;
        }

        ctx.font = word.isHighlight
          ? `italic 600 ${fontSize}px ${fontBody}`
          : `italic 400 ${fontSize}px ${fontBody}`;

        const wMetric = ctx.measureText(word.text);

        if (cursorX + wMetric.width > textWidth) {
          lines.push({ words: currentLineWords, y: cursorY });
          currentLineWords = [];
          cursorX = 0;
          cursorY += lineHeight;
        }

        currentLineWords.push({
          text: word.text,
          x: cursorX,
          highlight: word.isHighlight
        });

        cursorX += wMetric.width + spaceW;
      }

      if (currentLineWords.length > 0) {
        lines.push({ words: currentLineWords, y: cursorY });
      }

      if (cursorY <= maxTextHeight) {
        finalLines = lines;
        break;
      }
      fontSize -= 2;
    }

    // Draw Lines
    const startY = textAreaY;

    // Decorative Left Line
    ctx.beginPath();
    ctx.strokeStyle = theme.primaryColor;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 4;
    ctx.moveTo(textBorderX, startY + 10);
    const contentHeight = finalLines.length > 0 ? finalLines[finalLines.length - 1].y : 0;
    ctx.lineTo(textBorderX, startY + contentHeight);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    for (const line of finalLines) {
      for (const w of line.words) {
        ctx.font = w.highlight
          ? `italic 600 ${fontSize}px ${fontBody}`
          : `italic 400 ${fontSize}px ${fontBody}`;
        ctx.fillStyle = w.highlight ? theme.primaryColor : theme.textColor;
        ctx.fillText(w.text, textContentX + w.x, startY + line.y - (lineHeight * 0.2));
      }
    }

    // 5. Footer
    ctx.beginPath();
    ctx.moveTo(padding, footerY);
    ctx.lineTo(width - padding, footerY);
    ctx.strokeStyle = theme.textColor;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    ctx.font = '500 20px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.7;
    // @ts-ignore
    ctx.letterSpacing = '1px';
    ctx.fillText(`${this.theme().originLabel.toUpperCase()}: ${this.theme().postcardOrigin.toUpperCase()}`, padding, footerY + 20);

    ctx.textAlign = 'right';
    ctx.fillText(`${this.theme().idLabel.toUpperCase()}: ${this.randomId} // ${this.version()}`, width - padding, footerY + 20);
    ctx.globalAlpha = 1.0;

    // 6. Texture
    this.drawGrain(ctx, width, height);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.90));
  }
}