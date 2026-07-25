import { useCallback, useState } from 'react';
import { FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ImageUploadSlot from './ImageUploadSlot';
import InfoTooltip from './wizard/InfoTooltip';
import { WIZARD_HELP_CONTENT } from './wizard/productWizardHelpContent';

const PREDEFINED_STAND_TYPES = [
    { type: 'Metallic', label: 'Metallic Stand' },
];

const StandTypeCard = ({
    standType,
    index,
    onChange,
    onRemove,
    errors = {},
    disabled = false,
}) => {
    const [expanded, setExpanded] = useState(true);
    const isCustom = !PREDEFINED_STAND_TYPES.find(st => st.type === standType.type);

    const handleTypeChange = useCallback((e) => {
        onChange(index, { ...standType, type: e.target.value });
    }, [index, standType, onChange]);

    const handlePriceChange = useCallback((e) => {
        onChange(index, { ...standType, price: e.target.value });
    }, [index, standType, onChange]);

    const handleImageSelect = useCallback((imgIndex, file) => {
        const newImages = [...(standType.images || [])];
        if (newImages[imgIndex]?.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(newImages[imgIndex].preview);
        }
        newImages[imgIndex] = { file, preview: URL.createObjectURL(file) };
        onChange(index, { ...standType, images: newImages });
    }, [index, standType, onChange]);

    const handleImageRemove = useCallback((imgIndex) => {
        const newImages = [...(standType.images || [])];
        if (newImages[imgIndex]?.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(newImages[imgIndex].preview);
        }
        newImages[imgIndex] = null;
        onChange(index, { ...standType, images: newImages });
    }, [index, standType, onChange]);

    const handleSetCover = useCallback((imgIndex) => {
        const newImages = (standType.images || []).map((img, i) => ({
            ...img,
            isCover: i === imgIndex,
        }));
        onChange(index, { ...standType, images: newImages });
    }, [index, standType, onChange]);

    const handleAddMore = useCallback(() => {
        const newImages = [...(standType.images || []), null];
        onChange(index, { ...standType, images: newImages });
    }, [index, standType, onChange]);

    const images = (standType.images && standType.images.length > 0) ? standType.images : [null];
    const imageErrors = errors.images || [];

    return (
        <div className={`rounded-xl border transition ${errors.type ? 'border-[#E5484D]' : 'border-gray-200'
            } bg-white overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#12131A] truncate">
                            {standType.type || `Stand Type ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-400">
                            {images.filter(Boolean).length} image{images.filter(Boolean).length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                    >
                        {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </button>
                    {onRemove && (
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            disabled={disabled}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                            aria-label={`Remove ${standType.type || 'stand type'}`}
                        >
                            <FiX size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="p-4 space-y-4">
                    {/* Stand Type Name */}
                    <div>
                        <label className="mb-1 flex items-center text-xs font-medium text-gray-500">
                            <span>Stand Type</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.metallicStandToggle} />
                        </label>
                        <select
                            value={standType.type || ''}
                            onChange={handleTypeChange}
                            className={`block w-full rounded-lg border px-3 py-2 pr-9 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10 ${errors.type ? 'border-[#E5484D] bg-[#E5484D]/5' : 'border-gray-200 bg-gray-50'
                                }`}
                            disabled={disabled}
                        >
                            <option value="">Select a stand type</option>
                            {PREDEFINED_STAND_TYPES.map((st) => (
                                <option key={st.type} value={st.type}>
                                    {st.label}
                                </option>
                            ))}
                            <option value="custom">Custom...</option>
                        </select>
                        {errors.type && (
                            <p className="mt-0.5 text-[10px] font-medium text-[#E5484D]">{errors.type}</p>
                        )}
                    </div>

                    {/* Custom type input */}
                    {isCustom && (
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">Custom Stand Type Name</label>
                            <input
                                type="text"
                                value={standType.type || ''}
                                onChange={handleTypeChange}
                                placeholder="e.g., Wooden Stand"
                                className={`block w-full rounded-lg border px-3 py-2 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10 ${errors.type ? 'border-[#E5484D] bg-[#E5484D]/5' : 'border-gray-200 bg-gray-50'
                                    }`}
                                disabled={disabled}
                            />
                        </div>
                    )}

                    {/* Additional Price */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Additional Price (optional)</label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs.</span>
                            <input
                                type="number"
                                value={standType.price ?? ''}
                                onChange={handlePriceChange}
                                min="0"
                                step="0.01"
                                placeholder="0"
                                className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                disabled={disabled}
                            />
                        </div>
                    </div>

                    {/* Stand Type Images Dynamic Gallery */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Stand Type Images
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
                                    preview={img?.preview || img?.url || (typeof img === 'string' ? img : null)}
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
                </div>
            )}
        </div>
    );
};

export default StandTypeCard;