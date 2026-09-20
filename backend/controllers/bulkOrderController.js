const mongoose = require('mongoose');
const BulkOrder = require('../models/BulkOrder');
const BulkDiscountTier = require('../models/BulkDiscountTier');
const Product = require('../models/Product');
const {
    sendBulkOrderCustomerEmail,
    sendBulkOrderAdminEmail,
} = require('../services/emailService');

// Helper: Generate unique Quote ID (e.g. BQ-2026-00001)
const generateQuoteId = async () => {
    const year = new Date().getFullYear();
    const count = await BulkOrder.countDocuments();
    let sequence = count + 1;
    let candidate = `BQ-${year}-${String(sequence).padStart(5, '0')}`;

    while (await BulkOrder.exists({ quoteId: candidate })) {
        sequence += 1;
        candidate = `BQ-${year}-${String(sequence).padStart(5, '0')}`;
    }
    return candidate;
};

// Helper: Determine applicable discount tier from database tiers
const findApplicableTier = (tiers, quantity) => {
    if (!tiers || tiers.length === 0 || quantity < 1) {
        return null;
    }
    // Sort descending by minQuantity to find the highest matching tier
    const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
    for (const tier of sorted) {
        if (quantity >= tier.minQuantity) {
            if (tier.maxQuantity === null || tier.maxQuantity === undefined || quantity <= tier.maxQuantity) {
                return tier;
            }
        }
    }
    return null;
};

// @desc    Get active bulk discount tiers
// @route   GET /api/bulk-orders/discounts
// @access  Public
const getBulkDiscountTiers = async (req, res) => {
    try {
        const tiers = await BulkDiscountTier.getTiers();
        return res.status(200).json({
            success: true,
            data: tiers,
        });
    } catch (error) {
        console.error('[bulkOrderController] Error fetching discount tiers:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching bulk discount tiers.',
        });
    }
};

// @desc    Update / replace bulk discount tiers (Admin)
// @route   PUT /api/bulk-orders/discounts
// @access  Private/Admin
const updateBulkDiscountTiers = async (req, res) => {
    try {
        const { tiers } = req.body;
        if (!Array.isArray(tiers) || tiers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tiers must be a non-empty array.',
            });
        }

        // Validate each tier
        for (const t of tiers) {
            if (typeof t.minQuantity !== 'number' || typeof t.discountPercentage !== 'number' || !t.label) {
                return res.status(400).json({
                    success: false,
                    message: 'Each tier must have a numeric minQuantity, discountPercentage, and a label.',
                });
            }
        }

        // Remove old and insert new
        await BulkDiscountTier.deleteMany({});
        const updatedTiers = await BulkDiscountTier.insertMany(
            tiers.map((t, index) => ({
                minQuantity: t.minQuantity,
                maxQuantity: t.maxQuantity !== undefined ? t.maxQuantity : null,
                discountPercentage: t.discountPercentage,
                label: t.label.trim(),
                active: t.active !== undefined ? t.active : true,
                order: t.order !== undefined ? t.order : index + 1,
            }))
        );

        return res.status(200).json({
            success: true,
            message: 'Bulk discount tiers updated successfully.',
            data: updatedTiers,
        });
    } catch (error) {
        console.error('[bulkOrderController] Error updating discount tiers:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating bulk discount tiers.',
        });
    }
};

// @desc    Calculate authoritative bulk quote preview
// @route   POST /api/bulk-orders/calculate
// @access  Public
const calculateBulkQuote = async (req, res) => {
    try {
        const { quantity = 1, products = [] } = req.body;
        const totalQty = Math.max(1, parseInt(quantity, 10) || 1);

        const tiers = await BulkDiscountTier.getTiers();
        const applicableTier = findApplicableTier(tiers, totalQty);
        const discountPercentage = applicableTier ? applicableTier.discountPercentage : 0;

        let estimatedSubtotal = 0;
        const resolvedProducts = [];

        if (Array.isArray(products) && products.length > 0) {
            for (const item of products) {
                let unitPrice = 0;
                let productName = item.productName || 'Custom Chair';
                let sku = item.sku || '';
                let imageUrl = item.imageUrl || '';

                if (item.productId && mongoose.isValidObjectId(item.productId)) {
                    const dbProduct = await Product.findById(item.productId).select('name price sku imageUrl productImages actualPrice discountPrice isDiscountEnabled');
                    if (dbProduct) {
                        unitPrice = dbProduct.isDiscountEnabled && dbProduct.discountPrice > 0
                            ? dbProduct.discountPrice
                            : dbProduct.price || dbProduct.actualPrice || 0;
                        productName = dbProduct.name;
                        sku = dbProduct.sku || sku;
                        imageUrl = dbProduct.imageUrl || (dbProduct.productImages?.[0]?.url) || imageUrl;
                    }
                } else if (item.price && Number(item.price) > 0) {
                    unitPrice = Number(item.price);
                }

                const itemQty = Math.max(1, parseInt(item.quantity, 10) || 1);
                estimatedSubtotal += unitPrice * itemQty;

                resolvedProducts.push({
                    productId: item.productId || null,
                    productName,
                    sku,
                    price: unitPrice,
                    quantity: itemQty,
                    imageUrl,
                });
            }
        }

        const estimatedDiscount = Math.round((estimatedSubtotal * discountPercentage) / 100);
        const estimatedTotal = Math.max(0, estimatedSubtotal - estimatedDiscount);

        return res.status(200).json({
            success: true,
            data: {
                totalQuantity: totalQty,
                applicableTier: applicableTier ? applicableTier.label : 'Standard',
                discountPercentage,
                estimatedSubtotal,
                estimatedDiscount,
                estimatedTotal,
                products: resolvedProducts,
            },
        });
    } catch (error) {
        console.error('[bulkOrderController] Error calculating quote:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while calculating bulk quote.',
        });
    }
};

// @desc    Submit a new bulk order request / quote
// @route   POST /api/bulk-orders
// @access  Public
const createBulkOrder = async (req, res) => {
    try {
        const {
            customerName,
            email,
            phone,
            companyName,
            totalQuantity,
            quantity,
            deliveryAddress,
            city,
            state = '',
            postalCode = '',
            country = 'Pakistan',
            additionalDetails = '',
            products = [],
        } = req.body;

        // 1. Validation
        if (!customerName || !customerName.trim()) {
            return res.status(400).json({ success: false, message: 'Full name is required.' });
        }
        // Email is optional, but if provided it must have valid email syntax
        if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
        }
        if (!phone || !phone.trim()) {
            return res.status(400).json({ success: false, message: 'Phone number is required.' });
        }
        if (!deliveryAddress || !deliveryAddress.trim()) {
            return res.status(400).json({ success: false, message: 'Delivery address is required.' });
        }
        if (!city || !city.trim()) {
            return res.status(400).json({ success: false, message: 'City is required.' });
        }

        // Quantity is optional and defaults gracefully to 1
        const parsedQuantity = Math.max(1, parseInt(totalQuantity || quantity, 10) || 1);

        // 2. Server-side discount & pricing verification
        const tiers = await BulkDiscountTier.getTiers();
        const applicableTier = findApplicableTier(tiers, parsedQuantity);
        const discountPercentage = applicableTier ? applicableTier.discountPercentage : 0;
        const discountTierLabel = applicableTier ? applicableTier.label : 'Standard Rate';

        let estimatedSubtotal = 0;
        const resolvedProducts = [];

        if (Array.isArray(products) && products.length > 0) {
            for (const item of products) {
                let unitPrice = 0;
                let productName = item.productName || 'Office Chair';
                let sku = item.sku || '';
                let imageUrl = item.imageUrl || '';
                let validProductId = null;

                if (item.productId && mongoose.isValidObjectId(item.productId)) {
                    const dbProduct = await Product.findById(item.productId);
                    if (dbProduct) {
                        validProductId = dbProduct._id;
                        productName = dbProduct.name;
                        sku = dbProduct.sku || sku;
                        imageUrl = dbProduct.imageUrl || (dbProduct.productImages?.[0]?.url) || imageUrl;
                        unitPrice = dbProduct.isDiscountEnabled && dbProduct.discountPrice > 0
                            ? dbProduct.discountPrice
                            : dbProduct.price || dbProduct.actualPrice || 0;
                    }
                } else if (item.price && Number(item.price) > 0) {
                    unitPrice = Number(item.price);
                }

                const itemQty = Math.max(1, parseInt(item.quantity, 10) || 1);
                estimatedSubtotal += unitPrice * itemQty;

                resolvedProducts.push({
                    productId: validProductId,
                    productName,
                    sku,
                    price: unitPrice,
                    quantity: itemQty,
                    imageUrl,
                });
            }
        }

        const estimatedDiscount = Math.round((estimatedSubtotal * discountPercentage) / 100);
        const estimatedTotal = Math.max(0, estimatedSubtotal - estimatedDiscount);

        // 3. Generate unique Quote ID
        const quoteId = await generateQuoteId();

        // 4. Create database record
        const bulkOrder = await BulkOrder.create({
            quoteId,
            customerId: req.user?._id || null,
            customerName: customerName.trim(),
            email: email && email.trim() ? email.trim().toLowerCase() : '',
            phone: phone.trim(),
            companyName: companyName && companyName.trim() ? companyName.trim() : '',
            products: resolvedProducts,
            totalQuantity: parsedQuantity,
            deliveryAddress: deliveryAddress.trim(),
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
            country: country.trim() || 'Pakistan',
            additionalDetails: additionalDetails.trim(),
            discountTier: discountTierLabel,
            discountPercentage,
            estimatedSubtotal,
            estimatedDiscount,
            estimatedTotal,
            status: 'Pending',
        });

        // 5. Broadcast Socket event to active admin viewers
        if (req.io) {
            try {
                req.io.emit('new_bulk_order', {
                    quoteId: bulkOrder.quoteId,
                    customerName: bulkOrder.customerName,
                    companyName: bulkOrder.companyName || 'Individual / Unspecified',
                    totalQuantity: bulkOrder.totalQuantity,
                    createdAt: bulkOrder.createdAt,
                });
            } catch (socketErr) {
                console.warn('[bulkOrderController] Socket emit warning:', socketErr.message);
            }
        }

        // 6. Asynchronously send confirmation & admin emails (non-blocking)
        if (bulkOrder.email) {
            sendBulkOrderCustomerEmail(bulkOrder).catch((err) =>
                console.error('[bulkOrderController] Customer confirmation email error:', err.message)
            );
        }
        sendBulkOrderAdminEmail(bulkOrder).catch((err) =>
            console.error('[bulkOrderController] Admin alert email error:', err.message)
        );

        return res.status(201).json({
            success: true,
            message: 'Bulk order request submitted successfully.',
            data: {
                quoteId: bulkOrder.quoteId,
                customerName: bulkOrder.customerName,
                companyName: bulkOrder.companyName,
                totalQuantity: bulkOrder.totalQuantity,
                email: bulkOrder.email,
                status: bulkOrder.status,
                createdAt: bulkOrder.createdAt,
            },
        });
    } catch (error) {
        console.error('[bulkOrderController] Error creating bulk order:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while submitting bulk order request.',
        });
    }
};

// @desc    Get all bulk order requests (Admin)
// @route   GET /api/bulk-orders
// @access  Private/Admin
const getAllBulkOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [
                { quoteId: regex },
                { customerName: regex },
                { companyName: regex },
                { email: regex },
                { phone: regex },
                { city: regex },
            ];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [bulkOrders, total] = await Promise.all([
            BulkOrder.find(filter)
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            BulkOrder.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: bulkOrders,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
        });
    } catch (error) {
        console.error('[bulkOrderController] Error listing bulk orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while retrieving bulk order requests.',
        });
    }
};

// @desc    Get a single bulk order request by ID (Admin)
// @route   GET /api/bulk-orders/:id
// @access  Private/Admin
const getBulkOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = null;

        if (mongoose.isValidObjectId(id)) {
            query = { _id: id };
        } else {
            query = { quoteId: id.toUpperCase().trim() };
        }

        const bulkOrder = await BulkOrder.findOne(query).populate('customerId', 'name email');
        if (!bulkOrder) {
            return res.status(404).json({
                success: false,
                message: 'Bulk order request not found.',
            });
        }

        return res.status(200).json({
            success: true,
            data: bulkOrder,
        });
    } catch (error) {
        console.error('[bulkOrderController] Error fetching bulk order by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching bulk order request.',
        });
    }
};

// @desc    Update bulk order status & admin notes (Admin)
// @route   PUT /api/bulk-orders/:id/status
// @access  Private/Admin
const updateBulkOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const allowedStatuses = [
            'Pending',
            'Under Review',
            'Quote Sent',
            'Approved',
            'Rejected',
            'Converted to Order',
            'Cancelled',
            'Completed',
        ];

        const updateData = {};
        if (status) {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
                });
            }
            updateData.status = status;
        }

        if (adminNotes !== undefined) {
            updateData.adminNotes = String(adminNotes).trim();
        }

        const bulkOrder = await BulkOrder.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!bulkOrder) {
            return res.status(404).json({
                success: false,
                message: 'Bulk order request not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Bulk order request updated successfully.',
            data: bulkOrder,
        });
    } catch (error) {
        console.error('[bulkOrderController] Error updating bulk order status:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating bulk order request.',
        });
    }
};

// @desc    Delete a bulk order request (Admin)
// @route   DELETE /api/bulk-orders/:id
// @access  Private/Admin
const deleteBulkOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await BulkOrder.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Bulk order request not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Bulk order request deleted successfully.',
        });
    } catch (error) {
        console.error('[bulkOrderController] Error deleting bulk order:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting bulk order request.',
        });
    }
};

module.exports = {
    getBulkDiscountTiers,
    updateBulkDiscountTiers,
    calculateBulkQuote,
    createBulkOrder,
    getAllBulkOrders,
    getBulkOrderById,
    updateBulkOrderStatus,
    deleteBulkOrder,
};
