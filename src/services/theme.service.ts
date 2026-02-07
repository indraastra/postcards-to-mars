import { Injectable, signal, computed, effect } from '@angular/core';
import { ThemeConfig, THEMES } from '../core/theme.config';
import { getAllSecretThemes } from '../core/secret-themes';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly STORAGE_KEY_UNLOCKED = 'ptm_unlocked_themes';
    private readonly STORAGE_KEY_FAVORITES = 'ptm_favorite_themes';
    private readonly STORAGE_KEY_CUSTOM = 'ptm_custom_themes';

    // Base State
    private readonly baseThemes = signal<ThemeConfig[]>(THEMES);

    // Persisted State
    readonly unlockedThemes = signal<ThemeConfig[]>([]);
    readonly customThemes = signal<ThemeConfig[]>([]);
    readonly favoriteIds = signal<string[]>([]);

    // Computed: All Themes, with Favorites sorted to the top
    readonly allThemes = computed(() => {
        // 1. Gather all available themes
        const all = [
            ...this.baseThemes(),
            ...this.unlockedThemes(),
            ...this.customThemes()
        ];

        // 2. Remove duplicates (priority to custom/unlocked if conflict, though IDs should be unique)
        const uniqueMap = new Map<string, ThemeConfig>();
        all.forEach(t => uniqueMap.set(t.id, t));
        const uniqueList = Array.from(uniqueMap.values());

        // 3. Sort: Favorites first, preserving their order in favoriteIds, then the rest
        const favs = this.favoriteIds();

        return uniqueList.sort((a, b) => {
            const indexA = favs.indexOf(a.id);
            const indexB = favs.indexOf(b.id);

            const isFavA = indexA !== -1;
            const isFavB = indexB !== -1;

            // Both favorites: sort by index in favoriteIds (FIFO of favoriting)
            if (isFavA && isFavB) {
                return indexA - indexB;
            }

            // One favorite: it comes first
            if (isFavA) return -1;
            if (isFavB) return 1;

            // Neither equivalent (keep original relative order or could add standard sort)
            return 0;
        });
    });

    constructor() {
        this.loadFromStorage();
    }

    // --- ACTIONS ---

    unlockTheme(codeOrTheme: string | ThemeConfig): boolean {
        let themeToAdd: ThemeConfig | undefined;

        if (typeof codeOrTheme === 'string') {
            const secrets = getAllSecretThemes();
            themeToAdd = secrets.find(t => {
                // Check if code matches (we might need a way to look up by code if passed, 
                // but getAllSecretThemes returns configs. 
                // Usually unlock logic in AppComponent maps code -> theme.
                // So we assume the caller did the lookup or we are passing the config directly.
                return false;
            });
        } else {
            themeToAdd = codeOrTheme;
        }

        if (!themeToAdd) return false;

        // Check if already unlocked
        const current = this.unlockedThemes();
        if (!current.find(t => t.id === themeToAdd!.id)) {
            this.unlockedThemes.update(list => [...list, themeToAdd!]);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Helper used by AppComponent when it knows the specific unlock code map
    addUnlockedTheme(theme: ThemeConfig) {
        const current = this.unlockedThemes();
        if (!current.find(t => t.id === theme.id)) {
            this.unlockedThemes.update(list => [...list, theme]);
            this.saveToStorage();
        }
    }

    addCustomTheme(theme: ThemeConfig) {
        this.customThemes.update(list => [...list, theme]);
        this.saveToStorage();
    }

    toggleFavorite(themeId: string) {
        this.favoriteIds.update(ids => {
            if (ids.includes(themeId)) {
                return ids.filter(id => id !== themeId);
            } else {
                return [...ids, themeId];
            }
        });
        this.saveToStorage();
    }

    isFavorite(themeId: string): boolean {
        return this.favoriteIds().includes(themeId);
    }

    getTheme(id: string): ThemeConfig | undefined {
        return this.allThemes().find(t => t.id === id);
    }

    // --- STORAGE ---

    private loadFromStorage() {
        try {
            // Load Favorites
            const favs = localStorage.getItem(this.STORAGE_KEY_FAVORITES);
            if (favs) {
                this.favoriteIds.set(JSON.parse(favs));
            }

            // Load Unlocked IDs and re-hydrate from Secret Themes
            const unlockedIds = localStorage.getItem(this.STORAGE_KEY_UNLOCKED);
            if (unlockedIds) {
                const ids: string[] = JSON.parse(unlockedIds);
                const allSecrets = getAllSecretThemes();

                // Find matching configs
                const restored = allSecrets.filter(t => ids.includes(t.id));
                this.unlockedThemes.set(restored);
            }

            // Load Custom Themes (Full objects persisted)
            const custom = localStorage.getItem(this.STORAGE_KEY_CUSTOM);
            if (custom) {
                this.customThemes.set(JSON.parse(custom));
            }

        } catch (e) {
            console.error('Failed to load theme state', e);
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY_FAVORITES, JSON.stringify(this.favoriteIds()));

            // For unlocked, we only save IDs to re-hydrate from source of truth
            const unlockedIds = this.unlockedThemes().map(t => t.id);
            localStorage.setItem(this.STORAGE_KEY_UNLOCKED, JSON.stringify(unlockedIds));

            // For custom, we must save the whole object
            localStorage.setItem(this.STORAGE_KEY_CUSTOM, JSON.stringify(this.customThemes()));
        } catch (e) {
            console.error('Failed to save theme state', e);
        }
    }
}
