const Blog = require('../models/Blog');
const cloudinary = require('../utils/cloudinary');

// Helper to upload a single buffer to Cloudinary
const uploadFileToCloudinary = (file, folder, transformation) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                transformation: transformation || [{ width: 1200, crop: 'limit' }]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        uploadStream.end(file.buffer);
    });
};

// Helper to slugify a string for clean URL identifiers
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// @desc    Get all blogs (with optional search, category, featured, and published filtering)
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
    try {
        const { search, category, tag, published, featured, limit, page } = req.query;
        const query = {};

        // Only return published blogs unless explicitly requested by admin
        if (published !== undefined) {
            query.isPublished = published === 'true';
        }

        if (featured !== undefined) {
            query.isFeatured = featured === 'true';
        }

        if (category && category !== 'All') {
            query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
        }

        if (tag) {
            query.tags = { $in: [new RegExp(tag.trim(), 'i')] };
        }

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { summary: searchRegex },
                { category: searchRegex },
                { tags: { $in: [searchRegex] } }
            ];
        }

        const pageSize = parseInt(limit, 10) || 50;
        const currentPage = parseInt(page, 10) || 1;
        const skip = (currentPage - 1) * pageSize;

        const total = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean();

        // Get dynamic list of distinct categories for published posts
        const distinctCategories = await Blog.distinct('category', { isPublished: true });

        return res.status(200).json({
            success: true,
            total,
            page: currentPage,
            pages: Math.ceil(total / pageSize) || 1,
            categories: distinctCategories.filter(Boolean),
            data: blogs,
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching blogs.',
            error: error.message,
        });
    }
};

// @desc    Get dynamic distinct categories
// @route   GET /api/blogs/categories
// @access  Public
exports.getBlogCategories = async (req, res) => {
    try {
        const categories = await Blog.distinct('category', { isPublished: true });
        return res.status(200).json({
            success: true,
            data: categories.filter(Boolean),
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching blog categories.',
        });
    }
};

// @desc    Get single blog by slug or ID
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // Try searching by slug first, then fallback to Mongo ObjectId if valid
        let blog = await Blog.findOne({ slug: slug.toLowerCase() });
        if (!blog && slug.match(/^[0-9a-fA-F]{24}$/)) {
            blog = await Blog.findById(slug);
        }

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found.',
            });
        }

        // Increment views count atomically
        blog.views = (blog.views || 0) + 1;
        await blog.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        console.error('Error fetching blog details:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching blog details.',
            error: error.message,
        });
    }
};

// @desc    Create new blog post
// @route   POST /api/blogs
// @access  Private/Admin
exports.createBlog = async (req, res) => {
    try {
        const {
            title,
            slug: customSlug,
            content,
            summary,
            author,
            category,
            tags,
            isFeatured,
            isPublished,
            seoTitle,
            seoDescription,
            seoKeywords,
            thumbnailUrl,
            bannerUrl
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Blog title is required.' });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Blog content body is required.' });
        }

        // Generate base slug
        let baseSlug = slugify(customSlug || title);
        if (!baseSlug) baseSlug = `blog-${Date.now()}`;

        // Ensure unique slug
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await Blog.exists({ slug: uniqueSlug })) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        let thumbnail = thumbnailUrl ? thumbnailUrl.trim() : '';
        let banner = bannerUrl ? bannerUrl.trim() : '';

        // Handle uploaded image files
        if (req.files) {
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                const thumbFile = req.files.thumbnail[0];
                thumbnail = await uploadFileToCloudinary(thumbFile, 'blog-thumbnails', [
                    { width: 800, height: 533, crop: 'limit' }
                ]);
            }
            if (req.files.banner && req.files.banner[0]) {
                const bannerFile = req.files.banner[0];
                banner = await uploadFileToCloudinary(bannerFile, 'blog-banners', [
                    { width: 1920, height: 800, crop: 'limit' }
                ]);
            }
        }

        // Parse tags if provided as string or array
        let parsedTags = [];
        if (Array.isArray(tags)) {
            parsedTags = tags.map(t => t.trim()).filter(Boolean);
        } else if (typeof tags === 'string') {
            parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        const newBlog = new Blog({
            title: title.trim(),
            slug: uniqueSlug,
            thumbnail,
            banner: banner || thumbnail,
            content: content.trim(),
            summary: summary ? summary.trim() : '',
            author: author ? author.trim() : 'Comfort Seats PK',
            category: category ? category.trim() : 'General',
            tags: parsedTags,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            isPublished: isPublished === undefined ? true : (isPublished === 'true' || isPublished === true),
            seoTitle: seoTitle ? seoTitle.trim() : '',
            seoDescription: seoDescription ? seoDescription.trim() : '',
            seoKeywords: seoKeywords ? seoKeywords.trim() : '',
        });

        await newBlog.save();

        return res.status(201).json({
            success: true,
            message: 'Blog created successfully.',
            data: newBlog,
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while creating blog post.',
            error: error.message,
        });
    }
};

// @desc    Update existing blog post
// @route   PUT /api/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog post not found.' });
        }

        const {
            title,
            slug: customSlug,
            content,
            summary,
            author,
            category,
            tags,
            isFeatured,
            isPublished,
            seoTitle,
            seoDescription,
            seoKeywords,
            thumbnailUrl,
            bannerUrl
        } = req.body;

        if (title !== undefined && title.trim()) {
            blog.title = title.trim();
        }

        if (customSlug !== undefined && customSlug.trim()) {
            let nextSlug = slugify(customSlug);
            if (nextSlug !== blog.slug) {
                // Check uniqueness
                let uniqueSlug = nextSlug;
                let counter = 1;
                while (await Blog.exists({ slug: uniqueSlug, _id: { $ne: blog._id } })) {
                    uniqueSlug = `${nextSlug}-${counter}`;
                    counter++;
                }
                blog.slug = uniqueSlug;
            }
        }

        if (content !== undefined) blog.content = content.trim();
        if (summary !== undefined) blog.summary = summary.trim();
        if (author !== undefined) blog.author = author.trim();
        if (category !== undefined) blog.category = category.trim();

        if (isFeatured !== undefined) {
            blog.isFeatured = isFeatured === 'true' || isFeatured === true;
        }

        if (isPublished !== undefined) {
            blog.isPublished = isPublished === 'true' || isPublished === true;
        }

        if (seoTitle !== undefined) blog.seoTitle = seoTitle.trim();
        if (seoDescription !== undefined) blog.seoDescription = seoDescription.trim();
        if (seoKeywords !== undefined) blog.seoKeywords = seoKeywords.trim();

        if (thumbnailUrl !== undefined && thumbnailUrl.trim()) {
            blog.thumbnail = thumbnailUrl.trim();
        }
        if (bannerUrl !== undefined && bannerUrl.trim()) {
            blog.banner = bannerUrl.trim();
        }

        // Upload new files if supplied
        if (req.files) {
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                const thumbFile = req.files.thumbnail[0];
                blog.thumbnail = await uploadFileToCloudinary(thumbFile, 'blog-thumbnails', [
                    { width: 800, height: 533, crop: 'limit' }
                ]);
            }
            if (req.files.banner && req.files.banner[0]) {
                const bannerFile = req.files.banner[0];
                blog.banner = await uploadFileToCloudinary(bannerFile, 'blog-banners', [
                    { width: 1920, height: 800, crop: 'limit' }
                ]);
            }
        }

        if (tags !== undefined) {
            if (Array.isArray(tags)) {
                blog.tags = tags.map(t => t.trim()).filter(Boolean);
            } else if (typeof tags === 'string') {
                blog.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }

        await blog.save();

        return res.status(200).json({
            success: true,
            message: 'Blog updated successfully.',
            data: blog,
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating blog post.',
            error: error.message,
        });
    }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog post not found.' });
        }

        await Blog.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Blog deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting blog.',
            error: error.message,
        });
    }
};
