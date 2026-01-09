import { Component, output, signal, input, inject } from '@angular/core';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-camera-upload',
  template: `
    <div class="flex flex-col items-center justify-center space-y-2 md:space-y-4 p-4 text-center animate-fade-in relative z-10 w-full max-w-md mx-auto">
      
      <!-- Integrated Upload Button -->
      <div class="w-full grid gap-3">
        <label 
          class="relative group cursor-pointer w-full flex items-center justify-center gap-4 p-3 md:p-4 transition-all duration-500 border hover:bg-white/5 shadow-2xl"
          [style.borderColor]="'var(--theme-primary)'"
          [style.backgroundColor]="'var(--theme-primary-dimmer)'"
        >
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/webp"
            capture="environment"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            (change)="onFileSelected($event)"
          />
          
          <div class="w-2 h-2 rounded-full animate-pulse" [style.backgroundColor]="'var(--theme-primary)'"></div>
          
          <span 
             class="font-mono text-sm uppercase tracking-[0.2em] font-bold" 
             [style.color]="'var(--theme-primary)'"
          >
             [ {{ activeTheme().uploadButtonLabel }} ]
          </span>
        </label>

        <label 
          class="relative group cursor-pointer w-full flex items-center justify-center gap-2 border border-gray-800 hover:border-gray-600 bg-black/20 hover:bg-white/5 text-gray-500 hover:text-gray-300 px-4 py-3 transition-all"
        >
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/webp"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            (change)="onFileSelected($event)"
          />
          <span class="font-mono text-[10px] uppercase tracking-[0.2em]">/ {{ activeTheme().archiveButtonLabel }}</span>
        </label>

        @if (errorMessage()) {
          <div class="mt-4 border border-red-900/50 bg-red-900/10 p-2 text-red-400 font-mono text-[10px]">
            ERROR: {{ errorMessage() }}
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 1s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CameraUploadComponent {
  geminiService = inject(GeminiService);
  activeTheme = this.geminiService.activeTheme;

  imageSelected = output<string>();
  errorMessage = signal<string>('');

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.errorMessage.set('');

    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        this.errorMessage.set('INVALID_FORMAT');
        input.value = '';
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.resizeImage(result);
      };

      reader.onerror = () => {
        this.errorMessage.set('READ_FAILURE');
      };

      reader.readAsDataURL(file);
    }
  }

  private resizeImage(base64Str: string) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 1600;

      // Calculate new dimensions if image is larger than MAX_SIZE
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
        // Fallback if canvas context fails
        this.imageSelected.emit(base64Str);
        return;
      }

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG with reasonable quality to reduce size further
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      this.imageSelected.emit(resizedDataUrl);
    };

    img.onerror = () => {
      this.errorMessage.set('IMAGE_PROCESSING_ERROR');
    };
  }
}