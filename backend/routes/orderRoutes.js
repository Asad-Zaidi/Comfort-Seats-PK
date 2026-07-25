const express = require('express');
const router = express.Router();

const {
    createOrder,
    getOrders,
    updateOrderStatus,
    deleteOrder,
    uploadOrderReceipt,
} = require('../controllers/orderController');

const { protect, admin } = require('../middlewares/authMiddleware');
const { uploadReceipt } = require('../middlewares/uploadMiddleware');

// Public route - create order
router.post('/', createOrder);

// Customer uploads payment receipt (public, matched by order id)
router.put('/:id/receipt', uploadReceipt, uploadOrderReceipt);

// Admin routes
router.get('/', protect, admin(), getOrders);
router.put('/:id', protect, admin(), updateOrderStatus);
router.delete('/:id', protect, admin(), deleteOrder);

module.exports = router;