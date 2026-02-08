import { Component, inject, signal, output, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ThemeService } from '../services/theme.service';
import { SessionStore } from '../store/session.store';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-theme-selector',
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.css']
})
export class ThemeSelectorComponent implements AfterViewInit {
  geminiService = inject(GeminiService);
  themeService = inject(ThemeService);
  session = inject(SessionStore);
  analytics = inject(AnalyticsService);
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
  // Lock for auto-scroll
  isAutoScrolling = false;
  // Flag to detect source of theme change (manual click vs scroll)
  private isScrollDrivenUpdate = false;

  constructor() {
    effect(() => {
      const theme = this.activeTheme();
      const allThemes = this.themeService.allThemes();
      if (!theme) return;

      // If this update came from the user scrolling ('snap to grid'),
      // we do NOT want to programmatic scroll again (which fights the user).
      if (this.isScrollDrivenUpdate) {
        this.isScrollDrivenUpdate = false;
        return;
      }

      // Flag that we are attempting to auto-scroll
      this.isAutoScrolling = true;

      const attemptScroll = (attempt = 0) => {
        const el = document.getElementById(`theme-${theme.id}`);

        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          // Reset flag after expected scroll duration (approx 800ms)
          setTimeout(() => this.isAutoScrolling = false, 800);
        } else if (attempt < 10) {
          // Retry up to 10 times (approx 500ms total wait for DOM)
          setTimeout(() => attemptScroll(attempt + 1), 50);
        } else {
          // Give up
          this.isAutoScrolling = false;
        }
      };

      // Start attempts
      attemptScroll();
    });
  }



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
    // console.log('[DestinationGallery] Scroll event fired.');
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

    // Debounce check for centered card
    this.scrollTimeout = setTimeout(() => {
      this.checkSelection(e.target as HTMLElement);
    }, 150);
  }

  checkSelection(container: HTMLElement) {
    // If we are currently dragging OR auto-scrolling, don't auto-select
    if (this.isDragging || this.isAutoScrolling) {
      return;
    }

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

    if (closestThemeId && minDistance < 150) {
      if (this.activeTheme().id !== closestThemeId) {
        this.isScrollDrivenUpdate = true;
        this.session.setTheme(closestThemeId);
      }
    }
  }



  startDrag(e: MouseEvent) {
    // If user interacts, cancel auto-scroll lock immediately
    this.isAutoScrolling = false;

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
      this.isScrollDrivenUpdate = false;
      this.session.setTheme(id);
    }
  }

  toggleFavorite(event: MouseEvent, themeId: string) {
    event.stopPropagation(); // Prevent theme selection
    this.themeService.toggleFavorite(themeId);
    this.analytics.trackFavorite(themeId, this.themeService.isFavorite(themeId));

    // If this theme is currently selected, scroll to its new position after DOM updates
    if (this.activeTheme().id === themeId) {
      // Reset auto-scroll lock to allow the scroll to happen
      this.isAutoScrolling = false;
      // Wait for Angular to re-render with the new theme order
      setTimeout(() => {
        const el = document.getElementById(`theme-${themeId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 100);
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
        this.themeService.addCustomTheme(newTheme);
        this.session.setTheme(newTheme.id);
        this.analytics.trackCustomTheme(this.customPrompt(), true);
        this.closeCustomModal();
      }
    } catch (err) {
      this.analytics.trackCustomTheme(this.customPrompt(), false);
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

}