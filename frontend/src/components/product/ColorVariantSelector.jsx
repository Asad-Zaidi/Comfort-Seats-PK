import { useMemo } from 'react';

const ColorVariantSelector = ({
    colors = [],
    selectedColor,
    onColorSelect,
    selectedVariant = null,
}) => {
    // Find the selected variant details
    const selectedInfo = useMemo(() => {
        if (!selectedColor || !colors.length) return null;
        return colors.find(c => c.hex === selectedColor || c.name === selectedColor) || null;
    }, [colors, selectedColor]);

    if (!colors || colors.length === 0) return null;

    return (
        <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#12131A]">
                    Color
                    {colors.length > 1 && (
                        <span className="ml-1 font-normal text-gray-400">({colors.length} options)</span>
                    )}
                </span>
                {selectedInfo && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-[#2F6FED]">
                        <span
                            className="h-3.5 w-3.5 rounded-full border border-gray-200"
                            style={{ backgroundColor: selectedInfo.hex || '#CCCCCC' }}
                        />
                        <span>{selectedInfo.name}</span>
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2.5">
                {colors.map((color, idx) => {
                    const colorValue = color.hex || color.name;
                    const isActive = selectedColor === colorValue;

                    return (
                        <button
                            key={`${colorValue}-${idx}`}
                            type="button"
                            onClick={() => onColorSelect(colorValue)}
                            title={color.name}
                            aria-pressed={isActive}
                            disabled={color.inStock === false}
                            className={`
                                relative flex items-center gap-2 rounded-xl border-2 px-3.5 py-2.5 text-sm font-semibold
                                transition-all duration-200
                                ${isActive
                                    ? 'border-[#2F6FED] bg-[#2F6FED]/5 text-[#2F6FED] shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                                }
                                ${color.inStock === false ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {/* Color swatch */}
                            <span
                                className={`h-5 w-5 rounded-full border-2 shrink-0 ${
                                    isActive ? 'border-[#2F6FED]' : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: color.hex || '#CCCCCC' }}
                            />
                            {/* Color name */}
                            <span className="whitespace-nowrap">{color.name}</span>

                            {/* Active indicator */}
                            {isActive && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2F6FED] text-[8px] text-white shadow-sm">
                                    ✓
                                </span>
                            )}

                            {/* Out of stock indicator */}
                            {color.inStock === false && (
                                <span className="text-[10px] text-gray-400 font-medium">(OOS)</span>
                            )}
                        </button>
                    );
                })}
            </div>

        </div>
    );
};

export default ColorVariantSelector;