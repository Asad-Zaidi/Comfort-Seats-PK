const Contact = require('../models/Contact');

// @desc    Get site contact info (social accounts, whatsapp, etc.)
// @route   GET /api/contact
// @access  Public
exports.getContact = async (req, res) => {
    try {
        const contact = await Contact.getSingleton();
        return res.status(200).json({ success: true, data: contact });
    } catch (error) {
        console.error('Error fetching contact info:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching contact info.' });
    }
};

// @desc    Update site contact info
// @route   PUT /api/contact
// @access  Private/Admin
exports.updateContact = async (req, res) => {
    try {
        const { instagram, facebook, tiktok, whatsapp, email, phone, address } = req.body;

        const contact = await Contact.getSingleton();

        const updatableFields = { instagram, facebook, tiktok, whatsapp, email, phone, address };

        Object.keys(updatableFields).forEach((field) => {
            if (updatableFields[field] !== undefined) {
                contact[field] = updatableFields[field];
            }
        });

        await contact.save();

        return res.status(200).json({ success: true, message: 'Contact info updated successfully.', data: contact });
    } catch (error) {
        console.error('Error updating contact info:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating contact info.' });
    }
};