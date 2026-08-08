const express = require('express');
const router = express.Router();

const {
    getBlogs,
    getBlogCategories,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
} = require('../controllers/blogController');

const { protect, admin } = require('../middlewares/authMiddleware');
const { uploadBlogImages } = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', getBlogs);
router.get('/categories', getBlogCategories);
router.get('/:slug', getBlogBySlug);

// Admin protected routes
router.post('/', protect, admin(), uploadBlogImages, createBlog);
router.put('/:id', protect, admin(), uploadBlogImages, updateBlog);
router.delete('/:id', protect, admin(), deleteBlog);

module.exports = router;
