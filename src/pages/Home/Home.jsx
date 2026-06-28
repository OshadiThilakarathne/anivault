import { useAnime } from "../../hooks/useAnime";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Star, BookOpen, Clock, TrendingUp, ChevronRight } from "lucide-react";
import "./Home.css";

const STATUS_LABELS = {
    watching: { label: "Watching", color: "#64deb4" },
    completed: { label: "Completed", color: "#a78bfa" },
    plan_to_watch: { label: "Plan to Watch", color: "#60a5fa" },
    on_hold: { label: "On Hold", color: "#fbbf24" },
    dropped: { label: "Dropped", color: "#f87171" },
};

export default function Home() {
    const { library, stats } = useAnime();
    const { user } = useAuth();
    const navigate = useNavigate();

    const recentlyAdded = [...library]
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .slice(0, 8);

    const continueWatching = library.filter(
        (a) => a.status === "watching" && !a.isGroup
    );

    const topRated = [...library]
        .filter((a) => a.userRating)
        .sort((a, b) => b.userRating - a.userRating)
        .slice(0, 6);

    const avgEpisodeMins = 24;
    const daysWatched = ((stats.totalEpisodes * avgEpisodeMins) / 60 / 24).toFixed(1);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="home">

            {/* ── Hero ── */}
            <div className="home__hero">
                <div className="home__hero-content">
                    <p className="home__greeting">{greeting()}, {user?.username} 👋</p>
                    <h1 className="home__hero-title">
                        Your Anime Vault
                    </h1>
                    <p className="home__hero-sub">
                        {stats.totalUnique} unique titles · {daysWatched} days watched · {stats.totalEpisodes.toLocaleString()} episodes
                    </p>
                    <div className="home__hero-actions">
                        <button className="home__hero-btn home__hero-btn--primary" onClick={() => navigate("/search")}>
                            Discover Anime
                        </button>
                        <button className="home__hero-btn home__hero-btn--secondary" onClick={() => navigate("/library")}>
                            My Library
                        </button>
                    </div>
                </div>

                {/* ── Mini stat pills ── */}
                <div className="home__hero-stats">
                    <div className="home__mini-stat">
                        <span className="home__mini-stat-value" style={{ color: "#a78bfa" }}>{stats.completed}</span>
                        <span className="home__mini-stat-label">Completed</span>
                    </div>
                    <div className="home__mini-stat">
                        <span className="home__mini-stat-value" style={{ color: "#64deb4" }}>{stats.watching}</span>
                        <span className="home__mini-stat-label">Watching</span>
                    </div>
                    <div className="home__mini-stat">
                        <span className="home__mini-stat-value" style={{ color: "#60a5fa" }}>{stats.planToWatch}</span>
                        <span className="home__mini-stat-label">Plan to Watch</span>
                    </div>
                    <div className="home__mini-stat">
                        <span className="home__mini-stat-value" style={{ color: "#fbbf24" }}>{stats.averageRating ?? "—"}</span>
                        <span className="home__mini-stat-label">Mean Score</span>
                    </div>
                </div>
            </div>

            {/* ── Continue Watching ── */}
            {continueWatching.length > 0 && (
                <section className="home__section">
                    <div className="home__section-header">
                        <div className="home__section-title-wrapper">
                            <Clock size={18} className="home__section-icon" style={{ color: "#64deb4" }} />
                            <h2 className="home__section-title">Continue Watching</h2>
                        </div>
                        <button className="home__see-all" onClick={() => navigate("/library?status=watching")}>
                            See all <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="home__continue-grid">
                        {continueWatching.map((anime) => (
                            <div
                                key={anime._id}
                                className="home__continue-card"
                                onClick={() => navigate(`/anime/${anime.malId}`)}
                            >
                                <img src={anime.coverImage} alt={anime.title} className="home__continue-cover" />
                                <div className="home__continue-info">
                                    <p className="home__continue-title">{anime.title}</p>
                                    <p className="home__continue-eps">
                                        {anime.episodeProgress || 0}
                                        {anime.episodes ? ` / ${anime.episodes} eps` : " eps watched"}
                                    </p>
                                    {anime.episodes && (
                                        <div className="home__continue-bar">
                                            <div
                                                className="home__continue-bar-fill"
                                                style={{ width: `${Math.min(((anime.episodeProgress || 0) / anime.episodes) * 100, 100)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Recently Added ── */}
            {recentlyAdded.length > 0 && (
                <section className="home__section">
                    <div className="home__section-header">
                        <div className="home__section-title-wrapper">
                            <BookOpen size={18} className="home__section-icon" style={{ color: "#a78bfa" }} />
                            <h2 className="home__section-title">Recently Added</h2>
                        </div>
                        <button className="home__see-all" onClick={() => navigate("/library")}>
                            See all <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="home__recent-grid">
                        {recentlyAdded.map((anime) => (
                            <div
                                key={anime._id}
                                className="home__recent-card"
                                onClick={() => navigate(`/anime/${anime.malId}`)}
                            >
                                <div className="home__recent-cover-wrapper">
                                    <img src={anime.coverImage} alt={anime.title} className="home__recent-cover" />
                                    <div className="home__recent-overlay">
                                        <span
                                            className="home__recent-status"
                                            style={{ color: STATUS_LABELS[anime.status]?.color }}
                                        >
                                            {STATUS_LABELS[anime.status]?.label}
                                        </span>
                                    </div>
                                </div>
                                <p className="home__recent-title">{anime.isGroup ? anime.title : anime.title}</p>
                                {anime.userRating && (
                                    <p className="home__recent-rating">
                                        <Star size={11} fill="#fbbf24" color="#fbbf24" />
                                        {anime.userRating}/10
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Top Rated ── */}
            {topRated.length > 0 && (
                <section className="home__section">
                    <div className="home__section-header">
                        <div className="home__section-title-wrapper">
                            <TrendingUp size={18} className="home__section-icon" style={{ color: "#fbbf24" }} />
                            <h2 className="home__section-title">Your Top Rated</h2>
                        </div>
                        <button className="home__see-all" onClick={() => navigate("/stats")}>
                            View stats <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="home__toprated-grid">
                        {topRated.map((anime, i) => (
                            <div
                                key={anime._id}
                                className="home__toprated-card"
                                onClick={() => navigate(`/anime/${anime.malId}`)}
                            >
                                <span className="home__toprated-rank">#{i + 1}</span>
                                <img src={anime.coverImage} alt={anime.title} className="home__toprated-cover" />
                                <div className="home__toprated-info">
                                    <p className="home__toprated-title">{anime.title}</p>
                                    <p className="home__toprated-rating">
                                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                        {anime.userRating}/10
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Empty state ── */}
            {library.length === 0 && (
                <div className="home__empty">
                    <p className="home__empty-icon">鬼</p>
                    <h2 className="home__empty-title">Your vault is empty</h2>
                    <p className="home__empty-sub">Start building your anime library</p>
                    <button className="home__hero-btn home__hero-btn--primary" onClick={() => navigate("/search")}>
                        Discover Anime
                    </button>
                </div>
            )}

        </div>
    );
}