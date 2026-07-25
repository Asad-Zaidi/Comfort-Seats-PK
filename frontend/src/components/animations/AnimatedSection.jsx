import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { prefersReducedMotion } from "./AnimationConfigs";

/**
 * AnimatedSection — a reusable scroll-reveal wrapper.
 *
 * Wraps any children in a <motion.div> that animates when it scrolls
 * into view. Supports fade, slide (up / left / right), and staggered
 * children animations.
 *
 * Props:
 *  - direction: "up" | "down" | "left" | "right" | "none"  (default "up")
 *  - delay:     number (seconds, default 0)
 *  - duration:  number (seconds, default 0.6)
 *  - stagger:   number (seconds between child animations, default 0.1)
 *  - once:      boolean — animate only once (default true)
 *  - offset:    number — pixels to start animation before fully in view (default -50)
 *  - className: string
 *  - children:  ReactNode
 */
const AnimatedSection = ({
    direction = "up",
    delay = 0,
    duration = 0.6,
    stagger = 0.1,
    once = true,
    offset = -50,
    className = "",
    children,
}) => {
    const ref = useRef(null);
    const shouldAnimate = !prefersReducedMotion();
    const isInView = useInView(ref, {
        once,
        margin: `${offset}px`,
    });

    const distance = 32;

    const offsetMap = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance },
        none: {},
    };

    const containerVariants = {
        initial: shouldAnimate
            ? {
                opacity: 0,
                ...offsetMap[direction],
            }
            : { opacity: 1, x: 0, y: 0 },
        animate: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: shouldAnimate
                ? {
                    duration,
                    delay,
                    ease: [0.25, 0.1, 0.25, 1],
                    when: "beforeChildren",
                    staggerChildren: stagger,
                }
                : { duration: 0 },
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={containerVariants}
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            className={className}
            transition={{ duration: shouldAnimate ? duration : 0 }}
        >
            {children}
        </motion.div>
    );
};

/**
 * AnimatedItem — a single animated child meant to be used inside
 * an AnimatedSection that has stagger enabled. It will fade+slide
 * in sequence with its siblings, in the given direction.
 *
 * Props:
 *  - direction: "up" | "down" | "left" | "right" (default "up")
 *  - delay:     number (seconds, default 0)
 *  - duration:  number (seconds, default 0.5)
 *  - className: string
 *  - children:  ReactNode
 */
export const AnimatedItem = ({
    direction = "up",
    delay = 0,
    duration = 0.5,
    className = "",
    children,
}) => {
    const distance = 20;

    const offsetMap = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance },
    };

    return (
        <motion.div
            variants={{
                initial: {
                    opacity: 0,
                    ...offsetMap[direction],
                },
                animate: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    transition: {
                        duration,
                        delay,
                        ease: [0.25, 0.1, 0.25, 1],
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedSection;
