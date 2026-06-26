import { useState, useEffect } from "react";
import { useAnime } from "../../hooks/useAnime";
import { useNavigate } from "react-router-dom";
import { getAnimeByGenre, GENRE_IDS } from "../../services/jikanService";
import AnimeCard from "../../components/AnimeCard/AnimeCard";
import { Loader, Sparkles } from "lucide-react";
import "./Recommendations.css";

export default function Recommendations() {
    const { library, isInLibrary, stats } = useAnime();
    const navigate = useNavigate();

    const [recommendations, setRecommendations] = useState({});
    const [loading, setLoading] = useState(true);
    const [topGenres, setTopGenres] = useState([]);

    useEffect(() => {
        if (library.length === 0) {
            setLoading(false);
            return;
        }

        // Find top 3 genres from library
        const genreMap = {};
        library.forEach((item) => {
            const genres = item.isGroup ? item.genres : item.genres || [];
            genres.forEach((g) => {
                genreMap[g] = (genreMap[g] || 0) + 1;
            });
        });

        const sorted = Object.entries(genreMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name)
            .filter((name) => GENRE_IDS[name]); // only genres we have IDs for

        setTopGenres(sorted);

        // Fetch recommendations for each top genre
        const fetchAll = async () => {
            setLoading(true);
            const results = {};
            for (const genre of sorted) {
                try {
                    const data = await getAnimeByGenre(GENRE_IDS[genre]);
                    // Filter out anime already in library
                    results[genre] = (data.data || []).filter(
                        (a) => !isInLibrary(a.mal_id)
                    ).slice(0, 8);
                } catch {
                    results[genre] = [];
                }
            }
            setRecommendations(results);
            setLoading(false);
        };

        fetchAll();
    }, [library.length]);

    // ── Empty state ───────────────────────────────────────────────────────────
    if (library.length === 0) {
        return (
            <div className="rec-page">
                <div className="rec-page__header">
                    <h1 className="rec-page__title">For You</h1>
                </div>
                <div className="rec-page__empty">
                    <p className="rec-page__empty-icon">✨</p>
                    <p className="rec-page__empty-title">No recommendations yet</p>
                    <p className="rec-page__empty-sub">
                        Add anime to your library and we'll recommend similar titles.
                    </p>
                    <button
                        className="rec-page__empty-btn"
                        onClick={() => navigate("/search")}
                    >
                        Find Anime
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rec-page">
            <div className="rec-page__header">
                <div>
                    <h1 className="rec-page__title">For You</h1>
                    <p className="rec-page__subtitle">
                        Based on your top genres —{" "}
                        <span className="rec-page__genres">
                            {topGenres.join(", ")}
                        </span>
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="rec-page__loading">
                    <Loader size={32} className="rec-page__spinner" />
                    <p>Finding recommendations...</p>
                </div>
            ) : (
                <div className="rec-page__sections">
                    {topGenres.map((genre) => (
                        recommendations[genre]?.length > 0 && (
                            <div key={genre} className="rec-section">
                                <div className="rec-section__header">
                                    <h2 className="rec-section__title">
                                        <Sparkles size={16} />
                                        Because you like {genre}
                                    </h2>
                                </div>
                                <div className="rec-section__grid">
                                    {recommendations[genre].map((anime) => (
                                        <AnimeCard key={anime.mal_id} anime={anime} />
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}