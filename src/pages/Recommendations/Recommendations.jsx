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
        const results = [];

        const addSection = (section) => {
            results.push(section);
            setSections([...results]);
        };

        const fetchAll = async () => {
            setLoading(true);

            // ── Top Airing ──────────────────────────────────────────────────────
            try {
                await delay(1000);
                const res = await axios.get("https://api.jikan.moe/v4/top/anime?filter=airing&limit=12");
                const filtered = (res.data.data || []).filter((a) => !isInLibrary(a.mal_id));
                if (filtered.length > 0) addSection({ title: "Top Airing Now", anime: filtered.slice(0, 8) });
            } catch { }

            // ── Coming Soon ──────────────────────────────────────────────────────
            try {
                await delay(1000);
                const res = await axios.get("https://api.jikan.moe/v4/top/anime?filter=upcoming&limit=12");
                const filtered = (res.data.data || []).filter((a) => !isInLibrary(a.mal_id));
                if (filtered.length > 0) addSection({ title: "Coming Soon", anime: filtered.slice(0, 8) });
            } catch { }

            // ── Most Popular ─────────────────────────────────────────────────────
            try {
                await delay(1000);
                const res = await axios.get("https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=12");
                const filtered = (res.data.data || []).filter((a) => !isInLibrary(a.mal_id));
                if (filtered.length > 0) addSection({ title: "Most Popular of All Time", anime: filtered.slice(0, 8) });
            } catch { }

            // ── Highest Rated ────────────────────────────────────────────────────
            try {
                await delay(1000);
                const res = await axios.get("https://api.jikan.moe/v4/top/anime?limit=12");
                const filtered = (res.data.data || []).filter((a) => !isInLibrary(a.mal_id));
                if (filtered.length > 0) addSection({ title: "Highest Rated", anime: filtered.slice(0, 8) });
            } catch { }

            // ── By Top Genres ────────────────────────────────────────────────────
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
                    try {
                        await delay(1000);
                        const data = await getAnimeByGenre(GENRE_IDS[genre]);
                        const filtered = (data.data || []).filter((a) => !isInLibrary(a.mal_id));
                        if (filtered.length > 0) {
                            addSection({ title: `Because You Like ${genre}`, anime: filtered.slice(0, 8) });
                        }
                    } catch { }
                }
            }

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

            {/* Show spinner only if no sections loaded yet */}
            {loading && sections.length === 0 && (
                <div className="rec-page__loading">
                    <Loader size={32} className="rec-page__spinner" />
                    <p>Finding recommendations...</p>
                </div>
            )}

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

                {/* Show loading indicator at bottom while more sections load */}
                {loading && sections.length > 0 && (
                    <div className="rec-page__loading-more">
                        <Loader size={20} className="rec-page__spinner" />
                        <p>Loading more...</p>
                    </div>
                )}
            </div>
        </div>
    );
}