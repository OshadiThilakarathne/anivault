import axios from "axios";

const BASE_URL = "https://api.jikan.moe/v4";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const searchAnime = async (query, page = 1) => {
    await delay(1000);
    const response = await axios.get(`${BASE_URL}/anime`, {
        params: {
            q: query,
            page,
            limit: 24,      // increased from 12 to 24
            sfw: true,
            order_by: "popularity",  // sort by popularity so main series comes first
        },
    });
    return response.data;
};

export const getAnimeById = async (malId) => {
    await delay(1000);
    const response = await axios.get(`${BASE_URL}/anime/${malId}`);
    return response.data;
};