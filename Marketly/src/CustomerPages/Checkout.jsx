import Header from "../components/Header";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./css/checkout.css"

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

    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const saved = sessionStorage.getItem("checkoutItems");
        if (saved) {
            setProducts(JSON.parse(saved));
            // console.log(products)
            // console.log(saved)
        }
    }, [])

    const handleBackToCart = () => navigate("/customer/cart");

    const validateForm = () => {
        const newErrors = {}

        // Card Number validation (16 digits)
        if (!/^\d{16}$/.test(paymentInfo.cardNumber)) {
            newErrors.cardNumber = "Card number must be 16 digits"
        }

        // Expiration Date validation
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

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;
        setProcessing(true);

        // get logged in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("You must be logged in");
            setProcessing(false);
            return;
        }

        // create Order row
        const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        const { data: newOrder, error: orderErr } = await supabase
            .from("Order")
            .insert([
                {
                    cust_id: user.id,
                    total,
                    status: "Placed",
                    createdOn: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (orderErr) {
            console.error(orderErr);
            alert("Failed to create order.");
            setProcessing(false);
            return;
        }

        const orderId = newOrder.order_num;

        // group products by seller
        const bySeller = {};
        products.forEach((p) => {
            if (!bySeller[p.seller_id]) bySeller[p.seller_id] = [];
            bySeller[p.seller_id].push(p);
        });

        const { error: addressErr } = await supabase
            .from("Customer")
            .update({ address })
            .eq("uid", user.id);

        if (addressErr) {
            console.error(addressErr);
            alert("Failed to save your address.");
            setProcessing(false);
            return;
        }
        // create sub_orders and Order_items
        for (const sellerId of Object.keys(bySeller)) {
            const { data: subOrder, error: subErr } = await supabase
                .from("sub_order")
                .insert([
                    {
                        seller_id: sellerId,
                        order_id: orderId,
                        status: "Placed",
                    },
                ])
                .select()
                .single();

            if (subErr) {
                console.error(subErr);
                alert("Error creating sub-order.");
                setProcessing(false);
                return;
            }

            const subId = subOrder.id;

            // insert items for this seller
            const itemsToInsert = bySeller[sellerId].map((p) => ({
                sub_id: subId,
                product_id: p.product_id,
                quantity: p.quantity,
            }));

            const { error: itemErr } = await supabase
                .from("Order_item")
                .insert(itemsToInsert);

            if (itemErr) {
                console.error(itemErr);
                alert("Error inserting order items.");
                setProcessing(false);
                return;
            }
        }

        for (const p of products) {
            await supabase.from("cart_item").delete().eq("id", p.id);
        }

        // clear session storage
        sessionStorage.removeItem("checkoutItems");

        alert("Order placed successfully!");
        setProcessing(false);
        navigate("/dashboard/customer");
    };

    const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <>
            <Header mode="buyer" />
            <div className="page">

                <div className="page-inner">

                    <button className="check-back-to-cart-button" onClick={handleBackToCart}>
                        ← Back to Cart
                    </button>

                    <h1 className="page-title">Checkout</h1>

                    <h2 className="section-title">Product List</h2>
                    <div className="check-products-container">
                        {products.map((product) => (
                            <div key={product.id} className="check-product-card">

                                <img src={product.image || "/placeholder.svg"} alt={product.name} className="check-product-image" />

                                <div className="check-product-info">
                                    <h3 className="check-product-name">{product.name}</h3>
                                    <p className="check-product-seller">{product.seller}</p>
                                </div>

                                <div className="quantity-display-static">Qty: {product.quantity}</div>

                                <div className="check-product-price">${(product.price * product.quantity).toFixed(2)}</div>
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
                                    <label className="check-label">Card Number</label>
                                    <input
                                        className="check-input"
                                        type="text"
                                        value={paymentInfo.cardNumber}
                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                                        placeholder="1234567812345678"
                                        maxLength="16"
                                    />
                                    {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="check-label">Exp Date (MMYYYY)</label>
                                    <input
                                        className="check-input"
                                        type="text"
                                        value={paymentInfo.expDate}
                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expDate: e.target.value })}
                                        placeholder="122025"
                                        maxLength="6"
                                    />
                                    {errors.expDate && <span className="error">{errors.expDate}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="check-label">CV (3 digits on the back of card)</label>
                                    <input
                                        className="check-input"
                                        type="text"
                                        value={paymentInfo.cv}
                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cv: e.target.value })}
                                        placeholder="123"
                                        maxLength="3"
                                    />
                                    {errors.cv && <span className="error">{errors.cv}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="check-label">Billing Zip Code</label>
                                    <input
                                        className="check-input"
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
                                    <label className="check-label">Full Address</label>
                                    <input
                                        className="check-input"
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

                    <div className="check-order-summary">
                        <div className="check-summary-row">
                            <span className="check-summary-label">Subtotal:</span>
                            <span className="check-summary-value">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="check-summary-row">
                            <span className="check-summary-label">Tax (8%):</span>
                            <span className="check-summary-value">${tax.toFixed(2)}</span>
                        </div>
                        <div className="check-summary-row total">
                            <span className="check-summary-label">Total:</span>
                            <span className="check-summary-value">${total.toFixed(2)}</span>
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