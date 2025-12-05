import Header from "../components/Header";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([])
    const [paymentOpen, setPaymentOpen] = useState(false)
    const [addressOpen, setAddressOpen] = useState(false)

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: "",
        expDate: "",
        cv: "",
        zipCode: "",
    })

    const [address, setAddress] = useState("")
    const [errors, setErrors] = useState({})


    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("cartProducts")
            if (saved) {
                const allProducts = JSON.parse(saved)
                setProducts(allProducts.filter((p) => p.checked))
            }
        }
    }, [])
    const handleBackToCart = () => {
        navigate("/customer/cart")
    }

    const validateForm = () => {
        const newErrors = {}

        // Card Number validation (16 digits)
        if (!/^\d{16}$/.test(paymentInfo.cardNumber)) {
            newErrors.cardNumber = "Card number must be 16 digits"
        }

        // Expiration Date validation (MMYYYY, 6 digits, future date)
        if (!/^\d{6}$/.test(paymentInfo.expDate)) {
            newErrors.expDate = "Expiration date must be 6 digits (MMYYYY)"
        } else {
            const month = Number.parseInt(paymentInfo.expDate.substring(0, 2))
            const year = Number.parseInt(paymentInfo.expDate.substring(2, 6))
            const currentDate = new Date()
            const currentYear = currentDate.getFullYear()
            const currentMonth = currentDate.getMonth() + 1

            if (month < 1 || month > 12) {
                newErrors.expDate = "Invalid month"
            } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                newErrors.expDate = "Card has expired"
            }
        }

        // CV validation (3 digits)
        if (!/^\d{3}$/.test(paymentInfo.cv)) {
            newErrors.cv = "CV must be 3 digits"
        }

        // Zip Code validation (5 digits)
        if (!/^\d{5}$/.test(paymentInfo.zipCode)) {
            newErrors.zipCode = "Zip code must be 5 digits"
        }

        // Address validation
        if (!address.trim()) {
            newErrors.address = "Address is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handlePlaceOrder = () => {
        if (validateForm()) {
            alert("Order placed successfully!")
            if (typeof window !== "undefined") {
                sessionStorage.removeItem("cartProducts")
            }
            navigate("/dashboard/customer")
        }
    }

    const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
    const tax = subtotal * 0.08
    const total = subtotal + tax


    return (
        <>
            <Header mode="buyer" />
            <div className="page">

                <div className="page-inner">

                    <button className="back-to-cart-button" onClick={handleBackToCart}>
                        ← Back to Cart
                    </button>

                    <h1 className="page-title">Checkout</h1>

                    <h2 className="section-title">Product List</h2>
                    <div className="products-container">
                        {products.map((product) => (
                            <div key={product.id} className="product-card">
                                {/* <input type="checkbox" className="checkout-product-checkbox" checked={true} disabled /> */}

                                <img src={product.image || "/placeholder.svg"} alt={product.name} className="product-image" />

                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-seller">{product.seller}</p>
                                </div>

                                <div className="quantity-display-static">Qty: {product.quantity}</div>

                                <div className="product-price">${(product.price * product.quantity).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="dropdown-section">
                        <div className="dropdown-header" onClick={() => setPaymentOpen(!paymentOpen)}>
                            <span>Payment Information</span>
                            <span className="dropdown-arrow">{paymentOpen ? "▼" : "►"}</span>
                        </div>
                        {paymentOpen && (
                            <div className="dropdown-content">
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input
                                        type="text"
                                        value={paymentInfo.cardNumber}
                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                                        placeholder="1234567812345678"
                                        maxLength="16"
                                    />
                                    {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Exp Date (MMYYYY)</label>
                                    <input
                                        type="text"
                                        value={paymentInfo.expDate}
                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expDate: e.target.value })}
                                        placeholder="122025"
                                        maxLength="6"
                                    />
                                    {errors.expDate && <span className="error">{errors.expDate}</span>}
                                </div>

                                <div className="form-group">
                                    <label>CV (3 digits on the back of card)</label>
                                    <input
                                        type="text"
                                        value={paymentInfo.cv}
                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cv: e.target.value })}
                                        placeholder="123"
                                        maxLength="3"
                                    />
                                    {errors.cv && <span className="error">{errors.cv}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Billing Zip Code</label>
                                    <input
                                        type="text"
                                        value={paymentInfo.zipCode}
                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, zipCode: e.target.value })}
                                        placeholder="12345"
                                        maxLength="5"
                                    />
                                    {errors.zipCode && <span className="error">{errors.zipCode}</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="dropdown-section">
                        <div className="dropdown-header" onClick={() => setAddressOpen(!addressOpen)}>
                            <span>Address</span>
                            <span className="dropdown-arrow">{addressOpen ? "▼" : "►"}</span>
                        </div>
                        {addressOpen && (
                            <div className="dropdown-content">
                                <div className="form-group">
                                    <label>Full Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="123 Main St, City, State 12345"
                                    />
                                    {errors.address && <span className="error">{errors.address}</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="order-summary">
                        <div className="summary-row">
                            <span className="summary-label">Subtotal:</span>
                            <span className="summary-value">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Tax (8%):</span>
                            <span className="summary-value">${tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span className="summary-label">Total:</span>
                            <span className="summary-value">${total.toFixed(2)}</span>
                        </div>
                        <button className="place-order-button" onClick={handlePlaceOrder}>
                            Place Order
                        </button>
                    </div>


                </div>

            </div>

        </>
    )
}