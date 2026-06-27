import { useAnime } from "../../hooks/useAnime";
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
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

    // ── Days watched ──────────────────────────────────────────────────────────
    const avgEpisodeMins = 24;
    const totalMins = stats.totalEpisodes * avgEpisodeMins;
    const daysWatched = (totalMins / 60 / 24).toFixed(1);

    // ── Status rows ───────────────────────────────────────────────────────────
    const statusRows = [
        { label: "Watching", key: "watching", value: stats.watching, color: "#64deb4" },
        { label: "Completed", key: "completed", value: stats.completed, color: "#a78bfa" },
        { label: "On Hold", key: "on_hold", value: stats.onHold, color: "#fbbf24" },
        { label: "Dropped", key: "dropped", value: stats.dropped, color: "#f87171" },
        { label: "Plan to Watch", key: "plan_to_watch", value: stats.planToWatch, color: "#60a5fa" },
    ];
    const maxStatus = Math.max(...statusRows.map((s) => s.value), 1);

    // ── Genre data ────────────────────────────────────────────────────────────
    const genreMap = {};
    library.forEach((item) => {
        const genres = item.isGroup ? item.genres : item.genres || [];
        genres.forEach((g) => {
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
    library.forEach((item) => {
        if (item.userRating) ratingMap[item.userRating]++;
    });
    const ratingData = Object.entries(ratingMap).map(([rating, count]) => ({
        rating,
        count,
    }));

    // ── Status donut ──────────────────────────────────────────────────────────
    const statusDonut = statusRows
        .filter((s) => s.value > 0)
        .map((s) => ({ name: s.label, value: s.value }));

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
            <div className="stats-page__header">
                <h1 className="stats-page__title">Stats</h1>
                <p className="stats-page__subtitle">Your anime journey by the numbers</p>
            </div>

            {/* ── Summary pills ── */}
            <div className="stats-page__summary">
                <SummaryPill label="Days Watched" value={daysWatched} />
                <SummaryPill label="Unique Titles" value={stats.totalUnique} />
                <SummaryPill label="Episodes" value={stats.totalEpisodes.toLocaleString()} />
                <SummaryPill label="Mean Score" value={stats.averageRating ?? "—"} />
            </div>

            {/* ── Status breakdown ── */}
            <div className="stats-card stats-card--full">
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
                                <div
                                    className="stats-status__bar-fill"
                                    style={{
                                        width: `${(row.value / maxStatus) * 100}%`,
                                        background: row.color,
                                    }}
                                />
                            </div>
                            <span
                                className="stats-status__value"
                                style={{ color: row.color }}
                            >
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="stats-page__grid">

                {/* ── Score Distribution ── */}
                {library.some((a) => a.userRating) && (
                    <div className="stats-card">
                        <h2 className="stats-card__title">Score Distribution</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={ratingData}
                                margin={{ top: 0, right: 8, bottom: 0, left: -20 }}
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
                )}

                {/* ── Genre Breakdown ── */}
                {genreData.length > 0 && (
                    <div className="stats-card">
                        <h2 className="stats-card__title">Top Genres</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={genreData}
                                layout="vertical"
                                margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
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
                                    width={80}
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
                )}

                {/* ── Library Breakdown Donut ── */}
                {statusDonut.length > 0 && (
                    <div className="stats-card">
                        <h2 className="stats-card__title">Library Breakdown</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={statusDonut}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {statusDonut.map((entry) => (
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
                        <div className="stats-card__legend">
                            {statusDonut.map((entry) => (
                                <div key={entry.name} className="stats-card__legend-item">
                                    <span
                                        className="stats-card__legend-dot"
                                        style={{ background: STATUS_COLORS[entry.name] }}
                                    />
                                    <span className="stats-card__legend-label">{entry.name}</span>
                                    <span className="stats-card__legend-value">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

function SummaryPill({ label, value }) {
    return (
        <div className="summary-pill">
            <span className="summary-pill__value">{value}</span>
            <span className="summary-pill__label">{label}</span>
        </div>
    );
}