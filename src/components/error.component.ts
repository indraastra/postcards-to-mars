import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionStore } from '../store/session.store';

@Component({
    selector: 'app-error',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-full w-full max-w-2xl mx-auto flex flex-col items-center justify-center px-4 pt-20 pb-8">
      <div class="flex flex-col items-center gap-6 text-center px-6 animate-fade-in border border-rose-500/30 bg-black/40 p-12 backdrop-blur-sm shadow-2xl">

        <!-- Icon -->
        <div class="text-4xl text-rose-500 font-mono animate-pulse">
          [ ! ]
        </div>

        <div class="font-mono space-y-4">
          <h3 class="text-sm tracking-[0.2em] uppercase text-rose-500 font-bold">
            CONNECTION ERROR
          </h3>
          <p class="text-xs text-rose-300/80 uppercase tracking-wider max-w-[200px] leading-relaxed">
            {{ session.errorMessage() }}
          </p>
        </div>

        <button (click)="retry()"
          class="mt-4 px-8 py-4 border border-rose-500/50 hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2">
          <span>TRY AGAIN</span>
        </button>

      </div>
    </div>
  `,
    styles: [`
      .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ErrorComponent {
    session = inject(SessionStore);
    router = inject(Router);

    retry() {
        // Basic retry: Go to landing? Or back to analyzing?
        // Simplest: Go somewhere safe
        this.router.navigate(['/']);
    }
}
