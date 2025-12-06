import React, { useState, useMemo, useEffect } from "react"
import Header from "../components/Header";
import { Search, Plus, Pencil } from 'lucide-react';
import "./prodList.css"
import { supabase } from "../supabaseClient";


export default function ProductList() {

    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const [addForm, setAddForm] = useState({
        name: '',
        quantity: '',
        image: '',
    })

    const [editForm, setEditForm] = useState({
        id: null,
        name: '',
        quantity: '',
        image: '',
    })

    // Filter products by partial name (case-insensitive)
    const filteredProducts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) return products
        return products.filter((p) =>
            p.name.toLowerCase().includes(term)
        )
    }, [products, searchTerm])

    // ---------- Add Product Modal ----------
    const openAddModal = () => {
        setAddForm({ name: '', quantity: '', image: '' })
        setIsAddModalOpen(true)
    }

    const closeAddModal = () => {
        setIsAddModalOpen(false)
    }

    const handleAddChange = (e) => {
        const { name, value } = e.target
        setAddForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleAddConfirm = async (e) => {
        e.preventDefault();

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from("Products")
            .insert({
                pname: addForm.name,
                stock: Number(addForm.quantity),
                image: addForm.image,
                seller_id: user.id
            })
            .select()
            .single();

        if (error) {
            alert("Could not create product.");
            return;
        }

        setProducts(prev => [...prev, {
            id: data.pid,
            name: data.pname,
            quantity: data.stock,
            image: data.image
        }]);

        setIsAddModalOpen(false);
    };

    // edit product
    const openEditModal = (product) => {
        setEditForm({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            image: product.image,
        })
        setIsEditModalOpen(true)
    }

    const closeEditModal = () => {
        setIsEditModalOpen(false)
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleEditConfirm = async (e) => {
        e.preventDefault();

        const { error } = await supabase
            .from("Products")
            .update({
                pname: editForm.name,
                stock: Number(editForm.quantity),
                image: editForm.image
            })
            .eq("pid", editForm.id);

        if (error) {
            alert("Failed to update product.");
            return;
        }

        setProducts((prev) =>
            prev.map((p) =>
                p.id === editForm.id
                    ? { ...p, name: editForm.name, quantity: Number(editForm.quantity), image: editForm.image }
                    : p
            )
        );

        setIsEditModalOpen(false);
    };

    const handleDeleteProduct = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this product?");
        if (!confirmed) return;

        const { error } = await supabase
            .from("Products")
            .delete()
            .eq("pid", editForm.id);

        if (error) {
            alert("Could not delete product.");
            return;
        }

        // Update UI
        setProducts(prev => prev.filter(p => p.id !== editForm.id));
        setIsEditModalOpen(false);
    };

    useEffect(() => {
        async function loadProducts() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;


            const { data, error } = await supabase
                .from("Products")
                .select("id, pname, stock, image")
                .eq("seller_id", user.id);

            if (error) {
                console.error("Error loading products:", error);
                return;
            }


            const mapped = data.map((p) => ({
                id: p.id,
                name: p.pname,
                quantity: p.stock,
                image: p.image || ""
            }));

            setProducts(mapped);
        }

        loadProducts();
    }, []);

    return (
        <>
            <Header />
            <div className="page">
                <div className="page-inner">
                    {/* Search Bar */}

                    <div className="search-container">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Header */}
                    <div className="header-section">
                        <h1 className="page-title">Product List</h1>
                        <button
                            className="add-button"
                            onClick={openAddModal}
                        >
                            <Plus size={18} className="button-icon" />
                            <span>Add New Product</span>
                        </button>
                    </div>

                    {/* Product Cards */}

                    <div className="products-grid">
                        {filteredProducts.length === 0 ? (
                            <p className="no-results">
                                No products match that search.
                            </p>
                        ) : (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="product-card">
                                    <button
                                        className="edit-icon-button"
                                        onClick={() => openEditModal(product)}
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <div className="product-name">
                                        {product.name}
                                    </div>
                                    {/* come back to this !!!!!!!!!!!! */}
                                    <div className="product-image-wrap">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="product-image"
                                        />
                                    </div>
                                    <p className="product-quantity">
                                        Quantity: {product.quantity}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Product Modal */}
                    {isAddModalOpen && (
                        <div
                            className="modal-overlay"
                            onClick={closeAddModal}
                        >
                            <div
                                className="modal-content"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="modal-title">
                                    <h2>Add New Product to List</h2>
                                </div>

                                <form
                                    className="modal-body"
                                    onSubmit={handleAddConfirm}
                                >
                                    <div className="form-group">
                                        <label className="form-label">
                                            <span>Item Image (URL)</span>

                                        </label>

                                        <input
                                            name="image"
                                            className="form-input"
                                            type="text"
                                            value={addForm.image}
                                            onChange={handleAddChange}
                                            placeholder="https://..."
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            Item Name
                                        </label>

                                        <input
                                            className="form-input"
                                            name="name"
                                            type="text"
                                            value={addForm.name}
                                            onChange={handleAddChange}
                                            required
                                        />

                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            Item Quantity
                                        </label>

                                        <input
                                            className="form-input"
                                            name="quantity"
                                            type="number"
                                            min="0"
                                            value={addForm.quantity}
                                            onChange={handleAddChange}
                                            required
                                        />

                                    </div>

                                    <div className="modal-buttons">
                                        <button
                                            type="button"
                                            className="modal-button cancel-button"
                                            onClick={closeAddModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="modal-button confirm-button"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit Product Modal */}
                    {isEditModalOpen && (
                        <div
                            className="modal-overlay"
                            onClick={closeEditModal}
                        >
                            <div
                                className="modal-content"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="modal-title">
                                    <h2>Edit {editForm.name || 'Product'}</h2>

                                </div>

                                <form
                                    className="modal-body"
                                    onSubmit={handleEditConfirm}
                                >
                                    <div className="form-group">
                                        <label className="form-label">
                                            Item Image (URL)
                                        </label>
                                        <input
                                            className="form-input"
                                            name="image"
                                            type="text"
                                            value={editForm.image}
                                            onChange={handleEditChange} />

                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Item Name
                                        </label>
                                        <input
                                            className="form-input"
                                            name="name"
                                            type="text"
                                            value={editForm.name}
                                            onChange={handleEditChange}
                                            required />

                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Item Quantity
                                        </label>
                                        <input
                                            className="form-input"
                                            name="quantity"
                                            type="number"
                                            min="0"
                                            value={editForm.quantity}
                                            onChange={handleEditChange} />

                                    </div>


                                    <div className="modal-buttons-edit">
                                        <button
                                            type="button"
                                            className="modal-button delete-button"
                                            onClick={handleDeleteProduct}
                                        >
                                            Delete product
                                        </button>

                                        <div className="right-buttons">
                                            <button
                                                type="button"
                                                className="modal-button cancel-button"
                                                onClick={closeEditModal}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="modal-button confirm-button-green"
                                            >
                                                Confirm
                                            </button>

                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>

    )

}