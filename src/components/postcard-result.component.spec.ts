import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostcardResultComponent } from './postcard-result.component';
import { SessionStore } from '../store/session.store';
import { GeminiService } from '../services/gemini.service';
import { ThemeService } from '../services/theme.service';
import { signal } from '@angular/core';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';

describe('PostcardResultComponent Loading Messages', () => {
    let component: PostcardResultComponent;
    let fixture: ComponentFixture<PostcardResultComponent>;
    let mockSessionStore: any;
    let mockThemeService: any;
    let themeSignal: any;

    beforeEach(async () => {
        vi.useFakeTimers();

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

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should update loading messages when theme changes', () => {
        // Initial State
        // Component initializes loading cycle in constructor.

        // Advance time slightly to ensure interval might tick if needed, or just check initial state
        vi.advanceTimersByTime(1);
        expect(component.loadingMessage()).toBe('Loading Theme 1...');

        // Change Theme
        themeSignal.set({
            id: 'theme2',
            name: 'Theme 2',
            loadingMessages: ['Loading Theme 2...'],
            visualStyle: { primaryColor: 'blue' }
        });

        fixture.detectChanges();

        // The effect should trigger the startLoadingCycle immediately
        // We advance time to simulate the interval tick if needed, 
        // but startLoadingCycle sets the first message immediately.
        // Let's verify it picked up the new message.
        expect(component.loadingMessage()).toBe('Loading Theme 2...');

        // Clean up
        if (component.loadingInterval) clearInterval(component.loadingInterval);
    });
});
