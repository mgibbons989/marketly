import React from "react";
import { Link } from "react-router-dom";

export default function OrderCard({ order, mode = "seller" }) {
    console.log(order.orderNumber)
    const nameLabel = mode === "seller" ? "Customer Name" : "Seller Name";
    const nameValue = mode === "seller" ? order.customerName : order.sellerName;

    const detailLink =
        mode === "seller"
            ? `/seller/orders/${order.orderNumber}`
            : `/customer/orders/${order.orderNumber}`;

    return (
        <div key={order.id} className="order-card">

            <div className="order-info">
                <p className="order-label">{nameLabel}</p>
                <p className="order-value">{nameValue}</p>
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

            <Link to={detailLink} className="open-link">
                Click to open →
            </Link>

        </div>
    );
}
