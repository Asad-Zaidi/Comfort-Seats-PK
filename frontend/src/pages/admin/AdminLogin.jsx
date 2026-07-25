import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../../api/api";
import { useToast } from "../../components/ToastNotification";

import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiLogIn,
} from "react-icons/fi";

const AdminLogin = () => {
    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            const message = "Email and password are required.";
            setError(message);
            toast.warning(message);
            return;
        }

        try {
            const res = await api.post('/auth/login', { email, password });

            if (res.data && res.data.success) {
                const token = res.data.token;
                const admin = res.data.admin;

                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminInfo', JSON.stringify(admin));
                setAuthToken(token);

                toast.success("Logged in successfully.");
                navigate('/admin/dashboard', { replace: true });
            } else {
                const message = (res.data && res.data.message) || 'Login failed';
                setError(message);
                toast.error(message);
            }
        } catch (err) {
            console.error(err);
            const message = (err.response && err.response.data && err.response.data.message) || 'Login failed';
            setError(message);
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 flex items-center justify-center p-6">

            <div className="w-full max-w-md">

                {/* Logo */}

                <div className="text-center mb-8">

                    <h1 className="text-4xl font-bold">
                        <span className="text-gray-900">Comfort</span>{" "}
                        <span className="text-blue-600">Seats</span>
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Admin Dashboard Login
                    </p>

                </div>

                {/* Card */}

                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">

                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome Back
                    </h2>

                    <p className="text-gray-500 mb-8">
                        Sign in to continue
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Email */}

                        <div>

                            <label className="block mb-2 font-medium text-gray-700">
                                Email Address
                            </label>

                            <div className="relative">

                                <FiMail className="absolute left-4 top-4 text-gray-400 text-lg" />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@comfortseats.com"
                                    className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* Password */}

                        <div>

                            <label className="block mb-2 font-medium text-gray-700">
                                Password
                            </label>

                            <div className="relative">

                                <FiLock className="absolute left-4 top-4 text-gray-400 text-lg" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-4 text-gray-500"
                                >
                                    {showPassword ? (
                                        <FiEyeOff />
                                    ) : (
                                        <FiEye />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* Remember */}

                        <div className="flex items-center justify-between">

                            <label className="flex items-center gap-2">

                                <input
                                    type="checkbox"
                                    className="accent-blue-600"
                                />

                                <span className="text-gray-600 text-sm">
                                    Remember me
                                </span>

                            </label>

                            <Link
                                to="#"
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Forgot Password?
                            </Link>

                        </div>

                        {/* Login */}

                        {error && (
                            <p className="text-red-600 text-sm">{error}</p>
                        )}

                        <button
                            className="w-full flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold text-lg"
                        >
                            <FiLogIn />

                            Login
                        </button>

                    </form>

                </div>

                {/* Footer */}

                <p className="text-center text-gray-500 text-sm mt-6">
                    © 2026 Comfort Seats. All Rights Reserved.
                </p>

            </div>

        </div>
    );
};

export default AdminLogin;
