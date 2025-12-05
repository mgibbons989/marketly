import React from "react";
import Header from "../components/Header";
import PendingOrders from "../components/PendingOrders"
import CurrentShipments from "../components/CurrentShipments"
import ProductAlerts from "../components/ProductAlerts"


export default function SellerDB() {

    return (
        <div>
            <Header />

            <main className="main-container">
                <h1 className="overview-title">Overview</h1>

                <PendingOrders />
                <CurrentShipments />
                <ProductAlerts />
            </main>
        </div>
    )
}