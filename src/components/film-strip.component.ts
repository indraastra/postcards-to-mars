import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { THEMES } from '../core/theme.config';

@Component({
  selector: 'app-film-strip',
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Custom Theme Modal -->
    @if (showCustomModal()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-20 overflow-y-auto bg-black/90 p-6 animate-fade-in backdrop-blur-md">
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

    <div 
      class="fixed bottom-0 left-0 w-full z-40 bg-[var(--theme-bg)] border-t border-[var(--theme-primary)]/20 shadow-2xl transition-transform duration-500 ease-in-out"
      [style.transform]="isCollapsed() ? 'translateY(calc(100% - 2.25rem))' : 'translateY(0)'"
    >
      
      <!-- Collapsible Header / Handle -->
      <button 
        (click)="toggleCollapse()"
        class="w-full h-9 flex items-center justify-between px-6 cursor-pointer hover:bg-white/5 transition-colors group"
      >
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
          <span class="text-[9px] uppercase tracking-[0.2em] font-mono text-[var(--theme-primary)] opacity-90 group-hover:opacity-100 transition-opacity">
            Photo Reel
          </span>
        </div>

        <!-- Chevron Icon -->
        <span 
          class="text-[var(--theme-primary)] opacity-90 group-hover:opacity-100 transition-all font-mono text-xs"
          [class.rotate-180]="!isCollapsed()"
        >
          ▲
        </span>
      </button>

      <!-- Scrollable Reel -->
      <div 
        class="flex gap-3 overflow-x-auto px-6 pb-4 pt-1 custom-scrollbar snap-x cursor-grab active:cursor-grabbing"
        (mousedown)="startDrag($event)"
        (mouseleave)="stopDrag()"
        (mouseup)="stopDrag()"
        (mousemove)="moveDrag($event)"
      >
        
        @for (theme of geminiService.getAllThemes(); track theme.id) {
          <button 
            (click)="switchTheme(theme.id)"
            class="relative flex-shrink-0 w-16 h-20 border rounded-sm overflow-hidden transition-all duration-300 group snap-start bg-black"
            [class.border-rose-500]="activeTheme().id === theme.id"
            [class.border-gray-800]="activeTheme().id !== theme.id"
            [class.opacity-100]="activeTheme().id === theme.id"
            [class.opacity-60]="activeTheme().id !== theme.id"
            [class.hover:opacity-100]="activeTheme().id !== theme.id"
          >

            <!-- Thumbnail Logic -->
            @if (getArtifact(theme.id); as artifact) {
               <!-- Show Generated Image -->
               <img [src]="artifact.imageUrl" class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
            } @else {
               <!-- Show Theme Color Placeholder -->
               <div class="absolute inset-0 opacity-80" [style.background-color]="theme.visualStyle.backgroundColor"></div>
               <div class="absolute inset-0 opacity-40 mix-blend-overlay" [style.background-color]="theme.visualStyle.primaryColor"></div>
            }
            
            <!-- Active Indicator -->
             @if (activeTheme().id === theme.id) {
                <div class="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full shadow-sm z-20"></div>
             }
             
             <!-- Label -->
             <div class="absolute bottom-0 w-full bg-black/80 py-1 text-center z-10">
               <span class="text-[8px] font-mono text-white uppercase tracking-wider block truncate px-1">
                 {{ theme.shortName }}
               </span>
             </div>

          </button>
        }
        
        <!-- Add Custom Theme Button -->
        <button 
          (click)="openCustomModal()"
          class="relative flex-shrink-0 w-16 h-20 border border-dashed border-gray-600 rounded-sm overflow-hidden transition-all duration-300 group snap-start bg-black/20 hover:bg-white/5 hover:border-white/50 flex flex-col items-center justify-center gap-1"
        >
          <span class="text-xl text-gray-500 group-hover:text-white font-light">+</span>
          <span class="text-[6px] uppercase tracking-widest text-gray-500 group-hover:text-white font-mono">Add</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      height: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
       from { opacity: 0; transform: scale(0.95); }
       to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class FilmStripComponent {
  geminiService = inject(GeminiService);
  themeSwitch = output<string>(); // Emits themeId

  activeTheme = this.geminiService.activeTheme;
  isCollapsed = signal(false);

  // Custom Theme State
  showCustomModal = signal(false);
  customPrompt = signal('');
  isGenerating = signal(false);

  // Drag State
  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  wasDragging = false;

  openCustomModal() {
    this.showCustomModal.set(true);
  }

  closeCustomModal() {
    this.showCustomModal.set(false);
    this.customPrompt.set('');
  }

  async generateCustomTheme() {
    if (!this.customPrompt()) return;

    this.isGenerating.set(true);
    const theme = await this.geminiService.generateCustomTheme(this.customPrompt());
    this.isGenerating.set(false);

    if (theme) {
      this.geminiService.addCustomTheme(theme);
      this.geminiService.setTheme(theme.id);
      this.closeCustomModal();
      this.themeSwitch.emit(theme.id); // Trigger auto-generation on result page
    }
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  getArtifact(themeId: string) {
    return this.geminiService.getArtifact(themeId);
  }

  startDrag(e: MouseEvent) {
    const slider = e.currentTarget as HTMLElement;
    this.isDragging = true;
    this.wasDragging = false;
    this.startX = e.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;
  }

  stopDrag() {
    this.isDragging = false;
    setTimeout(() => this.wasDragging = false, 50);
  }

  moveDrag(e: MouseEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const slider = e.currentTarget as HTMLElement;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - this.startX) * 2;
    slider.scrollLeft = this.scrollLeft - walk;

    if (Math.abs(walk) > 5) {
      this.wasDragging = true;
    }
  }

  switchTheme(id: string) {
    if (!this.wasDragging && this.activeTheme().id !== id) {
      this.themeSwitch.emit(id);
    }
  }
}
