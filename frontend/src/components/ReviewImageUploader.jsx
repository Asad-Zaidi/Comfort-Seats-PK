import { useState, useRef, useCallback } from "react";
import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ReviewImageUploader = ({ onImageChange, currentImage }) => {
    const [preview, setPreview] = useState(currentImage || null);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    const validateFile = (file) => {
        setError("");
        if (!file) return false;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("Unsupported format. Use JPG, JPEG, PNG, or WEBP.");
            return false;
        }

        if (file.size > MAX_SIZE) {
            setError("File is too large. Maximum size is 5MB.");
            return false;
        }

        return true;
    };

    const handleFile = useCallback((file) => {
        if (!validateFile(file)) {
            if (preview && !currentImage) {
                // Don't clear existing preview on validation failure if we had one
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
            setError("");
        };
        reader.readAsDataURL(file);
        onImageChange(file);
    }, [onImageChange, preview, currentImage]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
        // Reset input so the same file can be re-selected
        e.target.value = "";
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        setError("");
        onImageChange(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-[#0F1320]">
                Upload Product Image <span className="font-normal text-gray-400">(optional)</span>
            </label>

            {/* Drop zone */}
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition ${
                    dragOver
                        ? "border-[#2F6FED] bg-[#2F6FED]/5"
                        : preview
                        ? "border-[#10B981] bg-[#10B981]/5"
                        : "border-[#E5E7EB] bg-gray-50 hover:border-[#2F6FED] hover:bg-[#2F6FED]/5"
                }`}
            >
                {preview ? (
                    <div className="relative inline-block">
                        <img
                            src={preview}
                            alt="Review preview"
                            className="mx-auto max-h-48 rounded-lg object-contain shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600"
                            aria-label="Remove image"
                        >
                            <FiX size={14} />
                        </button>
                        <p className="mt-2 text-xs text-gray-500">Click or drag to replace</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F6FED]/10">
                            <FiUploadCloud className="text-xl text-[#2F6FED]" />
                        </div>
                        <p className="text-sm font-medium text-[#0F1320]">
                            Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-gray-400">
                            JPG, JPEG, PNG, or WEBP (max 5MB)
                        </p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleInputChange}
                    className="hidden"
                    aria-label="Upload review image"
                />
            </div>

            {/* Error message */}
            {error && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                    <FiImage size={12} />
                    {error}
                </p>
            )}
        </div>
    );
};

export default ReviewImageUploader;