const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail, sendCustomerOrderEmail, sendOrderStatusUpdateEmails } = require('../services/emailService');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const { cleanupTempFile } = require('../middlewares/uploadMiddleware');
const streamifier = require('streamifier');

// Helper: upload a buffer to Cloudinary using a stream (for memory storage multer)
const uploadBufferToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, transformation: [{ width: 1200, crop: 'limit' }] },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const { product, quantity, totalPrice, customer, paymentMethod, deliveryMethod, deliveryCharge, selectedOnlineMethod } = req.body;

        if (!product || !product.name || !quantity || !totalPrice || !customer) {
            return res.status(400).json({ success: false, message: 'Missing required order fields' });
        }

        if (!customer.fullName || !customer.phone || !customer.address || !customer.city) {
            return res.status(400).json({ success: false, message: 'Customer details are required' });
        }

        let productSlug = (product.slug || '').trim();
        const targetProductId = product.productId || product._id;
        if (!productSlug && targetProductId) {
            try {
                const foundProd = await Product.findById(targetProductId).select('slug').lean();
                if (foundProd && foundProd.slug) {
                    productSlug = foundProd.slug;
                }
            } catch (err) {
                console.error('[orderController] Failed to fetch product slug:', err);
            }
        }

        const order = await Order.create({
            product: {
                productId: targetProductId || null,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl || '',
                color: product.color || '',
                size: product.size || '',
                slug: productSlug,
                // Discount pricing fields for historical accuracy
                actualPrice: product.actualPrice || 0,
                discountPrice: product.discountPrice || 0,
                isDiscountEnabled: product.isDiscountEnabled || false,
            },
            quantity,
            totalPrice,
            customer: {
                fullName: customer.fullName,
                phone: customer.phone,
                email: customer.email || '',
                address: customer.address,
                city: customer.city,
            },
            paymentMethod: paymentMethod || 'cod',
            selectedOnlineMethod: selectedOnlineMethod ? {
                methodId: selectedOnlineMethod.methodId || '',
                name: selectedOnlineMethod.name || '',
                type: selectedOnlineMethod.type || '',
                icon: selectedOnlineMethod.icon || '',
            } : undefined,
            deliveryMethod: deliveryMethod || 'standard',
            deliveryCharge: Number(deliveryCharge) || 0,
            status: 'pending',
        });

        // Increment the product's buyCount when an order is placed
        if (product.productId) {
            Product.findByIdAndUpdate(product.productId, { $inc: { buyCount: quantity } }).catch((err) =>
                console.error('[orderController] Failed to increment buyCount:', err)
            );
        }

        // Send emails immediately for COD orders (no receipt needed)
        // For online payments, emails are sent from the receipt upload endpoint
        // so the receipt image is included in the emails.
        if (paymentMethod === 'cod') {
            sendCustomerOrderEmail(order, { confirmed: false }).catch((err) =>
                console.error('[orderController] Customer order email failed:', err)
            );
            sendOrderConfirmationEmail(order).catch((err) =>
                console.error('[orderController] Order notification email failed:', err)
            );
        }

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Server error while creating order' });
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching orders' });
    }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status, shipping } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid order status' });
        }

        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const previousStatus = existingOrder.status;

        if (previousStatus === 'delivered' || previousStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'This order is already delivered. Status updates are locked.',
            });
        }

        // Shipment tracking (optional)
        const incomingShipping = shipping || {
            courierName: req.body.courierName,
            trackingNumber: req.body.trackingNumber,
            trackingUrl: req.body.trackingUrl,
        };

        const updateFields = {
            status,
            updatedAt: new Date(),
        };

        // Merge shipping details if provided or if status is shipped
        if (incomingShipping.courierName || incomingShipping.trackingNumber || status === 'shipped') {
            updateFields.shipping = {
                courierName: (incomingShipping.courierName || existingOrder.shipping?.courierName || '').trim(),
                trackingNumber: (incomingShipping.trackingNumber || existingOrder.shipping?.trackingNumber || '').trim(),
                trackingUrl: (incomingShipping.trackingUrl || existingOrder.shipping?.trackingUrl || '').trim(),
                shippedAt: existingOrder.shipping?.shippedAt || (status === 'shipped' ? new Date() : undefined),
            };
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        );

        // Send email notifications to both Customer and Admin on status update
        if (previousStatus !== status || status === 'shipped') {
            sendOrderStatusUpdateEmails({
                order,
                previousStatus,
                newStatus: status,
            }).catch((err) =>
                console.error('[orderController] Status update email notification failed:', err)
            );
        }

        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating order' });
    }
};

// @desc    Upload payment receipt for an order
// @route   PUT /api/orders/:id/receipt
// @access  Public (customer upload) — order matched by id; receipt stored on order
const uploadOrderReceipt = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        let receiptUrl = order.paymentReceipt || '';
        if (req.file) {
            try {
                if (req.file.buffer) {
                    const result = await uploadBufferToCloudinary(req.file.buffer, 'order-receipts');
                    receiptUrl = result.secure_url;
                } else if (req.file.path) {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'order-receipts',
                        transformation: [{ width: 1200, crop: 'limit' }],
                    });
                    receiptUrl = result.secure_url;
                    if (typeof cleanupTempFile === 'function') {
                        cleanupTempFile(req.file.path);
                    }
                }
            } catch (uploadError) {
                console.error('[orderController] Upload receipt error:', uploadError);
                if (req.file?.path && typeof cleanupTempFile === 'function') {
                    cleanupTempFile(req.file.path);
                }
                return res.status(500).json({ success: false, message: 'Failed to upload receipt image.' });
            }
        }

        order.paymentReceipt = receiptUrl;
        if (req.body.transactionRef !== undefined) {
            order.transactionRef = req.body.transactionRef;
        }
        await order.save();

        // Send emails with the uploaded receipt to both admin and customer
        sendCustomerOrderEmail(order, { confirmed: false }).catch((err) =>
            console.error('[orderController] Customer order email failed:', err)
        );
        sendOrderConfirmationEmail(order).catch((err) =>
            console.error('[orderController] Order notification email failed:', err)
        );

        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Upload receipt error:', error);
        res.status(500).json({ success: false, message: 'Server error while uploading receipt' });
    }
};

// @desc    Delete an order (admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting order' });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus, deleteOrder, uploadOrderReceipt };