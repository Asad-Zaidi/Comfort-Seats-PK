// Mini Footer for the Theme Builder live preview
const PreviewFooter = () => {
    return (
        <footer style={{ backgroundColor: 'var(--footer-bg)' }}>
            {/* Main footer content */}
            <div className="px-6 py-8" style={{ borderBottom: '1px solid var(--footer-border)' }}>
                <div className="grid grid-cols-3 gap-6">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                            >
                                C
                            </div>
                            <span className="text-xs font-bold" style={{ color: 'var(--footer-text)' }}>
                                Comfort Seats PK
                            </span>
                        </div>
                        <p className="text-xs leading-5" style={{ color: 'var(--footer-link)' }}>
                            Premium Office Chairs, Gaming Chairs, Bar Stools & Office Furniture Shop in Lahore.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--footer-text)' }}>
                            Quick Links
                        </h4>
                        {['Home', 'Products', 'About Us', 'Contact'].map(link => (
                            <div key={link} className="text-xs mb-1.5 cursor-pointer" style={{ color: 'var(--footer-link)' }}>
                                {link}
                            </div>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--footer-text)' }}>
                            Contact
                        </h4>
                        <div className="text-xs mb-1.5" style={{ color: 'var(--footer-link)' }}>
                            📍 Lahore, Pakistan
                        </div>
                        <div className="text-xs mb-1.5" style={{ color: 'var(--footer-link)' }}>
                            📞 +92 300 0000000
                        </div>
                        <div className="flex gap-2 mt-3">
                            {['f', 'in', 't'].map(icon => (
                                <div
                                    key={icon}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer transition-colors"
                                    style={{ backgroundColor: 'var(--footer-link)', color: 'var(--footer-bg)' }}
                                >
                                    {icon}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="px-6 py-3 flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--footer-link)' }}>
                    © 2025 Comfort Seats PK. All rights reserved.
                </span>
                <span className="text-xs" style={{ color: 'var(--footer-link)' }}>
                    Privacy Policy · Returns
                </span>
            </div>
        </footer>
    );
};

export default PreviewFooter;
