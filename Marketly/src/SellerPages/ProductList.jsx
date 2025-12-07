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
        price: ''
    })

    const [editForm, setEditForm] = useState({
        id: null,
        name: '',
        quantity: '',
        image: '',
        price: ''
    })

    // Filter products 
    const filteredProducts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) return products
        return products.filter((p) =>
            p.name.toLowerCase().includes(term)
        )
    }, [products, searchTerm])

    // add product pop up
    const openAddModal = () => {
        setAddForm({ name: '', quantity: '', image: '', price: '' })
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

        if (!addForm.image) {
            alert("Please select an image.");
            return;
        }

        const file = addForm.image;
        const filePath = `products/${user.id}-${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, file);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            alert("Failed to upload image.");
            return;
        }

        const { data: publicUrlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);

        const imageUrl = publicUrlData.publicUrl;

        const { data, error } = await supabase
            .from("Products")
            .insert({
                pname: addForm.name,
                stock: Number(addForm.quantity),
                image: imageUrl,
                price: addForm.price,
                seller_id: user.id
            })
            .select()
            .single();

        if (error) {
            alert("Could not create product.");
            return;
        }

        setProducts(prev => [...prev, {
            id: data.id,
            name: data.pname,
            quantity: data.stock,
            image: data.image,
            price: data.price
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
            price: product.price
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
        const { data: { user } } = await supabase.auth.getUser();

        let imageUrl = editForm.image;

        if (editForm.image instanceof File) {
            const file = editForm.image;
            const filePath = `products/${user.id}-${Date.now()}-${file.name}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("product-images")
                .upload(filePath, file);

            if (uploadError) {
                console.error("Image upload failed:", uploadError);
                alert("Failed to upload new image.");
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from("product-images")
                .getPublicUrl(filePath);

            imageUrl = publicUrlData.publicUrl;
        }

        const { error } = await supabase
            .from("Products")
            .update({
                pname: editForm.name,
                stock: Number(editForm.quantity),
                image: imageUrl,
                price: editForm.price
            })
            .eq("id", editForm.id);

        if (error) {
            alert("Failed to update product.");
            return;
        }

        setProducts((prev) =>
            prev.map((p) =>
                p.id === editForm.id
                    ? {
                        ...p,
                        name: editForm.name,
                        quantity: Number(editForm.quantity),
                        image: imageUrl,
                        price: editForm.price
                    }
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
            .eq("id", editForm.id);

        if (error) {
            alert("Could not delete product.");
            return;
        }

        // Update
        setProducts(prev => prev.filter(p => p.id !== editForm.id));
        setIsEditModalOpen(false);
    };

    useEffect(() => {
        async function loadProducts() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;


            const { data, error } = await supabase
                .from("Products")
                .select("id, pname, stock, image, price")
                .eq("seller_id", user.id);

            if (error) {
                console.error("Error loading products:", error);
                return;
            }


            const mapped = data.map((p) => ({
                id: p.id,
                name: p.pname,
                quantity: p.stock,
                image: p.image || "",
                price: p.price
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

                    {products.length === 0 ? (
                        <div className="emptymessage">No Products Found</div>
                    ) : (
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

                                        <div className="product-image-wrap">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="product-image"
                                            />
                                        </div>
                                        <p className="product-price">
                                            Price: ${product.price.toFixed(2)}
                                        </p>

                                        <p className="product-quantity">
                                            Quantity: {product.quantity}
                                        </p>


                                    </div>
                                ))
                            )}
                        </div>
                    )}


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
                                            <span>Item Image</span>
                                        </label>

                                        <input
                                            name="image"
                                            className="form-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setAddForm(prev => ({ ...prev, image: e.target.files[0] }))}
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
                                    <div className="form-group">
                                        <label className="form-label">
                                            Item Price
                                        </label>
                                        <input
                                            className="form-input"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step=".01"
                                            value={addForm.price}
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
                                        <img
                                            src={editForm.image instanceof File ? URL.createObjectURL(editForm.image) : editForm.image}
                                            alt="Current product"
                                            className="edit-preview-image"
                                        />

                                        <label className="form-label">
                                            Item Image (URL)
                                        </label>
                                        <input
                                            className="form-input"
                                            name="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setEditForm(prev => ({ ...prev, image: e.target.files[0] }))} />

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

                                    <div className="form-group">
                                        <label className="form-label">
                                            Item Price
                                        </label>
                                        <input
                                            className="form-input"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step=".01"
                                            value={editForm.price}
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