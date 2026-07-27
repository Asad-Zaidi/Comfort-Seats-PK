const mongoose = require('mongoose');

const ThemeColorsSchema = new mongoose.Schema({
    // Brand
    primary: { type: String, default: '#2F6FED' },
    primaryHover: { type: String, default: '#1d4ed8' },
    secondary: { type: String, default: '#F5A524' },
    secondaryHover: { type: String, default: '#d48c1a' },
    accent: { type: String, default: '#f97316' },

    // Backgrounds
    background: { type: String, default: '#ffffff' },
    backgroundSecondary: { type: String, default: '#f8fafc' },
    backgroundTertiary: { type: String, default: '#FAF9F6' },
    cardBg: { type: String, default: '#ffffff' },
    sidebarBg: { type: String, default: '#1e293b' },
    modalBg: { type: String, default: '#ffffff' },

    // Text
    textPrimary: { type: String, default: '#12131A' },
    textSecondary: { type: String, default: '#6b7280' },
    textLight: { type: String, default: '#9ca3af' },
    linkColor: { type: String, default: '#2F6FED' },

    // Navbar
    headerBg: { type: String, default: '#ffffff' },
    headerText: { type: String, default: '#1f2937' },
    headerActiveLink: { type: String, default: '#2F6FED' },
    headerHoverLink: { type: String, default: '#2F6FED' },
    headerDropdownBg: { type: String, default: '#ffffff' },
    headerDropdownText: { type: String, default: '#1f2937' },

    // Footer
    footerBg: { type: String, default: '#12131A' },
    footerText: { type: String, default: '#ffffff' },
    footerLink: { type: String, default: '#9ca3af' },
    footerLinkHover: { type: String, default: '#2F6FED' },
    footerBorder: { type: String, default: '#374151' },

    // Announcement Bar
    announcementBg: { type: String, default: '#12131A' },
    announcementText: { type: String, default: '#ffffff' },

    // Buttons — Primary
    btnPrimaryBg: { type: String, default: '#2F6FED' },
    btnPrimaryText: { type: String, default: '#ffffff' },
    btnPrimaryHoverBg: { type: String, default: '#1d4ed8' },
    btnPrimaryBorder: { type: String, default: 'transparent' },

    // Buttons — Secondary
    btnSecondaryBg: { type: String, default: '#F5A524' },
    btnSecondaryText: { type: String, default: '#ffffff' },
    btnSecondaryHoverBg: { type: String, default: '#d48c1a' },
    btnSecondaryBorder: { type: String, default: 'transparent' },

    // Buttons — Outline
    btnOutlineBg: { type: String, default: 'transparent' },
    btnOutlineText: { type: String, default: '#2F6FED' },
    btnOutlineBorder: { type: String, default: '#2F6FED' },
    btnOutlineHoverBg: { type: String, default: '#2F6FED' },

    // Buttons — Danger / Success
    btnDangerBg: { type: String, default: '#E5484D' },
    btnDangerText: { type: String, default: '#ffffff' },
    btnSuccessBg: { type: String, default: '#10B981' },
    btnSuccessText: { type: String, default: '#ffffff' },

    // Utility
    border: { type: String, default: '#e5e7eb' },
    success: { type: String, default: '#10B981' },
    error: { type: String, default: '#E5484D' },
    warning: { type: String, default: '#F59E0B' },
    info: { type: String, default: '#3B82F6' },

    // Product Card
    cardBorder: { type: String, default: '#e5e7eb' },
    productNameColor: { type: String, default: '#12131A' },
    productPriceColor: { type: String, default: '#2F6FED' },
    productDiscountColor: { type: String, default: '#E5484D' },
    ratingStarColor: { type: String, default: '#F59E0B' },

    // Forms
    inputBg: { type: String, default: '#ffffff' },
    inputBorder: { type: String, default: '#e5e7eb' },
    inputFocusBorder: { type: String, default: '#2F6FED' },
    inputPlaceholder: { type: String, default: '#9ca3af' },
    labelColor: { type: String, default: '#374151' },

    // Legacy alias kept for backward compatibility
    buttonText: { type: String, default: '#ffffff' },
}, { _id: false });

const ThemeTypographySchema = new mongoose.Schema({
    fontFamily: { type: String, default: "'Google Sans', sans-serif" },
    fontSizeBase: { type: String, default: '16px' },
    fontSizeSmall: { type: String, default: '14px' },
    fontSizeLarge: { type: String, default: '18px' },
    fontWeightNormal: { type: String, default: '400' },
    fontWeightMedium: { type: String, default: '500' },
    fontWeightBold: { type: String, default: '700' },
    lineHeight: { type: String, default: '1.6' },
    headingLineHeight: { type: String, default: '1.2' },
}, { _id: false });

const ThemeCardsSchema = new mongoose.Schema({
    borderRadius: { type: String, default: '1rem' },
    shadow: { type: String, default: '0 4px 6px rgba(0,0,0,0.07)' },
    hoverShadow: { type: String, default: '0 20px 40px rgba(0,0,0,0.15)' },
    hoverScale: { type: String, default: '1.02' },
    borderWidth: { type: String, default: '1px' },
}, { _id: false });

const ThemeAnimationsSchema = new mongoose.Schema({
    enableHoverScale: { type: Boolean, default: true },
    enableButtonRipple: { type: Boolean, default: true },
    enableFadeIn: { type: Boolean, default: true },
    enableSlide: { type: Boolean, default: true },
    enableCardLift: { type: Boolean, default: true },
    transitionSpeed: { type: String, default: '300ms' },
}, { _id: false });

const SectionStyleSchema = new mongoose.Schema({
    bg: { type: String, default: '' },
    headingColor: { type: String, default: '' },
    descriptionColor: { type: String, default: '' },
    buttonColor: { type: String, default: '' },
    paddingY: { type: String, default: '5rem' },
}, { _id: false });

const ThemeSectionsSchema = new mongoose.Schema({
    hero: { type: SectionStyleSchema, default: () => ({}) },
    categories: { type: SectionStyleSchema, default: () => ({}) },
    featuredProducts: { type: SectionStyleSchema, default: () => ({}) },
    bestSellers: { type: SectionStyleSchema, default: () => ({}) },
    newArrivals: { type: SectionStyleSchema, default: () => ({}) },
    testimonials: { type: SectionStyleSchema, default: () => ({}) },
    faq: { type: SectionStyleSchema, default: () => ({}) },
    contact: { type: SectionStyleSchema, default: () => ({}) },
    footer: { type: SectionStyleSchema, default: () => ({}) },
}, { _id: false });

const ThemeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'Default Theme',
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    colors: {
        type: ThemeColorsSchema,
        default: () => ({}),
    },
    typography: {
        type: ThemeTypographySchema,
        default: () => ({}),
    },
    cards: {
        type: ThemeCardsSchema,
        default: () => ({}),
    },
    animations: {
        type: ThemeAnimationsSchema,
        default: () => ({}),
    },
    sections: {
        type: ThemeSectionsSchema,
        default: () => ({}),
    },
}, {
    timestamps: true,
});

// Ensure only one active theme at a time
ThemeSchema.statics.activateTheme = async function (themeId) {
    await this.updateMany({ isActive: true }, { $set: { isActive: false } });
    return this.findByIdAndUpdate(themeId, { $set: { isActive: true } }, { new: true });
};

ThemeSchema.statics.getActiveTheme = async function () {
    let theme = await this.findOne({ isActive: true });
    if (!theme) {
        // Try default
        theme = await this.findOne({ isDefault: true });
    }
    if (!theme) {
        // Auto-create the default theme
        theme = await this.create({ name: 'Default', isActive: true, isDefault: true });
    }
    return theme;
};

module.exports = mongoose.model('Theme', ThemeSchema);
