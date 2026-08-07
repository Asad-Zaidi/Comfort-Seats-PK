import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/api";

const SITE_CONTENT_CACHE_KEY = "site_content";

export const invalidateSiteContentCache = () => {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(SITE_CONTENT_CACHE_KEY);
    } catch {
        // ignore
    }
};

export const writeCache = (data) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(SITE_CONTENT_CACHE_KEY, JSON.stringify(data));
    } catch {
        // ignore storage write failures
    }
};

const readCache = () => {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(SITE_CONTENT_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const defaultColors = {
    primary: '#2F6FED',
    primaryHover: '#1d4ed8',
    secondary: '#F5A524',
    secondaryHover: '#d48c1a',
    accent: '#f97316',
    textPrimary: '#12131A',
    textSecondary: '#6b7280',
    textLight: '#9ca3af',
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    backgroundTertiary: '#FAF9F6',
    border: '#e5e7eb',
    success: '#10B981',
    error: '#E5484D',
    headerBg: '#ffffff',
    headerText: '#1f2937',
    footerBg: '#12131A',
    footerText: '#ffffff',
    buttonText: '#ffffff',
    cardBg: '#ffffff',
    announcementBg: '#12131A',
    announcementText: '#ffffff',
};

export const resolveSiteUrl = (rawUrl) => {
    let url = (typeof rawUrl === "string" ? rawUrl : "").trim();

    // 1. If a valid non-localhost URL was configured, use it
    if (url && !url.includes("localhost") && !url.includes("127.0.0.1")) {
        return url.replace(/\/+$/, '');
    }

    // 2. If running in a browser on a live non-localhost origin
    if (typeof window !== "undefined" && window.location?.origin) {
        const origin = window.location.origin;
        if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
            return origin.replace(/\/+$/, '');
        }
    }

    // 3. Fallback to main production domain when on localhost or unconfigured
    const fallback = process.env.REACT_APP_SITE_URL || "https://comfortseatspk.com";
    return fallback.replace(/\/+$/, '');
};

const withDefaults = (data = {}) => {
    const safeData = data || {};
    return {
        ...safeData,
        siteName: safeData.siteName || "Comfort Seats PK",
        siteUrl: resolveSiteUrl(safeData.siteUrl),
        siteTitle: safeData.siteTitle || "Comfort Seats PK - Premium Chairs in Lahore",
        keywords: safeData.keywords || "Office Chairs, Gaming Chairs, Bar Stools, Waiting Chairs, Office Furniture, Lahore, Furniture, Ergonomic Chairs",
        logoUrl: safeData.logoUrl || "",
        faviconUrl: safeData.faviconUrl || "",
        whatsappNumber: safeData.whatsappNumber || "",
        colors: { ...defaultColors, ...(safeData.colors || {}) },
    };
};

export const fetchSiteContent = async () => {
    const cached = readCache();
    if (cached?.data) {
        return withDefaults(cached.data);
    }

    const res = await api.get("/site-content");
    if (res.data?.success && res.data.data) {
        writeCache({ data: withDefaults(res.data.data), fetchedAt: Date.now() });
        return withDefaults(res.data.data);
    }

    if (cached?.data) {
        return withDefaults(cached.data);
    }

    return withDefaults({});
};

export const SiteConfigProvider = ({ children }) => {
    const [siteContent, setSiteContent] = useState(() => withDefaults(readCache()?.data || null));

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const data = await fetchSiteContent();
            if (!cancelled && data) {
                setSiteContent(data);
            }
        };

        load();

        const onStorage = (event) => {
            if (event.key === SITE_CONTENT_CACHE_KEY) {
                const data = withDefaults(readCache()?.data);
                if (data) setSiteContent(data);
            }
        };

        window.addEventListener("storage", onStorage);
        return () => {
            cancelled = true;
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const siteName = siteContent?.siteName || "";
    const siteUrl = resolveSiteUrl(siteContent?.siteUrl);
    const siteTitle = siteContent?.siteTitle || "";
    const keywords = siteContent?.keywords || "";
    const logoUrl = siteContent?.logoUrl || "";
    const faviconUrl = siteContent?.faviconUrl || "";
    const whatsappNumber = siteContent?.whatsappNumber || "";

    const value = useMemo(() => ({ siteContent, siteName, siteUrl, siteTitle, keywords, logoUrl, faviconUrl, whatsappNumber, setSiteContent }), [siteContent, siteName, siteUrl, siteTitle, keywords, logoUrl, faviconUrl, whatsappNumber, setSiteContent]);

    return (
        <SiteConfigContext.Provider value={value}>
            {children}
        </SiteConfigContext.Provider>
    );
};

export const SiteConfigContext = createContext({
    siteContent: null,
    siteName: "",
    siteUrl: "",
    siteTitle: "",
    keywords: "",
    logoUrl: "",
    faviconUrl: "",
    whatsappNumber: "",
    setSiteContent: () => { },
});

export const useSiteConfig = () => useContext(SiteConfigContext);
