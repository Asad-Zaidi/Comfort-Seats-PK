import { useCallback } from "react";
import { sendEvent } from "../services/analyticsService";

export const useAnalytics = () => {
    const trackEvent = useCallback((eventName, payload = {}) => {
        return sendEvent(eventName, payload);
    }, []);

    const trackProductView = useCallback((product) => {
        if (!product) return;
        return sendEvent("product_view", {
            productId: product._id || product.id,
            productName: product.name,
            category: Array.isArray(product.category) ? product.category[0] : product.category,
        });
    }, []);

    const trackAddToCart = useCallback((product, quantity = 1, selectedColor = null) => {
        if (!product) return;
        return sendEvent("add_to_cart", {
            productId: product._id || product.id,
            productName: product.name,
            payload: { quantity, selectedColor },
        });
    }, []);

    const trackBuyNow = useCallback((product, quantity = 1, selectedColor = null) => {
        if (!product) return;
        return sendEvent("buy_now", {
            productId: product._id || product.id,
            productName: product.name,
            payload: { quantity, selectedColor },
        });
    }, []);

    const trackWishlist = useCallback((product) => {
        if (!product) return;
        return sendEvent("wishlist_toggle", {
            productId: product._id || product.id,
            productName: product.name,
        });
    }, []);

    const trackSearch = useCallback((query, resultCount = 0) => {
        if (!query) return;
        return sendEvent("search_performed", {
            payload: { query, resultCount },
        });
    }, []);

    return {
        trackEvent,
        trackProductView,
        trackAddToCart,
        trackBuyNow,
        trackWishlist,
        trackSearch,
    };
};

export default useAnalytics;
