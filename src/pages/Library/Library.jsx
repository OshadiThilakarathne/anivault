import { useState } from "react";
import { useAnime } from "../../hooks/useAnime";
import { useNavigate } from "react-router-dom";
import { Trash2, Star, ChevronDown, ChevronUp, Layers, X, Check } from "lucide-react";
import "./Library.css";

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "watching", label: "Watching" },
    { key: "completed", label: "Completed" },
    { key: "plan_to_watch", label: "Plan to Watch" },
    { key: "on_hold", label: "On Hold" },
    { key: "dropped", label: "Dropped" },
];

const STATUS_LABELS = {
    watching: { label: "Watching", color: "#64deb4" },
    completed: { label: "Completed", color: "#a78bfa" },
    plan_to_watch: { label: "Plan to Watch", color: "#60a5fa" },
    on_hold: { label: "On Hold", color: "#fbbf24" },
    dropped: { label: "Dropped", color: "#f87171" },
};

export default function Library() {
    const { library, removeAnime, removeGroup, createGroup, stats } = useAnime();
    const [activeTab, setActiveTab] = useState("all");
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState([]);
    const [groupModal, setGroupModal] = useState(false);
    const [groupName, setGroupName] = useState("");

    const filtered =
        activeTab === "all"
            ? library
            : library.filter((a) => a.status === activeTab);

    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleCreateGroup = () => {
        if (!groupName.trim() || selected.length < 2) return;
        createGroup(groupName.trim(), selected);
        setGroupName("");
        setSelected([]);
        setSelectMode(false);
        setGroupModal(false);
    };

    const exitSelectMode = () => {
        setSelectMode(false);
        setSelected([]);
    };

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

                {/* Select mode toggle */}
                {!selectMode ? (
                    <button
                        className="library-page__select-btn"
                        onClick={() => setSelectMode(true)}
                    >
                        <Layers size={15} /> Group Seasons
                    </button>
                ) : (
                    <div className="library-page__select-actions">
                        <span className="library-page__select-hint">
                            {selected.length} selected
                        </span>
                        <button
                            className="library-page__group-btn"
                            disabled={selected.length < 2}
                            onClick={() => setGroupModal(true)}
                        >
                            <Layers size={14} /> Group
                        </button>
                        <button className="library-page__cancel-btn" onClick={exitSelectMode}>
                            <X size={14} /> Cancel
                        </button>
                    </div>
                )}
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
                            : `Nothing in "${STATUS_TABS.find((t) => t.key === activeTab)?.label}" yet.`}
                    </p>
                </div>
            )}

            {/* ── Grid ── */}
            <div className="library-page__grid">
                {filtered.map((item) =>
                    item.isGroup ? (
                        <GroupCard
                            key={item.id}
                            group={item}
                            onRemoveGroup={removeGroup}
                            selectMode={selectMode}
                        />
                    ) : (
                        <LibraryCard
                            key={item.malId}
                            anime={item}
                            onRemove={removeAnime}
                            selectMode={selectMode}
                            selected={selected.includes(item.malId)}
                            onToggleSelect={() => toggleSelect(item.malId)}
                        />
                    )
                )}
            </div>

            {/* ── Group Name Modal ── */}
            {groupModal && (
                <div className="library-modal__backdrop" onClick={() => setGroupModal(false)}>
                    <div className="library-modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="library-modal__title">Name this group</h2>
                        <p className="library-modal__sub">
                            Grouping {selected.length} titles into one entry
                        </p>
                        <input
                            className="library-modal__input"
                            placeholder="e.g. Attack on Titan"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                            autoFocus
                        />
                        <div className="library-modal__actions">
                            <button
                                className="library-modal__cancel"
                                onClick={() => setGroupModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="library-modal__confirm"
                                onClick={handleCreateGroup}
                                disabled={!groupName.trim()}
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Library Card ──────────────────────────────────────────────────────────────
function LibraryCard({ anime, onRemove, selectMode, selected, onToggleSelect }) {
    const navigate = useNavigate();
    const statusInfo = STATUS_LABELS[anime.status] || { label: anime.status, color: "#6b7280" };

    return (
        <div
            className={`library-card ${selectMode ? "library-card--selectable" : ""} ${selected ? "library-card--selected" : ""}`}
            onClick={selectMode ? onToggleSelect : undefined}
        >
            {/* Select checkbox */}
            {selectMode && (
                <div className={`library-card__checkbox ${selected ? "library-card__checkbox--checked" : ""}`}>
                    {selected && <Check size={12} />}
                </div>
            )}

            <div
                className="library-card__clickable"
                onClick={!selectMode ? () => navigate(`/anime/${anime.malId}`) : undefined}
            >
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
                                {anime.episodeProgress}
                                {anime.episodes ? `/${anime.episodes}` : ""} eps
                            </span>
                        )}
                    </div>
                    <div className="library-card__genres">
                        {anime.genres?.slice(0, 2).map((g) => (
                            <span key={g} className="library-card__genre-tag">{g}</span>
                        ))}
                    </div>
                </div>
            </div>

            {!selectMode && (
                <button
                    className="library-card__remove"
                    onClick={(e) => { e.stopPropagation(); onRemove(anime.malId); }}
                    title="Remove from library"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
}

// ── Group Card ────────────────────────────────────────────────────────────────
function GroupCard({ group, onRemoveGroup, selectMode }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const statusInfo = STATUS_LABELS[group.status] || { label: group.status, color: "#6b7280" };

    const totalEpisodes = group.seasons.reduce(
        (sum, s) => sum + (s.episodeProgress || 0), 0
    );

    return (
        <div className={`library-card library-card--group ${expanded ? "library-card--expanded" : ""}`}>

            {/* ── Group header ── */}
            <div className="library-card__clickable" onClick={() => !selectMode && setExpanded((e) => !e)}>
                <div className="library-card__cover-wrapper">
                    <img
                        src={group.coverImage}
                        alt={group.title}
                        className="library-card__cover"
                    />
                    <div className="library-card__group-badge">
                        <Layers size={10} />
                        {group.seasons.length}
                    </div>
                </div>
                <div className="library-card__info">
                    <h3 className="library-card__title">{group.title}</h3>
                    <span
                        className="library-card__status"
                        style={{ color: statusInfo.color, borderColor: statusInfo.color + "40" }}
                    >
                        {statusInfo.label}
                    </span>
                    <div className="library-card__meta">
                        {group.userRating && (
                            <span className="library-card__rating">
                                <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                {group.userRating}/10
                            </span>
                        )}
                        <span className="library-card__eps">{totalEpisodes} eps</span>
                    </div>
                    <div className="library-card__genres">
                        {group.genres?.slice(0, 2).map((g) => (
                            <span key={g} className="library-card__genre-tag">{g}</span>
                        ))}
                    </div>
                    <div className="library-card__expand-hint">
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>{expanded ? "Hide" : "Show"} {group.seasons.length} seasons</span>
                    </div>
                </div>
            </div>

            {/* ── Expanded seasons list ── */}
            {expanded && (
                <div className="library-card__seasons">
                    {group.seasons.map((season) => (
                        <div
                            key={season.malId}
                            className="season-row"
                            onClick={() => navigate(`/anime/${season.malId}`)}
                        >
                            <img
                                src={season.coverImage}
                                alt={season.title}
                                className="season-row__cover"
                            />
                            <div className="season-row__info">
                                <p className="season-row__title">{season.title}</p>
                                <p className="season-row__meta">
                                    {season.episodeProgress || 0}
                                    {season.episodes ? `/${season.episodes}` : ""} eps
                                    {season.year ? ` · ${season.year}` : ""}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Remove group button ── */}
            {!selectMode && (
                <button
                    className="library-card__remove"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemoveGroup(group.id, true); // ungroup = true, restores seasons
                    }}
                    title="Ungroup"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
}