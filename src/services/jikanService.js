import axios from "axios";

const BASE_URL = "https://api.jikan.moe/v4";

// Jikan has a rate limit: 3 requests/second, 60/minute.
// We add a small delay helper to avoid getting blocked.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const searchAnime = async (query, page = 1) => {
    await delay(500);
    const response = await axios.get(`${BASE_URL}/anime`, {
        params: { q: query, page, limit: 12, sfw: true },
    });
    return response.data;
};

export const getAnimeById = async (malId) => {
    await delay(500);
    const response = await axios.get(`${BASE_URL}/anime/${malId}`);
    return response.data;
};