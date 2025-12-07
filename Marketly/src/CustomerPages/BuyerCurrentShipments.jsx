import React, { useEffect, useState } from "react";
import SectionCards from "../components/SectionCards";
import { supabase } from "../supabaseClient";


export default function CurrentShipments() {
    const [shipments, setShipments] = useState([]);

    useEffect(() => {
        async function loadShipments() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let final = [];

            // Get all customer orders
            const { data: orders } = await supabase
                .from("Order")
                .select("order_num, cust_id")
                .eq("cust_id", user.id);

            for (const ord of orders) {
                // Get all seller suborders
                const { data: subs } = await supabase
                    .from("sub_order")
                    .select("id, order_id, seller_id")
                    .eq("order_id", ord.order_num);

                for (const sub of subs) {
                    // Get shipment
                    const { data: ship } = await supabase
                        .from("Shipment")
                        .select(`sub_id, 
                            carrier, 
                            tracking_num, 
                            status, 
                            created_on`)
                        .eq("sub_id", sub.id)
                        .maybeSingle();

                    if (!ship) continue;

                    final.push({
                        orderNum: ord.order_num,
                        trackingNum: ship.tracking_num,
                        eta: ship.created_on,
                    });

                }
            }

            setShipments(final);
        }

        loadShipments();
    }, []);
    return (
        <>
            <SectionCards title="Current Shipments" items={shipments} type="shipments" mode="buyer" />
        </>
    );
}