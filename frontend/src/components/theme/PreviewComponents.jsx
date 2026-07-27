// Full component showcase — every reusable UI element themed with CSS variables
import { FiCheck, FiX, FiAlertCircle, FiInfo, FiAlertTriangle, FiLoader } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const Section = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
            {title}
        </h3>
        {children}
    </div>
);

const PreviewComponents = () => {
    return (
        <div className="px-6 py-6" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-family)' }}>

            {/* ── Buttons ── */}
            <Section title="Buttons">
                <div className="flex flex-wrap gap-2 mb-3">
                    <button className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text, #fff)' }}>
                        Primary
                    </button>
                    <button className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text, #fff)' }}>
                        Secondary
                    </button>
                    <button className="px-4 py-2 rounded-xl text-xs font-semibold border" style={{ backgroundColor: 'var(--btn-outline-bg)', color: 'var(--btn-outline-text)', borderColor: 'var(--btn-outline-border)' }}>
                        Outline
                    </button>
                    <button className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: 'var(--btn-danger-bg)', color: 'var(--btn-danger-text, #fff)' }}>
                        Danger
                    </button>
                    <button className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: 'var(--btn-success-bg)', color: 'var(--btn-success-text, #fff)' }}>
                        Success
                    </button>
                    <button className="px-4 py-2 rounded-xl text-xs font-semibold opacity-50 cursor-not-allowed" style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text, #fff)' }}>
                        Disabled
                    </button>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text, #fff)' }}>
                        <FiCheck size={11} /> Save
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'var(--btn-danger-bg)', color: 'var(--btn-danger-text, #fff)' }}>
                        <FiX size={11} /> Delete
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                        <FiLoader size={11} className="animate-spin" /> Loading
                    </button>
                </div>
            </Section>

            {/* ── Badges / Tags ── */}
            <Section title="Badges & Tags">
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'New Arrival', color: 'var(--success)', bg: 'color-mix(in srgb, var(--success) 15%, transparent)' },
                        { label: 'Best Seller', color: 'var(--secondary)', bg: 'color-mix(in srgb, var(--secondary) 15%, transparent)' },
                        { label: 'Featured', color: '#7c3aed', bg: '#ede9fe' },
                        { label: '20% OFF', color: 'var(--error)', bg: 'color-mix(in srgb, var(--error) 15%, transparent)' },
                        { label: 'In Stock', color: 'var(--success)', bg: 'color-mix(in srgb, var(--success) 10%, transparent)' },
                        { label: 'Limited', color: 'var(--warning)', bg: 'color-mix(in srgb, var(--warning) 10%, transparent)' },
                    ].map(b => (
                        <span key={b.label} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: b.bg, color: b.color }}>
                            {b.label}
                        </span>
                    ))}
                </div>
            </Section>

            {/* ── Alerts ── */}
            <Section title="Alerts">
                <div className="flex flex-col gap-2">
                    {[
                        { type: 'success', icon: FiCheck, msg: 'Order placed successfully!', color: 'var(--success)' },
                        { type: 'error', icon: FiX, msg: 'Payment failed. Please try again.', color: 'var(--error)' },
                        { type: 'warning', icon: FiAlertTriangle, msg: 'Stock running low — order soon!', color: 'var(--warning)' },
                        { type: 'info', icon: FiInfo, msg: 'Free delivery on orders over Rs. 5,000.', color: 'var(--info)' },
                    ].map(alert => (
                        <div
                            key={alert.type}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
                            style={{ backgroundColor: `color-mix(in srgb, ${alert.color} 12%, transparent)`, color: alert.color }}
                        >
                            <alert.icon size={13} />
                            {alert.msg}
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Toast Notifications ── */}
            <Section title="Toast Notifications">
                <div className="flex flex-col gap-2">
                    {[
                        { msg: '✅ Theme saved successfully!', bg: 'var(--success)' },
                        { msg: '❌ Failed to save. Try again.', bg: 'var(--error)' },
                        { msg: '⚠️ Unsaved changes detected.', bg: 'var(--warning)' },
                    ].map(toast => (
                        <div
                            key={toast.msg}
                            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium text-white shadow-lg"
                            style={{ backgroundColor: toast.bg }}
                        >
                            <span>{toast.msg}</span>
                            <FiX size={12} className="cursor-pointer opacity-80" />
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Forms ── */}
            <Section title="Form Elements">
                <div className="grid grid-cols-2 gap-3">
                    {/* Text input */}
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--label-color)' }}>Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            readOnly
                            className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text)',
                            }}
                        />
                    </div>
                    {/* Focused input */}
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--label-color)' }}>Email</label>
                        <input
                            type="email"
                            placeholder="Email address"
                            readOnly
                            className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '2px solid var(--input-focus-border)',
                                color: 'var(--text)',
                                boxShadow: `0 0 0 3px color-mix(in srgb, var(--input-focus-border) 15%, transparent)`,
                            }}
                        />
                    </div>
                    {/* Select */}
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--label-color)' }}>Category</label>
                        <select
                            className="w-full px-3 py-2 rounded-xl text-xs outline-none appearance-none cursor-pointer"
                            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
                        >
                            <option>Select category</option>
                            <option>Office</option>
                            <option>Gaming</option>
                        </select>
                    </div>
                    {/* Textarea */}
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--label-color)' }}>Message</label>
                        <textarea
                            placeholder="Your message..."
                            rows={3}
                            readOnly
                            className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
                            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
                        />
                    </div>
                </div>
                {/* Checkbox & Radio */}
                <div className="flex gap-5 mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', border: '1px solid var(--primary)' }}>
                            <FiCheck size={10} className="text-white" />
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text)' }}>In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }} />
                        <span className="text-xs" style={{ color: 'var(--text)' }}>On Sale</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className="w-4 h-4 rounded-full border-4" style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--primary)' }} />
                        <span className="text-xs" style={{ color: 'var(--text)' }}>Office</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-bg)' }} />
                        <span className="text-xs" style={{ color: 'var(--text)' }}>Gaming</span>
                    </label>
                </div>
            </Section>

            {/* ── Cards ── */}
            <Section title="Cards">
                <div className="grid grid-cols-3 gap-3">
                    {['Feature Card', 'Review Card', 'Category Card'].map((card, i) => (
                        <div
                            key={card}
                            className="p-4 rounded-xl cursor-pointer"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                border: 'var(--card-border-width, 1px) solid var(--card-border)',
                                borderRadius: 'var(--card-border-radius)',
                                boxShadow: 'var(--card-shadow)',
                            }}
                        >
                            <div className="text-xl mb-2">{['✨', '⭐', '🪑'][i]}</div>
                            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>{card}</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Sample card content with theme colors applied correctly.</div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Tables ── */}
            <Section title="Table">
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <table className="w-full text-xs">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                {['Product', 'Category', 'Price', 'Status'].map(h => (
                                    <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Executive Pro Chair', cat: 'Office', price: 'Rs. 45,000', status: 'In Stock' },
                                { name: 'Gaming Throne X', cat: 'Gaming', price: 'Rs. 38,500', status: 'Low Stock' },
                                { name: 'Luxury Manager', cat: 'Luxury', price: 'Rs. 62,000', status: 'In Stock' },
                            ].map((row, i) => (
                                <tr key={row.name} style={{ backgroundColor: i % 2 === 0 ? 'var(--card-bg)' : 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                                    <td className="px-3 py-2 font-medium" style={{ color: 'var(--text)' }}>{row.name}</td>
                                    <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{row.cat}</td>
                                    <td className="px-3 py-2 font-semibold" style={{ color: 'var(--product-price-color, var(--primary))' }}>{row.price}</td>
                                    <td className="px-3 py-2">
                                        <span
                                            className="px-2 py-0.5 rounded-full font-medium"
                                            style={{
                                                backgroundColor: row.status === 'In Stock' ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--warning) 15%, transparent)',
                                                color: row.status === 'In Stock' ? 'var(--success)' : 'var(--warning)',
                                            }}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* ── Skeleton Loaders ── */}
            <Section title="Loading Skeletons">
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(n => (
                        <div
                            key={n}
                            className="rounded-xl overflow-hidden"
                            style={{ border: '1px solid var(--border)' }}
                        >
                            <div className="h-20 animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
                            <div className="p-3">
                                <div className="h-2.5 rounded-full animate-pulse mb-2" style={{ backgroundColor: 'var(--bg-secondary)', width: '75%' }} />
                                <div className="h-2 rounded-full animate-pulse mb-2" style={{ backgroundColor: 'var(--bg-secondary)', width: '50%' }} />
                                <div className="h-6 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Pagination ── */}
            <Section title="Pagination">
                <div className="flex items-center gap-2">
                    {['‹', '1', '2', '3', '...', '8', '›'].map((p, i) => (
                        <button
                            key={i}
                            className="w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center"
                            style={{
                                backgroundColor: p === '2' ? 'var(--primary)' : 'var(--card-bg)',
                                color: p === '2' ? '#fff' : 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </Section>

            {/* ── Breadcrumbs ── */}
            <Section title="Breadcrumbs">
                <nav className="text-xs flex items-center gap-1">
                    {['Home', 'Products', 'Office Chairs', 'Executive Pro'].map((crumb, i, arr) => (
                        <span key={crumb} className="flex items-center gap-1">
                            <span
                                className="cursor-pointer"
                                style={{ color: i === arr.length - 1 ? 'var(--text)' : 'var(--primary)' }}
                            >
                                {crumb}
                            </span>
                            {i < arr.length - 1 && <span style={{ color: 'var(--text-light)' }}>/</span>}
                        </span>
                    ))}
                </nav>
            </Section>

            {/* ── Rating Stars ── */}
            <Section title="Rating Stars">
                <div className="flex flex-col gap-2">
                    {[5, 4, 3].map(rating => (
                        <div key={rating} className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} size={14} style={{ color: i < rating ? 'var(--rating-star-color)' : 'var(--border)' }} />
                            ))}
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{rating}/5</span>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Error State ── */}
            <Section title="Empty & Error States">
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className="p-6 rounded-xl text-center"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border)' }}
                    >
                        <div className="text-2xl mb-2">📦</div>
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>No Products Found</div>
                        <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters</div>
                        <button className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text, #fff)' }}>
                            Clear Filters
                        </button>
                    </div>
                    <div
                        className="p-6 rounded-xl text-center"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--error) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--error) 20%, transparent)' }}
                    >
                        <FiAlertCircle size={24} className="mx-auto mb-2" style={{ color: 'var(--error)' }} />
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--error)' }}>Something went wrong</div>
                        <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Failed to load products</div>
                        <button className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ backgroundColor: 'var(--btn-danger-bg)', color: 'var(--btn-danger-text, #fff)' }}>
                            Retry
                        </button>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default PreviewComponents;
