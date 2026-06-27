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

export const getAnimeRecommendations = async (malId) => {
    await delay(300);
    const response = await axios.get(`${BASE_URL}/anime/${malId}/recommendations`);
    return response.data;
};

export const getAnimeByGenre = async (genreId, page = 1) => {
    await delay(300);
    const response = await axios.get(`${BASE_URL}/anime`, {
        params: {
            genres: genreId,
            page,
            limit: 12,
            order_by: "score",
            sort: "desc",
            sfw: true,
        },
    });
    return response.data;
};

// Genre name to Jikan genre ID mapping
export const GENRE_IDS = {
    "Action": 1,
    "Adventure": 2,
    "Comedy": 4,
    "Drama": 8,
    "Fantasy": 10,
    "Horror": 14,
    "Mystery": 7,
    "Romance": 22,
    "Sci-Fi": 24,
    "Slice of Life": 36,
    "Sports": 30,
    "Supernatural": 37,
    "Thriller": 41,
};