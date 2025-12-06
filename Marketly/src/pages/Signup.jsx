import React, { useState } from "react";
import "./signup.css";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";

export default function Signup() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("customer");

    const [formData, setFormData] = useState({
        first: "",
        last: "",
        email: "",
        password: "",
        confirmPassword: "",
        businessName: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) => {
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (password.toLowerCase().includes("password")) return false;
        return true;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        // Validation
        const newErrors = {};

        if (!formData.first.trim()) newErrors.first = "First name is required";
        if (!formData.last.trim()) newErrors.last = "Last name is required";

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (!validatePassword(formData.password)) {
            newErrors.password =
                'Password must be at least 8 characters, contain an uppercase letter, and not include "password".';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (activeTab === "seller" && !formData.businessName.trim()) {
            newErrors.businessName = "Business name is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email.trim(),
            password: formData.password,
        });

        if (authError) {
            setErrors({ email: authError.message });
            setLoading(false);
            return;
        }

        const user = authData.user;

        // Insert into Users table
        const { error: userInsertError } = await supabase.from("Users").insert({
            uid: user.id,
            Fname: formData.first,
            Lname: formData.last,
            email: formData.email.trim(),
        });

        if (userInsertError) {
            alert("Error creating user profile: " + userInsertError.message);
            setLoading(false);
            return;
        }

        // Insert into correct role table
        if (activeTab === "customer") {
            const { error: custError } = await supabase.from("Customer").insert({
                uid: user.id,
                address: null,
            });

            if (custError) {
                alert("Error creating customer account: " + custError.message);
                setLoading(false);
                return;
            }
        } else {
            const { error: sellerError } = await supabase.from("Seller").insert({
                uid: user.id,
                business_name: formData.businessName,
            });

            if (sellerError) {
                alert("Error creating seller account: " + sellerError.message);
                setLoading(false);
                return;
            }
        }

        alert("Account created! Please log in.");
        navigate("/");
        setLoading(false);
    }

    return (
        <>
            <Header />
            <main className="main">
                <div className="grid-layout">

                    <div className="signup">
                        <h2 className="signup-title">Sign Up for Marketly.</h2>
                        <p className="signup-subtext">
                            Don't hesitate to shop our catalog or start building your business!
                        </p>
                    </div>

                    <div className="signup-card">
                        <h2 className="card-title">Sign Up</h2>

                        <div className="tab-row">
                            <button
                                className={`tab-btn ${activeTab === "customer" ? "tab-active-customer" : "tab-inactive"}`}
                                onClick={() => { setActiveTab("customer"); setErrors({}); }}
                            >
                                Customer
                            </button>

                            <button
                                className={`tab-btn ${activeTab === "seller" ? "tab-active-seller" : "tab-inactive"}`}
                                onClick={() => { setActiveTab("seller"); setErrors({}); }}
                            >
                                Seller
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="form">

                            <div className="form-row">
                                <div className="sign-form-group">
                                    <label htmlFor="first">First Name</label>
                                    <input
                                        type="text"
                                        id="first"
                                        name="first"
                                        value={formData.first}
                                        onChange={handleInputChange}
                                        className={errors.first ? "error" : ""}
                                    />
                                    {errors.first && <span className="error-message">{errors.first}</span>}
                                </div>

                                <div className="sign-form-group">
                                    <label htmlFor="last">Last Name</label>
                                    <input
                                        type="text"
                                        id="last"
                                        name="last"
                                        value={formData.last}
                                        onChange={handleInputChange}
                                        className={errors.last ? "error" : ""}
                                    />
                                    {errors.last && <span className="error-message">{errors.last}</span>}
                                </div>
                            </div>

                            {activeTab === "seller" && (
                                <div className="sign-form-group">
                                    <label htmlFor="businessName">Business Name</label>
                                    <input
                                        type="text"
                                        id="businessName"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleInputChange}
                                        className={errors.businessName ? "error" : ""}
                                    />
                                    {errors.businessName && <span className="error-message">{errors.businessName}</span>}
                                </div>
                            )}

                            <div className="sign-form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? "error" : ""}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="sign-form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={errors.password ? "error" : ""}
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            <div className="sign-form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={errors.confirmPassword ? "error" : ""}
                                />
                                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                            </div>

                            <button type="submit" className={`register-button ${activeTab}`} disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </form>

                        <p className="login-text">
                            Already have an account?{" "}
                            <Link
                                to="/"
                                className={`login-link ${activeTab === "customer" ? "link-blue" : "link-green"}`}
                            >
                                Log in here
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
