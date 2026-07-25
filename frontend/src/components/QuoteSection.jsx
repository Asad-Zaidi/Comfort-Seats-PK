import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuoteSection({ quoteData }) {
    const defaultFirstSentence = "Where Comfort Meets ";
    const defaultWords = [
        "Productivity",
        "Comfort",
        "Ergonomics",
        "Luxury",
        "Quality",
        "Performance",
        "Style",
        "Excellence",
    ];
    const defaultDescription =
        "Elevate your workspace with furniture crafted to inspire creativity, improve posture, and redefine everyday comfort. Experience the perfect blend of premium design and lasting functionality.";
    const defaultLabel = "Designed For Modern Workspaces";

    const firstSentence = quoteData?.firstSentence || defaultFirstSentence;
    const words = quoteData?.rotatingWords || defaultWords;
    const description = quoteData?.description || defaultDescription;
    const label = quoteData?.label || defaultLabel;

    const [typedText, setTypedText] = useState("");
    const [typingDone, setTypingDone] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);

    // Typewriter Effect
    useEffect(() => {
        let index = 0;

        const timer = setInterval(() => {
            if (index < firstSentence.length) {
                setTypedText(firstSentence.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
                setTypingDone(true);
            }
        }, 70);

        return () => clearInterval(timer);
    }, [firstSentence]);

    // Rotating Words
    useEffect(() => {
        if (!typingDone || words.length === 0) return;

        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % words.length);
        }, 2200);

        return () => clearInterval(interval);
    }, [typingDone, words.length]);

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#faf9f6] to-white py-24">
            {/* Background Glow */}
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl"></div>
            <div className="relative mx-auto max-w-6xl px-6 text-center">
                {/* Small Label */}
                <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                    {label}
                </span>
                {/* Quote */}
                <h1 className="mt-8 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
                    {typedText}

                    {typingDone && words.length > 0 && (
                        <>
                            <span>&nbsp;</span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={words[wordIndex]}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="inline-block text-amber-500"
                                >
                                    {words[wordIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </>
                    )}

                    {!typingDone && (
                        <span className="ml-1 inline-block h-10 w-[3px] animate-pulse bg-amber-500 align-middle"></span>
                    )}
                </h1>
                {/* Description */}
                <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 text-gray-600">
                    {description}
                </p>
                {/* Decorative Line */}
                <div className="mx-auto mt-12 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            </div>
        </section>
    );
}