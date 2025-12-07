import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SectionCards from "../components/SectionCards";
import { Link } from "react-router-dom";

export default function PendingOrders() {

    const [orders, setOrders] = useState([]);
    useEffect(() => {
        async function fetchOrders() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // console.log("get orders");

            const { data: subs, error: subErr } = await supabase
                .from("sub_order")
                .select("order_id, status, seller_id")
                .eq("seller_id", user.id);
            // console.log("got orders")

            if (subErr) {
                console.error("suborder fetch error:", subErr);
                return;
            }


            if (!subs) return;

            let formatted = [];

            for (const sub of subs) {
                if (sub.status.trim().toLowerCase() === "completed") continue;
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

                if (!customer) continue;

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