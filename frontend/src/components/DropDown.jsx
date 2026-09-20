import { useState, useRef, useEffect, useMemo } from "react";
import { FiChevronDown, FiCheck, FiSearch, FiX } from "react-icons/fi";

/**
 * Custom DropDown component tailored to ComfortSeats design system.
 *
 * @param {string|number} value - Selected option value
 * @param {function} onChange - Callback invoked with new value
 * @param {Array} options - List of options. Can be strings, { label, value }, or { group, items: [...] }
 * @param {string} placeholder - Default placeholder when nothing is selected
 * @param {string} disabledPlaceholder - Placeholder when dropdown is disabled
 * @param {boolean} disabled - Disable the dropdown
 * @param {boolean} searchable - Show search input inside dropdown menu
 * @param {string} error - Error message string (highlights red border)
 * @param {string} id - HTML id attribute
 * @param {string} className - Extra wrapper classes
 */
export default function DropDown({
    value = "",
    onChange,
    options = [],
    placeholder = "-- Select an option --",
    disabledPlaceholder,
    disabled = false,
    searchable = false,
    error = null,
    id,
    className = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchQuery("");
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Focus search input on open
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen, searchable]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
                setSearchQuery("");
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    // Normalize options into groups or flat items
    const normalizedData = useMemo(() => {
        const groups = [];
        const flatItems = [];

        options.forEach((opt) => {
            if (opt && typeof opt === "object" && Array.isArray(opt.items)) {
                // Grouped structure: { group: 'Punjab', items: ['Lahore', 'Multan'] }
                groups.push({
                    group: opt.group,
                    items: opt.items.map((item) =>
                        typeof item === "object" ? item : { label: item, value: item }
                    ),
                });
            } else {
                // Flat item
                const item =
                    typeof opt === "object" && opt !== null
                        ? opt
                        : { label: String(opt), value: String(opt) };
                flatItems.push(item);
            }
        });

        return { groups, flatItems };
    }, [options]);

    // Filter options by search query
    const filteredData = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return normalizedData;

        const filteredGroups = normalizedData.groups
            .map((grp) => ({
                group: grp.group,
                items: grp.items.filter(
                    (it) =>
                        it.label.toLowerCase().includes(query) ||
                        String(it.value).toLowerCase().includes(query)
                ),
            }))
            .filter((grp) => grp.items.length > 0);

        const filteredFlat = normalizedData.flatItems.filter(
            (it) =>
                it.label.toLowerCase().includes(query) ||
                String(it.value).toLowerCase().includes(query)
        );

        return { groups: filteredGroups, flatItems: filteredFlat };
    }, [normalizedData, searchQuery]);

    // Find display label for current value
    const selectedLabel = useMemo(() => {
        if (!value) return null;

        // Check flat items
        const flatFound = normalizedData.flatItems.find((it) => it.value === value);
        if (flatFound) return flatFound.label;

        // Check grouped items
        for (const grp of normalizedData.groups) {
            const grpFound = grp.items.find((it) => it.value === value);
            if (grpFound) return grpFound.label;
        }

        return String(value);
    }, [value, normalizedData]);

    const handleSelect = (val) => {
        if (onChange) onChange(val);
        setIsOpen(false);
        setSearchQuery("");
    };

    const displayPlaceholder = disabled && disabledPlaceholder
        ? disabledPlaceholder
        : placeholder;

    const hasOptions =
        filteredData.flatItems.length > 0 || filteredData.groups.length > 0;

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Dropdown Trigger Button */}
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => {
                    if (!disabled) setIsOpen(!isOpen);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 outline-hidden ${
                    disabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:border-[var(--primary,#2F6FED)]"
                } ${
                    error
                        ? "border-red-500 ring-1 ring-red-500"
                        : isOpen
                        ? "border-[var(--primary,#2F6FED)] ring-2 ring-[var(--primary,#2F6FED)]/20 shadow-xs"
                        : "border-[var(--input-border,#e5e7eb)]"
                }`}
                style={{
                    backgroundColor: disabled
                        ? "var(--bg-secondary, #f8fafc)"
                        : "var(--input-bg, #ffffff)",
                    color: selectedLabel
                        ? "var(--text, #12131A)"
                        : "var(--text-light, #9ca3af)",
                }}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="truncate">
                    {selectedLabel || displayPlaceholder}
                </span>

                <FiChevronDown
                    size={16}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[var(--primary,#2F6FED)]" : ""
                    }`}
                />
            </button>

            {/* Dropdown Popup Menu */}
            {isOpen && !disabled && (
                <div
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border bg-white shadow-xl transition-all duration-200"
                    style={{
                        backgroundColor: "var(--card-bg, #ffffff)",
                        borderColor: "var(--border, #e5e7eb)",
                    }}
                    role="listbox"
                >
                    {/* Search Input (Optional) */}
                    {searchable && (
                        <div
                            className="border-b p-2"
                            style={{ borderColor: "var(--border, #e5e7eb)" }}
                        >
                            <div className="relative flex items-center">
                                <FiSearch
                                    size={14}
                                    className="absolute left-3 text-gray-400"
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full rounded-lg border py-1.5 pl-8 pr-8 text-xs outline-hidden focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/20"
                                    style={{
                                        backgroundColor: "var(--bg-secondary, #f8fafc)",
                                        borderColor: "var(--border, #e5e7eb)",
                                        color: "var(--text, #12131A)",
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        <FiX size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Scrollable Options List */}
                    <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
                        {!hasOptions ? (
                            <div className="px-4 py-3 text-center text-xs text-gray-400">
                                No options found
                            </div>
                        ) : (
                            <>
                                {/* Flat Items */}
                                {filteredData.flatItems.map((item) => {
                                    const isSelected = item.value === value;
                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => handleSelect(item.value)}
                                            className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 ${
                                                isSelected
                                                    ? "bg-[color-mix(in_srgb,var(--primary,#2F6FED)_14%,transparent)] font-semibold text-[var(--primary,#2F6FED)]"
                                                    : "text-[var(--text,#1f2937)]"
                                            } hover:bg-[var(--primary,#2F6FED)] hover:!text-white hover:shadow-xs`}
                                        >
                                            <span className="truncate group-hover:text-white">{item.label}</span>
                                            {isSelected && (
                                                <FiCheck
                                                    size={16}
                                                    className="shrink-0 text-[var(--primary,#2F6FED)] group-hover:text-white transition-colors"
                                                />
                                            )}
                                        </button>
                                    );
                                })}

                                {/* Grouped Items */}
                                {filteredData.groups.map((group) => (
                                    <div key={group.group} className="mb-2 last:mb-0">
                                        <div
                                            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400"
                                            style={{ color: "var(--text-secondary, #6b7280)" }}
                                        >
                                            {group.group}
                                        </div>
                                        <div className="space-y-0.5">
                                            {group.items.map((item) => {
                                                const isSelected = item.value === value;
                                                return (
                                                    <button
                                                        key={item.value}
                                                        type="button"
                                                        onClick={() => handleSelect(item.value)}
                                                        className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 ${
                                                            isSelected
                                                                ? "bg-[color-mix(in_srgb,var(--primary,#2F6FED)_14%,transparent)] font-semibold text-[var(--primary,#2F6FED)]"
                                                                : "text-[var(--text,#1f2937)]"
                                                        } hover:bg-[var(--primary,#2F6FED)] hover:!text-white hover:shadow-xs`}
                                                    >
                                                        <span className="truncate group-hover:text-white">{item.label}</span>
                                                        {isSelected && (
                                                            <FiCheck
                                                                size={16}
                                                                className="shrink-0 text-[var(--primary,#2F6FED)] group-hover:text-white transition-colors"
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
