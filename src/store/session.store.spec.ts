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
            allThemes: () => [],
            getTheme: () => null
        };

        TestBed.configureTestingModule({
            providers: [
                SessionStore,
                { provide: GeminiService, useValue: geminiServiceMock },
                { provide: ThemeService, useValue: themeServiceMock } // Add injection
            ]
        });

        store = TestBed.inject(SessionStore);
    });

    it('should be created', () => {
        expect(store).toBeTruthy();
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

    it('should reset state correctly', () => {
        store.setImage('test-image');
        store.reset();
        expect(store.originalImage()).toBeNull();
        expect(geminiServiceMock.clearCache).toHaveBeenCalled();
    });
});
