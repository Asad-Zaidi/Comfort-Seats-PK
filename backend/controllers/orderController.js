const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail, sendCustomerOrderEmail, sendOrderStatusUpdateEmails } = require('../services/emailService');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const { cleanupTempFile } = require('../middlewares/uploadMiddleware');
const streamifier = require('streamifier');

// Helper: validate and return a valid MongoDB ObjectId or null
const toValidObjectId = (val) => {
    if (!val) return null;
    const str = String(val).trim();
    if (/^[0-9a-fA-F]{24}$/.test(str)) {
        return new mongoose.Types.ObjectId(str);
    }
    if (val instanceof mongoose.Types.ObjectId) {
        return val;
    }
    return null;
};

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
        const { product, items, quantity, totalPrice, customer, paymentMethod, deliveryMethod, deliveryCharge, selectedOnlineMethod } = req.body;

        if (!customer || !customer.fullName || !customer.phone || !customer.address || !customer.city) {
            return res.status(400).json({ success: false, message: 'Customer details (name, phone, address, city) are required' });
        }

        if (!totalPrice) {
            return res.status(400).json({ success: false, message: 'Total price is required' });
        }

        // Build normalized items array
        let orderItems = [];
        if (Array.isArray(items) && items.length > 0) {
            orderItems = items.map((item) => {
                const rawId = item.productId || item.product?._id || item.product?.id || item._id || item.id || null;
                const pId = toValidObjectId(rawId);
                return {
                    productId: pId,
                    name: item.name || item.product?.name || 'Product',
                    price: Number(item.price) || Number(item.product?.price) || 0,
                    imageUrl: item.imageUrl || item.image || item.product?.image || (Array.isArray(item.product?.images) && item.product.images[0]?.url) || (Array.isArray(item.product?.images) && item.product.images[0]) || '',
                    color: item.color || item.selectedColor || '',
                    size: item.size || item.selectedSize || '',
                    selectedStandType: item.selectedStandType || '',
                    slug: item.slug || item.product?.slug || '',
                    quantity: Number(item.quantity) || 1,
                    actualPrice: Number(item.actualPrice) || 0,
                    discountPrice: Number(item.discountPrice) || 0,
                    isDiscountEnabled: item.isDiscountEnabled === true,
                };
            });
        } else if (product && product.name) {
            let productSlug = (product.slug || '').trim();
            const rawId = product.productId || product._id || product.id || null;
            const targetProductId = toValidObjectId(rawId);

            orderItems = [{
                productId: targetProductId,
                name: product.name,
                price: Number(product.price) || 0,
                imageUrl: product.imageUrl || product.image || '',
                color: product.color || product.selectedColor || '',
                size: product.size || product.selectedSize || '',
                selectedStandType: product.selectedStandType || '',
                slug: productSlug,
                quantity: Number(quantity) || 1,
                actualPrice: Number(product.actualPrice) || 0,
                discountPrice: Number(product.discountPrice) || 0,
                isDiscountEnabled: product.isDiscountEnabled === true,
            }];
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one product item is required for the order' });
        }

        // Primary product for legacy compatibility
        const firstItem = orderItems[0];
        const primaryProduct = {
            productId: firstItem.productId || null,
            name: orderItems.length > 1 ? `${orderItems.length} Items Order (${firstItem.name} + more)` : firstItem.name,
            price: firstItem.price,
            imageUrl: firstItem.imageUrl,
            color: firstItem.color,
            size: firstItem.size,
            slug: firstItem.slug,
            actualPrice: firstItem.actualPrice,
            discountPrice: firstItem.discountPrice,
            isDiscountEnabled: firstItem.isDiscountEnabled,
        };

        const totalQuantity = orderItems.reduce((acc, item) => acc + item.quantity, 0);

        const order = await Order.create({
            items: orderItems,
            product: primaryProduct,
            quantity: totalQuantity,
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

        // Increment buyCount for all products in the order with valid ObjectId
        orderItems.forEach((item) => {
            if (item.productId && mongoose.isValidObjectId(item.productId)) {
                Product.findByIdAndUpdate(item.productId, { $inc: { buyCount: item.quantity } }).catch((err) =>
                    console.error('[orderController] Failed to increment buyCount:', err)
                );
            }
        });

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