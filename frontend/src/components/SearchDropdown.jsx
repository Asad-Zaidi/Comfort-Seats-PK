import { useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { getPrimaryImage } from "../utils/imageUtils";

const SearchResultItem = ({ product, isActive, onClick }) => {
    const image = useMemo(() => getPrimaryImage(product), [product]);
    const price = product?.price;
    const category = useMemo(() => {
        if (!product) return "";
        if (Array.isArray(product.category) && product.category.length > 0) {
            return product.category[0];
        }
        if (typeof product.category === "string") return product.category;
        return "";
    }, [product]);
    const brand = product?.brand || "";

    return (
        <button
            type="button"
            onClick={() => onClick(product)}
            className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition ${isActive ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
        >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                {image ? (
                    <img src={image} alt={product?.name || "Product"} className="h-full w-full object-cover" />
                ) : (
                    <FiSearch className="text-gray-300" size={20} />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{product?.name || "Product"}</p>
                <p className="truncate text-xs text-gray-500">
                    {category}
                    {brand ? ` · ${brand}` : ""}
                </p>
            </div>

            <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">Rs. {Number(price || 0).toLocaleString()}</p>
                <p className={`text-[11px] ${product?.inStock ? "text-green-600" : "text-red-500"}`}>
                    {product?.inStock ? "In Stock" : "Out of Stock"}
                </p>
            </div>
        </button>
    );
};

const SearchDropdown = ({ open, products = [], activeIndex, onSelect, onViewAll, totalResults = 0, query = "", isSearching = false, error = null, onClearError }) => {
    if (!open) return null;

    const trimmedQuery = String(query || "").trim();
    const hasResults = products.length > 0;
    const hasTotal = totalResults > 0;

    return (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl">
            <div className="max-h-[420px] overflow-y-auto">
                {error ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-800">
                        <p>{error}</p>
                        <button type="button" onClick={onClearError} className="mt-2 text-blue-600">
                            Dismiss
                        </button>
                    </div>
                ) : isSearching && !hasResults ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">Searching...</div>
                ) : hasResults ? (
                    <div className="p-2">
                        {products.map((product, index) => (
                            <SearchResultItem
                                key={product?._id || index}
                                product={product}
                                isActive={index === activeIndex}
                                onClick={onSelect}
                            />
                        ))}
                    </div>
                ) : trimmedQuery ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">No matching products found.</div>
                ) : null}
            </div>

            {hasTotal > 0 && (
                <div className="border-t">
                    <button
                        type="button"
                        onClick={onViewAll}
                        className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                        <FiSearch size={16} />
                        <span>View all results</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;