import { useState, useCallback, useEffect } from "react";

const ReviewImagePreview = ({ imageUrl, alt = "Review image" }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);

    // Lazy load observer
    const imgRefCallback = useCallback((node) => {
        if (!node) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" }
        );
        observer.observe(node);
    }, []);

    // Escape key to close lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setShowLightbox(false);
        };

        if (showLightbox) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [showLightbox]);

    if (!imageUrl) return null;

    return (
        <>
            {/* Thumbnail */}
            <div
                ref={imgRefCallback}
                className="group relative mt-3 inline-block cursor-pointer overflow-hidden rounded-xl border border-[#EEF0F3]"
                onClick={() => setShowLightbox(true)}
                role="button"
                tabIndex={0}
                aria-label="Enlarge review image"
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowLightbox(true);
                    }
                }}
            >
                {isInView ? (
                    <img
                        src={imageUrl}
                        alt={alt}
                        onLoad={() => setIsLoaded(true)}
                        className={`max-h-48 w-auto max-w-full rounded-lg object-contain transition-all duration-500 ${
                            isLoaded
                                ? "scale-100 opacity-100"
                                : "scale-95 opacity-0"
                        }`}
                        loading="lazy"
                    />
                ) : (
                    <div className="h-32 w-32 animate-pulse rounded-lg bg-gray-100" />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition group-hover:bg-black/30">
                    <svg
                        className="scale-0 text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>
            </div>

            {/* Lightbox Modal */}
            {showLightbox && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setShowLightbox(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image preview"
                >
                    <button
                        type="button"
                        onClick={() => setShowLightbox(false)}
                        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
                        aria-label="Close preview"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <img
                        src={imageUrl}
                        alt={alt}
                        className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default ReviewImagePreview;