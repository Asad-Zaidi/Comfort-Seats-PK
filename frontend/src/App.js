// Dear Programmer:
// When I wrote this code, only God and I knew How it Worked?
// Now After completing it Only God Knows it...!!!
//
// Therefore, if you are trying to optimize this routines and it
// fails (most surely).
// Plz do not try to contact me, I will not be able to help you...!!!
// Just Increase this counter as a
// Warning for the next person who tries to optimize this code.
// 
// Total_Hours_Wasted = 601

import { useEffect } from "react";
import Navbar from "./components/Navbar";
import AnnouncementBar from "./components/AnnouncementBar";
import AppRoutes from "./routes/AppRoutes";
import { setAuthToken } from "./api/api";

import { ToastProvider } from "./components/ToastNotification";
import { SiteConfigProvider, useSiteConfig } from "./utils/siteConfig";
import { ThemeProvider, useTheme } from "./utils/themeContext";
import { ShopProvider } from "./context/ShopContext";
import FacebookPixel from "./components/FacebookPixel";

const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
if (token) setAuthToken(token);

const FaviconUpdater = () => {
  const { faviconUrl } = useSiteConfig();
  if (typeof document === "undefined" || !faviconUrl) return null;
  const link = document.querySelector("link#favicon");
  if (link) link.href = faviconUrl;
  return null;
};

// Applies colors from the site config (legacy fallback for colors stored in SiteContent)
// The ThemeApplier below takes priority if a Theme document exists
const LegacyColorApplier = () => {
  const { siteContent } = useSiteConfig();
  const { activeTheme } = useTheme();
  const colors = siteContent?.colors;

  useEffect(() => {
    // Only apply legacy colors if there is no active theme from the Themes collection
    if (activeTheme) return;
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
      '--btn-primary-bg': colors.primary,
      '--btn-primary-text': colors.buttonText,
      '--btn-primary-hover': colors.primaryHover,
      '--product-price-color': colors.primary,
      '--product-discount-color': colors.error,
    };
    Object.entries(vars).forEach(([k, v]) => { if (v) root.style.setProperty(k, v); });
  }, [colors, activeTheme]);

  return null;
};

function App() {
  return (
    <SiteConfigProvider>
      <ThemeProvider>
        <ToastProvider>
          <ShopProvider>
            <FacebookPixel />
            <FaviconUpdater />
            <LegacyColorApplier />
            <AnnouncementBar />
            <Navbar />
            <AppRoutes />
          </ShopProvider>
        </ToastProvider>
      </ThemeProvider>
    </SiteConfigProvider>
  );
}

export default App;