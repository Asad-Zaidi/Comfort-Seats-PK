import { useState, useEffect, useRef } from "react";
import {
    FiX,
    FiMail,
    FiEye,
    FiEyeOff,
    FiArrowLeft,
    FiShield,
    FiCheckCircle,
    FiAlertCircle,
    FiCheck
} from "react-icons/fi";
import { FaKey, FaLock } from "react-icons/fa6";
import api from "../api/api";
import { useToast } from "./ToastNotification";

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = "" }) => {
    const toast = useToast();
    const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [resending, setResending] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [maskedBackupEmail, setMaskedBackupEmail] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    // Runtime OTP verification states
    const [otpStatus, setOtpStatus] = useState("idle"); // 'idle' | 'verifying' | 'valid' | 'invalid'
    const [otpFeedback, setOtpFeedback] = useState("");
    const newPasswordRef = useRef(null);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setEmail(initialEmail || "");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setShowNew(false);
            setShowConfirm(false);
            setResending(false);
            setResetting(false);
            setResendCooldown(0);
            setOtpStatus("idle");
            setOtpFeedback("");
        }
    }, [isOpen, initialEmail]);

    // Resend countdown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && isOpen && !resending && !resetting) onClose();
        };
        if (isOpen) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, resending, resetting, onClose]);

    if (!isOpen) return null;

    // Password requirements validation matching 12-char strong policy
    const passwordRequirements = [
        {
            id: "length",
            label: "At least 12 characters",
            valid: newPassword.length >= 12,
        },
        {
            id: "uppercase",
            label: "One uppercase letter (A-Z)",
            valid: /[A-Z]/.test(newPassword),
        },
        {
            id: "lowercase",
            label: "One lowercase letter (a-z)",
            valid: /[a-z]/.test(newPassword),
        },
        {
            id: "number",
            label: "One number (0-9)",
            valid: /[0-9]/.test(newPassword),
        },
        {
            id: "special",
            label: "One special character",
            valid: /[^A-Za-z0-9]/.test(newPassword),
        },
    ];

    const isAllRequirementsMet = passwordRequirements.every((req) => req.valid);

    // Runtime OTP validation whenever user enters 6 digits
    const triggerRuntimeOtpVerification = async (code) => {
        setOtpStatus("verifying");
        setOtpFeedback("Verifying code in real time...");
        try {
            const res = await api.post("/auth/verify-otp", {
                email: email.trim(),
                otp: code,
            });

            if (res.data?.success) {
                setOtpStatus("valid");
                setOtpFeedback("OTP verified successfully! Please set your new password.");
                setTimeout(() => {
                    newPasswordRef.current?.focus();
                }, 350);
            } else {
                setOtpStatus("invalid");
                setOtpFeedback(res.data?.message || "Invalid or expired OTP code.");
            }
        } catch (err) {
            setOtpStatus("invalid");
            const msg = err?.response?.data?.message || "Invalid or expired OTP code.";
            setOtpFeedback(msg);
        }
    };

    const handleOtpChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
        setOtp(val);

        if (val.length === 6) {
            triggerRuntimeOtpVerification(val);
        } else {
            setOtpStatus("idle");
            setOtpFeedback("");
        }
    };

    // Step 1: Send OTP to Backup Email
    const handleSendOtp = async (e) => {
        e?.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            toast.warning("Please enter your admin email.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            toast.warning("Please enter a valid email address (e.g. admin@comfortseats.com).");
            return;
        }

        setResending(true);
        try {
            const res = await api.post("/auth/forgot-password", { email: trimmedEmail });
            if (res.data?.success) {
                setMaskedBackupEmail(res.data.backupEmailMasked || "your registered backup email");
                toast.success(res.data.message || "OTP sent successfully.");
                setStep(2);
                setResendCooldown(60);
                setOtp("");
                setOtpStatus("idle");
                setOtpFeedback("");
            } else {
                toast.error(res.data?.message || "Failed to send OTP.");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to send OTP. Please try again.";
            toast.error(msg);
        } finally {
            setResending(false);
        }
    };

    // Step 2: Reset Password with OTP
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp.trim()) {
            toast.warning("Please enter the 6-digit OTP code.");
            return;
        }

        if (otp.trim().length !== 6) {
            toast.warning("OTP must be exactly 6 digits.");
            return;
        }

        if (otpStatus !== "valid") {
            toast.error("Please enter a valid OTP code before submitting.");
            return;
        }

        if (!isAllRequirementsMet) {
            toast.warning("New password must fulfill all 5 security requirements.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setResetting(true);
        try {
            const res = await api.post("/auth/reset-password", {
                email: email.trim(),
                otp: otp.trim(),
                newPassword,
            });

            if (res.data?.success) {
                toast.success("Password reset successfully! You can now log in.");
                onClose();
            } else {
                toast.error(res.data?.message || "Failed to reset password.");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to reset password.";
            toast.error(msg);
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2.5 sm:p-4 md:p-6 overflow-y-auto">
            <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full ${step === 1 ? "max-w-lg" : "max-w-2xl"} my-auto max-h-[calc(100dvh-1.25rem)] sm:max-h-[92vh] flex flex-col transition-all duration-200 overflow-hidden`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-3.5 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#2F6FED]/10 text-[#2F6FED]">
                            <FiShield size={16} className="sm:text-[18px]" />
                        </span>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                                {step === 1 ? "Forgot Password" : "Reset Password"}
                            </h2>
                            <p className="text-[11px] sm:text-xs text-gray-500">Secure Backup Verification</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => !resending && !resetting && onClose()}
                        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 shrink-0"
                        aria-label="Close"
                    >
                        <FiX size={15} />
                    </button>
                </div>

                {/* Step 1: Request OTP */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
                        <div className="rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 p-3 sm:p-4 text-xs text-blue-900 leading-relaxed">
                            <p className="font-semibold mb-1 flex items-center gap-1.5">
                                <FaKey /> High-Security Verification:
                            </p>
                            For administrative security, password reset verification codes (OTPs) are sent exclusively to the configured system backup email address.
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                                Admin Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FiMail />
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your admin email"
                                    autoFocus
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 sm:py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:bg-white focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2.5 sm:gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => !resending && !resetting && onClose()}
                                className="flex-1 rounded-xl border-2 border-gray-200 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={resending || !email.trim()}
                                className="flex-1 rounded-xl bg-[#2F6FED] px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {resending ? "Sending OTP..." : "Send OTP"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Enter OTP & New Password */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto overscroll-contain flex-1">
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span>
                                6-digit OTP sent to backup email:{" "}
                                <strong className="font-semibold text-emerald-950">{maskedBackupEmail}</strong> (valid 10 mins).
                            </span>
                            <span className="self-start sm:self-auto text-[10px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full whitespace-nowrap">
                                Realtime Verification
                            </span>
                        </div>

                        {/* 2-Column Responsive Grid on Tablet/Desktop, clean stack on Mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
                            {/* Left Column: OTP, New Password, Confirm Password */}
                            <div className="space-y-2.5 sm:space-y-3">
                                {/* OTP Input with Runtime Verification */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-semibold text-gray-700">
                                            6-Digit OTP Code
                                        </label>
                                        <button
                                            type="button"
                                            disabled={resendCooldown > 0 || resending || resetting || otpStatus === "verifying"}
                                            onClick={handleSendOtp}
                                            className="text-[11px] sm:text-xs text-[#2F6FED] hover:underline disabled:text-gray-400 disabled:no-underline font-medium"
                                        >
                                            {resending
                                                ? "Resending..."
                                                : resendCooldown > 0
                                                ? `Resend (${resendCooldown}s)`
                                                : "Resend code"}
                                        </button>
                                    </div>

                                    <div className={`relative transition-transform duration-200 ${otpStatus === "invalid" ? "animate-shake" : ""}`}>
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FaKey />
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={otp}
                                            onChange={handleOtpChange}
                                            placeholder="000000"
                                            autoFocus
                                            className={`w-full rounded-xl border py-2 sm:py-2.5 pl-8 sm:pl-9 pr-10 sm:pr-11 text-center tracking-[0.25em] sm:tracking-[0.4em] font-mono text-base sm:text-lg font-bold outline-none transition-all duration-200 ${otpStatus === "valid"
                                                ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-4 ring-emerald-500/15"
                                                : otpStatus === "invalid"
                                                    ? "border-red-400 bg-red-50/50 text-red-900 ring-4 ring-red-400/15"
                                                    : otpStatus === "verifying"
                                                        ? "border-blue-400 bg-blue-50/30 text-blue-900 ring-4 ring-blue-400/15"
                                                        : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                                }`}
                                        />

                                        {/* Status Badge */}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                            {otpStatus === "verifying" && (
                                                <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {otpStatus === "valid" && (
                                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                                                    <FiCheck size={11} className="stroke-[3]" />
                                                </span>
                                            )}
                                            {otpStatus === "invalid" && (
                                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow-xs">
                                                    <FiX size={11} className="stroke-[3]" />
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Feedback message */}
                                    {otpStatus === "verifying" && (
                                        <p className="text-[11px] font-medium text-blue-600 flex items-center gap-1 pt-0.5">
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping"></span>
                                            Verifying in real time...
                                        </p>
                                    )}
                                    {otpStatus === "valid" && (
                                        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pt-0.5">
                                            <FiCheckCircle size={12} className="shrink-0" />
                                            {otpFeedback}
                                        </p>
                                    )}
                                    {otpStatus === "invalid" && (
                                        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 pt-0.5">
                                            <FiAlertCircle size={12} className="shrink-0" />
                                            {otpFeedback}
                                        </p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FaLock size={13} />
                                        </span>
                                        <input
                                            ref={newPasswordRef}
                                            type={showNew ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min 12 characters"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 sm:py-2.5 pl-9 pr-10 text-xs sm:text-sm outline-none transition focus:bg-white focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                            tabIndex={-1}
                                        >
                                            {showNew ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FaLock size={13} />
                                        </span>
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter new password"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 sm:py-2.5 pl-9 pr-10 text-xs sm:text-sm outline-none transition focus:bg-white focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                            tabIndex={-1}
                                        >
                                            {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                        </button>
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="mt-1 text-[11px] text-red-500">Passwords do not match.</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Password Requirements Checklist */}
                            <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gray-50/90 border border-gray-200/90 p-3 sm:p-3.5">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-800 mb-2">
                                        Password Requirements
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-1.5 sm:gap-2">
                                        {passwordRequirements.map((req) => (
                                            <div
                                                key={req.id}
                                                className={`flex items-center gap-2 text-[11px] sm:text-xs font-medium transition-colors duration-150 ${req.valid ? "text-emerald-600 font-semibold" : "text-gray-500"
                                                    }`}
                                            >
                                                {req.valid ? (
                                                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                                                        <svg
                                                            className="h-2 w-2 stroke-[3.5]"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </span>
                                                ) : (
                                                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                                                        <svg
                                                            className="h-2 w-2 stroke-[2.5]"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </span>
                                                )}
                                                <span>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-gray-200/70 text-[10px] sm:text-[11px] text-gray-500 leading-tight">
                                    All 5 conditions must turn green before you can reset the password.
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-gray-100 flex gap-2.5 sm:gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="rounded-xl border-2 border-gray-200 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1.5"
                            >
                                <FiArrowLeft /> Back
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    resetting ||
                                    resending ||
                                    otpStatus !== "valid" ||
                                    !isAllRequirementsMet ||
                                    newPassword !== confirmPassword
                                }
                                className="flex-1 rounded-xl bg-[#2F6FED] px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {resetting ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
