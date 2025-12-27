import { Component, input, output, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface PoemLine {
  prefix: string;
  userInput: string;
  suffix: string;
  fullText: string;
}

@Component({
  selector: 'app-dialogue',
  imports: [FormsModule, CommonModule],
  template: `
    <div class="w-full max-w-lg mx-auto animate-fade-in relative pt-12">
      
      <!-- Background Context (Image) -->
      <!-- Use fixed positioning to cover the entire screen behind the UI -->
      <div class="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <!-- Main Image: visible, slightly blurred, keeping colors for atmosphere -->
        <img [src]="imageSrc()" class="w-full h-full object-cover blur-[2px] opacity-40">
        
        <!-- Gradient overlay to ensure text readability -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
      </div>

      <!-- Dialogue Interface -->
      <div class="relative z-10 flex flex-col items-center justify-center p-4">
        
        <!-- History -->
        <div class="w-full flex flex-col gap-4 mb-12">
           @for (line of history(); track $index) {
              <p class="font-serif italic text-lg text-gray-400 text-center drop-shadow-md">
                {{ line.prefix }} <span class="text-rose-400 font-bold">{{ line.userInput }}</span>{{ needsSpace(line.suffix) ? ' ' : '' }}{{ line.suffix }}
              </p>
           }
        </div>

        <!-- Active Line -->
        @if (loading()) {
           <div class="flex flex-col items-center gap-2 py-8 animate-pulse">
             <span class="text-[10px] font-mono tracking-widest text-rose-500 uppercase">Awaiting Response...</span>
           </div>
        } @else {
           <div class="text-center w-full mb-8">
              <p class="font-serif text-2xl md:text-3xl text-gray-100 leading-tight mb-6 italic drop-shadow-lg">
                "{{ starterParts().prefix }}..."
              </p>
              
              <input 
                type="text" 
                [(ngModel)]="userInput" 
                (keydown.enter)="onSubmit()"
                placeholder="_"
                class="w-full bg-transparent border-b border-rose-900/50 text-center text-xl text-rose-300 placeholder-rose-800/30 focus:outline-none focus:border-rose-500 pb-2 transition-colors font-serif italic drop-shadow-md"
                autofocus
                autocomplete="off"
              />
           </div>

           <!-- Suggestions -->
           @if (suggestions().length > 0) {
             <div class="flex flex-wrap justify-center gap-3 mt-4">
               @for (opt of suggestions(); track $index) {
                 <button 
                   (click)="selectOption(opt)"
                   class="px-3 py-1 bg-black/40 border border-gray-600 backdrop-blur-sm text-xs text-gray-300 hover:border-rose-500 hover:text-rose-400 transition-all font-mono"
                 >
                   {{ opt }}
                 </button>
               }
             </div>
           }
        }
      </div>

      <!-- Action Buttons -->
      <div class="relative z-10 mt-12 pb-8 px-8 flex flex-col gap-4">
         @if (!loading()) {
            <button 
              (click)="onSubmit()"
              [disabled]="!userInput() || userInput().length < 2"
              class="w-full py-4 bg-black/20 hover:bg-rose-900/20 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed text-rose-500 uppercase tracking-[0.2em] text-[10px] font-bold border border-rose-800/60 hover:border-rose-500/80 transition-all shadow-lg"
            >
              {{ isLastLine() ? 'Finalize Transmission' : 'Confirm Input' }}
            </button>
         }

         <!-- Only show the early exit button if it's NOT the last line -->
         @if (!isLastLine() && (history().length > 0 || userInput().length > 1) && !loading()) {
           <button 
             (click)="onFinish()"
             class="w-full text-gray-500 hover:text-gray-300 uppercase tracking-widest text-[10px] font-mono transition-colors drop-shadow-md"
           >
             [ Finalize & Upload ]
           </button>
         }
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class DialogueComponent {
  imageSrc = input.required<string>();
  starterText = input.required<string>(); 
  history = input.required<PoemLine[]>();   
  suggestions = input<string[]>([]);      
  loading = input<boolean>(false);
  isLastLine = input<boolean>(false);
  
  lineCompleted = output<PoemLine>(); 
  finished = output<PoemLine | undefined>();

  userInput = signal('');

  constructor() {
    effect(() => {
      this.starterText(); 
      this.userInput.set('');
    });
  }

  starterParts = computed(() => {
    const text = this.starterText();
    const parts = text.split('____');
    return {
      prefix: parts[0]?.trimEnd() || '...',
      suffix: parts[1]?.trimStart() || ''
    };
  });

  selectOption(opt: string) {
    this.userInput.set(opt);
  }

  needsSpace(text: string): boolean {
    // Returns true if the suffix does NOT start with common punctuation
    return !/^[\.,;:\?!]/.test(text);
  }

  constructCurrentLine(): PoemLine {
    const parts = this.starterParts();
    const inputVal = this.userInput().trim();
    const sep = this.needsSpace(parts.suffix) ? ' ' : '';
    const full = `${parts.prefix} ${inputVal}${sep}${parts.suffix}`;
    
    return {
      prefix: parts.prefix,
      userInput: inputVal,
      suffix: parts.suffix,
      fullText: full
    };
  }

  onSubmit() {
    if (this.userInput().length > 1) {
      this.lineCompleted.emit(this.constructCurrentLine());
    }
  }

  onFinish() {
    if (this.userInput().length > 1) {
       this.finished.emit(this.constructCurrentLine());
    } else {
       this.finished.emit(undefined);
    }
  }
}