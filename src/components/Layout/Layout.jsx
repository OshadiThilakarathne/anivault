import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import './Layout.css'

function Layout() {
    return (
        <div className="app-layout">
            <Navbar />
            <div className="main-wrapper">
                <main className="main-content">
                    <Outlet />
                </main>
                <footer className="footer">
                    <div className="footer__inner">
                        <div className="footer__brand">
                            <span className="footer__logo-icon">鬼</span>
                            <span className="footer__logo-text">AniVault</span>
                        </div>
                        <p className="footer__copy">
                            © {new Date().getFullYear()} AniVault. Anime data from{" "}
                            <a href="https://myanimelist.net" target="_blank" rel="noreferrer" className="footer__link">
                                MyAnimeList
                            </a>{" "}
                            via{" "}
                            <a href="https://jikan.moe" target="_blank" rel="noreferrer" className="footer__link">
                                Jikan API
                            </a>.
                        </p>
                        <div className="footer__links">
                            <a href="https://github.com/OshadiThilakarathne/anivault" target="_blank" rel="noreferrer" className="footer__link">
                                GitHub
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Layout