import React from 'react';
import { FiGlobe } from 'react-icons/fi';
import InfoTooltip from './InfoTooltip';
import { WIZARD_HELP_CONTENT } from './productWizardHelpContent';

const SearchPreview = ({ metaTitle, name, metaDescription, shortDescription, description, slug, category }) => {
    const titleText = metaTitle || name || "Product Name | Comfort Seats PK";
    const displaySlug = slug || (name ? name.toLowerCase().replace(/\s+/g, '-') : 'executive-gaming-chair');
    const descText = metaDescription || shortDescription || description || "Premium ergonomic chair designed for maximum comfort and posture support. Free delivery across Pakistan.";
    
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FiGlobe size={14} />
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center">
                    <span>Google Search Result Preview</span>
                    <InfoTooltip content={WIZARD_HELP_CONTENT.searchPreview} />
                </h4>
            </div>

            {/* Google Search Card Preview */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 font-sans">
                {/* Site Header */}
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                        C
                    </div>
                    <div className="text-xs text-gray-700 font-medium leading-none">
                        Comfort Seats PK
                    </div>
                    <span className="text-xs text-gray-400">› product › {displaySlug}</span>
                </div>

                {/* Search Title */}
                <h3 className="text-base sm:text-lg font-medium text-blue-700 hover:underline cursor-pointer leading-snug line-clamp-1 mb-1">
                    {titleText}
                </h3>

                {/* Search Snippet */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {descText}
                </p>
            </div>
        </div>
    );
};

export default SearchPreview;
