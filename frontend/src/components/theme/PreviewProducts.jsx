import { FaStar } from 'react-icons/fa';
import { FiFilter, FiSearch } from 'react-icons/fi';

const mockProducts = [
    { id: 1, name: 'Executive Pro Chair', price: 'Rs. 45,000', oldPrice: 'Rs. 55,000', category: 'Office', badge: 'Sale' },
    { id: 2, name: 'Gaming Throne X', price: 'Rs. 38,500', oldPrice: null, category: 'Gaming', badge: 'New' },
    { id: 3, name: 'Luxury Manager Chair', price: 'Rs. 62,000', oldPrice: 'Rs. 70,000', category: 'Luxury', badge: null },
    { id: 4, name: 'Ergonomic Mesh Chair', price: 'Rs. 28,000', oldPrice: null, category: 'Office', badge: 'Best Seller' },
    { id: 5, name: 'Dining Set Deluxe', price: 'Rs. 85,000', oldPrice: null, category: 'Dining', badge: null },
    { id: 6, name: 'Outdoor Recliner', price: 'Rs. 35,000', oldPrice: 'Rs. 42,000', category: 'Outdoor', badge: 'Sale' },
];

const categories = ['All', 'Office', 'Gaming', 'Luxury', 'Dining', 'Outdoor'];

const PreviewProducts = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-family)' }}>

            {/* ── Page Header ── */}
            <div className="px-6 py-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <nav className="text-xs mb-3" style={{ color: 'var(--text-light)' }}>
                    <span>Home</span> <span className="mx-1">/</span>
                    <span style={{ color: 'var(--primary)' }}>Products</span>
                </nav>
                <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>All Products</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Showing {mockProducts.length} products
                </p>
            </div>

            <div className="flex gap-4 px-6 py-6">
                {/* ── Filters Sidebar ── */}
                <aside className="w-48 shrink-0">
                    {/* Search */}
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-sm"
                        style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
                    >
                        <FiSearch size={12} style={{ color: 'var(--input-placeholder)' }} />
                        <span className="text-xs" style={{ color: 'var(--input-placeholder)' }}>Search products...</span>
                    </div>

                    {/* Categories filter */}
                    <div
                        className="p-4 rounded-xl mb-4"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <FiFilter size={12} style={{ color: 'var(--primary)' }} />
                            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Categories</span>
                        </div>
                        {categories.map((cat, i) => (
                            <div key={cat} className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-3.5 h-3.5 rounded border flex items-center justify-center"
                                    style={{
                                        borderColor: i === 0 ? 'var(--primary)' : 'var(--border)',
                                        backgroundColor: i === 0 ? 'var(--primary)' : 'transparent',
                                    }}
                                >
                                    {i === 0 && <span className="text-white text-xs leading-none">✓</span>}
                                </div>
                                <span className="text-xs" style={{ color: i === 0 ? 'var(--primary)' : 'var(--text-secondary)' }}>{cat}</span>
                            </div>
                        ))}
                    </div>

                    {/* Price range */}
                    <div
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
                    >
                        <span className="text-xs font-semibold mb-3 block" style={{ color: 'var(--text)' }}>Price Range</span>
                        <div className="h-1.5 rounded-full mb-3" style={{ backgroundColor: 'var(--border)' }}>
                            <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Rs. 0</span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Rs. 90,000</span>
                        </div>
                    </div>
                </aside>

                {/* ── Products Grid ── */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        {mockProducts.map(product => (
                            <div
                                key={product.id}
                                className="rounded-xl overflow-hidden cursor-pointer"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    border: 'var(--card-border-width, 1px) solid var(--card-border)',
                                    borderRadius: 'var(--card-border-radius)',
                                    boxShadow: 'var(--card-shadow)',
                                }}
                            >
                                <div
                                    className="h-32 relative flex items-center justify-center"
                                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                                >
                                    <span className="text-4xl">🪑</span>
                                    {product.badge && (
                                        <div
                                            className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-bold text-white"
                                            style={{
                                                backgroundColor: product.badge === 'Sale' ? 'var(--error)'
                                                    : product.badge === 'New' ? 'var(--success)'
                                                        : 'var(--secondary)'
                                            }}
                                        >
                                            {product.badge}
                                        </div>
                                    )}
                                    <div
                                        className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full font-medium"
                                        style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                                    >
                                        {product.category}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-xs font-semibold line-clamp-1 mb-1" style={{ color: 'var(--product-name-color, var(--text))' }}>
                                        {product.name}
                                    </h3>
                                    <div className="flex mb-2">
                                        {[...Array(5)].map((_, i) => <FaStar key={i} size={8} style={{ color: 'var(--rating-star-color)' }} />)}
                                        <span className="text-xs ml-1" style={{ color: 'var(--text-light)' }}>(4.8)</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-bold block" style={{ color: product.oldPrice ? 'var(--product-discount-color, var(--error))' : 'var(--product-price-color, var(--primary))' }}>
                                                {product.price}
                                            </span>
                                            {product.oldPrice && (
                                                <span className="text-xs line-through" style={{ color: 'var(--text-light)' }}>
                                                    {product.oldPrice}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                                            style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text, #fff)' }}
                                        >
                                            Buy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-6">
                        {[1, 2, 3, '...', 8].map((p, i) => (
                            <button
                                key={i}
                                className="w-8 h-8 rounded-lg text-xs font-medium"
                                style={{
                                    backgroundColor: p === 1 ? 'var(--primary)' : 'var(--card-bg)',
                                    color: p === 1 ? '#fff' : 'var(--text-secondary)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewProducts;
