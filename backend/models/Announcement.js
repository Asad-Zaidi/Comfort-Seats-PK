const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: false,
    },
    text: {
        type: String,
        trim: true,
        default: 'Free shipping',
    },
    backgroundColor: {
        type: String,
        trim: true,
        default: '#1e3a5f',
    },
    textColor: {
        type: String,
        trim: true,
        default: '#ffffff',
    },
    link: {
        type: String,
        trim: true,
        default: '',
    },
    linkText: {
        type: String,
        trim: true,
        default: 'Shop Now',
    },
    fontSize: {
        type: String,
        trim: true,
        default: '14',
    },
    showCloseButton: {
        type: Boolean,
        default: true,
    },
    speed: {
        type: Number,
        default: 10,
        min: 3,
        max: 30,
    },
    paddingY: {
        type: Number,
        default: 8,
        min: 4,
        max: 40,
    },
}, {
    timestamps: true,
});

AnnouncementSchema.statics.getSingleton = async function () {
    let announcement = await this.findOne();
    if (!announcement) {
        announcement = await this.create({});
    }
    return announcement;
};

module.exports = mongoose.model('Announcement', AnnouncementSchema);