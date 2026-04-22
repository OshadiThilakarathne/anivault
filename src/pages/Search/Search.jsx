import { useState, useCallback } from "react";
import { searchAnime } from "../../services/jikanService";
import AnimeCard from "../../components/AnimeCard/AnimeCard";
import { Search as SearchIcon, Loader } from "lucide-react";
import "./Search.css";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = useCallback(async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setSearched(true);

        try {
            const data = await searchAnime(query);
            setResults(data.data || []);
        } catch (err) {
            setError("Something went wrong. Jikan may be rate-limiting — wait a moment and try again.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query]);

    return (
        <div className="search-page">
            <div className="search-page__header">
                <h1 className="search-page__title">Search Anime</h1>
                <p className="search-page__subtitle">Find and add titles to your library</p>
            </div>

            <form className="search-page__form" onSubmit={handleSearch}>
                <div className="search-page__input-wrapper">
                    <SearchIcon size={18} className="search-page__input-icon" />
                    <input
                        type="text"
                        className="search-page__input"
                        placeholder="Search by title... e.g. Fullmetal Alchemist"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <button type="submit" className="search-page__btn" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {error && <p className="search-page__error">{error}</p>}

            {loading && (
                <div className="search-page__loading">
                    <Loader size={32} className="search-page__spinner" />
                    <p>Fetching from Jikan...</p>
                </div>
            )}

            {!loading && searched && results.length === 0 && !error && (
                <p className="search-page__empty">No results found for "{query}".</p>
            )}

            <div className="search-page__grid">
                {results.map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
            </div>
        </div>
    );
}