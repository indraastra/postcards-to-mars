import '../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeSelectorComponent } from './theme-selector.component';
import { ThemeService } from '../services/theme.service';
import { SessionStore } from '../store/session.store';
import { GeminiService } from '../services/gemini.service';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('ThemeSelectorComponent', () => {
    let component: ThemeSelectorComponent;
    let fixture: ComponentFixture<ThemeSelectorComponent>;
    let mockGeminiService: any;
    let mockThemeService: any;
    let mockSessionStore: any;

    beforeEach(async () => {
        mockGeminiService = {
            generateCustomTheme: () => Promise.resolve({ id: 'custom' }),
            addCustomTheme: () => { } // Still needed? ThemeSelector calls themeService.addCustomTheme usually
        };

        const fullTheme = {
            id: 'mars',
            name: 'Mars',
            visualStyle: { primaryColor: '#000', textColor: '#fff', fontFamilyHeader: 'sans', fontFamilyBody: 'sans', backgroundColor: '#fff' }
        };

        mockThemeService = {
            allThemes: () => [
                fullTheme,
                {
                    id: 'unlocked',
                    name: 'Unlocked',
                    visualStyle: { primaryColor: '#000', textColor: '#fff', fontFamilyHeader: 'sans', fontFamilyBody: 'sans', backgroundColor: '#fff' }
                }
            ],
            isFavorite: () => false,
            toggleFavorite: () => { },
            addCustomTheme: () => { }
        };

        mockSessionStore = {
            theme: signal(fullTheme),
            reflectionMode: signal('visual'),
            setTheme: (id: string) => {
                const t = mockThemeService.allThemes().find((x: any) => x.id === id) || fullTheme;
                mockSessionStore.theme.set(t);
            },
            setReflectionMode: () => { }
        };

        await TestBed.configureTestingModule({
            imports: [ThemeSelectorComponent],
            providers: [
                { provide: GeminiService, useValue: mockGeminiService },
                { provide: ThemeService, useValue: mockThemeService },
                { provide: SessionStore, useValue: mockSessionStore }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ThemeSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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
