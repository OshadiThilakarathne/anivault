import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAnime } from "../../hooks/useAnime";
import { Plus, Check, ChevronDown, ChevronLeft, Layers } from "lucide-react";
import "./AnimeCard.css";

const STATUS_OPTIONS = [
    { key: "watching", label: "Watching" },
    { key: "completed", label: "Completed" },
    { key: "plan_to_watch", label: "Plan to Watch" },
    { key: "on_hold", label: "On Hold" },
    { key: "dropped", label: "Dropped" },
];

export default function AnimeCard({ anime }) {
    const { addAnime, addToGroup, isInLibrary, library } = useAnime();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(null);
    const [step, setStep] = useState("status"); // "status" | "rating" | "group"
    const [newGroupName, setNewGroupName] = useState("");
    const dropdownRef = useRef(null);

    const inLibrary = isInLibrary(anime.mal_id);

    // All existing groups from library
    const groups = library.filter((item) => item.isGroup);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                resetDropdown();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetDropdown = () => {
        setOpen(false);
        setStep("status");
        setRating(null);
        setNewGroupName("");
    };

    // Build the anime data object once — reused in multiple handlers
    const buildAnimeData = () => ({
        malId: anime.mal_id,
        title: anime.title,
        titleEnglish: anime.title_english || anime.title,
        coverImage: anime.images?.jpg?.large_image_url || "",
        synopsis: anime.synopsis || "",
        genres: anime.genres?.map((g) => g.name) || [],
        episodes: anime.episodes || null,
        studio: anime.studios?.[0]?.name || "Unknown",
        year: anime.year || null,
    });

    const handleStatusPick = (statusKey) => {
        if (statusKey === "completed") {
            setStep("rating");
        } else {
            addAnime({
                ...buildAnimeData(),
                status: statusKey,
                episodeProgress: 0,
            });
            resetDropdown();
        }
    };

    const handleConfirmCompleted = () => {
        addAnime({
            ...buildAnimeData(),
            status: "completed",
            userRating: rating,
            episodeProgress: anime.episodes || 0,
        });
        resetDropdown();
    };

    const handleAddToExistingGroup = (groupId) => {
        addToGroup(groupId, {
            ...buildAnimeData(),
            status: "completed",
            episodeProgress: anime.episodes || 0,
        });
        resetDropdown();
    };

    const handleCreateAndAddGroup = () => {
        if (!newGroupName.trim()) return;

        addAnime({
            ...buildAnimeData(),
            status: "completed",
            episodeProgress: anime.episodes || 0,
        });
        resetDropdown();
    };

    return (
        <div className="anime-card">
            <div
                className="anime-card__cover-wrapper"
                onClick={() => navigate(`/anime/${anime.mal_id}`)}
            >
                <img
                    src={anime.images?.jpg?.large_image_url}
                    alt={anime.title}
                    className="anime-card__cover"
                />
            </div>

            <div className="anime-card__info">
                <h3
                    className="anime-card__title"
                    onClick={() => navigate(`/anime/${anime.mal_id}`)}
                >
                    {anime.title}
                </h3>

                <div className="anime-card__meta">
                    <span>{anime.year || "—"}</span>
                    <span>{anime.episodes ? `${anime.episodes} eps` : "? eps"}</span>
                </div>

                <div className="anime-card__genres">
                    {anime.genres?.slice(0, 2).map((g) => (
                        <span key={g.mal_id} className="anime-card__genre-tag">
                            {g.name}
                        </span>
                    ))}
                </div>

                {inLibrary ? (
                    <button className="anime-card__btn anime-card__btn--added" disabled>
                        <Check size={14} /> In Library
                    </button>
                ) : (
                    <div className="anime-card__dropdown-wrapper" ref={dropdownRef}>
                        <button
                            className="anime-card__btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen((o) => !o);
                                setStep("status");
                                setRating(null);
                            }}
                        >
                            <Plus size={14} />
                            Add to Library
                            <ChevronDown
                                size={13}
                                style={{
                                    marginLeft: "auto",
                                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s ease",
                                }}
                            />
                        </button>

                        {/* ── Step 1: Status picker ── */}
                        {open && step === "status" && (
                            <div className="anime-card__dropdown">
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.key}
                                        className="anime-card__dropdown-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusPick(opt.key);
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                                {/* Add to group option — only shows if groups exist */}
                                {groups.length > 0 && (
                                    <>
                                        <div className="anime-card__dropdown-divider" />
                                        <button
                                            className="anime-card__dropdown-item anime-card__dropdown-item--group"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setStep("group");
                                            }}
                                        >
                                            <Layers size={13} />
                                            Add to Group
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── Step 2: Rating (for completed) ── */}
                        {open && step === "rating" && (
                            <div className="anime-card__dropdown anime-card__dropdown--rating">
                                <button
                                    className="anime-card__back-btn"
                                    onClick={(e) => { e.stopPropagation(); setStep("status"); }}
                                >
                                    <ChevronLeft size={13} /> Back
                                </button>
                                <p className="anime-card__rating-label">Rate it</p>
                                <select
                                    className="anime-card__rating-select"
                                    value={rating ?? ""}
                                    onChange={(e) =>
                                        setRating(e.target.value ? Number(e.target.value) : null)
                                    }
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
                                <div className="anime-card__rating-actions">
                                    <button
                                        className="anime-card__rating-skip"
                                        onClick={(e) => { e.stopPropagation(); handleConfirmCompleted(); }}
                                    >
                                        Skip
                                    </button>
                                    <button
                                        className="anime-card__rating-confirm"
                                        onClick={(e) => { e.stopPropagation(); handleConfirmCompleted(); }}
                                        disabled={!rating}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Group picker ── */}
                        {open && step === "group" && (
                            <div className="anime-card__dropdown anime-card__dropdown--group">
                                <button
                                    className="anime-card__back-btn"
                                    onClick={(e) => { e.stopPropagation(); setStep("status"); }}
                                >
                                    <ChevronLeft size={13} /> Back
                                </button>
                                <p className="anime-card__rating-label">Add to Group</p>

                                {/* Existing groups */}
                                <div className="anime-card__group-list">
                                    {groups.map((group) => (
                                        <button
                                            key={group.id}
                                            className="anime-card__group-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToExistingGroup(group.id);
                                            }}
                                        >
                                            <img
                                                src={group.coverImage}
                                                alt={group.title}
                                                className="anime-card__group-cover"
                                            />
                                            <div className="anime-card__group-info">
                                                <p className="anime-card__group-name">{group.title}</p>
                                                <p className="anime-card__group-count">
                                                    {group.seasons.length} seasons
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}