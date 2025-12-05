import React, { useState, useMemo } from "react"
import Header from "../components/Header";
import { Search, Plus, Pencil } from 'lucide-react';
import "./prodList.css"

const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: 'Burgundy Tote Bag',
        quantity: 15,
        image:
            '',
    },
    {
        id: 2,
        name: 'Beige Knit Sweater',
        quantity: 8,
        image:
            '',
    },
    {
        id: 3,
        name: 'Maroon Coffee Mug',
        quantity: 32,
        image:
            '',
    },
]

export default function ProductList() {

    const [products, setProducts] = useState(INITIAL_PRODUCTS)
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

    const handleAddConfirm = (e) => {
        e.preventDefault()

        const newProduct = {
            id: Date.now(),
            name: addForm.name || 'Untitled Product',
            quantity: Number(addForm.quantity) || 0,
            image:
                addForm.image ||
                '',
        }

        setProducts((prev) => [...prev, newProduct])
        setIsAddModalOpen(false)
    }

    // ---------- Edit Product Modal ----------
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

    const handleEditConfirm = (e) => {
        e.preventDefault()
        setProducts((prev) =>
            prev.map((p) =>
                p.id === editForm.id
                    ? {
                        ...p,
                        name: editForm.name,
                        quantity: Number(editForm.quantity) || 0,
                        image: editForm.image,
                    }
                    : p
            )
        )
        setIsEditModalOpen(false)
    }

    const handleDeleteProduct = () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this product?'
        )
        if (!confirmed) return

        setProducts((prev) =>
            prev.filter((p) => p.id !== editForm.id)
        )
        setIsEditModalOpen(false)
    }

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
                                    {/* <button
                                        className="icon-button close-button"
                                        onClick={closeAddModal}
                                    >
                                        <X size={18} />
                                    </button> */}
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