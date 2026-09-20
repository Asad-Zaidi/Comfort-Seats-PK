const mongoose = require('mongoose');

const WarrantyConfigSchema = new mongoose.Schema(
    {
        coveredTitle: {
            type: String,
            default: 'Covered Under Warranty:',
            trim: true,
        },
        coveredItems: {
            type: [String],
            default: [
                'Manufacturing or structural flaws',
                'Defective hydraulics, gas lifts, or mechanisms',
                'Broken joints or welding defects under normal use',
                'Missing hardware or parts upon unboxing',
            ],
        },
        notCoveredTitle: {
            type: String,
            default: 'Not Covered:',
            trim: true,
        },
        notCoveredItems: {
            type: [String],
            default: [
                'Normal wear and tear of fabric / leather over time',
                'Accidental cuts, burns, or liquid spills',
                'Damage due to improper assembly or unauthorized modification',
            ],
        },
        promiseTitle: {
            type: String,
            default: 'ComfortSeats Promise',
            trim: true,
        },
        promiseSubtitle: {
            type: String,
            default: 'Authentic & Reliable Support',
            trim: true,
        },
        promiseItems: {
            type: [
                {
                    title: { type: String, default: '' },
                    desc: { type: String, default: '' },
                },
            ],
            default: [
                {
                    title: '100% Genuine Replacement',
                    desc: 'Authentic parts manufactured to original specs.',
                },
                {
                    title: 'Rapid 24-48h Review',
                    desc: 'Prompt inspection and communication from our tech specialists.',
                },
                {
                    title: 'Doorstep Pickup & Delivery',
                    desc: 'Seamless courier service right to your home in Pakistan.',
                },
            ],
        },
        tipsTitle: {
            type: String,
            default: 'Helpful Tips',
            trim: true,
        },
        tipsItems: {
            type: [String],
            default: [
                'Take photos in good lighting to capture the defect clearly.',
                'If a mechanical part is making noise, a 5-10 second video helps diagnose it immediately.',
                'Double-check your phone number so our team can WhatsApp or call you for quick confirmation.',
            ],
        },
    },
    {
        timestamps: true,
    }
);

// Static method to fetch singleton or seed defaults
WarrantyConfigSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

module.exports = mongoose.model('WarrantyConfig', WarrantyConfigSchema);
