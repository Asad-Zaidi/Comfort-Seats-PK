import React, { useState, useEffect, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

const StarRating = ({ value = 5, size = 16 }) => (
    <div className="flex items-center gap-1 text-[#F5A524]">
        {[...Array(5)].map((_, i) => (
            <FiStar
                key={i}
                size={size}
                className={i < value ? "fill-[#F5A524] text-[#F5A524]" : "text-gray-300"}
            />
        ))}
    </div>
);

export default function TestimonialSection({ testimonialsData = [], loading = false }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsToShow, setItemsToShow] = useState(3);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const defaultTestimonials = [
        { text: "Absolutely incredible experience! The quality blew me away and it looks stunning in our space. Will definitely buy again.", name: "Sarah J.", rating: 5, productName: "Comfort Chair" },
        { text: "Super clean aesthetic and incredibly sturdy. It fits perfectly into our office workflow. Highly recommended!", name: "Mark T.", rating: 5, productName: "Ergo Seat" },
        { text: "Fast shipping and superb customer support. The setup took less than ten minutes and the results speak for themselves.", name: "Elena R.", rating: 5, productName: "Luxury Cushion" },
    ];

    const list = testimonialsData.length > 0 ? testimonialsData : defaultTestimonials;

    useEffect(() => {
        const updateItems = () => {
            if (window.innerWidth < 640) setItemsToShow(1);
            else if (window.innerWidth < 1024) setItemsToShow(2);
            else setItemsToShow(3);
        };
        updateItems();
        window.addEventListener("resize", updateItems);
        return () => window.removeEventListener("resize", updateItems);
    }, []);

    const handleNext = () => {
        if (!list.length) return;
        setCurrentIndex((prev) => (prev + 1) % list.length);
    };

    const handlePrev = () => {
        if (!list.length) return;
        setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
    };

    const visibleItems = useMemo(() => {
        if (!list.length) return [];
        const count = Math.min(itemsToShow, list.length);
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(list[(currentIndex + i) % list.length]);
        }
        return result;
    }, [list, currentIndex, itemsToShow]);

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
        setTouchEnd(0);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 40) handleNext();
        else if (distance < -40) handlePrev();
    };

    return (
        <section className="bg-[#FAF9F6] py-12">
            <div className="mx-auto max-w-7xl px-5 text-center lg:px-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#F5A524]">
                    What Our Customers Say
                </span>

                <h2 className="mt-3 text-2xl font-bold text-gray-800 sm:text-3xl">
                    Loved by Homes and Offices Alike
                </h2>

                {/* Carousel Wrapper */}
                <div
                    className="group relative mt-8 px-4 sm:px-14"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Left Arrow Button */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2.5 text-gray-600 shadow-md transition hover:bg-[#FFF9E6] hover:text-[#F5A524] hover:scale-105 active:scale-95"
                        aria-label="Previous testimonial"
                    >
                        <FiChevronLeft size={20} />
                    </button>

                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="flex h-48 animate-pulse flex-col rounded-3xl border border-[#F5A524]/15 bg-[#FFF9E6] p-6"
                                >
                                    <div className="h-4 w-28 rounded bg-[#F5A524]/10" />
                                    <div className="mt-4 space-y-2">
                                        <div className="h-3 rounded bg-[#F5A524]/10" />
                                        <div className="h-3 rounded bg-[#F5A524]/10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : visibleItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleItems.map((review, idx) => (
                                <div
                                    key={review._id || `testimonial-${idx}-${currentIndex}`}
                                    className="flex h-48 flex-col rounded-3xl border border-[#F5A524]/15 bg-[#FFF9E6] py-5 px-6 shadow-sm transition-all duration-300 hover:shadow-md text-left"
                                >
                                    <div className="flex-1 overflow-hidden">
                                        <StarRating value={review.rating || 5} size={16} />
                                        <p className="mt-3 line-clamp-3 text-sm italic leading-6 text-gray-700">
                                            "{review.text}"
                                        </p>
                                    </div>
                                    <div className="mt-3 border-t border-[#F5A524]/10 pt-2.5">
                                        <p className="font-semibold text-sm text-gray-900">
                                            {review.name || "Anonymous"}
                                        </p>
                                        <p className="truncate text-xs text-gray-500">
                                            {review.productName ? `Reviewed ${review.productName}` : "Verified Customer"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mx-auto max-w-xl text-sm leading-6 text-gray-600">
                            No customer reviews available.
                        </p>
                    )}

                    {/* Right Arrow Button */}
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2.5 text-gray-600 shadow-md transition hover:bg-[#FFF9E6] hover:text-[#F5A524] hover:scale-105 active:scale-95"
                        aria-label="Next testimonial"
                    >
                        <FiChevronRight size={20} />
                    </button>
                </div>

                {/* Pagination Dots */}
                {list.length > 0 && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                        {list.map((_, dotIdx) => (
                            <button
                                key={dotIdx}
                                onClick={() => setCurrentIndex(dotIdx)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    currentIndex === dotIdx ? "w-6 bg-[#F5A524]" : "w-2 bg-gray-300 hover:bg-gray-400"
                                }`}
                                aria-label={`Go to slide ${dotIdx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}