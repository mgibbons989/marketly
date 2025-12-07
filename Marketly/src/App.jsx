import React from "react"
import { Routes, Route } from "react-router-dom"
import "./styles.css"

import ProtectedRoute from "./components/protectedRoute.jsx"

// general
import Signup from "./pages/Signup.jsx"
import LandingPage from "./pages/LandingPage.jsx"

// seller pages
import SellerDB from './SellerPages/SellerDB.jsx'
import ProductList from './SellerPages/ProductList.jsx'
import Orders from "./SellerPages/Orders.jsx"
import OrderDetails from './SellerPages/OrderDetails.jsx'
import Shipments from './SellerPages/Shipments.jsx'

// customer pages
import CustomerDB from './CustomerPages/CustomerDB.jsx'
import Cart from './CustomerPages/Cart.jsx'
import Checkout from './CustomerPages/Checkout.jsx'
import Catalog from './CustomerPages/Catalog.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />

      {/* Seller protected routes */}
      <Route
        path="/seller/product-list"
        element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/orders"
        element={
          <ProtectedRoute>
            <Orders mode='seller' />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderDetails mode='seller' />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/shipments"
        element={
          <ProtectedRoute>
            <Shipments mode='seller' />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/seller"
        element={
          <ProtectedRoute>
            <SellerDB />
          </ProtectedRoute>
        }
      />

      {/* Customer protected routes */}
      <Route
        path="/customer/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/catalog"
        element={
          <ProtectedRoute>
            <Catalog />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute>
            <Orders mode='buyer' />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderDetails mode='buyer' />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/shipments"
        element={
          <ProtectedRoute>
            <Shipments mode='buyer' />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/customer"
        element={
          <ProtectedRoute>
            <CustomerDB />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}
