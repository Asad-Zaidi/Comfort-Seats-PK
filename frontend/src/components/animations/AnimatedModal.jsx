import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

/**
 * AnimatedModal — a professional animated modal with backdrop blur.
 *
 * Entrance:  backdrop fades in, modal scales from 0.92 → 1 + fades in
 * Exit:      reverse
 *
 * Props:
 *  - isOpen:   boolean
 *  - onClose:  () => void
 *  - title:    string (optional header)
 *  - size:     "sm" | "md" | "lg" | "xl" (default "md")
 *  - showClose: boolean (default true)
 *  - children: ReactNode
 */
const AnimatedModal = ({
    isOpen,
    onClose,
    title,
    size = "md",
    showClose = true,
    children,
}) => {
    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    // Close on Escape key
    const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        onClick={onClose}
                        onKeyDown={handleKeyDown}
                        tabIndex={-1}
                    />

                    {/* Modal Panel */}
                    <motion.div
                        className={`fixed inset-0 z-[101] flex items-center justify-center p-4 ${sizeClasses[size]} w-full`}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{
                            duration: 0.35,
                            ease: [0.25, 0.1, 0.25, 1],
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full rounded-3xl bg-white shadow-2xl">
                            {/* Header */}
                            {(title || showClose) && (
                                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                    {title && (
                                        <motion.h3
                                            className="text-xl font-bold text-[#12131A]"
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1, duration: 0.3 }}
                                        >
                                            {title}
                                        </motion.h3>
                                    )}
                                    {showClose && (
                                        <motion.button
                                            type="button"
                                            onClick={onClose}
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            transition={{ duration: 0.15 }}
                                            aria-label="Close modal"
                                        >
                                            <FiX size={16} />
                                        </motion.button>
                                    )}
                                </div>
                            )}

                            {/* Body */}
                            <div className="p-6">{children}</div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AnimatedModal;
