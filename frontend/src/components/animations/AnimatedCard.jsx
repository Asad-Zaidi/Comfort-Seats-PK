import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * AnimatedCard — a card component with professional hover animations.
 *
 * On hover the card:
 *  - Lifts up (translateY: -8px)
 *  - Casts a deeper shadow
 *  - Optionally scales the icon (if an icon element is provided)
 *
 * The initial reveal animation triggers when the card scrolls into
 * view (like AnimatedSection), not on mount — so cards in a grid
 * appear one by one as the user scrolls, driven by their `delay` prop.
 *
 * Props:
 *  - direction: "left" | "right" | "none" — slide direction on initial reveal (default "none")
 *  - delay:     number (seconds, default 0)
 *  - once:      boolean — animate only once (default true)
 *  - offset:    number — pixels to start animation before fully in view (default -50)
 *  - iconScale: boolean — whether to scale the icon on hover (default true)
 *  - className: string
 *  - children:  ReactNode
 */
const AnimatedCard = ({
    direction = "none",
    delay = 0,
    once = true,
    offset = -50,
    iconScale = true,
    className = "",
    children,
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: `${offset}px` });

    const distance = 24;

    const initialMap = {
        left: { opacity: 0, x: distance },
        right: { opacity: 0, x: -distance },
        none: { opacity: 0, y: distance * 0.6 },
    };

    const animateMap = {
        left: { opacity: 1, x: 0 },
        right: { opacity: 1, x: 0 },
        none: { opacity: 1, y: 0 },
    };

    const cardVariants = {
        initial: initialMap[direction] || initialMap.none,
        animate: animateMap[direction] || animateMap.none,
        hover: {
            y: -8,
            scale: 1.02,
            transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={cardVariants}
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            whileHover="hover"
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={`group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-300 ${className}`}
        >
            {children}
            {/* Animated hover glow overlay */}
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#2F6FED]/20 via-transparent to-[#F5A524]/20 blur-sm" />
            </motion.div>
        </motion.div>
    );
};

export const CardIcon = ({ children, className = "" }) => {
    return (
        <motion.div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED] ${className}`}
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;