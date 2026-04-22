import { useState, useRef, useEffect } from "react";
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
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const inLibrary = isInLibrary(anime.mal_id);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAdd = (statusKey) => {
        const isCompleted = statusKey === "completed";
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
            // Auto-fill episode progress if completed
            episodeProgress: isCompleted ? (anime.episodes || 0) : 0,
        });
        setOpen(false);
    };

    if (inLibrary) {
        return (
            <div className="anime-card">
                <div className="anime-card__cover-wrapper">
                    <img
                        src={anime.images?.jpg?.large_image_url}
                        alt={anime.title}
                        className="anime-card__cover"
                    />
                    <div className="anime-card__overlay">
                        <p className="anime-card__synopsis">
                            {anime.synopsis
                                ? anime.synopsis.slice(0, 120) + "..."
                                : "No synopsis available."}
                        </p>
                    </div>
                </div>
                <div className="anime-card__info">
                    <h3 className="anime-card__title">{anime.title}</h3>
                    <div className="anime-card__meta">
                        <span>{anime.year || "—"}</span>
                        <span>{anime.episodes ? `${anime.episodes} eps` : "? eps"}</span>
                    </div>
                    <div className="anime-card__genres">
                        {anime.genres?.slice(0, 2).map((g) => (
                            <span key={g.mal_id} className="anime-card__genre-tag">{g.name}</span>
                        ))}
                    </div>
                    <button className="anime-card__btn anime-card__btn--added" disabled>
                        <Check size={14} /> In Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="anime-card">
            <div className="anime-card__cover-wrapper">
                <img
                    src={anime.images?.jpg?.large_image_url}
                    alt={anime.title}
                    className="anime-card__cover"
                />
                <div className="anime-card__overlay">
                    <p className="anime-card__synopsis">
                        {anime.synopsis
                            ? anime.synopsis.slice(0, 120) + "..."
                            : "No synopsis available."}
                    </p>
                </div>
            </div>

            <div className="anime-card__info">
                <h3 className="anime-card__title">{anime.title}</h3>
                <div className="anime-card__meta">
                    <span>{anime.year || "—"}</span>
                    <span>{anime.episodes ? `${anime.episodes} eps` : "? eps"}</span>
                </div>
                <div className="anime-card__genres">
                    {anime.genres?.slice(0, 2).map((g) => (
                        <span key={g.mal_id} className="anime-card__genre-tag">{g.name}</span>
                    ))}
                </div>

                {/* ── Status picker dropdown ── */}
                <div className="anime-card__dropdown-wrapper" ref={dropdownRef}>
                    <button
                        className="anime-card__btn"
                        onClick={() => setOpen((o) => !o)}
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

                    {open && (
                        <div className="anime-card__dropdown">
                            {STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt.key}
                                    className="anime-card__dropdown-item"
                                    onClick={() => handleAdd(opt.key)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}