const express = require("express");
const router = express.Router();

const {
    getPaymentSettings,
    updateInstructions,
    updateDefaultPaymentMethod,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    uploadPaymentMethodImages,
    reorderPaymentMethods
} = require("../controllers/paymentmethodController");

const { protect, admin } = require("../middlewares/authMiddleware");
const { uploadPaymentImages } = require("../middlewares/uploadMiddleware");

// Public
router.get("/", getPaymentSettings);

// Admin
router.put("/instructions", protect, admin(), updateInstructions);
router.put("/default-method", protect, admin(), updateDefaultPaymentMethod);

router.post("/methods", protect, admin(), addPaymentMethod);

router.put("/methods/:id", protect, admin(), updatePaymentMethod);

router.delete("/methods/:id", protect, admin(), deletePaymentMethod);

// Upload QR code / custom logo for a payment method
router.put("/methods/:id/images", protect, admin(), uploadPaymentImages, uploadPaymentMethodImages);

// Batch reorder payment methods
router.put("/reorder", protect, admin(), reorderPaymentMethods);

module.exports = router;