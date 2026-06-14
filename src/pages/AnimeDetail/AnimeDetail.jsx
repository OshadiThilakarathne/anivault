import { useParams, useNavigate } from "react-router-dom";
import { useAnime } from "../../hooks/useAnime";
import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Calendar, Tv, Building2, Plus } from "lucide-react";
import { getAnimeById } from "../../services/jikanService";
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
    const { getAnimeById: getFromLibrary, updateAnime, addAnime, isInLibrary } = useAnime();

    const malId = Number(id);
    const libraryAnime = getFromLibrary(malId);
    const inLibrary = isInLibrary(malId);

    // Remote data fetched from Jikan (used when not in library)
    const [remoteAnime, setRemoteAnime] = useState(null);
    const [loading, setLoading] = useState(!libraryAnime);
    const [error, setError] = useState(null);

    const anime = libraryAnime || remoteAnime;

    useEffect(() => {
        if (!libraryAnime) {
            setLoading(true);
            getAnimeById(malId)
                .then((data) => {
                    const d = data.data;
                    setRemoteAnime({
                        malId: d.mal_id,
                        title: d.title,
                        titleEnglish: d.title_english || d.title,
                        coverImage: d.images?.jpg?.large_image_url || "",
                        synopsis: d.synopsis || "",
                        genres: d.genres?.map((g) => g.name) || [],
                        episodes: d.episodes || null,
                        studio: d.studios?.[0]?.name || "Unknown",
                        year: d.year || null,
                    });
                })
                .catch(() => setError("Failed to load anime details."))
                .finally(() => setLoading(false));
        }
    }, [malId, libraryAnime]);

    const [form, setForm] = useState({
        status: libraryAnime?.status ?? "plan_to_watch",
        userRating: libraryAnime?.userRating ?? null,
        review: libraryAnime?.review ?? "",
        episodeProgress: libraryAnime?.episodeProgress ?? 0,
        startDate: libraryAnime?.startDate ?? "",
        finishDate: libraryAnime?.finishDate ?? "",
    });

    const [saved, setSaved] = useState(false);

    // Sync form if library entry loads after remote
    useEffect(() => {
        if (libraryAnime) {
            setForm({
                status: libraryAnime.status ?? "plan_to_watch",
                userRating: libraryAnime.userRating ?? null,
                review: libraryAnime.review ?? "",
                episodeProgress: libraryAnime.episodeProgress ?? 0,
                startDate: libraryAnime.startDate ?? "",
                finishDate: libraryAnime.finishDate ?? "",
            });
        }
    }, [libraryAnime]);

    if (loading) {
        return (
            <div className="detail-page detail-page--not-found">
                <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
            </div>
        );
    }

    if (error || !anime) {
        return (
            <div className="detail-page detail-page--not-found">
                <p>{error || "Anime not found."}</p>
                <button onClick={() => navigate(-1)}>← Go back</button>
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

    const handleAddToLibrary = () => {
        const isCompleted = form.status === "completed";
        addAnime({
            ...anime,
            status: form.status,
            userRating: form.userRating ? Number(form.userRating) : null,
            episodeProgress: isCompleted ? (anime.episodes || 0) : 0,
            review: form.review,
            startDate: form.startDate,
            finishDate: form.finishDate,
        });
    };

    return (
        <div className="detail-page">
            <button className="detail-page__back" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="detail-page__layout">

                {/* ── Left sidebar ── */}
                <div className="detail-page__sidebar">
                    <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="detail-page__cover"
                    />

                    {/* Add to library button if not in library */}
                    {!inLibrary && (
                        <button className="detail-page__add-btn" onClick={handleAddToLibrary}>
                            <Plus size={15} /> Add to Library
                        </button>
                    )}

                    <div className="detail-page__quick-meta">
                        <MetaRow icon={<Tv size={14} />} label="Episodes" value={anime.episodes ?? "Unknown"} />
                        <MetaRow icon={<Building2 size={14} />} label="Studio" value={anime.studio || "Unknown"} />
                        <MetaRow icon={<Calendar size={14} />} label="Year" value={anime.year ?? "Unknown"} />
                        <MetaRow icon={<BookOpen size={14} />} label="Genres" value={anime.genres?.join(", ") || "—"} />
                    </div>
                </div>

                {/* ── Right main ── */}
                <div className="detail-page__main">
                    <h1 className="detail-page__title">{anime.title}</h1>
                    {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                        <p className="detail-page__title-en">{anime.titleEnglish}</p>
                    )}
                    {anime.synopsis && (
                        <p className="detail-page__synopsis">{anime.synopsis}</p>
                    )}

                    <div className="detail-page__divider" />

                    {/* Show form only if in library */}
                    {inLibrary ? (
                        <>
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

                            <div className="detail-page__field">
                                <label className="detail-page__label">Your Rating</label>
                                <StarRating
                                    value={form.userRating}
                                    onChange={(val) => setForm((f) => ({ ...f, userRating: val }))}
                                />
                            </div>

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

                            <button
                                className={`detail-page__save-btn ${saved ? "detail-page__save-btn--saved" : ""}`}
                                onClick={handleSave}
                            >
                                {saved ? "✓ Saved!" : "Save Changes"}
                            </button>
                        </>
                    ) : (
                        <p className="detail-page__not-in-library">
                            Add this anime to your library to track your progress, rating, and notes.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

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
    return (
        <select
            className="detail-page__rating-select"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        >
            <option value="">Select rating</option>
            <option value="10">10 — Masterpiece</option>
            <option value="9">9 — Great</option>
            <option value="8">8 — Very Good</option>
            <option value="7">7 — Good</option>
            <option value="6">6 — Fine</option>
            <option value="5">5 — Average</option>
            <option value="4">4 — Bad</option>
            <option value="3">3 — Poor</option>
            <option value="2">2 — Terrible</option>
            <option value="1">1 — Awful</option>
        </select>
    );
}