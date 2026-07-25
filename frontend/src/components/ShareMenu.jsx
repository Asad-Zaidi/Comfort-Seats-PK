import { useState, useRef, useEffect, useMemo } from "react";
import {
    FaShareAlt,
    FaLink,
    FaWhatsapp,
    FaFacebookF,
    FaTwitter,
    FaEnvelope,
    FaPinterestP,
    FaLinkedinIn,
    FaTimes,
    FaExternalLinkAlt,
    FaCheck,
} from "react-icons/fa";
import { useToast } from "./ToastNotification";

const ShareMenu = ({ productUrl, productName, productImage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef(null);
    const toast = useToast();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Close menu on Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    // Detect if we're on a mobile device where Web Share API is available.
    // On mobile, individual share buttons (WhatsApp, Facebook, etc.) won't pre-fill
    // content properly via window.open. Instead, we show a simple menu with Copy Link
    // and a "More" button that opens the native OS share sheet.
    const isMobile = useMemo(
        () => typeof navigator !== "undefined" && !!navigator.share,
        []
    );

    // Open share URL in a new window/tab (desktop only).
    const navigateTo = (url) => {
        setIsOpen(false);
        if (url.startsWith("mailto:")) {
            window.location.href = url;
        } else {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    };

    const shareOptions = [
        {
            name: "Copy Link",
            icon: copied ? FaCheck : FaLink,
            color: "#2F6FED",
            action: () => {
                navigator.clipboard.writeText(productUrl);
                toast.success("Link copied to clipboard!");
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
            },
            keepOpen: true,
        },
        ...(isMobile
            ? [
                {
                    name: "More",
                    icon: FaExternalLinkAlt,
                    color: "#12131A",
                    action: () => {
                        setIsOpen(false);
                        navigator
                            .share({
                                title: productName,
                                text: `Check out this product: ${productName}`,
                                url: productUrl,
                            })
                            .catch(() => {
                                // User cancelled or share failed - do nothing
                            });
                    },
                },
            ]
            : [
                {
                    name: "WhatsApp",
                    icon: FaWhatsapp,
                    color: "#25D366",
                    action: () => {
                        const text = `Check out this product: ${productName}\n${productUrl}`;
                        navigateTo(`https://wa.me/?text=${encodeURIComponent(text)}`);
                    },
                },
                {
                    name: "Facebook",
                    icon: FaFacebookF,
                    color: "#1877F2",
                    action: () => {
                        const shareUrl = `https://www.facebook.com/sharer/sharer.php?display=popup&u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(`Check out this product: ${productName}`)}`;
                        navigateTo(shareUrl);
                    },
                },
                {
                    name: "X (Twitter)",
                    icon: FaTwitter,
                    color: "#1DA1F2",
                    action: () => {
                        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this product: ${productName}`)}&url=${encodeURIComponent(productUrl)}`;
                        navigateTo(tweetUrl);
                    },
                },
                {
                    name: "Pinterest",
                    icon: FaPinterestP,
                    color: "#E60023",
                    action: () => {
                        let pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&description=${encodeURIComponent(productName)}`;
                        if (productImage) {
                            pinUrl += `&media=${encodeURIComponent(productImage)}`;
                        }
                        navigateTo(pinUrl);
                    },
                },
                {
                    name: "LinkedIn",
                    icon: FaLinkedinIn,
                    color: "#0A66C2",
                    action: () => {
                        navigateTo(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`);
                    },
                },
                {
                    name: "Email",
                    icon: FaEnvelope,
                    color: "#6B7280",
                    action: () => {
                        const subject = `Check out this product: ${productName}`;
                        const body = `Hi,\n\nI thought you might be interested in this product:\n\n${productName}\n${productUrl}\n\nEnjoy!`;
                        navigateTo(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                    },
                },
            ]),
    ];

    return (
        <div className="relative" ref={menuRef}>
            {/* Share Button */}
            <button
                type="button"
                aria-label="Share product"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                    isOpen
                        ? "border-[#2F6FED] bg-[#2F6FED]/10 text-[#2F6FED]"
                        : "border-gray-200 text-gray-500 hover:border-[#2F6FED]/40 hover:bg-[#2F6FED]/5 hover:text-[#2F6FED]"
                }`}
            >
                <FaShareAlt size={16} className="transition-transform duration-200 group-hover:scale-110" />
            </button>

            {/* Share Menu Dropdown */}
            {isOpen && (
                <div
                    className="absolute bottom-full right-0 z-50 mb-3 w-[19rem] origin-bottom-right animate-shareMenuIn"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    {/* Menu Card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-[0_12px_40px_-8px_rgba(18,19,26,0.18)] backdrop-blur-xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
                            <div className="flex flex-col">
                                <span
                                    className="text-[13px] font-semibold uppercase tracking-wide text-[#12131A]"
                                    style={{ fontFamily: "'Sora', sans-serif" }}
                                >
                                    Share this product
                                </span>
                                <span className="mt-0.5 max-w-[220px] truncate text-xs text-gray-400">
                                    {productName}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Close share menu"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>

                        {/* Share Options Grid */}
                        <div className="grid grid-cols-4 gap-1 p-3">
                            {shareOptions.map((option) => (
                                <button
                                    key={option.name}
                                    type="button"
                                    onClick={option.action}
                                    className="group flex flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 transition hover:bg-gray-50"
                                >
                                    <span
                                        className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] transition-transform duration-150 group-hover:scale-105 group-active:scale-95"
                                        style={{
                                            backgroundColor: `${option.color}14`,
                                            color: option.color,
                                        }}
                                    >
                                        <option.icon size={15} />
                                    </span>
                                    <span className="text-[11px] font-medium leading-none text-gray-600">
                                        {option.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Footer accent line */}
                        <div className="h-[3px] w-full bg-gradient-to-r from-[#2F6FED] via-[#2F6FED]/40 to-[#F5A524]" />
                    </div>

                    {/* Arrow pointing down to the button */}
                    <div
                        className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 border-b border-r border-gray-100 bg-white"
                        aria-hidden="true"
                    />
                </div>
            )}

            <style>{`
                @keyframes shareMenuIn {
                    from {
                        opacity: 0;
                        transform: translateY(6px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-shareMenuIn {
                    animation: shareMenuIn 0.16s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ShareMenu;