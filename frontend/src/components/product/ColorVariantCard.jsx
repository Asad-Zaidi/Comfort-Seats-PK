import { useCallback, useRef, useState } from 'react';
import { FiX, FiChevronDown, FiChevronUp, FiCheckCircle } from 'react-icons/fi';
import ImageUploadSlot from './ImageUploadSlot';
import InfoTooltip from './wizard/InfoTooltip';
import { WIZARD_HELP_CONTENT } from './wizard/productWizardHelpContent';
import { PREDEFINED_COLORS } from '../../utils/ColorName';

const ColorVariantCard = ({
    color,
    index,
    onChange,
    onRemove,
    onSetDefault,
    errors = {},
    disabled = false,
    showImages = true,
    hidePricingAndStock = false,
}) => {
    const [expanded, setExpanded] = useState(true);
    const colorInputRef = useRef(null);
    const isCustom = !color.hex || !PREDEFINED_COLORS.find(pc => pc.hex === color.hex);

    const handleNameChange = useCallback((e) => {
        onChange(index, { ...color, name: e.target.value });
    }, [index, color, onChange]);

    const handleHexChange = useCallback((e) => {
        onChange(index, { ...color, hex: e.target.value });
    }, [index, color, onChange]);

    const handlePriceChange = useCallback((e) => {
        onChange(index, { ...color, price: e.target.value });
    }, [index, color, onChange]);

    const handleStockChange = useCallback((e) => {
        onChange(index, { ...color, stock: Number(e.target.value) });
    }, [index, color, onChange]);

    const handleInStockChange = useCallback((e) => {
        onChange(index, { ...color, inStock: e.target.checked });
    }, [index, color, onChange]);

    const handleImageSelect = useCallback((imgIndex, file) => {
        const newImages = [...(color.images || [])];
        if (newImages[imgIndex]?.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(newImages[imgIndex].preview);
        }
        newImages[imgIndex] = { file, preview: URL.createObjectURL(file) };
        onChange(index, { ...color, images: newImages });
    }, [index, color, onChange]);

    const handleImageRemove = useCallback((imgIndex) => {
        const newImages = [...(color.images || [])];
        if (newImages[imgIndex]?.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(newImages[imgIndex].preview);
        }
        newImages[imgIndex] = null;
        onChange(index, { ...color, images: newImages });
    }, [index, color, onChange]);

    const handleSetCover = useCallback((imgIndex) => {
        const newImages = (color.images || []).map((img, i) => ({
            ...img,
            isCover: i === imgIndex,
        }));
        onChange(index, { ...color, images: newImages });
    }, [index, color, onChange]);

    const handleAddMore = useCallback(() => {
        const newImages = [...(color.images || []), null];
        onChange(index, { ...color, images: newImages });
    }, [index, color, onChange]);

    const handleColorSelect = useCallback((e) => {
        const selected = PREDEFINED_COLORS.find(c => c.hex === e.target.value);
        if (selected) {
            onChange(index, { ...color, name: selected.name, hex: selected.hex });
        } else if (e.target.value === 'custom') {
            onChange(index, { ...color, hex: '#000000', name: '' });
        }
    }, [index, color, onChange]);

    const images = (color.images && color.images.length > 0) ? color.images : [null];
    const imageErrors = errors.images || [];

    return (
        <div className={`rounded-xl border transition ${color.isDefault ? 'ring-2 ring-[#2F6FED]/40 border-[#2F6FED]' : (errors.name || errors.hex ? 'border-[#E5484D]' : 'border-gray-200')
            } bg-white overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                        className="h-6 w-6 shrink-0 rounded-full border border-gray-200"
                        style={{ backgroundColor: color.hex || '#CCCCCC' }}
                    />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#12131A] truncate">
                                {color.name || `Color ${index + 1}`}
                            </p>
                            {color.isDefault && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#2F6FED]/10 px-2 py-0.5 text-[10px] font-bold text-[#2F6FED]">
                                    <FiCheckCircle size={10} /> Default Color
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">
                            {color.hex || 'No hex'} · {images.filter(Boolean).length} image{images.filter(Boolean).length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onSetDefault && (
                        <button
                            type="button"
                            onClick={() => onSetDefault(index)}
                            disabled={disabled}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${color.isDefault
                                    ? 'bg-[#2F6FED] text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <input
                                type="radio"
                                name={`defaultColorRadio_${index}`}
                                checked={!!color.isDefault}
                                onChange={() => { }}
                                className="pointer-events-none h-3 w-3 accent-white"
                            />
                            <span>{color.isDefault ? "Default" : "Make Default"}</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                    >
                        {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        disabled={disabled}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove ${color.name || 'color'}`}
                    >
                        <FiX size={16} />
                    </button>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="p-4 space-y-4">
                    {/* Color Name & Color Picker */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 flex items-center text-xs font-medium text-gray-500">
                                <span>Color Name</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.colorVariantsSection} />
                            </label>
                            <input
                                type="text"
                                value={color.name || ''}
                                onChange={handleNameChange}
                                placeholder="e.g., Black"
                                className={`block w-full rounded-lg border px-3 py-2 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10 ${errors.name ? 'border-[#E5484D] bg-[#E5484D]/5' : 'border-gray-200 bg-gray-50'
                                    }`}
                                disabled={disabled}
                            />
                            {errors.name && (
                                <p className="mt-0.5 text-[10px] font-medium text-[#E5484D]">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 flex items-center text-xs font-medium text-gray-500">
                                <span>Color</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.colorVariantsSection} />
                            </label>
                            <div className="relative">
                                <select
                                    value={isCustom ? 'custom' : (color.hex || '')}
                                    onChange={handleColorSelect}
                                    className={`block w-full rounded-lg border px-3 py-2 pr-9 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10 ${errors.hex ? 'border-[#E5484D] bg-[#E5484D]/5' : 'border-gray-200 bg-gray-50'
                                        }`}
                                    disabled={disabled}
                                >
                                    <option value="">Select a color</option>
                                    {PREDEFINED_COLORS.map((pc) => (
                                        <option key={pc.hex} value={pc.hex}>
                                            {pc.name}
                                        </option>
                                    ))}
                                    <option value="custom">Custom...</option>
                                </select>
                                <div
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded border border-gray-200 pointer-events-none"
                                    style={{ backgroundColor: color.hex || '#CCCCCC' }}
                                />
                            </div>
                            {errors.hex && (
                                <p className="mt-0.5 text-[10px] font-medium text-[#E5484D]">{errors.hex}</p>
                            )}
                        </div>
                    </div>

                    {/* Custom hex input - shown when custom is selected */}
                    {isCustom && (
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Hex Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={color.hex || ''}
                                        onChange={handleHexChange}
                                        placeholder="#000000"
                                        className={`block w-full rounded-lg border px-3 py-2 pl-9 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10 ${errors.hex ? 'border-[#E5484D] bg-[#E5484D]/5' : 'border-gray-200 bg-gray-50'
                                            }`}
                                        disabled={disabled}
                                    />
                                    <div
                                        className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded border border-gray-200 cursor-pointer"
                                        style={{ backgroundColor: color.hex || '#CCCCCC' }}
                                        onClick={() => colorInputRef.current?.click()}
                                    />
                                    <input
                                        ref={colorInputRef}
                                        type="color"
                                        value={color.hex || '#000000'}
                                        onChange={handleHexChange}
                                        className="sr-only"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price & Stock */}
                    {!hidePricingAndStock && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Price (optional)</label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs.</span>
                                        <input
                                            type="number"
                                            value={color.price ?? ''}
                                            onChange={handlePriceChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="Same as base"
                                            className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                            disabled={disabled}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Stock</label>
                                    <input
                                        type="number"
                                        value={color.stock ?? 0}
                                        onChange={handleStockChange}
                                        min="0"
                                        className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                        disabled={disabled}
                                    />
                                </div>
                            </div>

                            {/* In Stock toggle */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={color.inStock !== false}
                                    onChange={handleInStockChange}
                                    className="h-4 w-4 rounded border-gray-300 text-[#2F6FED] focus:ring-[#2F6FED]"
                                    disabled={disabled}
                                />
                                <span className="text-sm font-medium text-[#12131A]">In Stock</span>
                            </label>
                        </>
                    )}

                    {/* Color Images Dynamic Gallery */}
                    {showImages && (
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Color Images
                                </label>
                                <span className="text-[10px] font-medium text-gray-400">
                                    {images.filter(Boolean).length} image{images.filter(Boolean).length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                                {images.map((img, imgIdx) => (
                                    <ImageUploadSlot
                                        key={imgIdx}
                                        index={imgIdx}
                                        preview={img?.preview || null}
                                        onFileSelect={handleImageSelect}
                                        onRemove={handleImageRemove}
                                        onSetCover={handleSetCover}
                                        isCover={img?.isCover}
                                        error={imageErrors[imgIdx] || null}
                                        disabled={disabled}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddMore}
                                    disabled={disabled}
                                    className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span className="text-2xl font-light">+</span>
                                    <span className="text-[10px] font-medium">Add</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ColorVariantCard;