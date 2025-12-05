import Header from "../components/Header";
import "./orders.css"

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { orders } from "./orders";

import { ArrowLeft } from "lucide-react";


export default function OrdersDetails() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const order = orders.find((o) => o.id === Number.parseInt(orderId))

    const [currentStatus, setCurrentStatus] = useState(order?.status || "")
    const [hasChanges, setHasChanges] = useState(false)
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

    useEffect(() => {
        if (order) {
            setCurrentStatus(order.status)
        }
    }, [order])

    useEffect(() => {
        setHasChanges(currentStatus !== order?.status)
    }, [currentStatus, order])

    if (!order) {
        return (
            <div className="container">
                <p>Order not found</p>
                <Link to="/">Back to Orders</Link>
            </div>
        )
    }
    const handleStatusChange = (e) => {
        setCurrentStatus(e.target.value)
    }

    const handleSaveChanges = () => {
        // Here you would typically send the changes to your backend
        alert(`Status updated to: ${currentStatus}`)
        order.status = currentStatus
        setHasChanges(false)
    }

    const handleCancelChanges = () => {
        setCurrentStatus(order.status)
        setHasChanges(false)
    }

    const handleBackClick = (e) => {
        if (hasChanges) {
            e.preventDefault()
            setShowUnsavedWarning(true)
        }
    }

    const confirmLeave = () => {
        setHasChanges(false)
        navigate("/")
    }

    const cancelLeave = () => {
        setShowUnsavedWarning(false)
    }

    return (
        <>
            <Header />
            <div className="page">

                <div className="page-inner">

                    <Link to="/seller/orders" className="back-button" onClick={handleBackClick}>
                        <ArrowLeft size={20} />
                        Back
                    </Link>

                    <h1 className="page-title">Order Information</h1>
                    <div className="details-card">
                        <div className="detail-row">
                            <span className="detail-label">Customer Name</span>
                            <span className="detail-value">{order.customerName}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Order Number</span>
                            <span className="detail-value">{order.orderNumber}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Date Placed</span>
                            <span className="detail-value">{order.datePlaced}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Status</span>
                            <select value={currentStatus} onChange={handleStatusChange} className="status-dropdown">
                                <option value="Placed">Placed</option>
                                <option value="Packing">Packing</option>
                                <option value="Pending Shipment">Pending Shipment</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div className="products-section">
                            <h2 className="section-title">Product(s) Ordered</h2>
                            <div className="products-list">
                                {order.products.map((product, index) => (
                                    <div key={index} className="product-item">
                                        <img src={product.img || "/placeholder.svg"} alt={product.name} className="product-image" />
                                        <div className="product-info">
                                            <p className="product-name">{product.name}</p>
                                            <p className="product-quantity">Quantity: {product.qty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {hasChanges && (
                            <div className="action-buttons">
                                <button onClick={handleSaveChanges} className="btn btn-save">
                                    Save Changes
                                </button>
                                <button onClick={handleCancelChanges} className="btn btn-cancel">
                                    Cancel Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {showUnsavedWarning && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3 className="modal-title">Unsaved Changes</h3>
                            <p className="modal-message">You have unsaved changes. Are you sure you want to leave this page?</p>
                            <div className="modal-buttons">
                                <button onClick={confirmLeave} className="btn btn-confirm">
                                    Leave Page
                                </button>
                                <button onClick={cancelLeave} className="btn btn-stay">
                                    Stay on Page
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    )

}