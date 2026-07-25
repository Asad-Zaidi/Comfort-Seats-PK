const express = require('express');
const router = express.Router();

const { getContact, updateContact } = require('../controllers/contactController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public
router.get('/', getContact);

// Admin-only
router.put('/', protect, admin(), updateContact);

module.exports = router;
