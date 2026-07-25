import React, { useState, useRef, useEffect, useId } from "react";
import { FiInfo } from "react-icons/fi";

/**
 * Simple InfoTooltip — shows a concise description of what to enter in the field.
 * No extra sections, badges, or complex styling.
 */

const InfoTooltip = ({
    content = null,
    title = "",
    description = "",
    className = "",
    iconSize = 14,
    inline = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef(null);
    const buttonRef = useRef(null);
    const tooltipId = useId();

    const displayTitle = content?.title || title;
    const displayDescription = content?.description || description;

    const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    const handleMouseEnter = () => setIsOpen(true);
    const handleMouseLeave = () => setIsOpen(false);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    if (!displayTitle && !displayDescription) return null;

    return (
        <span
            className={`relative inline-flex items-center align-middle ${inline ? "ml-1.5" : ""} ${className}`}
        >
            {/* Info Button */}
            <button
                ref={buttonRef}
                type="button"
                aria-label={`Information about ${displayTitle || "field"}`}
                aria-describedby={isOpen ? tooltipId : undefined}
                aria-expanded={isOpen}
                onClick={handleToggle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-blue-50 hover:text-[#2F6FED] transition-colors cursor-pointer select-none"
            >
                <FiInfo size={iconSize} className="shrink-0" />
            </button>

            {/* Simple Tooltip */}
            {isOpen && (
                <div
                    ref={tooltipRef}
                    id={tooltipId}
                    role="tooltip"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[99999] w-64 rounded-xl bg-gray-900 text-white p-3.5 shadow-xl border border-gray-700/60 text-xs animate-fadeIn"
                >
                    {/* Arrow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-b border-r border-gray-700/60 bg-gray-900" />

                    {/* Only description — simple and clean */}
                    {displayTitle && (
                        <p className="font-semibold text-gray-100 mb-1">{displayTitle}</p>
                    )}
                    {displayDescription && (
                        <p className="text-gray-300 leading-relaxed">{displayDescription}</p>
                    )}
                </div>
            )}
        </span>
    );
};

export default InfoTooltip;