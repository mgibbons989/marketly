import Header from "../components/Header";
import { useState, useEffect } from "react"
import "./cart.css"
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";


export default function Cart() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCart() {
            setLoading(true);

            // get logged in user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return alert("You must be logged in");

            // find the cart row
            let { data: cart } = await supabase
                .from("Cart")
                .select("id")
                .eq("cust_id", user.id)
                .maybeSingle();

            // if no cart exists, create one
            if (!cart) {
                const { data: newCart } = await supabase
                    .from("Cart")
                    .insert([{ cust_id: user.id }])
                    .select()
                    .single();
                cart = newCart;
            }

            const cartId = cart.id;

            // load all items in the cart
            const { data: items } = await supabase
                .from("cart_item")
                .select(`id, 
                    product_id,
                     quantity, 
                     Products (
                     pname, 
                     price, 
                     image, 
                     seller_id,
                     Seller ( business_name))`)
                .eq("cart_id", cartId);

            // load seller names
            // const { data: sellers } = await supabase
            //     .from("Users")
            //     .select("uid, Fname, Lname");

            // const sellerMap = {};
            // sellers.forEach(s => {
            //     sellerMap[s.uid] = `${s.Fname} ${s.Lname}`;
            // });

            const formatted = items.map((item) => ({
                id: item.id,
                product_id: item.product_id,
                name: item.Products.pname,
                price: item.Products.price,
                image: item.Products.image,
                quantity: item.quantity,
                seller_id: item.Products.seller_id,
                seller: `${item.Products.Seller.business_name}`,
                checked: false,  // UI only
            }));

            setCartItems(formatted);
            setLoading(false);
        }

        loadCart();
    }, []);

    const handleBack = () => navigate(-1)

    const handleCheckbox = (id) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleQuantityChange = async (id, delta) => {
        const item = cartItems.find(p => p.id === id);
        const newQty = Math.max(1, item.quantity + delta);

        await supabase
            .from("cart_item")
            .update({ quantity: newQty })
            .eq("id", id);

        setCartItems(prev =>
            prev.map(p =>
                p.id === id ? { ...p, quantity: newQty } : p
            )
        );
    };

    const handleRemove = async (id) => {
        await supabase
            .from("cart_item")
            .delete()
            .eq("id", id);

        setCartItems(prev => prev.filter(p => p.id !== id));
    };

    const checkedItems = cartItems.filter((p) => p.checked);

    const itemCount = checkedItems.length

    const subtotal = checkedItems.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
    )
    const handleCheckout = () => {

        if (checkedItems.length === 0)
            return alert("Please select at least one item to checkout");

        const confirmCheckout = window.confirm("Are you sure you want to check out now?");
        if (!confirmCheckout) return;

        // Save only checked items to sessionStorage
        sessionStorage.setItem("checkoutItems", JSON.stringify(checkedItems));

        navigate("/customer/checkout");
    };

    if (loading) return <p>Loading...</p>;

    return (
        <>
            <Header mode="buyer" />
            <div className="page">
                <div className="page-inner">
                    <button className="back-button" onClick={handleBack}>
                        ← Back
                    </button>

                    <h1 className="page-title">Cart</h1>

                    <div className="cart-products-container">
                        {cartItems.map((product) => (
                            <div key={product.id} className="cart-product-card">
                                <input
                                    type="checkbox"
                                    className="cart-product-checkbox"
                                    checked={product.checked}
                                    onChange={() => handleCheckbox(product.id)}
                                />

                                <img src={product.image || "/placeholder.svg"} className="cart-product-image" />

                                <div className="cart-product-info">
                                    <h3 className="cart-product-name">{product.name}</h3>
                                    <p className="cart-product-seller">{product.seller}</p>
                                </div>

                                <div className="quantity-controls">
                                    <button className="quantity-btn" onClick={() => handleQuantityChange(product.id, -1)}>-</button>
                                    <span className="quantity-display">{product.quantity}</span>
                                    <button className="quantity-btn" onClick={() => handleQuantityChange(product.id, 1)}>+</button>
                                </div>

                                <div className="cart-product-price">
                                    ${(product.price * product.quantity).toFixed(2)}
                                </div>

                                <button className="remove-button" onClick={() => handleRemove(product.id)}>Remove</button>
                            </div>
                        ))}
                        <div className="cart-summary">
                            <div className="summary-row">
                                <span className="summary-label">Items Selected:</span>
                                <span className="summary-value">{itemCount}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Subtotal:</span>
                                <span className="summary-value">${subtotal.toFixed(2)}</span>
                            </div>
                            <button className="checkout-button" onClick={handleCheckout}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>

                </div>
            </div >

        </>
    )
}