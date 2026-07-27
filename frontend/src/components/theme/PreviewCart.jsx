import { FiShoppingCart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

const cartItems = [
    { name: 'Executive Pro Chair', price: 45000, qty: 1, category: 'Office' },
    { name: 'Gaming Throne X', price: 38500, qty: 2, category: 'Gaming' },
];

const PreviewCart = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const delivery = 500;
    const total = subtotal + delivery;

    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-family)' }}>
            {/* Header */}
            <div className="px-6 py-6" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                    <FiShoppingCart size={20} style={{ color: 'var(--primary)' }} />
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Shopping Cart</h1>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                        {cartItems.length} items
                    </span>
                </div>
            </div>

            <div className="px-6 py-6 flex gap-6">
                {/* Cart Items */}
                <div className="flex-1">
                    {cartItems.map((item, i) => (
                        <div
                            key={item.name}
                            className="flex gap-4 p-4 rounded-xl mb-3"
                            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
                        >
                            {/* Image */}
                            <div
                                className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                                <span className="text-3xl">🪑</span>
                            </div>
                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                                            {item.category}
                                        </span>
                                        <h3 className="text-sm font-semibold mt-1" style={{ color: 'var(--product-name-color, var(--text))' }}>
                                            {item.name}
                                        </h3>
                                    </div>
                                    <button style={{ color: 'var(--error)' }}>
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <div
                                        className="flex items-center gap-2 px-2 py-1 rounded-lg"
                                        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)' }}
                                    >
                                        <FiMinus size={11} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                                        <span className="text-xs font-semibold w-4 text-center" style={{ color: 'var(--text)' }}>{item.qty}</span>
                                        <FiPlus size={11} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: 'var(--product-price-color, var(--primary))' }}>
                                        Rs. {(item.price * item.qty).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Coupon */}
                    <div
                        className="flex gap-2 p-4 rounded-xl"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                    >
                        <input
                            type="text"
                            placeholder="Enter coupon code"
                            readOnly
                            className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
                        />
                        <button
                            className="px-4 py-2 rounded-lg text-xs font-semibold"
                            style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text, #fff)' }}
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-56 shrink-0">
                    <div
                        className="p-5 rounded-xl"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
                    >
                        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Order Summary</h3>
                        {[
                            { label: 'Subtotal', val: `Rs. ${subtotal.toLocaleString()}` },
                            { label: 'Delivery', val: `Rs. ${delivery.toLocaleString()}` },
                            { label: 'Discount', val: '− Rs. 0' },
                        ].map(row => (
                            <div key={row.label} className="flex justify-between mb-2">
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                                <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{row.val}</span>
                            </div>
                        ))}
                        <div className="border-t my-3" style={{ borderColor: 'var(--border)' }} />
                        <div className="flex justify-between mb-5">
                            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Total</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--product-price-color, var(--primary))' }}>
                                Rs. {total.toLocaleString()}
                            </span>
                        </div>
                        <button
                            className="w-full py-2.5 rounded-xl text-sm font-bold"
                            style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text, #fff)' }}
                        >
                            Checkout →
                        </button>
                        <p className="text-center text-xs mt-3" style={{ color: 'var(--text-light)' }}>
                            🔒 Secure checkout
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewCart;
