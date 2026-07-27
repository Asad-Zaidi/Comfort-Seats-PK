import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';
import ProductCard from '../ProductCard';

const AnimatedRelatedProducts = ({ products = [], className = "" }) => {
    const shouldAnimate = !prefersReducedMotion();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
    };

    if (!products || products.length === 0) return null;

    return (
        <motion.section
            variants={containerVariants}
            initial={shouldAnimate ? "hidden" : false}
            animate="visible"
            className={`mt-16 border-t border-gray-100 pt-16 ${className}`}
        >
            {/* Heading */}
            <motion.h2
                variants={shouldAnimate ? { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } } : {}}
                className="text-2xl font-bold text-[#12131A] sm:text-3xl mb-8"
            >
                Related Products
            </motion.h2>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((rp, idx) => {
                    const { primaryImage, hoverImage } = rp._cardImages || {};
                    
                    return (
                        <motion.div
                            key={rp._id}
                            variants={itemVariants}
                            custom={idx}
                        >
                            <ProductCard
                                image={primaryImage || rp.imageUrl}
                                hoverImage={hoverImage}
                                name={rp.name}
                                price={rp.price}
                                description={rp.shortDescription || rp.description || rp.detail || ""}
                                rating={rp.avgRating || 0}
                                reviews={rp.totalReviews || 0}
                                to={`/products/${rp.slug}`}
                                isCustomizable={rp.isCustomizable === true}
                                product={rp}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </motion.section>
    );
};

export default AnimatedRelatedProducts;