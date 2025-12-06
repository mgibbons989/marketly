import React, { useState, useRef, useEffect } from "react"
import { Bell, ShoppingCart, Plus, Minus } from "lucide-react"
import NotificationsDropdown from "./NotificationsDropdown"
import "../styles.css"
import { useLocation } from "react-router-dom";


function Header({ mode = "seller" }) {
    const location = useLocation();
    const isLandingPage = location.pathname === "/";

    const [openNotif, setOpenNotif] = useState(false)
    const [openCart, setOpenCart] = useState(false)

    const [notificationCount] = useState(3)
    const bellRef = useRef()
    const notifDropdownRef = useRef()
    const cartRef = useRef()
    const cartDropdownRef = useRef()

    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Red Sneakers", qty: 1, img: "https://via.placeholder.com/50" },
        { id: 2, name: "Bluetooth Headphones", qty: 2, img: "https://via.placeholder.com/50" },
        { id: 3, name: "LED Desk Lamp", qty: 1, img: "https://via.placeholder.com/50" },
        { id: 4, name: "Water Bottle", qty: 1, img: "https://via.placeholder.com/50" }
    ])

    const handleQtyChange = (id, delta) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, qty: Math.max(1, item.qty + delta) }
                    : item
            )
        )
    }

    const handleRemove = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id))
    }

    useEffect(() => {
        function handleClick(e) {
            if (
                notifDropdownRef.current &&
                !notifDropdownRef.current.contains(e.target) &&
                !bellRef.current.contains(e.target)
            ) {
                setOpenNotif(false)
            }

            if (
                cartDropdownRef.current &&
                !cartDropdownRef.current.contains(e.target) &&
                !cartRef.current.contains(e.target)
            ) {
                setOpenCart(false)
            }
        }

        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const navLinks = [
        {
            name: "Dashboard",
            path: mode === "seller" ? "/dashboard/seller" : "/dashboard/customer"
        },
        {
            name: "Orders",
            path: mode === "seller" ? "/seller/orders" : "/customer/orders"
        },
        {
            name: "Shipments",
            path: mode === "seller" ? "/seller/shipments" : "/customer/shipments"
        },
        {
            name: mode === "seller" ? "Product List" : "Product Catalog",
            path: mode === "seller" ? "/seller/product-list" : "/customer/catalog"
        }
    ];

    return (
        <header className="header">
            <div className="header-container">
                <h1 className="logo">Marketly</h1>

                {!isLandingPage && (
                    <div className="header-right">
                        {/* Profile */}
                        <div className="profile">
                            <div className="profile-pic"></div>
                            <span className="profile-name">{mode === "seller" ? "Seller Name" : "Buyer Name"}</span>
                        </div>

                        {/* Notifications */}
                        <div className="notification-wrapper">
                            <button className="bell-button"
                                ref={bellRef}
                                onClick={() => {
                                    setOpenNotif(!openNotif)
                                    setOpenCart(false)
                                }}>

                                <Bell className="bell-icon" size={24} />
                                {notificationCount > 0 && <span className="notif-count"> {notificationCount} </span>}
                            </button>

                            {openNotif && (
                                <div ref={notifDropdownRef}>
                                    <NotificationsDropdown
                                        notifications={[
                                            "Order #1042 has been placed",
                                            "Stock running low for Product A",
                                            "Customer message received"
                                        ]}
                                    />
                                </div>
                            )}

                        </div>

                        {/* Cart */}
                        {mode === "buyer" && (
                            <div className="cart-wrapper">
                                <button
                                    className="cart-button"
                                    ref={cartRef}
                                    onClick={() => {
                                        setOpenCart(!openCart)
                                        setOpenNotif(false)
                                    }}
                                >
                                    <ShoppingCart className="cart-icon" size={26} />
                                </button>

                                {openCart && (
                                    <div className="cart-dropdown" ref={cartDropdownRef}>
                                        {cartItems.slice(0, 4).map(item => (
                                            <div key={item.id} className="cart-item-card">

                                                <img src={item.img} className="cart-thumb" alt="product" />

                                                {/* Product Info */}
                                                <div className="cart-item-info">
                                                    <p className="cart-item-name">{item.name}</p>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="qty-controls">
                                                    <button onClick={() => handleQtyChange(item.id, -1)}>
                                                        <Minus size={14} />
                                                    </button>

                                                    <span className="qty-number">{item.qty}</span>

                                                    <button onClick={() => handleQtyChange(item.id, +1)}>
                                                        <Plus size={14} />
                                                    </button>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => handleRemove(item.id)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}

                                        <a href="/customer/cart" className="cart-more-link">View More →</a>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}



            </div>
            {/* TOP NAVIGATION BAR */}
            {!isLandingPage && (
                <nav className="top-nav">
                    <ul>
                        {navLinks.map(link => (
                            <li key={link.name}>
                                <a
                                    href={link.path}
                                    className={
                                        location.pathname === link.path ? "active" : ""
                                    }
                                >
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>

    );

};

export default Header;