const mongoose = require('mongoose');
const WarrantyClaim = require('../models/WarrantyClaim');
const WarrantyConfig = require('../models/WarrantyConfig');
const Order = require('../models/Order');
const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const {
    sendWarrantyClaimCustomerEmail,
    sendWarrantyClaimAdminEmail,
} = require('../services/emailService');

// Helper: Upload file buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'comfortseats/warranty-claims',
                resource_type: options.resource_type || 'auto',
                ...options,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// Helper: Generate unique Claim ID (e.g. WC-2026-00125)
const generateClaimId = async () => {
    const year = new Date().getFullYear();
    const count = await WarrantyClaim.countDocuments();
    let sequence = count + 1;
    let candidate = `WC-${year}-${String(sequence).padStart(5, '0')}`;

    // Verify uniqueness
    while (await WarrantyClaim.exists({ claimId: candidate })) {
        sequence += 1;
        candidate = `WC-${year}-${String(sequence).padStart(5, '0')}`;
    }
    return candidate;
};

// Helper: Look up matching order by ObjectId, last 8 chars, or order number
const findMatchingOrder = async (orderNumber) => {
    if (!orderNumber) return null;
    const cleanNumber = String(orderNumber).trim().replace(/^#/, '');

    // 1. Exact 24-hex ObjectId match
    if (mongoose.isValidObjectId(cleanNumber)) {
        const order = await Order.findById(cleanNumber);
        if (order) return order;
    }

    // 2. Exact match on transactionRef or string search
    const byRef = await Order.findOne({ transactionRef: cleanNumber });
    if (byRef) return byRef;

    // 3. Match by last 8 characters of ObjectId (the format used in confirmation emails #a1b2c3d4)
    if (cleanNumber.length >= 6 && cleanNumber.length <= 8 && /^[0-9a-fA-F]+$/.test(cleanNumber)) {
        const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
        const match = orders.find(o => String(o._id).toLowerCase().endsWith(cleanNumber.toLowerCase()));
        if (match) return match;
    }

    return null;
};

// @desc    Create a new warranty claim
// @route   POST /api/warranty-claims
// @access  Public
const createWarrantyClaim = async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            address,
            city,
            state = '',
            postalCode = '',
            country = 'Pakistan',
            orderNumber,
            orderDate,
            productId,
            productName,
            productSku = '',
            quantity = 1,
            issueType,
            description,
        } = req.body;

        // 1. Validate required text fields
        if (!customerName?.trim()) {
            return res.status(400).json({ success: false, message: 'Full name is required.' });
        }
        if (!customerEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
            return res.status(400).json({ success: false, message: 'A valid email address is required.' });
        }
        if (!customerPhone?.trim()) {
            return res.status(400).json({ success: false, message: 'Phone number is required.' });
        }
        if (!address?.trim() || !city?.trim()) {
            return res.status(400).json({ success: false, message: 'Street address and city are required.' });
        }
        if (!orderNumber?.trim()) {
            return res.status(400).json({ success: false, message: 'Order number is required.' });
        }
        if (!orderDate) {
            return res.status(400).json({ success: false, message: 'Order date is required.' });
        }
        if (!productName?.trim()) {
            return res.status(400).json({ success: false, message: 'Product name is required.' });
        }
        if (!issueType?.trim()) {
            return res.status(400).json({ success: false, message: 'Please select an issue type.' });
        }
        if (!description?.trim() || description.trim().length < 10) {
            return res.status(400).json({ success: false, message: 'Please provide a detailed description (at least 10 characters).' });
        }
        if (description.trim().length > 3000) {
            return res.status(400).json({ success: false, message: 'Description cannot exceed 3000 characters.' });
        }

        const parsedQuantity = Math.max(1, parseInt(quantity, 10) || 1);
        const parsedOrderDate = new Date(orderDate);
        if (isNaN(parsedOrderDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid order date.' });
        }

        // 2. Order Lookup & Verification
        const matchedOrder = await findMatchingOrder(orderNumber);
        let resolvedOrderId = matchedOrder ? matchedOrder._id : null;

        // If order was found, perform basic ownership verification if email/phone is available on order
        if (matchedOrder && matchedOrder.customer) {
            const orderEmail = matchedOrder.customer.email?.toLowerCase().trim();
            const orderPhone = matchedOrder.customer.phone?.replace(/[\s-+()]/g, '');
            const subPhone = customerPhone.replace(/[\s-+()]/g, '');

            // If order has email or phone, check that at least one corresponds to prevent claiming random orders
            if (orderEmail && orderEmail !== customerEmail.toLowerCase().trim()) {
                if (orderPhone && !orderPhone.endsWith(subPhone.slice(-7)) && !subPhone.endsWith(orderPhone.slice(-7))) {
                    console.warn(`[warrantyClaim] Potential mismatch for order ${orderNumber}: order email ${orderEmail} vs submitted ${customerEmail}`);
                    // We don't reject outright in case gift/different contact info was used, but log warning
                }
            }
        }

        // 3. Process Uploaded Media (Images and Video)
        const attachments = [];
        const files = req.files || {};

        // Process images (up to 5)
        if (Array.isArray(files.images) && files.images.length > 0) {
            for (const file of files.images) {
                try {
                    const result = await uploadBufferToCloudinary(file.buffer, {
                        resource_type: 'image',
                        transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
                    });
                    attachments.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        fileType: 'image',
                        filename: file.originalname || 'claim-image.jpg',
                        size: file.size || 0,
                    });
                } catch (imgErr) {
                    console.error('[warrantyClaim] Cloudinary image upload error:', imgErr);
                }
            }
        }

        // Process video (up to 1)
        if (Array.isArray(files.video) && files.video.length > 0) {
            const videoFile = files.video[0];
            try {
                const result = await uploadBufferToCloudinary(videoFile.buffer, {
                    resource_type: 'video',
                });
                attachments.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                    fileType: 'video',
                    filename: videoFile.originalname || 'claim-video.mp4',
                    size: videoFile.size || 0,
                });
            } catch (vidErr) {
                console.error('[warrantyClaim] Cloudinary video upload error:', vidErr);
            }
        }

        // 4. Generate unique Claim ID
        const claimId = await generateClaimId();

        // 5. Create Warranty Claim record in database
        const newClaim = await WarrantyClaim.create({
            claimId,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim().toLowerCase(),
            customerPhone: customerPhone.trim(),
            address: address.trim(),
            city: city.trim(),
            state: state?.trim() || '',
            postalCode: postalCode?.trim() || '',
            country: country?.trim() || 'Pakistan',
            orderId: resolvedOrderId,
            orderNumber: orderNumber.trim(),
            orderDate: parsedOrderDate,
            productId: (productId && mongoose.isValidObjectId(productId)) ? productId : null,
            productName: productName.trim(),
            productSku: productSku?.trim() || '',
            quantity: parsedQuantity,
            issueType: issueType.trim(),
            description: description.trim(),
            attachments,
            status: 'Pending',
        });

        // 6. Broadcast Real-time event if socket is active
        if (req.io) {
            try {
                req.io.emit('new_warranty_claim', {
                    claimId: newClaim.claimId,
                    customerName: newClaim.customerName,
                    orderNumber: newClaim.orderNumber,
                    productName: newClaim.productName,
                    createdAt: newClaim.createdAt,
                });
            } catch (socketErr) {
                console.warn('[warrantyClaim] Socket emit warning:', socketErr.message);
            }
        }

        // 7. Send Emails Asynchronously (non-blocking)
        sendWarrantyClaimCustomerEmail(newClaim).catch((err) =>
            console.error('[warrantyClaim] Customer email failed:', err.message)
        );
        sendWarrantyClaimAdminEmail(newClaim).catch((err) =>
            console.error('[warrantyClaim] Admin email failed:', err.message)
        );

        res.status(201).json({
            success: true,
            message: 'Warranty claim submitted successfully.',
            data: {
                claimId: newClaim.claimId,
                customerName: newClaim.customerName,
                customerEmail: newClaim.customerEmail,
                orderNumber: newClaim.orderNumber,
                productName: newClaim.productName,
                status: newClaim.status,
                createdAt: newClaim.createdAt,
                attachmentsCount: newClaim.attachments.length,
            },
        });
    } catch (error) {
        console.error('Error creating warranty claim:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your warranty claim. Please try again.',
        });
    }
};

// @desc    Quick order lookup for pre-filling product details
// @route   GET /api/warranty-claims/order-lookup
// @access  Public
const lookupOrder = async (req, res) => {
    try {
        const { orderNumber, contact } = req.query;

        if (!orderNumber?.trim()) {
            return res.status(400).json({ success: false, message: 'Order number is required.' });
        }

        const order = await findMatchingOrder(orderNumber);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No matching order found with the provided order number.',
            });
        }

        // Optional contact verification (phone or email)
        if (contact?.trim() && order.customer) {
            const cleanContact = contact.trim().toLowerCase();
            const orderEmail = order.customer.email?.toLowerCase() || '';
            const orderPhone = order.customer.phone?.replace(/[\s-+()]/g, '') || '';
            const testPhone = cleanContact.replace(/[\s-+()]/g, '');

            const emailMatch = orderEmail && orderEmail === cleanContact;
            const phoneMatch = orderPhone && testPhone && (orderPhone.endsWith(testPhone.slice(-7)) || testPhone.endsWith(orderPhone.slice(-7)));

            if (!emailMatch && !phoneMatch) {
                return res.status(403).json({
                    success: false,
                    message: 'Contact details do not match the order records.',
                });
            }
        }

        // Extract products from the order
        const items = [];
        if (Array.isArray(order.items) && order.items.length > 0) {
            order.items.forEach((item) => {
                items.push({
                    productId: item.productId || null,
                    name: item.name || 'Product',
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    imageUrl: item.imageUrl || '',
                    color: item.color || '',
                    size: item.size || '',
                    slug: item.slug || '',
                });
            });
        } else if (order.product?.name) {
            items.push({
                productId: order.product.productId || null,
                name: order.product.name,
                quantity: order.quantity || 1,
                price: order.product.price || 0,
                imageUrl: order.product.imageUrl || '',
                color: order.product.color || '',
                size: order.product.size || '',
                slug: order.product.slug || '',
            });
        }

        res.json({
            success: true,
            data: {
                orderNumber: orderNumber.trim(),
                orderDate: order.createdAt,
                customer: {
                    fullName: order.customer?.fullName || '',
                    email: order.customer?.email || '',
                    phone: order.customer?.phone || '',
                    address: order.customer?.address || '',
                    city: order.customer?.city || '',
                },
                items,
            },
        });
    } catch (error) {
        console.error('Error looking up order:', error);
        res.status(500).json({ success: false, message: 'Error retrieving order information.' });
    }
};

// @desc    Get warranty claim by Claim ID or Mongo ID (public tracking)
// @route   GET /api/warranty-claims/:id
// @access  Public
const getWarrantyClaimById = async (req, res) => {
    try {
        const { id } = req.params;
        let claim = null;

        if (mongoose.isValidObjectId(id)) {
            claim = await WarrantyClaim.findById(id);
        }
        if (!claim) {
            claim = await WarrantyClaim.findOne({ claimId: id });
        }

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Warranty claim not found.' });
        }

        // Return sanitized claim data
        res.json({
            success: true,
            data: {
                claimId: claim.claimId,
                customerName: claim.customerName,
                orderNumber: claim.orderNumber,
                orderDate: claim.orderDate,
                productName: claim.productName,
                productSku: claim.productSku,
                quantity: claim.quantity,
                issueType: claim.issueType,
                description: claim.description,
                attachments: claim.attachments,
                status: claim.status,
                createdAt: claim.createdAt,
                updatedAt: claim.updatedAt,
            },
        });
    } catch (error) {
        console.error('Error fetching warranty claim:', error);
        res.status(500).json({ success: false, message: 'Error fetching warranty claim.' });
    }
};

// @desc    Get all warranty claims (admin)
// @route   GET /api/warranty-claims
// @access  Private/Admin
const getWarrantyClaims = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search?.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { claimId: regex },
                { customerName: regex },
                { customerEmail: regex },
                { customerPhone: regex },
                { orderNumber: regex },
                { productName: regex },
            ];
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const total = await WarrantyClaim.countDocuments(query);
        const claims = await WarrantyClaim.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit, 10));

        res.json({
            success: true,
            data: claims,
            pagination: {
                total,
                page: parseInt(page, 10),
                pages: Math.ceil(total / parseInt(limit, 10)),
            },
        });
    } catch (error) {
        console.error('Error getting warranty claims:', error);
        res.status(500).json({ success: false, message: 'Error retrieving warranty claims.' });
    }
};

// @desc    Update warranty claim status (admin)
// @route   PUT /api/warranty-claims/:id/status
// @access  Private/Admin
const updateWarrantyClaimStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const claim = await WarrantyClaim.findById(id);
        if (!claim) {
            return res.status(404).json({ success: false, message: 'Warranty claim not found.' });
        }

        if (status) claim.status = status;
        if (adminNotes !== undefined) claim.adminNotes = adminNotes;

        await claim.save();

        res.json({
            success: true,
            message: 'Warranty claim updated successfully.',
            data: claim,
        });
    } catch (error) {
        console.error('Error updating warranty claim status:', error);
        res.status(500).json({ success: false, message: 'Error updating warranty claim.' });
    }
};

// @desc    Get warranty coverage policy configuration
// @route   GET /api/warranty-claims/config
// @access  Public
const getWarrantyConfig = async (req, res) => {
    try {
        const config = await WarrantyConfig.getConfig();
        res.json({
            success: true,
            data: config,
        });
    } catch (error) {
        console.error('Error fetching warranty config:', error);
        res.status(500).json({ success: false, message: 'Error retrieving warranty configuration.' });
    }
};

// @desc    Update warranty coverage policy configuration (admin)
// @route   PUT /api/warranty-claims/config
// @access  Private/Admin
const updateWarrantyConfig = async (req, res) => {
    try {
        const {
            coveredTitle,
            coveredItems,
            notCoveredTitle,
            notCoveredItems,
            promiseTitle,
            promiseSubtitle,
            promiseItems,
            tipsTitle,
            tipsItems,
        } = req.body;

        const config = await WarrantyConfig.getConfig();

        if (coveredTitle !== undefined) config.coveredTitle = coveredTitle;
        if (Array.isArray(coveredItems)) {
            config.coveredItems = coveredItems.map(item => String(item).trim()).filter(Boolean);
        }
        if (notCoveredTitle !== undefined) config.notCoveredTitle = notCoveredTitle;
        if (Array.isArray(notCoveredItems)) {
            config.notCoveredItems = notCoveredItems.map(item => String(item).trim()).filter(Boolean);
        }
        if (promiseTitle !== undefined) config.promiseTitle = promiseTitle;
        if (promiseSubtitle !== undefined) config.promiseSubtitle = promiseSubtitle;
        if (Array.isArray(promiseItems)) {
            config.promiseItems = promiseItems.map(item => ({
                title: String(item.title || '').trim(),
                desc: String(item.desc || '').trim(),
            })).filter(item => item.title || item.desc);
        }
        if (tipsTitle !== undefined) config.tipsTitle = tipsTitle;
        if (Array.isArray(tipsItems)) {
            config.tipsItems = tipsItems.map(item => String(item).trim()).filter(Boolean);
        }

        await config.save();

        res.json({
            success: true,
            message: 'Warranty coverage policy updated successfully.',
            data: config,
        });
    } catch (error) {
        console.error('Error updating warranty config:', error);
        res.status(500).json({ success: false, message: 'Error updating warranty configuration.' });
    }
};

// @desc    Delete warranty claim (admin)
// @route   DELETE /api/warranty-claims/:id
// @access  Private/Admin
const deleteWarrantyClaim = async (req, res) => {
    try {
        const { id } = req.params;
        const claim = await WarrantyClaim.findByIdAndDelete(id);
        if (!claim) {
            return res.status(404).json({ success: false, message: 'Warranty claim not found.' });
        }
        res.json({
            success: true,
            message: 'Warranty claim deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting warranty claim:', error);
        res.status(500).json({ success: false, message: 'Error deleting warranty claim.' });
    }
};

module.exports = {
    createWarrantyClaim,
    lookupOrder,
    getWarrantyClaimById,
    getWarrantyClaims,
    updateWarrantyClaimStatus,
    getWarrantyConfig,
    updateWarrantyConfig,
    deleteWarrantyClaim,
};
