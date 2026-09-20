const express = require('express');
const router = express.Router();

const {
    getBulkDiscountTiers,
    updateBulkDiscountTiers,
    calculateBulkQuote,
    createBulkOrder,
    getAllBulkOrders,
    getBulkOrderById,
    updateBulkOrderStatus,
    deleteBulkOrder,
} = require('../controllers/bulkOrderController');

const { protect, admin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/discounts', getBulkDiscountTiers);
router.post('/calculate', calculateBulkQuote);
router.post('/', createBulkOrder);

// Admin protected routes
router.put('/discounts', protect, admin(), updateBulkDiscountTiers);
router.get('/', protect, admin(), getAllBulkOrders);
router.get('/:id', protect, admin(), getBulkOrderById);
router.put('/:id/status', protect, admin(), updateBulkOrderStatus);
router.delete('/:id', protect, admin(), deleteBulkOrder);

module.exports = router;
