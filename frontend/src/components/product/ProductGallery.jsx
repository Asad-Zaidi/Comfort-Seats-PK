import { useState, useCallback, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';

const ProductGallery = ({
    images = [],
    activeIndex = 0,
    onActiveIndexChange,
    productName = '',
    coverImage = null,
}) => {
    const [fullscreen, setFullscreen] = useState(false);
    const [imgLoaded, setImgLoaded] = useState({});
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    // Use coverImage if provided, otherwise fall back to activeIndex
    const effectiveActiveIndex = coverImage && images.length > 0
        ? Math.min(images.findIndex(img => img === coverImage), images.length - 1)
        : activeIndex;

    const goPrev = useCallback(() => {
        if (images.length <= 1) return;
        const newIdx = effectiveActiveIndex === 0 ? images.length - 1 : effectiveActiveIndex - 1;
        onActiveIndexChange?.(newIdx);
    }, [effectiveActiveIndex, images.length, onActiveIndexChange]);

    const goNext = useCallback(() => {
        if (images.length <= 1) return;
        const newIdx = effectiveActiveIndex === images.length - 1 ? 0 : effectiveActiveIndex + 1;
        onActiveIndexChange?.(newIdx);
    }, [effectiveActiveIndex, images.length, onActiveIndexChange]);

    // Touch handlers defined before early return to comply with Rules of Hooks
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
    const currentImage = images[effectiveActiveIndex] || images[0];

    // Fullscreen Modal rendered via Portal to escape stacking contexts
    const fullscreenModal = fullscreen && createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#ffff]/50 backdrop-blur-md"
            onClick={() => setFullscreen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
        >
            {/* Close button - always visible, z-[10000] to guarantee top-most */}
            <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="absolute right-5 top-5 z-[10000] flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-gray-900 transition hover:bg-black/30"
                aria-label="Close fullscreen"
            >
                <FiX size={24} />
            </button>

            {/* Image counter */}
            <span className="absolute left-5 top-5 z-[10000] rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white">
                {effectiveActiveIndex + 1} / {images.length}
            </span>

            <div className="flex max-h-[90vh] max-w-[90vw] items-center justify-center">
                <img
                    src={currentImage}
                    alt={`${productName || 'Product'} fullscreen ${effectiveActiveIndex + 1}`}
                    className="max-h-[85vh] max-w-[85vw] object-contain"
                />
            </div>

            {/* Navigation in fullscreen */}
            {hasMultipleImages && (
                <>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        className="absolute left-5 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-gray-900 transition hover:bg-black/30 z-[10000]"
                        aria-label="Previous image"
                    >
                        <FiChevronLeft size={24} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-gray-900 transition hover:bg-black/30 z-[10000]"
                        aria-label="Next image"
                    >
                        <FiChevronRight size={24} />
                    </button>
                </>
            )}
        </div>,
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
                    <img
                        src={currentImage}
                        alt={productName || 'Product'}
                        className="h-full w-full object-cover transition-opacity duration-300"
                        loading="lazy"
                        onLoad={() => setImgLoaded(prev => ({ ...prev, [currentImage]: true }))}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                        }}
                    />

                    {/* Loading indicator */}
                    {!imgLoaded[currentImage] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2F6FED] border-t-transparent" />
                        </div>
                    )}

                    {/* Previous Button */}
                    {hasMultipleImages && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow-sm transition hover:bg-white hover:text-[#2F6FED] group-hover:opacity-100 focus:opacity-100"
                                aria-label="Previous image"
                            >
                                <FiChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); goNext(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow-sm transition hover:bg-white hover:text-[#2F6FED] group-hover:opacity-100 focus:opacity-100"
                                aria-label="Next image"
                            >
                                <FiChevronRight size={20} />
                            </button>

                            {/* Image counter */}
                            <span className="absolute bottom-3 right-3 rounded-full bg-[#0F1320]/70 px-2.5 py-1 text-[11px] font-medium text-white">
                                {effectiveActiveIndex + 1} / {images.length}
                            </span>
                        </>
                    )}

                    {/* Fullscreen button */}
                    {hasMultipleImages && (
                        <button
                            type="button"
                            onClick={() => setFullscreen(true)}
                            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-600 opacity-0 shadow-sm transition hover:bg-white hover:text-[#2F6FED] group-hover:opacity-100 focus:opacity-100"
                            aria-label="View fullscreen"
                        >
                            <FiMaximize2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Thumbnails Strip */}
            {hasMultipleImages && (
                <div className="mt-4 flex gap-2.5 overflow-x-auto px-1 py-1">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => onActiveIndexChange?.(idx)}
                            className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                                effectiveActiveIndex === idx
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
                        </button>
                    ))}
                </div>
            )}

            {/* Portal-based fullscreen modal */}
            {fullscreenModal}
        </>
    );
};

export default ProductGallery;