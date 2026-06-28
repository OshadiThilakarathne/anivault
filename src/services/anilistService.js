import axios from "axios";

const ANILIST_URL = "https://graphql.anilist.co";

const query = (graphqlQuery, variables) =>
    axios.post(ANILIST_URL, { query: graphqlQuery, variables }, {
        headers: { "Content-Type": "application/json" },
    });

// ── Search anime ─────────────────────────────────────────────────────────────
export const searchAnime = async (search, page = 1) => {
    const { data } = await query(`
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 24) {
        pageInfo { hasNextPage }
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
          id
          title { romaji english }
          coverImage { large }
          description(asHtml: false)
          genres
          episodes
          startDate { year }
          studios(isMain: true) { nodes { name } }
          status
          averageScore
        }
      }
    }
  `, { search, page });

    const media = data.data.Page.media;
    return {
        data: media.map(normalizeAnime),
        pagination: { has_next_page: data.data.Page.pageInfo.hasNextPage },
    };
};

// ── Get anime by ID ───────────────────────────────────────────────────────────
export const getAnimeById = async (id) => {
    const { data } = await query(`
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english }
        coverImage { large }
        description(asHtml: false)
        genres
        episodes
        startDate { year }
        studios(isMain: true) { nodes { name } }
        status
        averageScore
        recommendations(sort: RATING_DESC, perPage: 6) {
          nodes {
            mediaRecommendation {
              id
              title { romaji english }
              coverImage { large }
              episodes
              startDate { year }
              genres
              studios(isMain: true) { nodes { name } }
            }
          }
        }
      }
    }
  `, { id });

    const m = data.data.Media;
    return { data: normalizeAnime(m), recommendations: m.recommendations };
};

// ── Get recommendations ───────────────────────────────────────────────────────
export const getAnimeRecommendations = async (id) => {
    const { data } = await query(`
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        recommendations(sort: RATING_DESC, perPage: 6) {
          nodes {
            mediaRecommendation {
              id
              title { romaji english }
              coverImage { large }
              episodes
              startDate { year }
              genres
              studios(isMain: true) { nodes { name } }
            }
          }
        }
      }
    }
  `, { id });

    const nodes = data.data.Media.recommendations.nodes;
    return {
        data: nodes
            .filter((n) => n.mediaRecommendation)
            .map((n) => ({ entry: normalizeAnime(n.mediaRecommendation) })),
    };
};

// ── Top anime by category ─────────────────────────────────────────────────────
export const getTopAnime = async (sort = "POPULARITY_DESC", page = 1) => {
    const { data } = await query(`
    query ($sort: [MediaSort], $page: Int) {
      Page(page: $page, perPage: 12) {
        media(type: ANIME, sort: $sort, status_not: NOT_YET_RELEASED) {
          id
          title { romaji english }
          coverImage { large }
          episodes
          startDate { year }
          genres
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  `, { sort: [sort], page });

    return data.data.Page.media.map(normalizeAnime);
};

export const getAiringAnime = async () => {
    const { data } = await query(`
    query {
      Page(perPage: 12) {
        media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
          id
          title { romaji english }
          coverImage { large }
          episodes
          startDate { year }
          genres
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  `, {});
    return data.data.Page.media.map(normalizeAnime);
};

export const getUpcomingAnime = async () => {
    const { data } = await query(`
    query {
      Page(perPage: 12) {
        media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC) {
          id
          title { romaji english }
          coverImage { large }
          episodes
          startDate { year }
          genres
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  `, {});
    return data.data.Page.media.map(normalizeAnime);
};

// ── Genre IDs for AniList ─────────────────────────────────────────────────────
export const GENRE_IDS = {
    "Action": "Action",
    "Adventure": "Adventure",
    "Comedy": "Comedy",
    "Drama": "Drama",
    "Fantasy": "Fantasy",
    "Horror": "Horror",
    "Mystery": "Mystery",
    "Romance": "Romance",
    "Sci-Fi": "Sci-Fi",
    "Slice of Life": "Slice of Life",
    "Sports": "Sports",
    "Supernatural": "Supernatural",
    "Thriller": "Thriller",
};

export const getAnimeByGenre = async (genre) => {
    const { data } = await query(`
    query ($genre: String) {
      Page(perPage: 12) {
        media(type: ANIME, genre: $genre, sort: SCORE_DESC) {
          id
          title { romaji english }
          coverImage { large }
          episodes
          startDate { year }
          genres
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  `, { genre });

    return { data: data.data.Page.media.map(normalizeAnime) };
};

// ── Normalize AniList response to match our app's data shape ─────────────────
export const normalizeAnime = (m) => ({
    mal_id: m.id,      // we use this as our ID
    id: m.id,
    title: m.title?.romaji || "",
    title_english: m.title?.english || m.title?.romaji || "",
    images: {
        jpg: {
            image_url: m.coverImage?.large || "",
            large_image_url: m.coverImage?.large || "",
        },
    },
    synopsis: m.description?.replace(/<[^>]*>/g, "") || "",
    genres: (m.genres || []).map((g) => ({ name: g, mal_id: g })),
    episodes: m.episodes || null,
    year: m.startDate?.year || null,
    studios: m.studios?.nodes?.map((s) => ({ name: s.name })) || [],
    score: m.averageScore ? m.averageScore / 10 : null,
});