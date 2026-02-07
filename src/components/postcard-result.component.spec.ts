import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PostcardResultComponent } from './postcard-result.component';
import { SessionStore } from '../store/session.store';
import { GeminiService } from '../services/gemini.service';
import { ThemeService } from '../services/theme.service';
import { signal } from '@angular/core';

describe('PostcardResultComponent Loading Messages', () => {
    let component: PostcardResultComponent;
    let fixture: ComponentFixture<PostcardResultComponent>;
    let mockSessionStore: any;
    let mockThemeService: any;
    let themeSignal: any;

    beforeEach(async () => {
        themeSignal = signal({
            id: 'theme1',
            name: 'Theme 1',
            loadingMessages: ['Loading Theme 1...'],
            visualStyle: { primaryColor: 'red' }
        });

        mockSessionStore = {
            theme: themeSignal,
            finalPoem: signal(''),
            stylizedImage: signal(null),
            generatedPrompt: signal(''),
            promptVersion: signal('v1')
        };

        mockThemeService = {
            allThemes: signal([])
        };

        await TestBed.configureTestingModule({
            imports: [PostcardResultComponent],
            providers: [
                { provide: SessionStore, useValue: mockSessionStore },
                { provide: GeminiService, useValue: {} },
                { provide: ThemeService, useValue: mockThemeService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PostcardResultComponent);
        component = fixture.componentInstance;

        // Set required inputs
        fixture.componentRef.setInput('poem', '');
        fixture.componentRef.setInput('stylizedImageSrc', null);

        fixture.detectChanges();
    });

    it('should update loading messages when theme changes', fakeAsync(() => {
        // Initial State
        // Component initializes loading cycle in constructor.
        // Wait for first tick
        tick(0);
        expect(component.loadingMessage()).toBe('Loading Theme 1...');

        // Change Theme
        themeSignal.set({
            id: 'theme2',
            name: 'Theme 2',
            loadingMessages: ['Loading Theme 2...'],
            visualStyle: { primaryColor: 'blue' }
        });

        fixture.detectChanges();

        // The component "should" react to this change and restart the cycle
        // We expect this to FAIL currently because startLoadingCycle is only called in constructor

        // Reset cycle manually if needed in the real code, but here we just check if it updated
        tick(600); // Wait for potential interval tick

        // With the bug, this will still be from Theme 1 or not updated correctly
        // We want it to be 'Loading Theme 2...'
        expect(component.loadingMessage()).toBe('Loading Theme 2...');

        // Clean up
        if (component.loadingInterval) clearInterval(component.loadingInterval);
    }));
});
