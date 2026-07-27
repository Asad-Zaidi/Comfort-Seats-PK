const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');

// Helper function to extract Cloudinary public_id from a secure URL
const extractPublicIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (!url.includes('cloudinary.com')) return null;
    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        let pathAfterUpload = parts[1];
        // Remove version number if present (e.g. v1678901234/)
        pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
        // Remove file extension
        const lastDotIndex = pathAfterUpload.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
        }
        return pathAfterUpload;
    } catch (err) {
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Error deleting review image from Cloudinary:', err);
    }
};

// @desc    Get all reviews across all products with product details
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Product.aggregate([
            { $unwind: '$reviews' },
            {
                $project: {
                    _id: '$reviews._id',
                    reviewId: '$reviews._id',
                    productId: '$_id',
                    productName: '$name',
                    productSlug: '$slug',
                    productImage: {
                        $ifNull: [
                            '$coverImage',
                            {
                                $ifNull: [
                                    { $arrayElemAt: ['$productImages.url', 0] },
                                    { $ifNull: ['$imageUrl', ''] }
                                ]
                            }
                        ]
                    },
                    customerName: { $ifNull: ['$reviews.name', 'Anonymous'] },
                    customerEmail: { $ifNull: ['$reviews.email', ''] },
                    rating: '$reviews.rating',
                    comment: '$reviews.comment',
                    reviewImage: { $ifNull: ['$reviews.image', ''] },
                    createdAt: '$reviews.createdAt'
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching product reviews.'
        });
    }
};

// @desc    Delete a review by ID and update product rating/review count
// @route   DELETE /api/admin/reviews/:reviewId
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID format.'
            });
        }

        // Find the product containing the review
        const product = await Product.findOne({ 'reviews._id': reviewId });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }

        // Extract the target review subdocument
        const targetReview = product.reviews.id(reviewId);

        if (!targetReview) {
            return res.status(404).json({
                success: false,
                message: 'Review record not found on product.'
            });
        }

        // Check and delete review image from Cloudinary if uploaded
        if (targetReview.image) {
            const publicId = extractPublicIdFromUrl(targetReview.image);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        }

        // Remove the review subdocument from the product array
        product.reviews.pull(reviewId);

        // Saving product automatically triggers pre('save') hook in Product model
        // which recalculates avgRating and totalReviews
        await product.save();

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully.',
            data: {
                productId: product._id,
                reviewId: reviewId,
                totalReviews: product.totalReviews,
                avgRating: product.avgRating
            }
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting review.'
        });
    }
};
