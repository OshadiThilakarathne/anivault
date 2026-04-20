import { useAnime } from "../../hooks/useAnime";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Star, Tv, CheckCircle, Clock } from "lucide-react";
import "./Home.css";

export default function Home() {
    const { library, stats } = useAnime();
    const navigate = useNavigate();

    const recentlyAdded = [...library]
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .slice(0, 5);

    return (
        <div className="home-page">

            {/* ── Hero ── */}
            <div className="home-page__hero">
                <div>
                    <h1 className="home-page__title">
                        Welcome to <span className="home-page__brand">AniVault</span>
                    </h1>
                    <p className="home-page__subtitle">
                        You've tracked{" "}
                        <span className="home-page__accent">{stats.totalUnique}</span>{" "}
                        unique {stats.totalUnique === 1 ? "title" : "titles"} — not seasons, not arcs. Just anime.
                    </p>
                </div>
                <button
                    className="home-page__search-btn"
                    onClick={() => navigate("/search")}
                >
                    <Search size={16} />
                    Search Anime
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="home-page__stats">
                <StatCard
                    icon={<CheckCircle size={20} />}
                    label="Completed"
                    value={stats.completed}
                    color="mint"
                />
                <StatCard
                    icon={<Tv size={20} />}
                    label="Watching"
                    value={stats.watching}
                    color="lavender"
                />
                <StatCard
                    icon={<Clock size={20} />}
                    label="Plan to Watch"
                    value={stats.planToWatch}
                    color="blue"
                />
                <StatCard
                    icon={<BookOpen size={20} />}
                    label="Episodes Watched"
                    value={stats.totalEpisodes}
                    color="mint"
                />
                <StatCard
                    icon={<Star size={20} />}
                    label="Average Rating"
                    value={stats.averageRating ? `${stats.averageRating}/10` : "—"}
                    color="amber"
                />
            </div>

            {/* ── Recently Added ── */}
            {recentlyAdded.length > 0 && (
                <div className="home-page__section">
                    <div className="home-page__section-header">
                        <h2 className="home-page__section-title">Recently Added</h2>
                        <button
                            className="home-page__see-all"
                            onClick={() => navigate("/library")}
                        >
                            See all →
                        </button>
                    </div>

                    <div className="home-page__recent-grid">
                        {recentlyAdded.map((anime) => (
                            <RecentCard
                                key={anime.malId}
                                anime={anime}
                                onClick={() => navigate(`/anime/${anime.malId}`)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Empty state ── */}
            {library.length === 0 && (
                <div className="home-page__empty">
                    <p className="home-page__empty-icon">鬼</p>
                    <p className="home-page__empty-title">Your vault is empty</p>
                    <p className="home-page__empty-sub">
                        Search for anime and start building your library.
                    </p>
                    <button
                        className="home-page__empty-btn"
                        onClick={() => navigate("/search")}
                    >
                        <Search size={15} /> Find Anime
                    </button>
                </div>
            )}

        </div>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
    return (
        <div className={`stat-card stat-card--${color}`}>
            <div className="stat-card__icon">{icon}</div>
            <div className="stat-card__value">{value}</div>
            <div className="stat-card__label">{label}</div>
        </div>
    );
}

// ── Recent Card ───────────────────────────────────────────────────────────────
const STATUS_LABELS = {
    watching: { label: "Watching", color: "#64deb4" },
    completed: { label: "Completed", color: "#a78bfa" },
    plan_to_watch: { label: "Plan to Watch", color: "#60a5fa" },
    on_hold: { label: "On Hold", color: "#fbbf24" },
    dropped: { label: "Dropped", color: "#f87171" },
};

function RecentCard({ anime, onClick }) {
    const statusInfo = STATUS_LABELS[anime.status] || { label: anime.status, color: "#6b7280" };

    return (
        <div className="recent-card" onClick={onClick}>
            <img
                src={anime.coverImage}
                alt={anime.title}
                className="recent-card__cover"
            />
            <div className="recent-card__info">
                <h3 className="recent-card__title">{anime.title}</h3>
                <span
                    className="recent-card__status"
                    style={{ color: statusInfo.color }}
                >
                    {statusInfo.label}
                </span>
                {anime.userRating && (
                    <span className="recent-card__rating">
                        <Star size={11} fill="#fbbf24" color="#fbbf24" />
                        {anime.userRating}/10
                    </span>
                )}
            </div>
        </div>
    );
}