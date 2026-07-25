import React, { useEffect, useState, useRef } from "react";
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiX,
    FiLoader,
    FiUploadCloud,
} from "react-icons/fi";
import api from "../../api/api";
import { useToast } from "../../components/ToastNotification";

const AddCategory = () => {
    const toast = useToast();
    const [categories, setCategories] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editCategoryName, setEditCategoryName] = useState("");
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [newCategoryImagePreview, setNewCategoryImagePreview] = useState("");
    const [editCategoryImage, setEditCategoryImage] = useState(null);
    const [editCategoryImagePreview, setEditCategoryImagePreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const newImageRef = useRef(null);
    const editImageRef = useRef(null);

    // Fetch categories from API
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/site-content");
            if (res.data?.success && Array.isArray(res.data.data?.categories)) {
                const fetchedCategories = res.data.data.categories
                    .filter(cat => cat.name)
                    .map(cat => ({
                        id: cat._id || cat.name,
                        name: cat.name,
                        image: cat.image || '',
                    }));
                setCategories(fetchedCategories);
            }
        } catch (err) {
            console.error("Failed to load categories:", err);
            toast.error("Failed to load categories.");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        const name = newCategoryName.trim();
        if (!name) {
            toast.warning("Please enter a category name.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            if (newCategoryImage) {
                formData.append("image", newCategoryImage);
            }

            const res = await api.post("/site-content/categories", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data?.success) {
                toast.success(res.data.message || "Category added successfully.");
                setNewCategoryName("");
                setNewCategoryImage(null);
                setNewCategoryImagePreview("");
                setShowAddForm(false);
                fetchCategories();
            } else {
                toast.error(res.data.message || "Failed to add category.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to add category.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        const name = editCategoryName.trim();
        if (!name) {
            toast.warning("Please enter a category name.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            if (editCategoryImage) {
                formData.append("image", editCategoryImage);
            }

            const res = await api.put(`/site-content/categories/${editingCategory.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data?.success) {
                toast.success(res.data.message || "Category updated successfully.");
                setEditingCategory(null);
                setEditCategoryName("");
                setEditCategoryImage(null);
                setEditCategoryImagePreview("");
                fetchCategories();
            } else {
                toast.error(res.data.message || "Failed to update category.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update category.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await api.delete(`/site-content/categories/${id}`);
            if (res.data?.success) {
                toast.success(res.data.message || "Category deleted successfully.");
                fetchCategories();
            } else {
                toast.error(res.data.message || "Failed to delete category.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete category.");
        } finally {
            setIsDeleting(false);
        }
    };

    const startEdit = (category) => {
        setEditingCategory(category);
        setEditCategoryName(category.name);
        setEditCategoryImagePreview(category.image || "");
        setShowAddForm(false);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setEditCategoryName("");
    };

    const cancelAdd = () => {
        setShowAddForm(false);
        setNewCategoryName("");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-5">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Categories</h2>
                    <p className="text-gray-500 mt-1">Manage product categories</p>
                </div>
                {!showAddForm && !editingCategory && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
                    >
                        <FiPlus />
                        Add Category
                    </button>
                )}
            </div>

            {/* Add Category Form */}
            {showAddForm && (
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Category</h3>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Enter category name"
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Category Image
                            </label>
                            <input
                                ref={newImageRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setNewCategoryImage(file);
                                        setNewCategoryImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="hidden"
                            />
                            {newCategoryImagePreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={newCategoryImagePreview}
                                        alt="Preview"
                                        className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewCategoryImage(null);
                                            setNewCategoryImagePreview("");
                                            if (newImageRef.current) newImageRef.current.value = "";
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => newImageRef.current?.click()}
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition"
                                >
                                    <FiUploadCloud size={32} className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click to upload category image</span>
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting && <FiLoader className="animate-spin" />}
                                {isSubmitting ? "Adding..." : "Add Category"}
                            </button>
                            <button
                                type="button"
                                onClick={cancelAdd}
                                className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl transition"
                            >
                                <FiX size={16} />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Category Form */}
            {editingCategory && (
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Category</h3>
                    <form onSubmit={handleEditCategory} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                placeholder="Enter category name"
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Category Image
                            </label>
                            <input
                                ref={editImageRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setEditCategoryImage(file);
                                        setEditCategoryImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="hidden"
                            />
                            {(editCategoryImagePreview || editingCategory.image) ? (
                                <div className="relative inline-block">
                                    <img
                                        src={editCategoryImagePreview || editingCategory.image}
                                        alt="Preview"
                                        className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditCategoryImage(null);
                                            setEditCategoryImagePreview("");
                                            if (editImageRef.current) editImageRef.current.value = "";
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => editImageRef.current?.click()}
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition"
                                >
                                    <FiUploadCloud size={32} className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click to upload category image</span>
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting && <FiLoader className="animate-spin" />}
                                {isSubmitting ? "Updating..." : "Update Category"}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl transition"
                            >
                                <FiX size={16} />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left">#</th>
                            <th className="px-6 py-4 text-left">Image</th>
                            <th className="px-6 py-4 text-left">Category Name</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                    No categories found. Add your first category to get started.
                                </td>
                            </tr>
                        ) : (
                            categories.map((category, index) => (
                                <tr key={category.id || category.name} className="border-t hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        {category.image && (
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                            />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium">{category.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => startEdit(category)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <FiEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                                disabled={isDeleting}
                                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                                                title="Delete"
                                            >
                                                {isDeleting ? (
                                                    <FiLoader className="animate-spin" size={16} />
                                                ) : (
                                                    <FiTrash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AddCategory;