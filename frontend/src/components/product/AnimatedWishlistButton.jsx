import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';

const AnimatedWishlistButton = ({ isActive, onClick, className = "" }) => {
    const shouldAnimate = !prefersReducedMotion();

    return (
        <motion.button
            whileHover={shouldAnimate ? { scale: 1.05, y: -2 } : {}}
            whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            onClick={onClick}
            className={`relative inline-flex items-center justify-center rounded-xl border-2 p-3 transition-all duration-300 ${
                isActive
                    ? 'border-red-500 bg-red-50 text-red-500 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:shadow-sm'
            } ${className}`}
            aria-label={isActive ? "Remove from wishlist" : "Add to wishlist"}
        >
            <motion.div
                animate={shouldAnimate ? {
                    scale: isActive ? [1, 1.3, 1] : 1,
                } : {}}
                transition={shouldAnimate ? { duration: 0.3 } : {}}
            >
                <FaHeart
                    size={18}
                    className={isActive ? 'fill-current' : ''}
                />
            </motion.div>
        </motion.button>
    );
};

export default AnimatedWishlistButton;