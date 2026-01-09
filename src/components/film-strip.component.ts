import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../services/gemini.service';
import { THEMES } from '../core/theme.config';

@Component({
  selector: 'app-film-strip',
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-0 left-0 w-full z-40 p-4 pb-6 bg-[var(--theme-bg)] border-t border-[var(--theme-primary)]/20 shadow-2xl">
      
      <div class="max-w-md mx-auto">
        <div class="flex items-center gap-2 mb-2 px-1">
          <div class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
          <span class="text-[9px] uppercase tracking-[0.2em] font-mono text-[var(--theme-text)] opacity-60">Memory Reel</span>
        </div>

        <div 
          class="flex gap-3 overflow-x-auto pb-2 px-6 pt-1 custom-scrollbar snap-x cursor-grab active:cursor-grabbing"
          (mousedown)="startDrag($event)"
          (mouseleave)="stopDrag()"
          (mouseup)="stopDrag()"
          (mousemove)="moveDrag($event)"
        >
          
          @for (theme of geminiService.getAllThemes(); track theme.id) {
            <button 
              (click)="switchTheme(theme.id)"
              class="relative flex-shrink-0 w-16 h-20 border rounded-sm overflow-hidden transition-all duration-300 group snap-start"
              [class.border-rose-500]="activeTheme().id === theme.id"
              [class.border-gray-800]="activeTheme().id !== theme.id"
              [class.opacity-50]="activeTheme().id !== theme.id"
              [class.hover:opacity-100]="activeTheme().id !== theme.id"
              [style.background-color]="theme.visualStyle.backgroundColor"
            >
              <!-- Theme Preview Color/Style -->
              <div class="absolute inset-0 opacity-80" [style.background-color]="theme.visualStyle.primaryColor"></div>
              
              <!-- Active Indicator -->
               @if (activeTheme().id === theme.id) {
                  <div class="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full shadow-sm z-10"></div>
               }
               
               <!-- Label -->
               <div class="absolute bottom-0 w-full bg-black/80 py-1 text-center">
                 <span class="text-[8px] font-mono text-white uppercase tracking-wider block truncate px-1">
                   {{ theme.shortName }}
                 </span>
               </div>
               
               <!-- Developed Marker -->
               @if (isDeveloped(theme.id)) {
                 <div class="absolute top-1 left-1 w-2 h-2 bg-white rounded-[1px] shadow-md z-10 border border-black/20"></div>
               }

            </button>
          }
        </div>
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
  `]
})
export class FilmStripComponent {
  geminiService = inject(GeminiService);
  themeSwitch = output<string>(); // Emits themeId

  activeTheme = this.geminiService.activeTheme;

  // Drag State
  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  wasDragging = false;

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

  isDeveloped(themeId: string): boolean {
    return !!this.geminiService.getArtifact(themeId);
  }
}
