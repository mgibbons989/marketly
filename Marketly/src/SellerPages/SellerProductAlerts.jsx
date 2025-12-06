import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SectionCards from "../components/SectionCards";

export default function ProductAlerts() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        async function fetchProducts() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("Products")
                .select("id, pname, stock, image")
                .eq("seller_id", user.id);

            if (error) {
                console.error("Supabase error:", error);
                setProducts([]);
                return;
            }

            const rows = data || [];
            const formatted = rows.map(p => ({
                name: p.pname,
                qty: p.stock,
                image: p.image
            }));

            setProducts(formatted);
        }

        fetchProducts();
    }, []);

    return (
        <SectionCards
            title="Product Alerts"
            items={products}
            type="product"
            mode="seller"
        />
    );
}
