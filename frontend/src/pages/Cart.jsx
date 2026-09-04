import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { useShop, resolveProductImage, resolveColorName, isProductUnavailable } from "../context/ShopContext";
import { formatPrice } from "../utils/priceCalculator";
import { isHexColor } from "../utils/ColorName";
import { useToast } from "../components/ToastNotification";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import Footer from "../components/Footer";
import PageTransition from "../components/animations/PageTransition";
import { useSiteConfig } from "../utils/siteConfig";

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart } = useShop();
    const navigate = useNavigate();
    const toast = useToast();
    const { siteUrl, siteName } = useSiteConfig();

    // Checkbox selection state (array of selected item IDs)
    const [selectedItemIds, setSelectedItemIds] = useState(() => cart.map((i) => i.id));

    // Keep selected IDs updated when cart changes
    useEffect(() => {
        setSelectedItemIds((prev) => {
            const currentCartIds = new Set(cart.map((i) => i.id));
            const retained = prev.filter((id) => currentCartIds.has(id));
            cart.forEach((item) => {
                if (!prev.includes(item.id)) {
                    retained.push(item.id);
                }
            });
            return retained;
        });
    }, [cart]);



    const isAllSelected = cart.length > 0 && selectedItemIds.length === cart.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItemIds([]);
        } else {
            setSelectedItemIds(cart.map((i) => i.id));
        }
    };

    const toggleSelectItem = (itemId) => {
        setSelectedItemIds((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    // Calculate subtotal & item count for ONLY selected items
    const selectedCartItems = cart.filter((item) => selectedItemIds.includes(item.id));
    const selectedCartTotal = selectedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const selectedCartCount = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleProceedToCheckout = () => {
        if (selectedCartItems.length === 0) {
            if (toast && typeof toast.error === "function") {
                toast.error("Please select at least one item for checkout.");
            }
            return;
        }
        if (selectedCartItems.some(item => isProductUnavailable(item.product, item.selectedColor))) {
            toast.error("One or more selected products are currently sold out.");
            return;
        }
        // Pass ONLY selected cart items to checkout
        navigate("/checkout", {
            state: {
                cartItems: selectedCartItems,
                totalAmount: selectedCartTotal,
                isMultiItem: true,
            },
        });
    };

    return (
        <PageTransition>
            <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
                <SEO
                    title={`Cart - ${siteName}`}
                    description={`Your cart: ${cart.length} items. Review before checkout.`}
                    canonicalUrl={`${siteUrl}/cart`}
                />

                <div className="mx-auto max-w-full px-5 py-8 lg:px-32">
                    <Breadcrumb items={[{ label: "Cart" }]} />

                    <div className="mt-6 flex items-center justify-between border-b pb-5" style={{ borderColor: 'var(--border)' }}>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                            Shopping Cart
                            {cart.length > 0 && (
                                <span className="ml-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}>
                                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                                </span>
                            )}
                        </h1>
                    </div>

                    {cart.length === 0 ? (
                        /* Empty Cart State */
                        <div className="my-20 flex flex-col items-center justify-center text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-6">
                                <FiShoppingBag size={42} />
                            </div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Your cart is empty</h2>
                            <p className="mt-2 max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Looks like you haven't added any products to your cart yet. Explore our premium seating collections and find your perfect chair!
                            </p>
                            <Link
                                to="/products"
                                className="mt-8 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold shadow-lg transition-all duration-300 hover:opacity-90"
                                style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}
                            >
                                Explore Products
                                <FiArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        /* Cart Content Grid */
                        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
                            {/* Items List (8 cols) */}
                            <div className="space-y-4 lg:col-span-8">
                                {/* Select All Bar */}
                                <div className="flex items-center justify-between rounded-2xl border p-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                    <label className="flex items-center gap-3 cursor-pointer select-none font-semibold text-sm" style={{ color: 'var(--text)' }}>
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)] cursor-pointer"
                                        />
                                        <span>Select All ({selectedCartItems.length}/{cart.length} selected)</span>
                                    </label>

                                    <button
                                        onClick={clearCart}
                                        className="text-xs font-semibold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Clear Cart
                                    </button>
                                </div>

                                {/* Cart Item Cards */}
                                {cart.map((item) => {
                                    const itemImg = item.image || resolveProductImage(item.product, item.selectedColor, item.selectedStandType);
                                    const displayColorName = resolveColorName(item.selectedColor, item.product) || item.colorName || item.selectedColor;
                                    const isSelected = selectedItemIds.includes(item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex flex-col gap-4 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between transition-all duration-300 ${isSelected ? 'ring-2 ring-[var(--primary)]/40' : 'opacity-70'
                                                }`}
                                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                                        >
                                            {/* Checkbox & Product Details */}
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectItem(item.id)}
                                                    className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] cursor-pointer flex-shrink-0"
                                                    aria-label={`Select ${item.name}`}
                                                />

                                                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                                                    {itemImg ? (
                                                        <img
                                                            src={itemImg}
                                                            alt={item.name}
                                                            className="h-full w-full object-contain object-center"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-0.5">
                                                    <Link
                                                        to={item.product?.category && item.product?.slug ? `/products/${Array.isArray(item.product.category) ? item.product.category[0] : item.product.category}/${item.product.slug}` : `/products`}
                                                        className="text-sm font-bold hover:underline line-clamp-1"
                                                        style={{ color: 'var(--text)' }}
                                                    >
                                                        {item.name}
                                                    </Link>

                                                    {/* Variant Badges */}
                                                    <div className="flex flex-wrap gap-2 text-xs">
                                                        {item.selectedColor && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                                                Color:
                                                                {isHexColor(item.selectedColor) && (
                                                                    <span className="h-2 w-2 rounded-full border border-black/10 inline-block shrink-0" style={{ backgroundColor: item.selectedColor }} />
                                                                )}
                                                                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                                                                    {displayColorName}
                                                                </span>
                                                            </span>
                                                        )}
                                                        {item.selectedSize && (
                                                            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                                                Size: <span className="font-semibold" style={{ color: 'var(--text)' }}>{item.selectedSize}</span>
                                                            </span>
                                                        )}
                                                        {item.selectedStandType && (
                                                            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                                                Stand: <span className="font-semibold" style={{ color: 'var(--text)' }}>{item.selectedStandType}</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                                                        {formatPrice(item.price)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Quantity & Actions */}
                                            <div className="flex items-center justify-between border-t pt-3 sm:border-t-0 sm:pt-0 sm:gap-6">
                                                {/* Quantity Selector */}
                                                <div className="flex items-center overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-bg)' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="flex h-9 w-9 items-center justify-center transition hover:opacity-75"
                                                        aria-label="Decrease quantity"
                                                        style={{ color: 'var(--text-secondary)' }}
                                                    >
                                                        <FiMinus size={14} />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-semibold" style={{ color: 'var(--text)' }}>
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="flex h-9 w-9 items-center justify-center transition hover:opacity-75"
                                                        aria-label="Increase quantity"
                                                        style={{ color: 'var(--text-secondary)' }}
                                                    >
                                                        <FiPlus size={14} />
                                                    </button>
                                                </div>

                                                {/* Item Subtotal */}
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400 block sm:hidden">Total</span>
                                                    <span className="font-bold text-base" style={{ color: 'var(--text)' }}>
                                                        {formatPrice(item.price * item.quantity)}
                                                    </span>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                                                    aria-label="Remove item"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Summary Sidebar (4 cols) */}
                            <div className="lg:col-span-4">
                                <div className="sticky top-24 rounded-2xl border p-6 shadow-sm space-y-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                    <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Order Summary</h2>

                                    <div className="space-y-3 text-sm border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                                        <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                                            <span>Subtotal ({selectedCartCount} {selectedCartCount === 1 ? 'item' : 'items'} selected)</span>
                                            <span className="font-medium" style={{ color: 'var(--text)' }}>{formatPrice(selectedCartTotal)}</span>
                                        </div>
                                        <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                                            <span>Standard Shipping</span>
                                            <span className="font-semibold text-green-600">FREE</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-lg font-bold" style={{ color: 'var(--text)' }}>
                                        <span>Total</span>
                                        <span style={{ color: 'var(--primary)' }}>{formatPrice(selectedCartTotal)}</span>
                                    </div>


                                    <button
                                        onClick={handleProceedToCheckout}
                                        disabled={selectedCartItems.length === 0}
                                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-base shadow-lg transition-all duration-300 ${selectedCartItems.length === 0
                                            ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
                                            : 'hover:opacity-90'
                                            }`}
                                        style={{
                                            backgroundColor: selectedCartItems.length > 0 ? 'var(--primary)' : undefined,
                                            color: selectedCartItems.length > 0 ? '#ffffff' : undefined,
                                        }}
                                    >
                                        Proceed to Checkout ({selectedCartItems.length})
                                        <FiArrowRight size={18} />
                                    </button>

                                    <Link
                                        to="/products"
                                        className="block text-center text-xs font-semibold text-gray-500 hover:underline pt-2"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default Cart;
