import { useState } from "react";
import { useAnime } from "../../hooks/useAnime";
import { Trash2, Star } from "lucide-react";
import "./Library.css";

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "watching", label: "Watching" },
    { key: "completed", label: "Completed" },
    { key: "plan_to_watch", label: "Plan to Watch" },
    { key: "on_hold", label: "On Hold" },
    { key: "dropped", label: "Dropped" },
];

export default function Library() {
    const { library, removeAnime, stats } = useAnime();
    const [activeTab, setActiveTab] = useState("all");

    const filtered =
        activeTab === "all"
            ? library
            : library.filter((a) => a.status === activeTab);

    return (
        <div className="library-page">

            {/* ── Header ── */}
            <div className="library-page__header">
                <div>
                    <h1 className="library-page__title">My Library</h1>
                    <p className="library-page__subtitle">
                        <span className="library-page__unique-count">{stats.totalUnique}</span> unique titles tracked
                    </p>
                </div>
            </div>

            {/* ── Status Tabs ── */}
            <div className="library-page__tabs">
                {STATUS_TABS.map((tab) => {
                    const count =
                        tab.key === "all"
                            ? library.length
                            : library.filter((a) => a.status === tab.key).length;

                    return (
                        <button
                            key={tab.key}
                            className={`library-page__tab ${activeTab === tab.key ? "library-page__tab--active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className="library-page__tab-count">{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Empty State ── */}
            {filtered.length === 0 && (
                <div className="library-page__empty">
                    <p className="library-page__empty-icon">鬼</p>
                    <p className="library-page__empty-text">
                        {activeTab === "all"
                            ? "Your library is empty. Search for anime to add!"
                            : `Nothing in "${STATUS_TABS.find(t => t.key === activeTab)?.label}" yet.`}
                    </p>
                </div>
            )}

            {/* ── Grid ── */}
            <div className="library-page__grid">
                {filtered.map((anime) => (
                    <LibraryCard key={anime.malId} anime={anime} onRemove={removeAnime} />
                ))}
            </div>

        </div>
    );
}

// ── Library Card ─────────────────────────────────────────────────────────────
function LibraryCard({ anime, onRemove }) {
    const STATUS_LABELS = {
        watching: { label: "Watching", color: "#64deb4" },
        completed: { label: "Completed", color: "#a78bfa" },
        plan_to_watch: { label: "Plan to Watch", color: "#60a5fa" },
        on_hold: { label: "On Hold", color: "#fbbf24" },
        dropped: { label: "Dropped", color: "#f87171" },
    };

    const statusInfo = STATUS_LABELS[anime.status] || { label: anime.status, color: "#6b7280" };

    return (
        <div className="library-card">
            <img
                src={anime.coverImage}
                alt={anime.title}
                className="library-card__cover"
            />

            <div className="library-card__info">
                <h3 className="library-card__title">{anime.title}</h3>

                <span
                    className="library-card__status"
                    style={{ color: statusInfo.color, borderColor: statusInfo.color + "40" }}
                >
                    {statusInfo.label}
                </span>

                <div className="library-card__meta">
                    {anime.userRating && (
                        <span className="library-card__rating">
                            <Star size={12} fill="#fbbf24" color="#fbbf24" />
                            {anime.userRating}/10
                        </span>
                    )}
                    {anime.episodeProgress > 0 && (
                        <span className="library-card__eps">
                            {anime.episodeProgress}{anime.episodes ? `/${anime.episodes}` : ""} eps
                        </span>
                    )}
                </div>

                <div className="library-card__genres">
                    {anime.genres?.slice(0, 2).map((g) => (
                        <span key={g} className="library-card__genre-tag">{g}</span>
                    ))}
                </div>
            </div>

            <button
                className="library-card__remove"
                onClick={() => onRemove(anime.malId)}
                title="Remove from library"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}