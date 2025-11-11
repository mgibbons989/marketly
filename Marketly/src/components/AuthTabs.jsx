import React, { useState } from 'react'

const ACCENT = '#800020' // burgundy/maroon

export default function AuthTabs() {
    const [tab, setTab] = useState('customer') // 'customer' | 'seller'
    const [mode, setMode] = useState('login')  // 'login' | 'register'

    return (
        <div className="card">
            <div className="tabs" role="tablist" aria-label="User type">
                <button
                    role="tab"
                    aria-selected={tab === 'customer'}
                    className={`tab ${tab === 'customer' ? 'active' : ''}`}
                    onClick={() => setTab('customer')}
                >
                    Customer
                </button>
                <button
                    role="tab"
                    aria-selected={tab === 'seller'}
                    className={`tab ${tab === 'seller' ? 'active' : ''}`}
                    onClick={() => setTab('seller')}
                >
                    Seller
                </button>
            </div>

            <div className="seg">
                <div className="seg-controls" role="group" aria-label="Auth mode">
                    <button
                        className={`seg-btn ${mode === 'login' ? 'on' : ''}`}
                        onClick={() => setMode('login')}
                    >
                        Log In
                    </button>
                    <button
                        className={`seg-btn ${mode === 'register' ? 'on' : ''}`}
                        onClick={() => setMode('register')}
                    >
                        Register
                    </button>
                </div>
            </div>

            {mode === 'login' ? (
                <LoginForm userType={tab} />
            ) : (
                <RegisterForm userType={tab} />
            )}
        </div>
    )
}

function LoginForm({ userType }) {
    return (
        <form className="form" onSubmit={(e) => e.preventDefault()}>
            <h2 className="formTitle">
                {userType === 'customer' ? 'Customer Log In' : 'Seller Log In'}
            </h2>

            <label className="label">
                Email
                <input
                    className="input"
                    type="email"
                    placeholder="you@soandso.com"
                    required
                />
            </label>

            <label className="label">
                Password
                <input
                    className="input"
                    type="password"
                    placeholder="Type password here"
                    required
                />
            </label>

            {userType === 'seller' && (
                <div className="hint">Tip: Use your seller account email.</div>
            )}

            <button className="primaryBtn" type="submit">Log In</button>

            <div className="aux">
                <a href="#" className="link">Forgot password?</a>
            </div>
        </form>
    )
}

function RegisterForm({ userType }) {
    return (
        <form className="form" onSubmit={(e) => e.preventDefault()}>
            <h2 className="formTitle">
                {userType === 'customer' ? 'Create Customer Account' : 'Create Seller Account'}
            </h2>

            <div className="grid">
                <label className="label">
                    First Name
                    <input className="input" type="text" placeholder="First name" required />
                </label>
                <label className="label">
                    Last Name
                    <input className="input" type="text" placeholder="Last name" required />
                </label>
            </div>

            <label className="label">
                Email
                <input className="input" type="email" placeholder="you@example.com" required />
            </label>

            {userType === 'seller' && (
                <label className="label">
                    Business Name
                    <input className="input" type="text" placeholder="Your shop LLC" required />
                </label>
            )}

            <label className="label">
                Password
                <input className="input" type="password" placeholder="Create a password" required />
            </label>

            <label className="label">
                Confirm Password
                <input className="input" type="password" placeholder="Confirm password" required />
            </label>

            <label className="check">
                <input type="checkbox" required /> I agree to the Terms
            </label>

            <button className="primaryBtn" type="submit">Create Account</button>
        </form>
    )
}
