const express = require('express');
const router = express.Router();

const { createCustomization, getCustomizations, updateCustomizationStatus, deleteCustomization } = require('../controllers/customizationController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public - submit a customization request
router.post('/', createCustomization);

// Admin only
router.get('/', protect, admin(), getCustomizations);
router.put('/:id', protect, admin(), updateCustomizationStatus);
router.delete('/:id', protect, admin(), deleteCustomization);

module.exports = router;