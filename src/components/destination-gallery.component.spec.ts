import '../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DestinationGalleryComponent } from './destination-gallery.component';
import { GeminiService } from '../services/gemini.service';
import { SessionStore } from '../store/session.store';
import { signal } from '@angular/core';

describe('DestinationGalleryComponent', () => {
    let component: DestinationGalleryComponent;
    let fixture: ComponentFixture<DestinationGalleryComponent>;
    let mockGeminiService: any;
    let mockSessionStore: any;

    beforeEach(async () => {
        mockGeminiService = {
            getAllThemes: () => [
                {
                    id: 'mars',
                    name: 'Mars',
                    visualStyle: { primaryColor: '#000', textColor: '#fff', fontFamilyHeader: 'sans', fontFamilyBody: 'sans', backgroundColor: '#fff' }
                },
                {
                    id: 'unlocked',
                    name: 'Unlocked',
                    visualStyle: { primaryColor: '#000', textColor: '#fff', fontFamilyHeader: 'sans', fontFamilyBody: 'sans', backgroundColor: '#fff' }
                }
            ],
            generateCustomTheme: () => Promise.resolve({ id: 'custom' }),
            addCustomTheme: () => { },
            unlockTheme: () => { }
        };

        const fullTheme = {
            id: 'mars',
            visualStyle: { primaryColor: '#000', textColor: '#fff', fontFamilyHeader: 'sans', fontFamilyBody: 'sans', backgroundColor: '#fff' }
        };

        mockSessionStore = {
            theme: signal(fullTheme),
            reflectionMode: signal('visual'),
            setTheme: (id: string) => {
                // Find in gemini mock or return default full theme
                const t = mockGeminiService.getAllThemes().find((x: any) => x.id === id) || fullTheme;
                mockSessionStore.theme.set(t);
            },
            setReflectionMode: () => { }
        };

        await TestBed.configureTestingModule({
            imports: [DestinationGalleryComponent],
            providers: [
                { provide: GeminiService, useValue: mockGeminiService },
                { provide: SessionStore, useValue: mockSessionStore }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DestinationGalleryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should scroll to the new theme when active theme changes', async () => {
        // Spy on prototype since we don't control the specific element instance
        const scrollSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');

        // Act: Change theme externally
        mockSessionStore.setTheme('unlocked');
        // Ensure signals propagate and effects run
        TestBed.flushEffects();

        // Wait for initial delay (50ms) + retry (100ms) = 150ms+
        await new Promise(resolve => setTimeout(resolve, 300));

        // Assert
        expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        // Clean up
        scrollSpy.mockRestore();
    });
});
