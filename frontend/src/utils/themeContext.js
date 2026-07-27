import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/api';

const THEME_CACHE_KEY = 'active_theme_cache';

// ─────────────────────────────────────────────
//  CSS Variable map — theme property → CSS var
// ─────────────────────────────────────────────
const CSS_VAR_MAP = {
    // Brand
    primary: '--primary',
    primaryHover: '--primary-hover',
    secondary: '--secondary',
    secondaryHover: '--secondary-hover',
    accent: '--accent',
    // Text
    textPrimary: '--text',
    textSecondary: '--text-secondary',
    textLight: '--text-light',
    linkColor: '--link-color',
    // Backgrounds
    background: '--bg',
    backgroundSecondary: '--bg-secondary',
    backgroundTertiary: '--bg-tertiary',
    cardBg: '--card-bg',
    modalBg: '--modal-bg',
    // Utility
    border: '--border',
    success: '--success',
    error: '--error',
    warning: '--warning',
    info: '--info',
    // Navbar
    headerBg: '--header-bg',
    headerText: '--header-text',
    headerActiveLink: '--header-active-link',
    headerHoverLink: '--header-hover-link',
    headerDropdownBg: '--header-dropdown-bg',
    headerDropdownText: '--header-dropdown-text',
    // Footer
    footerBg: '--footer-bg',
    footerText: '--footer-text',
    footerLink: '--footer-link',
    footerLinkHover: '--footer-link-hover',
    footerBorder: '--footer-border',
    // Announcement
    announcementBg: '--announcement-bg',
    announcementText: '--announcement-text',
    // Buttons
    buttonText: '--btn-text',
    btnPrimaryBg: '--btn-primary-bg',
    btnPrimaryText: '--btn-primary-text',
    btnPrimaryHoverBg: '--btn-primary-hover',
    btnPrimaryBorder: '--btn-primary-border',
    btnSecondaryBg: '--btn-secondary-bg',
    btnSecondaryText: '--btn-secondary-text',
    btnSecondaryHoverBg: '--btn-secondary-hover',
    btnOutlineBg: '--btn-outline-bg',
    btnOutlineText: '--btn-outline-text',
    btnOutlineBorder: '--btn-outline-border',
    btnOutlineHoverBg: '--btn-outline-hover-bg',
    btnDangerBg: '--btn-danger-bg',
    btnDangerText: '--btn-danger-text',
    btnSuccessBg: '--btn-success-bg',
    btnSuccessText: '--btn-success-text',
    // Product Cards
    cardBorder: '--card-border',
    productNameColor: '--product-name-color',
    productPriceColor: '--product-price-color',
    productDiscountColor: '--product-discount-color',
    ratingStarColor: '--rating-star-color',
    // Forms
    inputBg: '--input-bg',
    inputBorder: '--input-border',
    inputFocusBorder: '--input-focus-border',
    inputPlaceholder: '--input-placeholder',
    labelColor: '--label-color',
};

const CARD_VAR_MAP = {
    borderRadius: '--card-border-radius',
    shadow: '--card-shadow',
    hoverShadow: '--card-hover-shadow',
    hoverScale: '--card-hover-scale',
    borderWidth: '--card-border-width',
};

const ANIM_VAR_MAP = {
    transitionSpeed: '--transition-speed',
};

const TYPO_VAR_MAP = {
    fontFamily: '--font-family',
    fontSizeBase: '--font-size-base',
    fontSizeSm: '--font-size-sm',
    fontSizeLg: '--font-size-lg',
    lineHeight: '--line-height',
    headingLineHeight: '--heading-line-height',
};

/**
 * Applies a full theme object to CSS variables on :root
 */
export const applyThemeToCSSVars = (theme) => {
    if (!theme || typeof document === 'undefined') return;
    const root = document.documentElement;

    const apply = (obj, map) => {
        if (!obj) return;
        Object.entries(map).forEach(([key, cssVar]) => {
            const val = obj[key];
            if (val !== undefined && val !== null && val !== '') {
                root.style.setProperty(cssVar, val);
            }
        });
    };

    apply(theme.colors, CSS_VAR_MAP);
    apply(theme.cards, CARD_VAR_MAP);
    apply(theme.animations, ANIM_VAR_MAP);
    apply(theme.typography, TYPO_VAR_MAP);
};

// ─────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────
const ThemeContext = createContext({
    activeTheme: null,
    allThemes: [],
    previewTheme: null, // theme being previewed in admin — not saved
    loading: true,
    setPreviewTheme: () => { },
    saveTheme: async () => { },
    activateTheme: async () => { },
    refreshThemes: async () => { },
});

export const useTheme = () => useContext(ThemeContext);

// ─────────────────────────────────────────────
//  Helper: Cache
// ─────────────────────────────────────────────
const readCache = () => {
    try {
        const raw = localStorage.getItem(THEME_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
};

const writeCache = (theme) => {
    try {
        localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(theme));
    } catch { /* ignore */ }
};

// ─────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
    const [activeTheme, setActiveTheme] = useState(() => readCache());
    const [allThemes, setAllThemes] = useState([]);
    const [previewTheme, _setPreviewTheme] = useState(null);
    const [loading, setLoading] = useState(true);

    // Apply to CSS immediately when activeTheme changes
    useEffect(() => {
        if (activeTheme) {
            applyThemeToCSSVars(activeTheme);
            writeCache(activeTheme);
        }
    }, [activeTheme]);

    // Preview theme overrides active — revert when preview cleared
    const prevActiveRef = useRef(activeTheme);
    useEffect(() => {
        prevActiveRef.current = activeTheme;
    }, [activeTheme]);

    const setPreviewTheme = useCallback((theme) => {
        _setPreviewTheme(theme);
        if (theme) {
            applyThemeToCSSVars(theme);
        } else {
            // Revert to active
            if (prevActiveRef.current) {
                applyThemeToCSSVars(prevActiveRef.current);
            }
        }
    }, []);

    const fetchActiveTheme = useCallback(async () => {
        try {
            const res = await api.get('/themes/active');
            if (res.data?.success && res.data.data) {
                setActiveTheme(res.data.data);
            }
        } catch (err) {
            // Use cached or defaults
        }
    }, []);

    const fetchAllThemes = useCallback(async () => {
        try {
            const res = await api.get('/themes');
            if (res.data?.success) {
                setAllThemes(res.data.data || []);
            }
        } catch (err) { /* silent */ }
    }, []);

    const refreshThemes = useCallback(async () => {
        await Promise.all([fetchActiveTheme(), fetchAllThemes()]);
    }, [fetchActiveTheme, fetchAllThemes]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            // Apply cached immediately so there's no flash
            const cached = readCache();
            if (cached) applyThemeToCSSVars(cached);
            await fetchActiveTheme();
            setLoading(false);
        };
        init();
    }, [fetchActiveTheme]);

    const saveTheme = useCallback(async (themeId, themeData) => {
        const res = await api.put(`/themes/${themeId}`, themeData);
        if (res.data?.success) {
            const updated = res.data.data;
            setAllThemes(prev => prev.map(t => t._id === updated._id ? updated : t));
            if (updated.isActive) {
                setActiveTheme(updated);
            }
            return updated;
        }
        throw new Error(res.data?.message || 'Failed to save theme');
    }, []);

    const activateTheme = useCallback(async (themeId) => {
        const res = await api.put(`/themes/${themeId}/activate`);
        if (res.data?.success) {
            const updated = res.data.data;
            setActiveTheme(updated);
            setAllThemes(prev => prev.map(t => ({ ...t, isActive: t._id === updated._id })));
            applyThemeToCSSVars(updated);
            return updated;
        }
        throw new Error(res.data?.message || 'Failed to activate theme');
    }, []);

    const value = useMemo(() => ({
        activeTheme,
        allThemes,
        previewTheme,
        loading,
        setPreviewTheme,
        saveTheme,
        activateTheme,
        refreshThemes,
        fetchAllThemes,
    }), [activeTheme, allThemes, previewTheme, loading, setPreviewTheme, saveTheme, activateTheme, refreshThemes, fetchAllThemes]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
