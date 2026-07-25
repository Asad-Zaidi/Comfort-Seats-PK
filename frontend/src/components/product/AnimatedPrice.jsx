import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';
import { formatPrice } from '../../utils/priceCalculator';

const AnimatedPrice = ({ price, oldPrice, discountBadge, inStock, stockCount, className = "" }) => {
    const shouldAnimate = !prefersReducedMotion();
    
    const showDiscount = oldPrice && oldPrice > price;
    const discountPercentage = showDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

    const containerVariants = {
        hidden: shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`flex flex-wrap items-baseline gap-4 ${className}`}
        >
            {showDiscount ? (
                <>
                    <motion.span
                        variants={itemVariants}
                        className="text-3xl font-bold text-red-500 sm:text-4xl"
                    >
                        Rs. {formatPrice(price)}
                    </motion.span>
                    <motion.span
                        variants={itemVariants}
                        className="text-xl text-gray-400 line-through"
                    >
                        Rs. {formatPrice(oldPrice)}
                    </motion.span>
                    <motion.span
                        variants={itemVariants}
                        className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white"
                    >
                        {discountPercentage}% OFF
                    </motion.span>
                </>
            ) : (
                <motion.span
                    variants={itemVariants}
                    className="text-3xl font-bold text-[#12131A] sm:text-4xl"
                >
                    Rs. {formatPrice(price)}
                </motion.span>
            )}

            <motion.span
                variants={itemVariants}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${inStock
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : "bg-[#E5484D]/10 text-[#E5484D]"
                    }`}
            >
                {inStock ? `In Stock · ${stockCount || 0} left` : "Out of Stock"}
            </motion.span>
        </motion.div>
    );
};

export default AnimatedPrice;