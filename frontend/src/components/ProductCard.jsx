import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { calculateTotalPrice, formatPrice } from "../utils/priceCalculator";
import { stripHtml } from "../utils/sanitizeHtml";

const ProductCard = ({
    image,
    hoverImage,
    name,
    price,
    description,
    rating,
    reviews,
    to = "/product-detail",
    category,
    isCustomizable = false,
    product, // Full product object for discount-aware pricing
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const displayImage = isHovered && hoverImage ? hoverImage : image;

    // Use shared price calculator for discount-aware and default-color pricing
    const pricing = calculateTotalPrice(product || { price }, null, null, true);
    const displayPrice = pricing.total;
    const actualPrice = pricing.actualTotal;
    const showDiscount = pricing.isDiscountEnabled && pricing.discountPercentage > 0;

    const numReviews = Number(reviews) || 0;
    const numericRating = Number(rating) || 0;
    const hasReviews = numReviews > 0 && numericRating > 0;
    const roundedRating = hasReviews ? Math.round(numericRating) : 0;

    return (
        <Link
            to={to}
            className="group flex flex-col h-full w-full max-w-xl mx-auto rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300"
            style={{
                backgroundColor: 'var(--card-bg)',
                border: 'var(--card-border-width, 1px) solid var(--card-border)',
                borderRadius: 'var(--card-border-radius)',
                boxShadow: 'var(--card-shadow)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Product Image */}
            <div className="relative w-full aspect-square overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                {/* Category Badge - Top Left */}
                {category && (
                    <div className="absolute left-3 top-3 z-10">
                        <Link
                            to={`/products?category=${encodeURIComponent(typeof category === 'string' ? category : (Array.isArray(category) ? category[0] : ''))}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm transition"
                            style={{ backgroundColor: 'var(--primary)', color: 'var(--btn-primary-text, #fff)' }}
                        >
                            {typeof category === 'string' ? category : (Array.isArray(category) ? category[0] : '')}
                        </Link>
                    </div>
                )}
                {/* Product Badges - Top Right (stacked vertically) */}
                <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
                    {product?.isNewArrival && (
                        <span className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm" style={{ backgroundColor: 'var(--success)' }}>
                            New
                        </span>
                    )}
                    {product?.isBestSeller && (
                        <span className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm" style={{ backgroundColor: 'var(--secondary)' }}>
                            Best Seller
                        </span>
                    )}
                    {product?.isFeatured && (
                        <span className="inline-block rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                            Featured
                        </span>
                    )}
                    {showDiscount && (
                        <span className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm" style={{ backgroundColor: 'var(--error)' }}>
                            {pricing.discountPercentage}% OFF
                        </span>
                    )}
                </div>
                <motion.img
                    src={displayImage}
                    alt={`${name}${category ? ` - ${category}` : ''} - Comfort Seats pk`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-center object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imageLoaded ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">

                {/* Name & Price */}
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-lg font-semibold leading-6 line-clamp-3" style={{ color: 'var(--product-name-color, var(--text))' }}>
                        {name}
                    </h3>

                    <div className="flex flex-col items-end shrink-0">
                        {showDiscount ? (
                            <>
                                <span className="text-xl font-bold whitespace-nowrap" style={{ color: 'var(--product-discount-color, var(--error))' }}>
                                    Rs. {formatPrice(displayPrice)}
                                </span>
                                <span className="text-sm line-through whitespace-nowrap" style={{ color: 'var(--text-light)' }}>
                                    Rs. {formatPrice(actualPrice)}
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold whitespace-nowrap" style={{ color: 'var(--product-price-color, var(--primary))' }}>
                                Rs. {formatPrice(displayPrice)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="relative mt-3 h-12 overflow-hidden">
                    <p className="text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                        {stripHtml(description)}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-6"></div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-4">
                    <div className="flex text-sm gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                style={{
                                    color: i < roundedRating ? 'var(--rating-star-color, #F59E0B)' : 'var(--text-light, #D1D5DB)'
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {numericRating}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-light)' }}>
                        ({numReviews})
                    </span>
                </div>

                {/* Push Button to Bottom */}
                <div className="mt-auto pt-6">
                    <motion.span
                        whileTap={{ scale: 0.97 }}
                        className="block w-full py-3 rounded-xl text-center font-semibold tracking-wide transition-all duration-300"
                        style={{
                            backgroundColor: isCustomizable ? 'var(--btn-success-bg, #10B981)' : 'var(--btn-primary-bg, var(--primary))',
                            color: isCustomizable ? 'var(--btn-success-text, #fff)' : 'var(--btn-primary-text, #fff)',
                        }}
                    >
                        {isCustomizable ? "Customize Now" : "Buy Now"}
                    </motion.span>
                </div>

            </div>
        </Link>
    );
};

export default ProductCard;