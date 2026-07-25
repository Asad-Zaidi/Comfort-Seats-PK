import { useCallback, useEffect, useRef } from 'react';
import ImageUploadSlot from './ImageUploadSlot';
import InfoTooltip from './wizard/InfoTooltip';
import { WIZARD_HELP_CONTENT } from './wizard/productWizardHelpContent';

const MAX_IMAGES = 20;

const ProductImageUploader = ({
    images = [],
    onImagesChange,
    errors = {},
    disabled = false,
    label = 'Product Images',
    showValidation = false,
}) => {
    const previewUrlsRef = useRef([]);

    useEffect(() => {
        previewUrlsRef.current = images.map(img => img?.preview);
    }, [images]);

    useEffect(() => {
        const currentUrls = previewUrlsRef.current;
        return () => {
            currentUrls.forEach(url => {
                if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddImage = useCallback(() => {
        onImagesChange(prev => {
            if (prev.length >= MAX_IMAGES) return prev;
            return [...prev, null];
        });
    }, [onImagesChange]);

    const handleFileSelect = useCallback((index, file) => {
        onImagesChange(prev => {
            const next = [...prev];
            if (next[index]?.preview?.startsWith('blob:')) {
                URL.revokeObjectURL(next[index].preview);
            }
            next[index] = { file, preview: URL.createObjectURL(file) };
            return next;
        });
    }, [onImagesChange]);

    const handleRemove = useCallback((index) => {
        onImagesChange(prev => {
            const next = [...prev];
            if (next[index]?.preview?.startsWith('blob:')) {
                URL.revokeObjectURL(next[index].preview);
            }
            next.splice(index, 1);
            return next;
        });
    }, [onImagesChange]);

    const handleSetCover = useCallback((index) => {
        onImagesChange(prev => {
            return prev.map((img, i) => ({
                ...img,
                isCover: i === index,
            }));
        });
    }, [onImagesChange]);

    const uploadedCount = images.filter(Boolean).length;
    const canAddMore = uploadedCount < MAX_IMAGES;

    const errorArray = Array.isArray(errors) ? errors : (errors.images || []);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-[#12131A] flex items-center">
                        <span>{label}</span>
                        <InfoTooltip content={WIZARD_HELP_CONTENT.generalGallerySection} />
                    </h4>
                    <p className="text-xs text-gray-400">
                        Add at least 1 image. 1st Image will be the Main Cover Image. You can upload up to {MAX_IMAGES}.
                    </p>
                </div>
                <span className="text-xs font-medium text-gray-400">
                    {uploadedCount} image{uploadedCount !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                {/* Render uploaded images */}
                {images.map((img, idx) => {
                    if (!img) return null;
                    return (
                        <ImageUploadSlot
                            key={idx}
                            index={idx}
                            preview={img?.preview || null}
                            onFileSelect={handleFileSelect}
                            onRemove={handleRemove}
                            onSetCover={handleSetCover}
                            isCover={img?.isCover}
                            error={errorArray[idx] || null}
                            disabled={disabled}
                            showRemove={true}
                        />
                    );
                })}

                {/* Add Image button - always shown if can add more */}
                {canAddMore && (
                    <div className="col-span-1">
                        <ImageUploadSlot
                            key="add-image"
                            index={images.length}
                            preview={null}
                            onFileSelect={(index, file) => {
                                handleAddImage();
                                setTimeout(() => handleFileSelect(index, file), 0);
                            }}
                            onRemove={() => { }}
                            onSetCover={() => { }}
                            isCover={false}
                            error={null}
                            disabled={disabled}
                            showRemove={false}
                            isEmptySlot={true}
                        />
                    </div>
                )}
            </div>

            {/* Validation message - only show on submit attempt */}
            {showValidation && uploadedCount < 1 && (
                <p className="mt-3 text-xs text-red-600 font-medium">
                    At least 1 image is required.
                </p>
            )}
        </div>
    );
};

export default ProductImageUploader;
