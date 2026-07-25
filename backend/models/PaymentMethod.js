const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    // Payment type: Bank, Mobile Wallet, Digital Payment, Other
    type: {
        type: String,
        enum: ['Bank', 'Mobile Wallet', 'Digital Payment', 'Other'],
        default: 'Bank'
    },

    // Structured payment details
    accountTitle: {
        type: String,
        default: '',
        trim: true
    },

    accountNumber: {
        type: String,
        default: '',
        trim: true
    },

    iban: {
        type: String,
        default: '',
        trim: true
    },

    // Icon from the preset bank icons list (e.g. "Meezan Bank" key)
    icon: {
        type: String,
        default: ''
    },

    // Optional logo (custom upload via Cloudinary, overrides icon)
    logo: {
        type: String,
        default: ''
    },

    // Optional QR code image (Cloudinary URL)
    qrCode: {
        type: String,
        default: ''
    },

    // Display order for checkout sorting
    displayOrder: {
        type: Number,
        default: 0
    },

    enabled: {
        type: Boolean,
        default: true
    },

    // Legacy generic fields for backward compatibility / extra info
    fields: [
        {
            label: {
                type: String,
                required: true
            },
            value: {
                type: String,
                default: ""
            }
        }
    ]
}, { _id: true });

const PaymentSettingsSchema = new mongoose.Schema({
    paymentMethods: {
        type: [PaymentMethodSchema],
        default: [
            {
                name: "Cash on Delivery",
                enabled: true,
                fields: []
            },
            {
                name: "Bank Transfer",
                enabled: true,
                fields: [
                    { label: "Bank Name", value: "" },
                    { label: "Account Title", value: "" },
                    { label: "Account Number", value: "" },
                    { label: "IBAN", value: "" }
                ]
            }
        ]
    },

    instructions: {
        type: String,
        trim: true
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

PaymentSettingsSchema.pre("save", function(next){
    this.updatedAt = new Date();
    next();
});

PaymentSettingsSchema.statics.getSingleton = async function () {
    let settings = await this.findOne();

    if (!settings) {
        settings = await this.create({});
    }

    return settings;
};

module.exports = mongoose.model("PaymentSettings", PaymentSettingsSchema);