import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * AnimatedCard — a card component with professional hover animations.
 *
 * Props:
 *  - direction: "left" | "right" | "none" — slide direction on initial reveal (default "none")
 *  - delay:     number (seconds, default 0)
 *  - once:      boolean — animate only once (default true)
 *  - offset:    number — pixels to start animation before fully in view (default -50)
 *  - iconScale: boolean — whether to scale the icon on hover (default true)
 *  - className: string
 *  - style:     object
 *  - children:  ReactNode
 */
const AnimatedCard = ({
    direction = "none",
    delay = 0,
    once = true,
    offset = -50,
    iconScale = true,
    className = "",
    style = {},
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

    const defaultStyle = {
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
        ...style,
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
            style={defaultStyle}
            className={`group relative rounded-2xl border p-6 shadow-xs transition-colors transition-shadow duration-300 ${className}`}
        >
            {children}
            {/* Animated hover glow overlay */}
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div
                    className="absolute -inset-px rounded-2xl blur-sm"
                    style={{
                        background: 'linear-gradient(to right, color-mix(in srgb, var(--primary) 20%, transparent), transparent, color-mix(in srgb, var(--secondary) 20%, transparent))'
                    }}
                />
            </motion.div>
        </motion.div>
    );
};

export const CardIcon = ({ children, className = "", style = {} }) => {
    const defaultIconStyle = {
        backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
        color: 'var(--primary)',
        ...style,
    };

    return (
        <motion.div
            style={defaultIconStyle}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${className}`}
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;