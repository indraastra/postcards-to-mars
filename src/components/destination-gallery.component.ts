import { Component, inject, signal, output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { THEMES } from '../core/theme.config';
import { SessionStore } from '../store/session.store';

@Component({
  selector: 'app-destination-gallery',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full h-full flex flex-col gap-2 animate-fade-in relative z-20 overflow-visible">
      
      <!-- Theme Carousel -->
      <!-- 
        Padding Logic:
        Mobile: Card w-72 (18rem). Center = 9rem. Padding = 50vw - 9rem.
        Desktop: Card w-96 (24rem). Center = 12rem. Padding = 50vw - 12rem.
      -->
      <div 
        class="flex gap-4 w-full overflow-x-auto px-[calc(50vw-9rem)] md:px-[calc(50vw-12rem)] py-12 -my-10 custom-scrollbar snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing" 
        id="theme-carousel"
        (scroll)="onScroll($event)"
        (mousedown)="startDrag($event)"
        (mouseleave)="stopDrag()"
        (mouseup)="stopDrag()"
        (mousemove)="moveDrag($event)"
      >
        @for (theme of geminiService.getAllThemes(); track theme.id) {
          <button 
            id="theme-{{theme.id}}"
            (click)="selectTheme(theme.id)"
            class="relative flex-shrink-0 w-72 h-52 md:w-96 md:h-64 rounded-sm overflow-hidden transition-all duration-500 group snap-center bg-[#f4f1ea] shadow-lg hover:shadow-xl hover:-translate-y-1 border border-white/10 hover:border-white/20"
            [class.scale-105]="activeTheme().id === theme.id"
            [class.opacity-60]="activeTheme().id !== theme.id"
            [class.hover:opacity-100]="activeTheme().id !== theme.id"
            [class.grayscale]="activeTheme().id !== theme.id"
            [style.background-color]="theme.visualStyle.backgroundColor"
          >
            <!-- Card Texture/Noise -->
            <div class="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
                 style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%221%22/%3E%3C/svg%3E');"></div>

            <!-- Content Container -->
            <div class="absolute inset-0 p-5 flex flex-col justify-between text-left z-10">
              
              <!-- Top Row: Stamp & Destination -->
              <div class="flex justify-between items-start w-full gap-4">
                
                <!-- Destination Text -->
                <div class="flex flex-col gap-1 mt-1">
                   <p class="text-[9px] uppercase tracking-[0.25em] font-mono opacity-60" 
                      [style.color]="theme.visualStyle.textColor">
                      Destination:
                   </p>
                   <p class="text-sm font-bold tracking-wider font-mono uppercase"
                      [style.color]="theme.visualStyle.textColor">
                      {{ theme.shortName }}
                   </p>
                </div>

                <!-- Postcard Stamp (Active Indicator) -->
                <div 
                  class="shrink-0 w-12 h-14 border-2 flex items-center justify-center transition-all duration-500"
                  [class.border-dotted]="activeTheme().id !== theme.id"
                  [class.border-solid]="activeTheme().id === theme.id"
                  [class.rotate-3]="activeTheme().id !== theme.id"
                  [class.rotate-0]="activeTheme().id === theme.id"
                  [class.opacity-50]="activeTheme().id !== theme.id"
                  [class.opacity-100]="activeTheme().id === theme.id"
                  [style.border-color]="theme.visualStyle.textColor"
                >
                   <div 
                      class="w-8 h-8 rounded-full border transition-all duration-500"
                      [class.border-dashed]="activeTheme().id !== theme.id"
                      [class.border-none]="activeTheme().id === theme.id"
                      [style.border-color]="theme.visualStyle.textColor"
                      [style.background-color]="activeTheme().id === theme.id ? theme.visualStyle.primaryColor : 'transparent'"
                      [class.opacity-40]="activeTheme().id !== theme.id"
                      [class.opacity-100]="activeTheme().id === theme.id"
                   ></div>
                </div>
              </div>

              <!-- Middle: Title -->
               <div class="flex-grow flex items-center justify-center py-2">
                  <h3 
                    class="text-2xl md:text-3xl font-bold leading-none text-center transform -rotate-2 group-hover:rotate-0 transition-transform duration-500"
                    [style.font-family]="theme.visualStyle.fontFamilyHeader"
                    [style.color]="theme.visualStyle.textColor"
                  >
                    {{ theme.name }}
                  </h3>
               </div>

              <!-- Bottom: Subtitle -->
              <div class="flex justify-between items-end border-t pt-3"
                   [style.border-color]="theme.visualStyle.textColor + '40'"> <!-- 40 is hex opacity -->
                
                <p 
                  class="text-xs md:text-sm italic leading-relaxed opacity-90 max-w-full"
                  [style.font-family]="theme.visualStyle.fontFamilyBody"
                  [style.color]="theme.visualStyle.textColor"
                >
                  "{{ theme.landingSubtitle }}"
                </p>
              </div>
            </div>
          </button>
        }

        <!-- Custom Theme Card -->
        <button 
          (click)="openCustomModal()"
          class="relative flex-shrink-0 w-72 h-52 md:w-96 md:h-64 rounded-lg overflow-hidden transition-all duration-300 group snap-center border-2 border-dashed border-white/20 hover:border-white/50 bg-black/40 hover:bg-black/60"
        >
           <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400 group-hover:text-white transition-colors">
              <span class="text-4xl font-mono font-light">+</span>
              <span class="text-xs uppercase tracking-[0.2em] font-mono">Create New Theme</span>
           </div>
        </button>
      </div>

      <!-- Helper Text -->
      <div class="text-center font-mono text-[10px] uppercase tracking-widest text-white/50 animate-pulse mt-2">
        <<< Swipe to Explore Destinations >>>
      </div>

      <!-- Action Area -->
      <div class="flex flex-col items-stretch gap-3 min-w-[14rem] md:min-w-[20rem] max-w-[90vw] mx-auto mt-4 z-30 relative">
        
        <!-- Primary: CAPTURE -->
        <label 
           class="group relative cursor-pointer w-full flex items-center justify-center gap-4 px-6 py-4 overflow-hidden rounded-lg shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <!-- Background -->
          <div class="absolute inset-0 opacity-90 transition-opacity group-hover:opacity-100"
               [style.background-color]="activeTheme().visualStyle.primaryColor"></div>
          
          <!-- Content -->
          <span class="relative z-10 flex items-center gap-3 font-mono text-sm uppercase tracking-[0.2em] font-bold text-white whitespace-nowrap">
              <div class="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
              <span>[ {{ activeTheme().uploadButtonLabel }} ]</span>
          </span>

          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            class="hidden" 
            (change)="handleFileInput($event)"
          > 
        </label>

        <!-- Secondary: UPLOAD -->
        <label 
           class="group relative cursor-pointer w-full flex items-center justify-center px-6 py-3 overflow-hidden rounded-lg transition-all duration-300 border border-white/20 hover:border-white/50 bg-black/60 hover:bg-black/80 backdrop-blur-md"
        >
           <span class="font-mono text-xs uppercase tracking-[0.2em] font-medium text-white/80 group-hover:text-white transition-colors whitespace-nowrap">
              / {{ activeTheme().captureButtonLabel }}
           </span>

           <input 
            type="file" 
            accept="image/*" 
            class="hidden" 
            (change)="handleFileInput($event)"
          > 
        </label>

      </div>

      <!-- Narrative Module Toggle -->
      <div class="flex items-center justify-center gap-4 mt-8 mb-4">
        <div class="flex items-center gap-3 bg-black/40 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
          <span class="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            {{ activeTheme().narrativeModuleLabel }}
          </span>
          
          <button 
            (click)="toggleReflectionMode()"
            class="relative w-10 h-5 rounded-full border transition-colors duration-300 flex items-center px-0.5"
            [class.border-rose-500]="reflectionMode() === 'full'"
            [class.bg-rose-500_20]="reflectionMode() === 'full'"
            [class.border-neutral-600]="reflectionMode() === 'visual'"
            [class.bg-neutral-800]="reflectionMode() === 'visual'"
          >
            <div 
                class="w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform duration-300"
                [class.translate-x-5]="reflectionMode() === 'full'"
                [class.bg-rose-400]="reflectionMode() === 'full'"
                [class.translate-x-0]="reflectionMode() === 'visual'"
                [class.bg-neutral-500]="reflectionMode() === 'visual'"
            ></div>
          </button>
          
          <span class="text-[10px] font-mono font-bold w-6 text-center inline-block"
                [class.text-rose-400]="reflectionMode() === 'full'"
                [class.text-neutral-500]="reflectionMode() === 'visual'">
             {{ reflectionMode() === 'full' ? 'ON' : 'OFF' }}
          </span>
        </div>
      </div>

      <!-- Custom Theme Modal -->
      @if (showCustomModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 animate-fade-in backdrop-blur-md">
           <div class="w-full max-w-lg bg-[#0f0f11] border border-white/10 p-1 shadow-2xl">
              <div class="bg-[#1a1a1d] p-6 flex flex-col gap-6">
                 
                 <div class="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                      <h3 class="text-white font-mono text-sm tracking-[0.2em] uppercase mb-1">Design New Theme</h3>
                      <p class="text-gray-500 text-[10px] font-mono">Describe the visual style you want to create.</p>
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
                      <span>Creating Theme...</span>
                    } @else {
                      <span>Generate Theme</span>
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
export class DestinationGalleryComponent implements AfterViewInit {
  geminiService = inject(GeminiService);
  session = inject(SessionStore);
  activeTheme = this.session.theme;
  reflectionMode = this.session.reflectionMode;

  showCustomModal = signal(false);
  customPrompt = signal('');
  isGenerating = signal(false);

  // Drag State
  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  wasDragging = false;
  scrollTimeout: any;
  private lastManualSelectTime = 0;

  ngAfterViewInit() {
    // Scroll to the active theme immediately on load
    setTimeout(() => {
      const id = this.activeTheme().id;
      const el = document.getElementById(`theme-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }
    }, 0);
  }

  onScroll(e: Event) {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

    // Debounce check for centered card
    this.scrollTimeout = setTimeout(() => {
      this.checkSelection(e.target as HTMLElement);
    }, 150);
  }

  checkSelection(container: HTMLElement) {
    // If we are currently dragging, don't auto-select yet
    if (this.isDragging) return;

    // If a manual selection happened recently (e.g. click), ignore scroll updates 
    // to prevent the active theme from flickering back to the previous one during smooth scroll.
    if (Date.now() - this.lastManualSelectTime < 800) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestThemeId: string | null = null;
    let minDistance = Infinity;

    // Iterate over all theme cards
    const cards = container.querySelectorAll('[id^="theme-"]');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestThemeId = card.id.replace('theme-', '');
      }
    });

    // Valid threshold to consider it "centered" (snap usually handles this)
    // Mobile card width ~288px (w-72), Desktop ~384px (w-96). 
    // Half width is 144px/192px. If distance is < 100px, it's definitely the focused one.
    if (closestThemeId && minDistance < 150) {
      if (this.activeTheme().id !== closestThemeId) {
        this.session.setTheme(closestThemeId);
      }
    }
  }

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
      this.lastManualSelectTime = Date.now();
      this.session.setTheme(id);

      // Center the selected card
      setTimeout(() => {
        const el = document.getElementById(`theme-${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 0);
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
        this.session.setTheme(newTheme.id);
        this.closeCustomModal();
      }
    } catch (err) {
      console.error('Failed to generate theme', err);
    } finally {
      this.isGenerating.set(false);
    }
  }

  // File Input Handler
  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Basic validation
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        console.error('INVALID_FORMAT');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.resizeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  // Basic Image Resizing
  private resizeImage(base64Str: string) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 1600;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        this.imageSelected.emit(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      this.imageSelected.emit(resizedDataUrl);
    };
  }

  // Output event to replace the "CameraUpload" separate component
  imageSelected = output<string>();

  toggleReflectionMode() {
    const current = this.reflectionMode();
    this.session.setReflectionMode(current === 'full' ? 'visual' : 'full');
  }
}