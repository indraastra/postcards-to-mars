import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-camera-upload',
  template: `
    <div class="flex flex-col items-center justify-center space-y-10 p-6 text-center animate-fade-in relative z-10 w-full max-w-md mx-auto">
      
      <!-- Terminal Header -->
      <div class="space-y-6 w-full border-b border-rose-900/30 pb-8">
        <h1 class="text-2xl md:text-3xl font-mono text-rose-500 tracking-widest uppercase glow-text">
          Postcards To Mars
        </h1>
        
        <div class="flex flex-col gap-1 text-[10px] md:text-[11px] font-mono text-rose-400/80 uppercase tracking-widest">
          <p>TERMINAL: E-99 (<span class="text-amber-500 animate-pulse">WEAK SIGNAL</span>)</p>
          <p>STATUS: WAITING FOR INPUT</p>
          <p>PROTOCOL: MEMORY_COMPRESSION</p>
        </div>
      </div>
      
      <p class="text-gray-300 font-mono text-xs md:text-sm leading-relaxed px-2 tracking-wide">
        > Earth is silent. <br>
        > The colonies need to remember.<br>
        > Upload visual data to begin encoding.
      </p>

      <div class="w-full grid gap-4 mt-4">
        <label 
          class="relative group cursor-pointer w-full flex items-center justify-between bg-rose-900/10 hover:bg-rose-900/20 border border-rose-500/30 p-5 transition-all duration-500"
        >
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/webp"
            capture="environment"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            (change)="onFileSelected($event)"
          />
          <span class="font-mono text-rose-400 text-[11px] uppercase tracking-[0.2em] group-hover:text-rose-300 font-bold">[ Capture Image ]</span>
          <div class="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
        </label>

        <label 
          class="relative group cursor-pointer w-full flex items-center justify-between bg-transparent border border-gray-700 hover:border-gray-500 p-5 transition-all duration-500"
        >
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/webp"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            (change)="onFileSelected($event)"
          />
          <span class="font-mono text-gray-400 text-[11px] uppercase tracking-[0.2em] group-hover:text-gray-200">/ Upload_From_Archive</span>
          <span class="text-gray-500 text-xs">></span>
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
    .glow-text {
      text-shadow: 0 0 15px rgba(225, 29, 72, 0.4);
    }
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