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
                .select("pid, pname, price, stock, image, seller_id");

            // get all sellers 
            let { data: sellersData } = await supabase
                .from("Users")
                .select("uid, Fname, Lname");

            const sellerMap = {};
            sellersData.forEach((s) => {
                sellerMap[s.uid] = `${s.Fname} ${s.Lname}`;
            });

            const formatted = productsData.map((p) => ({
                id: p.pid,
                name: p.pname,
                price: p.price,
                stock: p.stock,
                sellerName: sellerMap[p.seller_id] || "Unknown Seller",
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
        const productId = selectedProduct.id;

        // get current user
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return alert("You must be logged in!");

        // find or create a cart for the user
        const { data: cart } = await supabase
            .from("Cart")
            .select("cart_id")
            .eq("customer_id", user.id)
            .single();

        let cartId = cart?.cart_id;

        if (!cartId) {
            // create new cart
            const { data: newCart } = await supabase
                .from("Cart")
                .insert([{ customer_id: user.id }])
                .select()
                .single();

            cartId = newCart.cart_id;
        }

        // does this product already exist in cart?
        const { data: existingItem } = await supabase
            .from("Cart_item")
            .select("quantity")
            .eq("cart_id", cartId)
            .eq("product_id", productId)
            .maybeSingle();

        if (existingItem) {
            // update quantity
            await supabase
                .from("Cart_item")
                .update({
                    quantity: existingItem.quantity + quantity,
                })
                .eq("cart_id", cartId)
                .eq("product_id", productId);
        } else {
            // insert new item
            await supabase.from("Cart_item").insert([
                {
                    cart_id: cartId,
                    product_id: productId,
                    quantity: quantity,
                },
            ]);
        }

        handleCloseModal();
        setShowSuccess(true);

        setTimeout(() => setShowSuccess(false), 2500);
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
                                    <p className="cat-product-seller">{product.seller}</p>
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
                                <p className="modal-seller">{selectedProduct.seller}</p>
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