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
    <div class="w-full max-w-lg mx-auto animate-fade-in relative pt-4">
      
      <!-- Background Context (Image) -->
      <!-- Use fixed positioning to cover the entire screen behind the UI -->
      <div class="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <!-- Main Image: visible, slightly blurred, keeping colors for atmosphere -->
        <img [src]="imageSrc()" class="w-full h-full object-cover blur-[2px] opacity-40">
        
        <!-- Dark overlay for readability -->
        <div class="absolute inset-0 bg-neutral-950/80"></div>
      </div>

      <!-- Dialogue Interface -->
      <div class="relative z-10 flex flex-col items-center justify-center p-4">
        
        <!-- History -->
        <div class="w-full flex flex-col gap-2 mb-6">
           @for (line of history(); track $index) {
              <p class="italic text-lg text-neutral-400 text-center drop-shadow-md font-[family-name:var(--font-body)]">
                {{ line.prefix }} <span class="font-bold text-[var(--theme-primary)]">{{ line.userInput }}</span>{{ needsSpace(line.suffix) ? ' ' : '' }}{{ line.suffix }}
              </p>
           }
        </div>

        <!-- Active Line -->
        @if (loading()) {
           <div class="flex flex-col items-center gap-2 py-8 animate-pulse font-[family-name:var(--font-header)]">
             <span class="text-[10px] tracking-widest uppercase text-[var(--theme-primary)]">Awaiting Response...</span>
           </div>
        } @else {
            <div class="text-center w-full mb-4">
               <p class="text-2xl md:text-3xl text-white leading-tight mb-6 italic drop-shadow-lg font-[family-name:var(--font-body)]">
                 "{{ starterParts().prefix }} ..."
               </p>
              
              <input 
                type="text" 
                [(ngModel)]="userInput" 
                (keydown.enter)="onSubmit()"
                placeholder="_"
                class="w-full bg-transparent border-b text-center text-xl placeholder-white/20 focus:outline-none pb-2 transition-colors italic drop-shadow-md font-[family-name:var(--font-body)] border-[var(--theme-primary)]/30 focus:border-[var(--theme-primary)] text-[var(--theme-primary)]"
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
                   class="px-3 py-1 bg-white/5 border border-white/10 backdrop-blur-sm text-xs text-neutral-300 transition-all font-mono hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
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
              class="w-full py-4 bg-[var(--theme-primary)]/10 hover:bg-[var(--theme-primary)]/20 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-[10px] font-bold border transition-all shadow-lg text-[var(--theme-primary)] border-[var(--theme-primary)]/60 hover:border-[var(--theme-primary)]/80"
            >
              Confirm Input
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
}