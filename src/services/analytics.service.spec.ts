import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('AnalyticsService', () => {
    let service: AnalyticsService;
    let gtagSpy: any;

    beforeEach(() => {
        // Mock the global gtag function
        gtagSpy = vi.fn();
        (window as any).gtag = gtagSpy;

        TestBed.configureTestingModule({});
        service = TestBed.inject(AnalyticsService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should track unlock_theme event', () => {
        service.trackUnlock('secret-theme', 'code');
        expect(gtagSpy).toHaveBeenCalledWith('event', 'unlock_theme', {
            theme_id: 'secret-theme',
            method: 'code'
        });
    });

    it('should track generate_postcard event', () => {
        service.trackGeneration('theme-1', 'full', true);
        expect(gtagSpy).toHaveBeenCalledWith('event', 'generate_postcard', {
            theme_id: 'theme-1',
            generation_type: 'full',
            has_poem_context: true
        });
    });

    it('should track custom theme event', () => {
        service.trackCustomTheme('test prompt', true);
        expect(gtagSpy).toHaveBeenCalledWith('event', 'create_custom_theme', {
            prompt_length: 11,
            success: true
        });
    });
});
