import React, { useState, useRef, useEffect } from "react"
import { Bell, ShoppingCart, Plus, Minus } from "lucide-react"
import NotificationsDropdown from "./NotificationsDropdown"
import "../styles.css"
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";


function Header({ mode = "seller" }) {
    const navigate = useNavigate()
    async function handleLogout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error);
            return;
        }
        navigate('/');
    }

    const location = useLocation();
    const isLandingPage = location.pathname === "/";
    const isSignupPage = location.pathname === "/signup";

    const [openNotif, setOpenNotif] = useState(false)
    const [openCart, setOpenCart] = useState(false)

    const [notificationCount] = useState(3)
    const bellRef = useRef()
    const notifDropdownRef = useRef()
    const cartRef = useRef()
    const cartDropdownRef = useRef()

    const [userName, setUserName] = useState("");

    const [cartItems, setCartItems] = useState([])

    const handleQtyChange = async (id, delta) => {
        const item = cartItems.find(i => i.id === id);
        if (!item) return;

        const newQty = Math.max(1, item.qty + delta);

        // update Supabase
        await supabase
            .from("cart_item")
            .update({ quantity: newQty })
            .eq("id", id);

        // update local display instantly
        setCartItems(prev =>
            prev.map(i =>
                i.id === id ? { ...i, qty: newQty } : i
            )
        );
    };

    const handleRemove = async (id) => {
        await supabase
            .from("cart_item")
            .delete()
            .eq("id", id);

        setCartItems(prev => prev.filter(i => i.id !== id));
    };

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
    // Get name
    useEffect(() => {
        async function fetchUserName() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            // console.log(user)

            let profileName = "";

            const { data: seller } = await supabase
                .from("Seller")
                .select("business_name")
                .eq("uid", user.id)
                .maybeSingle();

            if (seller) {
                profileName = seller.business_name;
                setUserName(profileName);
                return;
            }

            const { data } = await supabase
                .from("Customer")
                .select(`
                    uid,
                    Users:uid ( Fname, Lname )
                `)
                .eq("uid", user.id)
                .maybeSingle();


            if (data?.Users) {
                profileName = `${data.Users.Fname} ${data.Users.Lname}`;
                setUserName(profileName);
                return;
            }

        }

        fetchUserName();
    }, []);

    useEffect(() => {
        async function loadMiniCart() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user's cart using correct columns
            const { data: cart } = await supabase
                .from("Cart")
                .select("id")
                .eq("cust_id", user.id)
                .maybeSingle();

            if (!cart) {
                setCartItems([]);
                return;
            }

            const cartId = cart.id;

            // Load cart items + product join
            const { data: items } = await supabase
                .from("cart_item")
                .select(`
                id,
                quantity,
                product_id,
                Products (
                    pname,
                    price,
                    image,
                    seller_id
                )
            `)
                .eq("cart_id", cartId);

            if (!items) {
                setCartItems([]);
                return;
            }

            const formatted = items.map(item => ({
                id: item.id,
                name: item.Products?.pname,
                qty: item.quantity,
                img: item.Products?.image || "/placeholder.svg",
            }));

            setCartItems(formatted.slice(0, 4));
        }

        loadMiniCart();
    }, [openCart]);
    console.log("NAV MODE:", mode);

    const navLinks = [
        {
            name: "Dashboard",
            path: mode === "seller" ? "/dashboard/seller" : "/dashboard/customer",
            type: "link"
        },
        {
            name: "Orders",
            path: mode === "seller" ? "/seller/orders" : "/customer/orders",
            type: "link"
        },
        {
            name: "Shipments",
            path: mode === "seller" ? "/seller/shipments" : "/customer/shipments",
            type: "link"
        },
        {
            name: mode === "seller" ? "Product List" : "Product Catalog",
            path: mode === "seller" ? "/seller/product-list" : "/customer/catalog",
            type: "link"
        },
        ...(mode === "buyer"
            ? [{
                name: "Cart",
                path: "/customer/cart",
                type: "link"
            }]
            : []),
        {
            name: "Logout",
            type: "logout"  // special type
        }
    ];

    return (
        <header className="header">
            <div className="header-container">
                <h1 className="logo">Marketly</h1>

                {!isLandingPage && !isSignupPage && (
                    <div className="header-right">
                        {/* Profile name */}
                        <div className="profile">
                            <span className="profile-name">{userName || (mode === "seller" ? "Seller" : "Customer")}</span>
                        </div>

                        {/* Notification bell */}
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
            {/* nav bar */}
            {!isLandingPage && !isSignupPage && (
                <nav className="top-nav">
                    <ul>
                        {navLinks.map(link => (
                            <li key={link.name}>
                                {link.type === "logout" ? (
                                    <button className="logout-link" onClick={handleLogout}>{link.name}</button>
                                ) :
                                    (
                                        <a
                                            href={link.path}
                                            className={
                                                location.pathname === link.path ? "active" : ""
                                            }
                                        >
                                            {link.name}
                                        </a>
                                    )}

                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>

    );

};

export default Header;