const express = require('express');
const router = express.Router();
const { uploadProductImages, uploadAny, uploadReviewImage } = require('../middlewares/uploadMiddleware');

const {
    createProduct,
    getAllProducts,
    getFeaturedReviews,
    getProductBySlug,
    getProductById,
    addProductReview,
    updateProduct,
    deleteProduct,
    searchProducts
} = require('../controllers/productController');

const { protect, admin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/reviews/featured', getFeaturedReviews);
router.get('/slug/:categorySlug/:nameSlug', getProductBySlug);
router.get('/slug/:categorySlug/:subcategorySlug/:nameSlug', getProductBySlug);
router.get('/:id', getProductById);
router.post('/:id/reviews', uploadReviewImage, addProductReview);

// Admin-protected CRUD routes
// Use uploadProductImages to handle productImages + any dynamic colorImages_* fields
// The custom fields middleware lets us handle fields like colorImages_0, colorImages_1 etc.
router.post('/', protect, admin(), uploadAny, createProduct);
router.put('/:id', protect, admin(), uploadAny, updateProduct);
router.delete('/:id', protect, admin(), deleteProduct);

module.exports = router;