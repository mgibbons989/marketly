import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SectionCards from "../components/SectionCards";

export default function CurrentShipments() {
    const [shipments, setShipments] = useState([]);

    useEffect(() => {
        async function fetchShipments() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("Shipment")
                .select("shipment_id, sub_id, carrier, tracking_num, status, created_on")
                .in(
                    "sub_id",
                    (await supabase
                        .from("Sub_order")
                        .select("sub_id")
                        .eq("seller_id", user.id)
                    ).data.map(s => s.sub_id)
                );

            const formatted = data.map(sh => ({
                orderNum: sh.sub_id,
                trackingNum: sh.tracking_num,
                eta: sh.created_on,
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
