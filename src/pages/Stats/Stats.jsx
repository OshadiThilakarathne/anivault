import { useAnime } from "../../hooks/useAnime";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Search, Calendar, BookOpen, Star, Layers } from "lucide-react";
import "./Stats.css";

const STATUS_COLORS = {
    Completed: "#a78bfa",
    Watching: "#64deb4",
    "Plan to Watch": "#60a5fa",
    "On Hold": "#fbbf24",
    Dropped: "#f87171",
};

const MINT = "#64deb4";
const LAVENDER = "#a78bfa";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Stats() {
    const { library, stats } = useAnime();
    const navigate = useNavigate();

    const avgEpisodeMins = 24;
    const totalMins = stats.totalEpisodes * avgEpisodeMins;
    const daysWatched = (totalMins / 60 / 24).toFixed(1);

    const statusRows = [
        { label: "Watching", key: "watching", value: stats.watching, color: "#64deb4" },
        { label: "Completed", key: "completed", value: stats.completed, color: "#a78bfa" },
        { label: "On Hold", key: "on_hold", value: stats.onHold, color: "#fbbf24" },
        { label: "Dropped", key: "dropped", value: stats.dropped, color: "#f87171" },
        { label: "Plan to Watch", key: "plan_to_watch", value: stats.planToWatch, color: "#60a5fa" },
    ];
    const maxStatus = Math.max(...statusRows.map((s) => s.value), 1);

    const genreMap = {};
    library.forEach((item) => {
        const genres = item.isGroup ? item.genres : item.genres || [];
        genres.forEach((g) => { genreMap[g] = (genreMap[g] || 0) + 1; });
    });
    const genreData = Object.entries(genreMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const ratingMap = {};
    for (let i = 1; i <= 10; i++) ratingMap[i] = 0;
    library.forEach((item) => {
        if (item.userRating) ratingMap[item.userRating]++;
    });
    const ratingData = Object.entries(ratingMap).map(([rating, count]) => ({ rating, count }));

    const statusDonut = statusRows
        .filter((s) => s.value > 0)
        .map((s) => ({ name: s.label, value: s.value }));

    if (library.length === 0) {
        return (
            <div className="stats-page">
                <div className="stats-page__header">
                    <h1 className="stats-page__title">Stats</h1>
                </div>
                <div className="stats-page__empty">
                    <p className="stats-page__empty-icon">鬼</p>
                    <p className="stats-page__empty-title">No data yet</p>
                    <p className="stats-page__empty-sub">Add anime to your library to see your stats.</p>
                    <button className="stats-page__empty-btn" onClick={() => navigate("/search")}>
                        <Search size={15} /> Find Anime
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="stats-page">
            <motion.div
                className="stats-page__header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="stats-page__title">Your Stats</h1>
                <p className="stats-page__subtitle">A look at your anime journey</p>
            </motion.div>

            {/* ── Summary cards with icons ── */}
            <motion.div
                className="stats-page__summary"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
                <motion.div className="summary-card" variants={fadeUp}>
                    <div className="summary-card__icon" style={{ background: "rgba(100,222,180,0.12)", color: MINT }}>
                        <Calendar size={20} />
                    </div>
                    <span className="summary-card__value">{daysWatched}</span>
                    <span className="summary-card__label">Days Watched</span>
                </motion.div>

                <motion.div className="summary-card" variants={fadeUp}>
                    <div className="summary-card__icon" style={{ background: "rgba(167,139,250,0.12)", color: LAVENDER }}>
                        <Layers size={20} />
                    </div>
                    <span className="summary-card__value">{stats.totalUnique}</span>
                    <span className="summary-card__label">Unique Titles</span>
                </motion.div>

                <motion.div className="summary-card" variants={fadeUp}>
                    <div className="summary-card__icon" style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}>
                        <BookOpen size={20} />
                    </div>
                    <span className="summary-card__value">{stats.totalEpisodes.toLocaleString()}</span>
                    <span className="summary-card__label">Episodes</span>
                </motion.div>

                <motion.div className="summary-card" variants={fadeUp}>
                    <div className="summary-card__icon" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
                        <Star size={20} />
                    </div>
                    <span className="summary-card__value">{stats.averageRating ?? "—"}</span>
                    <span className="summary-card__label">Mean Score</span>
                </motion.div>
            </motion.div>

            {/* ── Status breakdown ── */}
            <motion.div
                className="stats-card stats-card--full"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <h2 className="stats-card__title">Anime Stats</h2>
                <div className="stats-status">
                    {statusRows.map((row) => (
                        <div
                            key={row.label}
                            className="stats-status__row stats-status__row--clickable"
                            onClick={() => navigate(`/library?status=${row.key}`)}
                        >
                            <span className="stats-status__label">{row.label}</span>
                            <div className="stats-status__bar-track">
                                <motion.div
                                    className="stats-status__bar-fill"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(row.value / maxStatus) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    viewport={{ once: true }}
                                    style={{ background: row.color }}
                                />
                            </div>
                            <span className="stats-status__value" style={{ color: row.color }}>
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="stats-page__grid">

                {library.some((a) => a.userRating) && (
                    <motion.div
                        className="stats-card"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2 className="stats-card__title">Score Distribution</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={ratingData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="rating" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ background: "#0f1218", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e8eaf0", fontSize: "0.8rem" }}
                                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                />
                                <Bar dataKey="count" fill={LAVENDER} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {genreData.length > 0 && (
                    <motion.div
                        className="stats-card"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2 className="stats-card__title">Top Genres</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={genreData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#e8eaf0", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: "#0f1218", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e8eaf0", fontSize: "0.8rem" }}
                                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                />
                                <Bar dataKey="count" fill={MINT} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {statusDonut.length > 0 && (
                    <motion.div
                        className="stats-card"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2 className="stats-card__title">Library Breakdown</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={statusDonut} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {statusDonut.map((entry) => (
                                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#6b7280"} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "#0f1218", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e8eaf0", fontSize: "0.8rem" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="stats-card__legend">
                            {statusDonut.map((entry) => (
                                <div key={entry.name} className="stats-card__legend-item">
                                    <span className="stats-card__legend-dot" style={{ background: STATUS_COLORS[entry.name] }} />
                                    <span className="stats-card__legend-label">{entry.name}</span>
                                    <span className="stats-card__legend-value">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}