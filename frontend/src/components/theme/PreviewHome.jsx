import { FaStar } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

const mockProducts = [
    { id: 1, name: 'Executive Pro Chair', price: 'Rs. 45,000', oldPrice: 'Rs. 55,000', badge: 'Best Seller', badgeColor: 'secondary', category: 'Office', discount: '18% OFF' },
    { id: 2, name: 'Gaming Throne X', price: 'Rs. 38,500', oldPrice: null, badge: 'New', badgeColor: 'success', category: 'Gaming', discount: null },
    { id: 3, name: 'Luxury Manager Chair', price: 'Rs. 62,000', oldPrice: 'Rs. 70,000', badge: 'Featured', badgeColor: 'purple', category: 'Luxury', discount: '11% OFF' },
    { id: 4, name: 'Ergonomic Office Set', price: 'Rs. 28,000', oldPrice: null, badge: null, badgeColor: null, category: 'Office', discount: null },
];

const mockCategories = [
    { name: 'Office', icon: '💼' },
    { name: 'Gaming', icon: '🎮' },
    { name: 'Luxury', icon: '👑' },
    { name: 'Dining', icon: '🍽️' },
    { name: 'Outdoor', icon: '☀️' },
];

const whyItems = [
    { icon: '✨', title: 'Quality Craftsmanship', desc: 'Every piece built with premium materials.' },
    { icon: '💰', title: 'Affordable Pricing', desc: 'Premium comfort without the premium price.' },
    { icon: '🛡️', title: 'Built to Last', desc: 'Durability that holds up to everyday use.' },
    { icon: '✅', title: '30+ Years Trusted', desc: 'A legacy of customer satisfaction since 1995.' },
];

const PreviewHome = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-family)' }}>

            {/* ── Hero Banner ── */}
            <section
                className="relative px-8 py-16 overflow-hidden"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
                <div className="max-w-xl">
                    <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                    >
                        ✦ Trusted Since 1995
                    </span>
                    <h1
                        className="text-3xl font-bold mb-4 leading-tight"
                        style={{ color: 'var(--text)', lineHeight: 'var(--heading-line-height)' }}
                    >
                        Comfort,<br />
                        <span style={{ color: 'var(--primary)' }}>Built to Last.</span>
                    </h1>
                    <p className="text-sm mb-6 leading-6" style={{ color: 'var(--text-secondary)' }}>
                        Premium office chairs, gaming chairs, sofas, and complete furniture solutions
                    </p>
                    <div className="flex gap-3">
                        <button
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                            style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text, #fff)' }}
                        >
                            Shop Now <FiArrowRight size={14} />
                        </button>
                        <button
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                            style={{ backgroundColor: 'transparent', color: 'var(--text)', borderColor: 'var(--border)' }}
                        >
                            Our Story
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mt-8">
                        <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>30+</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Years</div>
                        </div>
                        <div className="w-px h-8" style={{ backgroundColor: 'var(--border)' }} />
                        <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: 'var(--secondary)' }}>5000+</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Customers</div>
                        </div>
                        <div className="w-px h-8" style={{ backgroundColor: 'var(--border)' }} />
                        <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>4.9★</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Rating</div>
                        </div>
                    </div>
                </div>
                {/* Decorative shape */}
                <div
                    className="absolute right-0 top-0 w-48 h-full opacity-10 rounded-l-full"
                    style={{ backgroundColor: 'var(--primary)' }}
                />
            </section>

            {/* ── Announcement Bar Preview ── */}
            <div
                className="py-2 px-6 text-xs font-medium text-center"
                style={{ backgroundColor: 'var(--announcement-bg)', color: 'var(--announcement-text)' }}
            >
                🎉 Free delivery on orders over Rs. 5,000 · Trusted since 1995
            </div>

            {/* ── Categories ── */}
            <section className="px-6 py-10" style={{ backgroundColor: 'var(--bg)' }}>
                <h2 className="text-lg font-bold mb-5 text-center" style={{ color: 'var(--text)' }}>
                    Shop by Category
                </h2>
                <div className="flex gap-3 justify-center flex-wrap">
                    {mockCategories.map((cat) => (
                        <div
                            key={cat.name}
                            className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl cursor-pointer transition-all"
                            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
                        >
                            <span className="text-xl">{cat.icon}</span>
                            <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{cat.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Featured Products ── */}
            <section className="px-6 py-10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Featured Products</h2>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Handpicked for quality and value</p>
                    </div>
                    <button className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                        View All <FiArrowRight size={12} />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {mockProducts.map(product => (
                        <div
                            key={product.id}
                            className="rounded-xl overflow-hidden"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                border: 'var(--card-border-width, 1px) solid var(--card-border)',
                                borderRadius: 'var(--card-border-radius)',
                                boxShadow: 'var(--card-shadow)',
                            }}
                        >
                            {/* Image placeholder */}
                            <div
                                className="w-full h-28 flex items-center justify-center relative"
                                style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                                <span className="text-3xl">🪑</span>
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    {product.badge && (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-bold text-white"
                                            style={{
                                                backgroundColor: product.badgeColor === 'success' ? 'var(--success)'
                                                    : product.badgeColor === 'secondary' ? 'var(--secondary)'
                                                        : 'var(--primary)'
                                            }}
                                        >
                                            {product.badge}
                                        </span>
                                    )}
                                    {product.discount && (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-bold text-white"
                                            style={{ backgroundColor: 'var(--error)' }}
                                        >
                                            {product.discount}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold"
                                    style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}
                                >
                                    {product.category}
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="text-xs font-semibold mb-1 line-clamp-1" style={{ color: 'var(--product-name-color, var(--text))' }}>
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => <FaStar key={i} size={9} style={{ color: 'var(--rating-star-color, #F59E0B)' }} />)}
                                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>(4.8)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold" style={{ color: product.oldPrice ? 'var(--product-discount-color, var(--error))' : 'var(--product-price-color, var(--primary))' }}>
                                            {product.price}
                                        </div>
                                        {product.oldPrice && (
                                            <div className="text-xs line-through" style={{ color: 'var(--text-light)' }}>
                                                {product.oldPrice}
                                            </div>
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
            </section>

            {/* ── Why Choose Us ── */}
            <section className="px-6 py-10" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <h2 className="text-lg font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>Why Choose Us</h2>
                <div className="grid grid-cols-2 gap-4">
                    {whyItems.map(item => (
                        <div
                            key={item.title}
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
                        >
                            <div className="text-xl mb-2">{item.icon}</div>
                            <div className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>{item.title}</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="px-6 py-10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h2 className="text-lg font-bold mb-5 text-center" style={{ color: 'var(--text)' }}>What Our Customers Say</h2>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { name: 'Ahmed K.', text: 'Best chair I have ever bought! Extremely comfortable for long hours.', rating: 5 },
                        { name: 'Sara M.', text: 'Quality is top notch and delivery was super fast. Highly recommend!', rating: 5 },
                    ].map(t => (
                        <div
                            key={t.name}
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
                        >
                            <div className="flex mb-2">
                                {[...Array(t.rating)].map((_, i) => <FaStar key={i} size={10} style={{ color: 'var(--rating-star-color)' }} />)}
                            </div>
                            <p className="text-xs italic mb-3" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: 'var(--primary)' }}>
                                    {t.name[0]}
                                </div>
                                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{t.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section
                className="px-6 py-10 text-center"
                style={{ backgroundColor: 'var(--primary)' }}
            >
                <h2 className="text-lg font-bold mb-2 text-white">Ready to Upgrade Your Space?</h2>
                <p className="text-sm text-white/80 mb-5">Explore hundreds of premium furniture pieces</p>
                <button
                    className="px-6 py-2.5 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: 'var(--secondary)', color: 'var(--btn-secondary-text, #fff)' }}
                >
                    Shop Now →
                </button>
            </section>
        </div>
    );
};

export default PreviewHome;
