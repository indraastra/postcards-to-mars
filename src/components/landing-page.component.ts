import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DestinationGalleryComponent } from './destination-gallery.component';
import { SessionStore } from '../store/session.store';

@Component({
  selector: 'app-landing-page', // Renamed to avoid confusion with previous files
  standalone: true,
  imports: [CommonModule, DestinationGalleryComponent],
  template: `
    <div class="w-full min-h-full flex flex-col justify-center py-20">
      <app-destination-gallery (imageSelected)="onImageSelected($event)"></app-destination-gallery>
    </div>
  `
})
export class LandingPageComponent {
  session = inject(SessionStore);
  router = inject(Router);

  onImageSelected(base64: string) {
    this.session.setImage(base64);
    this.router.navigate(['/analyzing']); // Navigate directly to Analysis, bypassing removed ThemeSelectorV2
  }
}
