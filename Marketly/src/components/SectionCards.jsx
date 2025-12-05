import React from "react";
import { AlertCircle } from "lucide-react"

export default function SectionCards({ title, items, type, mode = "seller" }) {
    return (
        <section className="section">
            <h2 className="section-title">{title}</h2>

            <div className="cards-row">
                {items.map((item, i) => (
                    <div className="card" key={i}>

                        {/* Product Alerts Image */}
                        {type === "product" && (
                            <>
                                <div className="product-img"></div>

                                <div>
                                    <div className="card-label">
                                        Product Name:
                                    </div>
                                    <div className="card-value">
                                        {item.name}
                                    </div>
                                </div>

                                <div>
                                    <div className="card-label"> Quantity: </div>
                                    <div className="card-value">{item.qty}</div>
                                </div>

                                {mode === "buyer" && item.qty == 0 && (
                                    <div className="stock-alert">
                                        <AlertCircle size={16} /> Out of Stock
                                    </div>
                                )}

                                {/* If seller: qty === 0 means out of inventory */}
                                {mode === "seller" && item.qty === 0 && (
                                    <div className="stock-alert">
                                        <AlertCircle size={16} /> Out of Stock
                                    </div>
                                )}

                                {/* {item.qty === 0 && (
                                    <div className="stock-alert">
                                        <AlertCircle size={16} /> Out of Stock
                                    </div>
                                )} */}

                            </>
                        )}

                        {/* Pending Orders */}
                        {type === "orders" && (
                            <>
                                <div>
                                    <div className="card-label">
                                        {/* Customer Name */}
                                        {mode === "seller" ? "Customer Name" : "Seller Name"}
                                    </div>

                                    <div className="card-value">
                                        {/* {item.customerName} */}
                                        {mode === "seller"
                                            ? item.customerName
                                            : item.sellerName}
                                    </div>

                                </div>

                                <div>
                                    <div className="card-label">
                                        Order Number
                                    </div>

                                    <div className="card-value">
                                        {item.orderNum}
                                    </div>

                                </div>

                                <div>
                                    <div className="card-label">
                                        Order Status
                                    </div>

                                    <div className="card-value">
                                        <span className={`status-badge status-${item.status.toLowerCase().replace(" ", "-")}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                </div>

                                <div>
                                    <div className="card-label">
                                        Date Placed
                                    </div>

                                    <div className="card-value">
                                        {item.datePlaced}
                                    </div>

                                </div>

                            </>
                        )}

                        {/* Shipments */}
                        {type === "shipments" && (
                            <>
                                <div>
                                    <div className="card-label">
                                        Order Number:
                                    </div>

                                    <div className="card-value">
                                        {item.orderNum}
                                    </div>
                                </div>

                                <div>
                                    <div className="card-label">
                                        Tracking Number:
                                    </div>

                                    <div className="card-value">
                                        {item.trackingNum}
                                    </div>
                                </div>

                                <div>
                                    <div className="card-label">
                                        Estimated Delivery Date:
                                    </div>

                                    <div className="card-value">
                                        {item.eta}
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                ))}

                <button className="more-btn">...more</button>
            </div>
        </section>
    );
}
