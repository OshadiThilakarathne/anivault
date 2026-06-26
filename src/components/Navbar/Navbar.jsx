import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    House, BookOpen, BarChart2,
    Upload, Sparkles, LogOut, Menu, X, Search
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AvatarPicker from "../AvatarPicker/AvatarPicker";
import axios from "axios";
import "./Navbar.css";

const navItems = [
    { to: "/", label: "Home", icon: House },
    { to: "/library", label: "Library", icon: BookOpen },
    { to: "/stats", label: "Stats", icon: BarChart2 },
    { to: "/bulk-import", label: "Import", icon: Upload },
    { to: "/recommendations", label: "For You", icon: Sparkles },
];

export default function Navbar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [showPicker, setShowPicker] = useState(false);
    const [avatars, setAvatars] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [query, setQuery] = useState("");
    const searchRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        axios.get("https://api.jikan.moe/v4/top/characters?limit=24")
            .then((res) => {
                setAvatars(res.data.data.map((c) => ({
                    id: c.mal_id,
                    name: c.name,
                    url: c.images?.jpg?.image_url || "",
                })));
            })
            .catch(() => { });
    }, [user]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setQuery("");
        setMenuOpen(false);
    };

    return (
        <>
            <header className="topnav">
                <div className="topnav__inner">

                    {/* ── Brand ── */}
                    <NavLink to="/" className="topnav__brand">
                        <span className="topnav__brand-icon">鬼</span>
                        <span className="topnav__brand-text">AniVault</span>
                    </NavLink>

                    {/* ── Desktop nav links ── */}
                    <nav className="topnav__links">
                        {navItems.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                className={({ isActive }) =>
                                    `topnav__link ${isActive ? "topnav__link--active" : ""}`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* ── Search bar ── */}
                    <form className="topnav__search" onSubmit={handleSearch}>
                        <Search size={15} className="topnav__search-icon" />
                        <input
                            ref={searchRef}
                            type="text"
                            className="topnav__search-input"
                            placeholder="Search anime..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </form>

                    {/* ── Right side ── */}
                    <div className="topnav__right">
                        {user && (
                            <>
                                <button
                                    className="topnav__avatar-btn"
                                    onClick={() => setShowPicker(true)}
                                    title="Change avatar"
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.username}
                                            className="topnav__avatar"
                                        />
                                    ) : (
                                        <div className="topnav__avatar topnav__avatar--placeholder">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </button>
                                <span className="topnav__username">{user.username}</span>
                                <button
                                    className="topnav__logout"
                                    onClick={logout}
                                    title="Logout"
                                >
                                    <LogOut size={16} />
                                </button>
                            </>
                        )}

                        <button
                            className="topnav__hamburger"
                            onClick={() => setMenuOpen((o) => !o)}
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* ── Mobile menu ── */}
                {menuOpen && (
                    <div className="topnav__mobile-menu">
                        <form className="topnav__mobile-search" onSubmit={handleSearch}>
                            <Search size={15} />
                            <input
                                type="text"
                                placeholder="Search anime..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="topnav__mobile-search-input"
                            />
                        </form>
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                className={({ isActive }) =>
                                    `topnav__mobile-link ${isActive ? "topnav__mobile-link--active" : ""}`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                <Icon size={18} />
                                {label}
                            </NavLink>
                        ))}
                        {user && (
                            <button
                                className="topnav__mobile-logout"
                                onClick={() => { logout(); setMenuOpen(false); }}
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        )}
                    </div>
                )}
            </header>

            {showPicker && (
                <AvatarPicker
                    avatars={avatars}
                    onClose={() => setShowPicker(false)}
                />
            )}
        </>
    );
}