import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';

/**
 * FadeInUp wrapper for sections entering the viewport.
 */
export const FadeInUp = ({ children, delay = 0, className = "" }) => {
    const shouldAnimate = !prefersReducedMotion();

    return (
        <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 24 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * ScaleIn wrapper for elements entering the viewport.
 */
export const ScaleIn = ({ children, delay = 0, className = "" }) => {
    const shouldAnimate = !prefersReducedMotion();

    return (
        <motion.div
            initial={shouldAnimate ? { opacity: 0, scale: 0.96 } : { opacity: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * StaggerContainer for list items entering the viewport.
 */
export const StaggerContainer = ({ children, stagger = 0.08, delay = 0, className = "" }) => {
    const shouldAnimate = !prefersReducedMotion();

    return (
        <motion.div
            initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{
                staggerChildren: stagger,
                delayChildren: delay,
                duration: 0,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem = ({ children, direction = "up", delay = 0, className = "" }) => {
    const shouldAnimate = !prefersReducedMotion();
    const distance = 20;

    const offsetMap = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance },
    };

    return (
        <motion.div
            initial={shouldAnimate ? { opacity: 0, ...offsetMap[direction] } : { opacity: 1 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};