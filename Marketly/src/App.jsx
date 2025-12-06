import React from 'react'
import './styles.css'
import { HashRouter, Routes, Route } from "react-router-dom"

// import general pages
import Signup from "./pages/Signup.jsx"
import LandingPage from './pages/LandingPage.jsx'

// import Seller Pages
import SellerDB from './SellerPages/SellerDB.jsx'
import ProductList from './SellerPages/ProductList.jsx'
import Orders from "./SellerPages/Orders.jsx"
import OrderDetails from './SellerPages/OrderDetails.jsx'
import Shipments from './SellerPages/Shipments.jsx'

// import Customer Pages
import CustomerDB from './CustomerPages/CustomerDB.jsx'
import Cart from './CustomerPages/Cart.jsx'
import Checkout from './CustomerPages/Checkout.jsx'
import Catalog from './CustomerPages/Catalog.jsx'


export default function App() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/seller/product-list" element={<ProductList />} />
      <Route path="/seller/orders" element={<Orders mode='seller' />} />
      <Route path="/seller/order/:orderId" element={<OrderDetails mode='seller' />} />
      <Route path="/seller/shipments" element={<Shipments mode='seller' />} />
      <Route path="/dashboard/seller" element={<SellerDB />} />
      {/*!!!!!!!!!!!!!!!!!!!temporary route*/}


      <Route path="/customer/cart" element={<Cart />} />
      <Route path="/customer/checkout" element={<Checkout />} />
      <Route path="/customer/catalog" element={<Catalog />} />
      <Route path="/customer/orders" element={<Orders mode='buyer' />} />
      <Route path="/customer/order/:orderId" element={<OrderDetails mode='buyer' />} />
      <Route path="/customer/shipments" element={<Shipments mode='buyer' />} />
      <Route path="/dashboard/customer" element={<CustomerDB />} />
      {/*!!!!!!!!!!!!!!!!!!!temporary route*/}

      <Route path="*" element={<div>404 Not Found</div>} />

    </Routes>
  );
}

