import { useAnime } from "../../hooks/useAnime";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, Clock, TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import { getAiringAnime } from "../../services/anilistService";
import AnimeCard from "../../components/AnimeCard/AnimeCard";
import "./Home.css";

const STATUS_LABELS = {
    watching: { label: "Watching", color: "#64deb4" },
    completed: { label: "Completed", color: "#a78bfa" },
    plan_to_watch: { label: "Plan to Watch", color: "#60a5fa" },
    on_hold: { label: "On Hold", color: "#fbbf24" },
    dropped: { label: "Dropped", color: "#f87171" },
};

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Home() {
    const { library, stats } = useAnime();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [trending, setTrending] = useState([]);

    useEffect(() => {
        getAiringAnime()
            .then((data) => setTrending(data.slice(0, 8)))
            .catch(() => { });
    }, []);

    const recentlyAdded = [...library]
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .slice(0, 8);

    const continueWatching = library.filter(
        (a) => a.status === "watching" && !a.isGroup
    );

    const topRated = [...library]
        .filter((a) => a.userRating)
        .sort((a, b) => b.userRating - a.userRating)
        .slice(0, 6);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="home">

            {/* ── Animated Hero ── */}
            <motion.div
                className="home__hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Background */}
                <div className="home__hero-bg">
                    <div className="home__hero-orb home__hero-orb--1" />
                    <div className="home__hero-orb home__hero-orb--2" />
                    <div className="home__hero-orb home__hero-orb--3" />
                    <div className="home__hero-grid" />
                </div>

                {/* Left: Text */}
                <div className="home__hero-content">
                    <motion.div
                        className="home__hero-eyebrow"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <span className="home__hero-dot" />
                        {greeting()}, <span className="home__greeting-name">{user?.username}</span>
                    </motion.div>

                    <motion.h1
                        className="home__hero-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        Your Anime
                        <span className="home__hero-title-accent"> Vault</span>
                    </motion.h1>

                    <motion.p
                        className="home__hero-sub"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                    >
                        Every title you've loved, ranked, and remembered — all in one place.
                    </motion.p>

                    <motion.div
                        className="home__hero-actions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                    >
                        <button className="home__hero-btn home__hero-btn--primary" onClick={() => navigate("/search")}>
                            <Sparkles size={15} /> Discover Anime
                        </button>
                        <button className="home__hero-btn home__hero-btn--secondary" onClick={() => navigate("/library")}>
                            <BookOpen size={15} /> My Library
                        </button>
                    </motion.div>
                </div>

                {/* Right: Angled cover stack */}
                {recentlyAdded.slice(0, 4).length > 0 && (
                    <motion.div
                        className="home__hero-covers"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                    >
                        {recentlyAdded.slice(0, 4).map((anime, i) => (
                            <motion.div
                                key={anime._id}
                                className="home__hero-cover-wrap"
                                style={{
                                    rotate: [-8, -3, 3, 9][i],
                                    zIndex: 4 - i,
                                    marginLeft: i === 0 ? 0 : "-30px",
                                }}
                                whileHover={{ y: -16, rotate: 0, zIndex: 10, scale: 1.06 }}
                                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                            >
                                <img
                                    src={anime.coverImage}
                                    alt={anime.title}
                                    className="home__hero-cover"
                                />
                                <div
                                    className="home__hero-cover-glow"
                                    style={{ background: ["#64deb4", "#a78bfa", "#60a5fa", "#f87171"][i] }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.div>

            {/* ── Continue Watching ── */}
            {continueWatching.length > 0 && (
                <motion.section
                    className="home__section"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <div className="home__section-header">
                        <div className="home__section-title-wrapper">
                            <Clock size={18} style={{ color: "#64deb4" }} />
                            <h2 className="home__section-title">Continue Watching</h2>
                        </div>
                        <button className="home__see-all" onClick={() => navigate("/library?status=watching")}>
                            See all <ChevronRight size={14} />
                        </button>
                    </div>
                    <motion.div
                        className="home__continue-grid"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {continueWatching.map((anime) => (
                            <motion.div
                                key={anime._id}
                                className="home__continue-card"
                                variants={cardVariant}
                                whileHover={{ x: 6 }}
                                onClick={() => navigate(`/anime/${anime.malId}`)}
                            >
                                <img src={anime.coverImage} alt={anime.title} className="home__continue-cover" />
                                <div className="home__continue-info">
                                    <p className="home__continue-title">{anime.title}</p>
                                    <p className="home__continue-eps">
                                        {anime.episodeProgress || 0}
                                        {anime.episodes ? ` / ${anime.episodes} eps` : " eps watched"}
                                    </p>
                                    {anime.episodes && (
                                        <div className="home__continue-bar">
                                            <motion.div
                                                className="home__continue-bar-fill"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${Math.min(((anime.episodeProgress || 0) / anime.episodes) * 100, 100)}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                viewport={{ once: true }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>
            )}

            {/* ── Recently Added ── */}
            {recentlyAdded.length > 0 && (
                <motion.section
                    className="home__section"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <div className="home__section-header">
                        <div className="home__section-title-wrapper">
                            <BookOpen size={18} style={{ color: "#a78bfa" }} />
                            <h2 className="home__section-title">Recently Added</h2>
                        </div>
                        <button className="home__see-all" onClick={() => navigate("/library")}>
                            See all <ChevronRight size={14} />
                        </button>
                    </div>
                    <motion.div
                        className="home__recent-grid"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {recentlyAdded.map((anime) => (
                            <motion.div
                                key={anime._id}
                                className="home__recent-card"
                                variants={cardVariant}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                onClick={() => navigate(`/anime/${anime.malId}`)}
                            >
                                <div className="home__recent-cover-wrapper">
                                    <img src={anime.coverImage} alt={anime.title} className="home__recent-cover" />
                                    <div className="home__recent-overlay">
                                        <span
                                            className="home__recent-status"
                                            style={{ color: STATUS_LABELS[anime.status]?.color }}
                                        >
                                            {STATUS_LABELS[anime.status]?.label}
                                        </span>
                                    </div>
                                </div>
                                <p className="home__recent-title">{anime.title}</p>
                                {anime.userRating && (
                                    <p className="home__recent-rating">
                                        <Star size={11} fill="#fbbf24" color="#fbbf24" />
                                        {anime.userRating}/10
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>
            )}

            {/* ── Top Rated ── */}
            {topRated.length > 0 && (
                <motion.section
                    className="home__section"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <div className="home__section-header">
                        <div className="home__section-title-wrapper">
                            <TrendingUp size={18} style={{ color: "#fbbf24" }} />
                            <h2 className="home__section-title">Your Top Rated</h2>
                        </div>
                        <button className="home__see-all" onClick={() => navigate("/stats")}>
                            View stats <ChevronRight size={14} />
                        </button>
                    </div>
                    <motion.div
                        className="home__toprated-grid"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {topRated.map((anime, i) => (
                            <motion.div
                                key={anime._id}
                                className="home__toprated-card"
                                variants={cardVariant}
                                whileHover={{ x: 4, borderColor: "rgba(251,191,36,0.4)" }}
                                onClick={() => navigate(`/anime/${anime.malId}`)}
                            >
                                <span className="home__toprated-rank">#{i + 1}</span>
                                <img src={anime.coverImage} alt={anime.title} className="home__toprated-cover" />
                                <div className="home__toprated-info">
                                    <p className="home__toprated-title">{anime.title}</p>
                                    <p className="home__toprated-rating">
                                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                        {anime.userRating}/10
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>
            )}

            {/* ── Trending This Season ── */}
            {trending.length > 0 && (
                <motion.section
                    className="home__section"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <div className="home__section-header">
                        <div className="home__section-title-wrapper">
                            <Sparkles size={18} style={{ color: "#f87171" }} />
                            <h2 className="home__section-title">Trending This Season</h2>
                        </div>
                        <button className="home__see-all" onClick={() => navigate("/recommendations")}>
                            See more <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="home__trending-grid">
                        {trending.map((anime) => (
                            <AnimeCard key={anime.mal_id} anime={anime} />
                        ))}
                    </div>
                </motion.section>
            )}

            {/* ── Empty state ── */}
            {library.length === 0 && (
                <motion.div
                    className="home__empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="home__empty-icon">鬼</p>
                    <h2 className="home__empty-title">Your vault is empty</h2>
                    <p className="home__empty-sub">Start building your anime library</p>
                    <button
                        className="home__hero-btn home__hero-btn--primary"
                        onClick={() => navigate("/search")}
                    >
                        <Sparkles size={15} /> Discover Anime
                    </button>
                </motion.div>
            )}

        </div>
    );
}