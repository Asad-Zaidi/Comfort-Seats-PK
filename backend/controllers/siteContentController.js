const fs = require('fs');
const path = require('path');
const SiteContent = require('../models/SiteContent');
const cloudinary = require('../utils/cloudinary');

const homeBannerFields = [
    'eyebrow',
    'title',
    'description',
    'primaryButtonText',
    'primaryButtonLink',
    'secondaryButtonText',
    'secondaryButtonLink',
    'imageUrl',
    'desktopImage',
    'mobileImage',
    'imageAlt',
    'statValue',
    'statLabel'
];

const cleanText = (value) => {
    if (typeof value !== 'string') return value;
    return value.trim();
};

// Clean up temp file
const cleanupTempFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error('Error cleaning up temp file:', err);
        }
    }
};

// @desc    Get editable site content
// @route   GET /api/site-content
// @access  Public
exports.getSiteContent = async (req, res) => {
    try {
        const siteContent = await SiteContent.getSingleton();
        return res.status(200).json({ success: true, data: siteContent });
    } catch (error) {
        console.error('Error fetching site content:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching site content.' });
    }
};

// Helper to upload a single file buffer to Cloudinary
const uploadFileToCloudinary = (file, folder, transformation) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                transformation: transformation || [{ width: 1000, height: 750, crop: 'limit' }]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        uploadStream.end(file.buffer);
    });
};

// @desc    Update homepage banner (with optional image upload)
// @route   PUT /api/site-content/home-banner
// @access  Private/Admin
exports.updateHomeBanner = async (req, res) => {
    try {
        const siteContent = await SiteContent.getSingleton();

        // Handle single file upload (backward compatible - 'bannerImage' field)
        if (req.file) {
            try {
                if (req.file.buffer) {
                    const url = await uploadFileToCloudinary(req.file, 'site-banners', [
                        { width: 1000, height: 750, crop: 'limit' }
                    ]);
                    siteContent.homeBanner.imageUrl = url;
                    if (!siteContent.homeBanner.desktopImage) {
                        siteContent.homeBanner.desktopImage = url;
                    }
                } else if (req.file.path) {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'site-banners',
                        transformation: [{ width: 1000, height: 750, crop: 'limit' }]
                    });
                    siteContent.homeBanner.imageUrl = result.secure_url;
                    // Also set desktopImage for backward compatibility
                    if (!siteContent.homeBanner.desktopImage) {
                        siteContent.homeBanner.desktopImage = result.secure_url;
                    }
                    cleanupTempFile(req.file.path);
                }
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                if (req.file.path) cleanupTempFile(req.file.path);
                return res.status(500).json({ success: false, message: 'Failed to upload banner image.' });
            }
        }

        // Handle multiple file uploads (desktopImage and mobileImage fields)
        if (req.files) {
            // Upload desktop image if provided
            if (req.files.desktopImage && req.files.desktopImage.length > 0) {
                try {
                    const desktopFile = req.files.desktopImage[0];
                    const url = await uploadFileToCloudinary(desktopFile, 'site-banners', [
                        { width: 1920, height: 700, crop: 'limit' }
                    ]);
                    siteContent.homeBanner.desktopImage = url;
                    // Also set imageUrl for backward compatibility
                    siteContent.homeBanner.imageUrl = url;
                } catch (uploadError) {
                    console.error('Cloudinary desktop image upload error:', uploadError);
                    return res.status(500).json({ success: false, message: 'Failed to upload desktop banner image.' });
                }
            }

            // Upload mobile image if provided
            if (req.files.mobileImage && req.files.mobileImage.length > 0) {
                try {
                    const mobileFile = req.files.mobileImage[0];
                    const url = await uploadFileToCloudinary(mobileFile, 'site-banners', [
                        { width: 1080, height: 1350, crop: 'limit' }
                    ]);
                    siteContent.homeBanner.mobileImage = url;
                } catch (uploadError) {
                    console.error('Cloudinary mobile image upload error:', uploadError);
                    return res.status(500).json({ success: false, message: 'Failed to upload mobile banner image.' });
                }
            }
        }

        // Also check for imageUrl in body (for direct URL input).
        // IMPORTANT: Only apply if no file was uploaded for this field — otherwise the
        // freshly-uploaded Cloudinary URL would be overwritten by the old stale URL from the form body.
        const desktopFileUploaded = !!(req.files?.desktopImage?.length > 0);
        const mobileFileUploaded  = !!(req.files?.mobileImage?.length  > 0);
        const legacyFileUploaded  = !!req.file;

        if (!legacyFileUploaded && !desktopFileUploaded &&
            req.body.imageUrl !== undefined && req.body.imageUrl.trim() !== '') {
            siteContent.homeBanner.imageUrl = cleanText(req.body.imageUrl);
        }

        // Only apply body values if they are non-empty strings AND no file was uploaded for that field.
        if (!desktopFileUploaded &&
            req.body.desktopImage !== undefined && req.body.desktopImage.trim() !== '') {
            siteContent.homeBanner.desktopImage = cleanText(req.body.desktopImage);
        }
        if (!mobileFileUploaded &&
            req.body.mobileImage !== undefined && req.body.mobileImage.trim() !== '') {
            siteContent.homeBanner.mobileImage = cleanText(req.body.mobileImage);
        }

        // Update other text fields
        homeBannerFields.forEach((field) => {
            if (req.body[field] !== undefined && field !== 'imageUrl' && field !== 'desktopImage' && field !== 'mobileImage') {
                siteContent.homeBanner[field] = cleanText(req.body[field]);
            }
        });

        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Home banner updated successfully.',
            data: siteContent.homeBanner
        });
    } catch (error) {
        console.error('Error updating home banner:', error);
        if (req.file) cleanupTempFile(req.file.path);
        return res.status(500).json({ success: false, message: 'Server error while updating home banner.' });
    }
};

// @desc    Update categories
// @route   PUT /api/site-content/categories
// @access  Private/Admin
exports.updateCategories = async (req, res) => {
    try {
        const { categories } = req.body;

        if (!Array.isArray(categories)) {
            return res.status(400).json({ success: false, message: 'Categories must be a list.' });
        }

        const normalizedCategories = categories
            .map((item) => ({
                name: cleanText(item?.name || ''),
                icon: cleanText(item?.icon || '')
            }))
            .filter((item) => item.name);

        if (normalizedCategories.length === 0) {
            return res.status(400).json({ success: false, message: 'Add at least one category.' });
        }

        const siteContent = await SiteContent.getSingleton();
        siteContent.categories = normalizedCategories;
        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Categories updated successfully.',
            data: siteContent.categories
        });
    } catch (error) {
        console.error('Error updating categories:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating categories.' });
    }
};

// @desc    Add a single category to the homepage "Shop by Category" list
// @route   POST /api/site-content/categories
// @access  Private/Admin
exports.addCategory = async (req, res) => {
    try {
        const name = cleanText(req.body?.name || '');
        const icon = cleanText(req.body?.icon || '');
        let image = cleanText(req.body?.image || '');

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        const siteContent = await SiteContent.getSingleton();
        const exists = (siteContent.categories || []).some(
            (c) => c.name && c.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            return res.status(200).json({
                success: true,
                message: 'Category already exists.',
                data: siteContent.categories
            });
        }

        // Handle image upload if present
        if (req.file) {
            try {
                if (req.file.buffer) {
                    image = await uploadFileToCloudinary(req.file, 'site-categories', [
                        { width: 600, height: 400, crop: 'limit' }
                    ]);
                } else if (req.file.path) {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'site-categories',
                        transformation: [{ width: 600, height: 400, crop: 'limit' }]
                    });
                    image = result.secure_url;
                    cleanupTempFile(req.file.path);
                }
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                if (req.file.path) cleanupTempFile(req.file.path);
                return res.status(500).json({ success: false, message: 'Failed to upload category image.' });
            }
        }

        siteContent.categories = [...(siteContent.categories || []), { name, icon, image }];
        await siteContent.save();

        return res.status(201).json({
            success: true,
            message: 'Category added successfully.',
            data: siteContent.categories
        });
    } catch (error) {
        console.error('Error adding category:', error);
        if (req.file) cleanupTempFile(req.file.path);
        return res.status(500).json({ success: false, message: 'Server error while adding category.' });
    }
};

// @desc    Delete a single category
// @route   DELETE /api/site-content/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const siteContent = await SiteContent.getSingleton();
        const categoryIndex = (siteContent.categories || []).findIndex(
            (c) => c.name && c.name.toLowerCase() === id.toLowerCase()
        );

        if (categoryIndex === -1) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        // Remove category from array
        siteContent.categories.splice(categoryIndex, 1);
        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully.',
            data: siteContent.categories
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting category.' });
    }
};

// @desc    Update a single category (name and/or image)
// @route   PUT /api/site-content/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const name = cleanText(req.body?.name || '');
        let image = cleanText(req.body?.image || '');

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        const siteContent = await SiteContent.getSingleton();
        const categoryIndex = (siteContent.categories || []).findIndex(
            (c) => c.name && c.name.toLowerCase() === id.toLowerCase()
        );

        if (categoryIndex === -1) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        // Handle image upload if present
        if (req.file) {
            try {
                if (req.file.buffer) {
                    image = await uploadFileToCloudinary(req.file, 'site-categories', [
                        { width: 600, height: 400, crop: 'limit' }
                    ]);
                } else if (req.file.path) {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'site-categories',
                        transformation: [{ width: 600, height: 400, crop: 'limit' }]
                    });
                    image = result.secure_url;
                    cleanupTempFile(req.file.path);
                }
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                if (req.file.path) cleanupTempFile(req.file.path);
                return res.status(500).json({ success: false, message: 'Failed to upload category image.' });
            }
        }

        siteContent.categories[categoryIndex] = {
            ...siteContent.categories[categoryIndex],
            name,
            image: image || siteContent.categories[categoryIndex].image
        };
        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Category updated successfully.',
            data: siteContent.categories
        });
    } catch (error) {
        console.error('Error updating category:', error);
        if (req.file) cleanupTempFile(req.file.path);
        return res.status(500).json({ success: false, message: 'Server error while updating category.' });
    }
};

// @desc    Update why choose us section
// @route   PUT /api/site-content/why-choose-us
// @access  Private/Admin
exports.updateWhyChooseUs = async (req, res) => {
    try {
        const { whyChooseUs } = req.body;

        if (!Array.isArray(whyChooseUs)) {
            return res.status(400).json({ success: false, message: 'Why choose us must be a list.' });
        }

        const normalizedValues = whyChooseUs
            .map((item) => ({
                icon: cleanText(item?.icon || ''),
                title: cleanText(item?.title || ''),
                desc: cleanText(item?.desc || '')
            }))
            .filter((item) => item.title);

        if (normalizedValues.length === 0) {
            return res.status(400).json({ success: false, message: 'Add at least one value item.' });
        }

        const siteContent = await SiteContent.getSingleton();
        siteContent.whyChooseUs = normalizedValues;
        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Why choose us updated successfully.',
            data: siteContent.whyChooseUs
        });
    } catch (error) {
        console.error('Error updating why choose us:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating why choose us.' });
    }
};

// @desc    Update business hours
// @route   PUT /api/site-content/business-hours
// @access  Private/Admin
exports.updateBusinessHours = async (req, res) => {
    try {
        const { businessHours } = req.body;

        if (!Array.isArray(businessHours)) {
            return res.status(400).json({ success: false, message: 'Business hours must be a list.' });
        }

        const normalizedHours = businessHours
            .map((item) => ({
                label: cleanText(item?.label || ''),
                value: cleanText(item?.value || '')
            }))
            .filter((item) => item.label || item.value);

        if (normalizedHours.length === 0) {
            return res.status(400).json({ success: false, message: 'Add at least one business hour row.' });
        }

        const siteContent = await SiteContent.getSingleton();
        siteContent.businessHours = normalizedHours;
        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Business hours updated successfully.',
            data: siteContent.businessHours
        });
    } catch (error) {
        console.error('Error updating business hours:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating business hours.' });
    }
};

// @desc    Update site settings
// @route   PUT /api/site-content/settings
// @access  Private/Admin
exports.updateSiteSettings = async (req, res) => {
    try {
    const { siteName, siteUrl, siteTitle, keywords, logoUrl, faviconUrl, whatsappNumber } = req.body;

        if (!siteName && !siteUrl && !siteTitle && !keywords && !logoUrl && !faviconUrl && whatsappNumber === undefined) {
            return res.status(400).json({ success: false, message: 'No settings provided.' });
        }

        const siteContent = await SiteContent.getSingleton();

        if (siteName !== undefined) {
            siteContent.siteName = cleanText(siteName);
        }

        if (siteUrl !== undefined) {
            siteContent.siteUrl = cleanText(siteUrl);
        }

        if (siteTitle !== undefined) {
            siteContent.siteTitle = cleanText(siteTitle);
        }

        if (keywords !== undefined) {
            siteContent.keywords = cleanText(keywords);
        }

        if (logoUrl !== undefined) {
            siteContent.logoUrl = cleanText(logoUrl);
        }

        if (faviconUrl !== undefined) {
            siteContent.faviconUrl = cleanText(faviconUrl);
        }

        if (whatsappNumber !== undefined) {
            siteContent.whatsappNumber = cleanText(whatsappNumber);
        }

        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Site settings updated successfully.',
            data: {
                siteName: siteContent.siteName,
                siteUrl: siteContent.siteUrl,
                siteTitle: siteContent.siteTitle,
                keywords: siteContent.keywords,
                logoUrl: siteContent.logoUrl,
                faviconUrl: siteContent.faviconUrl,
                whatsappNumber: siteContent.whatsappNumber
            }
        });
    } catch (error) {
        console.error('Error updating site settings:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating site settings.' });
    }
};

// @desc    Update privacy, return, and warranty policies
// @route   PUT /api/site-content/policies
// @access  Private/Admin
exports.updatePolicies = async (req, res) => {
    try {
        const { privacyPolicy, returnPolicy, warrantyPolicy } = req.body;

        if (!privacyPolicy && !returnPolicy && !warrantyPolicy) {
            return res.status(400).json({ success: false, message: 'No policy content provided.' });
        }

        const siteContent = await SiteContent.getSingleton();

        if (privacyPolicy !== undefined) {
            siteContent.privacyPolicy = cleanText(privacyPolicy);
        }

        if (returnPolicy !== undefined) {
            siteContent.returnPolicy = cleanText(returnPolicy);
        }

        if (warrantyPolicy !== undefined) {
            siteContent.warrantyPolicy = cleanText(warrantyPolicy);
        }

        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Policies updated successfully.',
            data: {
                privacyPolicy: siteContent.privacyPolicy,
                returnPolicy: siteContent.returnPolicy,
                warrantyPolicy: siteContent.warrantyPolicy
            }
        });
    } catch (error) {
        console.error('Error updating policies:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating policies.' });
    }
};

// @desc    Update about us page content
// @route   PUT /api/site-content/about-us
// @access  Private/Admin
exports.updateAboutUs = async (req, res) => {
    try {
        const siteContent = await SiteContent.getSingleton();

        const {
            heroEyebrow,
            heroTitle,
            heroDescription,
            heroImageUrl,
            heroImageAlt,
            stats,
            storyTitle,
            storyParagraph1,
            storyParagraph2,
            storyImageUrl,
            storyImageAlt,
            categoriesTitle,
            categoriesDescription,
            categories,
            missionEyebrow,
            missionTitle,
            missionDescription,
            valuesTitle,
            values,
            ctaTitle,
            ctaDescription,
            ctaButtonText,
            ctaButtonLink
        } = req.body;

        // Handle hero image file upload if present
        if (req.file) {
            try {
                if (req.file.buffer) {
                    const url = await uploadFileToCloudinary(req.file, 'site-about', [
                        { width: 1000, height: 750, crop: 'limit' }
                    ]);
                    siteContent.aboutUs.heroImageUrl = url;
                } else if (req.file.path) {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'site-about',
                        transformation: [{ width: 1000, height: 750, crop: 'limit' }]
                    });
                    siteContent.aboutUs.heroImageUrl = result.secure_url;
                    cleanupTempFile(req.file.path);
                }
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                if (req.file.path) cleanupTempFile(req.file.path);
                return res.status(500).json({ success: false, message: 'Failed to upload about image.' });
            }
        }

        // Update text fields
        if (heroEyebrow !== undefined) siteContent.aboutUs.heroEyebrow = cleanText(heroEyebrow);
        if (heroTitle !== undefined) siteContent.aboutUs.heroTitle = cleanText(heroTitle);
        if (heroDescription !== undefined) siteContent.aboutUs.heroDescription = cleanText(heroDescription);
        if (heroImageUrl !== undefined) siteContent.aboutUs.heroImageUrl = cleanText(heroImageUrl);
        if (heroImageAlt !== undefined) siteContent.aboutUs.heroImageAlt = cleanText(heroImageAlt);
        if (storyTitle !== undefined) siteContent.aboutUs.storyTitle = cleanText(storyTitle);
        if (storyParagraph1 !== undefined) siteContent.aboutUs.storyParagraph1 = cleanText(storyParagraph1);
        if (storyParagraph2 !== undefined) siteContent.aboutUs.storyParagraph2 = cleanText(storyParagraph2);
        if (storyImageUrl !== undefined) siteContent.aboutUs.storyImageUrl = cleanText(storyImageUrl);
        if (storyImageAlt !== undefined) siteContent.aboutUs.storyImageAlt = cleanText(storyImageAlt);
        if (categoriesTitle !== undefined) siteContent.aboutUs.categoriesTitle = cleanText(categoriesTitle);
        if (categoriesDescription !== undefined) siteContent.aboutUs.categoriesDescription = cleanText(categoriesDescription);
        if (missionEyebrow !== undefined) siteContent.aboutUs.missionEyebrow = cleanText(missionEyebrow);
        if (missionTitle !== undefined) siteContent.aboutUs.missionTitle = cleanText(missionTitle);
        if (missionDescription !== undefined) siteContent.aboutUs.missionDescription = cleanText(missionDescription);
        if (valuesTitle !== undefined) siteContent.aboutUs.valuesTitle = cleanText(valuesTitle);
        if (ctaTitle !== undefined) siteContent.aboutUs.ctaTitle = cleanText(ctaTitle);
        if (ctaDescription !== undefined) siteContent.aboutUs.ctaDescription = cleanText(ctaDescription);
        if (ctaButtonText !== undefined) siteContent.aboutUs.ctaButtonText = cleanText(ctaButtonText);
        if (ctaButtonLink !== undefined) siteContent.aboutUs.ctaButtonLink = cleanText(ctaButtonLink);

        // Update stats array
        if (Array.isArray(stats)) {
            const normalizedStats = stats
                .map((item) => ({
                    icon: cleanText(item?.icon || ''),
                    label: cleanText(item?.label || ''),
                    value: cleanText(item?.value || '')
                }))
                .filter((item) => item.label);
            if (normalizedStats.length > 0) {
                siteContent.aboutUs.stats = normalizedStats;
            }
        }

        // Update about categories array
        if (Array.isArray(categories)) {
            const normalizedCategories = categories
                .map((item) => ({
                    icon: cleanText(item?.icon || ''),
                    name: cleanText(item?.name || ''),
                    desc: cleanText(item?.desc || '')
                }))
                .filter((item) => item.name);
            if (normalizedCategories.length > 0) {
                siteContent.aboutUs.categories = normalizedCategories;
            }
        }

        // Update values array
        if (Array.isArray(values)) {
            const normalizedValues = values
                .map((item) => ({
                    icon: cleanText(item?.icon || ''),
                    title: cleanText(item?.title || ''),
                    desc: cleanText(item?.desc || '')
                }))
                .filter((item) => item.title);
            if (normalizedValues.length > 0) {
                siteContent.aboutUs.values = normalizedValues;
            }
        }

        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'About Us page updated successfully.',
            data: siteContent.aboutUs
        });
    } catch (error) {
        console.error('Error updating about us:', error);
        if (req.file) cleanupTempFile(req.file.path);
        return res.status(500).json({ success: false, message: 'Server error while updating about us page.' });
    }
};

// @desc    Update site colors
// @route   PUT /api/site-content/colors
// @access  Private/Admin
exports.updateColors = async (req, res) => {
    try {
        const siteContent = await SiteContent.getSingleton();
        const allowedFields = [
            'primary', 'primaryHover', 'secondary', 'secondaryHover', 'accent',
            'textPrimary', 'textSecondary', 'textLight',
            'background', 'backgroundSecondary', 'backgroundTertiary', 'border',
            'success', 'error',
            'headerBg', 'headerText', 'footerBg', 'footerText',
            'buttonText', 'cardBg', 'announcementBg', 'announcementText'
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                siteContent.colors[field] = cleanText(req.body[field]);
            }
        });

        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Colors updated successfully.',
            data: siteContent.colors
        });
    } catch (error) {
        console.error('Error updating colors:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating colors.' });
    }
};

// @desc    Update delivery settings (e.g. fast delivery charge)
// @route   PUT /api/site-content/delivery
// @access  Private/Admin
exports.updateDelivery = async (req, res) => {
    try {
        const { fastDeliveryCharge } = req.body;

        const siteContent = await SiteContent.getSingleton();

        if (fastDeliveryCharge !== undefined) {
            const parsed = Number(fastDeliveryCharge);
            siteContent.delivery.fastDeliveryCharge = isNaN(parsed) || parsed < 0 ? 0 : parsed;
        }

        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Delivery settings updated successfully.',
            data: {
                fastDeliveryCharge: siteContent.delivery.fastDeliveryCharge
            }
        });
    } catch (error) {
        console.error('Error updating delivery settings:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating delivery settings.' });
    }
};

// @desc    Update quote section
// @route   PUT /api/site-content/quote-section
// @access  Private/Admin
exports.updateQuoteSection = async (req, res) => {
    try {
        const { label, firstSentence, rotatingWords, description } = req.body;
        const siteContent = await SiteContent.getSingleton();

        if (label !== undefined) siteContent.quoteSection.label = cleanText(label);
        if (firstSentence !== undefined) siteContent.quoteSection.firstSentence = cleanText(firstSentence);
        if (description !== undefined) siteContent.quoteSection.description = cleanText(description);
        if (Array.isArray(rotatingWords)) {
            const cleanedWords = rotatingWords
                .map(w => cleanText(w))
                .filter(w => w.length > 0);
            if (cleanedWords.length > 0) {
                siteContent.quoteSection.rotatingWords = cleanedWords;
            }
        }

        await siteContent.save();

        return res.status(200).json({
            success: true,
            message: 'Quote section updated successfully.',
            data: siteContent.quoteSection
        });
    } catch (error) {
        console.error('Error updating quote section:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating quote section.' });
    }
};
