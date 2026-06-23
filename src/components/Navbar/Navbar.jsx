import { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom'
import { House, BookOpen, Search, BarChart2, Upload, LogOut } from 'lucide-react'
import { useAuth } from "../../context/AuthContext"
import AvatarPicker from "../AvatarPicker/AvatarPicker";
import axios from "axios";
import './Navbar.css'

const navItems = [
    { to: '/', icon: House, label: 'Home' },
    { to: '/library', icon: BookOpen, label: 'Library' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/stats', icon: BarChart2, label: 'Stats' },
    { to: '/bulk-import', icon: Upload, label: 'Import' },
]

function Navbar() {
    const { logout, user } = useAuth();
    const [showPicker, setShowPicker] = useState(false);
    const [avatars, setAvatars] = useState([]);

    // Pre-fetch avatars on mount so picker opens instantly
    useEffect(() => {
        if (!user) return;
        axios.get("https://api.jikan.moe/v4/top/characters?limit=24")
            .then((res) => {
                const chars = res.data.data.map((c) => ({
                    id: c.mal_id,
                    name: c.name,
                    url: c.images?.jpg?.image_url || "",
                }));
                setAvatars(chars);
            })
            .catch(() => { });
    }, [user]);

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span className="logo-icon">鬼</span>
                    <span className="logo-text">AniVault</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    {user && (
                        <div className="sidebar-user">
                            <button
                                className="sidebar-avatar-btn"
                                onClick={() => setShowPicker(true)}
                                title="Change avatar"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.username}
                                        className="sidebar-avatar"
                                    />
                                ) : (
                                    <div className="sidebar-avatar sidebar-avatar--placeholder">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>
                            <p className="sidebar-username">{user.username}</p>
                            <button className="sidebar-logout" onClick={logout} title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}
                    <p>AniVault v1.0</p>
                </div>
            </aside>

            <nav className="bottom-nav">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `bottom-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <Icon size={22} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {showPicker && (
                <AvatarPicker
                    avatars={avatars}
                    onClose={() => setShowPicker(false)}
                />
            )}
        </>
    )
}

export default Navbar