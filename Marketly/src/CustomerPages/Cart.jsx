import Header from "../components/Header";
import { useState, useEffect } from "react"
import "./cart.css"
import { useNavigate, Navigate } from "react-router-dom";

const initialProducts = [
    {
        id: 1,
        name: "Wireless Headphones",
        seller: "AudioTech Co.",
        price: 79.99,
        quantity: 1,
        image: "/wireless-headphones.png",
        checked: false,
    },
    {
        id: 2,
        name: "Smart Watch",
        seller: "TechWear Inc.",
        price: 199.99,
        quantity: 1,
        image: "/smartwatch-lifestyle.png",
        checked: false,
    },
    {
        id: 3,
        name: "Laptop Stand",
        seller: "Office Essentials",
        price: 34.99,
        quantity: 2,
        image: "/laptop-stand.png",
        checked: false,
    },
]

export default function Cart() {
    const navigate = useNavigate();

    const [products, setProducts] = useState(() => {
        if (typeof window === "undefined") return initialProducts;

        const saved = sessionStorage.getItem("cartProducts");
        return saved ? JSON.parse(saved) : initialProducts;
    });

    const handleBack = () => {
        navigate(-1)
    }

    const handleCheckbox = (id) => {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, checked: !p.checked } : p
            )
        );
    };
    const handleQuantityChange = (id, delta) => {
        setProducts(products.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p)))
    }

    const handleRemove = (id) => {
        setProducts((prev) => {
            const updated = prev.filter((p) => p.id !== id);

            // Also remove from storage if this item was saved from checkout
            const stored = sessionStorage.getItem("cartProducts");
            if (stored) {
                const storedList = JSON.parse(stored).filter((p) => p.id !== id);
                sessionStorage.setItem("cartProducts", JSON.stringify(storedList));
            }

            return updated;
        });
    };

    const checkedProducts = products.filter((p) => p.checked)
    const itemCount = checkedProducts.length
    const subtotal = checkedProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
    )
    const handleCheckout = () => {
        const checkedProducts = products.filter(p => p.checked);

        if (checkedProducts.length === 0) {
            alert("Please select at least one item to checkout");
            return;
        }

        const confirmCheckout = window.confirm("Are you sure you want to check out now?");
        if (!confirmCheckout) return;

        // Save only checked items to sessionStorage
        sessionStorage.setItem("cartProducts", JSON.stringify(checkedProducts));

        navigate("/customer/checkout");
    };

    return (
        <>
            <Header mode="buyer" />
            <div className="page">
                <div className="page-inner">
                    <button className="back-button" onClick={handleBack}>
                        ← Back
                    </button>

                    <h1 className="page-title">Cart</h1>

                    <div className="cart-products-container">
                        {products.map((product) => (
                            <div key={product.id} className="cart-product-card">
                                <input
                                    type="checkbox"
                                    className="cart-product-checkbox"
                                    checked={product.checked}
                                    onChange={() => handleCheckbox(product.id)}
                                />

                                <img src={product.image || "/placeholder.svg"} alt={product.name} className="cart-product-image" />

                                <div className="cart-product-info">
                                    <h3 className="cart-product-name">{product.name}</h3>
                                    <p className="cart-product-seller">{product.seller}</p>
                                </div>

                                <div className="quantity-controls">
                                    <button className="quantity-btn" onClick={() => handleQuantityChange(product.id, -1)}>
                                        -
                                    </button>
                                    <span className="quantity-display">{product.quantity}</span>
                                    <button className="quantity-btn" onClick={() => handleQuantityChange(product.id, 1)}>
                                        +
                                    </button>
                                </div>

                                <div className="product-price">${(product.price * product.quantity).toFixed(2)}</div>

                                <button className="remove-button" onClick={() => handleRemove(product.id)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                        <div className="cart-summary">
                            <div className="summary-row">
                                <span className="summary-label">Items Selected:</span>
                                <span className="summary-value">{itemCount}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Subtotal:</span>
                                <span className="summary-value">${subtotal.toFixed(2)}</span>
                            </div>
                            <button className="checkout-button" onClick={handleCheckout}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>

                </div>
            </div >

        </>
    )
}