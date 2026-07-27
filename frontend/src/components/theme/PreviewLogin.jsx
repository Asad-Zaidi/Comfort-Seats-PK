import { FiLock, FiMail } from 'react-icons/fi';

const PreviewLogin = () => {
    return (
        <div
            className="min-h-full flex items-center justify-center p-8"
            style={{ backgroundColor: 'var(--bg-secondary)', fontFamily: 'var(--font-family)' }}
        >
            <div
                className="w-full max-w-sm p-8 rounded-2xl shadow-xl"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-hover-shadow)' }}
            >
                {/* Logo */}
                <div className="text-center mb-6">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white mx-auto mb-3"
                        style={{ backgroundColor: 'var(--primary)' }}
                    >
                        C
                    </div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Welcome Back</h1>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--label-color)' }}>Email Address</label>
                        <div className="relative">
                            <FiMail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--input-placeholder)' }} />
                            <input
                                type="email"
                                placeholder="admin@comfortseats.pk"
                                readOnly
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--label-color)' }}>Password</label>
                        <div className="relative">
                            <FiLock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--input-placeholder)' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                readOnly
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none"
                                style={{ backgroundColor: 'var(--input-bg)', border: '2px solid var(--input-focus-border)', color: 'var(--text)' }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div
                                className="w-3.5 h-3.5 rounded flex items-center justify-center"
                                style={{ backgroundColor: 'var(--primary)', border: '1px solid var(--primary)' }}
                            >
                                <span className="text-white text-xs leading-none">✓</span>
                            </div>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
                        </label>
                        <span className="text-xs cursor-pointer" style={{ color: 'var(--primary)' }}>Forgot password?</span>
                    </div>

                    <button
                        className="w-full py-3 rounded-xl text-sm font-bold mt-2"
                        style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text, #fff)' }}
                    >
                        Sign In
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <span className="font-semibold cursor-pointer" style={{ color: 'var(--primary)' }}>Register</span>
                    </p>
                </div>

                {/* Or divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>OR</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                </div>

                <button
                    className="w-full py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                    🔐 Continue with Google
                </button>
            </div>
        </div>
    );
};

export default PreviewLogin;
