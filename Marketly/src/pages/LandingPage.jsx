import React, { useState } from "react";
import "../landing.css";
import { Link } from "react-router-dom";
import Header from "../components/Header";

import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState("customer");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // login function
    async function handleLogin(e) {
        e.preventDefault();
        setErrorMsg("");
        setErrors({});

        // for errors signing in
        function getLoginErrorMessage(error) {
            const message = error.message.toLowerCase();

            if (message.includes("invalid login credentials")) {
                return "Email or password is incorrect.";
            }

            return "Unable to log in. Please try again.";
        }

        // valiate email and password before trying to sign in
        const validateEmail = (email) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!validateEmail(email)) {
            newErrors.email = "Invalid email format";
        }

        if (!password) {
            newErrors.password = "Password is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // try to sign in
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setErrorMsg(getLoginErrorMessage(error));
            return;
        }

        // check if user is customer
        const { data: cust, error: custErr } = await supabase
            .from("Customer")
            .select("uid")
            .eq("uid", user.id)
            .single();

        if (cust) {
            navigate("dashboard/customer");
            return;
        }

        // check if user is a seller
        const { data: seller } = await supabase
            .from("Seller")
            .select("uid, business_name")
            .eq("uid", user.id)
            .single();

        if (seller) {
            navigate("/dashboard/seller");
            return;
        }
        // fall back
        setErrorMsg("User has no assigned role.");
    }

    return (
        <div className="Landingpage">
            <Header />

            <main className="main">
                <div className="grid-layout">

                    {/* Welcome  */}
                    <div className="welcome">
                        <h2 className="welcome-title">Welcome to Marketly.</h2>
                        <p className="welcome-text">
                            Your one-stop shop for all of your needs whether you're buying the perfect
                            product or achieving your dreams as an entrepreneur!
                        </p>
                    </div>

                    {/* Login  */}
                    <div className="landing-card">
                        <h3 className="card-title">Log In Here!</h3>

                        {/* seller vs customer tabs */}
                        <div className="tab-row">
                            <button
                                onClick={() => {
                                    setActiveTab("customer");
                                    setErrors({});
                                    setErrorMsg("");
                                }}
                                className={
                                    `tab-btn ` +
                                    (activeTab === "customer" ? "tab-active-customer" : "tab-inactive")
                                }
                            >
                                Customer
                            </button>

                            <button
                                onClick={() => {
                                    setActiveTab("seller");
                                    setErrors({});
                                    setErrorMsg("");
                                }}
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
                            onSubmit={handleLogin}
                            className="form"
                        >
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                    }}
                                    className={`home-input ${errors.email ? "error" : ""} ${activeTab === "customer" ? "focus-blue" : "focus-green"
                                        }`}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label className="land">Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                                    }}
                                    className={`home-input ${errors.password ? "error" : ""} ${activeTab === "customer" ? "focus-blue" : "focus-green"
                                        }`}
                                />
                                {errors.password && (
                                    <span className="error-message">{errors.password}</span>
                                )}
                            </div>

                            {errorMsg && (
                                <div className="auth-error">
                                    {errorMsg}
                                </div>
                            )}

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
