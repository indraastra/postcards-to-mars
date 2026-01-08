import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../services/gemini.service';
import { ThemeConfig } from '../core/theme.config';

@Component({
  selector: 'app-theme-selector',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-6 p-4 animate-fade-in w-full max-w-md mx-auto">
      
      <div class="text-center space-y-1 mb-2">
        <h2 class="text-xs font-mono text-rose-500 tracking-[0.2em] uppercase">Phase 2: Calibration</h2>
        <p class="text-sm font-serif text-gray-400 italic">Select your destination frequency...</p>
      </div>

      <div class="w-full grid gap-3">
        @for (theme of themes; track theme.id) {
          <button 
            (click)="selectTheme(theme)"
            class="group relative w-full text-left p-4 border transition-all duration-300 overflow-hidden"
            [class.border-rose-500]="activeTheme().id === theme.id"
            [class.bg-rose-900_10]="activeTheme().id === theme.id"
            [class.border-white_10]="activeTheme().id !== theme.id"
            [class.hover:border-white_30]="activeTheme().id !== theme.id"
          >
            <!-- Background Hover Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div class="relative z-10 flex items-center justify-between">
              <div>
                <h3 
                  class="font-mono text-sm uppercase tracking-widest mb-1 transition-colors"
                  [class.text-rose-400]="activeTheme().id === theme.id"
                  [class.text-gray-300]="activeTheme().id !== theme.id"
                >
                  {{ theme.name }}
                </h3>
                <p class="text-[10px] text-gray-500 font-sans tracking-wide">
                   // {{ getThemeDescription(theme.id) }}
                </p>
              </div>

              <!-- Selection Indicator -->
              <div class="flex items-center justify-center w-6 h-6 border rounded-full transition-all"
                [class.border-rose-500]="activeTheme().id === theme.id"
                [class.border-gray-700]="activeTheme().id !== theme.id"
              >
                @if (activeTheme().id === theme.id) {
                  <div class="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                }
              </div>
            </div>
          </button>
        }
      </div>

      <button 
        (click)="confirm()"
        class="mt-4 w-full bg-rose-700 hover:bg-rose-600 text-white px-6 py-4 rounded-sm shadow-lg shadow-rose-900/40 transition-all font-mono uppercase tracking-widest text-xs group"
      >
        <span class="group-hover:animate-pulse">●</span> Initialize Link
      </button>

    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ThemeSelectorComponent {
  geminiService = inject(GeminiService);
  themeSelected = output<void>();

  themes = this.geminiService.getAllThemes();
  activeTheme = this.geminiService.activeTheme;

  selectTheme(theme: ThemeConfig) {
    this.geminiService.setTheme(theme.id);
  }

  confirm() {
    this.themeSelected.emit();
  }

  getThemeDescription(id: string): string {
    switch (id) {
      case 'mars': return 'Colony 7, Sector 4';
      case 'tokyo': return 'Night Train, Line JR-9';
      case 'noir': return 'Case File #492, Downtown';
      case 'wild': return 'Deep Forest, Zone X';
      case 'retro': return 'The Summer of \'98';
      default: return 'Unknown Frequency';
    }
  }
}
