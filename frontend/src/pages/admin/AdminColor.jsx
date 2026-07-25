import { useEffect, useState } from "react";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiLoader,
    FiSave,
    FiRotateCcw,
    FiCopy,
    FiDroplet,
} from "react-icons/fi";
import api from "../../api/api";
import { useToast } from "../../components/ToastNotification";
import { useSiteConfig, invalidateSiteContentCache } from "../../utils/siteConfig";

const colorCategories = [
    {
        name: "Brand Colors",
        keys: [
            { key: "primary", label: "Primary", desc: "Main brand color (buttons, links)" },
            { key: "primaryHover", label: "Primary Hover", desc: "Darker shade for hover states" },
            { key: "secondary", label: "Secondary", desc: "Accent/secondary brand color" },
            { key: "secondaryHover", label: "Secondary Hover", desc: "Darker shade for hover" },
            { key: "accent", label: "Accent", desc: "Alert/accent color" },
        ],
    },
    {
        name: "Text Colors",
        keys: [
            { key: "textPrimary", label: "Primary Text", desc: "Main body text color" },
            { key: "textSecondary", label: "Secondary Text", desc: "Muted/secondary text" },
            { key: "textLight", label: "Light Text", desc: "Very light/placeholder text" },
        ],
    },
    {
        name: "Background Colors",
        keys: [
            { key: "background", label: "Main Background", desc: "Page background" },
            { key: "backgroundSecondary", label: "Secondary Background", desc: "Section alt background" },
            { key: "backgroundTertiary", label: "Tertiary Background", desc: "Testimonial/special section bg" },
            { key: "cardBg", label: "Card Background", desc: "Product/card background" },
        ],
    },
    {
        name: "Header & Footer",
        keys: [
            { key: "headerBg", label: "Header Background", desc: "Navbar background" },
            { key: "headerText", label: "Header Text", desc: "Navbar text color" },
            { key: "footerBg", label: "Footer Background", desc: "Footer background" },
            { key: "footerText", label: "Footer Text", desc: "Footer text color" },
        ],
    },
    {
        name: "Other Colors",
        keys: [
            { key: "border", label: "Border", desc: "Border color for cards/sections" },
            { key: "success", label: "Success", desc: "Success/positive messages" },
            { key: "error", label: "Error", desc: "Error/negative messages" },
            { key: "buttonText", label: "Button Text", desc: "Text on primary buttons" },
            { key: "announcementBg", label: "Announcement Bar BG", desc: "Bar background" },
            { key: "announcementText", label: "Announcement Bar Text", desc: "Bar text color" },
        ],
    },
    {
        name: "Card Colors",
        keys: [
            { key: "cardBg", label: "Card Background", desc: "Background for cards" },
            { key: "cardBorder", label: "Card Border", desc: "Border color for cards" },
        ],
    }
];

const colorPalettes = [
    {
        name: "Default Blue",
        colors: {
            primary: "#2F6FED",
            primaryHover: "#1d4ed8",
            secondary: "#F5A524",
            secondaryHover: "#d48c1a",
            accent: "#f97316",
            textPrimary: "#12131A",
            textSecondary: "#6b7280",
            textLight: "#9ca3af",
            background: "#ffffff",
            backgroundSecondary: "#f8fafc",
            backgroundTertiary: "#FAF9F6",
            border: "#e5e7eb",
            success: "#10B981",
            error: "#E5484D",
            headerBg: "#ffffff",
            headerText: "#1f2937",
            footerBg: "#12131A",
            footerText: "#ffffff",
            buttonText: "#ffffff",
            cardBg: "#ffffff",
            announcementBg: "#12131A",
            announcementText: "#ffffff",
        },
    },
    {
        name: "Emerald Green",
        colors: {
            primary: "#059669",
            primaryHover: "#047857",
            secondary: "#F59E0B",
            secondaryHover: "#D97706",
            accent: "#EF4444",
            textPrimary: "#111827",
            textSecondary: "#6B7280",
            textLight: "#9CA3AF",
            background: "#ffffff",
            backgroundSecondary: "#F0FDF4",
            backgroundTertiary: "#ECFDF5",
            border: "#D1FAE5",
            success: "#10B981",
            error: "#DC2626",
            headerBg: "#ffffff",
            headerText: "#111827",
            footerBg: "#064E3B",
            footerText: "#ffffff",
            buttonText: "#ffffff",
            cardBg: "#ffffff",
            announcementBg: "#064E3B",
            announcementText: "#ffffff",
        },
    },
    {
        name: "Royal Purple",
        colors: {
            primary: "#7C3AED",
            primaryHover: "#6D28D9",
            secondary: "#F59E0B",
            secondaryHover: "#D97706",
            accent: "#EC4899",
            textPrimary: "#1F2937",
            textSecondary: "#6B7280",
            textLight: "#9CA3AF",
            background: "#ffffff",
            backgroundSecondary: "#F5F3FF",
            backgroundTertiary: "#EDE9FE",
            border: "#DDD6FE",
            success: "#10B981",
            error: "#DC2626",
            headerBg: "#ffffff",
            headerText: "#1F2937",
            footerBg: "#4C1D95",
            footerText: "#ffffff",
            buttonText: "#ffffff",
            cardBg: "#ffffff",
            announcementBg: "#4C1D95",
            announcementText: "#ffffff",
        },
    },
    {
        name: "Warm Orange",
        colors: {
            primary: "#EA580C",
            primaryHover: "#C2410C",
            secondary: "#2563EB",
            secondaryHover: "#1D4ED8",
            accent: "#DC2626",
            textPrimary: "#1F2937",
            textSecondary: "#6B7280",
            textLight: "#9CA3AF",
            background: "#ffffff",
            backgroundSecondary: "#FFF7ED",
            backgroundTertiary: "#FFEDD5",
            border: "#FED7AA",
            success: "#10B981",
            error: "#DC2626",
            headerBg: "#ffffff",
            headerText: "#1F2937",
            footerBg: "#9A3412",
            footerText: "#ffffff",
            buttonText: "#ffffff",
            cardBg: "#ffffff",
            announcementBg: "#9A3412",
            announcementText: "#ffffff",
        },
    },
    {
        name: "Dark Mode",
        colors: {
            primary: "#3B82F6",
            primaryHover: "#2563EB",
            secondary: "#F59E0B",
            secondaryHover: "#D97706",
            accent: "#EF4444",
            textPrimary: "#F9FAFB",
            textSecondary: "#D1D5DB",
            textLight: "#9CA3AF",
            background: "#0F172A",
            backgroundSecondary: "#1E293B",
            backgroundTertiary: "#334155",
            border: "#475569",
            success: "#10B981",
            error: "#EF4444",
            headerBg: "#1E293B",
            headerText: "#F9FAFB",
            footerBg: "#020617",
            footerText: "#F9FAFB",
            buttonText: "#ffffff",
            cardBg: "#1E293B",
            announcementBg: "#020617",
            announcementText: "#F9FAFB",
        },
    },
    {
        name: "Rose Pink",
        colors: {
            primary: "#E11D48",
            primaryHover: "#BE123C",
            secondary: "#F59E0B",
            secondaryHover: "#D97706",
            accent: "#8B5CF6",
            textPrimary: "#1F2937",
            textSecondary: "#6B7280",
            textLight: "#9CA3AF",
            background: "#ffffff",
            backgroundSecondary: "#FFF1F2",
            backgroundTertiary: "#FFE4E6",
            border: "#FECDD3",
            success: "#10B981",
            error: "#BE123C",
            headerBg: "#ffffff",
            headerText: "#1F2937",
            footerBg: "#9F1239",
            footerText: "#ffffff",
            buttonText: "#ffffff",
            cardBg: "#ffffff",
            announcementBg: "#9F1239",
            announcementText: "#ffffff",
        },
    },
    {
        name: "Ocean Teal",
        colors: {
            primary: "#0D9488",
            primaryHover: "#0F766E",
            secondary: "#F97316",
            secondaryHover: "#EA580C",
            accent: "#8B5CF6",
            textPrimary: "#111827",
            textSecondary: "#4B5563",
            textLight: "#9CA3AF",
            background: "#ffffff",
            backgroundSecondary: "#F0FDFA",
            backgroundTertiary: "#CCFBF1",
            border: "#99F6E4",
            success: "#10B981",
            error: "#DC2626",
            headerBg: "#ffffff",
            headerText: "#111827",
            footerBg: "#115E59",
            footerText: "#ffffff",
            buttonText: "#ffffff",
            cardBg: "#ffffff",
            announcementBg: "#115E59",
            announcementText: "#ffffff",
        },
    },
    {
        name: "Sunset Gradient",
        colors: {
            primary: "#D97706",
            primaryHover: "#B45309",
            secondary: "#7C3AED",
            secondaryHover: "#6D28D9",
            accent: "#DC2626",
            textPrimary: "#1F2937",
            textSecondary: "#6B7280",
            textLight: "#9CA3AF",
            background: "#ffffff",
            backgroundSecondary: "#FFFBEB",
            backgroundTertiary: "#FEF3C7",
            border: "#FDE68A",
            success: "#10B981",
            error: "#DC2626",
            headerBg: "#ffffff",
            headerText: "#1F2937",
            footerBg: "#78350F",
            footerText: "#ffffff",
            buttonText: "#ffffff",
            cardBg: "#ffffff",
            announcementBg: "#78350F",
            announcementText: "#ffffff",
        },
    },
];

const defaultColors = {
    primary: "#2F6FED",
    primaryHover: "#1d4ed8",
    secondary: "#F5A524",
    secondaryHover: "#d48c1a",
    accent: "#f97316",
    textPrimary: "#12131A",
    textSecondary: "#6b7280",
    textLight: "#9ca3af",
    background: "#ffffff",
    backgroundSecondary: "#f8fafc",
    backgroundTertiary: "#FAF9F6",
    border: "#e5e7eb",
    success: "#10B981",
    error: "#E5484D",
    headerBg: "#ffffff",
    headerText: "#1f2937",
    footerBg: "#12131A",
    footerText: "#ffffff",
    buttonText: "#ffffff",
    cardBg: "#ffffff",
    announcementBg: "#12131A",
    announcementText: "#ffffff",
};

const AdminColor = () => {
    const { setSiteContent } = useSiteConfig();
    const [colors, setColors] = useState({ ...defaultColors });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [activeCategory, setActiveCategory] = useState(0);
    const [copiedField, setCopiedField] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const res = await api.get("/site-content");
                if (res.data?.success && res.data.data?.colors) {
                    setColors({ ...defaultColors, ...res.data.data.colors });
                }
            } catch (err) {
                setStatus({ type: "error", message: "Failed to load colors." });
            } finally {
                setLoading(false);
            }
        };
        fetchColors();
    }, []);

    const applyColorsToSite = (colorSet) => {
        // Apply colors to CSS variables and override styles on the site immediately
        const root = document.documentElement;
        const colorMap = {
            '--primary': colorSet.primary,
            '--primary-hover': colorSet.primaryHover,
            '--secondary': colorSet.secondary,
            '--secondary-hover': colorSet.secondaryHover,
            '--accent': colorSet.accent,
            '--text': colorSet.textPrimary,
            '--text-secondary': colorSet.textSecondary,
            '--text-light': colorSet.textLight,
            '--bg': colorSet.background,
            '--bg-secondary': colorSet.backgroundSecondary,
            '--bg-tertiary': colorSet.backgroundTertiary,
            '--border': colorSet.border,
            '--success': colorSet.success,
            '--error': colorSet.error,
            '--header-bg': colorSet.headerBg,
            '--header-text': colorSet.headerText,
            '--footer-bg': colorSet.footerBg,
            '--footer-text': colorSet.footerText,
            '--btn-text': colorSet.buttonText,
            '--card-bg': colorSet.cardBg,
            '--announcement-bg': colorSet.announcementBg,
            '--announcement-text': colorSet.announcementText,
        };

        Object.entries(colorMap).forEach(([key, value]) => {
            if (value) root.style.setProperty(key, value);
        });
    };

    const handleColorChange = (key, value) => {
        setColors((prev) => {
            const updated = { ...prev, [key]: value };
            applyColorsToSite(updated);
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const res = await api.put("/site-content/colors", colors);
            if (res.data?.success) {
                setStatus({ type: "success", message: "Colors updated successfully." });
                toast.success("Colors saved successfully.");
                // Update local cache
                invalidateSiteContentCache();
                // Fetch fresh data
                const freshRes = await api.get("/site-content");
                if (freshRes.data?.success && freshRes.data.data) {
                    setSiteContent(freshRes.data.data);
                }
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to update colors.";
            setStatus({ type: "error", message });
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const applyPalette = (palette) => {
        setColors({ ...palette.colors });
        applyColorsToSite(palette.colors);
        toast.success(`Applied "${palette.name}" palette - previewing now!`);
    };

    const resetToDefaults = () => {
        setColors({ ...defaultColors });
        applyColorsToSite(defaultColors);
        toast.info("Reset to default colors - previewing now!");
    };

    const copyToClipboard = (key, value) => {
        navigator.clipboard.writeText(value).then(() => {
            setCopiedField(key);
            setTimeout(() => setCopiedField(null), 1500);
        });
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <FiLoader className="animate-spin" size={22} />
            </div>
        );
    }

    const inputClass = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-2 focus:ring-[#2F6FED]/10";

    return (
        <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#12131A]">Theme Colors</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Customize the color scheme of the entire website. Changes apply in real-time to the admin panel, and will be visible on the live site after saving.
                    </p>
                </div>
                <button
                    onClick={resetToDefaults}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                    <FiRotateCcw size={14} />
                    Reset to Default
                </button>
            </div>

            {status && (
                <div
                    className={`mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${
                        status.type === "success"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#E5484D]/10 text-[#E5484D]"
                    }`}
                >
                    {status.type === "success" ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
                    {status.message}
                </div>
            )}

            {/* Color Palettes Section */}
            <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                    <FiDroplet className="text-[#F5A524]" size={20} />
                    <div>
                        <h2 className="text-lg font-semibold text-[#12131A]">Color Palettes</h2>
                        <p className="text-sm text-gray-500">
                            Click a palette to instantly apply a complete color scheme.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {colorPalettes.map((palette, idx) => (
                        <button
                            key={idx}
                            onClick={() => applyPalette(palette)}
                            className="group relative rounded-xl border border-gray-200 p-3 text-left transition hover:border-gray-300 hover:shadow-md"
                        >
                            <div className="mb-2 flex gap-1">
                                <span
                                    className="h-5 w-5 rounded-full border border-gray-200"
                                    style={{ backgroundColor: palette.colors.primary }}
                                />
                                <span
                                    className="h-5 w-5 rounded-full"
                                    style={{ backgroundColor: palette.colors.secondary }}
                                />
                                <span
                                    className="h-5 w-5 rounded-full"
                                    style={{ backgroundColor: palette.colors.accent }}
                                />
                                <span
                                    className="h-5 w-5 rounded-full"
                                    style={{ backgroundColor: palette.colors.textPrimary }}
                                />
                                <span
                                    className="h-5 w-5 rounded-full"
                                    style={{ backgroundColor: palette.colors.background }}
                                />
                            </div>
                            <p className="text-xs font-medium text-gray-700">{palette.name}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* Live Preview */}
            <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                    <FiCheckCircle className="text-[#F5A524]" size={20} />
                    <div>
                        <h2 className="text-lg font-semibold text-[#12131A]">Live Preview</h2>
                        <p className="text-sm text-gray-500">Sample of how colors look together.</p>
                    </div>
                </div>
                <div className="rounded-xl border p-6" style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <button
                            className="rounded-lg px-5 py-2 text-sm font-semibold transition"
                            style={{ backgroundColor: colors.primary, color: colors.buttonText }}
                        >
                            Primary Button
                        </button>
                        <button
                            className="rounded-lg px-5 py-2 text-sm font-semibold transition"
                            style={{ backgroundColor: colors.secondary, color: colors.buttonText }}
                        >
                            Secondary Button
                        </button>
                        <span className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{ backgroundColor: `${colors.success}20`, color: colors.success }}>
                            Success
                        </span>
                        <span className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{ backgroundColor: `${colors.error}20`, color: colors.error }}>
                            Error
                        </span>
                    </div>
                    <div className="rounded-lg p-4" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                        <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                            Sample Card Title
                        </h3>
                        <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                            This is how a typical card or content block will appear with the selected colors.
                        </p>
                    </div>
                </div>
            </section>

            {/* Color Editor */}
            <form onSubmit={handleSubmit}>
                <div className="mb-6 flex flex-wrap gap-2">
                    {colorCategories.map((cat, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveCategory(idx)}
                            className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                                activeCategory === idx
                                    ? "bg-[#2F6FED] text-white shadow"
                                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-base font-semibold text-[#12131A]">
                        {colorCategories[activeCategory].name}
                    </h3>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {colorCategories[activeCategory].keys.map(({ key, label, desc }) => (
                            <div key={key}>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label className="text-xs font-medium text-gray-700">{label}</label>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(key, colors[key] || defaultColors[key])}
                                        className="text-[10px] text-gray-400 hover:text-gray-600"
                                        title="Copy hex"
                                    >
                                        {copiedField === key ? "Copied!" : <FiCopy size={12} />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={colors[key] || defaultColors[key]}
                                            onChange={(e) => handleColorChange(key, e.target.value)}
                                            className="h-9 w-10 cursor-pointer rounded-lg border border-gray-200 bg-transparent p-0.5"
                                            style={{ backgroundColor: colors[key] || defaultColors[key] }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={colors[key] || defaultColors[key]}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        className={inputClass}
                                        placeholder="#000000"
                                    />
                                </div>
                                {desc && <p className="mt-1 text-[10px] text-gray-400">{desc}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                        {saving ? "Saving..." : "Save Colors"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminColor;