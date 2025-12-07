import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setAuthenticated(!!user);
            setLoading(false);
        }
        checkUser();
    }, []);

    if (loading) return null;

    return authenticated ? children : <Navigate to="/" />;
}
