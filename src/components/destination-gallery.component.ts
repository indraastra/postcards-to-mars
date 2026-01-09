import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { THEMES } from '../core/theme.config';

@Component({
  selector: 'app-destination-gallery',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-2xl mx-auto flex flex-col gap-2 animate-fade-in relative z-20">
      
      <!-- Theme Carousel -->
      <div 
        class="flex gap-4 overflow-x-auto px-8 py-2 md:p-4 custom-scrollbar snap-x scroll-smooth cursor-grab active:cursor-grabbing" 
        id="theme-carousel"
        (mousedown)="startDrag($event)"
        (mouseleave)="stopDrag()"
        (mouseup)="stopDrag()"
        (mousemove)="moveDrag($event)"
      >
        @for (theme of geminiService.getAllThemes(); track theme.id) {
          <button 
            (click)="selectTheme(theme.id)"
            class="relative flex-shrink-0 w-56 h-64 md:w-64 md:h-80 rounded-lg overflow-hidden transition-all duration-500 group snap-start border-2"
            [class.border-white]="activeTheme().id === theme.id"
            [class.border-transparent]="activeTheme().id !== theme.id"
            [class.scale-105]="activeTheme().id === theme.id"
            [class.opacity-50]="activeTheme().id !== theme.id"
            [class.hover:opacity-100]="activeTheme().id !== theme.id"
            [class.grayscale]="activeTheme().id !== theme.id"
            [style.background-color]="theme.visualStyle.backgroundColor"
          >
            <!-- Background Fill -->
            <div class="absolute inset-0 opacity-20" [style.background-color]="theme.visualStyle.primaryColor"></div>
            
            <!-- Content -->
            <div class="absolute inset-0 p-4 md:p-6 flex flex-col justify-between text-left">
              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2 font-mono" [style.color]="theme.visualStyle.textColor">
                  Destination {{ $index + 1 }}
                </p>
                <h3 
                  class="text-2xl font-bold leading-tight"
                  [style.font-family]="theme.visualStyle.fontFamilyHeader"
                  [style.color]="theme.visualStyle.textColor"
                >
                  {{ theme.name }}
                </h3>
              </div>

              <div>
                <div class="w-8 h-px mb-4 opacity-50" [style.background-color]="theme.visualStyle.textColor"></div>
                <p 
                  class="text-xs italic leading-relaxed opacity-80"
                  [style.font-family]="theme.visualStyle.fontFamilyBody"
                  [style.color]="theme.visualStyle.textColor"
                >
                  "{{ theme.landingSubtitle }}"
                </p>
              </div>
            </div>

            <!-- Active Indicator -->
            @if (activeTheme().id === theme.id) {
              <div class="absolute bottom-4 right-4 animate-pulse">
                <div class="w-2 h-2 rounded-full" [style.background-color]="theme.visualStyle.primaryColor"></div>
              </div>
            }
          </button>
        }

        <!-- Custom Theme Card -->
        <button 
          (click)="openCustomModal()"
          class="relative flex-shrink-0 w-56 h-64 md:w-64 md:h-80 rounded-lg overflow-hidden transition-all duration-300 group snap-center border-2 border-dashed border-white/20 hover:border-white/50 bg-black/40 hover:bg-black/60"
        >
           <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400 group-hover:text-white transition-colors">
              <span class="text-4xl font-mono font-light">+</span>
              <span class="text-xs uppercase tracking-[0.2em] font-mono">Discover New World</span>
           </div>
        </button>
      </div>

      <!-- Helper Text -->
      <div class="text-center font-mono text-[10px] uppercase tracking-widest opacity-50 animate-pulse">
        <<< Swipe to Change Film >>>
      </div>

      <!-- Custom Theme Modal -->
      @if (showCustomModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 animate-fade-in backdrop-blur-md">
           <div class="w-full max-w-lg bg-[#0f0f11] border border-white/10 p-1 shadow-2xl">
              <div class="bg-[#1a1a1d] p-6 flex flex-col gap-6">
                 
                 <div class="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                      <h3 class="text-white font-mono text-sm tracking-[0.2em] uppercase mb-1">Manual Calibration</h3>
                      <p class="text-gray-500 text-[10px] font-mono">Describe the world you wish to visit.</p>
                    </div>
                    <button (click)="closeCustomModal()" class="text-gray-500 hover:text-white font-mono text-xs p-2">[X]</button>
                 </div>
                 
                 <div class="relative">
                    <textarea 
                      [(ngModel)]="customPrompt" 
                      class="w-full h-32 bg-black/50 border border-white/10 p-4 font-mono text-xs text-gray-300 focus:outline-none focus:border-rose-500/50 leading-relaxed resize-none transition-colors"
                      placeholder="e.g. A solarpunk utopia with floating gardens..."
                      [disabled]="isGenerating()"
                    ></textarea>
                 </div>

                 <button 
                    (click)="generateCustomTheme()"
                    [disabled]="!customPrompt() || isGenerating()"
                    class="w-full py-4 bg-rose-900/20 hover:bg-rose-900/40 border border-rose-800/30 hover:border-rose-500/50 text-rose-400 font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    @if (isGenerating()) {
                      <div class="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
                      <span>Calculating Trajectory...</span>
                    } @else {
                      <span>Initialize Jump</span>
                    }
                 </button>
              </div>
           </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      height: 0px;
      background: transparent;
    }
    .custom-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .animate-fade-in {
      animation: fadeIn 0.8s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DestinationGalleryComponent {
  geminiService = inject(GeminiService);
  activeTheme = this.geminiService.activeTheme;

  showCustomModal = signal(false);
  customPrompt = signal('');
  isGenerating = signal(false);

  // Drag State
  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  wasDragging = false;

  startDrag(e: MouseEvent) {
    const slider = e.currentTarget as HTMLElement;
    this.isDragging = true;
    this.wasDragging = false;
    slider.classList.add('active');
    this.startX = e.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;
  }

  stopDrag() {
    this.isDragging = false;
    // wasDragging remains true until the next startDrag reset, 
    // but we need to ensure clicks happen immediately after mouseup if it wasn't a drag.
    // Actually, simple click vs drag detection: check distance moved?
    // Let's stick to the current flow: MouseUp stops drag.
    // If we want to prevent click, we can use a small timeout or distance check.
    // Better approach: capture click event and stop it?
    // Let's rely on a small timeout to clear 'wasDragging' if needed, 
    // or just rely on the fact that if isDragging was true and we moved, wasDragging is true.
    setTimeout(() => this.wasDragging = false, 50);
  }

  moveDrag(e: MouseEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const slider = e.currentTarget as HTMLElement;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - this.startX) * 2; // scroll-fast
    slider.scrollLeft = this.scrollLeft - walk;

    if (Math.abs(walk) > 5) {
      this.wasDragging = true;
    }
  }

  selectTheme(id: string) {
    if (!this.wasDragging) {
      this.geminiService.setTheme(id);
    }
  }

  openCustomModal() {
    if (!this.wasDragging) {
      this.showCustomModal.set(true);
    }
  }

  closeCustomModal() {
    this.showCustomModal.set(false);
    this.customPrompt.set('');
  }

  async generateCustomTheme() {
    if (!this.customPrompt()) return;

    this.isGenerating.set(true);

    try {
      const newTheme = await this.geminiService.generateCustomTheme(this.customPrompt());
      if (newTheme) {
        this.geminiService.addCustomTheme(newTheme);
        this.selectTheme(newTheme.id);
        this.closeCustomModal();
      }
    } catch (err) {
      console.error('Failed to generate theme', err);
    } finally {
      this.isGenerating.set(false);
    }
  }
}