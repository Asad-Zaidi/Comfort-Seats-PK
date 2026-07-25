import { useEffect } from "react";
import Navbar from "./components/Navbar";
import AnnouncementBar from "./components/AnnouncementBar";
import AppRoutes from "./routes/AppRoutes";
import { setAuthToken } from "./api/api";
import { ToastProvider } from "./components/ToastNotification";
import { SiteConfigProvider, useSiteConfig } from "./utils/siteConfig";

const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
if (token) setAuthToken(token);

const FaviconUpdater = () => {
    const { faviconUrl } = useSiteConfig();
    if (typeof document === "undefined" || !faviconUrl) return null;
    const link = document.querySelector("link#favicon");
    if (link) link.href = faviconUrl;
    return null;
};

const ColorApplier = () => {
    const { siteContent } = useSiteConfig();
    const colors = siteContent?.colors;

    useEffect(() => {
        if (!colors) return;
        const root = document.documentElement;
        const vars = {
            '--primary': colors.primary, '--primary-hover': colors.primaryHover,
            '--secondary': colors.secondary, '--secondary-hover': colors.secondaryHover,
            '--accent': colors.accent,
            '--text': colors.textPrimary, '--text-secondary': colors.textSecondary, '--text-light': colors.textLight,
            '--bg': colors.background, '--bg-secondary': colors.backgroundSecondary, '--bg-tertiary': colors.backgroundTertiary,
            '--border': colors.border, '--success': colors.success, '--error': colors.error,
            '--header-bg': colors.headerBg, '--header-text': colors.headerText,
            '--footer-bg': colors.footerBg, '--footer-text': colors.footerText,
            '--btn-text': colors.buttonText, '--card-bg': colors.cardBg,
            '--announcement-bg': colors.announcementBg, '--announcement-text': colors.announcementText,
        };
        Object.entries(vars).forEach(([k, v]) => { if (v) root.style.setProperty(k, v); });
    }, [colors]);

    return null;
};

function App() {
  return (
    <SiteConfigProvider>
      <ToastProvider>
        <FaviconUpdater />
        <ColorApplier />
        <AnnouncementBar />
        <Navbar />
        <AppRoutes />
      </ToastProvider>
    </SiteConfigProvider>
  );
}

export default App;