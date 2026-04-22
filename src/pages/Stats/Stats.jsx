import { useAnime } from "../../hooks/useAnime";
import { useNavigate } from "react-router-dom";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { Search } from "lucide-react";
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

export default function Stats() {
    const { library, stats } = useAnime();
    const navigate = useNavigate();

    // ── Status data for donut ─────────────────────────────────────────────────
    const statusData = [
        { name: "Completed", value: stats.completed },
        { name: "Watching", value: stats.watching },
        { name: "Plan to Watch", value: stats.planToWatch },
        { name: "On Hold", value: stats.onHold },
        { name: "Dropped", value: stats.dropped },
    ].filter((d) => d.value > 0);

    // ── Genre data for bar chart ──────────────────────────────────────────────
    const genreMap = {};
    library.forEach((anime) => {
        anime.genres?.forEach((g) => {
            genreMap[g] = (genreMap[g] || 0) + 1;
        });
    });
    const genreData = Object.entries(genreMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // ── Rating distribution ───────────────────────────────────────────────────
    const ratingMap = {};
    for (let i = 1; i <= 10; i++) ratingMap[i] = 0;
    library.forEach((anime) => {
        if (anime.userRating) ratingMap[anime.userRating]++;
    });
    const ratingData = Object.entries(ratingMap).map(([rating, count]) => ({
        rating: `${rating}★`,
        count,
    }));

    // ── Empty state ───────────────────────────────────────────────────────────
    if (library.length === 0) {
        return (
            <div className="stats-page">
                <div className="stats-page__header">
                    <h1 className="stats-page__title">Stats</h1>
                </div>
                <div className="stats-page__empty">
                    <p className="stats-page__empty-icon">鬼</p>
                    <p className="stats-page__empty-title">No data yet</p>
                    <p className="stats-page__empty-sub">
                        Add anime to your library to see your stats.
                    </p>
                    <button
                        className="stats-page__empty-btn"
                        onClick={() => navigate("/search")}
                    >
                        <Search size={15} /> Find Anime
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="stats-page">

            {/* ── Header ── */}
            <div className="stats-page__header">
                <h1 className="stats-page__title">Stats</h1>
                <p className="stats-page__subtitle">Your anime journey by the numbers</p>
            </div>

            {/* ── Summary Row ── */}
            <div className="stats-page__summary">
                <SummaryPill label="Unique Titles" value={stats.totalUnique} />
                <SummaryPill label="Completed" value={stats.completed} />
                <SummaryPill label="Episodes Watched" value={stats.totalEpisodes} />
                <SummaryPill label="Average Rating" value={stats.averageRating ? `${stats.averageRating} / 10` : "—"} />
            </div>

            <div className="stats-page__grid">

                {/* ── Status Donut ── */}
                {statusData.length > 0 && (
                    <div className="stats-card">
                        <h2 className="stats-card__title">Library Breakdown</h2>
                        <div className="stats-card__chart-wrapper">
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry) => (
                                            <Cell
                                                key={entry.name}
                                                fill={STATUS_COLORS[entry.name] || "#6b7280"}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: "#0f1218",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: "8px",
                                            color: "#e8eaf0",
                                            fontSize: "0.8rem",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        <div className="stats-card__legend">
                            {statusData.map((entry) => (
                                <div key={entry.name} className="stats-card__legend-item">
                                    <span
                                        className="stats-card__legend-dot"
                                        style={{ background: STATUS_COLORS[entry.name] || "#6b7280" }}
                                    />
                                    <span className="stats-card__legend-label">{entry.name}</span>
                                    <span className="stats-card__legend-value">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Genre Bar Chart ── */}
                {genreData.length > 0 && (
                    <div className="stats-card">
                        <h2 className="stats-card__title">Top Genres</h2>
                        <div className="stats-card__chart-wrapper">
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart
                                    data={genreData}
                                    layout="vertical"
                                    margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(255,255,255,0.05)"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        tick={{ fill: "#6b7280", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={90}
                                        tick={{ fill: "#e8eaf0", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#0f1218",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: "8px",
                                            color: "#e8eaf0",
                                            fontSize: "0.8rem",
                                        }}
                                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                    />
                                    <Bar dataKey="count" fill={MINT} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ── Rating Distribution ── */}
                {library.some((a) => a.userRating) && (
                    <div className="stats-card stats-card--wide">
                        <h2 className="stats-card__title">Rating Distribution</h2>
                        <div className="stats-card__chart-wrapper">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={ratingData}
                                    margin={{ top: 0, right: 16, bottom: 0, left: -16 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(255,255,255,0.05)"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="rating"
                                        tick={{ fill: "#6b7280", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#6b7280", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#0f1218",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: "8px",
                                            color: "#e8eaf0",
                                            fontSize: "0.8rem",
                                        }}
                                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                    />
                                    <Bar dataKey="count" fill={LAVENDER} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// ── Summary Pill ──────────────────────────────────────────────────────────────
function SummaryPill({ label, value }) {
    return (
        <div className="summary-pill">
            <span className="summary-pill__value">{value}</span>
            <span className="summary-pill__label">{label}</span>
        </div>
    );
}