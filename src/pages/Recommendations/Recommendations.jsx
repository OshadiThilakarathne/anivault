import { useState, useEffect } from "react";
import { useAnime } from "../../hooks/useAnime";
import { useNavigate } from "react-router-dom";
import { getAnimeByGenre, GENRE_IDS } from "../../services/jikanService";
import AnimeCard from "../../components/AnimeCard/AnimeCard";
import { Loader } from "lucide-react";
import axios from "axios";
import "./Recommendations.css";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export default function Recommendations() {
    const { library, isInLibrary } = useAnime();
    const navigate = useNavigate();

    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const results = [];

            try {
                // ── Top Airing ──────────────────────────────────────────────────
                await delay(300);
                const airing = await axios.get("https://api.jikan.moe/v4/top/anime?filter=airing&limit=12");
                const airingFiltered = (airing.data.data || []).filter((a) => !isInLibrary(a.mal_id));
                if (airingFiltered.length > 0) {
                    results.push({ title: "Top Airing Now", anime: airingFiltered.slice(0, 8) });
                }

                // ── Top Upcoming ─────────────────────────────────────────────────
                await delay(300);
                const upcoming = await axios.get("https://api.jikan.moe/v4/top/anime?filter=upcoming&limit=12");
                const upcomingFiltered = (upcoming.data.data || []).filter((a) => !isInLibrary(a.mal_id));
                if (upcomingFiltered.length > 0) {
                    results.push({ title: "Coming Soon", anime: upcomingFiltered.slice(0, 8) });
                }

                // ── All Time Popular ─────────────────────────────────────────────
                await delay(300);
                const popular = await axios.get("https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=12");
                const popularFiltered = (popular.data.data || []).filter((a) => !isInLibrary(a.mal_id));
                if (popularFiltered.length > 0) {
                    results.push({ title: "Most Popular of All Time", anime: popularFiltered.slice(0, 8) });
                }

                // ── Top Rated ────────────────────────────────────────────────────
                await delay(300);
                const topRated = await axios.get("https://api.jikan.moe/v4/top/anime?limit=12");
                const topRatedFiltered = (topRated.data.data || []).filter((a) => !isInLibrary(a.mal_id));
                if (topRatedFiltered.length > 0) {
                    results.push({ title: "Highest Rated", anime: topRatedFiltered.slice(0, 8) });
                }

                // ── By Top Genres from library ───────────────────────────────────
                if (library.length > 0) {
                    const genreMap = {};
                    library.forEach((item) => {
                        const genres = item.isGroup ? item.genres : item.genres || [];
                        genres.forEach((g) => { genreMap[g] = (genreMap[g] || 0) + 1; });
                    });

                    const topGenres = Object.entries(genreMap)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 2)
                        .map(([name]) => name)
                        .filter((name) => GENRE_IDS[name]);

                    for (const genre of topGenres) {
                        await delay(300);
                        const data = await getAnimeByGenre(GENRE_IDS[genre]);
                        const filtered = (data.data || []).filter((a) => !isInLibrary(a.mal_id));
                        if (filtered.length > 0) {
                            results.push({
                                title: `Because You Like ${genre}`,
                                anime: filtered.slice(0, 8),
                            });
                        }
                    }
                }

            } catch (err) {
                console.error("Failed to fetch recommendations:", err);
            }

            setSections(results);
            setLoading(false);
        };

        fetchAll();
    }, [library.length]);

    return (
        <div className="rec-page">
            <div className="rec-page__header">
                <h1 className="rec-page__title">For You</h1>
                <p className="rec-page__subtitle">Discover your next favourite anime</p>
            </div>

            {loading ? (
                <div className="rec-page__loading">
                    <Loader size={32} className="rec-page__spinner" />
                    <p>Finding recommendations...</p>
                </div>
            ) : (
                <div className="rec-page__sections">
                    {sections.map((section) => (
                        <div key={section.title} className="rec-section">
                            <h2 className="rec-section__title">{section.title}</h2>
                            <div className="rec-section__grid">
                                {section.anime.map((anime) => (
                                    <AnimeCard key={anime.mal_id} anime={anime} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}