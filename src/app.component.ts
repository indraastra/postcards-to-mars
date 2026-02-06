import { Component, inject, signal, OnDestroy, OnInit, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import { GeminiService } from './services/gemini.service';
import { SessionStore } from './store/session.store';



type AppState = 'landing' | 'analyzing' | 'dialogue' | 'generating' | 'result' | 'error' | 'debug';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styles: [
    `
    .animate-progress {
      animation: progress 2s ease-in-out infinite;
    }
    @keyframes progress {
      0% { width: 0%; transform: translateX(-100%); }
      50% { width: 100%; transform: translateX(0); }
      100% { width: 0%; transform: translateX(100%); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-sparkle {
      position: relative;
      overflow: hidden;
    }
    .animate-sparkle::after {
      content: "";
      position: absolute;
      top: 0;
      left: -150%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to right, 
        transparent 0%, 
        rgba(251, 191, 36, 0.4) 50%, 
        transparent 100%
      );
      transform: skewX(-25deg);
      animation: ripple 3s infinite 2s; /* 2s delay, 3s duration */
    }
    @keyframes ripple {
      0% { left: -150%; opacity: 0; }
      20% { left: -150%; opacity: 1; }
      100% { left: 150%; opacity: 0; }
    }
  `]
})
export class AppComponent implements OnInit {
  geminiService = inject(GeminiService);
  session = inject(SessionStore);
  router = inject(Router);

  showAbout = signal(false);
  showSettings = signal(false);

  ngOnInit() {
    // Hidden Debug Route Check
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/debug') || search.includes('mode=debug')) {
      console.log('Entering Debug Mode');
      this.router.navigate(['/debug']);
    }

    // Secret Theme Debug Unlock (?d=1)
    if (search.includes('d=1')) {
      console.log('[Debug] Unlocking all secret themes...');
      import('./core/secret-themes').then(({ getAllSecretThemes }) => {
        const secrets = getAllSecretThemes();
        secrets.forEach(theme => {
          console.log(`[Debug] Unlocked: ${theme.name}`);
          this.geminiService.unlockTheme(theme);
        });
      });
    }
  }

  toggleAbout() {
    this.showAbout.update(v => !v);
  }

  toggleSettings() {
    this.showSettings.update(v => !v);
  }

  toggleReflectionMode() {
    const current = this.session.reflectionMode();
    this.session.setReflectionMode(current === 'full' ? 'visual' : 'full');
  }

  reset() {
    this.session.reset();
    this.router.navigate(['/']);
  }

  // State
  showSecretInput = signal(false);
  secretCode = signal('');
  unlockStatus = signal<'idle' | 'success' | 'error'>('idle');

  @ViewChild('secretInput') secretInput!: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      if (this.showSecretInput()) {
        setTimeout(() => {
          this.secretInput?.nativeElement?.focus();
        }, 50);
      }
    });
  }

  closeSecretInput() {
    this.showSecretInput.set(false);
    this.secretCode.set('');
    this.unlockStatus.set('idle');
  }

  checkSecretCode() {
    const code = this.secretCode().toUpperCase().trim();
    this.checkGeneralizedSecret(code);
  }

  private async checkGeneralizedSecret(code: string) {
    const { getSecretTheme } = await import('./core/secret-themes'); // Note path adjustment from app root
    const theme = getSecretTheme(code);

    if (theme) {
      // Unlock via service
      this.geminiService.unlockTheme(theme);

      // Keep open so they see the success state
      // this.closeSecretInput(); 

      this.session.setTheme(theme.id);
      this.unlockStatus.set('success');

      // Auto-scroll is handled by effect in DestinationGallery now
    } else {
      // Invalid
      this.unlockStatus.set('error');
      setTimeout(() => this.unlockStatus.set('idle'), 500);
      this.secretCode.set('');
    }
  }
}