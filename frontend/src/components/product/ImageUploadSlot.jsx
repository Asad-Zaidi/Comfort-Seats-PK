import { useCallback, useState } from 'react';
import { FiUploadCloud, FiX, FiImage, FiStar } from 'react-icons/fi';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ImageUploadSlot = ({
    index,
    preview,
    onFileSelect,
    onRemove,
    onSetCover,
    isCover = false,
    error,
    disabled = false,
    showRemove = true,
    isEmptySlot = false,
}) => {
    const [dragOver, setDragOver] = useState(false);
    const [validationError, setValidationError] = useState(null);

    const validateFile = useCallback((file) => {
        if (!file) return 'No file selected.';
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return 'Invalid file type. Accepted: JPG, JPEG, PNG, WEBP.';
        }
        if (file.size > MAX_SIZE) {
            return `File size exceeds 5MB limit.`;
        }
        return null;
    }, []);

    const handleFile = useCallback((file) => {
        const err = validateFile(file);
        if (err) {
            setValidationError(err);
            return;
        }
        setValidationError(null);
        onFileSelect(index, file);
    }, [index, onFileSelect, validateFile]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleInputChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = '';
    }, [handleFile]);

    const displayError = validationError || error;

    return (
        <div className="relative flex flex-col items-center">
            {preview ? (
                <div className="group relative aspect-square w-full overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50">
                    <img
                        src={preview}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                    />
                    {/* Cover badge */}
                    {isCover && (
                        <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-[#F5A524]/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                            <FiStar size={10} fill="white" />
                            Cover
                        </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                        <div className="flex items-center gap-1.5 opacity-0 transition group-hover:opacity-100">
                            <label className="cursor-pointer rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100">
                                Replace
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleInputChange}
                                    disabled={disabled}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute right-1.5 bottom-1.5 flex gap-1">
                        {/* Set as cover */}
                        {!isCover && onSetCover && (
                            <button
                                type="button"
                                onClick={() => onSetCover(index)}
                                disabled={disabled}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-gray-500 opacity-0 shadow-sm transition hover:bg-[#F5A524] hover:text-white group-hover:opacity-100"
                                title="Set as cover"
                            >
                                <FiStar size={11} />
                            </button>
                        )}
                        {/* Remove */}
                        {showRemove && onRemove && (
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                disabled={disabled}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-gray-500 opacity-0 shadow-sm transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
                                aria-label={`Remove image ${index + 1}`}
                            >
                                <FiX size={11} />
                            </button>
                        )}
                    </div>

                    {/* Slot number badge */}
                    <span className="absolute left-1.5 bottom-1.5 rounded-md bg-[#0F1320]/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                        {index + 1}
                    </span>
                </div>
            ) : (
                <label
                    className={`flex w-full cursor-pointer flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed transition ${
                        dragOver
                            ? 'border-[#2F6FED] bg-[#2F6FED]/5'
                            : displayError
                                ? 'border-[#E5484D] bg-[#E5484D]/5'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleInputChange}
                        disabled={disabled}
                    />
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F6FED]/10 text-[#2F6FED]">
                        {dragOver ? <FiImage size={16} /> : <FiUploadCloud size={16} />}
                    </span>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">
                        {dragOver ? 'Drop' : isEmptySlot ? 'Add Image' : `Slot ${index + 1}`}
                    </p>
                </label>
            )}

            {displayError && (
                <p className="mt-1 text-[10px] font-medium text-[#E5484D] text-center leading-tight">
                    {displayError}
                </p>
            )}
        </div>
    );
};

export default ImageUploadSlot;