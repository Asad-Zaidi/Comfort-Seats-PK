import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';
import { formatPrice } from '../../utils/priceCalculator';

const AnimatedPrice = ({ price, oldPrice, discountBadge, showDiscountBadge = true, inStock, stockCount, className = "" }) => {
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
                        style={{ color: 'var(--product-discount-color, var(--error))' }}
                        className="text-3xl font-bold sm:text-4xl"
                    >
                        Rs. {formatPrice(price)}
                    </motion.span>
                    <motion.span
                        variants={itemVariants}
                        style={{ color: 'var(--text-light, #9ca3af)' }}
                        className="text-xl line-through"
                    >
                        Rs. {formatPrice(oldPrice)}
                    </motion.span>
                    {showDiscountBadge && (
                        <motion.span
                            variants={itemVariants}
                            style={{ backgroundColor: 'var(--error)', color: '#ffffff' }}
                            className="rounded-full px-3 py-1 text-xs font-bold"
                        >
                            {discountPercentage}% OFF
                        </motion.span>
                    )}
                </>
            ) : (
                <motion.span
                    variants={itemVariants}
                    style={{ color: 'var(--product-price-color, var(--primary))' }}
                    className="text-3xl font-bold sm:text-4xl"
                >
                    Rs. {formatPrice(price)}
                </motion.span>
            )}

            <motion.span
                variants={itemVariants}
                style={{
                    backgroundColor: inStock ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'color-mix(in srgb, var(--error) 12%, transparent)',
                    color: inStock ? 'var(--success)' : 'var(--error)',
                }}
                className="rounded-full px-3 py-1 text-xs font-semibold"
            >
                {inStock ? `In Stock · ${stockCount || 0} left` : "Out of Stock"}
            </motion.span>
        </motion.div>
    );
};

export default AnimatedPrice;