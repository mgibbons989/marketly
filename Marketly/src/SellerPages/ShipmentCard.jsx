import React from "react";


export default function ShipmentCard({ shipment, onOpen, mode = "seller" }) {
    return (
        <>
            <div key={shipment.id} className="shipment-card">
                <div className="card-content">
                    <div className="card-field">
                        <span className="field-label">{mode === "seller" ? "Customer Name:" : "Seller Name:"}</span>
                        <span className="field-value">{shipment.customerName}</span>
                    </div>
                    <div className="card-field">
                        <span className="field-label">Order Number:</span>
                        <span className="field-value">{shipment.orderNumber}</span>
                    </div>
                    <div className="card-field">
                        <span className="field-label">Carrier Name:</span>
                        <span className="field-value">{shipment.carrier}</span>
                    </div>
                    <div className="card-field">
                        <span className="field-label">Tracking Number:</span>
                        <span className="field-value">{shipment.trackingNumber}</span>
                    </div>
                    <div className="card-field">
                        <span className="field-label">Status:</span>
                        <span className={`status-badge status-${shipment.status.toLowerCase()}`}>{shipment.status}</span>
                    </div>
                </div>
                <button className="expand-button" onClick={() => onOpen(shipment)}>
                    {mode === "seller" ? "Click to expand or edit" : "View Shipment Details"}
                </button>
            </div>
        </>
    )
}