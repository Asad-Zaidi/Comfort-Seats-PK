// Mini Navbar for the Theme Builder live preview
// Uses the same CSS variables as the real site — pixel-perfect color fidelity
const PreviewNavbar = () => {
    return (
        <nav
            className="flex items-center justify-between px-6 py-3 shadow-sm"
            style={{ backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border)' }}
        >
            {/* Logo placeholder */}
            <div className="flex items-center gap-2">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                >
                    C
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--header-text)' }}>
                    Comfort Seats PK
                </span>
            </div>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-5">
                {['Home', 'Products', 'About', 'Contact'].map((link, i) => (
                    <span
                        key={link}
                        className="text-xs font-medium transition-colors cursor-pointer"
                        style={{ color: i === 0 ? 'var(--header-active-link)' : 'var(--header-text)' }}
                    >
                        {link}
                    </span>
                ))}
            </div>

            {/* Cart icon */}
            <div className="flex items-center gap-3">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--header-text)' }}>
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                    </svg>
                </div>
                <div
                    className="px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--btn-primary-text, #fff)' }}
                >
                    Sign In
                </div>
            </div>
        </nav>
    );
};

export default PreviewNavbar;
