import React, { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import NotificationsDropdown from "./NotificationsDropdown"
import "../styles.css"


function Header() {

    const [open, setOpen] = useState(false)
    const [notificationCount] = useState(3)
    const bellRef = useRef()
    const dropdownRef = useRef()

    useEffect(() => {
        function handleClick(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                !bellRef.current.contains(e.target)
            ) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    return (
        <header className="header">
            <div className="header-container">
                <h1 className="logo">Marketly</h1>

                <div className="header-right">
                    {/* Profile */}
                    <div className="profile">
                        <div className="profile-pic"></div>
                        <span className="profile-name">Seller Name</span>
                    </div>

                    {/* Notifications */}
                    <div className="notification-wrapper">
                        <button className="bell-button"
                            ref={bellRef}
                            onClick={() => setOpen(!open)}>

                            <Bell className="bell-icon" size={24} />
                            {notificationCount > 0 && <span className="notif-count"> {notificationCount} </span>}
                        </button>

                        {open && (
                            <div ref={dropdownRef}>
                                <NotificationsDropdown notifications={[
                                    "Order #1042 has been placed",
                                    "Stock running low for Product A",
                                    "Customer message received"
                                ]} />
                            </div>
                        )}
                    </div>
                    {/* <button className="about-btn">About</button> */}
                </div>



            </div>
        </header>

    );

};

export default Header;