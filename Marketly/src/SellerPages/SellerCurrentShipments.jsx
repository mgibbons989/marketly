import SectionCards from "../components/SectionCards"

export default function CurrentShipments() {
    const shipmentsData = [
        {
            orderNum: "#ORD-1230",
            trackingNum: "TRK-9876543210",
            eta: "2024-01-20",
        },
        {
            orderNum: "#ORD-1228",
            trackingNum: "TRK-9876543211",
            eta: "2024-01-19",
        },
        {
            orderNum: "#ORD-1225",
            trackingNum: "TRK-9876543212",
            eta: "2024-01-18",
        },
    ]
    return (
        <>
            <SectionCards title="Current Shipments" items={shipmentsData} type="shipments" mode="seller" />
        </>
    );
}