import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';
import Review from '../Review';

const AnimatedReview = ({ reviews = [], onSubmit, className = "" }) => {
    const shouldAnimate = !prefersReducedMotion();

    return (
        <motion.section
            initial={shouldAnimate ? { opacity: 0, y: 30 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1]
            }}
            className={className}
        >
            <motion.div
                initial={shouldAnimate ? { opacity: 0, scale: 0.98 } : { opacity: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="overflow-hidden rounded-3xl border border-[#E7E8EC] bg-white shadow-[0_2px_24px_rgba(15,19,32,0.05)]"
            >
                <Review reviews={reviews} onSubmit={onSubmit} />
            </motion.div>
        </motion.section>
    );
};

export default AnimatedReview;