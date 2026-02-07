import { Injectable } from '@angular/core';

declare const gtag: Function;

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {

    constructor() { }

    private isGtagAvailable(): boolean {
        return typeof gtag === 'function';
    }

    trackEvent(eventName: string, params: any = {}) {
        if (this.isGtagAvailable()) {
            gtag('event', eventName, params);
            // console.log(`[Analytics] ${eventName}`, params);
        } else {
            console.warn('[Analytics] gtag not available', eventName, params);
        }
    }

    trackUnlock(themeId: string, method: 'code' | 'custom') {
        this.trackEvent('unlock_theme', {
            theme_id: themeId,
            method: method
        });
    }

    trackGeneration(themeId: string, type: 'visual' | 'full', hasPoemContext: boolean) {
        this.trackEvent('generate_postcard', {
            theme_id: themeId,
            generation_type: type,
            has_poem_context: hasPoemContext
        });
    }

    trackRegeneration(themeId: string, type: 'image' | 'poem') {
        this.trackEvent('regenerate_postcard', {
            theme_id: themeId,
            regeneration_type: type
        });
    }

    trackShare(themeId: string, method: 'download' | 'share_api') {
        this.trackEvent('share_postcard', {
            theme_id: themeId,
            method: method
        });
    }

    trackCustomTheme(prompt: string, success: boolean) {
        this.trackEvent('create_custom_theme', {
            prompt_length: prompt.length,
            success: success
        });
    }

    trackFavorite(themeId: string, isFavorite: boolean) {
        this.trackEvent('favorite_theme', {
            theme_id: themeId,
            action: isFavorite ? 'add' : 'remove'
        });
    }

    trackError(source: string, message: string) {
        this.trackEvent('app_error', {
            error_source: source,
            error_message: message
        });
    }
}
