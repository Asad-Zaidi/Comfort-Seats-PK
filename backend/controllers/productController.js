const { Readable } = require('stream');
const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
    }
};

const normalizeCategory = (category) => {
    if (Array.isArray(category)) return category;
    if (typeof category === 'string') {
        return category
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Parse colors from request body.
 */
const parseColors = (req) => {
    try {
        const raw = req.body.colors;
        if (!raw) return [];
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!Array.isArray(parsed)) return [];
        return parsed.map(c => ({
            name: String(c.name || '').trim(),
            hex: String(c.hex || '#000000').trim(),
            price: Number(c.price) || 0,
            stock: Number(c.stock) || 0,
            inStock: c.inStock !== undefined ? (c.inStock === true || c.inStock === 'true') : true,
            isDefault: c.isDefault === true || c.isDefault === 'true',
            images: Array.isArray(c.images) ? c.images : []
        })).filter(c => c.name);
    } catch (e) {
        console.error('Error parsing colors:', e);
        return [];
    }
};

/**
 * Ensure exactly one color variant is marked as default.
 */
const normalizeDefaultColor = (colors) => {
    if (!Array.isArray(colors) || colors.length === 0) return colors;
    let foundDefault = false;
    const normalized = colors.map((c) => {
        if (c.isDefault && !foundDefault) {
            foundDefault = true;
            return { ...c, isDefault: true };
        }
        return { ...c, isDefault: false };
    });
    if (!foundDefault && normalized.length > 0) {
        normalized[0].isDefault = true;
    }
    return normalized;
};

/**
 * Validate colors array
 */
const validateColors = (colors) => {
    if (!Array.isArray(colors) || colors.length === 0) {
        return 'At least one color variant is required.';
    }
    const names = colors.map(c => c.name?.toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
        return 'Duplicate colors are not allowed.';
    }
    for (const c of colors) {
        if (!c.name) return 'Each color variant must have a name.';
        if (!c.hex) return 'Each color variant must have a hex code.';
    }
    return null;
};

/**
 * Upload a batch of files to Cloudinary
 */
const uploadImageBatch = async (files, folder) => {
    const results = [];
    for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, folder);
        results.push({ url: result.secure_url, publicId: result.public_id });
    }
    return results;
};

/**
 * Collect files grouped by color index
 */
const collectColorFiles = (reqFiles, totalColors) => {
    const colorFiles = {};
    if (!reqFiles || !Array.isArray(reqFiles)) return colorFiles;
    for (let i = 0; i < totalColors; i++) {
        const fieldName = `colorImages_${i}`;
        const files = reqFiles.filter(f => f.fieldname === fieldName);
        if (files.length > 0) colorFiles[i] = files;
    }
    return colorFiles;
};

/**
 * Validate discount pricing fields
 */
const validateDiscountPricing = (actualPrice, discountPrice, isDiscountEnabled) => {
    if (actualPrice === undefined || actualPrice === null || Number(actualPrice) < 0) {
        return 'Actual Price is required and must be a non-negative number.';
    }
    if (isDiscountEnabled === true || isDiscountEnabled === 'true') {
        if (discountPrice === undefined || discountPrice === null || Number(discountPrice) < 0) {
            return 'Discount Price is required when discount is enabled.';
        }
        if (Number(discountPrice) > Number(actualPrice)) {
            return 'Discount Price cannot exceed Actual Price.';
        }
    }
    return null;
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const {
            name, description, shortDescription, specifications, detail,
            metaTitle, metaDescription, metaKeywords, category, subcategory,
            size, price, standTypes, isCustomizable,
            actualPrice, discountPrice, isDiscountEnabled,
            brand, sku, lowStockWarning, isFeatured, isNewArrival, isBestSeller,
            soldOut,
            status, publishDate, metaOgTitle, metaOgDescription, metaOgImage,
            twitterTitle, twitterDescription, twitterImage, canonicalUrl,
            shippingWeight, shippingDimensions
        } = req.body;

        const normalizedCategory = normalizeCategory(category);

        // Parse stand types
        let parsedStandTypes = [];
        if (standTypes) {
            try {
                const parsed = typeof standTypes === 'string' ? JSON.parse(standTypes) : standTypes;
                if (Array.isArray(parsed)) {
                    parsedStandTypes = parsed.map(st => ({
                        type: st.type,
                        price: Number(st.price) || 0,
                        images: Array.isArray(st.images) ? st.images : []
                    })).filter(st => st.type && ['Metallic'].includes(st.type));
                }
            } catch (e) {
                console.error('Error parsing standTypes:', e);
            }
        }

        const parsedSpecifications = typeof specifications === 'string'
            ? (() => { try { return JSON.parse(specifications); } catch (e) { return []; } })()
            : (Array.isArray(specifications) ? specifications : []);

        const stockVal = Number(req.body.stock ?? ((req.body.inStock === 'true' || req.body.inStock === true) ? 1 : 0));
        const inStockVal = req.body.inStock !== undefined
            ? (req.body.inStock === true || req.body.inStock === 'true')
            : stockVal > 0;

        if (!name || normalizedCategory.length === 0 || price === undefined) {
            return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
        }

        // Validate discount pricing
        const numericActualPrice = actualPrice !== undefined ? Number(actualPrice) : Number(price);
        const numericDiscountPrice = discountPrice !== undefined ? Number(discountPrice) : 0;
        const discountEnabled = isDiscountEnabled === true || isDiscountEnabled === 'true';
        const pricingError = validateDiscountPricing(numericActualPrice, numericDiscountPrice, discountEnabled);
        if (pricingError) return res.status(400).json({ success: false, message: pricingError });

        // Parse colors
        const colors = parseColors(req);
        const colorsError = validateColors(colors);
        if (colorsError) return res.status(400).json({ success: false, message: colorsError });

        // Upload product images
        const productImageFiles = req.files?.filter(f => f.fieldname === 'productImages') || [];
        if (productImageFiles.length < 1) {
            return res.status(400).json({ success: false, message: 'At least one product image is required.' });
        }
        const uploadedProductImages = await uploadImageBatch(productImageFiles, 'products/gallery');
        if (uploadedProductImages.length > 0) uploadedProductImages[0].isCover = true;

        // Upload color variant images
        const colorFilesMap = collectColorFiles(req.files, colors.length);
        const colorsWithImages = [];
        for (let i = 0; i < colors.length; i++) {
            const colorData = colors[i];
            const files = colorFilesMap[i] || [];
            if (files.length < 1) {
                return res.status(400).json({ success: false, message: `"${colorData.name}" color requires at least 1 image.` });
            }
            const uploadedColorImages = await uploadImageBatch(files, `products/colors/${colorData.name.replace(/\s+/g, '_')}`);
            colorsWithImages.push({ ...colorData, images: uploadedColorImages });
        }

        const normalizedColors = normalizeDefaultColor(colorsWithImages);

        // Upload stand type images
        const standTypeFilesMap = {};
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                const match = file.fieldname.match(/^standImages_(\d+)$/);
                if (match) {
                    const idx = parseInt(match[1], 10);
                    if (!standTypeFilesMap[idx]) standTypeFilesMap[idx] = [];
                    standTypeFilesMap[idx].push(file);
                }
            });
        }

        const standTypesWithImages = [];
        for (let i = 0; i < parsedStandTypes.length; i++) {
            const standData = parsedStandTypes[i];
            const files = standTypeFilesMap[i] || [];
            let standImages = standData.images || [];

            if (files.length > 0) {
                const uploadedStandImages = await uploadImageBatch(files, `products/stand-types/${standData.type.toLowerCase()}`);
                standImages = standImages.length > 0 ? [...standImages, ...uploadedStandImages] : uploadedStandImages;
            }

            // Ensure only one cover
            if (standImages.length > 1) {
                let foundCover = false;
                standImages = standImages.map(img => {
                    if (img.isCover) {
                        if (!foundCover) { foundCover = true; return img; }
                        return { ...img, isCover: false };
                    }
                    return img;
                });
            }
            if (standImages.length > 0 && !standImages.some(img => img.isCover)) {
                standImages[0].isCover = true;
            }

            standTypesWithImages.push({ type: standData.type, price: standData.price, images: standImages });
        }

        const product = new Product({
            name, description, shortDescription, specifications: parsedSpecifications, detail,
            metaTitle, metaDescription, metaKeywords, category: normalizedCategory,
            subcategory: typeof subcategory === 'string' ? subcategory.trim() : (subcategory || ''),
            size, price: Number(price), stock: stockVal, inStock: inStockVal,
            productImages: uploadedProductImages, colors: normalizedColors,
            standTypes: standTypesWithImages.length > 0 ? standTypesWithImages : undefined,
            isCustomizable: isCustomizable === true || isCustomizable === 'true',
            imageUrl: uploadedProductImages[0]?.url || '',
            cloudinaryPublicId: uploadedProductImages[0]?.publicId || '',
            actualPrice: numericActualPrice,
            discountPrice: discountEnabled ? numericDiscountPrice : 0,
            isDiscountEnabled: discountEnabled,
            brand: brand || '',
            sku: sku || '',
            lowStockWarning: Number(lowStockWarning || 5),
            isFeatured: isFeatured === true || isFeatured === 'true',
            isNewArrival: isNewArrival === true || isNewArrival === 'true',
            isBestSeller: isBestSeller === true || isBestSeller === 'true',
            soldOut: soldOut === true || soldOut === 'true',
            status: status || 'Active',
            publishDate: publishDate ? new Date(publishDate) : undefined,
            metaOgTitle: metaOgTitle || '',
            metaOgDescription: metaOgDescription || '',
            metaOgImage: metaOgImage || '',
            twitterTitle: twitterTitle || '',
            twitterDescription: twitterDescription || '',
            twitterImage: twitterImage || '',
            canonicalUrl: canonicalUrl || '',
            shippingWeight: Number(shippingWeight || 0),
            shippingDimensions: typeof shippingDimensions === 'string'
                ? (() => { try { return JSON.parse(shippingDimensions); } catch (e) { return { length: 0, width: 0, height: 0 }; } })()
                : (shippingDimensions || { length: 0, width: 0, height: 0 })
        });

        await product.save();
        return res.status(201).json({ success: true, data: product });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ success: false, message: 'A product with this slug already exists.' });
        if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: Object.values(error.errors).map(e => e.message).join(' ') });
        console.error('Error creating product:', error);
        return res.status(500).json({ success: false, message: 'Server error while creating product.' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

        // Update text fields
        const textFields = [
            'name', 'description', 'shortDescription', 'detail', 'metaTitle', 'metaDescription', 'metaKeywords', 'size',
            'brand', 'sku', 'status', 'metaOgTitle', 'metaOgDescription', 'metaOgImage',
            'twitterTitle', 'twitterDescription', 'twitterImage', 'canonicalUrl'
        ];
        textFields.forEach(field => {
            if (req.body[field] !== undefined) product[field] = req.body[field];
        });

        if (req.body.category !== undefined) product.category = normalizeCategory(req.body.category);
        if (req.body.subcategory !== undefined) {
            product.subcategory = typeof req.body.subcategory === 'string' ? req.body.subcategory.trim() : (req.body.subcategory || '');
        }
        if (req.body.price !== undefined) product.price = Number(req.body.price);
        if (req.body.stock !== undefined) {
            product.stock = Number(req.body.stock || 0);
            product.inStock = product.stock > 0;
        }
        if (req.body.inStock !== undefined) {
            product.inStock = req.body.inStock === true || req.body.inStock === 'true';
        }
        if (req.body.isCustomizable !== undefined) {
            product.isCustomizable = req.body.isCustomizable === true || req.body.isCustomizable === 'true';
        }
        if (req.body.isFeatured !== undefined) {
            product.isFeatured = req.body.isFeatured === true || req.body.isFeatured === 'true';
        }
        if (req.body.isNewArrival !== undefined) {
            product.isNewArrival = req.body.isNewArrival === true || req.body.isNewArrival === 'true';
        }
        if (req.body.isBestSeller !== undefined) {
            product.isBestSeller = req.body.isBestSeller === true || req.body.isBestSeller === 'true';
        }
        if (req.body.soldOut !== undefined) {
            product.soldOut = req.body.soldOut === true || req.body.soldOut === 'true';
        }
        if (req.body.lowStockWarning !== undefined) {
            product.lowStockWarning = Number(req.body.lowStockWarning || 5);
        }
        if (req.body.shippingWeight !== undefined) {
            product.shippingWeight = Number(req.body.shippingWeight || 0);
        }
        if (req.body.shippingDimensions !== undefined) {
            product.shippingDimensions = typeof req.body.shippingDimensions === 'string'
                ? (() => { try { return JSON.parse(req.body.shippingDimensions); } catch (e) { return { length: 0, width: 0, height: 0 }; } })()
                : (req.body.shippingDimensions || { length: 0, width: 0, height: 0 });
        }
        if (req.body.publishDate !== undefined) {
            product.publishDate = req.body.publishDate ? new Date(req.body.publishDate) : undefined;
        }

        // Parse specifications
        if (req.body.specifications !== undefined) {
            product.specifications = typeof req.body.specifications === 'string'
                ? (() => { try { return JSON.parse(req.body.specifications); } catch (e) { return []; } })()
                : (Array.isArray(req.body.specifications) ? req.body.specifications : []);
        }

        // Handle stand types update with images
        if (req.body.standTypes !== undefined) {
            try {
                const parsed = typeof req.body.standTypes === 'string' ? JSON.parse(req.body.standTypes) : req.body.standTypes;
                if (Array.isArray(parsed)) {
                    const standTypeFilesMap = {};
                    if (req.files && Array.isArray(req.files)) {
                        req.files.forEach(file => {
                            const match = file.fieldname.match(/^standImages_(\d+)$/);
                            if (match) {
                                const idx = parseInt(match[1], 10);
                                if (!standTypeFilesMap[idx]) standTypeFilesMap[idx] = [];
                                standTypeFilesMap[idx].push(file);
                            }
                        });
                    }

                    const standTypesWithImages = [];
                    for (let i = 0; i < parsed.length; i++) {
                        const standData = parsed[i];
                        const files = standTypeFilesMap[i] || [];
                        const existingStand = (product.standTypes || []).find(st => st.type === standData.type);

                        let keptExisting = (Array.isArray(standData.images) ? standData.images : [])
                            .map(img => typeof img === 'string' ? { url: img } : img)
                            .filter(img => img && typeof img.url === 'string' && img.url.trim().length > 0);

                        if (existingStand) {
                            for (const img of existingStand.images) {
                                if (img.publicId && !keptExisting.some(s => s.url === img.url)) {
                                    await deleteFromCloudinary(img.publicId);
                                }
                            }
                        }

                        if (files.length > 0) {
                            const uploadedStandImages = await uploadImageBatch(files, `products/stand-types/${(standData.type || 'metallic').toLowerCase()}`);
                            const matchedExisting = (existingStand?.images || []).filter(img => keptExisting.some(s => s.url === img.url));
                            keptExisting = [...matchedExisting, ...uploadedStandImages];
                        } else if (keptExisting.length === 0 && existingStand?.images && existingStand.images.length > 0) {
                            keptExisting = existingStand.images;
                        }

                        if (keptExisting.length > 1) {
                            let foundCover = false;
                            keptExisting = keptExisting.map(img => {
                                if (img.isCover) {
                                    if (!foundCover) { foundCover = true; return img; }
                                    return { ...img, isCover: false };
                                }
                                return img;
                            });
                        }
                        if (keptExisting.length > 0 && !keptExisting.some(img => img.isCover)) {
                            keptExisting[0].isCover = true;
                        }

                        standTypesWithImages.push({
                            type: standData.type || 'Metallic',
                            price: Number(standData.price) || 0,
                            images: keptExisting
                        });
                    }
                    product.standTypes = standTypesWithImages.filter(st => st.type && ['Metallic'].includes(st.type));
                }
            } catch (e) {
                console.error('Error parsing standTypes for update:', e);
            }
        }

        // Handle discount pricing
        if (req.body.actualPrice !== undefined || req.body.discountPrice !== undefined || req.body.isDiscountEnabled !== undefined) {
            const newActualPrice = req.body.actualPrice !== undefined ? Number(req.body.actualPrice) : product.actualPrice;
            const newDiscountPrice = req.body.discountPrice !== undefined ? Number(req.body.discountPrice) : product.discountPrice;
            const newDiscountEnabled = req.body.isDiscountEnabled !== undefined
                ? (req.body.isDiscountEnabled === true || req.body.isDiscountEnabled === 'true')
                : product.isDiscountEnabled;
            const pricingError = validateDiscountPricing(newActualPrice, newDiscountPrice, newDiscountEnabled);
            if (pricingError) return res.status(400).json({ success: false, message: pricingError });
            product.actualPrice = newActualPrice;
            product.discountPrice = newDiscountEnabled ? newDiscountPrice : 0;
            product.isDiscountEnabled = newDiscountEnabled;
        }

        // Handle product images
        const productImageFiles = req.files?.filter(f => f.fieldname === 'productImages') || [];
        let uploadedProductImages = [...product.productImages];
        if (productImageFiles.length > 0) {
            const existingUrlsStr = req.body.existingProductImageUrls || '[]';
            let existingUrls = [];
            try { existingUrls = typeof existingUrlsStr === 'string' ? JSON.parse(existingUrlsStr) : existingUrlsStr; } catch (e) { }
            for (const img of product.productImages) {
                if (img.publicId && !existingUrls.includes(img.url)) await deleteFromCloudinary(img.publicId);
            }
            const newUploads = await uploadImageBatch(productImageFiles, 'products/gallery');
            const keptExisting = product.productImages.filter(img => existingUrls.includes(img.url));
            uploadedProductImages = [...keptExisting, ...newUploads];
        }
        if (uploadedProductImages.length < 1) return res.status(400).json({ success: false, message: 'At least one product image is required.' });
        product.productImages = uploadedProductImages;
        product.imageUrl = uploadedProductImages[0]?.url || product.imageUrl;
        product.cloudinaryPublicId = uploadedProductImages[0]?.publicId || product.cloudinaryPublicId;

        // Handle colors update
        if (req.body.colors !== undefined) {
            const newColors = parseColors(req);
            const colorsError = validateColors(newColors);
            if (colorsError) return res.status(400).json({ success: false, message: colorsError });
            const colorFilesMap = collectColorFiles(req.files, newColors.length);
            const colorsWithImages = [];
            for (let i = 0; i < newColors.length; i++) {
                const colorData = newColors[i];
                let colorImages = colorData.images || [];
                const newFiles = colorFilesMap[i] || [];
                const existingColor = product.colors.find(c => c.name?.toLowerCase() === colorData.name?.toLowerCase());
                if (existingColor) {
                    for (const img of existingColor.images) {
                        if (img.publicId && !colorImages.some(c => c.url === img.url)) await deleteFromCloudinary(img.publicId);
                    }
                }
                if (newFiles.length > 0) {
                    const newUploads = await uploadImageBatch(newFiles, `products/colors/${colorData.name.replace(/\s+/g, '_')}`);
                    const keptExisting = (existingColor?.images || []).filter(img => colorImages.some(c => c.url === img.url));
                    colorImages = [...keptExisting, ...newUploads];
                } else if (existingColor && (!colorData.images || colorData.images.length === 0)) {
                    colorImages = existingColor.images;
                }
                colorsWithImages.push({ name: colorData.name, hex: colorData.hex, price: colorData.price, stock: colorData.stock, inStock: colorData.inStock, isDefault: colorData.isDefault, images: colorImages });
            }
            for (const c of colorsWithImages) {
                if (c.images.length < 1) return res.status(400).json({ success: false, message: `"${c.name}" color requires at least 1 image.` });
            }
            product.colors = normalizeDefaultColor(colorsWithImages);
        }

        await product.save();
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ success: false, message: 'A product with this slug already exists.' });
        if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: Object.values(error.errors).map(e => e.message).join(' ') });
        console.error('Error updating product:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating product.' });
    }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        const { category, subcategory, color, size, minPrice, maxPrice, search, page = 1, limit = 20, sort, isFeatured, isNewArrival, isBestSeller } = req.query;
        const filter = {};
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true' || isFeatured === true;
        if (isNewArrival !== undefined) filter.isNewArrival = isNewArrival === 'true' || isNewArrival === true;
        if (isBestSeller !== undefined) filter.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
        if (category) filter.category = { $in: Array.isArray(category) ? category : [category] };
        if (subcategory) filter.subcategory = subcategory;
        if (color) {
            const colorArr = Array.isArray(color) ? color : [color];
            filter.$or = [
                { color: { $in: colorArr } },
                { 'colors.name': { $in: colorArr } }
            ];
        }
        if (size) filter.size = size;
        if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
            filter.price = {};
            if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
            if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            const searchRegex = new RegExp(escapeRegex(search), 'i');
            const searchFilter = [
                { name: searchRegex },
                { description: searchRegex },
                { shortDescription: searchRegex },
                { detail: searchRegex },
                { category: searchRegex },
                { subcategory: searchRegex }
            ];
            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, { $or: searchFilter }];
                delete filter.$or;
            } else {
                filter.$or = searchFilter;
            }
        }
        const sortOptions = {};
        if (sort === 'price_asc' || sort === 'price-asc') sortOptions.price = 1;
        else if (sort === 'price_desc' || sort === 'price-desc') sortOptions.price = -1;
        else if (sort === 'rating') sortOptions.avgRating = -1;
        else sortOptions.createdAt = -1;
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Number(limit) || 20);
        const skip = (pageNum - 1) * limitNum;
        const [products, total] = await Promise.all([
            Product.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
            Product.countDocuments(filter)
        ]);
        const pages = Math.max(1, Math.ceil(total / limitNum));
        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNum,
                pages,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching products.' });
    }
};

// @desc    Get a single product by slug
// @route   GET /api/products/slug/:categorySlug/:nameSlug
// @route   GET /api/products/slug/:categorySlug/:subcategorySlug/:nameSlug
// @access  Public
exports.getProductBySlug = async (req, res) => {
    try {
        const { categorySlug, subcategorySlug, nameSlug } = req.params;
        const slug = subcategorySlug ? `${categorySlug}/${subcategorySlug}/${nameSlug}` : `${categorySlug}/${nameSlug}`;
        let product = await Product.findOne({ slug });
        if (!product) product = await Product.findOne({ slug: { $regex: new RegExp(escapeRegex(nameSlug) + '$') } });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        Product.findOneAndUpdate({ _id: product._id }, { $inc: { views: 1 } }).exec();
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Error fetching product by slug:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching product.' });
    }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid product ID.' });
        console.error('Error fetching product:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching product.' });
    }
};

// @desc    Get featured reviews
// @route   GET /api/products/reviews/featured
// @access  Public
exports.getFeaturedReviews = async (req, res) => {
    try {
        const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 6));
        const minRating = Math.max(0, Math.min(5, Number(req.query.minRating) || 4));
        const reviews = await Product.aggregate([
            { $unwind: '$reviews' },
            { $match: { 'reviews.rating': { $gt: minRating }, 'reviews.comment': { $exists: true, $ne: '' } } },
            { $sample: { size: limit } },
            { $project: { _id: '$reviews._id', name: { $ifNull: ['$reviews.name', 'Anonymous'] }, rating: '$reviews.rating', text: '$reviews.comment', createdAt: '$reviews.createdAt', productName: '$name', productSlug: '$slug' } }
        ]);
        return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error('Error fetching featured reviews:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching featured reviews.' });
    }
};

// @desc    Add a review
// @route   POST /api/products/:id/reviews
// @access  Public
exports.addProductReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, rating, comment } = req.body;
        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
        const trimmedComment = typeof comment === 'string' ? comment.trim() : '';
        if (!trimmedComment) return res.status(400).json({ success: false, message: 'Review comment is required.' });
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        let reviewImage = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'reviews');
            reviewImage = result.secure_url;
        }
        product.reviews.unshift({ name: (name || '').trim() || 'Anonymous', email: (email || '').trim(), rating: numericRating, comment: trimmedComment, image: reviewImage });
        await product.save();
        return res.status(201).json({ success: true, message: 'Review added successfully.', data: product });
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid product ID.' });
        console.error('Error adding product review:', error);
        return res.status(500).json({ success: false, message: 'Server error while adding review.' });
    }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
    try {
        const { q, limit = 10, page = 1 } = req.query;
        const trimmedQuery = String(q || '').trim();
        if (!trimmedQuery) return res.status(200).json({ success: true, data: [], pagination: { total: 0, page: 1, pages: 0, limit: Number(limit) || 10 } });
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;
        const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefixRegex = new RegExp('^' + escaped, 'i');
        const instantFilter = { $or: [{ name: prefixRegex }, { category: prefixRegex }, { subcategory: prefixRegex }] };
        let [products, total] = await Promise.all([Product.find(instantFilter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean().exec(), Product.countDocuments(instantFilter)]);
        if (products.length === 0 && trimmedQuery.length >= 3) {
            const textFilter = { $text: { $search: trimmedQuery } };
            [products, total] = await Promise.all([Product.find(textFilter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).skip(skip).limit(limitNum).lean().exec(), Product.countDocuments(textFilter)]);
        }
        return res.status(200).json({ success: true, data: products, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum } });
    } catch (error) {
        console.error('Error searching products:', error);
        return res.status(500).json({ success: false, message: 'Server error while searching products.' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        if (product.cloudinaryPublicId) await deleteFromCloudinary(product.cloudinaryPublicId);
        for (const img of product.productImages || []) { if (img.publicId) await deleteFromCloudinary(img.publicId); }
        for (const color of product.colors || []) { for (const img of color.images || []) { if (img.publicId) await deleteFromCloudinary(img.publicId); } }
        for (const stand of product.standTypes || []) { for (const img of stand.images || []) { if (img.publicId) await deleteFromCloudinary(img.publicId); } }
        await product.deleteOne();
        return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid product ID.' });
        console.error('Error deleting product:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting product.' });
    }
};