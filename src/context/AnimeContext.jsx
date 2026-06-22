import { createContext, useContext, useEffect, useReducer } from "react";

// ── Actions ───────────────────────────────────────────────────────────────────
const ACTIONS = {
    SET_LIBRARY: "SET_LIBRARY",
    ADD_ANIME: "ADD_ANIME",
    UPDATE_ANIME: "UPDATE_ANIME",
    REMOVE_ANIME: "REMOVE_ANIME",
    CREATE_GROUP: "CREATE_GROUP",
    ADD_TO_GROUP: "ADD_TO_GROUP",
    UPDATE_GROUP: "UPDATE_GROUP",
    REMOVE_GROUP: "REMOVE_GROUP",
    REMOVE_FROM_GROUP: "REMOVE_FROM_GROUP",
};

// ── Default shapes ────────────────────────────────────────────────────────────
const defaultEntry = {
    malId: null,
    isGroup: false,
    title: "",
    titleEnglish: "",
    coverImage: "",
    synopsis: "",
    genres: [],
    episodes: null,
    studio: "",
    year: null,
    status: "plan_to_watch",
    userRating: null,
    review: "",
    episodeProgress: 0,
    startDate: null,
    finishDate: null,
    addedAt: null,
};

const defaultGroup = {
    id: null,   // "group_<timestamp>"
    isGroup: true,
    title: "",     // user-defined name e.g. "Attack on Titan"
    status: "completed",
    userRating: null,
    review: "",
    genres: [],     // union of all season genres
    coverImage: "",     // taken from first season
    addedAt: null,
    seasons: [],     // array of anime entries (same shape as defaultEntry)
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function animeReducer(state, action) {
    switch (action.type) {

        case ACTIONS.SET_LIBRARY:
            return { ...state, library: action.payload };

        case ACTIONS.ADD_ANIME: {
            const exists = state.library.some(
                (a) => !a.isGroup && a.malId === action.payload.malId
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
                library: state.library.map((item) =>
                    !item.isGroup && item.malId === action.payload.malId
                        ? { ...item, ...action.payload.updates }
                        : item
                ),
            };

        case ACTIONS.REMOVE_ANIME:
            return {
                ...state,
                library: state.library.filter(
                    (item) => item.isGroup || item.malId !== action.payload.malId
                ),
            };

        // ── Group actions ─────────────────────────────────────────────────────────

        case ACTIONS.CREATE_GROUP: {
            const { groupTitle, malIds } = action.payload;

            // Pull the matching standalone entries out of the library
            const toGroup = state.library.filter(
                (item) => !item.isGroup && malIds.includes(item.malId)
            );

            if (toGroup.length === 0) return state;

            // Union genres across all seasons
            const allGenres = [...new Set(toGroup.flatMap((a) => a.genres))];

            const newGroup = {
                ...defaultGroup,
                id: `group_${Date.now()}`,
                title: groupTitle,
                genres: allGenres,
                coverImage: toGroup[0].coverImage,
                status: toGroup[0].status,
                addedAt: new Date().toISOString(),
                seasons: toGroup,
            };

            // Remove standalone entries that are now inside the group
            const remaining = state.library.filter(
                (item) => item.isGroup || !malIds.includes(item.malId)
            );

            return { ...state, library: [...remaining, newGroup] };
        }

        case ACTIONS.ADD_TO_GROUP: {
            const { groupId, anime } = action.payload;
            return {
                ...state,
                library: state.library.map((item) => {
                    if (!item.isGroup || item.id !== groupId) return item;
                    // Don't add duplicate seasons
                    const alreadyIn = item.seasons.some((s) => s.malId === anime.malId);
                    if (alreadyIn) return item;
                    const updatedSeasons = [...item.seasons, anime];
                    const allGenres = [...new Set(updatedSeasons.flatMap((s) => s.genres))];
                    return {
                        ...item,
                        seasons: updatedSeasons,
                        genres: allGenres,
                    };
                }),
            };
        }

        case ACTIONS.UPDATE_GROUP:
            return {
                ...state,
                library: state.library.map((item) =>
                    item.isGroup && item.id === action.payload.groupId
                        ? { ...item, ...action.payload.updates }
                        : item
                ),
            };

        case ACTIONS.REMOVE_GROUP: {
            // Option A: delete the group entirely
            // Option B: ungroup (restore seasons as standalone entries)
            const { groupId, ungroup } = action.payload;
            const group = state.library.find((item) => item.isGroup && item.id === groupId);

            if (!group) return state;

            const withoutGroup = state.library.filter(
                (item) => !(item.isGroup && item.id === groupId)
            );

            if (ungroup) {
                // Restore seasons as standalone entries
                return { ...state, library: [...withoutGroup, ...group.seasons] };
            }
            return { ...state, library: withoutGroup };
        }

        case ACTIONS.REMOVE_FROM_GROUP: {
            const { groupId, malId } = action.payload;
            return {
                ...state,
                library: state.library.map((item) => {
                    if (!item.isGroup || item.id !== groupId) return item;
                    const updatedSeasons = item.seasons.filter((s) => s.malId !== malId);
                    const allGenres = [...new Set(updatedSeasons.flatMap((s) => s.genres))];
                    return {
                        ...item,
                        seasons: updatedSeasons,
                        genres: allGenres,
                        coverImage: updatedSeasons[0]?.coverImage || item.coverImage,
                    };
                }),
            };
        }

        default:
            return state;
    }
}

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState = { library: [] };

// ── Context ───────────────────────────────────────────────────────────────────
const AnimeContext = createContext(null);

export function AnimeProvider({ children }) {
    const [state, dispatch] = useReducer(animeReducer, initialState);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("anivault_library");
            if (saved) {
                dispatch({ type: ACTIONS.SET_LIBRARY, payload: JSON.parse(saved) });
            }
        } catch (err) {
            console.error("Failed to load library:", err);
        }
    }, []);

    // Save to localStorage on every change
    useEffect(() => {
        localStorage.setItem("anivault_library", JSON.stringify(state.library));
    }, [state.library]);

    // ── Helper functions ───────────────────────────────────────────────────────

    const addAnime = (animeData) =>
        dispatch({ type: ACTIONS.ADD_ANIME, payload: animeData });

    const updateAnime = (malId, updates) =>
        dispatch({ type: ACTIONS.UPDATE_ANIME, payload: { malId, updates } });

    const removeAnime = (malId) =>
        dispatch({ type: ACTIONS.REMOVE_ANIME, payload: { malId } });

    const createGroup = (groupTitle, malIds) =>
        dispatch({ type: ACTIONS.CREATE_GROUP, payload: { groupTitle, malIds } });

    const addToGroup = (groupId, anime) =>
        dispatch({ type: ACTIONS.ADD_TO_GROUP, payload: { groupId, anime } });

    const updateGroup = (groupId, updates) =>
        dispatch({ type: ACTIONS.UPDATE_GROUP, payload: { groupId, updates } });

    const removeGroup = (groupId, ungroup = false) =>
        dispatch({ type: ACTIONS.REMOVE_GROUP, payload: { groupId, ungroup } });

    const removeFromGroup = (groupId, malId) =>
        dispatch({ type: ACTIONS.REMOVE_FROM_GROUP, payload: { groupId, malId } });

    // ── Read helpers ───────────────────────────────────────────────────────────

    const isInLibrary = (malId) => {
        return state.library.some((item) => {
            if (item.isGroup) return item.seasons.some((s) => s.malId === malId);
            return item.malId === malId;
        });
    };

    const getAnimeById = (malId) => {
        for (const item of state.library) {
            if (item.isGroup) {
                const season = item.seasons.find((s) => s.malId === malId);
                if (season) return season;
            } else if (item.malId === malId) {
                return item;
            }
        }
        return null;
    };

    const getGroupById = (groupId) =>
        state.library.find((item) => item.isGroup && item.id === groupId) || null;

    const getGroupContaining = (malId) =>
        state.library.find(
            (item) => item.isGroup && item.seasons.some((s) => s.malId === malId)
        ) || null;

    // ── Derived stats ──────────────────────────────────────────────────────────
    // Groups count as 1, not as individual seasons
    const stats = {
        totalUnique: state.library.length,
        completed: state.library.filter((a) => a.status === "completed").length,
        watching: state.library.filter((a) => a.status === "watching").length,
        planToWatch: state.library.filter((a) => a.status === "plan_to_watch").length,
        dropped: state.library.filter((a) => a.status === "dropped").length,
        onHold: state.library.filter((a) => a.status === "on_hold").length,
        totalEpisodes: state.library.reduce((sum, item) => {
            if (item.isGroup) {
                return sum + item.seasons.reduce((s, season) => s + (season.episodeProgress || 0), 0);
            }
            return sum + (item.episodeProgress || 0);
        }, 0),
        averageRating: (() => {
            const rated = state.library.filter((a) => a.userRating);
            if (rated.length === 0) return null;
            return (rated.reduce((sum, a) => sum + a.userRating, 0) / rated.length).toFixed(1);
        })(),
    };

    const value = {
        library: state.library,
        addAnime,
        updateAnime,
        removeAnime,
        createGroup,
        addToGroup,
        updateGroup,
        removeGroup,
        removeFromGroup,
        isInLibrary,
        getAnimeById,
        getGroupById,
        getGroupContaining,
        stats,
    };

    return (
        <AnimeContext.Provider value={value}>
            {children}
        </AnimeContext.Provider>
    );
}

export { AnimeContext, ACTIONS };