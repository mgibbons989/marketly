import "./notifications.css"

export default function NotificationsDropdown({ notifications }) {
    return (
        <div className="notif-dropdown">
            {notifications.length === 0 ? (
                <div className="no-notif">No new notifications</div>
            ) : (
                <div className="notif-list">
                    {notifications.map((notif, index) => (
                        <div key={index} className="notif-item">{notif}</div>
                    ))}
                </div>
            )}
        </div>
    );
}