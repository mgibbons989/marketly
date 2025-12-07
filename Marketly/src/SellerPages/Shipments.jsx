"use client"
import Header from "../components/Header";
import React, { useState, useEffect } from "react"
import { Search, Plus, X } from "lucide-react"
import "./shipments.css"
import { supabase } from "../supabaseClient";
import ShipmentCard from "./ShipmentCard";

export default function Shipments({ mode = "seller" }) {

    const [availableOrders, setAvailableOrders] = useState([]);
    const [shipments, setShipments] = useState([])
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

    const filteredShipments = shipments.filter((s) => {
        const matchesSearch =
            s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.orderNumber.toString().includes(searchQuery);

        const matchesFilter =
            filterStatus === "All" ||
            (filterStatus === "In Progress" && (s.status === "Pending" || s.status === "Shipped")) ||
            (filterStatus === "Completed" && s.status === "Delivered");

        return matchesSearch && matchesFilter;
    });

    // Open edit modal
    const handleExpandEdit = (shipment) => {
        setSelectedShipment(shipment);
        setEditedShipment({ ...shipment });
        setHasUnsavedChanges(false);
    }

    // Handle input changes
    const handleFieldChange = (field, value) => {
        setEditedShipment((prev) => ({ ...prev, [field]: value }))
        setHasUnsavedChanges(true)
    }

    // Save changes
    const handleSaveChanges = async () => {
        const { error } = await supabase
            .from("Shipment")
            .update({
                carrier: editedShipment.carrier,
                tracking_num: editedShipment.trackingNumber,
                status: editedShipment.status,
            })
            .eq("shipment_id", editedShipment.id);

        if (error) return alert(error.message);

        alert("Shipment updated!");
        window.location.reload();
    };

    // Cancel changes
    const handleCancel = () => {
        setSelectedShipment(null)
        setEditedShipment(null)
        setHasUnsavedChanges(false)
        setShowUnsavedWarning(false)
    };

    // Handle edit backdrop click with handle cancel
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
        setShowAddModal(true);
        setNewShipment({
            orderNumber: "",
            carrier: "",
            trackingNumber: "",
            status: "Pending",
        });
        setHasUnsavedChanges(false);
    };

    const handleNewShipmentChange = (field, value) => {
        setNewShipment((prev) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const handleSaveNewShipment = async () => {
        if (!newShipment.orderNumber || !newShipment.carrier || !newShipment.trackingNumber) {
            alert("Please fill in all required fields");
            return;
        }

        const choice = availableOrders.find(
            (o) => o.orderNumber === newShipment.orderNumber
        );

        if (!choice) {
            alert("Order not valid for shipment.");
            return;
        }

        const { error } = await supabase.from("Shipment").insert({
            sub_id: choice.sub_id,
            carrier: newShipment.carrier,
            tracking_num: newShipment.trackingNumber,
            status: newShipment.status,
            created_on: new Date().toISOString(),
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Shipment created!");
        setShowAddModal(false);
        setHasUnsavedChanges(false);
        window.location.reload();
    };

    const handleCancelAdd = () => {
        setShowAddModal(false);
        setHasUnsavedChanges(false);
        setShowUnsavedWarning(false);
    };
    // handle add modal click with handCancelAdd
    const handleAddModalBackdropClick = (e) => {
        if (e.target.classList.contains("modal-overlay")) {
            if (hasUnsavedChanges) {
                setShowUnsavedWarning(true)
            } else {
                handleCancelAdd()
            }
        }
    }

    useEffect(() => {
        async function loadShipments() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let final = [];

            // seller
            if (mode === "seller") {
                const { data: subs, error: subErr } = await supabase
                    .from("sub_order")
                    .select("id, seller_id, order_id")
                    .eq("seller_id", user.id);

                if (subErr) {
                    console.error("err", subErr);
                    return;
                }
                if (!subs) return;

                // Load shipments for suborders
                for (const sub of subs) {
                    const { data: ship, error: shipErr } = await supabase
                        .from("Shipment")
                        .select("sub_id, shipment_id, carrier, tracking_num, status, created_on")
                        .eq("sub_id", sub.id)
                        .maybeSingle();

                    if (shipErr) {
                        console.error("err", shipErr);
                        return;
                    }

                    if (!ship) continue;

                    const { data: order } = await supabase
                        .from("Order")
                        .select("order_num, cust_id")
                        .eq("order_num", sub.order_id)
                        .single();

                    const { data: cust } = await supabase
                        .from("Users")
                        .select("Fname, Lname")
                        .eq("uid", order.cust_id)
                        .single();

                    const { data: custAddr } = await supabase
                        .from("Customer")
                        .select("address")
                        .eq("uid", order.cust_id)
                        .single();

                    final.push({
                        id: ship.shipment_id,
                        customerName: `${cust.Fname} ${cust.Lname}`,
                        orderNumber: order.order_num,
                        carrier: ship.carrier,
                        trackingNumber: ship.tracking_num,
                        status: ship.status,
                        address: custAddr?.address || "",
                        sub_id: sub.id,
                    });
                }

                // Load orders for new shipment creation
                const openSubs = [];

                for (const sub of subs) {
                    const { data: existing } = await supabase
                        .from("Shipment")
                        .select("sub_id, shipment_id")
                        .eq("sub_id", sub.id)
                        .maybeSingle();

                    if (existing) continue;

                    const { data: ord } = await supabase
                        .from("Order")
                        .select("order_num, cust_id")
                        .eq("order_num", sub.order_id)
                        .single();

                    const { data: cust } = await supabase
                        .from("Users")
                        .select("Fname, Lname")
                        .eq("uid", ord.cust_id)
                        .single();

                    const { data: custAddr } = await supabase
                        .from("Customer")
                        .select("uid, address")
                        .eq("uid", ord.cust_id)
                        .single();
                    console.log(custAddr.address)
                    openSubs.push({
                        sub_id: sub.id,
                        orderNumber: ord.order_num,
                        customerName: `${cust.Fname} ${cust.Lname}`,
                        address: custAddr?.address || "",
                    });
                }

                setAvailableOrders(openSubs);
            }

            // customer
            else {
                const { data: orders } = await supabase
                    .from("Order")
                    .select("order_num")
                    .eq("cust_id", user.id);

                for (const ord of orders) {
                    const { data: subs } = await supabase
                        .from("sub_order")
                        .select("sub_id, seller_id")
                        .eq("order_id", ord.order_num);

                    for (const sub of subs) {
                        const { data: ship } = await supabase
                            .from("Shipment")
                            .select("shipment_id, carrier, tracking_num, status")
                            .eq("sub_id", sub.sub_id)
                            .maybeSingle();

                        if (!ship) continue;

                        const { data: seller } = await supabase
                            .from("Users")
                            .select("Fname, Lname")
                            .eq("uid", sub.seller_id)
                            .single();

                        final.push({
                            id: ship.shipment_id,
                            customerName: `${seller.Fname} ${seller.Lname}`,
                            orderNumber: ord.order_num,
                            carrier: ship.carrier,
                            trackingNumber: ship.tracking_num,
                            status: ship.status,
                            address: "See order details page",
                            sub_id: sub.sub_id,
                        });
                    }
                }
            }

            setShipments(final);
        }

        loadShipments();
    }, [mode]);

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

                    {/* Header */}
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
                    {shipments.length === 0 ? (
                        <div className="emptymessage">No Shipments Found</div>
                    ) : (
                        <div className="cards-grid">
                            {filteredShipments.map((shipment) => (
                                <ShipmentCard key={shipment.id} shipment={shipment} onOpen={() => handleExpandEdit(shipment)} mode={mode} />
                            ))}
                        </div>
                    )}
                    {/* Shipments */}


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
                                            onChange={(e) => handleNewShipmentChange("orderNumber", Number(e.target.value))}
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