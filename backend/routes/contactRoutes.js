const express = require('express');
const router = express.Router();

const {
    getContact,
    updateContact,
    submitContactMessage,
    getContactMessages,
    updateContactMessageStatus,
    deleteContactMessage
} = require('../controllers/contactController');

const { protect, admin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getContact);
router.post('/messages', submitContactMessage);

// Admin-only routes
router.put('/', protect, admin(), updateContact);
router.get('/messages', protect, admin(), getContactMessages);
router.put('/messages/:id', protect, admin(), updateContactMessageStatus);
router.delete('/messages/:id', protect, admin(), deleteContactMessage);

module.exports = router;
