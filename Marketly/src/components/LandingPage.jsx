import React from 'react'
import AuthTabs from './components/AuthTabs.jsx'

export default function App() {
    return (
        <div className="page">
            <div className="hero">
                <div className="badge">Marketly</div>
                <h1 className="headline">Welcome to Marketly</h1>
                <p className="subtext">
                    Your modern marketplace for unique products and trusted sellers.
                </p>
                <ul className="bullets">
                    <li>Discover curated catalogs</li>
                    <li>Secure checkout & order tracking</li>
                    <li>Tools for sellers to grow faster</li>
                </ul>
            </div>

            <div className="formWrap">
                <AuthTabs />
                <p className="footnote">
                    By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
                </p>
            </div>
        </div>
    )
}


