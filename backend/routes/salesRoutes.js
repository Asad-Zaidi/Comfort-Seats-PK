const express = require('express');
const router = express.Router();

const {
    getActiveSalesPopup,
    getSalesCampaigns,
    getSalesCampaignById,
    createSalesCampaign,
    updateSalesCampaign,
    activateSalesCampaign,
    deactivateSalesCampaign,
    toggleSalesPopup,
    duplicateSalesCampaign,
    deleteSalesCampaign,
} = require('../controllers/salesController');

const { protect, admin } = require('../middlewares/authMiddleware');
const { uploadSalesImage } = require('../middlewares/uploadMiddleware');

// Public route for storefront to fetch active popup
router.get('/active', getActiveSalesPopup);

// Admin routes
router.get('/', protect, admin(), getSalesCampaigns);
router.get('/:id', protect, admin(), getSalesCampaignById);
router.post('/', protect, admin(), uploadSalesImage, createSalesCampaign);
router.put('/:id', protect, admin(), uploadSalesImage, updateSalesCampaign);
router.patch('/:id/activate', protect, admin(), activateSalesCampaign);
router.patch('/:id/deactivate', protect, admin(), deactivateSalesCampaign);
router.patch('/:id/toggle-popup', protect, admin(), toggleSalesPopup);
router.post('/:id/duplicate', protect, admin(), duplicateSalesCampaign);
router.delete('/:id', protect, admin(), deleteSalesCampaign);

module.exports = router;
