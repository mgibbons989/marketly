import React, { useEffect, useState } from "react";
import SectionCards from "../components/SectionCards";
import { supabase } from "../supabaseClient";


export default function ProductAlerts() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        async function loadAlerts() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get cart id for user
            const { data: cart } = await supabase
                .from("Cart")
                .select("cart_id")
                .eq("customer_id", user.id)
                .single();

            if (!cart) {
                setAlerts([]);
                return;
            }

            // Get items in the cart
            const { data: items } = await supabase
                .from("Cart_item")
                .select("product_id, quantity")
                .eq("cart_id", cart.cart_id);

            let final = [];

            for (const item of items) {
                // Get product info
                const { data: product } = await supabase
                    .from("Products")
                    .select("pname, stock, image")
                    .eq("pid", item.product_id)
                    .single();

                if (!product) continue;

                if (product.stock < item.quantity) {
                    final.push({
                        id: item.product_id,
                        name: product.pname,
                        qty: product.stock,
                        image: product.image,
                    });
                }
            }

            setAlerts(final);
        }

        loadAlerts();
    }, []);

    return (
        <>
            <SectionCards title="Low Stock in Cart" items={buyerProductsData} type="product" mode="buyer" />
        </>
    );

}