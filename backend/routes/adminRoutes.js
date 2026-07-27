const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { getAllReviews, deleteReview } = require('../controllers/adminReviewController');

// Base admin check route
router.post('/', protect, admin(), (req, res) => {
    res.json({ message: "Admin route is working!" });
});

// Review Management routes
router.get('/reviews', protect, admin(), getAllReviews);
router.delete('/reviews/:reviewId', protect, admin(), deleteReview);

module.exports = router;