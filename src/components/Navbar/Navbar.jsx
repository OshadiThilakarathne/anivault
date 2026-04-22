import { NavLink } from 'react-router-dom'
import { House, BookOpen, Search, BarChart2 } from 'lucide-react'
import './Navbar.css'

const navItems = [
    { to: '/', icon: House, label: 'Home' },
    { to: '/library', icon: BookOpen, label: 'Library' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/stats', icon: BarChart2, label: 'Stats' },
]

function Navbar() {
    return (
        <>
            {/* Sidebar — desktop */}
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
                    <p>AniVault v1.0</p>
                </div>
            </aside>

            {/* Bottom bar — mobile */}
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
        </>
    )
}

export default Navbar