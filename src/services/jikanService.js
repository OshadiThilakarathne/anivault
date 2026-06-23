import axios from "axios";

const BASE_URL = "https://api.jikan.moe/v4";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const searchAnime = async (query, page = 1) => {
    await delay(300); // reduced from 1000ms
    const response = await axios.get(`${BASE_URL}/anime`, {
        params: {
            q: query,
            page,
            limit: 24,
            sfw: true,
            order_by: "popularity",
        },
    });
    return response.data;
};

export const getAnimeById = async (malId) => {
    await delay(300);
    const response = await axios.get(`${BASE_URL}/anime/${malId}`);
    return response.data;
};