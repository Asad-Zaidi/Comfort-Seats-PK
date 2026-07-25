/**
 * Generate a WhatsApp message for product customization inquiry.
 * This utility creates a professional pre-filled message with complete product configuration.
 */

const generateCustomizationMessage = ({
    productName,
    productSku,
    category,
    brand,
    selectedColor,
    selectedStandType,
    quantity,
    calculatedPrice,
    productUrl,
    siteName = 'Comfort Seats',
}) => {
    const lines = [
        'Hello,',
        '',
        'I would like to customize the following product.',
        '',
        'Product:',
        productName || 'N/A',
        '',
    ];

    if (productSku) {
        lines.push('SKU:', productSku, '');
    }

    if (category) {
        lines.push('Category:', category, '');
    }

    lines.push('Brand:', brand || siteName, '');

    if (selectedColor) {
        lines.push('Selected Color:', selectedColor, '');
    }

    if (selectedStandType) {
        lines.push('Selected Stand Type:', selectedStandType, '');
    }

    lines.push('Quantity:', String(quantity || 1), '');

    if (calculatedPrice !== undefined && calculatedPrice !== null) {
        lines.push('Calculated Price:', `Rs. ${calculatedPrice}`, '');
    }

    if (productUrl) {
        lines.push('Product Link:', productUrl, '');
    }

    lines.push('I would like to discuss customization options for this product.');
    lines.push('');
    lines.push('Thank you.');

    return lines.join('\n');
};

/**
 * Get the WhatsApp number from environment or config.
 * Falls back to a default if not configured.
 */
const getWhatsAppNumber = () => {
    return process.env.WHATSAPP_NUMBER || process.env.REACT_APP_WHATSAPP_NUMBER || '';
};

/**
 * Build a full WhatsApp click-to-chat URL with the encoded message.
 */
const buildWhatsAppUrl = (message, phoneNumber) => {
    const number = phoneNumber || getWhatsAppNumber();
    if (!number) return null;
    const cleaned = number.replace(/[^\d]/g, '');
    if (!cleaned) return null;
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
};

module.exports = {
    generateCustomizationMessage,
    getWhatsAppNumber,
    buildWhatsAppUrl,
};