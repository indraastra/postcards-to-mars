import '../test-setup';
import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session.store';
import { GeminiService } from '../services/gemini.service';
import { ThemeService } from '../services/theme.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SessionStore', () => {
    let store: SessionStore;
    let geminiServiceMock: Partial<GeminiService>;

    beforeEach(() => {
        geminiServiceMock = {
            clearCache: vi.fn()
        };

        const themeServiceMock = {
            // Mock returning a specific list where 'theme-2' is first
            allThemes: vi.fn().mockReturnValue([
                { id: 'theme-2', name: 'Theme 2' },
                { id: 'theme-1', name: 'Theme 1' }
            ]),
            getTheme: vi.fn().mockImplementation((id) => ({ id, name: id }))
        };

        TestBed.configureTestingModule({
            providers: [
                SessionStore,
                { provide: GeminiService, useValue: geminiServiceMock },
                { provide: ThemeService, useValue: themeServiceMock }
            ]
        });

        store = TestBed.inject(SessionStore);
    });

    it('should be created', () => {
        expect(store).toBeTruthy();
    });

    it('should initialize with the first available theme', () => {
        // Based on our mock, theme-2 is first
        expect(store.theme().id).toBe('theme-2');
    });

    it('should finalize poem correctly without escaped newlines', () => {
        // Arrange
        const history = [
            { prefix: 'Line 1', userInput: 'input1', suffix: '.' },
            { prefix: 'Line 2', userInput: 'input2', suffix: '.' },
            { prefix: 'Line 3', userInput: 'input3', suffix: '.' }
        ];

        // Act
        // Manually simulate adding lines since addPoemLine takes 'any'
        history.forEach(line => store.addPoemLine(line));

        store.finalizePoem();

        // Assert
        const finalPoem = store.finalPoem();
        expect(finalPoem).toContain('\n'); // Should contain literal newline
        expect(finalPoem).not.toContain('\\n'); // Should NOT contain escaped newline

        const lines = finalPoem.split('\n');
        expect(lines.length).toBe(3);
        expect(lines[0]).toContain('Line 1');
    });

    it('should reset state correctly but keep cache', () => {
        store.setImage('test-image');
        store.reset();
        expect(store.originalImage()).toBeNull();
        // clearCache should NOT be called as we keep the multiverse cache
        expect(geminiServiceMock.clearCache).not.toHaveBeenCalled();
    });

    it('should cache and restore artifacts', () => {
        // 1. Set a theme
        store.setTheme('theme-1');
        store.setArtifact('img1', 'prompt1', 'v1', 'poem1');

        // 3. Switch away
        store.setTheme('theme-2');
        expect(store.stylizedImage()).toBeNull();

        // 4. Switch back
        store.setTheme('theme-1');
        expect(store.stylizedImage()).toBe('img1');
        expect(store.finalPoem()).toBe('poem1');
    });

    it('should load state from localStorage on init', () => {
        // Mock localStorage directly on window
        const getItemSpy = vi.spyOn(window.localStorage, 'getItem');
        getItemSpy.mockImplementation((key) => {
            if (key === 'ptm_active_theme') return 'theme-1';
            if (key === 'ptm_reflection_mode') return 'visual';
            return null;
        });

        // Re-create the store to trigger constructor
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                SessionStore,
                { provide: GeminiService, useValue: geminiServiceMock },
                {
                    provide: ThemeService, useValue: {
                        allThemes: vi.fn().mockReturnValue([{ id: 'theme-1', name: 'Theme 1' }]),
                        getTheme: vi.fn().mockReturnValue({ id: 'theme-1', name: 'Theme 1' })
                    }
                }
            ]
        });
        const newStore = TestBed.inject(SessionStore);

        expect(newStore.theme().id).toBe('theme-1');
        expect(newStore.reflectionMode()).toBe('visual');

        getItemSpy.mockRestore();
    });

    it('should save state to localStorage on change', async () => {
        const setItemSpy = vi.spyOn(window.localStorage, 'setItem');

        // Trigger effects
        store.setTheme('theme-1');
        store.setReflectionMode('visual');

        // Effects are async, let's wait a tick
        await new Promise(resolve => setTimeout(resolve, 0));

        // We need TestBed.flushEffects() if using modern Angular testing, 
        // but with generic setup, setTimeout might work or we rely on the fact that Signal effects run.
        // Actually, in TestBed environment, we might need to flush.
        TestBed.flushEffects();

        expect(setItemSpy).toHaveBeenCalledWith('ptm_active_theme', 'theme-1');
        expect(setItemSpy).toHaveBeenCalledWith('ptm_reflection_mode', 'visual');

        setItemSpy.mockRestore();
    });
});
