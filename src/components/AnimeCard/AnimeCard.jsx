import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAnime } from "../../hooks/useAnime";
import { Plus, Check, ChevronDown } from "lucide-react";
import "./AnimeCard.css";

const STATUS_OPTIONS = [
    { key: "watching", label: "Watching" },
    { key: "completed", label: "Completed" },
    { key: "plan_to_watch", label: "Plan to Watch" },
    { key: "on_hold", label: "On Hold" },
    { key: "dropped", label: "Dropped" },
];

export default function AnimeCard({ anime }) {
    const { addAnime, isInLibrary } = useAnime();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(null);
    const [step, setStep] = useState("status");
    const dropdownRef = useRef(null);

    const inLibrary = isInLibrary(anime.mal_id);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
                setStep("status");
                setRating(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleStatusPick = (statusKey) => {
        if (statusKey === "completed") {
            setStep("rating");
        } else {
            addAnime({
                malId: anime.mal_id,
                title: anime.title,
                titleEnglish: anime.title_english || anime.title,
                coverImage: anime.images?.jpg?.large_image_url || "",
                synopsis: anime.synopsis || "",
                genres: anime.genres?.map((g) => g.name) || [],
                episodes: anime.episodes || null,
                studio: anime.studios?.[0]?.name || "Unknown",
                year: anime.year || null,
                status: statusKey,
                episodeProgress: 0,
            });
            setOpen(false);
            setStep("status");
        }
    };

    const handleConfirmCompleted = () => {
        addAnime({
            malId: anime.mal_id,
            title: anime.title,
            titleEnglish: anime.title_english || anime.title,
            coverImage: anime.images?.jpg?.large_image_url || "",
            synopsis: anime.synopsis || "",
            genres: anime.genres?.map((g) => g.name) || [],
            episodes: anime.episodes || null,
            studio: anime.studios?.[0]?.name || "Unknown",
            year: anime.year || null,
            status: "completed",
            userRating: rating,
            episodeProgress: anime.episodes || 0,
        });
        setOpen(false);
        setStep("status");
        setRating(null);
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
                            </div>
                        )}

                        {open && step === "rating" && (
                            <div className="anime-card__dropdown anime-card__dropdown--rating">
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleConfirmCompleted();
                                        }}
                                    >
                                        Skip
                                    </button>
                                    <button
                                        className="anime-card__rating-confirm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleConfirmCompleted();
                                        }}
                                        disabled={!rating}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}