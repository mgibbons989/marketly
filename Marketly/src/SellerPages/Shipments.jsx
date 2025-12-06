"use client"
import Header from "../components/Header";
import React, { useState, useEffect } from "react"
import { Search, Plus, X } from "lucide-react"
import "./shipments.css"
import ShipmentCard from "./ShipmentCard";

const initialShipments = [
    {
        id: 1,
        customerName: "John Doe",
        orderNumber: "ORD-2024-001",
        carrier: "FedEx",
        trackingNumber: "1234567890",
        status: "Shipped",
        address: "123 Main St, New York, NY 10001",
    },
    {
        id: 2,
        customerName: "Jane Smith",
        orderNumber: "ORD-2024-002",
        carrier: "UPS",
        trackingNumber: "0987654321",
        status: "Pending",
        address: "456 Oak Ave, Los Angeles, CA 90001",
    },
    {
        id: 3,
        customerName: "Bob Johnson",
        orderNumber: "ORD-2024-003",
        carrier: "USPS",
        trackingNumber: "5551234567",
        status: "Delivered",
        address: "789 Pine Rd, Chicago, IL 60601",
    },
]
const availableOrders = [
    {
        orderNumber: "ORD-2024-004",
        customerName: "Alice Williams",
        address: "321 Elm St, Houston, TX 77001",
    },
    {
        orderNumber: "ORD-2024-005",
        customerName: "Charlie Brown",
        address: "654 Maple Dr, Phoenix, AZ 85001",
    },
    {
        orderNumber: "ORD-2024-006",
        customerName: "Diana Prince",
        address: "987 Cedar Ln, Philadelphia, PA 19101",
    },
    {
        orderNumber: "ORD-2024-007",
        customerName: "Ethan Hunt",
        address: "147 Birch Ct, San Antonio, TX 78201",
    },
]

export default function Shipments({ mode = "seller" }) {
    const [shipments, setShipments] = useState(initialShipments)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState("All")
    const [selectedShipment, setSelectedShipment] = useState(null)
    const [editedShipment, setEditedShipment] = useState(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newShipment, setNewShipment] = useState({
        orderNumber: "",
        carrier: "",
        trackingNumber: "",
        status: "Pending",
    })

    const filteredShipments = shipments.filter((shipment) => {
        const matchesSearch =
            shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter =
            filterStatus === "All" ||
            (filterStatus === "In Progress" && (shipment.status === "Pending" || shipment.status === "Shipped")) ||
            (filterStatus === "Completed" && shipment.status === "Delivered")

        return matchesSearch && matchesFilter
    })

    // Open edit modal
    const handleExpandEdit = (shipment) => {
        setSelectedShipment(shipment)
        setEditedShipment({ ...shipment })
        setHasUnsavedChanges(false)
    }

    // Handle field changes
    const handleFieldChange = (field, value) => {
        setEditedShipment((prev) => ({ ...prev, [field]: value }))
        setHasUnsavedChanges(true)
    }

    // Save changes
    const handleSaveChanges = () => {
        setShipments((prev) => prev.map((s) => (s.id === editedShipment.id ? editedShipment : s)))
        setSelectedShipment(null)
        setEditedShipment(null)
        setHasUnsavedChanges(false)
    }

    // Cancel changes
    const handleCancel = () => {
        setSelectedShipment(null)
        setEditedShipment(null)
        setHasUnsavedChanges(false)
        setShowUnsavedWarning(false)
    }

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target.classList.contains("modal-overlay")) {
            if (hasUnsavedChanges) {
                setShowUnsavedWarning(true)
            } else {
                handleCancel()
            }
        }
    }
    const handleAddShipment = () => {
        setShowAddModal(true)
        setNewShipment({
            orderNumber: "",
            carrier: "",
            trackingNumber: "",
            status: "Pending",
        })
        setHasUnsavedChanges(false)
    }

    const handleNewShipmentChange = (field, value) => {
        setNewShipment((prev) => ({ ...prev, [field]: value }))
        setHasUnsavedChanges(true)
    }

    const handleSaveNewShipment = () => {
        if (!newShipment.orderNumber || !newShipment.carrier || !newShipment.trackingNumber) {
            alert("Please fill in all required fields")
            return
        }

        const selectedOrder = availableOrders.find((order) => order.orderNumber === newShipment.orderNumber)

        const shipmentToAdd = {
            id: Math.max(...shipments.map((s) => s.id)) + 1,
            customerName: selectedOrder.customerName,
            orderNumber: newShipment.orderNumber,
            carrier: newShipment.carrier,
            trackingNumber: newShipment.trackingNumber,
            status: newShipment.status,
            address: selectedOrder.address,
        }

        setShipments((prev) => [...prev, shipmentToAdd])
        setShowAddModal(false)
        setHasUnsavedChanges(false)
    }

    const handleCancelAdd = () => {
        setShowAddModal(false)
        setHasUnsavedChanges(false)
        setShowUnsavedWarning(false)
    }

    const handleAddModalBackdropClick = (e) => {
        if (e.target.classList.contains("modal-overlay")) {
            if (hasUnsavedChanges) {
                setShowUnsavedWarning(true)
            } else {
                handleCancelAdd()
            }
        }
    }

    return (
        <>
            <Header mode={mode} />
            <div className="page">
                <div className="page-inner">
                    {/* Search Bar */}
                    <div className="search-container">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search Customer Name or Order #"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* Header with Title and Actions */}
                    <div className="header-row">
                        <h1 className="title">Shipments</h1>
                        <div className="actions">
                            {mode === "seller" && (<button className="add-button" onClick={handleAddShipment}>
                                <Plus size={20} />
                                Add Shipment
                            </button>)}

                            <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option>All</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Shipment Cards */}
                    <div className="cards-grid">
                        {filteredShipments.map((shipment) => (
                            <ShipmentCard key={shipment.id} shipment={shipment} onOpen={() => handleExpandEdit(shipment)} mode={mode} />
                        ))}
                    </div>

                    {showAddModal && mode === "seller" && (
                        <div className="modal-overlay" onClick={handleAddModalBackdropClick}>
                            <div className="ship-modal">
                                <div className="ship-modal-header">
                                    <h2>Add New Shipment</h2>
                                    <button
                                        className="close-button"
                                        onClick={() => {
                                            if (hasUnsavedChanges) {
                                                setShowUnsavedWarning(true)
                                            } else {
                                                handleCancelAdd()
                                            }
                                        }}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="ship-modal-content">
                                    <div className="modal-field">
                                        <label>Select Order Number *</label>
                                        <select
                                            value={newShipment.orderNumber}
                                            onChange={(e) => handleNewShipmentChange("orderNumber", e.target.value)}
                                            className="editable-input"
                                        >
                                            <option value="">-- Select an order --</option>
                                            {availableOrders.map((order) => (
                                                <option key={order.orderNumber} value={order.orderNumber}>
                                                    {order.orderNumber} - {order.customerName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {newShipment.orderNumber && (
                                        <div className="modal-field">
                                            <label>Customer Address</label>
                                            <input
                                                type="text"
                                                value={availableOrders.find((o) => o.orderNumber === newShipment.orderNumber)?.address || ""}
                                                readOnly
                                                className="readonly-input"
                                            />
                                        </div>
                                    )}

                                    <div className="modal-field">
                                        <label>Carrier *</label>
                                        <input
                                            type="text"
                                            value={newShipment.carrier}
                                            onChange={(e) => handleNewShipmentChange("carrier", e.target.value)}
                                            className="editable-input"
                                            placeholder="e.g., FedEx, UPS, USPS"
                                            required
                                        />
                                    </div>

                                    <div className="modal-field">
                                        <label>Tracking Number *</label>
                                        <input
                                            type="text"
                                            value={newShipment.trackingNumber}
                                            onChange={(e) => handleNewShipmentChange("trackingNumber", e.target.value)}
                                            className="editable-input"
                                            placeholder="Enter tracking number"
                                            required
                                        />
                                    </div>

                                    <div className="modal-field">
                                        <label>Status *</label>
                                        <select
                                            value={newShipment.status}
                                            onChange={(e) => handleNewShipmentChange("status", e.target.value)}
                                            className="editable-input"
                                        >
                                            <option>Pending</option>
                                            <option>Shipped</option>
                                            <option>Delivered</option>
                                        </select>
                                    </div>
                                </div>

                                {showUnsavedWarning && (
                                    <div className="warning-banner">
                                        <p>You have unsaved changes. Please save or cancel your changes.</p>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button className="cancel-button" onClick={handleCancelAdd}>
                                        Cancel
                                    </button>
                                    <button className="save-button" onClick={handleSaveNewShipment}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {selectedShipment && mode === "seller" && (
                        <div className="modal-overlay" onClick={handleBackdropClick}>
                            <div className="ship-modal">
                                <div className="ship-modal-header">
                                    <h2>Edit Shipment</h2>
                                    <button
                                        className="close-button"
                                        onClick={() => {
                                            if (hasUnsavedChanges) {
                                                setShowUnsavedWarning(true)
                                            } else {
                                                handleCancel()
                                            }
                                        }}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="ship-modal-content">
                                    {/* Read-only fields */}
                                    <div className="modal-field">
                                        <label>Customer Name</label>
                                        <input type="text" value={editedShipment.customerName} readOnly className="readonly-input" />
                                    </div>

                                    <div className="modal-field">
                                        <label>Order Number</label>
                                        <input type="text" value={editedShipment.orderNumber} readOnly className="readonly-input" />
                                    </div>

                                    <div className="modal-field">
                                        <label>Customer Address</label>
                                        <input type="text" value={editedShipment.address} readOnly className="readonly-input" />
                                    </div>

                                    {/* Editable fields */}
                                    <div className="modal-field">
                                        <label>Carrier</label>
                                        <input
                                            type="text"
                                            value={editedShipment.carrier}
                                            onChange={(e) => handleFieldChange("carrier", e.target.value)}
                                            className="editable-input"
                                        />
                                    </div>

                                    <div className="modal-field">
                                        <label>Tracking Number</label>
                                        <input
                                            type="text"
                                            value={editedShipment.trackingNumber}
                                            onChange={(e) => handleFieldChange("trackingNumber", e.target.value)}
                                            className="editable-input"
                                        />
                                    </div>

                                    <div className="modal-field">
                                        <label>Status</label>
                                        <select
                                            value={editedShipment.status}
                                            onChange={(e) => handleFieldChange("status", e.target.value)}
                                            className="editable-input"
                                        >
                                            <option>Pending</option>
                                            <option>Shipped</option>
                                            <option>Delivered</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Unsaved Changes Warning */}
                                {showUnsavedWarning && (
                                    <div className="warning-banner">
                                        <p>You have unsaved changes. Please save or cancel your changes.</p>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button className="cancel-button" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                    <button className="save-button" onClick={handleSaveChanges}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedShipment && mode === "buyer" && (
                        <div className="modal-overlay" onClick={handleBackdropClick}>
                            <div className="ship-modal">
                                <div className="ship-modal-header">
                                    <h2>Shipment Details</h2>
                                    <button className="close-button" onClick={handleCancel}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="ship-modal-content">
                                    <div className="modal-field">
                                        <label>Carrier</label>
                                        <input type="text" value={selectedShipment.carrier} readOnly className="readonly-input" />
                                    </div>

                                    <div className="modal-field">
                                        <label>Tracking Number</label>
                                        <input type="text" value={selectedShipment.trackingNumber} readOnly className="readonly-input" />
                                    </div>

                                    <div className="modal-field">
                                        <label>Status</label>
                                        <input type="text" value={selectedShipment.status} readOnly className="readonly-input" />
                                    </div>

                                    <div className="modal-field">
                                        <label>Shipping Address</label>
                                        <input type="text" value={selectedShipment.address} readOnly className="readonly-input" />
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button className="cancel-button" onClick={handleCancel}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}