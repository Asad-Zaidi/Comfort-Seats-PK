const Contact = require('../models/Contact');
const ContactMessage = require('../models/ContactMessage');
const { sendContactMessageEmail } = require('../services/emailService');

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

// @desc    Submit a new contact message
// @route   POST /api/contact/messages
// @access  Public
exports.submitContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields (name, email, subject, message) are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        }

        const newMessage = new ContactMessage({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim()
        });

        await newMessage.save();

        // Dispatch admin notification email asynchronously (non-blocking)
        sendContactMessageEmail(newMessage).catch((err) => {
            console.error('[contactController] Failed to send admin email notification:', err.message);
        });

        return res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            data: newMessage
        });
    } catch (error) {
        console.error('Error submitting contact message:', error);
        return res.status(500).json({ success: false, message: 'Server error while submitting message.' });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact/messages
// @access  Private/Admin
exports.getContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        const unreadCount = messages.filter(m => m.status === 'unread').length;

        return res.status(200).json({
            success: true,
            data: messages,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching contact messages.' });
    }
};

// @desc    Update contact message status
// @route   PUT /api/contact/messages/:id
// @access  Private/Admin
exports.updateContactMessageStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['unread', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Must be unread, read, or replied.' });
        }

        const messageItem = await ContactMessage.findById(req.params.id);
        if (!messageItem) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }

        messageItem.status = status;
        await messageItem.save();

        return res.status(200).json({ success: true, message: 'Message status updated successfully.', data: messageItem });
    } catch (error) {
        console.error('Error updating message status:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating message status.' });
    }
};

// @desc    Delete a contact message
// @route   DELETE /api/contact/messages/:id
// @access  Private/Admin
exports.deleteContactMessage = async (req, res) => {
    try {
        const messageItem = await ContactMessage.findById(req.params.id);
        if (!messageItem) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }

        await messageItem.deleteOne();

        return res.status(200).json({ success: true, message: 'Message deleted successfully.' });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting contact message.' });
    }
};