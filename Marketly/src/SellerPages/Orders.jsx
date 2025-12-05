import React, { useState, useMemo } from "react";
import Header from "../components/Header";
import "./orders.css"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { orders } from "./orders"
import OrderCard from "./OrderCard";


export default function Orders() {
    const [searchQuery, setSearchQuery] = useState("")

    const [filter, setFilter] = useState("All");

    const filteredOrders = useMemo(() => {
        let result = orders

        // Apply search filter
        if (searchQuery.trim()) {
            result = result.filter(
                (order) =>
                    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }

        // Apply status filter
        if (filter !== "All") {
            result = result.filter((order) => {
                if (filter === "In Progress") {
                    return order.status !== "Completed"
                } else if (filter === "Completed") {
                    return order.status === "Completed"
                }
                return true
            })
        }

        return result
    }, [searchQuery, filter])


    return (
        <>
            <Header />
            <div className="page">
                <div className="page-inner">


                    <div className="search-container">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search by Customer or Order #"
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

                    <div className="orders-grid">
                        {filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>




                </div>
            </div>

        </>
    )

}