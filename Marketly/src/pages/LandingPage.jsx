import React, { useState } from "react";
import "../landing.css";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState("customer");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="Landingpage">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="main">
                <div className="grid-layout">

                    {/* Welcome Section */}
                    <div className="welcome">
                        <h2 className="welcome-title">Welcome to Marketly.</h2>
                        <p className="welcome-text">
                            Your one-stop shop for all of your needs whether you're buying the perfect
                            product or achieving your dreams as an entrepreneur!
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="card">
                        <h3 className="card-title">Log In or Sign Up</h3>

                        {/* Tabs */}
                        <div className="tab-row">
                            <button
                                onClick={() => setActiveTab("customer")}
                                className={
                                    `tab-btn ` +
                                    (activeTab === "customer" ? "tab-active-customer" : "tab-inactive")
                                }
                            >
                                Customer
                            </button>

                            <button
                                onClick={() => setActiveTab("seller")}
                                className={
                                    `tab-btn ` +
                                    (activeTab === "seller" ? "tab-active-seller" : "tab-inactive")
                                }
                            >
                                Seller
                            </button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="form"
                        >
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`input ${activeTab === "customer" ? "focus-blue" : "focus-green"
                                        }`}
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`input ${activeTab === "customer" ? "focus-blue" : "focus-green"
                                        }`}
                                />
                            </div>

                            <button
                                type="submit"
                                className={
                                    `submit-btn ` +
                                    (activeTab === "customer" ? "blue-btn" : "green-btn")
                                }
                            >
                                Log In
                            </button>
                        </form>

                        {/* Signup Link */}
                        <p className="signup-text">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className={
                                    `signup-link ` +
                                    (activeTab === "customer" ? "link-blue" : "link-green")
                                }
                            >
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
