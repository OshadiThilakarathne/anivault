import { useState, useEffect } from "react";
import { useAnime } from "../../hooks/useAnime";
import { getAnimeByGenre, GENRE_IDS, getAiringAnime, getUpcomingAnime, getTopAnime } from "../../services/anilistService";
import AnimeCard from "../../components/AnimeCard/AnimeCard";
import { Loader, ChevronRight } from "lucide-react";
import "./Recommendations.css";

const PAGE_SIZE = 8;

function RecSection({ section }) {
    const [visible, setVisible] = useState(PAGE_SIZE);
    const hasMore = visible < section.anime.length;

    return (
        <div className="rec-section">
            <div className="rec-section__header">
                <h2 className="rec-section__title">{section.title}</h2>
                {hasMore && (
                    <button
                        className="rec-section__see-all"
                        onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    >
                        Load more <ChevronRight size={14} />
                    </button>
                )}
            </div>
            <div className="rec-section__grid">
                {section.anime.slice(0, visible).map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
            </div>
        </div>
    );
}

export default function Recommendations() {
    const { library, isInLibrary } = useAnime();

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

            // ── Top Airing ──
            try {
                const anime = await getAiringAnime();
                const filtered = anime.filter((a) => !isInLibrary(a.mal_id));
                if (filtered.length > 0) addSection({ title: "Top Airing Now", anime: filtered });
            } catch { }

            // ── Coming Soon ──
            try {
                const anime = await getUpcomingAnime();
                const filtered = anime.filter((a) => !isInLibrary(a.mal_id));
                if (filtered.length > 0) addSection({ title: "Coming Soon", anime: filtered });
            } catch { }

            // ── Most Popular ──
            try {
                const anime = await getTopAnime("POPULARITY_DESC");
                const filtered = anime.filter((a) => !isInLibrary(a.mal_id));
                if (filtered.length > 0) addSection({ title: "Most Popular of All Time", anime: filtered });
            } catch { }

            // ── Highest Rated ──
            try {
                const anime = await getTopAnime("SCORE_DESC");
                const filtered = anime.filter((a) => !isInLibrary(a.mal_id));
                if (filtered.length > 0) addSection({ title: "Highest Rated", anime: filtered });
            } catch { }

            // ── By Top Genres ──
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
                        const data = await getAnimeByGenre(GENRE_IDS[genre]);
                        const filtered = (data.data || []).filter((a) => !isInLibrary(a.mal_id));
                        if (filtered.length > 0) addSection({ title: `Because You Like ${genre}`, anime: filtered });
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

            {loading && sections.length === 0 && (
                <div className="rec-page__loading">
                    <Loader size={32} className="rec-page__spinner" />
                    <p>Finding recommendations...</p>
                </div>
            )}

            <div className="rec-page__sections">
                {sections.map((section) => (
                    <RecSection key={section.title} section={section} />
                ))}

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