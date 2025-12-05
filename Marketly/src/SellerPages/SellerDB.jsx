import React from "react";
import Header from "../components/Header";
import PendingOrders from "./SellerPendingOrders"
import CurrentShipments from "./SellerCurrentShipments"
import ProductAlerts from "./SellerProductAlerts"

export default function SellerDB() {

    return (
        <div>
            <Header />

            <main className="main-container">
                <div className="main-content">
                    <h1 className="overview-title">Overview</h1>

                    <PendingOrders />
                    <CurrentShipments />
                    <ProductAlerts />
                </div>
            </main>
        </div>
    )
}