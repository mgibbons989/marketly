import SectionCards from "../components/SectionCards"

export default function ProductAlerts() {
    const buyerProductsData = [
        {
            id: 1,
            name: "Wireless Headphones",
            qty: 15,
            outOfStock: false,
        },
        {
            id: 2,
            name: "Smart Watch",
            qty: 0,
            image: "",
        },
        {
            id: 3,
            name: "Laptop Stand",
            qty: 8,
            image: "",
        },
    ];

    return (
        <>
            <SectionCards title="Low Stock in Cart" items={buyerProductsData} type="product" mode="buyer" />
        </>
    );

}