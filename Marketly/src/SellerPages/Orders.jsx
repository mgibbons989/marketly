import React, { useState, useMemo, useEffect } from "react";
import Header from "../components/Header";
import "./orders.css";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import OrderCard from "./OrderCard";
import { supabase } from "../supabaseClient";

export default function Orders({ mode = "seller" }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("All");
    const [orders, setOrders] = useState([]);

    const searchField = mode === "seller" ? "customerName" : "sellerName";


    useEffect(() => {
        async function fetchOrders() {

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // ------------ CUSTOMER MODE ------------
            if (mode === "buyer") {
                // Get all orders for this customer
                const { data: orderRows } = await supabase
                    .from("Order")
                    .select("order_num, cust_id, status, createdOn")
                    .eq("cust_id", user.id);

                let formatted = [];

                for (const ord of orderRows) {
                    // Get ALL sellers for this order
                    const { data: subs } = await supabase
                        .from("sub_order")
                        .select("seller_id, status")
                        .eq("order_id", ord.order_num);

                    // For each seller, create an order entry
                    for (const sub of subs) {
                        const { data: seller } = await supabase
                            // .from("Users")
                            // .select("Fname, Lname")
                            // .eq("uid", sub.seller_id)
                            // .single();
                            .from("Seller")
                            .select("business_name")
                            .eq("uid", sub.seller_id)
                            .single()

                        formatted.push({
                            id: ord.id,
                            sellerId: sub.seller_id,
                            sellerName: seller.business_name,
                            orderNumber: ord.order_num,
                            status: sub.status,
                            datePlaced: ord.createdOn
                        });
                    }
                }

                setOrders(formatted);
            }

            // seller mode
            else {
                // Find all suborders belonging to seller
                const { data: subs } = await supabase
                    .from("sub_order")
                    .select("order_id, status")
                    .eq("seller_id", user.id);

                let formatted = [];

                for (const sub of subs) {
                    // Fetch the order info
                    const { data: ord } = await supabase
                        .from("Order")
                        .select("order_num, cust_id, status, createdOn")
                        .eq("id", sub.order_id)
                        .single();

                    if (!ord) continue;

                    // get customer name
                    const { data: customer } = await supabase
                        .from("Users")
                        .select("Fname, Lname")
                        .eq("uid", ord.cust_id)
                        .single();

                    formatted.push({
                        id: sub.id,
                        customerName: `${customer.Fname} ${customer.Lname}`,
                        orderNumber: ord.order_num,
                        status: sub.status,
                        datePlaced: ord.createdOn
                    });
                }

                setOrders(formatted);
            }
        }

        fetchOrders();
    }, [mode]);

    // search
    const filteredOrders = useMemo(() => {
        let result = orders;

        if (searchQuery.trim()) {
            result = result.filter(
                (order) =>
                    (order[searchField] &&
                        order[searchField].toLowerCase().includes(searchQuery.toLowerCase())) ||
                    order.orderNumber.toString().toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filter !== "All") {
            result = result.filter((order) => {
                if (filter === "In Progress") return order.status !== "Completed";
                if (filter === "Completed") return order.status === "Completed";
                return true;
            });
        }

        return result;
    }, [searchQuery, filter, orders, mode]);


    return (
        <>
            <Header mode={mode} />

            <div className="page">
                <div className="page-inner">

                    <div className="search-container">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder={
                                    mode === "seller"
                                        ? "Search by Customer or Order #"
                                        : "Search by Seller or Order #"
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="header-row">
                        <h1 className="orders-heading">Orders</h1>

                        <div className="filter-buttons">
                            <button className={`filter-btn ${filter === "All" ? "active" : ""}`} onClick={() => setFilter("All")}>
                                All
                            </button>
                            <button
                                className={`filter-btn ${filter === "In Progress" ? "active" : ""}`}
                                onClick={() => setFilter("In Progress")}
                            >
                                In Progress
                            </button>
                            <button
                                className={`filter-btn ${filter === "Completed" ? "active" : ""}`}
                                onClick={() => setFilter("Completed")}
                            >
                                Completed
                            </button>
                        </div>
                    </div>
                    {orders.length === 0 ? (
                        <div className="emptymessage"> No Orders Found </div>
                    ) : (
                        <div className="orders-grid">
                            {filteredOrders.map(order => (
                                <OrderCard key={order.id} order={order} mode={mode} />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
