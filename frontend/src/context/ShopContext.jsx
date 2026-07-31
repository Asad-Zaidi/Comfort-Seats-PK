import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "../components/ToastNotification";
import { getProductImageObjects } from "../utils/imageUtils";
import { getColorName } from "../utils/ColorName";

const ShopContext = createContext();

const CART_STORAGE_KEY = "comfort_seats_cart_session";
const WISHLIST_STORAGE_KEY = "comfort_seats_wishlist_session";

// Helper to resolve the best image URL for a product item
export const resolveProductImage = (product, selectedColor, selectedStandType) => {
    if (!product) return '';
    try {
        const imageObjs = getProductImageObjects(product, { selectedColor, selectedStandType });
        if (Array.isArray(imageObjs) && imageObjs.length > 0 && imageObjs[0]?.url) {
            return imageObjs[0].url;
        }
    } catch (e) {
        console.error("Error resolving variant image:", e);
    }

    if (typeof product.image === 'string' && product.image) return product.image;
    if (product.image && typeof product.image === 'object' && product.image.url) return product.image.url;

    if (Array.isArray(product.images) && product.images.length > 0) {
        const img = product.images[0];
        const url = typeof img === 'string' ? img : (img?.url || img?.preview || '');
        if (url) return url;
    }

    if (Array.isArray(product.productImages) && product.productImages.length > 0) {
        const img = product.productImages[0];
        const url = typeof img === 'string' ? img : (img?.url || img?.preview || '');
        if (url) return url;
    }

    if (Array.isArray(product.colors) && product.colors.length > 0) {
        for (const col of product.colors) {
            if (Array.isArray(col.images) && col.images.length > 0) {
                const img = col.images[0];
                const url = typeof img === 'string' ? img : (img?.url || img?.preview || '');
                if (url) return url;
            }
        }
    }

    return '';
};

// Helper to resolve human-readable color name
export const resolveColorName = (colorValue, product) => {
    if (!colorValue) return '';
    if (product && Array.isArray(product.colors)) {
        const found = product.colors.find(c =>
            (c.hex && c.hex.toLowerCase() === colorValue.toLowerCase()) ||
            (c.name && c.name.toLowerCase() === colorValue.toLowerCase())
        );
        if (found && found.name) return found.name;
    }
    return getColorName(colorValue);
};

export const ShopProvider = ({ children }) => {
    const toast = useToast();

    // Initialize Cart from sessionStorage
    const [cart, setCart] = useState(() => {
        try {
            const saved = sessionStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (err) {
            console.error("Failed to parse cart from sessionStorage:", err);
            return [];
        }
    });

    // Initialize Wishlist from sessionStorage
    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = sessionStorage.getItem(WISHLIST_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (err) {
            console.error("Failed to parse wishlist from sessionStorage:", err);
            return [];
        }
    });

    // Sync Cart to sessionStorage
    useEffect(() => {
        try {
            sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (err) {
            console.error("Failed to save cart to sessionStorage:", err);
        }
    }, [cart]);

    // Sync Wishlist to sessionStorage
    useEffect(() => {
        try {
            sessionStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
        } catch (err) {
            console.error("Failed to save wishlist to sessionStorage:", err);
        }
    }, [wishlist]);

    // Cart Handlers
    const addToCart = (productData) => {
        const { product, quantity = 1, selectedColor, selectedSize, selectedStandType, price, priceCalculation } = productData;
        if (!product) return;

        const colorKey = selectedColor || 'default';
        const sizeKey = selectedSize || 'default';
        const standKey = selectedStandType || 'default';
        const itemId = `${product._id || product.id || product.name}_${colorKey}_${sizeKey}_${standKey}`;

        const imageUrl = resolveProductImage(product, selectedColor, selectedStandType);
        const colorName = resolveColorName(selectedColor, product);

        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex((item) => item.id === itemId);
            if (existingIndex > -1) {
                const updated = [...prevCart];
                updated[existingIndex].quantity += quantity;
                // Update image if missing
                if (!updated[existingIndex].image && imageUrl) {
                    updated[existingIndex].image = imageUrl;
                }
                return updated;
            } else {
                return [
                    ...prevCart,
                    {
                        id: itemId,
                        product,
                        productId: product._id || product.id,
                        name: product.name,
                        image: imageUrl,
                        price: price || product.price || 0,
                        quantity,
                        selectedColor,
                        colorName: colorName || selectedColor,
                        selectedSize,
                        selectedStandType,
                        priceCalculation,
                        addedAt: Date.now(),
                    },
                ];
            }
        });

        if (toast && typeof toast.success === 'function') {
            toast.success(`${product.name || 'Item'} added to cart!`);
        }

        const productId = product._id || product.id;
        const itemPrice = price || product.price || 0;
        if (window.fbq && productId) {
            window.fbq("track", "AddToCart", {
                content_ids: [String(productId)],
                content_name: product.name || '',
                content_type: "product",
                value: Number(itemPrice) || 0,
                currency: "PKR"
            });
        }
    };

    const removeFromCart = (itemId) => {
        setCart((prev) => prev.filter((item) => item.id !== itemId));
        if (toast && typeof toast.info === 'function') {
            toast.info("Item removed from cart");
        }
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Wishlist Handlers
    const toggleWishlist = (product) => {
        if (!product) return;
        const productId = product._id || product.id || product.name;
        const isSaved = wishlist.some((item) => (item._id || item.id || item.name) === productId);

        if (isSaved) {
            setWishlist((prev) => prev.filter((item) => (item._id || item.id || item.name) !== productId));
            if (toast && typeof toast.info === 'function') {
                toast.info("Removed from favorites");
            }
        } else {
            setWishlist((prev) => [...prev, product]);
            if (toast && typeof toast.success === 'function') {
                toast.success("Added to favorites!");
            }
            if (window.fbq && productId) {
                window.fbq("track", "AddToWishlist", {
                    content_ids: [String(productId)],
                    content_name: product.name || '',
                    value: Number(product.price || 0),
                    currency: "PKR"
                });
            }
        }
    };

    const isInWishlist = (productId) => {
        if (!productId) return false;
        return wishlist.some((item) => (item._id || item.id || item.name) === productId);
    };

    const removeFromWishlist = (productId) => {
        setWishlist((prev) => prev.filter((item) => (item._id || item.id || item.name) !== productId));
    };

    const wishlistCount = wishlist.length;

    return (
        <ShopContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                wishlist,
                toggleWishlist,
                isInWishlist,
                removeFromWishlist,
                wishlistCount,
            }}
        >
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) {
        throw new Error("useShop must be used within a ShopProvider");
    }
    return context;
};
