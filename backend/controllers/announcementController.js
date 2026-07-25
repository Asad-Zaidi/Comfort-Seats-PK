const Announcement = require('../models/Announcement');

// @desc    Get announcement settings
// @route   GET /api/announcement
// @access  Public
exports.getAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.getSingleton();
        return res.status(200).json({ success: true, data: announcement });
    } catch (error) {
        console.error('Error fetching announcement:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching announcement.' });
    }
};

// @desc    Update announcement settings
// @route   PUT /api/announcement
// @access  Private/Admin
exports.updateAnnouncement = async (req, res) => {
    try {
        const {
            enabled,
            text,
            backgroundColor,
            textColor,
            link,
            linkText,
            fontSize,
            showCloseButton,
            speed,
            paddingY,
        } = req.body;

        const announcement = await Announcement.getSingleton();

        if (enabled !== undefined) announcement.enabled = enabled;
        if (text !== undefined) announcement.text = text.trim();
        if (backgroundColor !== undefined) announcement.backgroundColor = backgroundColor.trim();
        if (textColor !== undefined) announcement.textColor = textColor.trim();
        if (link !== undefined) announcement.link = link.trim();
        if (linkText !== undefined) announcement.linkText = linkText.trim();
        if (fontSize !== undefined) announcement.fontSize = fontSize.trim();
        if (showCloseButton !== undefined) announcement.showCloseButton = showCloseButton;
        if (speed !== undefined) announcement.speed = Math.max(3, Math.min(30, Number(speed)));
        if (paddingY !== undefined) announcement.paddingY = Math.max(4, Math.min(40, Number(paddingY)));

        await announcement.save();

        return res.status(200).json({
            success: true,
            message: 'Announcement updated successfully.',
            data: announcement,
        });
    } catch (error) {
        console.error('Error updating announcement:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating announcement.' });
    }
};

// @desc    Toggle announcement on/off
// @route   PATCH /api/announcement
// @access  Private/Admin
exports.toggleAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.getSingleton();
        // Honor the explicit state sent from the client to stay in sync
        announcement.enabled = req.body && typeof req.body.enabled === 'boolean'
            ? req.body.enabled
            : !announcement.enabled;
        await announcement.save();

        return res.status(200).json({
            success: true,
            message: `Announcement ${announcement.enabled ? 'enabled' : 'disabled'} successfully.`,
            data: announcement,
        });
    } catch (error) {
        console.error('Error toggling announcement:', error);
        return res.status(500).json({ success: false, message: 'Server error while toggling announcement.' });
    }
};