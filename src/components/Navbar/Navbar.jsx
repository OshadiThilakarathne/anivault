import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { House, BookOpen, BarChart2, Upload, Sparkles, LogOut, Menu, X, Search, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AvatarPicker from "../AvatarPicker/AvatarPicker";
import { searchAnime } from "../../services/jikanService";
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
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef(null);
    const suggestRef = useRef(null);
    const debounceRef = useRef(null);

    // Pre-fetch avatars
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

    // Live suggestions
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await searchAnime(query, 1);
                setSuggestions((data.data || []).slice(0, 6));
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            } finally {
                setSearching(false);
            }
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                searchRef.current && !searchRef.current.contains(e.target) &&
                suggestRef.current && !suggestRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
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

                    {/* ── Search bar with suggestions ── */}
                    <div className="topnav__search-wrapper">
                        <form
                            className="topnav__search"
                            onSubmit={handleSearch}
                            ref={searchRef}
                        >
                            <Search size={15} className="topnav__search-icon" />
                            <input
                                type="text"
                                className="topnav__search-input"
                                placeholder="Search anime..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            />
                            {searching && (
                                <Loader size={13} className="topnav__search-spinner" />
                            )}
                        </form>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="topnav__suggestions" ref={suggestRef}>
                                {suggestions.map((anime) => (
                                    <button
                                        key={anime.mal_id}
                                        className="topnav__suggestion-item"
                                        onClick={() => {
                                            navigate(`/anime/${anime.mal_id}`);
                                            setQuery("");
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <img
                                            src={anime.images?.jpg?.image_url || ""}
                                            alt={anime.title}
                                            className="topnav__suggestion-img"
                                        />
                                        <div className="topnav__suggestion-info">
                                            <p className="topnav__suggestion-title">{anime.title}</p>
                                            <p className="topnav__suggestion-meta">
                                                {anime.year || "—"} · {anime.episodes ? `${anime.episodes} eps` : "? eps"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                                <button
                                    className="topnav__suggestion-more"
                                    onClick={handleSearch}
                                >
                                    See all results for "{query}"
                                </button>
                            </div>
                        )}
                    </div>

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