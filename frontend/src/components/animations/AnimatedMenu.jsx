import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/**
 * AnimatedMenu — a professional animated dropdown menu.
 *
 * The trigger can be any element passed as `trigger`. When opened,
 * the menu panel slides down with a stagger animation for each item.
 *
 * Props:
 *  - trigger: ReactNode (the button/element that toggles the menu)
 *  - items:   Array<{ label, icon?, onClick, disabled? }>
 *  - align:   "left" | "right" (default "right")
 *  - className: string for the menu panel
 */
const AnimatedMenu = ({ trigger, items = [], align = "right", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
        }
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen]);

    const alignClass = align === "right" ? "origin-top-right right-0" : "origin-top-left left-0";

    const handleItemClick = (item) => {
        if (item.disabled) return;
        if (item.onClick) item.onClick();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block" ref={menuRef}>
            {/* Trigger */}
            <div
                onClick={() => setIsOpen((prev) => !prev)}
                className="cursor-pointer"
            >
                {trigger}
            </div>

            {/* Menu Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for closing */}
                        <motion.div
                            className="fixed inset-0 z-[95]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.01 }}
                        />

                        <motion.div
                            className={`absolute top-full z-[96] mt-2 min-w-[180px] rounded-xl border border-gray-100 bg-white/95 py-1.5 shadow-[0_12px_40px_-8px_rgba(18,19,26,0.18)] backdrop-blur-xl ${alignClass} ${className}`}
                            initial={{ opacity: 0, scale: 0.92, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -8 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.25, 0.1, 0.25, 1],
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                            }}
                        >
                            {items.map((item, idx) => (
                                <motion.button
                                    key={item.label || idx}
                                    onClick={() => handleItemClick(item)}
                                    disabled={item.disabled}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    transition={{
                                        delay: idx * 0.04,
                                        duration: 0.2,
                                        ease: [0.25, 0.1, 0.25, 1],
                                    }}
                                    className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                                        item.disabled
                                            ? "cursor-not-allowed text-gray-300"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-[#2F6FED]"
                                    }`}
                                >
                                    {item.icon && <span className="flex items-center">{item.icon}</span>}
                                    <span>{item.label}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnimatedMenu;
