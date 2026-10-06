const mongoose = require('mongoose');

const salesCampaignSchema = new mongoose.Schema(
    {
        campaignName: {
            type: String,
            required: [true, 'Campaign title is required'],
            trim: true,
        },
        heading: {
            type: String,
            trim: true,
            default: '',
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
        },
        productName: {
            type: String,
            default: '',
        },
        productSlug: {
            type: String,
            default: '',
        },
        saleProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        isSalePageEnabled: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        discountText: {
            type: String,
            trim: true,
            default: '',
        },
        badgeText: {
            type: String,
            trim: true,
            default: 'LIMITED TIME OFFER',
        },
        ctaText: {
            type: String,
            trim: true,
            default: 'SHOP NOW',
        },
        ctaUrl: {
            type: String,
            trim: true,
            default: '/products',
        },
        image: {
            url: { type: String, default: '' },
            publicId: { type: String, default: '' },
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DRAFT'],
            default: 'DRAFT',
        },
        isPopupEnabled: {
            type: Boolean,
            default: true,
        },
        startDate: {
            type: Date,
            default: null,
        },
        endDate: {
            type: Date,
            default: null,
        },
        countdownEnabled: {
            type: Boolean,
            default: true,
        },
        displayFrequency: {
            type: String,
            enum: ['every_visit', 'once_per_session', 'once_per_day', 'once_per_campaign'],
            default: 'once_per_session',
        },
        showCloseButton: {
            type: Boolean,
            default: true,
        },
        closeOnOverlayClick: {
            type: Boolean,
            default: true,
        },
        closeOnEsc: {
            type: Boolean,
            default: true,
        },
        showOnMobile: {
            type: Boolean,
            default: true,
        },
        showOnDesktop: {
            type: Boolean,
            default: true,
        },
        displayDelay: {
            type: Number,
            default: 0,
            min: 0,
            max: 30,
        },
        animation: {
            type: String,
            enum: ['scale_fade', 'fade', 'scale', 'slide_up', 'none'],
            default: 'scale_fade',
        },
        theme: {
            type: String,
            enum: ['website', 'light', 'dark', 'custom'],
            default: 'website',
        },
        backgroundType: {
            type: String,
            enum: ['theme', 'image', 'gradient'],
            default: 'theme',
        },
        overlay: {
            type: Number,
            default: 40,
            min: 0,
            max: 100,
        },
        textAlignment: {
            type: String,
            enum: ['left', 'center', 'right'],
            default: 'center',
        },
        customBgColor: {
            type: String,
            default: '#1e293b',
        },
        customTextColor: {
            type: String,
            default: '#ffffff',
        },
        customAccentColor: {
            type: String,
            default: '#2F6FED',
        },
        // Announcement Bar Settings
        showAnnouncementBar: {
            type: Boolean,
            default: true,
        },
        announcementText: {
            type: String,
            trim: true,
            default: '',
        },
        announcementBgColor: {
            type: String,
            default: '#1e3a5f',
        },
        announcementTextColor: {
            type: String,
            default: '#ffffff',
        },
        announcementLinkText: {
            type: String,
            default: 'Shop Sale',
        },
        announcementLink: {
            type: String,
            default: '',
        },
        announcementCountdown: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Method to compute dynamic status based on schedule dates
salesCampaignSchema.methods.getEffectiveStatus = function () {
    if (this.status === 'DRAFT') return 'DRAFT';

    const now = new Date();
    if (this.startDate && new Date(this.startDate) > now) {
        return 'SCHEDULED';
    }
    if (this.endDate && new Date(this.endDate) < now) {
        return 'EXPIRED';
    }
    return 'ACTIVE';
};

// Static helper to find the single currently active customer sales campaign
salesCampaignSchema.statics.findActiveForStorefront = async function () {
    const now = new Date();
    const query = {
        status: 'ACTIVE',
        $and: [
            {
                $or: [
                    { isPopupEnabled: true },
                    { showAnnouncementBar: true },
                    { isSalePageEnabled: true },
                ],
            },
            {
                $or: [
                    { startDate: null },
                    { startDate: { $exists: false } },
                    { startDate: { $lte: now } },
                ],
            },
            {
                $or: [
                    { endDate: null },
                    { endDate: { $exists: false } },
                    { endDate: { $gte: now } },
                ],
            },
        ],
    };

    return await this.findOne(query).populate('saleProducts').sort({ updatedAt: -1 });
};

module.exports = mongoose.model('SalesCampaign', salesCampaignSchema);
