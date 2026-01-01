import { Component, input, output, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TextSegment {
  text: string;
  isHighlight: boolean;
}

@Component({
  selector: 'app-postcard-result',
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[80vh] p-4 pt-24 animate-fade-in pb-12">
      
      <div class="mb-8 text-center space-y-2 opacity-90">
        <h2 class="text-xl font-mono text-rose-500 tracking-widest uppercase">Transmission Complete</h2>
        <p class="text-[10px] text-gray-400 font-mono">ARTIFACT_ID: {{ randomId }}</p>
      </div>

      <!-- The Card Container (Preview) -->
      <!-- Added p-5 back to create the paper margin around the image -->
      <div class="relative bg-[#f4f1ea] p-5 pb-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transform rotate-1 transition-transform hover:rotate-0 duration-700 max-w-sm w-full mx-auto rounded-sm border border-white/10 group">
        
        <!-- Header text on card -->
        <div class="w-full text-center mb-4 pt-2">
          <span class="font-sans font-bold text-[#1a1a1d]/60 uppercase text-[10px] tracking-[0.3em] border-b border-[#1a1a1d]/20 pb-1">Postcards To Mars</span>
        </div>

        <!-- Main Art Image Area -->
        <!-- Image sits inside the parent padding. Added shadow-lg for depth. -->
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
                 <span class="text-[10px] uppercase tracking-widest">Developing...</span>
              </div>
            }

            @if (isRegenerating()) {
               <div class="absolute inset-0 flex items-center justify-center z-10">
                 <div class="bg-black/80 backdrop-blur-sm px-4 py-3 rounded border border-rose-500/50 flex flex-col items-center gap-2 shadow-lg">
                   <!-- Linear Loader for Regeneration -->
                   <div class="w-8 h-[2px] bg-rose-900/50 relative overflow-hidden rounded-full">
                      <div class="absolute h-full bg-rose-500 animate-progress"></div>
                   </div>
                   <span class="text-[9px] font-mono text-rose-400 tracking-widest uppercase">Tuning Signal...</span>
                 </div>
               </div>
            }

            <div class="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" 
                 style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E');">
            </div>
          </div>
          
          <!-- Tune Signal Button -->
          <button 
             (click)="openEditor()"
             [disabled]="isRegenerating()"
             class="absolute -bottom-3 right-2 bg-black/80 hover:bg-rose-900/90 text-gray-400 hover:text-white text-[9px] font-mono uppercase tracking-widest px-2 py-1 border border-gray-700 hover:border-rose-500 transition-colors z-20 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            [ Tune_Signal_Data ]
          </button>
        </div>

        <!-- The Poem Preview -->
        <!-- Removed extra horizontal padding to align text with image edge -->
        <div class="px-1 text-left">
          <div class="font-serif text-[#1a1a1d] text-lg leading-relaxed italic whitespace-pre-wrap pl-4 border-l-2 border-rose-900/10 mb-8" [innerHTML]="formattedPoemHtml()">
          </div>
          
          <!-- Footer Metadata -->
          <div class="flex justify-between items-end border-t border-[#1a1a1d]/10 pt-3">
            <div class="flex flex-col">
               <p class="text-[8px] text-[#1a1a1d]/60 tracking-widest uppercase font-sans">Origin</p>
               <p class="text-[10px] text-[#1a1a1d]/80 tracking-widest uppercase font-sans font-bold">Earth (Lost)</p>
            </div>
            <div class="flex flex-col items-end">
              <p class="text-[8px] text-[#1a1a1d]/60 tracking-widest uppercase font-sans">Archive ID</p>
              <p class="text-[10px] text-[#1a1a1d]/80 tracking-widest uppercase font-sans">
                {{ randomId }} <span class="opacity-50 mx-1">|</span> {{ version() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="mt-8 w-full max-w-sm flex flex-col items-center gap-4 z-10">
        <button 
          (click)="share()"
          class="w-full flex items-center justify-center gap-3 bg-rose-700 hover:bg-rose-600 text-white px-6 py-4 rounded-sm shadow-lg shadow-rose-900/40 transition-all font-mono uppercase tracking-widest text-xs group"
        >
          <span class="group-hover:animate-pulse">●</span> Upload to Uplink
        </button>
        
        <button 
          (click)="download()"
          class="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          [ Save to Local Drive ]
        </button>
      </div>

      <!-- Prompt Editor Modal -->
      @if (showEditor()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
           <div class="w-full max-w-lg bg-[#0f0f11] border border-rose-900/40 p-1 shadow-2xl shadow-rose-900/20">
              <div class="bg-[#1a1a1d] p-4 flex flex-col gap-4">
                 <div class="flex justify-between items-center border-b border-rose-900/30 pb-2">
                    <h3 class="text-rose-500 font-mono text-xs tracking-widest uppercase">/// VISUAL_DATA_OVERRIDE ///</h3>
                    <button (click)="closeEditor()" class="text-gray-500 hover:text-white font-mono text-xs">[X]</button>
                 </div>
                 
                 <div class="relative">
                    <textarea 
                      [(ngModel)]="editablePrompt" 
                      class="w-full h-64 bg-black border border-gray-800 p-3 font-mono text-[11px] text-gray-300 focus:outline-none focus:border-rose-500/50 leading-relaxed resize-none custom-scrollbar"
                      spellcheck="false"
                    ></textarea>
                    <div class="absolute bottom-2 right-2 text-[9px] text-gray-600 font-mono pointer-events-none">RAW_DATA_INPUT</div>
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
                       class="flex-1 py-3 bg-rose-900/20 hover:bg-rose-900/40 border border-rose-800/50 text-rose-400 font-mono text-[10px] uppercase tracking-widest transition-colors"
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
  poem = input.required<string>();
  stylizedImageSrc = input.required<string | null>();
  imagePrompt = input<string>(''); // The full prompt used
  isRegenerating = input<boolean>(false);
  version = input<string>('SEQ-84.X'); // Diegetic Version
  
  regenerate = output<string>(); // Emits new prompt
  
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  imageLoaded = false;
  dateDisplay = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  randomId = Math.floor(Math.random() * 90000) + 10000;

  // Editor State
  showEditor = signal(false);
  editablePrompt = signal('');

  constructor() {
    effect(() => {
        // Sync editable prompt when input changes, but only if not currently editing
        if (!this.showEditor() && this.imagePrompt()) {
            this.editablePrompt.set(this.imagePrompt());
        }
    });
  }

  openEditor() {
    this.editablePrompt.set(this.imagePrompt());
    this.showEditor.set(true);
  }

  closeEditor() {
    this.showEditor.set(false);
  }

  submitRegeneration() {
    this.showEditor.set(false);
    this.regenerate.emit(this.editablePrompt());
  }

  onImageLoad() {
    this.imageLoaded = true;
  }

  formattedPoemHtml() {
    let html = this.poem().replace(/\[(.*?)\]/g, '<span class="text-rose-800 font-medium">$1</span>');
    return html;
  }

  async share() {
    const blob = await this.bakeImage();
    if (!blob) return;

    const file = new File([blob], 'postcard_to_mars.jpg', { type: 'image/jpeg' });

    if (navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: 'Postcard from Mars',
          text: 'A memory from Earth, transmitted to the Mars colony.'
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
    a.download = `postcard_mars_${this.randomId}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private parsePoemToWords(poem: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const lines = poem.split('\n');

    lines.forEach((line, lineIndex) => {
      // Split by brackets to find highlighted parts
      // Example: "Text [Highlight] Text" -> ["Text ", "[Highlight]", " Text"]
      const parts = line.split(/(\[.*?\])/g);

      parts.forEach(part => {
        if (!part) return;

        const isHighlight = part.startsWith('[') && part.endsWith(']');
        const content = isHighlight ? part.slice(1, -1) : part;

        // Split content by whitespace to get individual words
        const words = content.trim().split(/\s+/);

        words.forEach(word => {
            if (!word) return;
            segments.push({ text: word, isHighlight });
        });
      });

      // Add newline segment if this isn't the last line
      if (lineIndex < lines.length - 1) {
        segments.push({ text: '\n', isHighlight: false });
      }
    });

    return segments;
  }

  private drawGrain(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Simple noise algorithm
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30; // Intensity
      
      data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
      data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise)); // G
      data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise)); // B
      // data[i+3] is Alpha, leave it alone
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  async bakeImage(): Promise<Blob | null> {
    if (!this.stylizedImageSrc() || !this.imageLoaded) return null;
    await document.fonts.ready;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dimensions
    const width = 1200;
    const height = 1800;
    canvas.width = width;
    canvas.height = height;

    // 1. Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f4f1ea');
    gradient.addColorStop(1, '#e8e4db');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Header
    const headerY = 80;
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(26, 26, 29, 0.5)';
    // @ts-ignore
    ctx.letterSpacing = '8px';
    ctx.fillText('POSTCARDS TO MARS', width / 2, headerY);
    // @ts-ignore
    ctx.letterSpacing = '0px';

    // 3. Image
    // Padding 60 matches the approx 5% padding in the UI (p-5 on ~400px card)
    const padding = 60; 
    const topMargin = 160; 
    const imgSize = width - (padding * 2);

    // Draw Image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.stylizedImageSrc()!;
    await new Promise(resolve => {
        if (img.complete) resolve(true);
        img.onload = () => resolve(true);
    });

    ctx.filter = 'grayscale(10%) contrast(105%) sepia(15%)';
    
    // Center Crop
    let sourceX = 0, sourceY = 0, sourceSide = 0;
    if (img.width > img.height) {
        sourceSide = img.height;
        sourceX = (img.width - img.height) / 2;
    } else {
        sourceSide = img.width;
        sourceY = (img.height - img.width) / 2;
    }
    
    // Add Drop Shadow to the generated image in Canvas to match UI
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    
    ctx.drawImage(img, sourceX, sourceY, sourceSide, sourceSide, padding, topMargin, imgSize, imgSize);
    
    ctx.restore();
    ctx.filter = 'none';

    // 4. Text - Shrink to Fit Logic
    const textBorderX = padding + 15;
    const textContentX = textBorderX + 45;
    const textWidth = (width - padding) - textContentX; // Align right side with image right
    
    const textAreaY = topMargin + imgSize + 60;
    const footerY = height - 120;
    const maxTextHeight = footerY - textAreaY - 20;

    // Reset settings
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#1a1a1d';

    const words = this.parsePoemToWords(this.poem());
    
    // Start large, shrink until it fits
    let fontSize = 48;
    const minFontSize = 18;
    let finalLines: { words: any[], y: number }[] = [];
    let lineHeight = 0;

    // Iterative layout calculation to find best fit
    while (fontSize >= minFontSize) {
      lineHeight = fontSize * 1.5;
      
      // Measure space
      ctx.font = `italic 400 ${fontSize}px "Playfair Display", serif`;
      const spaceW = ctx.measureText(' ').width;

      let cursorX = 0; // Relative to textContentX
      let cursorY = lineHeight; // Relative to textAreaY
      let currentLineWords: any[] = [];
      let lines = [];

      for (const word of words) {
        if (word.text === '\n') {
           lines.push({ words: currentLineWords, y: cursorY });
           currentLineWords = [];
           cursorX = 0;
           cursorY += lineHeight; // Standard line break spacing for newline
           continue;
        }

        ctx.font = word.isHighlight 
             ? `italic 600 ${fontSize}px "Playfair Display", serif`
             : `italic 400 ${fontSize}px "Playfair Display", serif`;
        
        const wMetric = ctx.measureText(word.text);
        
        if (cursorX + wMetric.width > textWidth) {
           // Wrap
           lines.push({ words: currentLineWords, y: cursorY });
           currentLineWords = [];
           cursorX = 0;
           cursorY += lineHeight;
        }

        currentLineWords.push({ 
           text: word.text, 
           x: cursorX, // relative
           highlight: word.isHighlight 
        });
        
        cursorX += wMetric.width + spaceW;
      }
      
      if (currentLineWords.length > 0) {
        lines.push({ words: currentLineWords, y: cursorY });
      }

      // Check height
      const totalHeight = cursorY; // Since cursorY is at baseline of last line approx
      
      if (totalHeight <= maxTextHeight) {
         finalLines = lines;
         break; // It fits!
      }
      
      fontSize -= 2;
    }

    // Draw the calculated lines
    const startY = textAreaY;
    
    // Decorative Left Line
    ctx.beginPath();
    ctx.strokeStyle = "rgba(136, 19, 55, 0.2)";
    ctx.lineWidth = 4;
    ctx.moveTo(textBorderX, startY + 10);
    const contentHeight = finalLines.length > 0 ? finalLines[finalLines.length-1].y : 0;
    ctx.lineTo(textBorderX, startY + contentHeight);
    ctx.stroke();

    for (const line of finalLines) {
      for (const w of line.words) {
         ctx.font = w.highlight 
             ? `italic 600 ${fontSize}px "Playfair Display", serif`
             : `italic 400 ${fontSize}px "Playfair Display", serif`;
         ctx.fillStyle = w.highlight ? '#9f1239' : '#1a1a1d';
         ctx.fillText(w.text, textContentX + w.x, startY + line.y - (lineHeight * 0.2)); // Adjust baseline slightly
      }
    }

    // 5. Footer
    ctx.beginPath();
    ctx.moveTo(padding, footerY);
    ctx.lineTo(width - padding, footerY);
    ctx.strokeStyle = "rgba(26, 26, 29, 0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '500 20px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(26, 26, 29, 0.7)';
    // @ts-ignore
    ctx.letterSpacing = '1px';
    ctx.fillText(`ORIGIN: EARTH (LOST)`, padding, footerY + 20);
    
    ctx.textAlign = 'right';
    // Display both ID and Diegetic Version
    ctx.fillText(`ID: ${this.randomId} // ${this.version()}`, width - padding, footerY + 20);

    // 6. Texture
    this.drawGrain(ctx, width, height);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.90));
  }
}