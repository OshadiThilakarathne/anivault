import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/apiService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // checking if already logged in

    // On mount — check if token exists and is valid
    useEffect(() => {
        const token = localStorage.getItem("anivault_token");
        if (!token) {
            setLoading(false);
            return;
        }
        API.get("/auth/me")
            .then((res) => setUser(res.data))
            .catch(() => {
                localStorage.removeItem("anivault_token");
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const register = async (username, email, password) => {
        const res = await API.post("/auth/register", { username, email, password });
        localStorage.setItem("anivault_token", res.data.token);
        setUser(res.data.user);
    };

    const login = async (email, password) => {
        const res = await API.post("/auth/login", { email, password });
        localStorage.setItem("anivault_token", res.data.token);
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem("anivault_token");
        localStorage.removeItem("anivault_library");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
    return context;
}