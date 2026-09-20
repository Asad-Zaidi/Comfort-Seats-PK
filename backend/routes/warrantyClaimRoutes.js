const express = require('express');
const router = express.Router();

const {
    createWarrantyClaim,
    lookupOrder,
    getWarrantyClaimById,
    getWarrantyClaims,
    updateWarrantyClaimStatus,
    getWarrantyConfig,
    updateWarrantyConfig,
    deleteWarrantyClaim,
} = require('../controllers/warrantyClaimController');

const { protect, admin } = require('../middlewares/authMiddleware');
const { uploadWarrantyMedia } = require('../middlewares/uploadMiddleware');

// Public route: Look up order details for pre-filling
router.get('/order-lookup', lookupOrder);

// Public route: Get warranty coverage policy config (What is Covered / Not Covered)
router.get('/config', getWarrantyConfig);

// Public route: Submit a new warranty claim with images & video
router.post('/', uploadWarrantyMedia, createWarrantyClaim);

// Public route: Check status of a warranty claim by Claim ID or Mongo ID
router.get('/:id', getWarrantyClaimById);

// Admin routes: Coverage policy config, list all claims, update status, delete claim
router.put('/config', protect, admin(), updateWarrantyConfig);
router.get('/', protect, admin(), getWarrantyClaims);
router.put('/:id/status', protect, admin(), updateWarrantyClaimStatus);
router.delete('/:id', protect, admin(), deleteWarrantyClaim);

module.exports = router;
