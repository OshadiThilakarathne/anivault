import { useAnime } from "../../hooks/useAnime";
import { Plus, Check } from "lucide-react";
import "./AnimeCard.css";

export default function AnimeCard({ anime }) {
    const { addAnime, isInLibrary } = useAnime();

    const inLibrary = isInLibrary(anime.mal_id);

    const handleAdd = () => {
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
            status: "plan_to_watch",
        });
    };

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
                        <span key={g.mal_id} className="anime-card__genre-tag">
                            {g.name}
                        </span>
                    ))}
                </div>
                <button
                    className={`anime-card__btn ${inLibrary ? "anime-card__btn--added" : ""}`}
                    onClick={handleAdd}
                    disabled={inLibrary}
                >
                    {inLibrary ? (
                        <><Check size={14} /> In Library</>
                    ) : (
                        <><Plus size={14} /> Add to Library</>
                    )}
                </button>
            </div>
        </div>
    );
}