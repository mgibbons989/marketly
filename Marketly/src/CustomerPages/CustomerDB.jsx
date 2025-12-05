import React from "react";
import Header from "../components/Header";
import PendingOrders from "./BuyerPendingOrders"
import CurrentShipments from "./BuyerCurrentShipments"
import ProductAlerts from "./BuyerLowStockAlerts"


export default function CustomerDB() {

    return (
        <div>
            <Header mode="buyer" />

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