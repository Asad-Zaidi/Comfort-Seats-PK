const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    instagram: {
        type: String,
        trim: true
    },
    facebook: {
        type: String,
        trim: true
    },
    tiktok: {
        type: String,
        trim: true
    },
    whatsapp: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Keep updatedAt fresh on every save
ContactSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// This is meant to be a single site-wide document (one row of contact info).
// getSingleton() fetches it if it exists, or creates a blank one if it doesn't -
// so the rest of your app never has to worry about "which Contact document" to use.
ContactSchema.statics.getSingleton = async function () {
    let contact = await this.findOne();
    if (!contact) {
        contact = await this.create({});
    }
    return contact;
};

module.exports = mongoose.model('Contact', ContactSchema);
