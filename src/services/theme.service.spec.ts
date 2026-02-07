import '../test-setup';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { THEMES, ThemeConfig } from '../core/theme.config';

describe('ThemeService', () => {
    let service: ThemeService;
    let mockLocalStorage: any;

    const mockTheme: ThemeConfig = {
        id: 'secret-test',
        name: 'Secret Test',
        shortName: 'SECRET',
        visualStyle: {
            primaryColor: '#000',
            textColor: '#fff',
            fontFamilyHeader: 'sans',
            fontFamilyBody: 'sans',
            backgroundColor: '#fff',
            promptTemplate: 'test',
            filterRaw: 'none'
        },
        textPersona: 'tester',
        poemStructure: 'structure',
        landingSubtitle: 'subtitle',
        uploadButtonLabel: 'UPLOAD',
        captureButtonLabel: 'CAPTURE'
    } as any;

    beforeEach(() => {
        // Mock LocalStorage
        let store: { [key: string]: string } = {};
        mockLocalStorage = {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => {
                store[key] = value + '';
            },
            clear: () => {
                store = {};
            },
            removeItem: (key: string) => {
                delete store[key];
            }
        };

        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });

        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with base themes', () => {
        expect(service.allThemes().length).toBeGreaterThanOrEqual(THEMES.length);
        expect(service.allThemes()).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: 'mars' })
        ]));
    });

    describe('Favorites', () => {
        it('should toggle favorites', () => {
            const themeId = 'mars';
            expect(service.isFavorite(themeId)).toBe(false);

            service.toggleFavorite(themeId);
            expect(service.isFavorite(themeId)).toBe(true);

            service.toggleFavorite(themeId);
            expect(service.isFavorite(themeId)).toBe(false);
        });

        it('should persist favorites to localStorage', () => {
            const themeId = 'mars';
            service.toggleFavorite(themeId);

            const stored = JSON.parse(mockLocalStorage.getItem('ptm_favorite_themes'));
            expect(stored).toContain(themeId);
        });

        it('should sort favorites to the top', () => {
            const t1 = THEMES[0];
            const t2 = THEMES[1];

            // Initially, t1 is first (assuming THEMES order)
            // Let's favourite t2
            service.toggleFavorite(t2.id);

            const all = service.allThemes();
            expect(all[0].id).toBe(t2.id);
        });
    });

    describe('Unlocked Themes', () => {
        it('should unlock a theme and persist it', () => {
            const result = service.unlockTheme(mockTheme);
            expect(result).toBe(true);
            expect(service.unlockedThemes()).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: mockTheme.id })
            ]));

            const stored = JSON.parse(mockLocalStorage.getItem('ptm_unlocked_themes'));
            expect(stored).toContain(mockTheme.id);
        });

        it('should not unlock duplicate themes', () => {
            service.unlockTheme(mockTheme);
            const result = service.unlockTheme(mockTheme);
            expect(result).toBe(false);
            expect(service.unlockedThemes().length).toBe(1);
        });

        it('should restore unlocked themes from storage on init', () => {
            // Simulate storage state before service init
            const realThemeId = 'london-frost'; // Use a real ID that exists in secret-themes
            mockLocalStorage.setItem('ptm_unlocked_themes', JSON.stringify([realThemeId]));

            // Re-create service to trigger constructor load
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({});
            const freshService = TestBed.inject(ThemeService);

            expect(freshService.unlockedThemes()).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: realThemeId })
            ]));
        });
    });

    describe('Custom Themes', () => {
        it('should add custom theme and persist it', () => {
            const customTheme: ThemeConfig = { ...mockTheme, id: 'custom-1' };
            service.addCustomTheme(customTheme);

            expect(service.customThemes()).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: 'custom-1' })
            ]));

            const stored = JSON.parse(mockLocalStorage.getItem('ptm_custom_themes'));
            expect(stored).toHaveLength(1);
            expect(stored[0].id).toBe('custom-1');
        });
    });
});
