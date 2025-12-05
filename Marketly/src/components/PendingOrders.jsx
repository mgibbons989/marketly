import SectionCards from "./SectionCards"

export default function PendingOrders() {

    const pendingOrdersData = [
        {
            customerName: "Sarah Johnson",
            orderNum: "ORD-1234",
            status: "Placed",
            datePlaced: "January 15, 2024",
        },
        {
            customerName: "Michael Chen",
            orderNum: "ORD-1235",
            status: "Packed",
            datePlaced: "January 14, 2024",
        },
        {
            customerName: "Emily Davis",
            orderNum: "ORD-1236",
            status: "Pending Shipment",
            datePlaced: "January 13, 2024",
        },
    ];

    return (
        <>
            <SectionCards title="Pending Orders" items={pendingOrdersData} type="orders" />
        </>
    );
}