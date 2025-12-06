import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SectionCards from "../components/SectionCards";

export default function PendingOrders() {

    const [orders, setOrders] = useState([]);
    useEffect(() => {
        async function fetchOrders() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: subs } = await supabase
                .from("Sub_order")
                .select("sub_id, order_id, status")
                .eq("seller_id", user.id);

            if (!subs) return;

            let formatted = [];

            for (const sub of subs) {
                const { data: order } = await supabase
                    .from("Order")
                    .select("order_num, cust_id, createdOn")
                    .eq("order_num", sub.order_id)
                    .single();

                if (!order) continue;

                const { data: customer } = await supabase
                    .from("Users")
                    .select("Fname, Lname")
                    .eq("uid", order.cust_id)
                    .single();

                formatted.push({
                    customerName: `${customer.Fname} ${customer.Lname}`,
                    orderNum: order.order_num,
                    status: sub.status,
                    datePlaced: order.createdOn,
                });
            }

            setOrders(formatted);
        }

        fetchOrders();
    }, []);

    return (
        <>

            <SectionCards title="Pending Orders" items={orders} type="orders" mode="seller" />
        </>
    );
}