import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (error || !token) {
            navigate("/login?error=google_failed");
            return;
        }

        localStorage.setItem("anivault_token", token);
        // Reload so AuthContext picks up the new token
        window.location.href = "/";
    }, []);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "var(--color-bg)",
            color: "var(--color-text-muted)"
        }}>
            <p>Signing you in...</p>
        </div>
    );
}