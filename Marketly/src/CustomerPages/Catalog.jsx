import Header from "../components/Header";
import React, { useState, useEffect } from "react";
import { Search, Minus, Plus, X } from "lucide-react";
import "./catalog.css";
import { supabase } from "../supabaseClient";


export default function Catalog() {

    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        async function loadProducts() {
            let { data: productsData } = await supabase
                .from("Products")
                .select(`id, pname, price, stock, image, seller_id, 
                    Seller: seller_id ( business_name )`);

            const formatted = productsData.map((p) => ({
                id: p.id,
                name: p.pname,
                price: p.price,
                stock: p.stock,
                sellerName: p.Seller?.business_name || "Unknown Seller",
                image: p.image || "/placeholder.svg",
                seller_id: p.seller_id,
            }));

            setProducts(formatted);
        }

        loadProducts();
    }, []);

    const filteredProducts = products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(q) ||
            p.sellerName.toLowerCase().includes(q)
        );
    });

    const handleCardClick = (product) => {
        console.log(product)
        setSelectedProduct(product)
        setQuantity(1)
    }

    const handleCloseModal = () => {
        setSelectedProduct(null)
        setQuantity(1)
    }

    const handleQuantityDecrease = () => {
        setQuantity((prev) => Math.max(1, prev - 1))
    }

    const handleQuantityIncrease = () => {
        setQuantity((prev) => prev + 1)
    }

    const handleAddToCart = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("Not logged in!");

        // console.log(user);

        // 1. Fetch the user's cart
        let { data: cart, error: cartErr } = await supabase
            .from("Cart")
            .select("id")
            .eq("cust_id", user.id)
            .single();

        if (cartErr) {
            console.error("Cart fetch error:", cartErr);
            return;
        }
        console.log(cart)

        let cartId = cart?.id;

        console.log(cartId);

        // 2. If no cart, create one
        if (!cartId) {
            const { data: newCart, error: newCartErr } = await supabase
                .from("Cart")
                .insert([{ cust_id: user.id }])
                .select("id")
                .single();

            if (newCartErr) {
                console.error("Cart creation failed:", newCartErr);
                return;
            }

            cartId = newCart.id;
        }

        // 3. Check if the item already exists in cart
        const { data: existingItem, error: existingErr } = await supabase
            .from("cart_item")
            .select("id, quantity")
            .eq("cart_id", cartId)
            .eq("product_id", selectedProduct.id)
            .maybeSingle();

        if (existingErr) {
            console.error("Find item error:", existingErr);
            return;
        }

        // 4. Update or insert item
        if (existingItem) {
            await supabase
                .from("cart_item")
                .update({
                    quantity: existingItem.quantity + quantity
                })
                .eq("id", existingItem.id);
        } else {
            console.log(cartId, selectedProduct.id, quantity)

            const { error: insertErr } = await supabase
                .from("cart_item")
                .insert([
                    {
                        cart_id: cartId,
                        product_id: selectedProduct.id,
                        quantity: quantity
                    }
                ]);

            if (insertErr) {
                console.error("Insert item error:", insertErr);
                return;
            }
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <>
            <Header mode="buyer" />

            <div className="page">
                <div className="page-inner">

                    <div className="search-container">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search by product or seller name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                    <h1 className="cat-title">All Products</h1>

                    <div className="cat-products-grid">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="cat-product-card" onClick={() => handleCardClick(product)}>
                                <img src={product.image || "/placeholder.svg"} alt={product.name} className="cat-product-image" />
                                <div className="cat-product-info">
                                    <h3 className="cat-product-name">{product.name}</h3>
                                    <p className="cat-product-seller">{product.sellerName}</p>
                                    <p className="cat-product-price">${product.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="no-results">
                            <p>No products found matching your search.</p>
                        </div>
                    )}
                </div>

                {selectedProduct && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="cat-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={24} />
                            </button>

                            <img src={selectedProduct.image || "/placeholder.svg"} alt={selectedProduct.name} className="cat-modal-image" />

                            <div className="modal-info">
                                <h2 className="modal-product-name">{selectedProduct.name}</h2>
                                <p className="modal-seller">Sold by: {selectedProduct.sellerName}</p>
                                <p className="modal-price">${selectedProduct.price.toFixed(2)}</p>

                                <div className="quantity-section">
                                    <label className="quantity-label">Quantity:</label>
                                    <div className="quantity-controls">
                                        <button className="quantity-btn" onClick={handleQuantityDecrease}>
                                            <Minus size={16} />
                                        </button>
                                        <span className="quantity-display">{quantity}</span>
                                        <button className="quantity-btn" onClick={handleQuantityIncrease}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Notification */}
                {showSuccess && <div className="success-notification">Successfully Added to Cart!</div>}


            </div>


        </>
    )
}