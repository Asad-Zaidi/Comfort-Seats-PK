import { useCallback } from 'react';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
import ColorVariantCard from './ColorVariantCard';

const ColorVariantManager = ({
    colors = [],
    onColorsChange,
    errors = {},
    disabled = false,
    showImages = true,
    hidePricingAndStock = false,
}) => {
    const colorsList = Array.isArray(colors) ? colors : [];
    const hasColors = colorsList.length > 0;
    const globalError = errors._global;

    const handleSetDefault = useCallback((defaultIndex) => {
        onColorsChange(prev => {
            const list = Array.isArray(prev) ? prev : [];
            return list.map((c, i) => ({
                ...c,
                isDefault: i === defaultIndex,
            }));
        });
    }, [onColorsChange]);

    const addColor = useCallback(() => {
        onColorsChange(prev => {
            const list = Array.isArray(prev) ? prev : [];
            const isFirst = list.length === 0;
            return [
                ...list,
                {
                    name: '',
                    hex: '#000000',
                    price: '',
                    stock: 0,
                    inStock: true,
                    isDefault: isFirst,
                    images: [null],
                },
            ];
        });
    }, [onColorsChange]);

    const handleColorChange = useCallback((index, updatedColor) => {
        onColorsChange(prev => {
            const next = [...prev];
            next[index] = updatedColor;
            return next;
        });
    }, [onColorsChange]);

    const handleRemoveColor = useCallback((index) => {
        onColorsChange(prev => {
            const list = Array.isArray(prev) ? prev : [];
            const wasDefault = list[index]?.isDefault;
            const next = list.filter((_, i) => i !== index);
            if (wasDefault && next.length > 0) {
                next[0] = { ...next[0], isDefault: true };
            }
            return next;
        });
    }, [onColorsChange]);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-[#12131A]">Color Variants</h4>
                    <p className="text-xs text-gray-400">
                        {showImages
                            ? "Add at least one color variant with images."
                            : "Add color options (name, hex code, price, stock). Upload variant images in Step 2."}
                    </p>
                </div>
                {hasColors && (
                    <span className="text-xs font-medium text-gray-400">
                        {colorsList.length} color{colorsList.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Global error */}
            {globalError && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-[#E5484D]/10 px-3 py-2 text-xs font-medium text-[#E5484D]">
                    <FiAlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{globalError}</span>
                </div>
            )}

            {/* Empty state */}
            {!hasColors && (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                    <FiAlertCircle size={24} className="text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-500">No color variants added yet</p>
                    <p className="mt-1 text-xs text-gray-400 mb-4">
                        A product must have at least one color variant to be created
                    </p>
                </div>
            )}

            {/* Color cards */}
            {hasColors && (
                <div className="space-y-3">
                    {colorsList.map((color, idx) => {
                        const colorErrors = errors[idx] || {};
                        return (
                            <ColorVariantCard
                                key={idx}
                                color={color}
                                index={idx}
                                onChange={handleColorChange}
                                onRemove={handleRemoveColor}
                                onSetDefault={handleSetDefault}
                                errors={colorErrors}
                                disabled={disabled}
                                showImages={showImages}
                                hidePricingAndStock={hidePricingAndStock}
                            />
                        );
                    })}
                </div>
            )}

            {/* Add color button */}
            <button
                type="button"
                onClick={addColor}
                disabled={disabled}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm font-semibold text-[#2F6FED] transition hover:border-[#2F6FED] hover:bg-[#2F6FED]/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <FiPlus size={16} />
                Add Color Variant
            </button>

            <p className="mt-2 text-xs text-gray-400">
                Choose from predefined colors or use the color picker to set custom hex codes
            </p>
        </div>
    );
};

export default ColorVariantManager;