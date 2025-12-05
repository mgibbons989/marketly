import React from "react";
import { Link } from "react-router-dom";

export default function OrderCard({ order }) {
    return (
        <div key={order.id} className="order-card">
            <div className="order-info">
                <p className="order-label">Customer Name</p>
                <p className="order-value">{order.customerName}</p>
            </div>
            <div className="order-info">
                <p className="order-label">Order Number</p>
                <p className="order-value">{order.orderNumber}</p>
            </div>
            <div className="order-info">
                <p className="order-label">Date Placed</p>
                <p className="order-value">{order.datePlaced}</p>
            </div>
            <div className="order-info">
                <p className="order-label">Status</p>
                <p className={`order-value status-bdg status-${order.status.toLowerCase().replace(" ", "-")}`}>{order.status}</p>
            </div>
            {order.status === "Completed" && order.dateCompleted && (
                <div className="order-info">
                    <p className="order-label">Date Completed</p>
                    <p className="order-value">{order.dateCompleted}</p>
                </div>
            )}
            <Link to={`/seller/order/${order.id}`} className="open-link">
                Click to open →
            </Link>
        </div>
    );
}
