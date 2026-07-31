import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiTrash2, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import { useShop, resolveProductImage } from "../context/ShopContext";
import { formatPrice, calculateTotalPrice } from "../utils/priceCalculator";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import Footer from "../components/Footer";
import PageTransition from "../components/animations/PageTransition";

const FavoriteProduct = () => {
    const { wishlist, removeFromWishlist, addToCart, wishlistCount } = useShop();

    return (
        <PageTransition>
            <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
                <SEO
                    title="Your Favorites - Comfort Seats PK"
                    description="View and manage your favorite furniture products saved during your session."
                />

                <div className="mx-auto max-w-full px-5 py-8 lg:px-32">
                    <Breadcrumb items={[{ label: "Favorites" }]} />

                    <div className="mt-6 flex items-center justify-between border-b pb-5" style={{ borderColor: 'var(--border)' }}>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                            Your Favorites
                            {wishlistCount > 0 && (
                                <span className="ml-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold text-white bg-red-500">
                                    {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
                                </span>
                            )}
                        </h1>
                    </div>

                    {wishlist.length === 0 ? (
                        /* Empty Wishlist State */
                        <div className="my-20 flex flex-col items-center justify-center text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-400 mb-6">
                                <FiHeart size={42} />
                            </div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>No favorite products saved</h2>
                            <p className="mt-2 max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
                                You haven't added any products to your wishlist yet. Click the heart icon on any product to save it here for your session!
                            </p>
                            <Link
                                to="/products"
                                className="mt-8 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold shadow-lg transition-all duration-300 hover:opacity-90"
                                style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}
                            >
                                Browse Products
                                <FiArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        /* Wishlist Grid */
                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {wishlist.map((product) => {
                                const productId = product._id || product.id;
                                const pricing = calculateTotalPrice(product, null, null, true);
                                const image = resolveProductImage(product);
                                const categoryName = typeof product.category === 'string' ? product.category : (Array.isArray(product.category) ? product.category[0] : '');

                                return (
                                    <div
                                        key={productId}
                                        className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg"
                                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                                    >
                                        {/* Image Container */}
                                        <div className="relative aspect-square w-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                                    No Image
                                                </div>
                                            )}

                                            {/* Category Tag */}
                                            {categoryName && (
                                                <span
                                                    className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider shadow-sm"
                                                    style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}
                                                >
                                                    {categoryName}
                                                </span>
                                            )}

                                            {/* Remove Button (Top Right) */}
                                            <button
                                                onClick={() => removeFromWishlist(productId)}
                                                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md text-red-500 transition hover:bg-red-500 hover:text-white"
                                                aria-label="Remove from favorites"
                                                title="Remove from favorites"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Details */}
                                        <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                                            <div>
                                                <Link
                                                    to={categoryName && product.slug ? `/products/${categoryName}/${product.slug}` : `/products`}
                                                    className="font-bold text-base hover:underline line-clamp-1"
                                                    style={{ color: 'var(--text)' }}
                                                >
                                                    {product.name}
                                                </Link>
                                                <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                                                    {product.description ? product.description.replace(/<[^>]*>?/gm, '') : 'Premium seating product from Comfort Seats PK.'}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                                                <div>
                                                    <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                                                        {formatPrice(pricing.total)}
                                                    </span>
                                                    {pricing.isDiscountEnabled && pricing.actualTotal > pricing.total && (
                                                        <span className="ml-2 text-xs line-through text-gray-400">
                                                            {formatPrice(pricing.actualTotal)}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => addToCart({ product, quantity: 1, price: pricing.total })}
                                                    className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white transition hover:opacity-90 shadow-sm"
                                                    style={{ backgroundColor: 'var(--primary)' }}
                                                >
                                                    <FiShoppingCart size={14} />
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default FavoriteProduct;
