import { Component, inject, signal, effect, ElementRef, ViewChild, computed } from '@angular/core'; // Fixed imports
import { CommonModule } from '@angular/common'; // Fixed imports
import { FormsModule } from '@angular/forms'; // Fixed imports
import { Router } from '@angular/router'; // Fixed imports
import { SessionStore } from '../store/session.store';

export interface PoemLine {
  prefix: string;
  userInput: string;
  suffix: string;
  fullText: string;
}

@Component({
  selector: 'app-dialogue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-lg mx-auto animate-fade-in relative pt-24">

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
              {{ line.prefix }} 
              <span class="font-bold text-[var(--theme-primary)]">{{ line.userInput }}</span>
              {{ needsSpace(line.suffix) ? ' ' : '' }}{{ line.suffix }}
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
                 "{{ starterText() }} ..."
               </p>
              
              <input 
                type="text"
                [(ngModel)]="customLine" 
                (keydown.enter)="submitCustomLine()"
                placeholder="_"
                class="w-full bg-transparent border-b text-center text-xl placeholder-white/20 focus:outline-none pb-2 transition-colors italic drop-shadow-md font-[family-name:var(--font-body)] border-[var(--theme-primary)]/30 focus:border-[var(--theme-primary)] text-[var(--theme-primary)]"
                autofocus
                autocomplete="off"
                #customInput
              />
           </div>

           <!-- Suggestions -->
           @if (suggestions().length > 0) {
             <div class="flex flex-wrap justify-center gap-3 mt-4">
               @for (opt of suggestions(); track $index) {
                 <button 
                   (click)="selectSuggestion(opt)"
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
              (click)="submitCustomLine()"
              [disabled]="!customLine() || customLine().length < 2"
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
  session = inject(SessionStore);
  router = inject(Router);

  // Mapped inputs from store
  imageSrc = this.session.originalImage;
  acts = this.session.poemActs;
  currentActIndex = this.session.currentActIndex;

  // Computed helpers to match original bindings
  currentAct = computed(() => this.acts()[this.currentActIndex()] || { starter: '', suggestions: [] });
  starterText = computed(() => this.currentAct().starter);
  suggestions = computed(() => this.currentAct().suggestions);
  history = this.session.poemHistory;

  loading = signal(false);

  customLine = signal('');
  @ViewChild('customInput') customInput!: ElementRef;

  constructor() {
    effect(() => {
      if (!this.imageSrc()) {
        this.router.navigate(['/']);
      }
    });
  }

  get isLastLine() {
    // 3 acts total
    return this.history().length === 2; // If we have 2 lines, we are on the 3rd (last)
  }

  selectSuggestion(suggestion: string) {
    if (this.loading()) return;
    this.completeLine(suggestion);
  }

  submitCustomLine() {
    if (!this.customLine() || this.loading()) return;
    this.completeLine(this.customLine());
  }

  private completeLine(userInput: string) {
    // Check for placeholders (____) to support "fill in the blank" style
    // or default to appending if no placeholder exists.
    const parts = this.starterText().split(/_{2,}/);

    // Prefix is the part before the blank, trimmed
    const prefix = parts[0].trim();
    // Suffix is the part after the blank (trimmed), or '.' if we are just appending
    const suffix = parts.length > 1 ? parts[1].trim() : '.';

    // Reconstruct full text for storage logic if needed
    let fullText = `${prefix} ${userInput}`;
    if (suffix === '.') {
      fullText += '.';
    } else {
      // If it's a suffix word, add space unless it's punctuation
      fullText += (this.needsSpace(suffix) ? ' ' : '') + suffix;
    }

    const line: PoemLine = {
      prefix,
      userInput,
      suffix,
      fullText
    };

    this.session.addPoemLine(line);
    this.customLine.set('');

    // Advance Logic
    const nextIndex = this.currentActIndex() + 1;

    if (nextIndex < this.acts().length) {
      this.loading.set(true);
      // Zero delay
      setTimeout(() => {
        this.session.currentActIndex.set(nextIndex);
        this.loading.set(false);
      }, 0);
    } else {
      // Finished
      this.session.finalizePoem();
      this.router.navigate(['/generating']);
    }
  }

  needsSpace(text: string): boolean {
    return !/^[\.,;:\?!]/.test(text);
  }
}