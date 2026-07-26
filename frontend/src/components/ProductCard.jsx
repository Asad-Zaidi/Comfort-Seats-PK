import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getEffectivePricing, formatPrice } from "../utils/priceCalculator";

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

    // Use shared price calculator for discount-aware pricing
    const pricing = getEffectivePricing(product || { price });
    const displayPrice = pricing.effectivePrice;
    const actualPrice = pricing.actualPrice;
    const showDiscount = pricing.isDiscountEnabled && pricing.discountPercentage > 0;

    return (
        <Link
            to={to}
            className="group flex flex-col h-full w-full max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Product Image */}
            <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                {/* Category Badge - Top Left */}
                {category && (
                    <div className="absolute left-3 top-3 z-10">
                        <Link
                            to={`/products?category=${encodeURIComponent(typeof category === 'string' ? category : (Array.isArray(category) ? category[0] : ''))}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block rounded-full bg-[#2F6FED]/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm transition hover:bg-[#2F6FED]"
                        >
                            {typeof category === 'string' ? category : (Array.isArray(category) ? category[0] : '')}
                        </Link>
                    </div>
                )}
                {/* Product Badges - Top Right (stacked vertically) */}
                <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
                    {product?.isNewArrival && (
                        <span className="inline-block rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                            New
                        </span>
                    )}
                    {product?.isBestSeller && (
                        <span className="inline-block rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                            Best Seller
                        </span>
                    )}
                    {product?.isFeatured && (
                        <span className="inline-block rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                            Featured
                        </span>
                    )}
                    {showDiscount && (
                        <span className="inline-block rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
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
                    <h3 className="text-lg font-semibold text-gray-800 leading-6 line-clamp-3">
                        {name}
                    </h3>

                    <div className="flex flex-col items-end shrink-0">
                        {showDiscount ? (
                            <>
                                <span className="text-xl font-bold text-red-500 whitespace-nowrap">
                                    Rs. {formatPrice(displayPrice)}
                                </span>
                                <span className="text-sm text-gray-400 line-through whitespace-nowrap">
                                    Rs. {formatPrice(actualPrice)}
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
                                Rs. {formatPrice(displayPrice)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="relative mt-3 h-12 overflow-hidden">
                    <p className="text-sm text-gray-500 leading-6">
                        {description}
                    </p>

                    {/* Fade Effect */}
                    <div className="absolute bottom-0 left-0 w-full h-6"></div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-4">
                    <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} />
                        ))}
                    </div>

                    <span className="text-sm font-semibold text-gray-700">
                        {rating}
                    </span>

                    <span className="text-sm text-gray-400">
                        ({reviews})
                    </span>
                </div>

                {/* Push Button to Bottom */}
                <div className="mt-auto pt-6">
                    <motion.span whileTap={{ scale: 0.97 }} className={`block w-full py-3 rounded-xl text-white text-center font-semibold tracking-wide transition-all duration-300 ${isCustomizable ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-orange-500'}`}>
                        {isCustomizable ? "Customize Now" : "Buy Now"}
                    </motion.span>
                </div>

            </div>
        </Link>
    );
};

export default ProductCard;