/**
 * Shared Image Selection Utility
 * 
 * Provides consistent image-selection logic for ProductCard, ProductDetail,
 * and any other component that needs to display product images.
 * 
 * Handles:
 * - General product images (productImages array with isCover flag)
 * - Color variant images (per-color images with isCover flag)
 * - Stand type images (if applicable)
 * - Legacy image formats (images array, imageUrl, colorVariants)
 * - Cover image detection and fallback
 * - Hover image determination
 */

/**
 * Extract a flat array of image URLs from product data.
 * Preserves the original order and metadata.
 * 
 * @param {Object} product - The product object
 * @param {Object} [options] - Options
 * @param {string} [options.selectedColor] - Selected color hex or name
 * @param {string} [options.selectedStandType] - Selected stand type
 * @returns {Array<{url: string, isCover: boolean}>} Array of image objects with url and isCover
 */
const sortWithCoverFirst = (images) => {
    if (!Array.isArray(images) || images.length <= 1) return images;
    const coverIdx = images.findIndex(img => img.isCover === true);
    if (coverIdx <= 0) return images;
    const coverImg = images[coverIdx];
    const rest = images.filter((_, idx) => idx !== coverIdx);
    return [coverImg, ...rest];
};

/**
 * Get the designated default color variant for a product.
 * Returns color where isDefault === true, falling back to the first color.
 * 
 * @param {Object} product - The product object
 * @returns {Object|null} The default color variant object or null
 */
export const getDefaultColorVariant = (product) => {
    if (!product || !Array.isArray(product.colors) || product.colors.length === 0) {
        return null;
    }
    const defaultColor = product.colors.find(c => c.isDefault === true);
    return defaultColor || product.colors[0] || null;
};

export const getProductImageObjects = (product, options = {}) => {
    if (!product) return [];

    const { selectedColor, selectedStandType, activeVariantSource = 'color' } = options;

    const targetColorKey = selectedColor || (() => {
        const def = getDefaultColorVariant(product);
        return def ? (def.hex || def.name) : null;
    })();

    const getStandImages = () => {
        if (selectedStandType && Array.isArray(product.standTypes) && product.standTypes.length > 0) {
            const stand = product.standTypes.find(st => st.type === selectedStandType || st.type === 'Metallic');
            if (stand?.images && Array.isArray(stand.images) && stand.images.length > 0) {
                const formatted = stand.images.map(img => ({
                    url: typeof img === 'string' ? img : (img.url || img.preview || ''),
                    isCover: typeof img === 'object' ? (img.isCover === true) : false,
                })).filter(img => img.url);
                if (formatted.length > 0) return sortWithCoverFirst(formatted);
            }
        }

        if (selectedStandType && Array.isArray(product.metallicStandImages) && product.metallicStandImages.length > 0) {
            const formatted = product.metallicStandImages.map(img => ({
                url: typeof img === 'string' ? img : (img.url || img.preview || ''),
                isCover: typeof img === 'object' ? (img.isCover === true) : false,
            })).filter(img => img.url);
            if (formatted.length > 0) return sortWithCoverFirst(formatted);
        }

        return null;
    };

    const getColorImages = () => {
        if (targetColorKey && Array.isArray(product.colors) && product.colors.length > 0) {
            const colorVariant = product.colors.find(c =>
                c.hex === targetColorKey || c.name === targetColorKey
            );
            if (colorVariant && Array.isArray(colorVariant.images) && colorVariant.images.length > 0) {
                const formatted = colorVariant.images.map(img => ({
                    url: img.url || img,
                    isCover: img.isCover === true,
                })).filter(img => img.url);
                if (formatted.length > 0) return sortWithCoverFirst(formatted);
            }
        }
        return null;
    };

    // Evaluate primary and secondary sources based on activeVariantSource
    const primaryFn = activeVariantSource === 'standType' ? getStandImages : getColorImages;
    const secondaryFn = activeVariantSource === 'standType' ? getColorImages : getStandImages;

    const primaryImages = primaryFn();
    if (primaryImages && primaryImages.length > 0) return primaryImages;

    const secondaryImages = secondaryFn();
    if (secondaryImages && secondaryImages.length > 0) return secondaryImages;

    // Priority 3: General productImages array with isCover metadata
    if (Array.isArray(product.productImages) && product.productImages.length > 0) {
        const formatted = product.productImages.map(img => ({
            url: img.url || img,
            isCover: img.isCover === true,
        })).filter(img => img.url);
        return sortWithCoverFirst(formatted);
    }

    // Legacy: images array (strings)
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images.filter(Boolean).map(url => ({
            url,
            isCover: url === product.coverImage,
        }));
    }

    // Legacy: single imageUrl
    if (product.imageUrl) {
        return [{ url: product.imageUrl, isCover: true }];
    }

    return [];
};

/**
 * Extract a flat array of image URLs (strings only) from product data.
 * This is a convenience wrapper around getProductImageObjects.
 * 
 * @param {Object} product - The product object
 * @param {Object} [options] - Options (same as getProductImageObjects)
 * @returns {string[]} Array of image URLs
 */
export const extractProductImages = (product, options = {}) => {
    return getProductImageObjects(product, options).map(img => img.url);
};

/**
 * Find the index of the cover image in the images array.
 * 
 * @param {Array<{url: string, isCover: boolean}>} imageObjects - Array of image objects
 * @returns {number} Index of the cover image, or 0 if none found
 */
export const getCoverImageIndex = (imageObjects) => {
    if (!imageObjects || imageObjects.length === 0) return 0;
    const coverIndex = imageObjects.findIndex(img => img.isCover === true);
    return coverIndex >= 0 ? coverIndex : 0;
};

/**
 * Get the primary (cover) image URL.
 * 
 * @param {Object} product - The product object
 * @param {Object} [options] - Options
 * @returns {string} The cover image URL, or first available image, or empty string
 */
export const getPrimaryImage = (product, options = {}) => {
    const images = getProductImageObjects(product, options);
    if (images.length === 0) return '';
    const coverIndex = getCoverImageIndex(images);
    return images[coverIndex]?.url || images[0]?.url || '';
};

/**
 * Get the hover image URL for product cards.
 * 
 * Logic:
 * - If there's only one image, return null (no hover effect)
 * - Find the cover image index
 * - Return the next image after the cover image
 * - If cover is the last image, return the first non-cover image
 * 
 * @param {Object} product - The product object
 * @param {Object} [options] - Options
 * @returns {string|null} The hover image URL, or null if not available
 */
export const getHoverImage = (product, options = {}) => {
    const images = getProductImageObjects(product, options);
    if (images.length <= 1) return null;

    const coverIndex = getCoverImageIndex(images);

    // Try to get the next image after the cover
    let hoverIndex = coverIndex + 1;
    if (hoverIndex >= images.length) {
        // Cover is the last image, wrap to the first non-cover image
        hoverIndex = 0;
        // If the first image is also the cover, try the next one
        if (hoverIndex === coverIndex) {
            hoverIndex = 1;
        }
    }

    return images[hoverIndex]?.url || null;
};

/**
 * Get the complete image data for a ProductCard.
 * Returns the primary image, hover image, and all image objects.
 * 
 * @param {Object} product - The product object
 * @param {Object} [options] - Options
 * @returns {{ primaryImage: string, hoverImage: string|null, images: Array<{url: string, isCover: boolean}> }}
 */
export const getProductCardImages = (product, options = {}) => {
    const images = getProductImageObjects(product, options);
    const coverIndex = getCoverImageIndex(images);
    const primaryImage = images[coverIndex]?.url || images[0]?.url || '';
    const hoverImage = getHoverImage(product, options);

    return {
        primaryImage,
        hoverImage,
        images,
    };
};

/**
 * Check if a product has stand type images.
 * 
 * @param {Object} product - The product object
 * @returns {boolean} True if product has at least one stand type with images
 */
export const hasStandTypeImages = (product) => {
    if (!product?.standTypes || !Array.isArray(product.standTypes)) return false;
    return product.standTypes.some(st => st.images && Array.isArray(st.images) && st.images.length > 0);
};

/**
 * Get all unique image URLs from all stand types.
 * 
 * @param {Object} product - The product object
 * @returns {string[]} Array of unique image URLs from all stand types
 */
export const getAllStandTypeImageUrls = (product) => {
    if (!product?.standTypes || !Array.isArray(product.standTypes)) return [];
    const urls = new Set();
    product.standTypes.forEach(st => {
        if (st.images && Array.isArray(st.images)) {
            st.images.forEach(img => {
                const url = typeof img === 'string' ? img : img.url;
                if (url) urls.add(url);
            });
        }
    });
    return Array.from(urls);
};

/**
 * Get the initial active index for a product detail page.
 * This should be the cover image index.
 * 
 * @param {Object} product - The product object
 * @param {Object} [options] - Options
 * @returns {number} The index of the cover image
 */
export const getInitialActiveIndex = (product, options = {}) => {
    const images = getProductImageObjects(product, options);
    return getCoverImageIndex(images);
};