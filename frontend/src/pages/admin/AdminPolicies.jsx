import { useEffect, useState } from "react";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiLoader,
    FiSave,
} from "react-icons/fi";
import api from "../../api/api";
import { useToast } from "../../components/ToastNotification";
import RichTextEditor from "../../components/common/RichTextEditor";

const AdminPolicies = () => {
    const [privacyPolicy, setPrivacyPolicy] = useState("");
    const [returnPolicy, setReturnPolicy] = useState("");
    const [warrantyPolicy, setWarrantyPolicy] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const res = await api.get("/site-content");
                if (res.data?.success && res.data.data) {
                    setPrivacyPolicy(res.data.data.privacyPolicy || "");
                    setReturnPolicy(res.data.data.returnPolicy || "");
                    setWarrantyPolicy(res.data.data.warrantyPolicy || "");
                }
            } catch (err) {
                setStatus({ type: "error", message: "Failed to load policies." });
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const res = await api.put("/site-content/policies", {
                privacyPolicy,
                returnPolicy,
                warrantyPolicy,
            });
            if (res.data?.success) {
                setStatus({ type: "success", message: "Policies updated successfully." });
                toast.success("Policies saved successfully.");
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to update policies.";
            setStatus({ type: "error", message });
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <FiLoader className="animate-spin" size={22} />
            </div>
        );
    }

    const sectionClass = "rounded-2xl border border-gray-100 bg-white p-6 shadow-sm";

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#12131A]">Policies</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage Privacy Policy and Return Policy content that appears on the Policy page.
                </p>
            </div>

            {status && (
                <div
                    className={`mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${
                        status.type === "success"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#E5484D]/10 text-[#E5484D]"
                    }`}
                >
                    {status.type === "success" ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <section className={sectionClass}>
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-[#12131A]">Privacy Policy</h2>
                        <p className="text-sm text-gray-500">
                            This content is displayed on the Privacy Policy page section.
                        </p>
                    </div>
                    <RichTextEditor
                        value={privacyPolicy}
                        onChange={(html) => setPrivacyPolicy(html)}
                        placeholder="Enter privacy policy content..."
                    />
                </section>

                <section className={sectionClass}>
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-[#12131A]">Return Policy</h2>
                        <p className="text-sm text-gray-500">
                            This content is displayed on the Return Policy page section.
                        </p>
                    </div>
                    <RichTextEditor
                        value={returnPolicy}
                        onChange={(html) => setReturnPolicy(html)}
                        placeholder="Enter return policy content..."
                    />
                </section>

                <section className={sectionClass}>
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-[#12131A]">Warranty Policy</h2>
                        <p className="text-sm text-gray-500">
                            This content is displayed on the Warranty Policy page section.
                        </p>
                    </div>
                    <RichTextEditor
                        value={warrantyPolicy}
                        onChange={(html) => setWarrantyPolicy(html)}
                        placeholder="Enter warranty policy content..."
                    />
                </section>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                        {saving ? "Saving..." : "Save Policies"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPolicies;