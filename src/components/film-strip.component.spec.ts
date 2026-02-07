import '../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmStripComponent } from './film-strip.component';
import { SessionStore } from '../store/session.store';
import { ThemeService } from '../services/theme.service';
import { GeminiService } from '../services/gemini.service';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Artifact } from '../core/types';

describe('FilmStripComponent', () => {
    let component: FilmStripComponent;
    let fixture: ComponentFixture<FilmStripComponent>;
    let sessionStoreMock: any;
    let themeServiceMock: any;
    let geminiServiceMock: any;

    beforeEach(async () => {
        // Mock SessionStore
        sessionStoreMock = {
            theme: signal({ id: 'theme-1', name: 'Theme 1', visualStyle: { primaryColor: 'red', backgroundColor: 'black' } }),
            artifactCache: signal(new Map<string, Artifact>()),
            setTheme: vi.fn(),
            getCachedArtifact: vi.fn()
        };

        // Mock ThemeService
        themeServiceMock = {
            allThemes: vi.fn().mockReturnValue([
                { id: 'theme-1', name: 'Theme 1', shortName: 'T1', visualStyle: { primaryColor: 'red', backgroundColor: 'black' } },
                { id: 'theme-2', name: 'Theme 2', shortName: 'T2', visualStyle: { primaryColor: 'blue', backgroundColor: 'white' } }
            ]),
            addCustomTheme: vi.fn()
        };

        // Mock GeminiService
        geminiServiceMock = {
            generateCustomTheme: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [FilmStripComponent],
            providers: [
                { provide: SessionStore, useValue: sessionStoreMock },
                { provide: ThemeService, useValue: themeServiceMock },
                { provide: GeminiService, useValue: geminiServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FilmStripComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display all themes from ThemeService', () => {
        const themeButtons = fixture.nativeElement.querySelectorAll('button.snap-start');
        // +1 for the "Add Custom Theme" button
        expect(themeButtons.length).toBe(3);
    });

    it('should emit themeSwitch when a theme is clicked', () => {
        // Spy on the output emitter
        const emitSpy = vi.spyOn(component.themeSwitch, 'emit');

        // Click the second theme (index 1) which is different from active 'theme-1'
        const themeButtons = fixture.nativeElement.querySelectorAll('button.snap-start');
        themeButtons[1].click();

        expect(emitSpy).toHaveBeenCalledWith('theme-2');
    });

    it('should show thumbnail when artifact is cached', () => {
        // Simulate cache update
        const mockArtifact: Artifact = {
            themeId: 'theme-2',
            imageUrl: 'data:image/png;base64,fake',
            poem: 'test poem',
            prompt: 'test prompt',
            version: 'v1',
            timestamp: 123
        };

        // Update the signal with a new Map containing the artifact
        const newCache = new Map();
        newCache.set('theme-2', mockArtifact);
        sessionStoreMock.artifactCache.set(newCache);

        fixture.detectChanges();

        // Find the button for theme-2 (index 1)
        const themeButtons = fixture.nativeElement.querySelectorAll('button.snap-start');
        const theme2Btn = themeButtons[1];

        const img = theme2Btn.querySelector('img');
        expect(img).toBeTruthy();
        expect(img.src).toContain('fake');
    });

    it('should not show thumbnail when artifact is NOT cached', () => {
        // theme-1 is active but has no cache in our mock initially
        const themeButtons = fixture.nativeElement.querySelectorAll('button.snap-start');
        const theme1Btn = themeButtons[0];

        const img = theme1Btn.querySelector('img');
        expect(img).toBeNull();

        // Check for placeholder div
        const placeholder = theme1Btn.querySelector('div.absolute.inset-0.opacity-80');
        expect(placeholder).toBeTruthy();
    });
});
