import React from 'react'
import './styles.css'
import { HashRouter, Routes, Route } from "react-router-dom"

// import general pages
import Signup from "./pages/Signup.jsx"
import Login from "./pages/Login.jsx"
import LandingPage from './pages/LandingPage.jsx'
import SellerDB from './SellerPages/SellerDB.jsx'
import ProductList from './SellerPages/ProductList.jsx'

// import Seller Pages


// import Customer Pages


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/seller/product-list" element={<ProductList />} />

      <Route
        path="/dashboard/seller"
        element={<SellerDB />} /> {/*!!!!!!!!!!!!!!!!!!!temporary route*/}

      <Route path="*" element={<div>404 Not Found</div>} />

    </Routes>
  );
}

