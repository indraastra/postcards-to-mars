import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { GeminiService } from './services/gemini.service';
import { SessionStore } from './store/session.store';



type AppState = 'landing' | 'analyzing' | 'dialogue' | 'generating' | 'result' | 'error' | 'debug';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet
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
  `]
})
export class AppComponent implements OnInit {
  geminiService = inject(GeminiService);
  session = inject(SessionStore);
  router = inject(Router);

  showAbout = signal(false);

  ngOnInit() {
    // Hidden Debug Route Check
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/debug') || search.includes('mode=debug')) {
      console.log('Entering Debug Mode');
      this.router.navigate(['/debug']);
    }
  }

  toggleAbout() {
    this.showAbout.update(v => !v);
  }

  reset() {
    this.session.reset();
    this.router.navigate(['/']);
  }
}