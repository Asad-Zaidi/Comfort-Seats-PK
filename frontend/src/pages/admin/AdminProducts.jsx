import React, { useEffect, useState } from "react";
import AddProduct from "../../components/AddProduct";
import api, { postMultipart, putMultipart } from "../../api/api";
import { useToast } from "../../components/ToastNotification";

import {
    FiSearch,
    FiPlus,
    FiEdit,
    FiTrash2,
} from "react-icons/fi";

const AdminProducts = () => {
    const toast = useToast();
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [addOpen, setAddOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    // Fetch categories from API
    useEffect(() => {
        const fetchSiteContent = async () => {
            try {
                const res = await api.get("/site-content");
                if (res.data?.success && Array.isArray(res.data.data?.categories)) {
                    setCategories(res.data.data.categories.filter(cat => cat.name));
                }
            } catch (err) {
                console.error("Failed to load categories for admin:", err);
            }
        };
        fetchSiteContent();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products?limit=1000');
                if (res.data && res.data.success) {
                    const list = res.data.data.map((p) => ({
                        id: p._id,
                        image: p.imageUrl || (p.image ? p.image : 'https://picsum.photos/100?random=' + Date.now()),
                        name: p.name,
                        category: Array.isArray(p.category) ? (p.category[0] || '') : p.category,
                        price: p.price ? `Rs. ${p.price}` : 'Rs. 0',
                        stock: p.stock || 0,
                        status: p.soldOut ? 'Sold Out' : (p.inStock ? 'Available' : 'Out of Stock'),
                        raw: p,
                    }));

                    setProducts(list);
                }
            } catch (err) {
                console.warn('Failed to fetch products', err);
                toast.error("Failed to load products.");
            }
        };

        fetchProducts();
    }, [toast]);

    const handleAddSubmit = async (formData) => {
        try {
            const res = await postMultipart('/products', formData);
            if (res.status === 201 && res.data && res.data.success) {
                const newProduct = res.data.data;
                const productForUI = {
                    id: newProduct._id || Date.now(),
                    image: newProduct.imageUrl || 'https://picsum.photos/100?random=' + Date.now(),
                    name: newProduct.name || 'New Product',
                    category: Array.isArray(newProduct.category) ? (newProduct.category[0] || '') : newProduct.category,
                    price: newProduct.price ? `Rs. ${newProduct.price}` : 'Rs. 0',
                    stock: newProduct.stock || 0,
                    status: newProduct.soldOut ? 'Sold Out' : (newProduct.inStock ? 'Available' : 'Out of Stock'),
                    raw: newProduct,
                };

                setProducts((p) => [productForUI, ...p]);
                setAddOpen(false);
                toast.success("Product added successfully.");
                return true;
            }

            const message = (res.data && res.data.message) || `Backend returned status ${res.status}`;
            console.warn(message);
            toast.error(message);
            return false;
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || 'Could not add product.';
            console.warn('Add product failed', message);
            toast.error(message);
            return false;
        }
    };

    const handleEditClick = (product) => {
        setEditProduct(product.raw || {
            _id: product.id,
            name: product.name,
            imageUrl: product.image,
            category: product.category,
            price: product.price ? Number(product.price.replace(/Rs\.\s?/,'')) : 0,
            stock: product.stock,
            inStock: product.status === 'Available',
            soldOut: product.status === 'Sold Out',
            size: product.size || 'M',
            color: product.color || [],
            description: product.description || ''
        });
        setAddOpen(true);
    };

    const handleEditSubmit = async (formData) => {
        if (!editProduct || !editProduct._id) {
            toast.warning('No product selected for edit.');
            return false;
        }

        try {
            const res = await putMultipart(`/products/${editProduct._id}`, formData);
            if (res.status === 200 && res.data && res.data.success) {
                const p = res.data.data;
                const updated = {
                    id: p._id,
                    image: p.imageUrl || p.image || 'https://picsum.photos/100?random=' + Date.now(),
                    name: p.name,
                    category: Array.isArray(p.category) ? (p.category[0] || '') : p.category,
                    price: p.price ? `Rs. ${p.price}` : 'Rs. 0',
                    stock: p.stock || 0,
                    status: p.soldOut ? 'Sold Out' : (p.inStock ? 'Available' : 'Out of Stock'),
                    raw: p,
                };

                setProducts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                setEditProduct(null);
                setAddOpen(false);
                toast.success("Product updated successfully.");
                return true;
            }

            console.warn('Edit backend returned', res.status);
            toast.error('Could not update product.');
            return false;
        } catch (err) {
            console.warn('Edit failed', err);
            toast.error(err?.response?.data?.message || 'Edit failed.');
            return false;
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) {
            toast.warning("Delete cancelled.");
            return;
        }
        try {
            const res = await api.delete(`/products/${id}`);
            if (res.data && res.data.success) {
                setProducts((p) => p.filter((x) => x.id !== id));
                toast.success("Product deleted successfully.");
            } else {
                toast.error('Delete failed.');
            }
        } catch (err) {
            console.error('Delete error', err);
            toast.error(err?.response?.data?.message || 'Delete failed.');
        }
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    // Get unique categories from products
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

    return (
        <>
            <div className="space-y-8">

                {/* Header */}

                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-5">

                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Products</h2>
                        <p className="text-gray-500 mt-1">Manage all chair products.</p>
                    </div>

                    <button onClick={() => { setEditProduct(null); setAddOpen(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition">
                        <FiPlus />
                        Add Product
                    </button>

                </div>

                {/* Statistics */}

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <p className="text-gray-500">Total Products</p>
                        <h3 className="text-3xl font-bold mt-2">{products.length}</h3>
                    </div>

                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <p className="text-gray-500">Available</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-2">{products.filter((p) => p.status === 'Available').length}</h3>
                    </div>

                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <p className="text-gray-500">Out of Stock</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-2">{products.filter((p) => p.status !== 'Available').length}</h3>
                    </div>

                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <p className="text-gray-500">Categories</p>
                        <h3 className="text-3xl font-bold mt-2">{categories.length || uniqueCategories.length}</h3>
                    </div>

                </div>

                {/* Search */}

                <div className="bg-white border rounded-xl shadow-sm p-5">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Product..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}

                <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left">Image</th>
                                <th className="px-6 py-4 text-left">Product</th>
                                <th className="px-6 py-4 text-left">Category</th>
                                <th className="px-6 py-4 text-left">Price</th>
                                <th className="px-6 py-4 text-left">Stock</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="border-t hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{product.name}</td>
                                    <td className="px-6 py-4">{product.category}</td>
                                    <td className="px-6 py-4">{product.price}</td>
                                    <td className="px-6 py-4">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.status === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => handleEditClick(product)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                                                <FiEdit />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">Previous</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">2</button>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">Next</button>
                </div>

            </div>

            {/* Add/Edit Product Modal */}
            <AddProduct
                open={addOpen}
                onClose={() => { setAddOpen(false); setEditProduct(null); }}
                onSubmit={(fd) => (editProduct ? handleEditSubmit(fd) : handleAddSubmit(fd))}
                initialData={editProduct}
                isEdit={!!editProduct}
            />
        </>
    );
};

export default AdminProducts;