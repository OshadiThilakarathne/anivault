import { useParams, useNavigate } from "react-router-dom";
import { useAnime } from "../../hooks/useAnime";
import { useState } from "react";
import { ArrowLeft, Star, BookOpen, Calendar, Tv, Building2 } from "lucide-react";
import "./AnimeDetail.css";

const STATUS_OPTIONS = [
    { key: "watching", label: "Watching" },
    { key: "completed", label: "Completed" },
    { key: "plan_to_watch", label: "Plan to Watch" },
    { key: "on_hold", label: "On Hold" },
    { key: "dropped", label: "Dropped" },
];

export default function AnimeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getAnimeById, updateAnime } = useAnime();

    const anime = getAnimeById(Number(id));

    // Local state mirrors the saved data — only saved when user clicks Save
    const [form, setForm] = useState({
        status: anime?.status ?? "plan_to_watch",
        userRating: anime?.userRating ?? null,
        review: anime?.review ?? "",
        episodeProgress: anime?.episodeProgress ?? 0,
        startDate: anime?.startDate ?? "",
        finishDate: anime?.finishDate ?? "",
    });

    const [saved, setSaved] = useState(false);

    if (!anime) {
        return (
            <div className="detail-page detail-page--not-found">
                <p>Anime not found in your library.</p>
                <button onClick={() => navigate("/library")}>← Back to Library</button>
            </div>
        );
    }

    const handleSave = () => {
        updateAnime(anime.malId, {
            ...form,
            userRating: form.userRating ? Number(form.userRating) : null,
            episodeProgress: Number(form.episodeProgress),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="detail-page">

            {/* ── Back button ── */}
            <button className="detail-page__back" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="detail-page__layout">

                {/* ── Left: Cover + quick meta ── */}
                <div className="detail-page__sidebar">
                    <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="detail-page__cover"
                    />
                    <div className="detail-page__quick-meta">
                        <MetaRow icon={<Tv size={14} />} label="Episodes" value={anime.episodes ?? "Unknown"} />
                        <MetaRow icon={<Building2 size={14} />} label="Studio" value={anime.studio || "Unknown"} />
                        <MetaRow icon={<Calendar size={14} />} label="Year" value={anime.year ?? "Unknown"} />
                        <MetaRow
                            icon={<BookOpen size={14} />}
                            label="Genres"
                            value={anime.genres?.join(", ") || "—"}
                        />
                    </div>
                </div>

                {/* ── Right: Info + form ── */}
                <div className="detail-page__main">
                    <h1 className="detail-page__title">{anime.title}</h1>
                    {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                        <p className="detail-page__title-en">{anime.titleEnglish}</p>
                    )}

                    {anime.synopsis && (
                        <p className="detail-page__synopsis">{anime.synopsis}</p>
                    )}

                    <div className="detail-page__divider" />

                    {/* Status */}
                    <div className="detail-page__field">
                        <label className="detail-page__label">Status</label>
                        <div className="detail-page__status-options">
                            {STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt.key}
                                    className={`detail-page__status-btn ${form.status === opt.key ? "detail-page__status-btn--active" : ""}`}
                                    onClick={() => {
                                        const isCompleted = opt.key === "completed";
                                        setForm((f) => ({
                                            ...f,
                                            status: opt.key,
                                            episodeProgress: isCompleted
                                                ? (anime.episodes || f.episodeProgress)
                                                : opt.key === "watching" || opt.key === "plan_to_watch"
                                                    ? 0
                                                    : f.episodeProgress,
                                        }));
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="detail-page__field">
                        <label className="detail-page__label">Your Rating</label>
                        <StarRating
                            value={form.userRating}
                            onChange={(val) => setForm((f) => ({ ...f, userRating: val }))}
                        />
                    </div>

                    {/* Episode Progress */}
                    <div className="detail-page__field">
                        <label className="detail-page__label">
                            Episode Progress
                            {anime.episodes && (
                                <span className="detail-page__label-hint"> / {anime.episodes} total</span>
                            )}
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={anime.episodes || 9999}
                            className="detail-page__input"
                            value={form.episodeProgress}
                            onChange={(e) => setForm((f) => ({ ...f, episodeProgress: e.target.value }))}
                        />
                    </div>

                    {/* Dates */}
                    <div className="detail-page__dates">
                        <div className="detail-page__field">
                            <label className="detail-page__label">Start Date</label>
                            <input
                                type="date"
                                className="detail-page__input"
                                value={form.startDate}
                                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="detail-page__field">
                            <label className="detail-page__label">Finish Date</label>
                            <input
                                type="date"
                                className="detail-page__input"
                                value={form.finishDate}
                                onChange={(e) => setForm((f) => ({ ...f, finishDate: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Review */}
                    <div className="detail-page__field">
                        <label className="detail-page__label">Review / Notes</label>
                        <textarea
                            className="detail-page__textarea"
                            placeholder="What did you think? Any thoughts, favourite moments..."
                            rows={4}
                            value={form.review}
                            onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
                        />
                    </div>

                    {/* Save */}
                    <button
                        className={`detail-page__save-btn ${saved ? "detail-page__save-btn--saved" : ""}`}
                        onClick={handleSave}
                    >
                        {saved ? "✓ Saved!" : "Save Changes"}
                    </button>

                </div>
            </div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaRow({ icon, label, value }) {
    return (
        <div className="meta-row">
            <span className="meta-row__icon">{icon}</span>
            <span className="meta-row__label">{label}</span>
            <span className="meta-row__value">{value}</span>
        </div>
    );
}

function StarRating({ value, onChange }) {
    const [hovered, setHovered] = useState(null);
    const display = hovered ?? value ?? 0;

    return (
        <div className="star-rating">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                <button
                    key={star}
                    className={`star-rating__star ${display >= star ? "star-rating__star--filled" : ""}`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onChange(star === value ? null : star)}
                    title={`${star}/10`}
                >
                    <Star size={20} />
                </button>
            ))}
            {value && (
                <span className="star-rating__value">{value}/10</span>
            )}
        </div>
    );
}