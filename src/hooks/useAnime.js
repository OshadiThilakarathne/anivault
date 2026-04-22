import { useContext } from "react";
import { AnimeContext } from "../context/AnimeContext";

// Custom hook — instead of writing useContext(AnimeContext) everywhere,
// any component just calls: const { library, addAnime } = useAnime();
export function useAnime() {
    const context = useContext(AnimeContext);
    if (!context) {
        throw new Error("useAnime must be used inside <AnimeProvider>");
    }
    return context;
}