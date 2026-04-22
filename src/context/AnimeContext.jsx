import { createContext, useContext, useEffect, useReducer } from "react";

// ── 1. The shape of one anime entry in your library ──────────────────────────
//    When a user adds an anime, this is what gets stored.
const defaultEntry = {
    malId: null,          // Jikan's unique ID — used as the key
    title: "",
    titleEnglish: "",
    coverImage: "",
    synopsis: "",
    genres: [],           // ["Action", "Fantasy", ...]
    episodes: null,       // total episodes from Jikan
    studio: "",
    year: null,
    status: "plan_to_watch", // watching | completed | plan_to_watch | dropped | on_hold
    userRating: null,     // 1–10, set by the user
    review: "",           // personal notes
    episodeProgress: 0,   // how many episodes watched
    startDate: null,      // ISO string
    finishDate: null,     // ISO string
    addedAt: null,        // ISO string — when they added it to library
};

// ── 2. All possible actions the reducer can handle ───────────────────────────
const ACTIONS = {
    ADD_ANIME: "ADD_ANIME",
    UPDATE_ANIME: "UPDATE_ANIME",
    REMOVE_ANIME: "REMOVE_ANIME",
    SET_LIBRARY: "SET_LIBRARY",
};

// ── 3. Reducer — a pure function: (currentState, action) → newState ──────────
//    Think of it as a post office: you send a labelled package (action),
//    it figures out what to do and returns updated state.
function animeReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LIBRARY:
            return { ...state, library: action.payload };

        case ACTIONS.ADD_ANIME: {
            // Prevent duplicates — if malId already exists, don't add again
            const exists = state.library.some(
                (a) => a.malId === action.payload.malId
            );
            if (exists) return state;
            const newEntry = {
                ...defaultEntry,
                ...action.payload,
                addedAt: new Date().toISOString(),
            };
            return { ...state, library: [...state.library, newEntry] };
        }

        case ACTIONS.UPDATE_ANIME:
            return {
                ...state,
                library: state.library.map((anime) =>
                    anime.malId === action.payload.malId
                        ? { ...anime, ...action.payload.updates }
                        : anime
                ),
            };

        case ACTIONS.REMOVE_ANIME:
            return {
                ...state,
                library: state.library.filter(
                    (anime) => anime.malId !== action.payload.malId
                ),
            };

        default:
            return state;
    }
}

// ── 4. Initial state ──────────────────────────────────────────────────────────
const initialState = {
    library: [], // array of anime entries
};

// ── 5. Create the context object ──────────────────────────────────────────────
const AnimeContext = createContext(null);

// ── 6. Provider — wraps your app and makes state available everywhere ─────────
export function AnimeProvider({ children }) {
    const [state, dispatch] = useReducer(animeReducer, initialState);

    // Load from localStorage on first mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("anivault_library");
            if (saved) {
                dispatch({ type: ACTIONS.SET_LIBRARY, payload: JSON.parse(saved) });
            }
        } catch (err) {
            console.error("Failed to load library from localStorage:", err);
        }
    }, []);

    // Save to localStorage whenever library changes
    useEffect(() => {
        localStorage.setItem("anivault_library", JSON.stringify(state.library));
    }, [state.library]);

    // ── Helper functions (the "API" your components will call) ────────────────
    const addAnime = (animeData) => {
        dispatch({ type: ACTIONS.ADD_ANIME, payload: animeData });
    };

    const updateAnime = (malId, updates) => {
        dispatch({ type: ACTIONS.UPDATE_ANIME, payload: { malId, updates } });
    };

    const removeAnime = (malId) => {
        dispatch({ type: ACTIONS.REMOVE_ANIME, payload: { malId } });
    };

    const isInLibrary = (malId) => {
        return state.library.some((a) => a.malId === malId);
    };

    const getAnimeById = (malId) => {
        return state.library.find((a) => a.malId === malId) || null;
    };

    // ── Derived stats (computed from library, not stored separately) ──────────
    const stats = {
        totalUnique: state.library.length,
        completed: state.library.filter((a) => a.status === "completed").length,
        watching: state.library.filter((a) => a.status === "watching").length,
        planToWatch: state.library.filter((a) => a.status === "plan_to_watch").length,
        dropped: state.library.filter((a) => a.status === "dropped").length,
        onHold: state.library.filter((a) => a.status === "on_hold").length,
        totalEpisodes: state.library.reduce(
            (sum, a) => sum + (a.episodeProgress || 0),
            0
        ),
        averageRating:
            state.library.filter((a) => a.userRating).length > 0
                ? (
                    state.library
                        .filter((a) => a.userRating)
                        .reduce((sum, a) => sum + a.userRating, 0) /
                    state.library.filter((a) => a.userRating).length
                ).toFixed(1)
                : null,
    };

    const value = {
        library: state.library,
        addAnime,
        updateAnime,
        removeAnime,
        isInLibrary,
        getAnimeById,
        stats,
    };

    return <AnimeContext.Provider value={value}>{children}</AnimeContext.Provider>;
}

export { AnimeContext, ACTIONS };