import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page.component';
import { AnalysisComponent } from './components/analysis.component';
import { DialogueComponent } from './components/dialogue.component';
import { GenerationComponent } from './components/generation.component';
import { PostcardResultWrapperComponent } from './components/postcard-result-wrapper.component';
import { ErrorComponent } from './components/error.component';
import { ImageDebugComponent } from './components/image-debug.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'analyzing', component: AnalysisComponent },
    { path: 'compose', component: DialogueComponent },
    { path: 'generating', component: GenerationComponent },
    { path: 'result', component: PostcardResultWrapperComponent },
    { path: 'error', component: ErrorComponent },
    { path: 'debug', component: ImageDebugComponent }
];
