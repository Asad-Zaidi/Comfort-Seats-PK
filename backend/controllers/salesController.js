const SalesCampaign = require('../models/SalesCampaign');
const cloudinary = require('../utils/cloudinary');

// Helper to upload file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'comfortseats/sales') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );
        stream.end(fileBuffer);
    });
};

// @desc    Get currently active promotional sales campaign for customer storefront
// @route   GET /api/sales/active
// @access  Public
exports.getActiveSalesPopup = async (req, res) => {
    try {
        const campaign = await SalesCampaign.findActiveForStorefront();

        if (!campaign) {
            return res.json({ success: true, data: null });
        }

        // Return clean sanitized campaign object
        const campaignObj = campaign.toObject();
        campaignObj.effectiveStatus = campaign.getEffectiveStatus();

        return res.json({
            success: true,
            data: campaignObj,
        });
    } catch (error) {
        console.error('[salesController] getActiveSalesPopup error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch active sales campaign.',
            error: error.message,
        });
    }
};

// @desc    Get all sales campaigns (with computed effective status)
// @route   GET /api/sales
// @access  Admin
exports.getSalesCampaigns = async (req, res) => {
    try {
        const campaigns = await SalesCampaign.find()
            .populate('saleProducts')
            .sort({ createdAt: -1 });

        const mapped = campaigns.map((c) => {
            const obj = c.toObject();
            obj.effectiveStatus = c.getEffectiveStatus();
            return obj;
        });

        return res.json({
            success: true,
            count: mapped.length,
            data: mapped,
        });
    } catch (error) {
        console.error('[salesController] getSalesCampaigns error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch sales campaigns.',
            error: error.message,
        });
    }
};

// @desc    Get single sales campaign by ID
// @route   GET /api/sales/:id
// @access  Admin
exports.getSalesCampaignById = async (req, res) => {
    try {
        const campaign = await SalesCampaign.findById(req.params.id).populate('saleProducts');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Sales campaign not found.',
            });
        }

        const obj = campaign.toObject();
        obj.effectiveStatus = campaign.getEffectiveStatus();

        return res.json({
            success: true,
            data: obj,
        });
    } catch (error) {
        console.error('[salesController] getSalesCampaignById error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch sales campaign.',
            error: error.message,
        });
    }
};

// @desc    Create new sales campaign
// @route   POST /api/sales
// @access  Admin
exports.createSalesCampaign = async (req, res) => {
    try {
        const data = { ...req.body };

        // Parse boolean and numeric values if sent as multipart form-data
        if (typeof data.isPopupEnabled === 'string') {
            data.isPopupEnabled = data.isPopupEnabled === 'true';
        }
        if (typeof data.countdownEnabled === 'string') {
            data.countdownEnabled = data.countdownEnabled === 'true';
        }
        if (typeof data.showCloseButton === 'string') {
            data.showCloseButton = data.showCloseButton === 'true';
        }
        if (typeof data.closeOnOverlayClick === 'string') {
            data.closeOnOverlayClick = data.closeOnOverlayClick === 'true';
        }
        if (typeof data.closeOnEsc === 'string') {
            data.closeOnEsc = data.closeOnEsc === 'true';
        }
        if (typeof data.showOnMobile === 'string') {
            data.showOnMobile = data.showOnMobile === 'true';
        }
        if (typeof data.showOnDesktop === 'string') {
            data.showOnDesktop = data.showOnDesktop === 'true';
        }
        if (typeof data.showAnnouncementBar === 'string') {
            data.showAnnouncementBar = data.showAnnouncementBar === 'true';
        }
        if (typeof data.announcementCountdown === 'string') {
            data.announcementCountdown = data.announcementCountdown === 'true';
        }
        if (data.displayDelay !== undefined) {
            data.displayDelay = Number(data.displayDelay) || 0;
        }
        if (data.overlay !== undefined) {
            data.overlay = Number(data.overlay) || 40;
        }
        if (typeof data.isSalePageEnabled === 'string') {
            data.isSalePageEnabled = data.isSalePageEnabled === 'true';
        }
        if (typeof data.saleProducts === 'string') {
            try {
                data.saleProducts = JSON.parse(data.saleProducts);
            } catch (e) {
                data.saleProducts = data.saleProducts ? data.saleProducts.split(',').map(s => s.trim()).filter(Boolean) : [];
            }
        }
        if (!Array.isArray(data.saleProducts)) {
            data.saleProducts = [];
        }

        if (!data.heading && data.campaignName) {
            data.heading = data.campaignName;
        }
        if (!data.productId || data.productId === 'null' || data.productId === '') {
            data.productId = null;
        }

        // Handle Date conversion
        if (data.startDate) {
            data.startDate = new Date(data.startDate);
        } else {
            data.startDate = null;
        }
        if (data.endDate) {
            data.endDate = new Date(data.endDate);
        } else {
            data.endDate = null;
        }

        // Handle Image upload if file provided
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            data.image = uploadResult;
        } else if (typeof data.image === 'string' && data.image) {
            data.image = { url: data.image, publicId: '' };
        } else if (typeof data.image === 'object' && data.image?.url) {
            // Already structured
        } else {
            data.image = { url: '', publicId: '' };
        }

        // Mutual exclusivity: if activating, deactivate other active campaigns
        if (data.status === 'ACTIVE') {
            await SalesCampaign.updateMany(
                { status: 'ACTIVE' },
                { $set: { status: 'DRAFT' } }
            );
        }

        const campaign = await SalesCampaign.create(data);
        const obj = campaign.toObject();
        obj.effectiveStatus = campaign.getEffectiveStatus();

        return res.status(201).json({
            success: true,
            message: 'Sales campaign created successfully.',
            data: obj,
        });
    } catch (error) {
        console.error('[salesController] createSalesCampaign error:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to create sales campaign.',
        });
    }
};

// @desc    Update existing sales campaign
// @route   PUT /api/sales/:id
// @access  Admin
exports.updateSalesCampaign = async (req, res) => {
    try {
        const campaign = await SalesCampaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Sales campaign not found.',
            });
        }

        const data = { ...req.body };

        // Parse boolean and numeric values if sent as multipart form-data
        if (typeof data.isPopupEnabled === 'string') {
            data.isPopupEnabled = data.isPopupEnabled === 'true';
        }
        if (typeof data.countdownEnabled === 'string') {
            data.countdownEnabled = data.countdownEnabled === 'true';
        }
        if (typeof data.showCloseButton === 'string') {
            data.showCloseButton = data.showCloseButton === 'true';
        }
        if (typeof data.closeOnOverlayClick === 'string') {
            data.closeOnOverlayClick = data.closeOnOverlayClick === 'true';
        }
        if (typeof data.closeOnEsc === 'string') {
            data.closeOnEsc = data.closeOnEsc === 'true';
        }
        if (typeof data.showOnMobile === 'string') {
            data.showOnMobile = data.showOnMobile === 'true';
        }
        if (typeof data.showOnDesktop === 'string') {
            data.showOnDesktop = data.showOnDesktop === 'true';
        }
        if (typeof data.showAnnouncementBar === 'string') {
            data.showAnnouncementBar = data.showAnnouncementBar === 'true';
        }
        if (typeof data.announcementCountdown === 'string') {
            data.announcementCountdown = data.announcementCountdown === 'true';
        }
        if (data.displayDelay !== undefined) {
            data.displayDelay = Number(data.displayDelay) || 0;
        }
        if (data.overlay !== undefined) {
            data.overlay = Number(data.overlay) || 40;
        }
        if (typeof data.isSalePageEnabled === 'string') {
            data.isSalePageEnabled = data.isSalePageEnabled === 'true';
        }
        if (typeof data.saleProducts === 'string') {
            try {
                data.saleProducts = JSON.parse(data.saleProducts);
            } catch (e) {
                data.saleProducts = data.saleProducts ? data.saleProducts.split(',').map(s => s.trim()).filter(Boolean) : [];
            }
        }
        if (data.saleProducts !== undefined && !Array.isArray(data.saleProducts)) {
            data.saleProducts = [];
        }

        if (!data.heading && data.campaignName) {
            data.heading = data.campaignName;
        }
        if (data.productId === 'null' || data.productId === '') {
            data.productId = null;
        }

        // Handle Date conversion
        if (data.startDate !== undefined) {
            data.startDate = data.startDate ? new Date(data.startDate) : null;
        }
        if (data.endDate !== undefined) {
            data.endDate = data.endDate ? new Date(data.endDate) : null;
        }

        // Handle Image upload if new file provided
        if (req.file) {
            // Optional: delete old image from Cloudinary if it had a publicId
            if (campaign.image?.publicId) {
                try {
                    await cloudinary.uploader.destroy(campaign.image.publicId);
                } catch (delErr) {
                    console.warn('[salesController] Failed to delete previous image:', delErr.message);
                }
            }
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            data.image = uploadResult;
        } else if (data.removeImage === 'true' || data.removeImage === true) {
            if (campaign.image?.publicId) {
                try {
                    await cloudinary.uploader.destroy(campaign.image.publicId);
                } catch (delErr) {
                    console.warn('[salesController] Failed to delete image:', delErr.message);
                }
            }
            data.image = { url: '', publicId: '' };
        } else if (typeof data.image === 'string' && data.image) {
            data.image = { url: data.image, publicId: campaign.image?.publicId || '' };
        }

        // Mutual exclusivity: if activating this campaign, deactivate all others
        if (data.status === 'ACTIVE') {
            await SalesCampaign.updateMany(
                { _id: { $ne: campaign._id }, status: 'ACTIVE' },
                { $set: { status: 'DRAFT' } }
            );
        }

        const updatedCampaign = await SalesCampaign.findByIdAndUpdate(
            req.params.id,
            { $set: data },
            { new: true, runValidators: true }
        );

        const obj = updatedCampaign.toObject();
        obj.effectiveStatus = updatedCampaign.getEffectiveStatus();

        return res.json({
            success: true,
            message: 'Sales campaign updated successfully.',
            data: obj,
        });
    } catch (error) {
        console.error('[salesController] updateSalesCampaign error:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to update sales campaign.',
        });
    }
};

// @desc    Activate a campaign and deactivate others
// @route   PATCH /api/sales/:id/activate
// @access  Admin
exports.activateSalesCampaign = async (req, res) => {
    try {
        const campaign = await SalesCampaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Sales campaign not found.',
            });
        }

        // Deactivate all other active campaigns
        await SalesCampaign.updateMany(
            { _id: { $ne: campaign._id }, status: 'ACTIVE' },
            { $set: { status: 'DRAFT' } }
        );

        campaign.status = 'ACTIVE';
        campaign.isPopupEnabled = true;
        await campaign.save();

        const obj = campaign.toObject();
        obj.effectiveStatus = campaign.getEffectiveStatus();

        return res.json({
            success: true,
            message: `"${campaign.campaignName}" is now active!`,
            data: obj,
        });
    } catch (error) {
        console.error('[salesController] activateSalesCampaign error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to activate sales campaign.',
            error: error.message,
        });
    }
};

// @desc    Deactivate a campaign
// @route   PATCH /api/sales/:id/deactivate
// @access  Admin
exports.deactivateSalesCampaign = async (req, res) => {
    try {
        const campaign = await SalesCampaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Sales campaign not found.',
            });
        }

        campaign.status = 'DRAFT';
        await campaign.save();

        const obj = campaign.toObject();
        obj.effectiveStatus = campaign.getEffectiveStatus();

        return res.json({
            success: true,
            message: `"${campaign.campaignName}" has been deactivated.`,
            data: obj,
        });
    } catch (error) {
        console.error('[salesController] deactivateSalesCampaign error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to deactivate sales campaign.',
            error: error.message,
        });
    }
};

// @desc    Toggle popup ON / OFF for a campaign
// @route   PATCH /api/sales/:id/toggle-popup
// @access  Admin
exports.toggleSalesPopup = async (req, res) => {
    try {
        const campaign = await SalesCampaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Sales campaign not found.',
            });
        }

        const isEnabled = req.body.isPopupEnabled !== undefined
            ? Boolean(req.body.isPopupEnabled)
            : !campaign.isPopupEnabled;

        campaign.isPopupEnabled = isEnabled;
        campaign.isSalePageEnabled = isEnabled;
        await campaign.save();

        const obj = campaign.toObject();
        obj.effectiveStatus = campaign.getEffectiveStatus();

        return res.json({
            success: true,
            message: `Sales popup ${isEnabled ? 'enabled' : 'disabled'}.`,
            data: obj,
        });
    } catch (error) {
        console.error('[salesController] toggleSalesPopup error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to toggle popup.',
            error: error.message,
        });
    }
};

// @desc    Duplicate an existing sales campaign
// @route   POST /api/sales/:id/duplicate
// @access  Admin
exports.duplicateSalesCampaign = async (req, res) => {
    try {
        const original = await SalesCampaign.findById(req.params.id);

        if (!original) {
            return res.status(404).json({
                success: false,
                message: 'Original sales campaign not found.',
            });
        }

        const cloneData = original.toObject();
        delete cloneData._id;
        delete cloneData.createdAt;
        delete cloneData.updatedAt;

        cloneData.campaignName = `${original.campaignName} (Copy)`;
        cloneData.status = 'DRAFT';
        cloneData.isPopupEnabled = false;

        const clonedCampaign = await SalesCampaign.create(cloneData);
        const obj = clonedCampaign.toObject();
        obj.effectiveStatus = clonedCampaign.getEffectiveStatus();

        return res.status(201).json({
            success: true,
            message: `Campaign duplicated as "${obj.campaignName}".`,
            data: obj,
        });
    } catch (error) {
        console.error('[salesController] duplicateSalesCampaign error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to duplicate sales campaign.',
            error: error.message,
        });
    }
};

// @desc    Delete sales campaign
// @route   DELETE /api/sales/:id
// @access  Admin
exports.deleteSalesCampaign = async (req, res) => {
    try {
        const campaign = await SalesCampaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Sales campaign not found.',
            });
        }

        if (campaign.image?.publicId) {
            try {
                await cloudinary.uploader.destroy(campaign.image.publicId);
            } catch (delErr) {
                console.warn('[salesController] Cloudinary image cleanup error:', delErr.message);
            }
        }

        await SalesCampaign.findByIdAndDelete(req.params.id);

        return res.json({
            success: true,
            message: 'Sales campaign deleted successfully.',
        });
    } catch (error) {
        console.error('[salesController] deleteSalesCampaign error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete sales campaign.',
            error: error.message,
        });
    }
};
