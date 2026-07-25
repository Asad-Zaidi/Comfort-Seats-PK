const Customization = require('../models/Customization');
const { sendCustomizationEmail, sendCustomizationCustomerEmail } = require('../services/emailService');

// @desc    Submit a new customization request
// @route   POST /api/customizations
// @access  Public
const createCustomization = async (req, res) => {
    try {
        const { category, standChoice, color, colorName, fabricType, dimensions, notes, customer } = req.body;

        if (!customer || !customer.fullName || !customer.phone) {
            return res.status(400).json({ success: false, message: 'Customer name and phone are required' });
        }

        const customization = await Customization.create({
            category: category || 'Custom Request',
            standChoice: standChoice || '',
            color: color || '',
            colorName: colorName || '',
            fabricType: fabricType || '',
            dimensions: {
                width: dimensions?.width || 0,
                height: dimensions?.height || 0,
                depth: dimensions?.depth || 0,
            },
            notes: notes || '',
            customer: {
                fullName: customer.fullName,
                phone: customer.phone,
                email: customer.email || '',
                address: customer.address || '',
            },
        });

        // Send email notification to admin
        sendCustomizationEmail(customization).catch((err) =>
            console.error('[customizationController] Admin email notification failed:', err)
        );

        // Send confirmation email to customer if they provided an email
        if (customer.email) {
            sendCustomizationCustomerEmail(customization).catch((err) =>
                console.error('[customizationController] Customer email notification failed:', err)
            );
        }

        res.status(201).json({ success: true, data: customization });
    } catch (error) {
        console.error('Create customization error:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting customization request' });
    }
};

// @desc    Get all customization requests (admin)
// @route   GET /api/customizations
// @access  Private/Admin
const getCustomizations = async (req, res) => {
    try {
        const customizations = await Customization.find().sort({ createdAt: -1 });
        res.json({ success: true, data: customizations });
    } catch (error) {
        console.error('Get customizations error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching customizations' });
    }
};

// @desc    Update customization status (admin)
// @route   PUT /api/customizations/:id
// @access  Private/Admin
const updateCustomizationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'contacted', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const customization = await Customization.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!customization) {
            return res.status(404).json({ success: false, message: 'Customization request not found' });
        }

        res.json({ success: true, data: customization });
    } catch (error) {
        console.error('Update customization error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating customization' });
    }
};

// @desc    Delete a customization request (admin)
// @route   DELETE /api/customizations/:id
// @access  Private/Admin
const deleteCustomization = async (req, res) => {
    try {
        const customization = await Customization.findByIdAndDelete(req.params.id);
        if (!customization) {
            return res.status(404).json({ success: false, message: 'Customization request not found' });
        }
        res.json({ success: true, message: 'Customization request deleted' });
    } catch (error) {
        console.error('Delete customization error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting customization' });
    }
};

module.exports = { createCustomization, getCustomizations, updateCustomizationStatus, deleteCustomization };