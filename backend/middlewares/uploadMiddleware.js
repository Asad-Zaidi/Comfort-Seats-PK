const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter to accept only image files
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
};

// Base multer instance with memory storage
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: imageFilter
});

// Middleware to handle single banner image upload
exports.uploadBannerImage = upload.single('bannerImage');

// Middleware to handle both desktop and mobile banner images (for home banner)
// Fields: 'desktopImage' and 'mobileImage' - each can be uploaded independently
exports.uploadHomeBannerImages = upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
]);

// Middleware to handle single category image upload
exports.uploadCategoryImage = upload.single('image');

// Middleware to handle single review image upload (field name: 'reviewImage')
exports.uploadReviewImage = upload.single('reviewImage');

// Middleware to handle single order payment receipt upload (field name: 'receipt')
exports.uploadReceipt = upload.single('receipt');

// Middleware to handle payment method image uploads (qrCode and logo)
exports.uploadPaymentImages = upload.fields([
    { name: 'qrCode', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]);

// Middleware to handle product creation/update with multiple fields:
// - 'productImages': up to 6 general product images
// - 'colorImages_<index>': up to 6 images per color variant
// - 'standImages_<index>': up to 6 images per stand type
exports.uploadProductImages = upload.fields([
    { name: 'productImages', maxCount: 6 },
    { name: 'standImages_0', maxCount: 6 },
    { name: 'standImages_1', maxCount: 6 },
    { name: 'standImages_2', maxCount: 6 },
    { name: 'standImages_3', maxCount: 6 },
    { name: 'standImages_4', maxCount: 6 },
]);

// Generic upload.any() for backward compatibility
exports.uploadAny = upload.any();

// Also export the base multer instance for routes that need custom setup
exports.multerInstance = multer;

// File size limit constant for frontend use (5MB)
exports.MAX_FILE_SIZE = 5 * 1024 * 1024;

// Helper to safely delete temp files if disk storage is used
const cleanupTempFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            console.error('[uploadMiddleware] Failed to delete temp file:', e.message);
        }
    }
};
exports.cleanupTempFile = cleanupTempFile;

// Allowed MIME types
exports.ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];