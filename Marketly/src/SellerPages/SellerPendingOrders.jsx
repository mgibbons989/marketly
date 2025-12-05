import SectionCards from "../components/SectionCards"

export default function PendingOrders() {

    const sellerPendingOrdersData = [
        {
            customerName: "Sarah Johnson",
            orderNum: "ORD-1234",
            status: "Placed",
            datePlaced: "January 15, 2024",
        },
        {
            customerName: "Michael Chen",
            orderNum: "ORD-1235",
            status: "Packing",
            datePlaced: "January 14, 2024",
        },
        {
            customerName: "Emily Davis",
            orderNum: "ORD-1236",
            status: "Shipped",
            datePlaced: "January 13, 2024",
        },
    ];

    return (
        <>
            <SectionCards title="Pending Orders" items={sellerPendingOrdersData} type="orders" mode="seller" />
        </>
    );
}