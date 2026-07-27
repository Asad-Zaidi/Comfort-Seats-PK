// import { useEffect, useState } from "react";
// import {
//     FiAlertCircle,
//     FiAward,
//     FiGrid,
//     FiCheckCircle,
//     FiShield,
//     FiPlus,
//     FiSave,
//     FiLoader,
//     FiTrash2,
//     FiImage,
//     FiUploadCloud,
//     FiX,
// } from "react-icons/fi";
// import api from "../../api/api";

// const iconOptions = [
//     { value: "FiCalendar", label: "Calendar" },
//     { value: "FiAward", label: "Award" },
//     { value: "FiMapPin", label: "Map Pin" },
//     { value: "FiGrid", label: "Grid" },
//     { value: "FiZap", label: "Zap" },
//     { value: "FiBriefcase", label: "Briefcase" },
//     { value: "FiHome", label: "Home" },
//     { value: "FiTrendingUp", label: "Trending Up" },
//     { value: "FiFeather", label: "Feather" },
//     { value: "FiDollarSign", label: "Dollar Sign" },
//     { value: "FiShield", label: "Shield" },
//     { value: "FiCheckCircle", label: "Check Circle" },
// ];

// const AdminAbout = () => {
//     const [aboutData, setAboutData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [status, setStatus] = useState(null);

//     // Image file states
//     const [heroImageFile, setHeroImageFile] = useState(null);
//     const [heroImagePreview, setHeroImagePreview] = useState("");

//     useEffect(() => {
//         const fetchAbout = async () => {
//             try {
//                 const res = await api.get("/site-content");
//                 if (res.data?.success && res.data.data?.aboutUs) {
//                     setAboutData(res.data.data.aboutUs);
//                     setHeroImagePreview(res.data.data.aboutUs.heroImageUrl || "");
//                 }
//             } catch (err) {
//                 setStatus({ type: "error", message: "Failed to load About page settings." });
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchAbout();
//     }, []);

//     const handleTextChange = (field, value) => {
//         setAboutData((prev) => ({ ...prev, [field]: value }));
//         setStatus(null);
//     };

//     const handleHeroImageChange = (e) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//             if (!allowedTypes.includes(file.type)) {
//                 setStatus({ type: "error", message: "Please select a valid image file (JPG, PNG, GIF, or WebP)." });
//                 return;
//             }
//             if (file.size > 5 * 1024 * 1024) {
//                 setStatus({ type: "error", message: "Image file must be less than 5MB." });
//                 return;
//             }
//             setHeroImageFile(file);
//             setHeroImagePreview(URL.createObjectURL(file));
//             setStatus(null);
//         }
//     };

//     // Stats array handlers
//     const handleStatChange = (index, field, value) => {
//         setAboutData((prev) => {
//             const newStats = [...(prev.stats || [])];
//             newStats[index] = { ...newStats[index], [field]: value };
//             return { ...prev, stats: newStats };
//         });
//         setStatus(null);
//     };

//     const addStatRow = () => {
//         setAboutData((prev) => ({
//             ...prev,
//             stats: [...(prev.stats || []), { icon: "", label: "", value: "" }]
//         }));
//     };

//     const removeStatRow = (index) => {
//         setAboutData((prev) => ({
//             ...prev,
//             stats: (prev.stats || []).filter((_, i) => i !== index)
//         }));
//         setStatus(null);
//     };

//     // Categories array handlers
//     const handleCategoryChange = (index, field, value) => {
//         setAboutData((prev) => {
//             const newCats = [...(prev.categories || [])];
//             newCats[index] = { ...newCats[index], [field]: value };
//             return { ...prev, categories: newCats };
//         });
//         setStatus(null);
//     };

//     const addCategoryRow = () => {
//         setAboutData((prev) => ({
//             ...prev,
//             categories: [...(prev.categories || []), { icon: "", name: "", desc: "" }]
//         }));
//     };

//     const removeCategoryRow = (index) => {
//         setAboutData((prev) => ({
//             ...prev,
//             categories: (prev.categories || []).filter((_, i) => i !== index)
//         }));
//         setStatus(null);
//     };

//     // Values array handlers
//     const handleValueChange = (index, field, value) => {
//         setAboutData((prev) => {
//             const newVals = [...(prev.values || [])];
//             newVals[index] = { ...newVals[index], [field]: value };
//             return { ...prev, values: newVals };
//         });
//         setStatus(null);
//     };

//     const addValueRow = () => {
//         setAboutData((prev) => ({
//             ...prev,
//             values: [...(prev.values || []), { icon: "", title: "", desc: "" }]
//         }));
//     };

//     const removeValueRow = (index) => {
//         setAboutData((prev) => ({
//             ...prev,
//             values: (prev.values || []).filter((_, i) => i !== index)
//         }));
//         setStatus(null);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSaving(true);
//         setStatus(null);

//         try {
//             const formData = new FormData();

//             // Append hero image if selected
//             if (heroImageFile) {
//                 formData.append("bannerImage", heroImageFile);
//             }

//             // Append all text fields
//             const textFields = [
//                 "heroEyebrow", "heroTitle", "heroDescription", "heroImageUrl", "heroImageAlt",
//                 "storyTitle", "storyParagraph1", "storyParagraph2", "storyImageUrl", "storyImageAlt",
//                 "categoriesTitle", "categoriesDescription",
//                 "missionEyebrow", "missionTitle", "missionDescription",
//                 "valuesTitle",
//                 "ctaTitle", "ctaDescription", "ctaButtonText", "ctaButtonLink"
//             ];

//             textFields.forEach((field) => {
//                 if (aboutData[field] !== undefined) {
//                     formData.append(field, aboutData[field]);
//                 }
//             });

//             // Append stats array
//             if (Array.isArray(aboutData.stats)) {
//                 formData.append("stats", JSON.stringify(aboutData.stats));
//             }

//             // Append categories array
//             if (Array.isArray(aboutData.categories)) {
//                 formData.append("categories", JSON.stringify(aboutData.categories));
//             }

//             // Append values array
//             if (Array.isArray(aboutData.values)) {
//                 formData.append("values", JSON.stringify(aboutData.values));
//             }

//             const res = await api.put("/site-content/about-us", aboutData);
//             if (res.data?.success) {
//                 setAboutData(res.data.data);
//                 setHeroImagePreview(res.data.data.heroImageUrl || "");
//                 setHeroImageFile(null);
//                 setStatus({ type: "success", message: "About Us page updated successfully." });
//             }
//         } catch (err) {
//             setStatus({
//                 type: "error",
//                 message: err?.response?.data?.message || "Failed to update About Us page."
//             });
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex h-64 items-center justify-center text-gray-400">
//                 <FiLoader className="animate-spin" size={22} />
//             </div>
//         );
//     }

//     if (!aboutData) {
//         return (
//             <div className="flex h-64 items-center justify-center text-gray-400">
//                 No About Us data found.
//             </div>
//         );
//     }

//     const inputClass = "block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10";
//     const textareaClass = "block w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10";
//     const selectClass = "block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10";
//     const sectionClass = "rounded-2xl border border-gray-100 bg-white p-6 shadow-sm";
//     const sectionTitleClass = "mb-5 flex items-center gap-2";
//     const sectionHeadingClass = " text-base font-semibold text-[#12131A]";

//     return (
//         <div className="mx-auto max-w-6xl">
//             <div className="mb-8">
//                 <h1 className=" text-2xl font-bold text-[#12131A]">About Us Page</h1>
//                 <p className="mt-1 text-sm text-gray-500">
//                     Edit all content for the About Us page including hero, story, categories, mission, values, and CTA sections.
//                 </p>
//             </div>

//             {status && (
//                 <div
//                     className={`mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${
//                         status.type === "success"
//                             ? "bg-[#10B981]/10 text-[#10B981]"
//                             : "bg-[#E5484D]/10 text-[#E5484D]"
//                     }`}
//                 >
//                     {status.type === "success" ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
//                     {status.message}
//                 </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-8">
//                 {/* Hero Section */}
//                 <section className={sectionClass}>
//                     <div className={sectionTitleClass}>
//                         <FiImage className="text-[#2F6FED]" size={18} />
//                         <h2 className={sectionHeadingClass}>Hero Section</h2>
//                     </div>
//                     <div className="space-y-4">
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Eyebrow</label>
//                             <input
//                                 value={aboutData.heroEyebrow || ""}
//                                 onChange={(e) => handleTextChange("heroEyebrow", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Title</label>
//                             <textarea
//                                 value={aboutData.heroTitle || ""}
//                                 onChange={(e) => handleTextChange("heroTitle", e.target.value)}
//                                 rows={2}
//                                 className={textareaClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Description</label>
//                             <textarea
//                                 value={aboutData.heroDescription || ""}
//                                 onChange={(e) => handleTextChange("heroDescription", e.target.value)}
//                                 rows={4}
//                                 className={textareaClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Hero Image</label>
//                             <div className="flex items-center gap-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => document.getElementById("heroImageInput").click()}
//                                     className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
//                                 >
//                                     <FiUploadCloud size={16} />
//                                     {heroImageFile ? "Change Image" : "Upload Image"}
//                                 </button>
//                                 {heroImageFile && (
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setHeroImageFile(null);
//                                             setHeroImagePreview(aboutData.heroImageUrl || "");
//                                         }}
//                                         className="inline-flex items-center gap-1.5 text-xs text-[#E5484D] hover:text-[#E5484D]/80"
//                                     >
//                                         <FiX size={14} />
//                                         Remove
//                                     </button>
//                                 )}
//                                 <input
//                                     id="heroImageInput"
//                                     type="file"
//                                     accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                                     onChange={handleHeroImageChange}
//                                     className="hidden"
//                                 />
//                             </div>
//                             {heroImagePreview && (
//                                 <img src={heroImagePreview} alt="Hero preview" className="mt-3 h-40 w-full rounded-xl object-cover" />
//                             )}
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Hero Image Alt Text</label>
//                             <input
//                                 value={aboutData.heroImageAlt || ""}
//                                 onChange={(e) => handleTextChange("heroImageAlt", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Hero Image URL (direct link)</label>
//                             <input
//                                 value={aboutData.heroImageUrl || ""}
//                                 onChange={(e) => handleTextChange("heroImageUrl", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                     </div>
//                 </section>

//                 {/* Stats Section */}
//                 <section className={sectionClass}>
//                     <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
//                         <div className={sectionTitleClass}>
//                             <FiGrid className="text-[#2F6FED]" size={18} />
//                             <h2 className={sectionHeadingClass}>Stats Bar</h2>
//                         </div>
//                         <button
//                             type="button"
//                             onClick={addStatRow}
//                             className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
//                         >
//                             <FiPlus size={15} />
//                             Add Stat
//                         </button>
//                     </div>
//                     <div className="space-y-3">
//                         {(aboutData.stats || []).map((stat, index) => (
//                             <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
//                                 <select
//                                     value={stat.icon || ""}
//                                     onChange={(e) => handleStatChange(index, "icon", e.target.value)}
//                                     className={selectClass}
//                                 >
//                                     <option value="">Select Icon</option>
//                                     {iconOptions.map((opt) => (
//                                         <option key={opt.value} value={opt.value}>{opt.label}</option>
//                                     ))}
//                                 </select>
//                                 <input
//                                     value={stat.label || ""}
//                                     onChange={(e) => handleStatChange(index, "label", e.target.value)}
//                                     placeholder="Label (e.g., Established)"
//                                     className={inputClass}
//                                 />
//                                 <input
//                                     value={stat.value || ""}
//                                     onChange={(e) => handleStatChange(index, "value", e.target.value)}
//                                     placeholder="Value (e.g., 1995)"
//                                     className={inputClass}
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => removeStatRow(index)}
//                                     disabled={(aboutData.stats || []).length === 1}
//                                     className="flex h-11 items-center justify-center rounded-xl border border-gray-200 px-4 text-[#E5484D] transition hover:border-[#E5484D] disabled:cursor-not-allowed disabled:opacity-40"
//                                 >
//                                     <FiTrash2 size={16} />
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* Story Section */}
//                 <section className={sectionClass}>
//                     <div className={sectionTitleClass}>
//                         <FiImage className="text-[#2F6FED]" size={18} />
//                         <h2 className={sectionHeadingClass}>Our Story</h2>
//                     </div>
//                     <div className="space-y-4">
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Story Title</label>
//                             <input
//                                 value={aboutData.storyTitle || ""}
//                                 onChange={(e) => handleTextChange("storyTitle", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Paragraph 1</label>
//                             <textarea
//                                 value={aboutData.storyParagraph1 || ""}
//                                 onChange={(e) => handleTextChange("storyParagraph1", e.target.value)}
//                                 rows={4}
//                                 className={textareaClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Paragraph 2</label>
//                             <textarea
//                                 value={aboutData.storyParagraph2 || ""}
//                                 onChange={(e) => handleTextChange("storyParagraph2", e.target.value)}
//                                 rows={4}
//                                 className={textareaClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Story Image URL</label>
//                             <input
//                                 value={aboutData.storyImageUrl || ""}
//                                 onChange={(e) => handleTextChange("storyImageUrl", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Story Image Alt Text</label>
//                             <input
//                                 value={aboutData.storyImageAlt || ""}
//                                 onChange={(e) => handleTextChange("storyImageAlt", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                     </div>
//                 </section>

//                 {/* Categories Section */}
//                 <section className={sectionClass}>
//                     <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
//                         <div className={sectionTitleClass}>
//                             <FiGrid className="text-[#2F6FED]" size={18} />
//                             <h2 className={sectionHeadingClass}>What We Make (Categories)</h2>
//                         </div>
//                         <button
//                             type="button"
//                             onClick={addCategoryRow}
//                             className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
//                         >
//                             <FiPlus size={15} />
//                             Add Category
//                         </button>
//                     </div>
//                     <div className="space-y-4 mb-4">
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Section Title</label>
//                             <input
//                                 value={aboutData.categoriesTitle || ""}
//                                 onChange={(e) => handleTextChange("categoriesTitle", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Section Description</label>
//                             <textarea
//                                 value={aboutData.categoriesDescription || ""}
//                                 onChange={(e) => handleTextChange("categoriesDescription", e.target.value)}
//                                 rows={2}
//                                 className={textareaClass}
//                             />
//                         </div>
//                     </div>
//                     <div className="space-y-3">
//                         {(aboutData.categories || []).map((cat, index) => (
//                             <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
//                                 <select
//                                     value={cat.icon || ""}
//                                     onChange={(e) => handleCategoryChange(index, "icon", e.target.value)}
//                                     className={selectClass}
//                                 >
//                                     <option value="">Select Icon</option>
//                                     {iconOptions.map((opt) => (
//                                         <option key={opt.value} value={opt.value}>{opt.label}</option>
//                                     ))}
//                                 </select>
//                                 <input
//                                     value={cat.name || ""}
//                                     onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
//                                     placeholder="Name (e.g., Gaming Chairs)"
//                                     className={inputClass}
//                                 />
//                                 <input
//                                     value={cat.desc || ""}
//                                     onChange={(e) => handleCategoryChange(index, "desc", e.target.value)}
//                                     placeholder="Short description"
//                                     className={inputClass}
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => removeCategoryRow(index)}
//                                     disabled={(aboutData.categories || []).length === 1}
//                                     className="flex h-11 items-center justify-center rounded-xl border border-gray-200 px-4 text-[#E5484D] transition hover:border-[#E5484D] disabled:cursor-not-allowed disabled:opacity-40"
//                                 >
//                                     <FiTrash2 size={16} />
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* Mission Section */}
//                 <section className={sectionClass}>
//                     <div className={sectionTitleClass}>
//                         <FiAward className="text-[#2F6FED]" size={18} />
//                         <h2 className={sectionHeadingClass}>Mission Section</h2>
//                     </div>
//                     <div className="space-y-4">
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Eyebrow</label>
//                             <input
//                                 value={aboutData.missionEyebrow || ""}
//                                 onChange={(e) => handleTextChange("missionEyebrow", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Title (Mission Statement)</label>
//                             <textarea
//                                 value={aboutData.missionTitle || ""}
//                                 onChange={(e) => handleTextChange("missionTitle", e.target.value)}
//                                 rows={3}
//                                 className={textareaClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Description</label>
//                             <textarea
//                                 value={aboutData.missionDescription || ""}
//                                 onChange={(e) => handleTextChange("missionDescription", e.target.value)}
//                                 rows={3}
//                                 className={textareaClass}
//                             />
//                         </div>
//                     </div>
//                 </section>

//                 {/* Values Section */}
//                 <section className={sectionClass}>
//                     <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
//                         <div className={sectionTitleClass}>
//                             <FiShield className="text-[#2F6FED]" size={18} />
//                             <h2 className={sectionHeadingClass}>Why Choose Us (Values)</h2>
//                         </div>
//                         <button
//                             type="button"
//                             onClick={addValueRow}
//                             className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
//                         >
//                             <FiPlus size={15} />
//                             Add Value
//                         </button>
//                     </div>
//                     <div className="space-y-4 mb-4">
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Section Title</label>
//                             <input
//                                 value={aboutData.valuesTitle || ""}
//                                 onChange={(e) => handleTextChange("valuesTitle", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                     </div>
//                     <div className="space-y-4">
//                         {(aboutData.values || []).map((val, index) => (
//                             <div key={index} className="space-y-3 rounded-xl border border-gray-100 p-4">
//                                 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                                     <div>
//                                         <label className="mb-1 block text-xs font-medium text-[#12131A]">Title</label>
//                                         <input
//                                             value={val.title || ""}
//                                             onChange={(e) => handleValueChange(index, "title", e.target.value)}
//                                             placeholder="Title"
//                                             className={inputClass}
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="mb-1 block text-xs font-medium text-[#12131A]">Icon</label>
//                                         <select
//                                             value={val.icon || ""}
//                                             onChange={(e) => handleValueChange(index, "icon", e.target.value)}
//                                             className={selectClass}
//                                         >
//                                             <option value="">Select Icon</option>
//                                             {iconOptions.map((opt) => (
//                                                 <option key={opt.value} value={opt.value}>{opt.label}</option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <label className="mb-1 block text-xs font-medium text-[#12131A]">Description</label>
//                                     <textarea
//                                         value={val.desc || ""}
//                                         onChange={(e) => handleValueChange(index, "desc", e.target.value)}
//                                         placeholder="Description"
//                                         rows={2}
//                                         className={textareaClass}
//                                     />
//                                 </div>
//                                 <button
//                                     type="button"
//                                     onClick={() => removeValueRow(index)}
//                                     disabled={(aboutData.values || []).length === 1}
//                                     className="inline-flex items-center gap-1.5 text-xs text-[#E5484D] hover:text-[#E5484D]/80"
//                                 >
//                                     <FiTrash2 size={14} />
//                                     Remove
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* CTA Section */}
//                 <section className={sectionClass}>
//                     <div className={sectionTitleClass}>
//                         <FiAward className="text-[#2F6FED]" size={18} />
//                         <h2 className={sectionHeadingClass}>Call to Action</h2>
//                     </div>
//                     <div className="space-y-4">
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Title</label>
//                             <input
//                                 value={aboutData.ctaTitle || ""}
//                                 onChange={(e) => handleTextChange("ctaTitle", e.target.value)}
//                                 className={inputClass}
//                             />
//                         </div>
//                         <div>
//                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Description</label>
//                             <textarea
//                                 value={aboutData.ctaDescription || ""}
//                                 onChange={(e) => handleTextChange("ctaDescription", e.target.value)}
//                                 rows={2}
//                                 className={textareaClass}
//                             />
//                         </div>
//                         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                             <div>
//                                 <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Button Text</label>
//                                 <input
//                                     value={aboutData.ctaButtonText || ""}
//                                     onChange={(e) => handleTextChange("ctaButtonText", e.target.value)}
//                                     className={inputClass}
//                                 />
//                             </div>
//                             <div>
//                                 <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Button Link</label>
//                                 <input
//                                     value={aboutData.ctaButtonLink || ""}
//                                     onChange={(e) => handleTextChange("ctaButtonLink", e.target.value)}
//                                     className={inputClass}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Submit Button */}
//                 <div className="flex justify-end">
//                     <button
//                         type="submit"
//                         disabled={saving}
//                         className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                         {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
//                         {saving ? "Saving..." : "Save About Us Page"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AdminAbout;

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
    FiCalendar,
    FiMapPin,
    FiZap,
    FiBriefcase,
    FiHome,
    FiTrendingUp,
    FiFeather,
    FiDollarSign,
    FiCompass,
    FiTarget,
    FiArrowRight,
    FiBookOpen,
} from "react-icons/fi";
import api from "../../api/api";
import RichTextEditor from "../../components/common/RichTextEditor";

// Icon Map helper to visually render chosen icons in inputs
const ICON_MAP = {
    FiCalendar,
    FiAward,
    FiMapPin,
    FiGrid,
    FiZap,
    FiBriefcase,
    FiHome,
    FiTrendingUp,
    FiFeather,
    FiDollarSign,
    FiShield,
    FiCheckCircle,
};

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

const tabs = [
    { id: "hero", label: "Hero & Banner", icon: FiImage },
    { id: "stats", label: "Key Stats", icon: FiGrid },
    { id: "story", label: "Our Story", icon: FiBookOpen },
    { id: "categories", label: "Categories", icon: FiCompass },
    { id: "mission", label: "Mission", icon: FiTarget },
    { id: "values", label: "Core Values", icon: FiShield },
    { id: "cta", label: "Call to Action", icon: FiArrowRight },
];

const AdminAbout = () => {
    const [aboutData, setAboutData] = useState(null);
    const [activeTab, setActiveTab] = useState("hero");
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
                setStatus({
                    type: "error",
                    message: "Failed to load About page settings.",
                });
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
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif",
                "image/webp",
            ];
            if (!allowedTypes.includes(file.type)) {
                setStatus({
                    type: "error",
                    message: "Please select a valid image file (JPG, PNG, GIF, WebP).",
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setStatus({
                    type: "error",
                    message: "Image file size must be under 5MB.",
                });
                return;
            }
            setHeroImageFile(file);
            setHeroImagePreview(URL.createObjectURL(file));
            setStatus(null);
        }
    };

    // Stats Handlers
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
            stats: [...(prev.stats || []), { icon: "FiAward", label: "", value: "" }],
        }));
    };

    const removeStatRow = (index) => {
        setAboutData((prev) => ({
            ...prev,
            stats: (prev.stats || []).filter((_, i) => i !== index),
        }));
        setStatus(null);
    };

    // Category Handlers
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
            categories: [
                ...(prev.categories || []),
                { icon: "FiGrid", name: "", desc: "" },
            ],
        }));
    };

    const removeCategoryRow = (index) => {
        setAboutData((prev) => ({
            ...prev,
            categories: (prev.categories || []).filter((_, i) => i !== index),
        }));
        setStatus(null);
    };

    // Values Handlers
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
            values: [
                ...(prev.values || []),
                { icon: "FiShield", title: "", desc: "" },
            ],
        }));
    };

    const removeValueRow = (index) => {
        setAboutData((prev) => ({
            ...prev,
            values: (prev.values || []).filter((_, i) => i !== index),
        }));
        setStatus(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const formData = new FormData();
            if (heroImageFile) {
                formData.append("bannerImage", heroImageFile);
            }

            const textFields = [
                "heroEyebrow",
                "heroTitle",
                "heroDescription",
                "heroImageUrl",
                "heroImageAlt",
                "storyTitle",
                "storyParagraph1",
                "storyParagraph2",
                "storyImageUrl",
                "storyImageAlt",
                "categoriesTitle",
                "categoriesDescription",
                "missionEyebrow",
                "missionTitle",
                "missionDescription",
                "valuesTitle",
                "ctaTitle",
                "ctaDescription",
                "ctaButtonText",
                "ctaButtonLink",
            ];

            textFields.forEach((field) => {
                if (aboutData[field] !== undefined) {
                    formData.append(field, aboutData[field]);
                }
            });

            if (Array.isArray(aboutData.stats)) {
                formData.append("stats", JSON.stringify(aboutData.stats));
            }
            if (Array.isArray(aboutData.categories)) {
                formData.append("categories", JSON.stringify(aboutData.categories));
            }
            if (Array.isArray(aboutData.values)) {
                formData.append("values", JSON.stringify(aboutData.values));
            }

            const res = await api.put("/site-content/about-us", aboutData);
            if (res.data?.success) {
                setAboutData(res.data.data);
                setHeroImagePreview(res.data.data.heroImageUrl || "");
                setHeroImageFile(null);
                setStatus({
                    type: "success",
                    message: "About Us page content published successfully.",
                });
            }
        } catch (err) {
            setStatus({
                type: "error",
                message:
                    err?.response?.data?.message || "Failed to update About Us page.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-400">
                <FiLoader className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Loading Page Content...</span>
            </div>
        );
    }

    if (!aboutData) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
                <FiAlertCircle className="mb-2 h-8 w-8 text-amber-500" />
                <p className="font-medium">No About Us configuration record found.</p>
            </div>
        );
    }

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10";
    const textareaClass =
        "w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10";
    const selectClass =
        "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10";

    const renderIcon = (iconName) => {
        const Component = ICON_MAP[iconName];
        return Component ? <Component className="h-4 w-4 text-indigo-600" /> : null;
    };

    return (
        <div className="mx-auto max-w-full space-y-6 pb-12">
            {/* Top Header Bar */}
            <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-md shadow-sm">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        About Page CMS
                    </h1>
                    <p className="text-xs text-slate-500">
                        Customize sections, visuals, and dynamic statistics for public
                        viewers.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
                >
                    {saving ? (
                        <FiLoader className="h-4 w-4 animate-spin" />
                    ) : (
                        <FiSave className="h-4 w-4" />
                    )}
                    {saving ? "Saving Changes..." : "Publish Changes"}
                </button>
            </div>

            {/* Status Alert Banner */}
            {status && (
                <div
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium transition-all ${status.type === "success"
                            ? "border-emerald-200 bg-emerald-50/70 text-emerald-800"
                            : "border-rose-200 bg-rose-50/70 text-rose-800"
                        }`}
                >
                    {status.type === "success" ? (
                        <FiCheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                        <FiAlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                    )}
                    <span>{status.message}</span>
                </div>
            )}

            {/* Main Tabbed Interface Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
                {/* Navigation Tabs */}
                <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <Icon
                                    className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"
                                        }`}
                                />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Tab Form Panels */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit}>
                        {/* HERO PANEL */}
                        {activeTab === "hero" && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-base font-bold text-slate-900">
                                        Hero Section Configuration
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        The main introduction visitors see when landing on the About
                                        page.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Eyebrow Tagline
                                        </label>
                                        <input
                                            value={aboutData.heroEyebrow || ""}
                                            onChange={(e) =>
                                                handleTextChange("heroEyebrow", e.target.value)
                                            }
                                            placeholder="e.g. WHO WE ARE"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Main Title
                                        </label>
                                        <textarea
                                            value={aboutData.heroTitle || ""}
                                            onChange={(e) =>
                                                handleTextChange("heroTitle", e.target.value)
                                            }
                                            rows={2}
                                            placeholder="Crafting exceptional experiences..."
                                            className={textareaClass}
                                        />
                                    </div>

                                     <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Hero Description Paragraph
                                        </label>
                                        <RichTextEditor
                                            value={aboutData.heroDescription || ""}
                                            onChange={(html) => handleTextChange("heroDescription", html)}
                                            placeholder="Enter hero description..."
                                        />
                                     </div>

                                    {/* Banner Image Dropzone */}
                                    <div className="space-y-2 flex  gap-4 ">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Hero Visual Banner
                                        </label>
                                        <div className="group relative h-52 flex-1 cursor-pointer flex-row items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-indigo-400 hover:bg-indigo-50/20">
                                            <input
                                                id="heroImageInput"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                onChange={handleHeroImageChange}
                                                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                                            />
                                            <div className="flex flex-col items-center text-center">
                                                <div className="mb-2 rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-transform group-hover:scale-110">
                                                    <FiUploadCloud className="h-6 w-6" />
                                                </div>
                                                <p className="text-xs font-semibold text-slate-700">
                                                    Click or drag to upload image
                                                </p>
                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    WEBP, PNG, JPG up to 5MB
                                                </p>
                                            </div>
                                        </div>

                                        {/* Image Preview Component */}
                                        {heroImagePreview && (
                                            <div className="relative h-52 flex-1 overflow-hidden rounded-2xl border">
                                                <img
                                                    src={heroImagePreview}
                                                    alt="Hero banner preview"
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute right-3 top-3 flex gap-2">
                                                    {heroImageFile && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setHeroImageFile(null);
                                                                setHeroImagePreview(
                                                                    aboutData.heroImageUrl || ""
                                                                );
                                                            }}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-xs hover:bg-rose-700"
                                                        >
                                                            <FiX className="h-3.5 w-3.5" /> Revert
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                Image Alt Text
                                            </label>
                                            <input
                                                value={aboutData.heroImageAlt || ""}
                                                onChange={(e) =>
                                                    handleTextChange("heroImageAlt", e.target.value)
                                                }
                                                placeholder="Descriptive text for SEO"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                Direct Image URL (Fallback)
                                            </label>
                                            <input
                                                value={aboutData.heroImageUrl || ""}
                                                onChange={(e) =>
                                                    handleTextChange("heroImageUrl", e.target.value)
                                                }
                                                placeholder="https://..."
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STATS PANEL */}
                        {activeTab === "stats" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            Highlight Statistics
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Key metrics and milestone figures shown across the site.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addStatRow}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 shadow-2xs"
                                    >
                                        <FiPlus className="h-3.5 w-3.5" /> Add Metric
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {(aboutData.stats || []).map((stat, index) => (
                                        <div
                                            key={index}
                                            className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 transition-all hover:border-slate-300 sm:flex-row sm:items-center"
                                        >
                                            <div className="flex items-center gap-2 sm:w-3/4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                                                    {renderIcon(stat.icon)}
                                                </div>
                                                <select
                                                    value={stat.icon || ""}
                                                    onChange={(e) =>
                                                        handleStatChange(index, "icon", e.target.value)
                                                    }
                                                    className={selectClass}
                                                >
                                                    <option value="">Select Icon</option>
                                                    {iconOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <input
                                                value={stat.label || ""}
                                                onChange={(e) =>
                                                    handleStatChange(index, "label", e.target.value)
                                                }
                                                placeholder="Label (e.g., Global Clients)"
                                                className={inputClass}
                                            />

                                            <input
                                                value={stat.value || ""}
                                                onChange={(e) =>
                                                    handleStatChange(index, "value", e.target.value)
                                                }
                                                placeholder="Value (e.g., 10k+)"
                                                className={inputClass}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => removeStatRow(index)}
                                                disabled={(aboutData.stats || []).length === 1}
                                                className="self-end sm:self-center flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-rose-500 transition hover:bg-rose-50 hover:border-rose-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* OUR STORY PANEL */}
                        {activeTab === "story" && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-base font-bold text-slate-900">
                                        Brand History & Narrative
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Share your company's journey and origins story.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Story Section Title
                                        </label>
                                        <input
                                            value={aboutData.storyTitle || ""}
                                            onChange={(e) =>
                                                handleTextChange("storyTitle", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                     <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            First Paragraph
                                        </label>
                                        <RichTextEditor
                                            value={aboutData.storyParagraph1 || ""}
                                            onChange={(html) => handleTextChange("storyParagraph1", html)}
                                            placeholder="Enter first story paragraph..."
                                        />
                                     </div>

                                     <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Second Paragraph
                                        </label>
                                        <RichTextEditor
                                            value={aboutData.storyParagraph2 || ""}
                                            onChange={(html) => handleTextChange("storyParagraph2", html)}
                                            placeholder="Enter second story paragraph..."
                                        />
                                     </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                Story Image URL
                                            </label>
                                            <input
                                                value={aboutData.storyImageUrl || ""}
                                                onChange={(e) =>
                                                    handleTextChange("storyImageUrl", e.target.value)
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                Story Image Alt
                                            </label>
                                            <input
                                                value={aboutData.storyImageAlt || ""}
                                                onChange={(e) =>
                                                    handleTextChange("storyImageAlt", e.target.value)
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CATEGORIES PANEL */}
                        {activeTab === "categories" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            What We Make / Offering Categories
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Highlight your core pillars or product categories.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addCategoryRow}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 shadow-2xs"
                                    >
                                        <FiPlus className="h-3.5 w-3.5" /> Add Category
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Section Title
                                        </label>
                                        <input
                                            value={aboutData.categoriesTitle || ""}
                                            onChange={(e) =>
                                                handleTextChange("categoriesTitle", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Section Subtitle / Description
                                        </label>
                                        <textarea
                                            value={aboutData.categoriesDescription || ""}
                                            onChange={(e) =>
                                                handleTextChange(
                                                    "categoriesDescription",
                                                    e.target.value
                                                )
                                            }
                                            rows={2}
                                            className={textareaClass}
                                        />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        {(aboutData.categories || []).map((cat, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex items-center gap-2 sm:w-1/3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                                                        {renderIcon(cat.icon)}
                                                    </div>
                                                    <select
                                                        value={cat.icon || ""}
                                                        onChange={(e) =>
                                                            handleCategoryChange(index, "icon", e.target.value)
                                                        }
                                                        className={selectClass}
                                                    >
                                                        <option value="">Select Icon</option>
                                                        {iconOptions.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <input
                                                    value={cat.name || ""}
                                                    onChange={(e) =>
                                                        handleCategoryChange(index, "name", e.target.value)
                                                    }
                                                    placeholder="Category Name"
                                                    className={inputClass}
                                                />

                                                <input
                                                    value={cat.desc || ""}
                                                    onChange={(e) =>
                                                        handleCategoryChange(index, "desc", e.target.value)
                                                    }
                                                    placeholder="Brief description"
                                                    className={inputClass}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => removeCategoryRow(index)}
                                                    disabled={(aboutData.categories || []).length === 1}
                                                    className="self-end sm:self-center flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-rose-500 transition hover:bg-rose-50 hover:border-rose-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MISSION PANEL */}
                        {activeTab === "mission" && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-base font-bold text-slate-900">
                                        Mission Statement
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Define your core purpose and long-term ambition.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Mission Tagline (Eyebrow)
                                        </label>
                                        <input
                                            value={aboutData.missionEyebrow || ""}
                                            onChange={(e) =>
                                                handleTextChange("missionEyebrow", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Main Mission Statement
                                        </label>
                                        <textarea
                                            value={aboutData.missionTitle || ""}
                                            onChange={(e) =>
                                                handleTextChange("missionTitle", e.target.value)
                                            }
                                            rows={3}
                                            className={textareaClass}
                                        />
                                    </div>

                                     <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Detailed Explanation
                                        </label>
                                        <RichTextEditor
                                            value={aboutData.missionDescription || ""}
                                            onChange={(html) => handleTextChange("missionDescription", html)}
                                            placeholder="Enter detailed mission explanation..."
                                        />
                                     </div>
                                </div>
                            </div>
                        )}

                        {/* VALUES PANEL */}
                        {activeTab === "values" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            Core Values / Why Choose Us
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            The key principles guiding your team and service.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addValueRow}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 shadow-2xs"
                                    >
                                        <FiPlus className="h-3.5 w-3.5" /> Add Value Card
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Section Header Title
                                        </label>
                                        <input
                                            value={aboutData.valuesTitle || ""}
                                            onChange={(e) =>
                                                handleTextChange("valuesTitle", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {(aboutData.values || []).map((val, index) => (
                                            <div
                                                key={index}
                                                className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300"
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                                                            {renderIcon(val.icon)}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeValueRow(index)}
                                                            disabled={(aboutData.values || []).length === 1}
                                                            className="text-slate-400 transition hover:text-rose-500 disabled:opacity-30"
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                                                            Value Title
                                                        </label>
                                                        <input
                                                            value={val.title || ""}
                                                            onChange={(e) =>
                                                                handleValueChange(index, "title", e.target.value)
                                                            }
                                                            placeholder="Title"
                                                            className={inputClass}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                                                            Icon Symbol
                                                        </label>
                                                        <select
                                                            value={val.icon || ""}
                                                            onChange={(e) =>
                                                                handleValueChange(index, "icon", e.target.value)
                                                            }
                                                            className={selectClass}
                                                        >
                                                            <option value="">Select Icon</option>
                                                            {iconOptions.map((opt) => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                                                            Value Description
                                                        </label>
                                                        <textarea
                                                            value={val.desc || ""}
                                                            onChange={(e) =>
                                                                handleValueChange(index, "desc", e.target.value)
                                                            }
                                                            rows={2}
                                                            className={textareaClass}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CALL TO ACTION PANEL */}
                        {activeTab === "cta" && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-base font-bold text-slate-900">
                                        Bottom Call To Action (CTA)
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Drive user conversions at the end of the page.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            CTA Title
                                        </label>
                                        <input
                                            value={aboutData.ctaTitle || ""}
                                            onChange={(e) =>
                                                handleTextChange("ctaTitle", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            CTA Body Paragraph
                                        </label>
                                        <textarea
                                            value={aboutData.ctaDescription || ""}
                                            onChange={(e) =>
                                                handleTextChange("ctaDescription", e.target.value)
                                            }
                                            rows={3}
                                            className={textareaClass}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                Button Text
                                            </label>
                                            <input
                                                value={aboutData.ctaButtonText || ""}
                                                onChange={(e) =>
                                                    handleTextChange("ctaButtonText", e.target.value)
                                                }
                                                placeholder="e.g., Get Started"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                Button Link Destination
                                            </label>
                                            <input
                                                value={aboutData.ctaButtonLink || ""}
                                                onChange={(e) =>
                                                    handleTextChange("ctaButtonLink", e.target.value)
                                                }
                                                placeholder="e.g., /contact"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAbout;