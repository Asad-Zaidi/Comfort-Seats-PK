import { useCallback, useEffect, useRef, useState } from "react";
import {
    FiAlertCircle, FiCheckCircle, FiLoader, FiSave, FiRotateCcw,
    FiDownload, FiUpload, FiPlus, FiTrash2, FiCopy, FiEye,
    FiChevronDown, FiChevronRight, FiZap, FiCornerUpLeft, FiCornerUpRight,
    FiMonitor, FiSmartphone, FiTablet, FiSearch, FiDroplet,
    FiSliders, FiType, FiSquare, FiActivity, FiLayout
} from "react-icons/fi";
import api from "../../api/api";
import { useToast } from "../../components/ToastNotification";
import { applyThemeToCSSVars } from "../../utils/themeContext";
import PreviewNavbar from "../../components/theme/PreviewNavbar";
import PreviewFooter from "../../components/theme/PreviewFooter";
import PreviewHome from "../../components/theme/PreviewHome";
import PreviewProducts from "../../components/theme/PreviewProducts";
import PreviewProductDetail from "../../components/theme/PreviewProductDetail";
import PreviewComponents from "../../components/theme/PreviewComponents";
import PreviewCart from "../../components/theme/PreviewCart";
import PreviewLogin from "../../components/theme/PreviewLogin";

// ─────────────────────────────────────────────────────────────
//  Default theme values (matches backend defaults)
// ─────────────────────────────────────────────────────────────
const DEFAULT_THEME = {
    name: "Default",
    colors: {
        primary: "#2F6FED", primaryHover: "#1d4ed8",
        secondary: "#F5A524", secondaryHover: "#d48c1a",
        accent: "#f97316",
        background: "#ffffff", backgroundSecondary: "#f8fafc",
        backgroundTertiary: "#FAF9F6", cardBg: "#ffffff",
        textPrimary: "#12131A", textSecondary: "#6b7280", textLight: "#9ca3af",
        linkColor: "#2F6FED",
        headerBg: "#ffffff", headerText: "#1f2937",
        headerActiveLink: "#2F6FED", headerHoverLink: "#2F6FED",
        headerDropdownBg: "#ffffff", headerDropdownText: "#1f2937",
        footerBg: "#12131A", footerText: "#ffffff",
        footerLink: "#9ca3af", footerLinkHover: "#2F6FED",
        footerBorder: "#374151",
        announcementBg: "#12131A", announcementText: "#ffffff",
        btnPrimaryBg: "#2F6FED", btnPrimaryText: "#ffffff",
        btnPrimaryHoverBg: "#1d4ed8", btnPrimaryBorder: "transparent",
        btnSecondaryBg: "#F5A524", btnSecondaryText: "#ffffff",
        btnSecondaryHoverBg: "#d48c1a",
        btnOutlineBg: "transparent", btnOutlineText: "#2F6FED",
        btnOutlineBorder: "#2F6FED", btnOutlineHoverBg: "#2F6FED",
        btnDangerBg: "#E5484D", btnDangerText: "#ffffff",
        btnSuccessBg: "#10B981", btnSuccessText: "#ffffff",
        border: "#e5e7eb", success: "#10B981", error: "#E5484D",
        warning: "#F59E0B", info: "#3B82F6",
        cardBorder: "#e5e7eb", productNameColor: "#12131A",
        productPriceColor: "#2F6FED", productDiscountColor: "#E5484D",
        ratingStarColor: "#F59E0B",
        inputBg: "#ffffff", inputBorder: "#e5e7eb",
        inputFocusBorder: "#2F6FED", inputPlaceholder: "#9ca3af",
        labelColor: "#374151",
        buttonText: "#ffffff",
    },
    typography: {
        fontFamily: "'Google Sans', sans-serif",
        fontSizeBase: "16px", fontSizeSmall: "14px", fontSizeLarge: "18px",
        lineHeight: "1.6", headingLineHeight: "1.2",
    },
    cards: {
        borderRadius: "1rem", shadow: "0 4px 6px rgba(0,0,0,0.07)",
        hoverShadow: "0 20px 40px rgba(0,0,0,0.15)",
        hoverScale: "1.02", borderWidth: "1px",
    },
    animations: {
        enableHoverScale: true, enableButtonRipple: true,
        enableFadeIn: true, enableSlide: true, enableCardLift: true,
        transitionSpeed: "300ms",
    },
};

// ─────────────────────────────────────────────────────────────
//  Preset palettes
// ─────────────────────────────────────────────────────────────
const PALETTES = [
    {
        name: "Classic Blue",
        emoji: "🔵",
        colors: {
            primary: "#2F6FED", primaryHover: "#1d4ed8",
            secondary: "#F5A524", secondaryHover: "#d48c1a",
            accent: "#f97316",
            background: "#ffffff", backgroundSecondary: "#f8fafc", backgroundTertiary: "#FAF9F6", cardBg: "#ffffff",
            textPrimary: "#12131A", textSecondary: "#6b7280", textLight: "#9ca3af", linkColor: "#2F6FED",
            headerBg: "#ffffff", headerText: "#1f2937", headerActiveLink: "#2F6FED", headerHoverLink: "#2F6FED", headerDropdownBg: "#ffffff", headerDropdownText: "#1f2937",
            footerBg: "#12131A", footerText: "#ffffff", footerLink: "#9ca3af", footerLinkHover: "#2F6FED", footerBorder: "#374151",
            announcementBg: "#12131A", announcementText: "#ffffff",
            btnPrimaryBg: "#2F6FED", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#1d4ed8", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#F5A524", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#d48c1a",
            btnOutlineBg: "transparent", btnOutlineText: "#2F6FED", btnOutlineBorder: "#2F6FED", btnOutlineHoverBg: "#2F6FED",
            btnDangerBg: "#E5484D", btnDangerText: "#ffffff", btnSuccessBg: "#10B981", btnSuccessText: "#ffffff",
            border: "#e5e7eb", success: "#10B981", error: "#E5484D", warning: "#F59E0B", info: "#3B82F6",
            cardBorder: "#e5e7eb", productNameColor: "#12131A", productPriceColor: "#2F6FED", productDiscountColor: "#E5484D", ratingStarColor: "#F59E0B",
            inputBg: "#ffffff", inputBorder: "#e5e7eb", inputFocusBorder: "#2F6FED", inputPlaceholder: "#9ca3af", labelColor: "#374151",
        }
    },
    {
        name: "Emerald Luxe",
        emoji: "💚",
        colors: {
            primary: "#059669", primaryHover: "#047857",
            secondary: "#D97706", secondaryHover: "#b45309",
            accent: "#10B981",
            background: "#ffffff", backgroundSecondary: "#f0fdf4", backgroundTertiary: "#ecfdf5", cardBg: "#ffffff",
            textPrimary: "#064e3b", textSecondary: "#374151", textLight: "#6b7280", linkColor: "#059669",
            headerBg: "#ffffff", headerText: "#064e3b", headerActiveLink: "#059669", headerHoverLink: "#059669", headerDropdownBg: "#ffffff", headerDropdownText: "#064e3b",
            footerBg: "#064e3b", footerText: "#ffffff", footerLink: "#a7f3d0", footerLinkHover: "#ffffff", footerBorder: "#047857",
            announcementBg: "#047857", announcementText: "#ffffff",
            btnPrimaryBg: "#059669", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#047857", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#D97706", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#b45309",
            btnOutlineBg: "transparent", btnOutlineText: "#059669", btnOutlineBorder: "#059669", btnOutlineHoverBg: "#059669",
            btnDangerBg: "#E5484D", btnDangerText: "#ffffff", btnSuccessBg: "#10B981", btnSuccessText: "#ffffff",
            border: "#d1fae5", success: "#10B981", error: "#E5484D", warning: "#F59E0B", info: "#3B82F6",
            cardBorder: "#a7f3d0", productNameColor: "#064e3b", productPriceColor: "#059669", productDiscountColor: "#E5484D", ratingStarColor: "#F59E0B",
            inputBg: "#ffffff", inputBorder: "#a7f3d0", inputFocusBorder: "#059669", inputPlaceholder: "#9ca3af", labelColor: "#064e3b",
        }
    },
    {
        name: "Royal Purple",
        emoji: "💜",
        colors: {
            primary: "#7C3AED", primaryHover: "#6d28d9",
            secondary: "#F59E0B", secondaryHover: "#d97706",
            accent: "#EC4899",
            background: "#ffffff", backgroundSecondary: "#f5f3ff", backgroundTertiary: "#faf5ff", cardBg: "#ffffff",
            textPrimary: "#4c1d95", textSecondary: "#4b5563", textLight: "#9ca3af", linkColor: "#7C3AED",
            headerBg: "#ffffff", headerText: "#4c1d95", headerActiveLink: "#7C3AED", headerHoverLink: "#7C3AED", headerDropdownBg: "#ffffff", headerDropdownText: "#4c1d95",
            footerBg: "#2e1065", footerText: "#ffffff", footerLink: "#ddd6fe", footerLinkHover: "#ffffff", footerBorder: "#4c1d95",
            announcementBg: "#4c1d95", announcementText: "#ffffff",
            btnPrimaryBg: "#7C3AED", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#6d28d9", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#F59E0B", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#d97706",
            btnOutlineBg: "transparent", btnOutlineText: "#7C3AED", btnOutlineBorder: "#7C3AED", btnOutlineHoverBg: "#7C3AED",
            btnDangerBg: "#E5484D", btnDangerText: "#ffffff", btnSuccessBg: "#10B981", btnSuccessText: "#ffffff",
            border: "#e9d5ff", success: "#10B981", error: "#E5484D", warning: "#F59E0B", info: "#3B82F6",
            cardBorder: "#ddd6fe", productNameColor: "#2e1065", productPriceColor: "#7C3AED", productDiscountColor: "#E5484D", ratingStarColor: "#F59E0B",
            inputBg: "#ffffff", inputBorder: "#ddd6fe", inputFocusBorder: "#7C3AED", inputPlaceholder: "#9ca3af", labelColor: "#2e1065",
        }
    },
    {
        name: "Sunset Orange",
        emoji: "🟠",
        colors: {
            primary: "#EA580C", primaryHover: "#c2410c",
            secondary: "#2563EB", secondaryHover: "#1d4ed8",
            accent: "#F59E0B",
            background: "#ffffff", backgroundSecondary: "#fff7ed", backgroundTertiary: "#ffedd5", cardBg: "#ffffff",
            textPrimary: "#7c2d12", textSecondary: "#4b5563", textLight: "#9ca3af", linkColor: "#EA580C",
            headerBg: "#ffffff", headerText: "#7c2d12", headerActiveLink: "#EA580C", headerHoverLink: "#EA580C", headerDropdownBg: "#ffffff", headerDropdownText: "#7c2d12",
            footerBg: "#431407", footerText: "#ffffff", footerLink: "#ffedd5", footerLinkHover: "#ffffff", footerBorder: "#7c2d12",
            announcementBg: "#7c2d12", announcementText: "#ffffff",
            btnPrimaryBg: "#EA580C", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#c2410c", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#2563EB", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#1d4ed8",
            btnOutlineBg: "transparent", btnOutlineText: "#EA580C", btnOutlineBorder: "#EA580C", btnOutlineHoverBg: "#EA580C",
            btnDangerBg: "#E5484D", btnDangerText: "#ffffff", btnSuccessBg: "#10B981", btnSuccessText: "#ffffff",
            border: "#fed7aa", success: "#10B981", error: "#E5484D", warning: "#F59E0B", info: "#3B82F6",
            cardBorder: "#ffedd5", productNameColor: "#431407", productPriceColor: "#EA580C", productDiscountColor: "#E5484D", ratingStarColor: "#F59E0B",
            inputBg: "#ffffff", inputBorder: "#fed7aa", inputFocusBorder: "#EA580C", inputPlaceholder: "#9ca3af", labelColor: "#431407",
        }
    },
    {
        name: "Midnight Dark",
        emoji: "🌑",
        colors: {
            primary: "#3B82F6", primaryHover: "#2563eb",
            secondary: "#F59E0B", secondaryHover: "#d97706",
            accent: "#10B981",
            background: "#0F172A", backgroundSecondary: "#1E293B", backgroundTertiary: "#334155", cardBg: "#1E293B",
            textPrimary: "#F8FAFC", textSecondary: "#94A3B8", textLight: "#64748B", linkColor: "#3B82F6",
            headerBg: "#1E293B", headerText: "#F8FAFC", headerActiveLink: "#60A5FA", headerHoverLink: "#60A5FA", headerDropdownBg: "#1E293B", headerDropdownText: "#F8FAFC",
            footerBg: "#020617", footerText: "#F8FAFC", footerLink: "#94A3B8", footerLinkHover: "#60A5FA", footerBorder: "#334155",
            announcementBg: "#020617", announcementText: "#60A5FA",
            btnPrimaryBg: "#3B82F6", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#2563eb", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#F59E0B", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#d97706",
            btnOutlineBg: "transparent", btnOutlineText: "#60A5FA", btnOutlineBorder: "#3B82F6", btnOutlineHoverBg: "#3B82F6",
            btnDangerBg: "#EF4444", btnDangerText: "#ffffff", btnSuccessBg: "#10B981", btnSuccessText: "#ffffff",
            border: "#334155", success: "#10B981", error: "#EF4444", warning: "#F59E0B", info: "#3B82F6",
            cardBorder: "#334155", productNameColor: "#F8FAFC", productPriceColor: "#60A5FA", productDiscountColor: "#F87171", ratingStarColor: "#F59E0B",
            inputBg: "#0F172A", inputBorder: "#334155", inputFocusBorder: "#3B82F6", inputPlaceholder: "#64748B", labelColor: "#E2E8F0",
        }
    },
    {
        name: "Luxury Gold",
        emoji: "✨",
        colors: {
            primary: "#D97706", primaryHover: "#b45309",
            secondary: "#7C3AED", secondaryHover: "#6d28d9",
            accent: "#F59E0B",
            background: "#0A0A0A", backgroundSecondary: "#141414", backgroundTertiary: "#1F1F1F", cardBg: "#171717",
            textPrimary: "#F5E6C8", textSecondary: "#C9A96E", textLight: "#8C7A5B", linkColor: "#F59E0B",
            headerBg: "#0D0D0D", headerText: "#F5E6C8", headerActiveLink: "#F59E0B", headerHoverLink: "#F59E0B", headerDropdownBg: "#141414", headerDropdownText: "#F5E6C8",
            footerBg: "#050505", footerText: "#F5E6C8", footerLink: "#C9A96E", footerLinkHover: "#F59E0B", footerBorder: "#2A2A2A",
            announcementBg: "#171717", announcementText: "#F59E0B",
            btnPrimaryBg: "#D97706", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#b45309", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#7C3AED", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#6d28d9",
            btnOutlineBg: "transparent", btnOutlineText: "#F59E0B", btnOutlineBorder: "#D97706", btnOutlineHoverBg: "#D97706",
            btnDangerBg: "#E5484D", btnDangerText: "#ffffff", btnSuccessBg: "#10B981", btnSuccessText: "#ffffff",
            border: "#2A2A2A", success: "#10B981", error: "#E5484D", warning: "#F59E0B", info: "#3B82F6",
            cardBorder: "#2A2A2A", productNameColor: "#F5E6C8", productPriceColor: "#F59E0B", productDiscountColor: "#F87171", ratingStarColor: "#F59E0B",
            inputBg: "#141414", inputBorder: "#2A2A2A", inputFocusBorder: "#D97706", inputPlaceholder: "#8C7A5B", labelColor: "#F5E6C8",
        }
    },
    {
        name: "Rose Velvet",
        emoji: "🌸",
        colors: {
            primary: "#E11D48", primaryHover: "#be123c",
            secondary: "#F59E0B", secondaryHover: "#d97706",
            accent: "#F43F5E",
            background: "#ffffff", backgroundSecondary: "#fff1f2", backgroundTertiary: "#ffe4e6", cardBg: "#ffffff",
            textPrimary: "#881337", textSecondary: "#4b5563", textLight: "#9ca3af", linkColor: "#E11D48",
            headerBg: "#ffffff", headerText: "#881337", headerActiveLink: "#E11D48", headerHoverLink: "#E11D48", headerDropdownBg: "#ffffff", headerDropdownText: "#881337",
            footerBg: "#4c0519", footerText: "#ffffff", footerLink: "#fecdd3", footerLinkHover: "#ffffff", footerBorder: "#881337",
            announcementBg: "#881337", announcementText: "#ffffff",
            btnPrimaryBg: "#E11D48", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#be123c", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#F59E0B", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#d97706",
            btnOutlineBg: "transparent", btnOutlineText: "#E11D48", btnOutlineBorder: "#E11D48", btnOutlineHoverBg: "#E11D48",
            btnDangerBg: "#E5484D", btnDangerText: "#ffffff", btnSuccessBg: "#10B981", btnSuccessText: "#ffffff",
            border: "#fecdd3", success: "#10B981", error: "#E5484D", warning: "#F59E0B", info: "#3B82F6",
            cardBorder: "#ffe4e6", productNameColor: "#4c0519", productPriceColor: "#E11D48", productDiscountColor: "#E5484D", ratingStarColor: "#F59E0B",
            inputBg: "#ffffff", inputBorder: "#fecdd3", inputFocusBorder: "#E11D48", inputPlaceholder: "#9ca3af", labelColor: "#4c0519",
        }
    },
    {
        name: "Nordic Frost",
        emoji: "❄️",
        colors: {
            primary: "#0284C7", primaryHover: "#0369a1",
            secondary: "#6366F1", secondaryHover: "#4f46e5",
            accent: "#06B6D4",
            background: "#ffffff", backgroundSecondary: "#f0f9ff", backgroundTertiary: "#e0f2fe", cardBg: "#ffffff",
            textPrimary: "#0c4a6e", textSecondary: "#475569", textLight: "#94a3b8", linkColor: "#0284C7",
            headerBg: "#ffffff", headerText: "#0c4a6e", headerActiveLink: "#0284C7", headerHoverLink: "#0284C7", headerDropdownBg: "#ffffff", headerDropdownText: "#0c4a6e",
            footerBg: "#075985", footerText: "#ffffff", footerLink: "#bae6fd", footerLinkHover: "#ffffff", footerBorder: "#0369a1",
            announcementBg: "#0369a1", announcementText: "#ffffff",
            btnPrimaryBg: "#0284C7", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#0369a1", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#6366F1", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#4f46e5",
            btnOutlineBg: "transparent", btnOutlineText: "#0284C7", btnOutlineBorder: "#0284C7", btnOutlineHoverBg: "#0284C7",
            btnDangerBg: "#E5484D", btnDangerText: "#ffffff", btnSuccessBg: "#10B981", btnSuccessText: "#ffffff",
            border: "#bae6fd", success: "#10B981", error: "#E5484D", warning: "#F59E0B", info: "#0284C7",
            cardBorder: "#e0f2fe", productNameColor: "#0c4a6e", productPriceColor: "#0284C7", productDiscountColor: "#E5484D", ratingStarColor: "#F59E0B",
            inputBg: "#ffffff", inputBorder: "#bae6fd", inputFocusBorder: "#0284C7", inputPlaceholder: "#94a3b8", labelColor: "#0c4a6e",
        }
    },
    {
        name: "Cyberpunk Neon",
        emoji: "⚡",
        colors: {
            primary: "#00F0FF", primaryHover: "#00c4d1",
            secondary: "#FF007A", secondaryHover: "#d60067",
            accent: "#7000FF",
            background: "#0B0E14", backgroundSecondary: "#121824", backgroundTertiary: "#1A2332", cardBg: "#121824",
            textPrimary: "#FFFFFF", textSecondary: "#A0AEC0", textLight: "#64748B", linkColor: "#00F0FF",
            headerBg: "#0B0E14", headerText: "#FFFFFF", headerActiveLink: "#00F0FF", headerHoverLink: "#00F0FF", headerDropdownBg: "#121824", headerDropdownText: "#FFFFFF",
            footerBg: "#05070A", footerText: "#FFFFFF", footerLink: "#A0AEC0", footerLinkHover: "#00F0FF", footerBorder: "#1A2332",
            announcementBg: "#121824", announcementText: "#FF007A",
            btnPrimaryBg: "#00F0FF", btnPrimaryText: "#0B0E14", btnPrimaryHoverBg: "#00c4d1", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#FF007A", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#d60067",
            btnOutlineBg: "transparent", btnOutlineText: "#00F0FF", btnOutlineBorder: "#00F0FF", btnOutlineHoverBg: "#00F0FF",
            btnDangerBg: "#FF0055", btnDangerText: "#ffffff", btnSuccessBg: "#00FF66", btnSuccessText: "#0B0E14",
            border: "#1A2332", success: "#00FF66", error: "#FF0055", warning: "#FFB800", info: "#00F0FF",
            cardBorder: "#1A2332", productNameColor: "#FFFFFF", productPriceColor: "#00F0FF", productDiscountColor: "#FF007A", ratingStarColor: "#FFB800",
            inputBg: "#0B0E14", inputBorder: "#1A2332", inputFocusBorder: "#00F0FF", inputPlaceholder: "#64748B", labelColor: "#E2E8F0",
        }
    },
    {
        name: "Slate Minimal",
        emoji: "🩶",
        colors: {
            primary: "#0F172A", primaryHover: "#334155",
            secondary: "#64748B", secondaryHover: "#475569",
            accent: "#2563EB",
            background: "#FFFFFF", backgroundSecondary: "#F8FAFC", backgroundTertiary: "#F1F5F9", cardBg: "#FFFFFF",
            textPrimary: "#0F172A", textSecondary: "#475569", textLight: "#94A3B8", linkColor: "#0F172A",
            headerBg: "#FFFFFF", headerText: "#0F172A", headerActiveLink: "#0F172A", headerHoverLink: "#2563EB", headerDropdownBg: "#FFFFFF", headerDropdownText: "#0F172A",
            footerBg: "#0F172A", footerText: "#FFFFFF", footerLink: "#94A3B8", footerLinkHover: "#FFFFFF", footerBorder: "#1E293B",
            announcementBg: "#0F172A", announcementText: "#FFFFFF",
            btnPrimaryBg: "#0F172A", btnPrimaryText: "#FFFFFF", btnPrimaryHoverBg: "#334155", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#F1F5F9", btnSecondaryText: "#0F172A", btnSecondaryHoverBg: "#E2E8F0",
            btnOutlineBg: "transparent", btnOutlineText: "#0F172A", btnOutlineBorder: "#0F172A", btnOutlineHoverBg: "#0F172A",
            btnDangerBg: "#E5484D", btnDangerText: "#FFFFFF", btnSuccessBg: "#10B981", btnSuccessText: "#FFFFFF",
            border: "#E2E8F0", success: "#10B981", error: "#E5484D", warning: "#F59E0B", info: "#2563EB",
            cardBorder: "#E2E8F0", productNameColor: "#0F172A", productPriceColor: "#0F172A", productDiscountColor: "#E5484D", ratingStarColor: "#F59E0B",
            inputBg: "#FFFFFF", inputBorder: "#CBD5E1", inputFocusBorder: "#0F172A", inputPlaceholder: "#94A3B8", labelColor: "#0F172A",
        }
    },
    {
        name: "Fintech Indigo",
        emoji: "🌐",
        colors: {
            primary: "#4F46E5", primaryHover: "#4338CA",
            secondary: "#0EA5E9", secondaryHover: "#0284C7",
            accent: "#6366F1",
            background: "#FFFFFF", backgroundSecondary: "#F8FAFC", backgroundTertiary: "#EEF2FF", cardBg: "#FFFFFF",
            textPrimary: "#1E1B4B", textSecondary: "#475569", textLight: "#94A3B8", linkColor: "#4F46E5",
            headerBg: "#FFFFFF", headerText: "#1E1B4B", headerActiveLink: "#4F46E5", headerHoverLink: "#4F46E5", headerDropdownBg: "#FFFFFF", headerDropdownText: "#1E1B4B",
            footerBg: "#1E1B4B", footerText: "#FFFFFF", footerLink: "#C7D2FE", footerLinkHover: "#FFFFFF", footerBorder: "#312E81",
            announcementBg: "#312E81", announcementText: "#FFFFFF",
            btnPrimaryBg: "#4F46E5", btnPrimaryText: "#FFFFFF", btnPrimaryHoverBg: "#4338CA", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#EEF2FF", btnSecondaryText: "#4F46E5", btnSecondaryHoverBg: "#E0E7FF",
            btnOutlineBg: "transparent", btnOutlineText: "#4F46E5", btnOutlineBorder: "#4F46E5", btnOutlineHoverBg: "#4F46E5",
            btnDangerBg: "#E5484D", btnDangerText: "#FFFFFF", btnSuccessBg: "#10B981", btnSuccessText: "#FFFFFF",
            border: "#E0E7FF", success: "#10B981", error: "#E5484D", warning: "#F59E0B", info: "#0EA5E9",
            cardBorder: "#E0E7FF", productNameColor: "#1E1B4B", productPriceColor: "#4F46E5", productDiscountColor: "#E5484D", ratingStarColor: "#F59E0B",
            inputBg: "#FFFFFF", inputBorder: "#C7D2FE", inputFocusBorder: "#4F46E5", inputPlaceholder: "#94A3B8", labelColor: "#1E1B4B",
        }
    },
    {
        name: "Earthy Terracotta",
        emoji: "🪵",
        colors: {
            primary: "#9A3412", primaryHover: "#7C2D12",
            secondary: "#D97706", secondaryHover: "#B45309",
            accent: "#C2410C",
            background: "#FFFFFF", backgroundSecondary: "#FFFBEB", backgroundTertiary: "#FEF3C7", cardBg: "#FFFFFF",
            textPrimary: "#451A03", textSecondary: "#78350F", textLight: "#A16207", linkColor: "#9A3412",
            headerBg: "#FFFFFF", headerText: "#451A03", headerActiveLink: "#9A3412", headerHoverLink: "#9A3412", headerDropdownBg: "#FFFFFF", headerDropdownText: "#451A03",
            footerBg: "#291002", footerText: "#FFFFFF", footerLink: "#FDE68A", footerLinkHover: "#FFFFFF", footerBorder: "#451A03",
            announcementBg: "#451A03", announcementText: "#FFFFFF",
            btnPrimaryBg: "#9A3412", btnPrimaryText: "#FFFFFF", btnPrimaryHoverBg: "#7C2D12", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#FEF3C7", btnSecondaryText: "#78350F", btnSecondaryHoverBg: "#FDE68A",
            btnOutlineBg: "transparent", btnOutlineText: "#9A3412", btnOutlineBorder: "#9A3412", btnOutlineHoverBg: "#9A3412",
            btnDangerBg: "#E5484D", btnDangerText: "#FFFFFF", btnSuccessBg: "#16A34A", btnSuccessText: "#FFFFFF",
            border: "#FDE68A", success: "#16A34A", error: "#E5484D", warning: "#D97706", info: "#2563EB",
            cardBorder: "#FEF3C7", productNameColor: "#291002", productPriceColor: "#9A3412", productDiscountColor: "#E5484D", ratingStarColor: "#D97706",
            inputBg: "#FFFFFF", inputBorder: "#FDE68A", inputFocusBorder: "#9A3412", inputPlaceholder: "#A16207", labelColor: "#451A03",
        }
    },
    {
        name: "Obsidian Dark",
        emoji: "🖤",
        colors: {
            primary: "#E2E8F0", primaryHover: "#F8FAFC",
            secondary: "#A855F7", secondaryHover: "#9333EA",
            accent: "#38BDF8",
            background: "#09090B", backgroundSecondary: "#121215", backgroundTertiary: "#18181B", cardBg: "#121215",
            textPrimary: "#F8FAFC", textSecondary: "#A1A1AA", textLight: "#71717A", linkColor: "#38BDF8",
            headerBg: "#121215", headerText: "#F8FAFC", headerActiveLink: "#38BDF8", headerHoverLink: "#38BDF8", headerDropdownBg: "#18181B", headerDropdownText: "#F8FAFC",
            footerBg: "#000000", footerText: "#F8FAFC", footerLink: "#A1A1AA", footerLinkHover: "#38BDF8", footerBorder: "#27272A",
            announcementBg: "#18181B", announcementText: "#F8FAFC",
            btnPrimaryBg: "#F8FAFC", btnPrimaryText: "#09090B", btnPrimaryHoverBg: "#E2E8F0", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#27272A", btnSecondaryText: "#F8FAFC", btnSecondaryHoverBg: "#3F3F46",
            btnOutlineBg: "transparent", btnOutlineText: "#F8FAFC", btnOutlineBorder: "#3F3F46", btnOutlineHoverBg: "#27272A",
            btnDangerBg: "#EF4444", btnDangerText: "#FFFFFF", btnSuccessBg: "#10B981", btnSuccessText: "#FFFFFF",
            border: "#27272A", success: "#10B981", error: "#EF4444", warning: "#F59E0B", info: "#38BDF8",
            cardBorder: "#27272A", productNameColor: "#F8FAFC", productPriceColor: "#38BDF8", productDiscountColor: "#F87171", ratingStarColor: "#F59E0B",
            inputBg: "#09090B", inputBorder: "#27272A", inputFocusBorder: "#E2E8F0", inputPlaceholder: "#71717A", labelColor: "#F8FAFC",
        }
    },
    {
        name: "Warm Stone",
        emoji: "🪨",
        colors: {
            primary: "#8A6D5B", primaryHover: "#6f5749",
            secondary: "#2F6FED", secondaryHover: "#1d4ed8",
            accent: "#C08552",
            background: "#ffffff", backgroundSecondary: "#FAF8F5", backgroundTertiary: "#F2EEE8", cardBg: "#ffffff",
            textPrimary: "#2B2622", textSecondary: "#6b675f", textLight: "#9a9489", linkColor: "#8A6D5B",
            headerBg: "#ffffff", headerText: "#2B2622", headerActiveLink: "#8A6D5B", headerHoverLink: "#8A6D5B", headerDropdownBg: "#ffffff", headerDropdownText: "#2B2622",
            footerBg: "#2B2622", footerText: "#F5F1EB", footerLink: "#C9BFB3", footerLinkHover: "#ffffff", footerBorder: "#453E37",
            announcementBg: "#2B2622", announcementText: "#F5F1EB",
            btnPrimaryBg: "#8A6D5B", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#6f5749", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#2F6FED", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#1d4ed8",
            btnOutlineBg: "transparent", btnOutlineText: "#8A6D5B", btnOutlineBorder: "#8A6D5B", btnOutlineHoverBg: "#8A6D5B",
            btnDangerBg: "#C0483F", btnDangerText: "#ffffff", btnSuccessBg: "#3E8E5A", btnSuccessText: "#ffffff",
            border: "#E7E1D8", success: "#3E8E5A", error: "#C0483F", warning: "#C79A3A", info: "#3B82F6",
            cardBorder: "#E7E1D8", productNameColor: "#2B2622", productPriceColor: "#8A6D5B", productDiscountColor: "#C0483F", ratingStarColor: "#C79A3A",
            inputBg: "#ffffff", inputBorder: "#E7E1D8", inputFocusBorder: "#8A6D5B", inputPlaceholder: "#9a9489", labelColor: "#453E37",
        }
    },
    {
        name: "Slate Professional",
        emoji: "⚙️",
        colors: {
            primary: "#334155", primaryHover: "#1e293b",
            secondary: "#D97706", secondaryHover: "#b45309",
            accent: "#0EA5E9",
            background: "#ffffff", backgroundSecondary: "#F8FAFC", backgroundTertiary: "#F1F5F9", cardBg: "#ffffff",
            textPrimary: "#0F172A", textSecondary: "#475569", textLight: "#94A3B8", linkColor: "#334155",
            headerBg: "#ffffff", headerText: "#0F172A", headerActiveLink: "#334155", headerHoverLink: "#334155", headerDropdownBg: "#ffffff", headerDropdownText: "#0F172A",
            footerBg: "#0F172A", footerText: "#F1F5F9", footerLink: "#94A3B8", footerLinkHover: "#ffffff", footerBorder: "#1E293B",
            announcementBg: "#1E293B", announcementText: "#F1F5F9",
            btnPrimaryBg: "#334155", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#1e293b", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#D97706", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#b45309",
            btnOutlineBg: "transparent", btnOutlineText: "#334155", btnOutlineBorder: "#334155", btnOutlineHoverBg: "#334155",
            btnDangerBg: "#DC2626", btnDangerText: "#ffffff", btnSuccessBg: "#059669", btnSuccessText: "#ffffff",
            border: "#E2E8F0", success: "#059669", error: "#DC2626", warning: "#D97706", info: "#0EA5E9",
            cardBorder: "#E2E8F0", productNameColor: "#0F172A", productPriceColor: "#334155", productDiscountColor: "#DC2626", ratingStarColor: "#D97706",
            inputBg: "#ffffff", inputBorder: "#E2E8F0", inputFocusBorder: "#334155", inputPlaceholder: "#94A3B8", labelColor: "#1E293B",
        }
    },
    {
        name: "Sage Editorial",
        emoji: "🌿",
        colors: {
            primary: "#4B6455", primaryHover: "#3a4f42",
            secondary: "#B08968", secondaryHover: "#93704f",
            accent: "#7A9471",
            background: "#ffffff", backgroundSecondary: "#F6F7F4", backgroundTertiary: "#EEF1EA", cardBg: "#ffffff",
            textPrimary: "#20261F", textSecondary: "#5B6459", textLight: "#8E9689", linkColor: "#4B6455",
            headerBg: "#ffffff", headerText: "#20261F", headerActiveLink: "#4B6455", headerHoverLink: "#4B6455", headerDropdownBg: "#ffffff", headerDropdownText: "#20261F",
            footerBg: "#20261F", footerText: "#EEF1EA", footerLink: "#AAB4A3", footerLinkHover: "#ffffff", footerBorder: "#39412F",
            announcementBg: "#3a4f42", announcementText: "#ffffff",
            btnPrimaryBg: "#4B6455", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#3a4f42", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#B08968", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#93704f",
            btnOutlineBg: "transparent", btnOutlineText: "#4B6455", btnOutlineBorder: "#4B6455", btnOutlineHoverBg: "#4B6455",
            btnDangerBg: "#B3453D", btnDangerText: "#ffffff", btnSuccessBg: "#4B6455", btnSuccessText: "#ffffff",
            border: "#DDE3D6", success: "#4B6455", error: "#B3453D", warning: "#C08A3E", info: "#4C7A93",
            cardBorder: "#DDE3D6", productNameColor: "#20261F", productPriceColor: "#4B6455", productDiscountColor: "#B3453D", ratingStarColor: "#C08A3E",
            inputBg: "#ffffff", inputBorder: "#DDE3D6", inputFocusBorder: "#4B6455", inputPlaceholder: "#8E9689", labelColor: "#39412F",
        }
    },
    {
        name: "Charcoal & Terracotta",
        emoji: "🧱",
        colors: {
            primary: "#B5533C", primaryHover: "#9a4531",
            secondary: "#2F3B4C", secondaryHover: "#232C38",
            accent: "#D9825F",
            background: "#ffffff", backgroundSecondary: "#FAF7F5", backgroundTertiary: "#F3ECE8", cardBg: "#ffffff",
            textPrimary: "#241F1D", textSecondary: "#6A625D", textLight: "#A39A93", linkColor: "#B5533C",
            headerBg: "#ffffff", headerText: "#241F1D", headerActiveLink: "#B5533C", headerHoverLink: "#B5533C", headerDropdownBg: "#ffffff", headerDropdownText: "#241F1D",
            footerBg: "#241F1D", footerText: "#F3ECE8", footerLink: "#C9BEB8", footerLinkHover: "#ffffff", footerBorder: "#3A322E",
            announcementBg: "#2F3B4C", announcementText: "#ffffff",
            btnPrimaryBg: "#B5533C", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#9a4531", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#2F3B4C", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#232C38",
            btnOutlineBg: "transparent", btnOutlineText: "#B5533C", btnOutlineBorder: "#B5533C", btnOutlineHoverBg: "#B5533C",
            btnDangerBg: "#A23B2E", btnDangerText: "#ffffff", btnSuccessBg: "#3E7A55", btnSuccessText: "#ffffff",
            border: "#EBDFD8", success: "#3E7A55", error: "#A23B2E", warning: "#C08A3E", info: "#2F3B4C",
            cardBorder: "#EBDFD8", productNameColor: "#241F1D", productPriceColor: "#B5533C", productDiscountColor: "#A23B2E", ratingStarColor: "#C08A3E",
            inputBg: "#ffffff", inputBorder: "#EBDFD8", inputFocusBorder: "#B5533C", inputPlaceholder: "#A39A93", labelColor: "#3A322E",
        }
    },
    {
        name: "Minimal Monochrome",
        emoji: "⚫",
        colors: {
            primary: "#18181B", primaryHover: "#000000",
            secondary: "#A16207", secondaryHover: "#854d0e",
            accent: "#525252",
            background: "#ffffff", backgroundSecondary: "#FAFAFA", backgroundTertiary: "#F4F4F5", cardBg: "#ffffff",
            textPrimary: "#18181B", textSecondary: "#52525B", textLight: "#A1A1AA", linkColor: "#18181B",
            headerBg: "#ffffff", headerText: "#18181B", headerActiveLink: "#18181B", headerHoverLink: "#525252", headerDropdownBg: "#ffffff", headerDropdownText: "#18181B",
            footerBg: "#18181B", footerText: "#FAFAFA", footerLink: "#A1A1AA", footerLinkHover: "#ffffff", footerBorder: "#3F3F46",
            announcementBg: "#18181B", announcementText: "#ffffff",
            btnPrimaryBg: "#18181B", btnPrimaryText: "#ffffff", btnPrimaryHoverBg: "#000000", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#A16207", btnSecondaryText: "#ffffff", btnSecondaryHoverBg: "#854d0e",
            btnOutlineBg: "transparent", btnOutlineText: "#18181B", btnOutlineBorder: "#18181B", btnOutlineHoverBg: "#18181B",
            btnDangerBg: "#B91C1C", btnDangerText: "#ffffff", btnSuccessBg: "#15803D", btnSuccessText: "#ffffff",
            border: "#E4E4E7", success: "#15803D", error: "#B91C1C", warning: "#A16207", info: "#3B82F6",
            cardBorder: "#E4E4E7", productNameColor: "#18181B", productPriceColor: "#18181B", productDiscountColor: "#B91C1C", ratingStarColor: "#A16207",
            inputBg: "#ffffff", inputBorder: "#E4E4E7", inputFocusBorder: "#18181B", inputPlaceholder: "#A1A1AA", labelColor: "#3F3F46",
        }
    },
    {
        name: "Graphite Pro",
        emoji: "⚫",
        colors: {
            primary: "#2B3440", primaryHover: "#1E2933",
            secondary: "#C88A3D", secondaryHover: "#A96E2D",
            accent: "#4F46E5",
            background: "#FAFAFA", backgroundSecondary: "#F4F5F7", backgroundTertiary: "#ECEFF3", cardBg: "#FFFFFF",
            textPrimary: "#111827", textSecondary: "#6B7280", textLight: "#9CA3AF", linkColor: "#2B3440",
            headerBg: "#FFFFFF", headerText: "#111827", headerActiveLink: "#2B3440", headerHoverLink: "#4F46E5", headerDropdownBg: "#FFFFFF", headerDropdownText: "#111827",
            footerBg: "#111827", footerText: "#FFFFFF", footerLink: "#9CA3AF", footerLinkHover: "#FFFFFF", footerBorder: "#374151",
            announcementBg: "#2B3440", announcementText: "#FFFFFF",
            btnPrimaryBg: "#2B3440", btnPrimaryText: "#FFFFFF", btnPrimaryHoverBg: "#1E2933", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#C88A3D", btnSecondaryText: "#FFFFFF", btnSecondaryHoverBg: "#A96E2D",
            btnOutlineBg: "transparent", btnOutlineText: "#2B3440", btnOutlineBorder: "#2B3440", btnOutlineHoverBg: "#2B3440",
            btnDangerBg: "#DC2626", btnDangerText: "#FFFFFF", btnSuccessBg: "#16A34A", btnSuccessText: "#FFFFFF",
            border: "#E5E7EB", success: "#16A34A", error: "#DC2626", warning: "#D97706", info: "#2563EB",
            cardBorder: "#E5E7EB", productNameColor: "#111827", productPriceColor: "#2B3440", productDiscountColor: "#DC2626", ratingStarColor: "#F59E0B",
            inputBg: "#FFFFFF", inputBorder: "#D1D5DB", inputFocusBorder: "#2B3440", inputPlaceholder: "#9CA3AF", labelColor: "#374151",
        }
    },

    {
        name: "Scandinavian Light",
        emoji: "🪑",
        colors: {
            primary: "#6B7280", primaryHover: "#4B5563",
            secondary: "#D97706", secondaryHover: "#B45309",
            accent: "#059669",
            background: "#F5F5F4", backgroundSecondary: "#FAFAF9", backgroundTertiary: "#FFFFFF", cardBg: "#FFFFFF",
            textPrimary: "#292524", textSecondary: "#57534E", textLight: "#A8A29E", linkColor: "#6B7280",
            headerBg: "#FFFFFF", headerText: "#292524", headerActiveLink: "#6B7280", headerHoverLink: "#059669", headerDropdownBg: "#FFFFFF", headerDropdownText: "#292524",
            footerBg: "#1C1917", footerText: "#FFFFFF", footerLink: "#D6D3D1", footerLinkHover: "#FFFFFF", footerBorder: "#44403C",
            announcementBg: "#44403C", announcementText: "#FFFFFF",
            btnPrimaryBg: "#6B7280", btnPrimaryText: "#FFFFFF", btnPrimaryHoverBg: "#4B5563", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#D97706", btnSecondaryText: "#FFFFFF", btnSecondaryHoverBg: "#B45309",
            btnOutlineBg: "transparent", btnOutlineText: "#6B7280", btnOutlineBorder: "#6B7280", btnOutlineHoverBg: "#6B7280",
            btnDangerBg: "#DC2626", btnDangerText: "#FFFFFF", btnSuccessBg: "#16A34A", btnSuccessText: "#FFFFFF",
            border: "#E7E5E4", success: "#16A34A", error: "#DC2626", warning: "#D97706", info: "#2563EB",
            cardBorder: "#E7E5E4", productNameColor: "#292524", productPriceColor: "#6B7280", productDiscountColor: "#DC2626", ratingStarColor: "#F59E0B",
            inputBg: "#FFFFFF", inputBorder: "#D6D3D1", inputFocusBorder: "#6B7280", inputPlaceholder: "#A8A29E", labelColor: "#44403C",
        }
    },

    {
        name: "Ocean Executive",
        emoji: "🌊",
        colors: {
            primary: "#1E3A8A", primaryHover: "#1D2F6F",
            secondary: "#0F766E", secondaryHover: "#115E59",
            accent: "#F59E0B",
            background: "#F8FAFC", backgroundSecondary: "#F1F5F9", backgroundTertiary: "#E2E8F0", cardBg: "#FFFFFF",
            textPrimary: "#0F172A", textSecondary: "#475569", textLight: "#94A3B8", linkColor: "#1E3A8A",
            headerBg: "#FFFFFF", headerText: "#0F172A", headerActiveLink: "#1E3A8A", headerHoverLink: "#0F766E", headerDropdownBg: "#FFFFFF", headerDropdownText: "#0F172A",
            footerBg: "#172554", footerText: "#FFFFFF", footerLink: "#CBD5E1", footerLinkHover: "#FFFFFF", footerBorder: "#1E3A8A",
            announcementBg: "#1E3A8A", announcementText: "#FFFFFF",
            btnPrimaryBg: "#1E3A8A", btnPrimaryText: "#FFFFFF", btnPrimaryHoverBg: "#1D2F6F", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#0F766E", btnSecondaryText: "#FFFFFF", btnSecondaryHoverBg: "#115E59",
            btnOutlineBg: "transparent", btnOutlineText: "#1E3A8A", btnOutlineBorder: "#1E3A8A", btnOutlineHoverBg: "#1E3A8A",
            btnDangerBg: "#DC2626", btnDangerText: "#FFFFFF", btnSuccessBg: "#16A34A", btnSuccessText: "#FFFFFF",
            border: "#CBD5E1", success: "#16A34A", error: "#DC2626", warning: "#F59E0B", info: "#2563EB",
            cardBorder: "#CBD5E1", productNameColor: "#0F172A", productPriceColor: "#1E3A8A", productDiscountColor: "#DC2626", ratingStarColor: "#F59E0B",
            inputBg: "#FFFFFF", inputBorder: "#CBD5E1", inputFocusBorder: "#1E3A8A", inputPlaceholder: "#94A3B8", labelColor: "#334155",
        }
    },

    {
        name: "Charcoal & Copper",
        emoji: "🥉",
        colors: {
            primary: "#222222", primaryHover: "#111111",
            secondary: "#B87333", secondaryHover: "#995F29",
            accent: "#D4A373",
            background: "#FCFBF8", backgroundSecondary: "#F8F5F0", backgroundTertiary: "#F2ECE4", cardBg: "#FFFFFF",
            textPrimary: "#1C1917", textSecondary: "#57534E", textLight: "#A8A29E", linkColor: "#222222",
            headerBg: "#FFFFFF", headerText: "#1C1917", headerActiveLink: "#222222", headerHoverLink: "#B87333", headerDropdownBg: "#FFFFFF", headerDropdownText: "#1C1917",
            footerBg: "#171717", footerText: "#FFFFFF", footerLink: "#D6D3D1", footerLinkHover: "#FFFFFF", footerBorder: "#404040",
            announcementBg: "#222222", announcementText: "#FFFFFF",
            btnPrimaryBg: "#222222", btnPrimaryText: "#FFFFFF", btnPrimaryHoverBg: "#111111", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#B87333", btnSecondaryText: "#FFFFFF", btnSecondaryHoverBg: "#995F29",
            btnOutlineBg: "transparent", btnOutlineText: "#222222", btnOutlineBorder: "#222222", btnOutlineHoverBg: "#222222",
            btnDangerBg: "#DC2626", btnDangerText: "#FFFFFF", btnSuccessBg: "#16A34A", btnSuccessText: "#FFFFFF",
            border: "#E7E5E4", success: "#16A34A", error: "#DC2626", warning: "#D97706", info: "#2563EB",
            cardBorder: "#E7E5E4", productNameColor: "#1C1917", productPriceColor: "#B87333", productDiscountColor: "#DC2626", ratingStarColor: "#F59E0B",
            inputBg: "#FFFFFF", inputBorder: "#D6D3D1", inputFocusBorder: "#B87333", inputPlaceholder: "#A8A29E", labelColor: "#44403C",
        }
    },

    {
        name: "Mocha Luxury",
        emoji: "☕",
        colors: {
            primary: "#6F4E37", primaryHover: "#5A3E2C",
            secondary: "#D4A373", secondaryHover: "#BC8C5A",
            accent: "#A16207",
            background: "#FDFBF7", backgroundSecondary: "#F7F3ED", backgroundTertiary: "#EFE7DD", cardBg: "#FFFFFF",
            textPrimary: "#3F2A1D", textSecondary: "#6B5B4B", textLight: "#A1887F", linkColor: "#6F4E37",
            headerBg: "#FFFFFF", headerText: "#3F2A1D", headerActiveLink: "#6F4E37", headerHoverLink: "#D4A373", headerDropdownBg: "#FFFFFF", headerDropdownText: "#3F2A1D",
            footerBg: "#3F2A1D", footerText: "#FFFFFF", footerLink: "#D7CCC8", footerLinkHover: "#FFFFFF", footerBorder: "#5D4037",
            announcementBg: "#6F4E37", announcementText: "#FFFFFF",
            btnPrimaryBg: "#6F4E37", btnPrimaryText: "#FFFFFF", btnPrimaryHoverBg: "#5A3E2C", btnPrimaryBorder: "transparent",
            btnSecondaryBg: "#D4A373", btnSecondaryText: "#FFFFFF", btnSecondaryHoverBg: "#BC8C5A",
            btnOutlineBg: "transparent", btnOutlineText: "#6F4E37", btnOutlineBorder: "#6F4E37", btnOutlineHoverBg: "#6F4E37",
            btnDangerBg: "#DC2626", btnDangerText: "#FFFFFF", btnSuccessBg: "#16A34A", btnSuccessText: "#FFFFFF",
            border: "#E7DDD3", success: "#16A34A", error: "#DC2626", warning: "#D97706", info: "#2563EB",
            cardBorder: "#E7DDD3", productNameColor: "#3F2A1D", productPriceColor: "#6F4E37", productDiscountColor: "#DC2626", ratingStarColor: "#F59E0B",
            inputBg: "#FFFFFF", inputBorder: "#D7CCC8", inputFocusBorder: "#6F4E37", inputPlaceholder: "#A1887F", labelColor: "#5D4037",
        }
    }

];

// ─────────────────────────────────────────────────────────────
//  Color group definitions (for left panel)
// ─────────────────────────────────────────────────────────────
const COLOR_GROUPS = [
    {
        id: "brand", icon: FiDroplet, label: "Brand Colors",
        fields: [
            { key: "primary", label: "Primary", desc: "Main brand color — buttons, links, highlights" },
            { key: "primaryHover", label: "Primary Hover", desc: "Darker shade for hover states" },
            { key: "secondary", label: "Secondary", desc: "Accent/secondary brand color" },
            { key: "secondaryHover", label: "Secondary Hover", desc: "Hover state for secondary" },
            { key: "accent", label: "Accent", desc: "Alert & accent highlights" },
        ]
    },
    {
        id: "backgrounds", icon: FiSquare, label: "Backgrounds",
        fields: [
            { key: "background", label: "Page Background", desc: "Main website background" },
            { key: "backgroundSecondary", label: "Section Background", desc: "Alternating section background" },
            { key: "backgroundTertiary", label: "Tertiary Background", desc: "Special sections (testimonials, FAQ)" },
            { key: "cardBg", label: "Card Background", desc: "Product and content cards" },
        ]
    },
    {
        id: "text", icon: FiType, label: "Text Colors",
        fields: [
            { key: "textPrimary", label: "Primary Text", desc: "Main headings and body text" },
            { key: "textSecondary", label: "Secondary Text", desc: "Descriptions and labels" },
            { key: "textLight", label: "Muted Text", desc: "Placeholder and light text" },
            { key: "linkColor", label: "Link Color", desc: "Hyperlinks" },
        ]
    },
    {
        id: "navbar", icon: FiLayout, label: "Navbar",
        fields: [
            { key: "headerBg", label: "Navbar Background", desc: "Navigation bar background" },
            { key: "headerText", label: "Navbar Text", desc: "Navigation link color" },
            { key: "headerActiveLink", label: "Active Link", desc: "Color of the current page link" },
            { key: "headerHoverLink", label: "Hover Link", desc: "Link hover color" },
            { key: "headerDropdownBg", label: "Dropdown Background", desc: "Products dropdown background" },
            { key: "headerDropdownText", label: "Dropdown Text", desc: "Dropdown item text color" },
        ]
    },
    {
        id: "footer", icon: FiLayout, label: "Footer",
        fields: [
            { key: "footerBg", label: "Footer Background" },
            { key: "footerText", label: "Footer Text" },
            { key: "footerLink", label: "Footer Links" },
            { key: "footerLinkHover", label: "Footer Link Hover" },
            { key: "footerBorder", label: "Footer Border" },
            { key: "announcementBg", label: "Announcement Bar Background" },
            { key: "announcementText", label: "Announcement Bar Text" },
        ]
    },
    {
        id: "buttons", icon: FiZap, label: "Buttons",
        fields: [
            { key: "btnPrimaryBg", label: "Primary Button Background" },
            { key: "btnPrimaryText", label: "Primary Button Text" },
            { key: "btnPrimaryHoverBg", label: "Primary Button Hover" },
            { key: "btnSecondaryBg", label: "Secondary Button Background" },
            { key: "btnSecondaryText", label: "Secondary Button Text" },
            { key: "btnSecondaryHoverBg", label: "Secondary Button Hover" },
            { key: "btnOutlineText", label: "Outline Button Text" },
            { key: "btnOutlineBorder", label: "Outline Button Border" },
            { key: "btnDangerBg", label: "Danger Button Background" },
            { key: "btnSuccessBg", label: "Success Button Background" },
        ]
    },
    {
        id: "cards", icon: FiSquare, label: "Product Cards",
        fields: [
            { key: "cardBorder", label: "Card Border Color" },
            { key: "productNameColor", label: "Product Name Color" },
            { key: "productPriceColor", label: "Product Price Color" },
            { key: "productDiscountColor", label: "Discount Price Color" },
            { key: "ratingStarColor", label: "Rating Star Color" },
        ]
    },
    {
        id: "forms", icon: FiSliders, label: "Forms",
        fields: [
            { key: "inputBg", label: "Input Background" },
            { key: "inputBorder", label: "Input Border" },
            { key: "inputFocusBorder", label: "Input Focus Border" },
            { key: "inputPlaceholder", label: "Placeholder Text" },
            { key: "labelColor", label: "Label Color" },
        ]
    },
    {
        id: "utility", icon: FiActivity, label: "Status Colors",
        fields: [
            { key: "border", label: "General Border" },
            { key: "success", label: "Success Color" },
            { key: "error", label: "Error Color" },
            { key: "warning", label: "Warning Color" },
            { key: "info", label: "Info Color" },
        ]
    },
];

// ─────────────────────────────────────────────────────────────
//  Preview pages
// ─────────────────────────────────────────────────────────────
const PREVIEW_PAGES = [
    { id: "home", label: "Home", component: PreviewHome },
    { id: "products", label: "Products", component: PreviewProducts },
    { id: "detail", label: "Product Detail", component: PreviewProductDetail },
    { id: "cart", label: "Cart", component: PreviewCart },
    { id: "login", label: "Login", component: PreviewLogin },
    { id: "components", label: "Components", component: PreviewComponents },
];

const VIEWPORT_SIZES = [
    { id: "desktop", icon: FiMonitor, label: "Desktop", scale: 0.52, width: 1280 },
    { id: "tablet", icon: FiTablet, label: "Tablet", scale: 0.65, width: 768 },
    { id: "mobile", icon: FiSmartphone, label: "Mobile", scale: 0.80, width: 375 },
];

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
const deepMerge = (target, source) => {
    const result = { ...target };
    Object.keys(source || {}).forEach(key => {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    });
    return result;
};

// ─────────────────────────────────────────────────────────────
//  ColorPicker sub-component
// ─────────────────────────────────────────────────────────────
const ColorPicker = ({ label, desc, value, onChange }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value || '').then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };
    return (
        <div className="group">
            <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">{label}</label>
                <button type="button" onClick={handleCopy} className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied ? <span className="text-xs text-green-500">✓</span> : <FiCopy size={11} />}
                </button>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                    <input
                        type="color"
                        value={value || '#000000'}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-9 h-9 cursor-pointer rounded-lg border border-gray-200 p-0.5"
                    />
                </div>
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-mono outline-none transition focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-400/30"
                />
            </div>
            {desc && <p className="mt-0.5 text-[10px] text-gray-400">{desc}</p>}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
//  Accordion section
// ─────────────────────────────────────────────────────────────
const Accordion = ({ id, icon: Icon, label, badge, children, defaultOpen = false, searchActive = false }) => {
    const [open, setOpen] = useState(defaultOpen || searchActive);
    useEffect(() => { if (searchActive) setOpen(true); }, [searchActive]);

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-2">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">{label}</span>
                    {badge && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">{badge}</span>}
                </div>
                {open ? <FiChevronDown size={13} className="text-gray-400" /> : <FiChevronRight size={13} className="text-gray-400" />}
            </button>
            {open && (
                <div className="px-4 py-4 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
//  Main AdminColor / Theme Builder Component
// ─────────────────────────────────────────────────────────────
const AdminColor = () => {
    const toast = useToast();

    // ── Themes list & active selection ──
    const [themes, setThemes] = useState([]);
    const [selectedThemeId, setSelectedThemeId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ── Working copy of the theme ──
    const [workingTheme, setWorkingTheme] = useState(deepMerge({}, DEFAULT_THEME));
    const [savedSnapshot, setSavedSnapshot] = useState(null);
    const hasUnsavedChanges = JSON.stringify(workingTheme) !== JSON.stringify(savedSnapshot);

    // ── Undo/Redo history ──
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const skipHistoryRef = useRef(false);

    // ── UI state ──
    const [previewPage, setPreviewPage] = useState("home");
    const [viewport, setViewport] = useState("desktop");
    const [searchQuery, setSearchQuery] = useState("");
    const [newThemeName, setNewThemeName] = useState("");
    const [showNewThemeInput, setShowNewThemeInput] = useState(false);
    const [creatingTheme, setCreatingTheme] = useState(false);

    const fileInputRef = useRef(null);
    const previewContainerRef = useRef(null);

    // ── Fetch themes on mount ──
    const fetchThemes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/themes");
            if (res.data?.success) {
                const list = res.data.data || [];
                setThemes(list);
                // Auto-select the active theme
                const active = list.find(t => t.isActive) || list[0];
                if (active) {
                    setSelectedThemeId(active._id);
                    const merged = deepMerge(DEFAULT_THEME, active);
                    setWorkingTheme(merged);
                    setSavedSnapshot(merged);
                    applyThemeToCSSVars(merged);
                }
            }
        } catch (err) {
            toast.error("Failed to load themes.");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchThemes(); }, [fetchThemes]);

    // ── Push to undo history whenever workingTheme changes ──
    useEffect(() => {
        if (skipHistoryRef.current) { skipHistoryRef.current = false; return; }
        setHistory(prev => {
            const trimmed = prev.slice(0, historyIndex + 1);
            const next = [...trimmed, workingTheme].slice(-50); // keep max 50 steps
            return next;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workingTheme]);

    // ── Apply to CSS vars whenever workingTheme changes (live preview) ──
    useEffect(() => {
        applyThemeToCSSVars(workingTheme);
    }, [workingTheme]);

    // ── Color change handler ──
    const handleColorChange = useCallback((key, value) => {
        setWorkingTheme(prev => ({
            ...prev,
            colors: { ...prev.colors, [key]: value }
        }));
    }, []);

    // ── Card/typography/animation changes ──
    const handleCardChange = useCallback((key, value) => {
        setWorkingTheme(prev => ({ ...prev, cards: { ...prev.cards, [key]: value } }));
    }, []);
    const handleTypoChange = useCallback((key, value) => {
        setWorkingTheme(prev => ({ ...prev, typography: { ...prev.typography, [key]: value } }));
    }, []);
    const handleAnimChange = useCallback((key, value) => {
        setWorkingTheme(prev => ({ ...prev, animations: { ...prev.animations, [key]: value } }));
    }, []);

    // ── Apply a palette ──
    const applyPalette = (palette) => {
        setWorkingTheme(prev => ({
            ...prev,
            colors: { ...prev.colors, ...palette.colors }
        }));
        toast.info(`Applied "${palette.name}" preview. Click "Save Theme Live" below to publish.`);
    };

    // ── Apply & Save palette live in 1 click ──
    const applyAndSavePalette = async (palette, e) => {
        if (e) e.stopPropagation();
        const updatedColors = { ...workingTheme.colors, ...palette.colors };
        const updatedTheme = { ...workingTheme, colors: updatedColors };
        setWorkingTheme(updatedTheme);
        if (!selectedThemeId) return;
        setSaving(true);
        try {
            const res = await api.put(`/themes/${selectedThemeId}`, updatedTheme);
            if (res.data?.success) {
                setSavedSnapshot(updatedTheme);
                toast.success(`"${palette.name}" applied and saved LIVE to website!`);
                setThemes(prev => prev.map(t => t._id === selectedThemeId ? res.data.data : t));
            }
        } catch (err) {
            toast.error("Failed to save theme.");
        } finally {
            setSaving(false);
        }
    };

    // ── Undo / Redo ──
    const undo = () => {
        if (historyIndex <= 0) return;
        const idx = historyIndex - 1;
        skipHistoryRef.current = true;
        setWorkingTheme(history[idx]);
        setHistoryIndex(idx);
    };
    const redo = () => {
        if (historyIndex >= history.length - 1) return;
        const idx = historyIndex + 1;
        skipHistoryRef.current = true;
        setWorkingTheme(history[idx]);
        setHistoryIndex(idx);
    };

    // ── Save ──
    const handleSave = async () => {
        if (!selectedThemeId) return;
        setSaving(true);
        try {
            const res = await api.put(`/themes/${selectedThemeId}`, workingTheme);
            if (res.data?.success) {
                setSavedSnapshot(workingTheme);
                toast.success("Theme saved successfully!");
                // Refresh list
                setThemes(prev => prev.map(t => t._id === selectedThemeId ? res.data.data : t));
            }
        } catch (err) {
            toast.error("Failed to save theme.");
        } finally {
            setSaving(false);
        }
    };

    // ── Reset to saved snapshot ──
    const handleReset = () => {
        if (savedSnapshot) {
            setWorkingTheme(savedSnapshot);
            toast.info("Reverted to last saved theme.");
        }
    };

    // ── Reset to defaults ──
    const handleResetToDefaults = () => {
        setWorkingTheme(deepMerge({}, DEFAULT_THEME));
        toast.info("Reset to default colors.");
    };

    // ── Theme switching ──
    const handleThemeSelect = async (themeId) => {
        const theme = themes.find(t => t._id === themeId);
        if (!theme) return;
        setSelectedThemeId(themeId);
        const merged = deepMerge(DEFAULT_THEME, theme);
        setWorkingTheme(merged);
        setSavedSnapshot(merged);
    };

    // ── Activate theme ──
    const handleActivate = async () => {
        if (!selectedThemeId) return;
        try {
            const res = await api.put(`/themes/${selectedThemeId}/activate`);
            if (res.data?.success) {
                toast.success(`"${res.data.data.name}" is now the live theme!`);
                setThemes(prev => prev.map(t => ({ ...t, isActive: t._id === selectedThemeId })));
            }
        } catch {
            toast.error("Failed to activate theme.");
        }
    };

    // ── Create new theme ──
    const handleCreateTheme = async () => {
        if (!newThemeName.trim()) return;
        setCreatingTheme(true);
        try {
            const res = await api.post("/themes", { name: newThemeName.trim(), ...workingTheme });
            if (res.data?.success) {
                toast.success(`Theme "${newThemeName}" created!`);
                setThemes(prev => [...prev, res.data.data]);
                setSelectedThemeId(res.data.data._id);
                setSavedSnapshot(workingTheme);
                setNewThemeName("");
                setShowNewThemeInput(false);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create theme.");
        } finally {
            setCreatingTheme(false);
        }
    };

    // ── Duplicate ──
    const handleDuplicate = async () => {
        if (!selectedThemeId) return;
        try {
            const res = await api.post(`/themes/${selectedThemeId}/duplicate`);
            if (res.data?.success) {
                toast.success(`Duplicated as "${res.data.data.name}"!`);
                setThemes(prev => [...prev, res.data.data]);
                setSelectedThemeId(res.data.data._id);
            }
        } catch {
            toast.error("Failed to duplicate theme.");
        }
    };

    // ── Delete ──
    const handleDelete = async () => {
        if (!selectedThemeId) return;
        const theme = themes.find(t => t._id === selectedThemeId);
        if (theme?.isActive || theme?.isDefault) {
            toast.warning("Cannot delete active or default theme.");
            return;
        }
        if (!window.confirm(`Delete theme "${theme?.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/themes/${selectedThemeId}`);
            toast.success("Theme deleted.");
            const remaining = themes.filter(t => t._id !== selectedThemeId);
            setThemes(remaining);
            if (remaining.length > 0) {
                handleThemeSelect(remaining[0]._id);
            } else {
                setSelectedThemeId(null);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete theme.");
        }
    };

    // ── Export ──
    const handleExport = () => {
        const data = JSON.stringify({ ...workingTheme, name: workingTheme.name || "theme" }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(workingTheme.name || 'theme').replace(/\s+/g, '_')}_theme.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Theme exported!");
    };

    // ── Import ──
    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                const merged = deepMerge(DEFAULT_THEME, parsed);
                setWorkingTheme(merged);
                toast.success(`Theme "${parsed.name || 'imported'}" loaded! Save to persist.`);
            } catch {
                toast.error("Invalid theme JSON file.");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // ── Search filter ──
    const matchesSearch = (label) => !searchQuery || label.toLowerCase().includes(searchQuery.toLowerCase());
    const groupMatchesSearch = (group) => !searchQuery || group.fields.some(f => matchesSearch(f.label));

    // ── Viewport config ──
    const vp = VIEWPORT_SIZES.find(v => v.id === viewport) || VIEWPORT_SIZES[0];
    const PreviewPage = PREVIEW_PAGES.find(p => p.id === previewPage)?.component || PreviewHome;
    const selectedTheme = themes.find(t => t._id === selectedThemeId);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <FiLoader className="animate-spin mr-2" size={20} />
                <span className="text-sm">Loading Theme Builder...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden -m-6 bg-gray-50" style={{ minHeight: 'calc(100vh - 56px)' }}>
            {/* ── Top Toolbar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-white border-b border-gray-200 shadow-sm z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <FiDroplet className="text-blue-500" size={18} />
                    <h1 className="text-base font-bold text-gray-800">Theme Builder</h1>
                    {hasUnsavedChanges && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                            Unsaved changes
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Theme selector */}
                    <select
                        value={selectedThemeId || ''}
                        onChange={(e) => handleThemeSelect(e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-blue-400"
                    >
                        {themes.map(t => (
                            <option key={t._id} value={t._id}>
                                {t.name}{t.isActive ? ' ✓ (Live)' : ''}
                            </option>
                        ))}
                    </select>

                    {/* Undo/Redo */}
                    <button onClick={undo} disabled={historyIndex <= 0} title="Undo" className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                        <FiCornerUpLeft size={14} />
                    </button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo" className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                        <FiCornerUpRight size={14} />
                    </button>

                    {/* Activate */}
                    {selectedTheme && !selectedTheme.isActive && (
                        <button
                            onClick={handleActivate}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                        >
                            <FiZap size={12} /> Activate
                        </button>
                    )}
                    {selectedTheme?.isActive && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                            <FiCheckCircle size={12} /> Live Theme
                        </span>
                    )}

                    {/* Export/Import */}
                    <button onClick={handleExport} title="Export JSON" className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                        <FiDownload size={14} />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} title="Import JSON" className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                        <FiUpload size={14} />
                    </button>
                    <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

                    {/* Reset */}
                    <button onClick={handleReset} disabled={!hasUnsavedChanges} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                        <FiRotateCcw size={12} /> Reset
                    </button>

                    {/* Save */}
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedThemeId}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? <FiLoader size={13} className="animate-spin" /> : <FiSave size={13} />}
                        {saving ? "Saving..." : "Save Theme"}
                    </button>
                </div>
            </div>

            {/* ── Main Split Layout ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ═══════════════════════════════════════════
                    LEFT PANEL — Controls
                ═══════════════════════════════════════════ */}
                <aside className="w-[480px] shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden">

                    {/* Theme Management */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-gray-600">Themes</span>
                            <div className="flex-1" />
                            <button onClick={handleDuplicate} title="Duplicate" className="text-xs text-gray-500 hover:text-gray-700 px-2 py-0.5 rounded border border-gray-200 hover:bg-white">
                                <FiCopy size={11} />
                            </button>
                            <button onClick={handleDelete} title="Delete" className="text-xs text-red-400 hover:text-red-600 px-2 py-0.5 rounded border border-gray-200 hover:bg-white">
                                <FiTrash2 size={11} />
                            </button>
                            <button
                                onClick={() => setShowNewThemeInput(s => !s)}
                                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded border border-blue-200 bg-blue-50 hover:bg-blue-100"
                            >
                                <FiPlus size={11} />
                            </button>
                        </div>
                        {showNewThemeInput && (
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={newThemeName}
                                    onChange={(e) => setNewThemeName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTheme()}
                                    placeholder="New theme name..."
                                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400"
                                    autoFocus
                                />
                                <button
                                    onClick={handleCreateTheme}
                                    disabled={creatingTheme || !newThemeName.trim()}
                                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {creatingTheme ? <FiLoader size={12} className="animate-spin" /> : 'Create'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Palettes */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quick Preset Palettes</p>
                            <span className="text-[10px] text-blue-600 font-semibold">1-Click Apply & Save</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {PALETTES.map(p => (
                                <div
                                    key={p.name}
                                    onClick={() => applyPalette(p)}
                                    className="flex items-center justify-between px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 hover:border-blue-400 hover:bg-blue-50/60 shadow-xs transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <span className="text-base leading-none shrink-0">{p.emoji}</span>
                                        <span className="font-semibold text-xs truncate group-hover:text-blue-600">{p.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-center gap-0.5">
                                            <span className="w-3 h-3 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: p.colors.primary }} />
                                            <span className="w-3 h-3 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: p.colors.secondary }} />
                                            <span className="w-3 h-3 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: p.colors.background }} />
                                        </div>
                                        <button
                                            onClick={(e) => applyAndSavePalette(p, e)}
                                            title={`Apply & Save ${p.name} Live to Website`}
                                        >
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                            <FiSearch size={12} className="text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search settings..."
                                className="flex-1 bg-transparent text-xs outline-none text-gray-600 placeholder-gray-400"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                                    <FiAlertCircle size={11} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable settings */}
                    <div className="flex-1 overflow-y-auto theme-panel-scroll px-4 py-3">

                        {/* Color Groups */}
                        {COLOR_GROUPS.filter(g => !searchQuery || groupMatchesSearch(g)).map(group => (
                            <Accordion
                                key={group.id}
                                id={group.id}
                                icon={group.icon}
                                label={group.label}
                                badge={group.fields.length}
                                defaultOpen={group.id === "brand"}
                                searchActive={!!searchQuery && groupMatchesSearch(group)}
                            >
                                <div className="grid grid-cols-1 gap-3">
                                    {group.fields.filter(f => matchesSearch(f.label)).map(field => (
                                        <ColorPicker
                                            key={field.key}
                                            label={field.label}
                                            desc={field.desc}
                                            value={workingTheme.colors?.[field.key] || ''}
                                            onChange={(val) => handleColorChange(field.key, val)}
                                        />
                                    ))}
                                </div>
                            </Accordion>
                        ))}

                        {/* Cards & Borders */}
                        {(!searchQuery || "cards borders radius shadow".includes(searchQuery.toLowerCase())) && (
                            <Accordion icon={FiSquare} label="Cards & Borders" searchActive={!!searchQuery}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Border Radius</label>
                                        <input
                                            type="text"
                                            value={workingTheme.cards?.borderRadius || '1rem'}
                                            onChange={(e) => handleCardChange('borderRadius', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Box Shadow</label>
                                        <input
                                            type="text"
                                            value={workingTheme.cards?.shadow || ''}
                                            onChange={(e) => handleCardChange('shadow', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Hover Shadow</label>
                                        <input
                                            type="text"
                                            value={workingTheme.cards?.hoverShadow || ''}
                                            onChange={(e) => handleCardChange('hoverShadow', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">
                                            Hover Scale: {workingTheme.cards?.hoverScale || '1.02'}
                                        </label>
                                        <input
                                            type="range" min="1" max="1.1" step="0.01"
                                            value={parseFloat(workingTheme.cards?.hoverScale) || 1.02}
                                            onChange={(e) => handleCardChange('hoverScale', e.target.value)}
                                            className="w-full accent-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Border Width</label>
                                        <input
                                            type="text"
                                            value={workingTheme.cards?.borderWidth || '1px'}
                                            onChange={(e) => handleCardChange('borderWidth', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-400"
                                        />
                                    </div>
                                </div>
                            </Accordion>
                        )}

                        {/* Typography */}
                        {(!searchQuery || "typography font text size".includes(searchQuery.toLowerCase())) && (
                            <Accordion icon={FiType} label="Typography">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Font Family</label>
                                        <select
                                            value={workingTheme.typography?.fontFamily || "'Google Sans', sans-serif"}
                                            onChange={(e) => handleTypoChange('fontFamily', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
                                        >
                                            <option value="'Google Sans', sans-serif">Google Sans</option>
                                            <option value="'Inter', sans-serif">Inter</option>
                                            <option value="'Roboto', sans-serif">Roboto</option>
                                            <option value="'Poppins', sans-serif">Poppins</option>
                                            <option value="'Outfit', sans-serif">Outfit</option>
                                            <option value="'DM Sans', sans-serif">DM Sans</option>
                                            <option value="serif">Serif</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Base Font Size</label>
                                        <input
                                            type="text"
                                            value={workingTheme.typography?.fontSizeBase || '16px'}
                                            onChange={(e) => handleTypoChange('fontSizeBase', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Line Height</label>
                                        <input
                                            type="range" min="1.2" max="2.0" step="0.1"
                                            value={parseFloat(workingTheme.typography?.lineHeight) || 1.6}
                                            onChange={(e) => handleTypoChange('lineHeight', e.target.value)}
                                            className="w-full accent-blue-500"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-0.5">{workingTheme.typography?.lineHeight || '1.6'}</p>
                                    </div>
                                </div>
                            </Accordion>
                        )}

                        {/* Animations */}
                        {(!searchQuery || "animations transitions effects hover".includes(searchQuery.toLowerCase())) && (
                            <Accordion icon={FiActivity} label="Animations & Transitions">
                                <div className="space-y-3">
                                    {[
                                        { key: 'enableHoverScale', label: 'Hover Scale Effect' },
                                        { key: 'enableButtonRipple', label: 'Button Ripple Effect' },
                                        { key: 'enableFadeIn', label: 'Fade In Animation' },
                                        { key: 'enableSlide', label: 'Slide Animation' },
                                        { key: 'enableCardLift', label: 'Card Lift on Hover' },
                                    ].map(anim => (
                                        <label key={anim.key} className="flex items-center justify-between cursor-pointer">
                                            <span className="text-xs text-gray-600">{anim.label}</span>
                                            <div
                                                onClick={() => handleAnimChange(anim.key, !workingTheme.animations?.[anim.key])}
                                                className="relative w-9 h-5 rounded-full transition-colors cursor-pointer"
                                                style={{ backgroundColor: workingTheme.animations?.[anim.key] ? 'var(--primary)' : '#d1d5db' }}
                                            >
                                                <div
                                                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                                                    style={{ left: workingTheme.animations?.[anim.key] ? '18px' : '2px' }}
                                                />
                                            </div>
                                        </label>
                                    ))}
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">
                                            Transition Speed: {workingTheme.animations?.transitionSpeed || '300ms'}
                                        </label>
                                        <input
                                            type="range" min="100" max="700" step="50"
                                            value={parseInt(workingTheme.animations?.transitionSpeed) || 300}
                                            onChange={(e) => handleAnimChange('transitionSpeed', `${e.target.value}ms`)}
                                            className="w-full accent-blue-500"
                                        />
                                    </div>
                                </div>
                            </Accordion>
                        )}

                        {/* Reset to defaults */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleResetToDefaults}
                                className="w-full py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FiRotateCcw size={12} /> Reset All to Defaults
                            </button>
                        </div>
                    </div>

                    {/* Sticky Action Footer */}
                    <div className="p-3 bg-white border-t border-gray-200 shadow-md shrink-0 flex items-center justify-between gap-2 z-10">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-bold text-gray-800 truncate">
                                {selectedTheme?.name || 'Theme'}
                            </span>
                            <span className="text-[10px] font-medium" style={{ color: hasUnsavedChanges ? '#d97706' : '#16a34a' }}>
                                {hasUnsavedChanges ? '● Unsaved changes' : '✓ Saved to database'}
                            </span>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || !selectedThemeId}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                        >
                            {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
                            {saving ? "Saving..." : "Save Theme Live"}
                        </button>
                    </div>
                </aside>

                {/* ═══════════════════════════════════════════
                    RIGHT PANEL — Live Preview
                ═══════════════════════════════════════════ */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 min-w-0">
                    {/* Preview toolbar */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shrink-0 gap-2 overflow-x-auto">
                        {/* Page navigation */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0">
                            {PREVIEW_PAGES.map(page => (
                                <button
                                    key={page.id}
                                    onClick={() => setPreviewPage(page.id)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                                    style={{
                                        backgroundColor: previewPage === page.id ? 'var(--primary)' : 'transparent',
                                        color: previewPage === page.id ? '#fff' : '#6b7280',
                                    }}
                                >
                                    {page.label}
                                </button>
                            ))}
                        </div>

                        {/* Viewport selector */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0">
                            {VIEWPORT_SIZES.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setViewport(v.id)}
                                    title={v.label}
                                    className="p-1.5 rounded-lg transition-all"
                                    style={{
                                        backgroundColor: viewport === v.id ? '#fff' : 'transparent',
                                        color: viewport === v.id ? 'var(--primary)' : '#9ca3af',
                                        boxShadow: viewport === v.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                >
                                    <v.icon size={14} />
                                </button>
                            ))}
                        </div>

                        {/* Live badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-gray-500 font-medium">Live Preview</span>
                        </div>
                    </div>

                    {/* Preview canvas */}
                    <div
                        ref={previewContainerRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden flex items-start justify-center p-4 min-w-0"
                    >
                        <div
                            className="relative bg-white rounded-xl shadow-2xl overflow-hidden theme-builder-preview transition-all duration-300 w-full"
                            style={{
                                maxWidth: `${vp.width}px`,
                                minHeight: '600px',
                            }}
                        >
                            {/* Browser chrome mockup */}
                            <div
                                className="flex items-center gap-2 px-4 py-2.5 border-b"
                                style={{ backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }}
                            >
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 border border-gray-200 truncate">
                                    https://comfortseatspk.com
                                </div>
                                <FiEye size={13} className="text-gray-400" />
                            </div>

                            {/* Rendered preview */}
                            <PreviewNavbar />
                            <div className="overflow-y-auto" style={{ maxHeight: '700px' }}>
                                <PreviewPage />
                            </div>
                            <PreviewFooter />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminColor;