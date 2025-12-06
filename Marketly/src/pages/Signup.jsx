import React, { useState } from "react";
import "./signup.css";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Link } from "react-router-dom";

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

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePassword = (password) => {
        if (password.length < 8) return false
        if (!/[A-Z]/.test(password)) return false
        if (password.toLowerCase().includes("password")) return false
        return true
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const newErrors = {}

        // Validate all fields
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email (e.g., email@example.com)"
        }
        if (!formData.password.trim()) {
            newErrors.password = "Password is required"
        } else if (!validatePassword(formData.password)) {
            newErrors.password =
                'Password must be at least 8 characters, contain one uppercase letter, and not include "password"'
        }
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }
        if (activeTab === "seller" && !formData.businessName.trim()) {
            newErrors.businessName = "Business name is required"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Placeholder database registration
        const userData = {
            type: activeTab,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            ...(activeTab === "seller" && { businessName: formData.businessName }),
        }

        console.log("Registering user:", userData)
        // TODO: Send to database

        // Redirect to home
        navigate("/")
    }


    return (
        <>
            <Header />
            <main className="main">
                <div className="grid-layout">

                    <div className="signup">
                        <h2 className="signup-title">Sign Up for Marketly.</h2>
                        <p className="signup-subtext">Don't hesitate to shop our catalog or start building your business!</p>
                    </div>


                    <div className="signup-card">
                        <h2 className="card-title">Sign Up</h2>

                        <div className="tab-row">
                            <button
                                className={`tab-btn ` + (activeTab === "customer" ? "tab-active-customer" : "tab-inactive")}
                                onClick={() => { setActiveTab("customer"); setErrors({}) }}
                            >
                                Customer
                            </button>

                            <button
                                className={`tab-btn ` + (activeTab === "seller" ? "tab-active-seller" : "tab-inactive")}
                                onClick={() => { setActiveTab("seller"); setErrors({}) }}
                            >
                                Seller
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="form">

                            <div className="form-row">
                                <div className="sign-form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={errors.firstName ? "error" : ""}
                                    />
                                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                                </div>

                                <div className="sign-form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={errors.lastName ? "error" : ""}
                                    />
                                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
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
                                    placeholder="email@example.com"
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

                            <button type="submit" className={`register-button ${activeTab}`}>
                                Register
                            </button>
                        </form>

                        <p className="login-text">
                            Already have an account? {" "}
                            <Link
                                to="/"
                                className={`login-link ` +
                                    (activeTab === "customer" ? "link-blue" : "link-green")}
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