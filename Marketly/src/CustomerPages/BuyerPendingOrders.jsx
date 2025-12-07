import React, { useEffect, useState } from "react";
import SectionCards from "../components/SectionCards"
import { supabase } from "../supabaseClient";

export default function PendingOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        async function loadPendingOrders() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;


            // Get all orders for this customer
            const { data: orderRows, error: orderErr } = await supabase
                .from("Order")
                .select("cust_id, order_num, createdOn")
                .eq("cust_id", user.id);

            if (orderErr) {
                console.error("getting order error: ", orderErr)
                return;
            }

            let final = [];

            for (const ord of orderRows) {
                // Get all suborders (each seller)
                const { data: subs } = await supabase
                    .from("sub_order")
                    .select("id, seller_id, status, order_id")
                    .eq("order_id", ord.order_num);

                for (const sub of subs) {
                    if (sub.status.trim().toLowerCase() === "completed") continue;
                    //Get seller name
                    const { data: seller } = await supabase
                        .from("Seller")
                        .select("business_name")
                        .eq("uid", sub.seller_id)
                        .single();

                    // Build card
                    final.push({
                        sellerName: seller.business_name,
                        orderNum: ord.order_num,
                        status: sub.status,
                        datePlaced: ord.createdOn
                    });
                }
            }

            setOrders(final);
        }

        loadPendingOrders();
    }, []);
    return (
        <>
            <SectionCards title="Pending Orders" items={orders} type="orders" mode="buyer" />
        </>
    );
}