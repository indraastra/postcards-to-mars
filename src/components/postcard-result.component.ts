import { Component, input, signal, effect, ElementRef, ViewChild } from '@angular/core';

interface TextSegment {
  text: string;
  isHighlight: boolean;
}

@Component({
  selector: 'app-postcard-result',
  template: `
    <div class="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-fade-in pb-12">
      
      <div class="mb-8 text-center space-y-2 opacity-90">
        <h2 class="text-xl font-mono text-rose-500 tracking-widest uppercase">Encryption Complete</h2>
        <p class="text-[10px] text-gray-400 font-mono">ARTIFACT_ID: {{ randomId }}</p>
      </div>

      <!-- The Card Container (Preview) -->
      <div class="relative bg-[#f4f1ea] p-5 pb-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transform rotate-1 transition-transform hover:rotate-0 duration-700 max-w-sm w-full mx-auto rounded-sm border border-white/10">
        
        <!-- Header text on card -->
        <div class="w-full text-center mb-4 pt-2">
          <span class="font-sans font-bold text-[#1a1a1d]/60 uppercase text-[10px] tracking-[0.3em] border-b border-[#1a1a1d]/20 pb-1">Postcards To Mars</span>
        </div>

        <!-- Main Art Image Area -->
        <div class="bg-white p-2 shadow-inner mb-6">
           <div class="aspect-square w-full bg-zinc-100 overflow-hidden relative grayscale-[0.1] contrast-105 sepia-[0.15]">
            @if (stylizedImageSrc()) {
              <img [src]="stylizedImageSrc()" class="w-full h-full object-cover" alt="AI Art" (load)="onImageLoad()">
            } @else {
              <div class="w-full h-full flex flex-col items-center justify-center bg-zinc-200 text-zinc-400 gap-2">
                <div class="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-[10px] uppercase tracking-widest">Developing...</span>
              </div>
            }
            <div class="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" 
                 style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E');">
            </div>
          </div>
        </div>

        <!-- The Poem Preview -->
        <div class="px-3 text-left">
          <div class="font-serif text-[#1a1a1d] text-lg leading-relaxed italic whitespace-pre-wrap pl-4 border-l-2 border-rose-900/10 mb-8" [innerHTML]="formattedPoemHtml()">
          </div>
          
          <!-- Footer Metadata -->
          <div class="flex justify-between items-end border-t border-[#1a1a1d]/10 pt-3">
            <div class="flex flex-col">
               <p class="text-[8px] text-[#1a1a1d]/60 tracking-widest uppercase font-sans">Origin</p>
               <p class="text-[10px] text-[#1a1a1d]/80 tracking-widest uppercase font-sans font-bold">Earth (Lost)</p>
            </div>
            <div class="flex flex-col items-end">
              <p class="text-[8px] text-[#1a1a1d]/60 tracking-widest uppercase font-sans">Date</p>
              <p class="text-[10px] text-[#1a1a1d]/80 tracking-widest uppercase font-sans">{{ dateDisplay }}</p>
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
  `]
})
export class PostcardResultComponent {
  poem = input.required<string>();
  stylizedImageSrc = input.required<string | null>();
  
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  imageLoaded = false;
  dateDisplay = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  randomId = Math.floor(Math.random() * 90000) + 10000;

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
          text: 'A memory from Earth, encrypted for the colony.'
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
    const padding = 80;
    const topMargin = 140; 
    const imgSize = width - (padding * 2);

    // Image Border
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;
    ctx.fillRect(padding - 20, topMargin - 20, imgSize + 40, imgSize + 40);
    ctx.shadowColor = "transparent";

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
    
    ctx.drawImage(img, sourceX, sourceY, sourceSide, sourceSide, padding, topMargin, imgSize, imgSize);
    ctx.filter = 'none';

    // 4. Text - Shrink to Fit Logic
    const textAreaY = topMargin + imgSize + 60;
    const footerY = height - 120;
    const maxTextHeight = footerY - textAreaY - 20;
    const textWidth = width - (padding * 2);
    const textX = padding;

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

      let cursorX = 0; // Relative to textX
      let cursorY = lineHeight; // Relative to textAreaY
      let currentLineWords: any[] = [];
      let lines = [];
      let overflow = false;

      for (const word of words) {
        if (word.text === '\n') {
           lines.push({ words: currentLineWords, y: cursorY });
           currentLineWords = [];
           cursorX = 0;
           cursorY += lineHeight * 1.2; // Paragraph gap
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
    ctx.moveTo(textX - 25, startY + 10);
    const contentHeight = finalLines.length > 0 ? finalLines[finalLines.length-1].y : 0;
    ctx.lineTo(textX - 25, startY + contentHeight);
    ctx.stroke();

    for (const line of finalLines) {
      for (const w of line.words) {
         ctx.font = w.highlight 
             ? `italic 600 ${fontSize}px "Playfair Display", serif`
             : `italic 400 ${fontSize}px "Playfair Display", serif`;
         ctx.fillStyle = w.highlight ? '#9f1239' : '#1a1a1d';
         ctx.fillText(w.text, textX + w.x, startY + line.y - (lineHeight * 0.2)); // Adjust baseline slightly
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
    ctx.fillText(`ARCHIVE ID: ${this.randomId}`, width - padding, footerY + 20);

    // 6. Texture
    this.drawGrain(ctx, width, height);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.90));
  }

  parsePoemToWords(rawPoem: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const lines = rawPoem.split(/\r?\n/);

    lines.forEach((line, index) => {
       const regex = /\[(.*?)\]/g;
       let lastIndex = 0;
       let match;
       
       const addWords = (str: string, isHigh: boolean) => {
          const w = str.split(' ').filter(s => s.length > 0);
          w.forEach(word => segments.push({ text: word, isHighlight: isHigh }));
       };

       while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
             addWords(line.substring(lastIndex, match.index), false);
          }
          addWords(match[1], true);
          lastIndex = regex.lastIndex;
       }

       if (lastIndex < line.length) {
          addWords(line.substring(lastIndex), false);
       }

       if (index < lines.length - 1) {
          segments.push({ text: '\n', isHighlight: false });
       }
    });
    return segments;
  }

  drawGrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    ctx.globalAlpha = 0.05; 
    ctx.fillStyle = '#1a1a1d';
    for (let i = 0; i < 40000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  }
}