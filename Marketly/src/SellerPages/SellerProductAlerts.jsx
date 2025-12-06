import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SectionCards from "../components/SectionCards";

export default function ProductAlerts() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        async function fetchProducts() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("Products")
                .select("pid, pname, stock")
                .eq("seller_id", user.id);

            const formatted = data.map(p => ({
                name: p.pname,
                qty: p.stock,
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
