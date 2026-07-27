import { FaStar } from 'react-icons/fa';
import { FiMinus, FiPlus, FiHeart, FiShare2, FiCheck, FiShield, FiTruck } from 'react-icons/fi';

const PreviewProductDetail = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-family)' }}>
            {/* Breadcrumb */}
            <div className="px-6 pt-6 pb-2">
                <nav className="text-xs" style={{ color: 'var(--text-light)' }}>
                    Home <span className="mx-1">/</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Products</span> <span className="mx-1">/</span>
                    <span style={{ color: 'var(--primary)' }}>Executive Pro Chair</span>
                </nav>
            </div>

            <div className="px-6 py-4 grid grid-cols-2 gap-6">
                {/* ── Image Gallery ── */}
                <div>
                    <div
                        className="rounded-xl w-full h-52 flex items-center justify-center mb-3 relative"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
                    >
                        <span className="text-6xl">🪑</span>
                        <div
                            className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-bold text-white"
                            style={{ backgroundColor: 'var(--error)' }}
                        >
                            18% OFF
                        </div>
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                            <button
                                className="w-8 h-8 rounded-full flex items-center justify-center shadow"
                                style={{ backgroundColor: 'var(--card-bg)' }}
                            >
                                <FiHeart size={13} style={{ color: 'var(--error)' }} />
                            </button>
                            <button
                                className="w-8 h-8 rounded-full flex items-center justify-center shadow"
                                style={{ backgroundColor: 'var(--card-bg)' }}
                            >
                                <FiShare2 size={13} style={{ color: 'var(--text-secondary)' }} />
                            </button>
                        </div>
                    </div>
                    {/* Thumbnails */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(n => (
                            <div
                                key={n}
                                className="w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: n === 1 ? '2px solid var(--primary)' : '1px solid var(--border)',
                                }}
                            >
                                <span className="text-lg">🪑</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Product Info ── */}
                <div>
                    <div
                        className="inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-semibold"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                    >
                        Office
                    </div>
                    <h1 className="text-xl font-bold mb-2 leading-tight" style={{ color: 'var(--text)' }}>
                        Executive Pro Chair
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => <FaStar key={i} size={12} style={{ color: 'var(--rating-star-color)' }} />)}
                        </div>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>4.9</span>
                        <span className="text-xs" style={{ color: 'var(--text-light)' }}>(128 reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                        <span className="text-2xl font-bold mr-2" style={{ color: 'var(--product-discount-color, var(--error))' }}>
                            Rs. 45,000
                        </span>
                        <span className="text-sm line-through" style={{ color: 'var(--text-light)' }}>
                            Rs. 55,000
                        </span>
                    </div>

                    <p className="text-xs mb-4 leading-5" style={{ color: 'var(--text-secondary)' }}>
                        Premium executive chair with lumbar support, adjustable armrests, and breathable mesh back. Perfect for long working hours.
                    </p>

                    {/* Color variants */}
                    <div className="mb-4">
                        <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--label-color)' }}>Color: Black</span>
                        <div className="flex gap-2">
                            {['#1a1a1a', '#3b4f6b', '#8b5cf6', '#059669'].map((color, i) => (
                                <div
                                    key={i}
                                    className="w-7 h-7 rounded-full cursor-pointer"
                                    style={{
                                        backgroundColor: color,
                                        outline: i === 0 ? '2px solid var(--primary)' : 'none',
                                        outlineOffset: '2px',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-xs font-semibold" style={{ color: 'var(--label-color)' }}>Qty:</span>
                        <div
                            className="flex items-center gap-3 px-3 py-1.5 rounded-lg"
                            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)' }}
                        >
                            <FiMinus size={12} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                            <span className="text-sm font-semibold w-4 text-center" style={{ color: 'var(--text)' }}>1</span>
                            <FiPlus size={12} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mb-4">
                        <button
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                            style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text, #fff)' }}
                        >
                            Add to Cart
                        </button>
                        <button
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
                            style={{
                                backgroundColor: 'var(--btn-secondary-bg)',
                                color: 'var(--btn-secondary-text, #fff)',
                                borderColor: 'transparent',
                            }}
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { icon: FiShield, label: 'Warranty' },
                            { icon: FiTruck, label: 'Free Delivery' },
                            { icon: FiCheck, label: 'Authentic' },
                        ].map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center gap-1 p-2 rounded-lg text-center"
                                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                            >
                                <Icon size={14} style={{ color: 'var(--primary)' }} />
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Description / Reviews ── */}
            <div className="px-6 pb-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    {['Description', 'Reviews (128)', 'Specifications'].map((tab, i) => (
                        <button
                            key={tab}
                            className="pb-2 text-xs font-semibold"
                            style={{
                                color: i === 0 ? 'var(--primary)' : 'var(--text-secondary)',
                                borderBottom: i === 0 ? '2px solid var(--primary)' : '2px solid transparent',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <p className="text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
                    The Executive Pro Chair is engineered for extended productivity sessions. Features premium PU leather upholstery, 5-point nylon base, 360° swivel, and height-adjustable gas lift mechanism.
                </p>

                {/* Sample review */}
                <div
                    className="mt-4 p-4 rounded-xl"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: 'var(--primary)' }}>A</div>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Ahmed K.</span>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => <FaStar key={i} size={8} style={{ color: 'var(--rating-star-color)' }} />)}
                        </div>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        "Extremely comfortable! Best purchase for my home office setup."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PreviewProductDetail;
