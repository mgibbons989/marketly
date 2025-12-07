import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SectionCards from "../components/SectionCards";

export default function CurrentShipments() {
    const [shipments, setShipments] = useState([]);

    useEffect(() => {
        async function fetchShipments() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: subs } = await supabase
                .from("sub_order")
                .select("id")
                .eq("seller_id", user.id);

            if (!subs || subs.length === 0) {
                setShipments([]);
                return;
            }

            const subIds = subs.map(s => s.id);

            const { data: shipments } = await supabase
                .from("Shipment")
                .select(`shipment_id, 
                    sub_id, 
                    carrier, 
                    tracking_num, 
                    status, 
                    created_on,
                    sub_order (
                    order_id
                )"`)
                .in("sub_id", subIds);

            if (!shipments) {
                setShipments([]);
                return;
            }
            // Shipment.sub_id -> sub_order.id identifies sub_order.order_id -> Drder.id(same as order_num)

            const formatted = shipments.map(sh => ({
                shipmentId: sh.shipment_id,
                subId: sh.sub_id,
                trackingNum: sh.tracking_num,
                carrier: sh.carrier,
                status: sh.status,
                eta: sh.created_on,
                orderNum: sh.sub_order?.order_id ?? null,
            }));

            setShipments(formatted);
        }

        fetchShipments();
    }, []);

    return (
        <SectionCards
            title="Current Shipments"
            items={shipments}
            type="shipments"
            mode="seller"
        />
    );
}
