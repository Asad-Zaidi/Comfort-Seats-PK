import { useState, useCallback, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';

const AnimatedProductGallery = ({
    images = [],
    activeIndex = 0,
    onActiveIndexChange,
    productName = '',
}) => {
    const [fullscreen, setFullscreen] = useState(false);
    const [displayedIndex, setDisplayedIndex] = useState(activeIndex);
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);
    const shouldAnimate = !prefersReducedMotion();

    // Sync with activeIndex when it changes externally
    useEffect(() => {
        setDisplayedIndex(activeIndex);
    }, [activeIndex]);

    const goPrev = useCallback(() => {
        if (images.length <= 1) return;
        const newIdx = displayedIndex === 0 ? images.length - 1 : displayedIndex - 1;
        onActiveIndexChange?.(newIdx);
    }, [displayedIndex, images.length, onActiveIndexChange]);

    const goNext = useCallback(() => {
        if (images.length <= 1) return;
        const newIdx = displayedIndex === images.length - 1 ? 0 : displayedIndex + 1;
        onActiveIndexChange?.(newIdx);
    }, [displayedIndex, images.length, onActiveIndexChange]);

    const handleThumbnailClick = useCallback((idx) => {
        onActiveIndexChange?.(idx);
    }, [onActiveIndexChange]);

    // Touch handlers
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchMove = useCallback((e) => {
        touchEndX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!touchStartX.current || !touchEndX.current) return;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goNext();
            else goPrev();
        }
        touchStartX.current = null;
        touchEndX.current = null;
    }, [goPrev, goNext]);

    // Keyboard navigation
    useEffect(() => {
        if (!fullscreen) return;
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'Escape') setFullscreen(false);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [fullscreen, goPrev, goNext]);

    if (!images || images.length === 0) return null;

    const hasMultipleImages = images.length > 1;
    const currentImage = images[displayedIndex] || images[0];

    // Animation variants
    const thumbnailVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.95 },
    };

    const transition = shouldAnimate
        ? { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
        : { duration: 0 };

    // Fullscreen Modal
    const fullscreenModal = fullscreen && createPortal(
        <motion.div
            initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
            transition={transition}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-md"
            onClick={() => setFullscreen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
        >
            {/* Close button */}
            <motion.button
                whileHover={shouldAnimate ? { scale: 1.1, backgroundColor: 'rgba(0,0,0,0.4)' } : {}}
                whileTap={shouldAnimate ? { scale: 0.95 } : {}}
                type="button"
                onClick={() => setFullscreen(false)}
                className="absolute right-5 top-5 z-[10000] flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-gray-900 transition"
                aria-label="Close fullscreen"
            >
                <FiX size={24} />
            </motion.button>

            {/* Image counter */}
            <span className="absolute left-5 top-5 z-[10000] rounded-full bg-black/20 px-3 py-1.5 text-sm font-medium text-gray-900">
                {displayedIndex + 1} / {images.length}
            </span>

            <div className="flex max-h-[90vh] max-w-[90vw] items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={displayedIndex}
                        src={currentImage}
                        alt={`${productName || 'Product'} fullscreen ${displayedIndex + 1}`}
                        className="max-h-[85vh] max-w-[85vw] object-contain"
                        initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={shouldAnimate ? { opacity: 0, scale: 1.05 } : { opacity: 0 }}
                        transition={transition}
                    />
                </AnimatePresence>
            </div>

            {/* Navigation in fullscreen */}
            {hasMultipleImages && (
                <>
                    <motion.button
                        whileHover={shouldAnimate ? { scale: 1.1, backgroundColor: 'rgba(0,0,0,0.4)' } : {}}
                        whileTap={shouldAnimate ? { scale: 0.95 } : {}}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        className="absolute left-5 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-gray-900 transition z-[10000]"
                        aria-label="Previous image"
                    >
                        <FiChevronLeft size={24} />
                    </motion.button>
                    <motion.button
                        whileHover={shouldAnimate ? { scale: 1.1, backgroundColor: 'rgba(0,0,0,0.4)' } : {}}
                        whileTap={shouldAnimate ? { scale: 0.95 } : {}}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-gray-900 transition z-[10000]"
                        aria-label="Next image"
                    >
                        <FiChevronRight size={24} />
                    </motion.button>
                </>
            )}
        </motion.div>,
        document.body
    );

    return (
        <>
            {/* Main Gallery Container */}
            <div
                className="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Main Image */}
                <div className="relative aspect-square">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={displayedIndex}
                            src={currentImage}
                            alt={`${productName || 'Product'}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            initial={shouldAnimate ? { opacity: 0 } : false}
                            animate={{ opacity: 1 }}
                            exit={shouldAnimate ? { opacity: 0 } : { opacity: 0 }}
                            transition={transition}
                        />
                    </AnimatePresence>

                    {/* Previous Button */}
                    {hasMultipleImages && (
                        <>
                            <motion.button
                                whileHover={shouldAnimate ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,1)' } : {}}
                                whileTap={shouldAnimate ? { scale: 0.95 } : {}}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100"
                                aria-label="Previous image"
                            >
                                <FiChevronLeft size={20} />
                            </motion.button>
                            <motion.button
                                whileHover={shouldAnimate ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,1)' } : {}}
                                whileTap={shouldAnimate ? { scale: 0.95 } : {}}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); goNext(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100"
                                aria-label="Next image"
                            >
                                <FiChevronRight size={20} />
                            </motion.button>

                            {/* Image counter */}
                            <motion.span
                                initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-3 right-3 rounded-full bg-[#0F1320]/70 px-2.5 py-1 text-[11px] font-medium text-white"
                            >
                                {displayedIndex + 1} / {images.length}
                            </motion.span>
                        </>
                    )}

                    {/* Fullscreen button */}
                    {hasMultipleImages && (
                        <motion.button
                            whileHover={shouldAnimate ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,1)' } : {}}
                            whileTap={shouldAnimate ? { scale: 0.95 } : {}}
                            type="button"
                            onClick={() => setFullscreen(true)}
                            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-600 opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100"
                            aria-label="View fullscreen"
                        >
                            <FiMaximize2 size={14} />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Thumbnails Strip */}
            {hasMultipleImages && (
                <motion.div
                    initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldAnimate ? { duration: 0.5, delay: 0.2 } : { duration: 0 }}
                    className="mt-4 flex gap-2.5 overflow-x-auto px-1 py-1"
                >
                    {images.map((img, idx) => (
                        <motion.button
                            key={idx}
                            type="button"
                            onClick={() => handleThumbnailClick(idx)}
                            variants={thumbnailVariants}
                            initial={shouldAnimate ? "initial" : false}
                            animate="animate"
                            whileHover={shouldAnimate ? "whileHover" : false}
                            whileTap={shouldAnimate ? "whileTap" : false}
                            transition={transition}
                            className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                                displayedIndex === idx
                                    ? 'border-[#2F6FED] ring-2 ring-[#2F6FED]/20'
                                    : 'border-gray-200 opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img
                                src={img}
                                alt={`${productName || 'Product'} thumbnail ${idx + 1}`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150x150?text=N/A';
                                }}
                            />
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {/* Portal-based fullscreen modal */}
            {fullscreenModal}
        </>
    );
};

export default AnimatedProductGallery;