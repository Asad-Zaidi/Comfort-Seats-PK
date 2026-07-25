import React from 'react';
import { FiShare2, FiImage } from 'react-icons/fi';
import InfoTooltip from './InfoTooltip';
import { WIZARD_HELP_CONTENT } from './productWizardHelpContent';

const SocialPreview = ({ metaOgTitle, metaTitle, name, metaOgDescription, metaDescription, shortDescription, imagePreview }) => {
    const titleText = metaOgTitle || metaTitle || name || "Product Name | Comfort Seats PK";
    const descText = metaOgDescription || metaDescription || shortDescription || "Explore our high quality gaming and ergonomic office chairs.";
    const displayImage = imagePreview || "";

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FiShare2 size={14} />
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center">
                    <span>Social Card Preview (Facebook / Open Graph)</span>
                    <InfoTooltip content={WIZARD_HELP_CONTENT.socialPreview} />
                </h4>
            </div>

            {/* Social Card Box */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden font-sans shadow-xs max-w-md mx-auto sm:mx-0">
                {/* Media Banner */}
                <div className="relative aspect-[1.91/1] w-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt="Social preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                            <FiImage size={32} className="mb-1 text-gray-300" />
                            <span className="text-xs font-semibold text-gray-600">No Image Uploaded Yet</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Upload product or color images in Step 2</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
                        OG Preview
                    </div>
                </div>

                {/* Content Box */}
                <div className="p-3.5 bg-white border-t border-gray-100">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-0.5">
                        COMFORTSEATSPK.COM
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1 mb-1">
                        {titleText}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {descText}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SocialPreview;
