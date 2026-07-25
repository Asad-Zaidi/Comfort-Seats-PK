/**
 * Shared Price Calculator Utility
 * 
 * Centralizes all price calculation logic for:
 * - ProductCard
 * - ProductDetail
 * - Checkout
 * - OrderModal
 * - Any other component needing price calculations
 * 
 * This ensures consistent pricing across the application.
 */

/**
 * Get the effective base price for a product considering discount settings.
 * 
 * @param {Object} product - The product object
 * @param {number} product.actualPrice - The actual/original price
 * @param {number} product.discountPrice - The discounted price (if discount enabled)
 * @param {boolean} product.isDiscountEnabled - Whether discount is enabled
 * @param {number} product.price - Fallback price (for backward compatibility)
 * @returns {{ effectivePrice: number, actualPrice: number, discountPrice: number, isDiscountEnabled: boolean, discountPercentage: number }}
 */
export function getEffectivePricing(product) {
    if (!product) {
        return {
            effectivePrice: 0,
            actualPrice: 0,
            discountPrice: 0,
            isDiscountEnabled: false,
            discountPercentage: 0,
        };
    }

    const actualPrice = Number(product.actualPrice || product.price || 0);
    const discountPrice = Number(product.discountPrice || 0);
    const isDiscountEnabled = product.isDiscountEnabled === true;

    let effectivePrice = actualPrice;
    
    if (isDiscountEnabled && discountPrice > 0 && discountPrice <= actualPrice) {
        effectivePrice = discountPrice;
    }

    const discountPercentage = isDiscountEnabled && actualPrice > 0
        ? Math.round(((actualPrice - discountPrice) / actualPrice) * 100)
        : 0;

    return {
        effectivePrice,
        actualPrice,
        discountPrice,
        isDiscountEnabled,
        discountPercentage,
    };
}

/**
 * Calculate the total price including color and stand type add-ons.
 * 
 * Formula:
 *   Total = Effective Base Price + Selected Color Price + Selected Stand Type Price
 * 
 * @param {Object} product - The product object
 * @param {string|null} selectedColor - The selected color hex/name
 * @param {string|null} selectedStandType - The selected stand type
 * @param {boolean} useDiscount - Whether to use discount price if enabled
 * @returns {{ total: number, basePrice: number, colorPrice: number, standPrice: number, discountPercentage: number, isDiscountEnabled: boolean, actualTotal: number }}
 */
export function calculateTotalPrice(product, selectedColor = null, selectedStandType = null, useDiscount = true) {
    if (!product) {
        return {
            total: 0,
            basePrice: 0,
            colorPrice: 0,
            standPrice: 0,
            discountPercentage: 0,
            isDiscountEnabled: false,
            actualTotal: 0,
        };
    }

    const pricing = useDiscount ? getEffectivePricing(product) : { 
        ...getEffectivePricing(product), 
        effectivePrice: getEffectivePricing(product).actualPrice 
    };
    
    let basePrice = pricing.effectivePrice;
    let actualBasePrice = pricing.actualPrice;
    let colorPrice = 0;
    let standPrice = 0;

    // Color add-on price
    if (selectedColor && Array.isArray(product.colors)) {
        const colorVariant = product.colors.find(c =>
            c.hex === selectedColor || c.name === selectedColor
        );
        if (colorVariant && colorVariant.price !== undefined && colorVariant.price !== null) {
            const cp = Number(colorVariant.price) || 0;
            const bp = Number(basePrice || 0);
            const abp = Number(actualBasePrice || 0);
            if (cp === bp || cp === abp || cp === 0) {
                colorPrice = 0;
            } else {
                colorPrice = cp;
            }
        }
    }

    // Stand type add-on price
    if (selectedStandType && Array.isArray(product.standTypes)) {
        const stand = product.standTypes.find(st => st.type === selectedStandType);
        if (stand && stand.price) {
            standPrice = Number(stand.price);
        }
    }

    const total = basePrice + colorPrice + standPrice;
    const actualTotal = actualBasePrice + colorPrice + standPrice;

    return {
        total,
        basePrice,
        colorPrice,
        standPrice,
        discountPercentage: pricing.discountPercentage,
        isDiscountEnabled: pricing.isDiscountEnabled,
        actualTotal,
    };
}

/**
 * Format a number as currency (Rs. X,XXX)
 * @param {number} amount 
 * @returns {string}
 */
export function formatPrice(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '0';
    return Number(amount).toLocaleString('en-PK');
}

/**
 * Get discount percentage display text
 * @param {number} percentage 
 * @returns {string}
 */
export function getDiscountText(percentage) {
    return `${percentage}% OFF`;
}

/**
 * Build the order product object with discount info for API calls
 * @param {Object} product 
 * @param {number} displayPrice 
 * @param {string|null} selectedColor 
 * @param {string|null} selectedSize 
 * @param {string|null} selectedStandType 
 * @returns {Object}
 */
export function buildOrderProduct(product, displayPrice, selectedColor, selectedSize, selectedStandType) {
    const pricing = getEffectivePricing(product);
    return {
        productId: product?._id || null,
        name: product?.name || '',
        price: displayPrice || 0,
        imageUrl: product?.imageUrl || '',
        color: selectedColor || '',
        size: selectedSize || '',
        selectedStandType: selectedStandType || '',
        actualPrice: pricing.actualPrice,
        discountPrice: pricing.isDiscountEnabled ? pricing.discountPrice : 0,
        isDiscountEnabled: pricing.isDiscountEnabled,
    };
}