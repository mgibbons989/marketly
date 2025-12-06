import Header from "../components/Header";
import React, { useState, useEffect } from "react";
import { Search, Minus, Plus, X } from "lucide-react";
import "./catalog.css";

const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        seller: "TechGear Co",
        price: 89.99,
        image: "/wireless-headphones.png",
    },
    {
        id: 2,
        name: "Smart Watch",
        seller: "WearableTech",
        price: 199.99,
        image: "/smartwatch-lifestyle.png",
    },
    {
        id: 3,
        name: "Laptop Stand",
        seller: "OfficeMax",
        price: 45.5,
        image: "/laptop-stand.png",
    },
    {
        id: 4,
        name: "USB-C Cable",
        seller: "TechGear Co",
        price: 12.99,
        image: "/usb-cable.png",
    },
    {
        id: 5,
        name: "Mechanical Keyboard",
        seller: "KeyMasters",
        price: 129.99,
        image: "/mechanical-keyboard.png",
    },
    {
        id: 6,
        name: "Ergonomic Mouse",
        seller: "OfficeMax",
        price: 34.99,
        image: "/ergonomic-mouse.png",
    },
    {
        id: 7,
        name: "Portable SSD",
        seller: "DataStore",
        price: 79.99,
        image: "/portable-ssd.jpg",
    },
    {
        id: 8,
        name: "Webcam HD",
        seller: "WearableTech",
        price: 59.99,
        image: "/classic-webcam.png",
    },
]


export default function Catalog() {

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [showSuccess, setShowSuccess] = useState(false)

    const filteredProducts = products.filter((product) => {
        const query = searchQuery.toLowerCase()
        return product.name.toLowerCase().includes(query) || product.seller.toLowerCase().includes(query)
    })

    const handleCardClick = (product) => {
        setSelectedProduct(product)
        setQuantity(1)
    }

    const handleCloseModal = () => {
        setSelectedProduct(null)
        setQuantity(1)
    }

    const handleQuantityDecrease = () => {
        setQuantity((prev) => Math.max(1, prev - 1))
    }

    const handleQuantityIncrease = () => {
        setQuantity((prev) => prev + 1)
    }

    const handleAddToCart = () => {
        // Here you would typically add the item to cart state/context
        const existing = JSON.parse(localStorage.getItem("cart")) || [];
        const found = existing.find((item) => item.id === selected.id);

        if (found) {
            found.quantity += quantity;
        } else {
            existing.push({ ...selectedProduct, quantity });
        }

        localStorage.setItem("cart", JSON.stringify(existing));
        console.log(`Added ${quantity}x ${selectedProduct.name} to cart`)

        handleCloseModal()
        setShowSuccess(true)

        // Hide success message after 2.5 seconds
        setTimeout(() => {
            setShowSuccess(false)
        }, 2500)
    }

    return (
        <>
            <Header mode="buyer" />

            <div className="page">
                <div className="page-inner">

                    <div className="search-container">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search by product or seller name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                    <h1 className="cat-title">All Products</h1>

                    <div className="cat-products-grid">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="cat-product-card" onClick={() => handleCardClick(product)}>
                                <img src={product.image || "/placeholder.svg"} alt={product.name} className="cat-product-image" />
                                <div className="cat-product-info">
                                    <h3 className="cat-product-name">{product.name}</h3>
                                    <p className="cat-product-seller">{product.seller}</p>
                                    <p className="cat-product-price">${product.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="no-results">
                            <p>No products found matching your search.</p>
                        </div>
                    )}
                </div>

                {selectedProduct && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="cat-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={24} />
                            </button>

                            <img src={selectedProduct.image || "/placeholder.svg"} alt={selectedProduct.name} className="cat-modal-image" />

                            <div className="modal-info">
                                <h2 className="modal-product-name">{selectedProduct.name}</h2>
                                <p className="modal-seller">{selectedProduct.seller}</p>
                                <p className="modal-price">${selectedProduct.price.toFixed(2)}</p>

                                <div className="quantity-section">
                                    <label className="quantity-label">Quantity:</label>
                                    <div className="quantity-controls">
                                        <button className="quantity-btn" onClick={handleQuantityDecrease}>
                                            <Minus size={16} />
                                        </button>
                                        <span className="quantity-display">{quantity}</span>
                                        <button className="quantity-btn" onClick={handleQuantityIncrease}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Notification */}
                {showSuccess && <div className="success-notification">Successfully Added to Cart!</div>}


            </div>


        </>
    )
}