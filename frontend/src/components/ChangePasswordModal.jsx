import { useState, useEffect } from "react";
import { FiX, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import api from "../api/api";
import { useToast } from "./ToastNotification";

// Defined at module scope so it keeps a stable component identity across
// re-renders. Declaring it inside the parent would recreate the component on
// every keystroke, causing React to remount the input and drop focus.
const PasswordInput = ({
    label,
    name,
    value,
    showKey,
    placeholder,
    show,
    errors,
    onChange,
    onToggleShow,
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
        </label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock />
            </span>
            <input
                type={show[showKey] ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="new-password"
                className={`w-full rounded-xl border bg-gray-50 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10 ${
                    errors[name]
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 focus:border-[#2F6FED]"
                }`}
            />
            <button
                type="button"
                onClick={() => onToggleShow(showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
                aria-label={show[showKey] ? "Hide password" : "Show password"}
            >
                {show[showKey] ? <FiEyeOff /> : <FiEye />}
            </button>
        </div>
        {errors[name] && (
            <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
        )}
    </div>
);

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const toast = useToast();
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [saving, setSaving] = useState(false);

    // Reset state whenever the modal is opened
    useEffect(() => {
        if (isOpen) {
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setErrors({});
            setSaving(false);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && isOpen && !saving) onClose();
        };
        if (isOpen) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, saving, onClose]);

    if (!isOpen) return null;

    const passwordRequirements = [
        {
            id: "length",
            label: "At least 12 characters",
            valid: form.newPassword.length >= 12,
        },
        {
            id: "uppercase",
            label: "One uppercase letter (A-Z)",
            valid: /[A-Z]/.test(form.newPassword),
        },
        {
            id: "lowercase",
            label: "One lowercase letter (a-z)",
            valid: /[a-z]/.test(form.newPassword),
        },
        {
            id: "number",
            label: "One number (0-9)",
            valid: /[0-9]/.test(form.newPassword),
        },
        {
            id: "special",
            label: "One special character",
            valid: /[^A-Za-z0-9]/.test(form.newPassword),
        },
    ];

    const isAllRequirementsMet = passwordRequirements.every((req) => req.valid);

    const validate = () => {
        const newErrors = {};
        if (!form.currentPassword)
            newErrors.currentPassword = "Current password is required.";
        if (!form.newPassword) {
            newErrors.newPassword = "New password is required.";
        } else if (!isAllRequirementsMet) {
            newErrors.newPassword = "All password requirements must be satisfied (min 12 characters).";
        }
        if (!form.confirmPassword)
            newErrors.confirmPassword = "Please confirm your new password.";
        else if (form.newPassword && form.confirmPassword !== form.newPassword)
            newErrors.confirmPassword = "New passwords do not match.";
        if (
            form.currentPassword &&
            form.newPassword &&
            form.currentPassword === form.newPassword
        )
            newErrors.newPassword = "New password must be different from the current one.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const toggleShow = (field) =>
        setShow((prev) => ({ ...prev, [field]: !prev[field] }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            if (!isAllRequirementsMet) {
                toast.error("All 5 password requirements must be met before updating.");
            }
            return;
        }
        setSaving(true);
        try {
            const res = await api.put("/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            if (!res.data?.success) {
                throw new Error(res.data?.message || "Failed to change password.");
            }

            toast.success("Password changed successfully.");
            onClose();
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong.";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col my-auto max-h-[92vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6FED]/10 text-[#2F6FED]">
                            <FiLock />
                        </span>
                        <h2 className="text-lg font-bold text-gray-900">
                            Change Password
                        </h2>
                    </div>
                    <button
                        onClick={() => !saving && onClose()}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                        aria-label="Close"
                    >
                        <FiX size={15} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <PasswordInput
                        label="Current Password"
                        name="currentPassword"
                        value={form.currentPassword}
                        showKey="current"
                        placeholder="Enter current password"
                        show={show}
                        errors={errors}
                        onChange={handleChange}
                        onToggleShow={toggleShow}
                    />
                    <PasswordInput
                        label="New Password"
                        name="newPassword"
                        value={form.newPassword}
                        showKey="new"
                        placeholder="Enter new password (min 12 characters)"
                        show={show}
                        errors={errors}
                        onChange={handleChange}
                        onToggleShow={toggleShow}
                    />

                    {/* Password Requirements Box */}
                    <div className="rounded-2xl bg-gray-50/90 border border-gray-200/90 p-4 transition-all">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-2.5">
                            Password Requirements
                        </h4>
                        <div className="space-y-2">
                            {passwordRequirements.map((req) => (
                                <div
                                    key={req.id}
                                    className={`flex items-center gap-2.5 text-xs sm:text-[13px] font-medium transition-colors duration-150 ${
                                        req.valid ? "text-emerald-600 font-semibold" : "text-gray-500"
                                    }`}
                                >
                                    {req.valid ? (
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                                            <svg
                                                className="h-2.5 w-2.5 stroke-[3.5]"
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
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                                            <svg
                                                className="h-2.5 w-2.5 stroke-[2.5]"
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

                    <PasswordInput
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        showKey="confirm"
                        placeholder="Re-enter new password"
                        show={show}
                        errors={errors}
                        onChange={handleChange}
                        onToggleShow={toggleShow}
                    />

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => !saving && onClose()}
                            className="flex-1 rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !isAllRequirementsMet}
                            className="flex-1 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;