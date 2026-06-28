import { createContext, useContext, useEffect, useReducer } from "react";
import API from "../services/apiService";
import { useAuth } from "./AuthContext";

const ACTIONS = {
    SET_LIBRARY: "SET_LIBRARY",
    SET_LOADING: "SET_LOADING",
    ADD_ITEM: "ADD_ITEM",
    UPDATE_ITEM: "UPDATE_ITEM",
    REMOVE_ITEM: "REMOVE_ITEM",
};

function animeReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LIBRARY:
            return { ...state, library: action.payload };
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        case ACTIONS.ADD_ITEM:
            return { ...state, library: [...state.library, action.payload] };
        case ACTIONS.UPDATE_ITEM:
            return {
                ...state,
                library: state.library.map((item) =>
                    item._id === action.payload._id ? action.payload : item
                ),
            };
        case ACTIONS.REMOVE_ITEM:
            return {
                ...state,
                library: state.library.filter((item) => item._id !== action.payload),
            };
        default:
            return state;
    }
}

const initialState = { library: [], loading: true };
const AnimeContext = createContext(null);

export function AnimeProvider({ children }) {
    const [state, dispatch] = useReducer(animeReducer, initialState);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            dispatch({ type: ACTIONS.SET_LIBRARY, payload: [] });
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            return;
        }
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        API.get("/library")
            .then((res) => dispatch({ type: ACTIONS.SET_LIBRARY, payload: res.data }))
            .catch((err) => console.error("Failed to load library:", err))
            .finally(() => dispatch({ type: ACTIONS.SET_LOADING, payload: false }));
    }, [user]);

    // ── CRUD helpers ───────────────────────────────────────────────────────────

    const addAnime = async (animeData) => {
        try {
            const res = await API.post("/library", { ...animeData, isGroup: false });
            dispatch({ type: ACTIONS.ADD_ITEM, payload: res.data });
        } catch (err) {
            console.error("Failed to add anime:", err);
        }
    };

    const updateAnime = async (id, updates) => {
        try {
            const res = await API.put(`/library/${id}`, updates);
            dispatch({ type: ACTIONS.UPDATE_ITEM, payload: res.data });
        } catch (err) {
            console.error("Failed to update anime:", err);
        }
    };

    const removeAnime = async (id) => {
        try {
            await API.delete(`/library/${id}`);
            dispatch({ type: ACTIONS.REMOVE_ITEM, payload: id });
        } catch (err) {
            console.error("Failed to remove anime:", err);
        }
    };

    // ── Group helpers ──────────────────────────────────────────────────────────

    const createGroup = async (groupTitle, ids) => {
        try {
            const toGroup = state.library.filter((item) => ids.includes(item._id));
            if (toGroup.length === 0) return;
            const allGenres = [...new Set(toGroup.flatMap((a) => a.genres))];
            const res = await API.post("/library", {
                isGroup: true,
                title: groupTitle,
                genres: allGenres,
                coverImage: toGroup[0].coverImage,
                status: toGroup[0].status,
                seasons: toGroup.map((a) => ({
                    malId: a.malId, title: a.title, titleEnglish: a.titleEnglish,
                    coverImage: a.coverImage, synopsis: a.synopsis, genres: a.genres,
                    episodes: a.episodes, studio: a.studio, year: a.year,
                    status: a.status, userRating: a.userRating, episodeProgress: a.episodeProgress,
                })),
            });
            for (const item of toGroup) await API.delete(`/library/${item._id}`);
            dispatch({
                type: ACTIONS.SET_LIBRARY,
                payload: [...state.library.filter((item) => !ids.includes(item._id)), res.data],
            });
        } catch (err) {
            console.error("Failed to create group:", err);
        }
    };

    const addToGroup = async (groupId, anime) => {
        try {
            const group = state.library.find((item) => item._id === groupId);
            if (!group) return;
            const updatedSeasons = [...group.seasons, {
                malId: anime.malId, title: anime.title, titleEnglish: anime.titleEnglish,
                coverImage: anime.coverImage, synopsis: anime.synopsis, genres: anime.genres,
                episodes: anime.episodes, studio: anime.studio, year: anime.year,
                status: anime.status, episodeProgress: anime.episodeProgress,
            }];
            const allGenres = [...new Set(updatedSeasons.flatMap((s) => s.genres))];
            const res = await API.put(`/library/${groupId}`, { seasons: updatedSeasons, genres: allGenres });
            dispatch({ type: ACTIONS.UPDATE_ITEM, payload: res.data });
        } catch (err) {
            console.error("Failed to add to group:", err);
        }
    };

    const updateGroup = async (groupId, updates) => {
        try {
            const res = await API.put(`/library/${groupId}`, updates);
            dispatch({ type: ACTIONS.UPDATE_ITEM, payload: res.data });
        } catch (err) {
            console.error("Failed to update group:", err);
        }
    };

    const removeGroup = async (groupId, ungroup = false) => {
        try {
            const group = state.library.find((item) => item._id === groupId);
            if (!group) return;
            if (ungroup) {
                const restoredItems = [];
                for (const season of group.seasons) {
                    const res = await API.post("/library", { ...season, isGroup: false });
                    restoredItems.push(res.data);
                }
                await API.delete(`/library/${groupId}`);
                dispatch({
                    type: ACTIONS.SET_LIBRARY,
                    payload: [...state.library.filter((item) => item._id !== groupId), ...restoredItems],
                });
            } else {
                await API.delete(`/library/${groupId}`);
                dispatch({ type: ACTIONS.REMOVE_ITEM, payload: groupId });
            }
        } catch (err) {
            console.error("Failed to remove group:", err);
        }
    };

    // ── Read helpers ───────────────────────────────────────────────────────────

    const isInLibrary = (malId) => {
        return state.library.some((item) => {
            if (item.isGroup) return item.seasons?.some((s) => s.malId === malId);
            return item.malId === malId;
        });
    };

    const getAnimeById = (malId) => {
        for (const item of state.library) {
            if (item.isGroup) {
                const season = item.seasons?.find((s) => s.malId === malId);
                if (season) return season;
            } else if (item.malId === malId) {
                return item;
            }
        }
        return null;
    };

    const getGroupById = (id) =>
        state.library.find((item) => item.isGroup && item._id === id) || null;

    const getGroupContaining = (malId) =>
        state.library.find(
            (item) => item.isGroup && item.seasons?.some((s) => s.malId === malId)
        ) || null;

    // ── Derived stats ──────────────────────────────────────────────────────────

    const stats = {
        totalUnique: state.library.length,
        completed: state.library.filter((a) => a.status === "completed").length,
        watching: state.library.filter((a) => a.status === "watching").length,
        planToWatch: state.library.filter((a) => a.status === "plan_to_watch").length,
        dropped: state.library.filter((a) => a.status === "dropped").length,
        onHold: state.library.filter((a) => a.status === "on_hold").length,
        totalEpisodes: state.library.reduce((sum, item) => {
            if (item.isGroup)
                return sum + (item.seasons?.reduce((s, season) => s + (season.episodeProgress || 0), 0) || 0);
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
        loading: state.loading,
        addAnime, updateAnime, removeAnime,
        createGroup, addToGroup, updateGroup, removeGroup,
        isInLibrary, getAnimeById, getGroupById, getGroupContaining,
        stats,
    };

    return (
        <AnimeContext.Provider value={value}>
            {children}
        </AnimeContext.Provider>
    );
}

export { AnimeContext };