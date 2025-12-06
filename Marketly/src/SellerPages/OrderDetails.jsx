import Header from "../components/Header";
import "./orders.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function OrdersDetails({ mode = "seller" }) {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [currentStatus, setCurrentStatus] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);


    useEffect(() => {
        async function fetchDetails() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // sellers
            if (mode === "seller") {
                // Get this seller's suborder
                const { data: sub } = await supabase
                    .from("Sub_order")
                    .select("sub_id, order_id, status")
                    .eq("seller_id", user.id)
                    .eq("order_id", orderId)
                    .single();

                if (!sub) {
                    navigate("/seller/orders"); return;
                }

                // Get main order info
                const { data: order } = await supabase
                    .from("Order")
                    .select("order_num, cust_id, createdOn")
                    .eq("order_num", sub.order_id)
                    .single();

                // Get customer name
                const { data: cust } = await supabase
                    .from("Users")
                    .select("Fname, Lname")
                    .eq("uid", order.cust_id)
                    .single();

                // get items for THIS seller only
                const { data: items } = await supabase
                    .from("Order_item")
                    .select("quantity, product_id")
                    .eq("sub_id", sub.sub_id);

                // get product names
                const detailedItems = [];
                for (const it of items) {
                    const { data: p } = await supabase
                        .from("Products")
                        .select("pname")
                        .eq("pid", it.product_id)
                        .single();

                    detailedItems.push({
                        name: p.pname,
                        qty: it.quantity
                    });
                }

                const payload = {
                    mode: "seller",
                    orderNumber: order.order_num,
                    customerName: `${cust.Fname} ${cust.Lname}`,
                    datePlaced: order.createdOn,
                    products: detailedItems,
                    status: sub.status,
                    subId: sub.sub_id
                };

                setData(payload);
                setCurrentStatus(sub.status);
            }

            //  customers
            else {
                const { data: order } = await supabase
                    .from("Order")
                    .select("order_num, cust_id, createdOn")
                    .eq("order_num", orderId)
                    .single();

                const { data: subs } = await supabase
                    .from("Sub_order")
                    .select("sub_id, seller_id, status")
                    .eq("order_id", orderId);

                const sellerBlocks = [];

                for (const s of subs) {
                    // Get seller name
                    const { data: seller } = await supabase
                        .from("Users")
                        .select("Fname, Lname")
                        .eq("uid", s.seller_id)
                        .single();

                    // Get items for this seller
                    const { data: items } = await supabase
                        .from("Order_item")
                        .select("product_id, quantity")
                        .eq("sub_id", s.sub_id);

                    const detailedItems = [];

                    for (const it of items) {
                        const { data: p } = await supabase
                            .from("Products")
                            .select("pname")
                            .eq("pid", it.product_id)
                            .single();

                        detailedItems.push({
                            name: p.pname,
                            qty: it.quantity
                        });
                    }

                    sellerBlocks.push({
                        subId: s.sub_id,
                        sellerName: `${seller.Fname} ${seller.Lname}`,
                        status: s.status,
                        products: detailedItems
                    });
                }

                const payload = {
                    mode: "customer",
                    orderNumber: order.order_num,
                    datePlaced: order.createdOn,
                    sellers: sellerBlocks
                };

                setData(payload);
            }
        }

        fetchDetails();
    }, [orderId, mode]);

    // status change
    useEffect(() => {
        if (data && mode === "seller") {
            setHasChanges(currentStatus !== data.status);
        }
    }, [currentStatus, data, mode]);

    if (!data) return <p>Loading...</p>;

    // save status
    async function handleSaveChanges() {
        await supabase
            .from("Sub_order")
            .update({ status: currentStatus })
            .eq("sub_id", data.subId);

        alert("Status updated!");
        setHasChanges(false);
    }

    return (
        <>
            <Header mode={mode} />

            <div className="page">
                <div className="page-inner">

                    <Link to={mode === "seller" ? "/seller/orders" : "/customer/orders"} className="back-button">
                        <ArrowLeft size={20} />
                        Back
                    </Link>

                    <h1 className="page-title">Order Information</h1>

                    <div className="details-card">
                        {/* SHARED */}
                        <div className="detail-row">
                            <span className="detail-label">Order Number</span>
                            <span className="detail-value">{data.orderNumber}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Date Placed</span>
                            <span className="detail-value">{data.datePlaced}</span>
                        </div>

                        {/* SELLER MODE */}
                        {mode === "seller" && (
                            <>
                                <div className="detail-row">
                                    <span className="detail-label">Customer Name</span>
                                    <span className="detail-value">{data.customerName}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">Status</span>
                                    <select
                                        value={currentStatus}
                                        onChange={(e) => setCurrentStatus(e.target.value)}
                                        className="status-dropdown"
                                    >
                                        <option value="Placed">Placed</option>
                                        <option value="Packing">Packing</option>
                                        <option value="Pending Shipment">Pending Shipment</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>

                                <h2 className="section-title">Products (Your Portion)</h2>
                                <div className="products-list">
                                    {data.products.map((p, idx) => (
                                        <div key={idx} className="product-item">
                                            <p className="product-name">{p.name}</p>
                                            <p className="product-quantity">Qty: {p.qty}</p>
                                        </div>
                                    ))}
                                </div>

                                {hasChanges && (
                                    <div className="action-buttons">
                                        <button onClick={handleSaveChanges} className="btn btn-save">
                                            Save Changes
                                        </button>
                                        <button onClick={() => setCurrentStatus(data.status)} className="btn btn-cancel">
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* CUSTOMER MODE */}
                        {mode === "customer" && (
                            <>
                                <h2 className="section-title">Seller Breakdown</h2>
                                {data.sellers.map((s, idx) => (
                                    <div key={idx} className="seller-block">
                                        <h3 className="seller-name">{s.sellerName}</h3>
                                        <p className="seller-status">Status: {s.status}</p>

                                        {s.products.map((p, j) => (
                                            <div key={j} className="product-item">
                                                <p className="product-name">{p.name}</p>
                                                <p className="product-quantity">Qty: {p.qty}</p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
