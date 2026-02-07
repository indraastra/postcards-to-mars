import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeSelectorComponent } from './theme-selector.component';
import { SessionStore } from '../store/session.store';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ThemeSelectorComponent],
  template: `
    <div class="w-full min-h-full flex flex-col justify-center py-20">
      <app-theme-selector (imageSelected)="onImageSelected($event)"></app-theme-selector>
    </div>
  `
})
export class LandingPageComponent {
  session = inject(SessionStore);
  router = inject(Router);

  onImageSelected(base64: string) {
    this.session.setImage(base64);
    this.router.navigate(['/analyzing']);
  }
}
