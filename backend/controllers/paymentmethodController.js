const PaymentSettings = require("../models/PaymentMethod");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

// Helper: upload a buffer to Cloudinary using a stream
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, transformation: [{ width: 800, crop: "limit" }] },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// Legacy helper — extract value from generic fields[] array
const getFieldValue = (method, label) => {
    const field = method?.fields?.find((item) => item.label?.toLowerCase() === label.toLowerCase());
    return field?.value || "";
};

// Build the API response — includes both legacy flat objects and the full paymentMethods array
const buildPaymentSettingsResponse = (settings) => {
    const methods = settings?.paymentMethods || [];

    // Sort by displayOrder for checkout
    const sortedMethods = [...methods].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Legacy backward-compatible objects (extracted from the methods array)
    const bankTransfer = methods.find((method) => /bank transfer/i.test(method.name || "")) || {};
    const jazzcash = methods.find((method) => /jazzcash/i.test(method.name || "")) || {};
    const easypaisa = methods.find((method) => /easypaisa/i.test(method.name || "")) || {};

    return {
        instructions: settings?.instructions || "",
        defaultPaymentMethod: settings?.defaultPaymentMethod || "cod",
        // Legacy fields for backward compatibility
        bankTransfer: {
            enabled: bankTransfer.enabled ?? false,
            bankName: bankTransfer.accountTitle ? (getFieldValue(bankTransfer, "Bank Name") || bankTransfer.name || "") : getFieldValue(bankTransfer, "Bank Name"),
            accountTitle: bankTransfer.accountTitle || getFieldValue(bankTransfer, "Account Title"),
            accountNumber: bankTransfer.accountNumber || getFieldValue(bankTransfer, "Account Number"),
            iban: bankTransfer.iban || getFieldValue(bankTransfer, "IBAN"),
        },
        jazzcash: {
            enabled: jazzcash.enabled ?? false,
            accountTitle: jazzcash.accountTitle || getFieldValue(jazzcash, "Account Title"),
            number: jazzcash.accountNumber || getFieldValue(jazzcash, "Number"),
        },
        easypaisa: {
            enabled: easypaisa.enabled ?? false,
            accountTitle: easypaisa.accountTitle || getFieldValue(easypaisa, "Account Title"),
            number: easypaisa.accountNumber || getFieldValue(easypaisa, "Number"),
        },
        // Full payment methods array (sorted)
        paymentMethods: sortedMethods,
        updatedAt: settings?.updatedAt,
    };
};

exports.getPaymentSettings = async (req, res) => {
    try {
        const settings = await PaymentSettings.getSingleton();

        res.json({
            success: true,
            data: buildPaymentSettingsResponse(settings),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

exports.addPaymentMethod = async (req, res) => {
    try {
        const settings = await PaymentSettings.getSingleton();

        const { name, type, accountTitle, accountNumber, iban, icon, logo, qrCode, displayOrder, enabled, fields } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Payment method name is required." });
        }

        // Auto-assign displayOrder if not provided
        const order = displayOrder !== undefined
            ? Number(displayOrder)
            : (settings.paymentMethods.length > 0
                ? Math.max(...settings.paymentMethods.map(m => m.displayOrder || 0)) + 1
                : 1);

        settings.paymentMethods.push({
            name: name.trim(),
            type: type || 'Bank',
            accountTitle: accountTitle || '',
            accountNumber: accountNumber || '',
            iban: iban || '',
            icon: icon || '',
            logo: logo || '',
            qrCode: qrCode || '',
            displayOrder: order,
            enabled: enabled !== undefined ? enabled : true,
            fields: fields || [],
        });

        await settings.save();

        res.status(201).json({
            success: true,
            message: "Payment method added successfully.",
            data: buildPaymentSettingsResponse(settings)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.updatePaymentMethod = async (req, res) => {
    try {

        const settings = await PaymentSettings.getSingleton();

        const method = settings.paymentMethods.id(req.params.id);

        if (!method) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found."
            });
        }

        const { name, type, accountTitle, accountNumber, iban, icon, logo, qrCode, displayOrder, enabled, fields } = req.body;

        if (name !== undefined) method.name = name;
        if (type !== undefined) method.type = type;
        if (accountTitle !== undefined) method.accountTitle = accountTitle;
        if (accountNumber !== undefined) method.accountNumber = accountNumber;
        if (iban !== undefined) method.iban = iban;
        if (icon !== undefined) method.icon = icon;
        if (logo !== undefined) method.logo = logo;
        if (qrCode !== undefined) method.qrCode = qrCode;
        if (displayOrder !== undefined) method.displayOrder = Number(displayOrder);
        if (enabled !== undefined) method.enabled = enabled;
        if (fields !== undefined) method.fields = fields;

        await settings.save();

        res.json({
            success: true,
            message: "Payment method updated successfully.",
            data: buildPaymentSettingsResponse(settings)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.deletePaymentMethod = async (req, res) => {
    try {

        const settings = await PaymentSettings.getSingleton();

        const method = settings.paymentMethods.id(req.params.id);

        if (!method) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found."
            });
        }

        method.deleteOne();

        await settings.save();

        res.json({
            success: true,
            message: "Payment method deleted successfully.",
            data: buildPaymentSettingsResponse(settings)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.updateInstructions = async (req, res) => {
    try {

        const settings = await PaymentSettings.getSingleton();

        settings.instructions = req.body.instructions || "";

        await settings.save();

        res.json({
            success: true,
            message: "Instructions updated successfully.",
            data: buildPaymentSettingsResponse(settings)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.updateDefaultPaymentMethod = async (req, res) => {
    try {
        const settings = await PaymentSettings.getSingleton();
        settings.defaultPaymentMethod = req.body.defaultPaymentMethod || "cod";
        await settings.save();

        res.json({
            success: true,
            message: "Default payment method updated successfully.",
            data: buildPaymentSettingsResponse(settings)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Upload QR code and/or custom logo for a payment method
exports.uploadPaymentMethodImages = async (req, res) => {
    try {
        const settings = await PaymentSettings.getSingleton();
        const method = settings.paymentMethods.id(req.params.id);

        if (!method) {
            return res.status(404).json({ success: false, message: "Payment method not found." });
        }

        const files = req.files || {};

        // Upload QR code
        if (files.qrCode && files.qrCode[0]) {
            const result = await uploadToCloudinary(files.qrCode[0].buffer, "payment-methods/qr");
            method.qrCode = result.secure_url;
        }

        // Upload custom logo
        if (files.logo && files.logo[0]) {
            const result = await uploadToCloudinary(files.logo[0].buffer, "payment-methods/logos");
            method.logo = result.secure_url;
        }

        await settings.save();

        res.json({
            success: true,
            message: "Payment method images uploaded successfully.",
            data: buildPaymentSettingsResponse(settings)
        });

    } catch (err) {
        console.error("Upload payment images error:", err);
        res.status(500).json({ success: false, message: "Failed to upload images." });
    }
};

// Batch update display order for all payment methods
exports.reorderPaymentMethods = async (req, res) => {
    try {
        const { order } = req.body; // Array of { id, displayOrder }

        if (!Array.isArray(order)) {
            return res.status(400).json({ success: false, message: "Order array is required." });
        }

        const settings = await PaymentSettings.getSingleton();

        for (const item of order) {
            const method = settings.paymentMethods.id(item.id);
            if (method) {
                method.displayOrder = Number(item.displayOrder) || 0;
            }
        }

        await settings.save();

        res.json({
            success: true,
            message: "Payment methods reordered successfully.",
            data: buildPaymentSettingsResponse(settings)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};