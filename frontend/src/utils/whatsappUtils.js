/**
 * Generate a WhatsApp message for product customization inquiry.
 * Uses centralized siteConfig for the WhatsApp number.
 * This is a pure utility - no React dependencies, works in any context.
 */

/**
 * Build a complete customization message string from product selections.
 * All parameters are optional - only provided values will be included.
 */
export const buildCustomizationMessage = ({
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
    const lines = [];

    lines.push('Hello,\n');
    lines.push('I would like to customize the following product.\n');
    lines.push('Product:');
    lines.push(productName || 'N/A');
    lines.push('');

    if (productSku) {
        lines.push('SKU:');
        lines.push(productSku);
        lines.push('');
    }

    if (category) {
        lines.push('Category:');
        lines.push(category);
        lines.push('');
    }

    lines.push('Brand:');
    lines.push(brand || siteName);
    lines.push('');

    if (selectedColor) {
        lines.push('Selected Color:');
        lines.push(selectedColor);
        lines.push('');
    }

    if (selectedStandType) {
        lines.push('Selected Stand Type:');
        lines.push(selectedStandType);
        lines.push('');
    }

    lines.push('Quantity:');
    lines.push(String(quantity || 1));
    lines.push('');

    if (calculatedPrice !== undefined && calculatedPrice !== null) {
        lines.push('Calculated Price:');
        lines.push(`Rs. ${calculatedPrice}`);
        lines.push('');
    }

    if (productUrl) {
        lines.push('Product Link:');
        lines.push(productUrl);
        lines.push('');
    }

    lines.push('I would like to discuss customization options for this product.\n');
    lines.push('Thank you.');

    return lines.join('\n');
};

/**
 * Build a WhatsApp click-to-chat URL.
 * @param {string} phoneNumber - The WhatsApp number (digits only, will be cleaned)
 * @param {string} message - The pre-encoded message text
 * @returns {string|null} The full WhatsApp URL, or null if no number
 */
export const buildWhatsAppUrl = (phoneNumber, message) => {
    if (!phoneNumber) return null;
    const cleaned = String(phoneNumber).replace(/[^\d]/g, '');
    if (!cleaned) return null;
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
};