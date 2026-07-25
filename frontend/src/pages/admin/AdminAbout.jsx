import { useEffect, useState } from "react";
import {
    FiAlertCircle,
    FiAward,
    FiGrid,
    FiCheckCircle,
    FiShield,
    FiPlus,
    FiSave,
    FiLoader,
    FiTrash2,
    FiImage,
    FiUploadCloud,
    FiX,
} from "react-icons/fi";
import api from "../../api/api";

const iconOptions = [
    { value: "FiCalendar", label: "Calendar" },
    { value: "FiAward", label: "Award" },
    { value: "FiMapPin", label: "Map Pin" },
    { value: "FiGrid", label: "Grid" },
    { value: "FiZap", label: "Zap" },
    { value: "FiBriefcase", label: "Briefcase" },
    { value: "FiHome", label: "Home" },
    { value: "FiTrendingUp", label: "Trending Up" },
    { value: "FiFeather", label: "Feather" },
    { value: "FiDollarSign", label: "Dollar Sign" },
    { value: "FiShield", label: "Shield" },
    { value: "FiCheckCircle", label: "Check Circle" },
];

const AdminAbout = () => {
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);

    // Image file states
    const [heroImageFile, setHeroImageFile] = useState(null);
    const [heroImagePreview, setHeroImagePreview] = useState("");

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const res = await api.get("/site-content");
                if (res.data?.success && res.data.data?.aboutUs) {
                    setAboutData(res.data.data.aboutUs);
                    setHeroImagePreview(res.data.data.aboutUs.heroImageUrl || "");
                }
            } catch (err) {
                setStatus({ type: "error", message: "Failed to load About page settings." });
            } finally {
                setLoading(false);
            }
        };
        fetchAbout();
    }, []);

    const handleTextChange = (field, value) => {
        setAboutData((prev) => ({ ...prev, [field]: value }));
        setStatus(null);
    };

    const handleHeroImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setStatus({ type: "error", message: "Please select a valid image file (JPG, PNG, GIF, or WebP)." });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setStatus({ type: "error", message: "Image file must be less than 5MB." });
                return;
            }
            setHeroImageFile(file);
            setHeroImagePreview(URL.createObjectURL(file));
            setStatus(null);
        }
    };

    // Stats array handlers
    const handleStatChange = (index, field, value) => {
        setAboutData((prev) => {
            const newStats = [...(prev.stats || [])];
            newStats[index] = { ...newStats[index], [field]: value };
            return { ...prev, stats: newStats };
        });
        setStatus(null);
    };

    const addStatRow = () => {
        setAboutData((prev) => ({
            ...prev,
            stats: [...(prev.stats || []), { icon: "", label: "", value: "" }]
        }));
    };

    const removeStatRow = (index) => {
        setAboutData((prev) => ({
            ...prev,
            stats: (prev.stats || []).filter((_, i) => i !== index)
        }));
        setStatus(null);
    };

    // Categories array handlers
    const handleCategoryChange = (index, field, value) => {
        setAboutData((prev) => {
            const newCats = [...(prev.categories || [])];
            newCats[index] = { ...newCats[index], [field]: value };
            return { ...prev, categories: newCats };
        });
        setStatus(null);
    };

    const addCategoryRow = () => {
        setAboutData((prev) => ({
            ...prev,
            categories: [...(prev.categories || []), { icon: "", name: "", desc: "" }]
        }));
    };

    const removeCategoryRow = (index) => {
        setAboutData((prev) => ({
            ...prev,
            categories: (prev.categories || []).filter((_, i) => i !== index)
        }));
        setStatus(null);
    };

    // Values array handlers
    const handleValueChange = (index, field, value) => {
        setAboutData((prev) => {
            const newVals = [...(prev.values || [])];
            newVals[index] = { ...newVals[index], [field]: value };
            return { ...prev, values: newVals };
        });
        setStatus(null);
    };

    const addValueRow = () => {
        setAboutData((prev) => ({
            ...prev,
            values: [...(prev.values || []), { icon: "", title: "", desc: "" }]
        }));
    };

    const removeValueRow = (index) => {
        setAboutData((prev) => ({
            ...prev,
            values: (prev.values || []).filter((_, i) => i !== index)
        }));
        setStatus(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const formData = new FormData();
            
            // Append hero image if selected
            if (heroImageFile) {
                formData.append("bannerImage", heroImageFile);
            }

            // Append all text fields
            const textFields = [
                "heroEyebrow", "heroTitle", "heroDescription", "heroImageUrl", "heroImageAlt",
                "storyTitle", "storyParagraph1", "storyParagraph2", "storyImageUrl", "storyImageAlt",
                "categoriesTitle", "categoriesDescription",
                "missionEyebrow", "missionTitle", "missionDescription",
                "valuesTitle",
                "ctaTitle", "ctaDescription", "ctaButtonText", "ctaButtonLink"
            ];

            textFields.forEach((field) => {
                if (aboutData[field] !== undefined) {
                    formData.append(field, aboutData[field]);
                }
            });

            // Append stats array
            if (Array.isArray(aboutData.stats)) {
                formData.append("stats", JSON.stringify(aboutData.stats));
            }

            // Append categories array
            if (Array.isArray(aboutData.categories)) {
                formData.append("categories", JSON.stringify(aboutData.categories));
            }

            // Append values array
            if (Array.isArray(aboutData.values)) {
                formData.append("values", JSON.stringify(aboutData.values));
            }

            const res = await api.put("/site-content/about-us", aboutData);
            if (res.data?.success) {
                setAboutData(res.data.data);
                setHeroImagePreview(res.data.data.heroImageUrl || "");
                setHeroImageFile(null);
                setStatus({ type: "success", message: "About Us page updated successfully." });
            }
        } catch (err) {
            setStatus({
                type: "error",
                message: err?.response?.data?.message || "Failed to update About Us page."
            });
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

    if (!aboutData) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                No About Us data found.
            </div>
        );
    }

    const inputClass = "block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10";
    const textareaClass = "block w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10";
    const selectClass = "block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10";
    const sectionClass = "rounded-2xl border border-gray-100 bg-white p-6 shadow-sm";
    const sectionTitleClass = "mb-5 flex items-center gap-2";
    const sectionHeadingClass = " text-base font-semibold text-[#12131A]";

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-8">
                <h1 className=" text-2xl font-bold text-[#12131A]">About Us Page</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Edit all content for the About Us page including hero, story, categories, mission, values, and CTA sections.
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
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Hero Section */}
                <section className={sectionClass}>
                    <div className={sectionTitleClass}>
                        <FiImage className="text-[#2F6FED]" size={18} />
                        <h2 className={sectionHeadingClass}>Hero Section</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Eyebrow</label>
                            <input
                                value={aboutData.heroEyebrow || ""}
                                onChange={(e) => handleTextChange("heroEyebrow", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Title</label>
                            <textarea
                                value={aboutData.heroTitle || ""}
                                onChange={(e) => handleTextChange("heroTitle", e.target.value)}
                                rows={2}
                                className={textareaClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Description</label>
                            <textarea
                                value={aboutData.heroDescription || ""}
                                onChange={(e) => handleTextChange("heroDescription", e.target.value)}
                                rows={4}
                                className={textareaClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Hero Image</label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("heroImageInput").click()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
                                >
                                    <FiUploadCloud size={16} />
                                    {heroImageFile ? "Change Image" : "Upload Image"}
                                </button>
                                {heroImageFile && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHeroImageFile(null);
                                            setHeroImagePreview(aboutData.heroImageUrl || "");
                                        }}
                                        className="inline-flex items-center gap-1.5 text-xs text-[#E5484D] hover:text-[#E5484D]/80"
                                    >
                                        <FiX size={14} />
                                        Remove
                                    </button>
                                )}
                                <input
                                    id="heroImageInput"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleHeroImageChange}
                                    className="hidden"
                                />
                            </div>
                            {heroImagePreview && (
                                <img src={heroImagePreview} alt="Hero preview" className="mt-3 h-40 w-full rounded-xl object-cover" />
                            )}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Hero Image Alt Text</label>
                            <input
                                value={aboutData.heroImageAlt || ""}
                                onChange={(e) => handleTextChange("heroImageAlt", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Hero Image URL (direct link)</label>
                            <input
                                value={aboutData.heroImageUrl || ""}
                                onChange={(e) => handleTextChange("heroImageUrl", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className={sectionClass}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <div className={sectionTitleClass}>
                            <FiGrid className="text-[#2F6FED]" size={18} />
                            <h2 className={sectionHeadingClass}>Stats Bar</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addStatRow}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
                        >
                            <FiPlus size={15} />
                            Add Stat
                        </button>
                    </div>
                    <div className="space-y-3">
                        {(aboutData.stats || []).map((stat, index) => (
                            <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                                <select
                                    value={stat.icon || ""}
                                    onChange={(e) => handleStatChange(index, "icon", e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">Select Icon</option>
                                    {iconOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <input
                                    value={stat.label || ""}
                                    onChange={(e) => handleStatChange(index, "label", e.target.value)}
                                    placeholder="Label (e.g., Established)"
                                    className={inputClass}
                                />
                                <input
                                    value={stat.value || ""}
                                    onChange={(e) => handleStatChange(index, "value", e.target.value)}
                                    placeholder="Value (e.g., 1995)"
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeStatRow(index)}
                                    disabled={(aboutData.stats || []).length === 1}
                                    className="flex h-11 items-center justify-center rounded-xl border border-gray-200 px-4 text-[#E5484D] transition hover:border-[#E5484D] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Story Section */}
                <section className={sectionClass}>
                    <div className={sectionTitleClass}>
                        <FiImage className="text-[#2F6FED]" size={18} />
                        <h2 className={sectionHeadingClass}>Our Story</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Story Title</label>
                            <input
                                value={aboutData.storyTitle || ""}
                                onChange={(e) => handleTextChange("storyTitle", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Paragraph 1</label>
                            <textarea
                                value={aboutData.storyParagraph1 || ""}
                                onChange={(e) => handleTextChange("storyParagraph1", e.target.value)}
                                rows={4}
                                className={textareaClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Paragraph 2</label>
                            <textarea
                                value={aboutData.storyParagraph2 || ""}
                                onChange={(e) => handleTextChange("storyParagraph2", e.target.value)}
                                rows={4}
                                className={textareaClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Story Image URL</label>
                            <input
                                value={aboutData.storyImageUrl || ""}
                                onChange={(e) => handleTextChange("storyImageUrl", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Story Image Alt Text</label>
                            <input
                                value={aboutData.storyImageAlt || ""}
                                onChange={(e) => handleTextChange("storyImageAlt", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className={sectionClass}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <div className={sectionTitleClass}>
                            <FiGrid className="text-[#2F6FED]" size={18} />
                            <h2 className={sectionHeadingClass}>What We Make (Categories)</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addCategoryRow}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
                        >
                            <FiPlus size={15} />
                            Add Category
                        </button>
                    </div>
                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Section Title</label>
                            <input
                                value={aboutData.categoriesTitle || ""}
                                onChange={(e) => handleTextChange("categoriesTitle", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Section Description</label>
                            <textarea
                                value={aboutData.categoriesDescription || ""}
                                onChange={(e) => handleTextChange("categoriesDescription", e.target.value)}
                                rows={2}
                                className={textareaClass}
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(aboutData.categories || []).map((cat, index) => (
                            <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                                <select
                                    value={cat.icon || ""}
                                    onChange={(e) => handleCategoryChange(index, "icon", e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">Select Icon</option>
                                    {iconOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <input
                                    value={cat.name || ""}
                                    onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
                                    placeholder="Name (e.g., Gaming Chairs)"
                                    className={inputClass}
                                />
                                <input
                                    value={cat.desc || ""}
                                    onChange={(e) => handleCategoryChange(index, "desc", e.target.value)}
                                    placeholder="Short description"
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeCategoryRow(index)}
                                    disabled={(aboutData.categories || []).length === 1}
                                    className="flex h-11 items-center justify-center rounded-xl border border-gray-200 px-4 text-[#E5484D] transition hover:border-[#E5484D] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Mission Section */}
                <section className={sectionClass}>
                    <div className={sectionTitleClass}>
                        <FiAward className="text-[#2F6FED]" size={18} />
                        <h2 className={sectionHeadingClass}>Mission Section</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Eyebrow</label>
                            <input
                                value={aboutData.missionEyebrow || ""}
                                onChange={(e) => handleTextChange("missionEyebrow", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Title (Mission Statement)</label>
                            <textarea
                                value={aboutData.missionTitle || ""}
                                onChange={(e) => handleTextChange("missionTitle", e.target.value)}
                                rows={3}
                                className={textareaClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Description</label>
                            <textarea
                                value={aboutData.missionDescription || ""}
                                onChange={(e) => handleTextChange("missionDescription", e.target.value)}
                                rows={3}
                                className={textareaClass}
                            />
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className={sectionClass}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <div className={sectionTitleClass}>
                            <FiShield className="text-[#2F6FED]" size={18} />
                            <h2 className={sectionHeadingClass}>Why Choose Us (Values)</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addValueRow}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
                        >
                            <FiPlus size={15} />
                            Add Value
                        </button>
                    </div>
                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Section Title</label>
                            <input
                                value={aboutData.valuesTitle || ""}
                                onChange={(e) => handleTextChange("valuesTitle", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {(aboutData.values || []).map((val, index) => (
                            <div key={index} className="space-y-3 rounded-xl border border-gray-100 p-4">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#12131A]">Title</label>
                                        <input
                                            value={val.title || ""}
                                            onChange={(e) => handleValueChange(index, "title", e.target.value)}
                                            placeholder="Title"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#12131A]">Icon</label>
                                        <select
                                            value={val.icon || ""}
                                            onChange={(e) => handleValueChange(index, "icon", e.target.value)}
                                            className={selectClass}
                                        >
                                            <option value="">Select Icon</option>
                                            {iconOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#12131A]">Description</label>
                                    <textarea
                                        value={val.desc || ""}
                                        onChange={(e) => handleValueChange(index, "desc", e.target.value)}
                                        placeholder="Description"
                                        rows={2}
                                        className={textareaClass}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeValueRow(index)}
                                    disabled={(aboutData.values || []).length === 1}
                                    className="inline-flex items-center gap-1.5 text-xs text-[#E5484D] hover:text-[#E5484D]/80"
                                >
                                    <FiTrash2 size={14} />
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className={sectionClass}>
                    <div className={sectionTitleClass}>
                        <FiAward className="text-[#2F6FED]" size={18} />
                        <h2 className={sectionHeadingClass}>Call to Action</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Title</label>
                            <input
                                value={aboutData.ctaTitle || ""}
                                onChange={(e) => handleTextChange("ctaTitle", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Description</label>
                            <textarea
                                value={aboutData.ctaDescription || ""}
                                onChange={(e) => handleTextChange("ctaDescription", e.target.value)}
                                rows={2}
                                className={textareaClass}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Button Text</label>
                                <input
                                    value={aboutData.ctaButtonText || ""}
                                    onChange={(e) => handleTextChange("ctaButtonText", e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Button Link</label>
                                <input
                                    value={aboutData.ctaButtonLink || ""}
                                    onChange={(e) => handleTextChange("ctaButtonLink", e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                        {saving ? "Saving..." : "Save About Us Page"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAbout;