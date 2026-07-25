import { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { useSiteConfig } from "../utils/siteConfig";
import api from "../api/api";
import { FiLoader } from "react-icons/fi";

const PolicyPage = () => {
    const { siteUrl, siteName } = useSiteConfig();
    const [loading, setLoading] = useState(true);
    const [privacyPolicy, setPrivacyPolicy] = useState("");
    const [returnPolicy, setReturnPolicy] = useState("");
    const [warrantyPolicy, setWarrantyPolicy] = useState("");

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
                console.error("Failed to load policies:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, []);

    const formatPolicyText = (text) => {
        if (!text) return "";
        return text.split("\n").map((line, i) => (
            <p key={i} className="mt-2">
                {line}
            </p>
        ));
    };

    if (loading) {
        return (
            <div className="bg-white">
                <SEO
                    title={`Privacy & Return Policy - ${siteName}`}
                    description="Read our privacy policy and return policy."
                    canonicalUrl={`${siteUrl}/policy`}
                />
                <div className="flex h-64 items-center justify-center">
                    <FiLoader className="animate-spin text-gray-400" size={22} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <SEO
                title={`Privacy & Return Policy - ${siteName}`}
                description="Read our privacy policy and return policy. Learn how we protect your personal information and our hassle-free return process."
                canonicalUrl={`${siteUrl}/policy`}
            />

            {/* Hero */}
            <section className="border-b border-gray-100 bg-gray-50/60">
                <div className="mx-auto max-w-7xl px-5 py-10 text-center lg:px-8">
                    <span className="inline-block border-2 border-blue-400 rounded-full bg-[#2F6FED]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2F6FED] hover:bg-[#2F6FED]/20 transition">
                        Our Policies
                    </span>
                    <h1 className="mt-5 text-4xl font-bold text-[#12131A] sm:text-5xl">
                        Privacy & Return Policy
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-gray-500">
                        We are committed to protecting your privacy and ensuring a seamless shopping experience. Please review our policies below.
                    </p>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-16">

                    {/* Privacy Policy */}
                    <section>
                        <h2 className="text-3xl font-bold text-[#12131A]">Privacy Policy</h2>
                        <p className="mt-2 text-sm text-gray-500">Last updated: July 2026</p>

                        <div className="mt-8 space-y-8 text-sm text-gray-700 leading-7">
                            {privacyPolicy ? (
                                <div>{formatPolicyText(privacyPolicy)}</div>
                            ) : (
                                <p className="text-gray-500">Privacy policy content not available.</p>
                            )}
                        </div>
                    </section>

                    {/* Return Policy */}
                    <section className="border-t border-gray-100 pt-16">
                        <h2 className="text-3xl font-bold text-[#12131A]">Return Policy</h2>
                        <p className="mt-2 text-sm text-gray-500">Last updated: July 2026</p>

                        <div className="mt-8 space-y-8 text-sm text-gray-700 leading-7">
                            {returnPolicy ? (
                                <div>{formatPolicyText(returnPolicy)}</div>
                            ) : (
                                <p className="text-gray-500">Return policy content not available.</p>
                            )}
                        </div>
                    </section>

                    {/* Warranty Policy */}
                    <section className="border-t border-gray-100 pt-16">
                        <h2 className="text-3xl font-bold text-[#12131A]">Warranty Policy</h2>
                        <p className="mt-2 text-sm text-gray-500">Last updated: July 2026</p>

                        <div className="mt-8 space-y-8 text-sm text-gray-700 leading-7">
                            {warrantyPolicy ? (
                                <div>{formatPolicyText(warrantyPolicy)}</div>
                            ) : (
                                <p className="text-gray-500">Warranty policy content not available.</p>
                            )}
                        </div>
                    </section>

                    {/* Need Help */}
                    <section className="rounded-3xl border border-gray-100 bg-gray-50/60 p-8 text-center sm:p-12">
                        <h3 className="text-2xl font-bold text-[#12131A]">Need Help?</h3>
                        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">
                            If you have questions about our policies or need assistance with a return, our customer support team is here to help.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90"
                            >
                                Contact Us
                            </a>
                            <a
                                href="mailto:support@comfortseats.pk"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-[#12131A] transition hover:border-gray-300"
                            >
                                support@comfortseats.pk
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;
