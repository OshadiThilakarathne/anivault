import { useState } from "react";
import { useAnime } from "../../hooks/useAnime";
import { searchAnime } from "../../services/jikanService";
import { CheckCircle, XCircle, Loader, Upload } from "lucide-react";
import "./BulkImport.css";

const STATUS_OPTIONS = [
    { key: "completed", label: "Completed" },
    { key: "watching", label: "Watching" },
    { key: "plan_to_watch", label: "Plan to Watch" },
    { key: "on_hold", label: "On Hold" },
    { key: "dropped", label: "Dropped" },
];

const STEPS = {
    INPUT: "input",
    MATCHING: "matching",
    REVIEW: "review",
    DONE: "done",
};

export default function BulkImport() {
    const { addAnime, isInLibrary } = useAnime();

    const [step, setStep] = useState(STEPS.INPUT);
    const [text, setText] = useState("");
    const [defaultStatus, setDefaultStatus] = useState("completed");
    const [matches, setMatches] = useState([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [confirmed, setConfirmed] = useState({});
    const [importCount, setImportCount] = useState(0);

    // ── Step 1: parse titles from textarea ───────────────────────────────────
    const parseTitles = () =>
        text
            .split("\n")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

    // ── Step 2: match each title via Jikan ───────────────────────────────────
    const handleMatch = async () => {
        const titles = parseTitles();
        if (titles.length === 0) return;

        setStep(STEPS.MATCHING);
        setProgress({ current: 0, total: titles.length });
        setMatches([]);

        const results = [];

        for (let i = 0; i < titles.length; i++) {
            const title = titles[i];
            setProgress({ current: i + 1, total: titles.length });

            try {
                const data = await searchAnime(title, 1);
                const top = data.data?.[0] || null;
                results.push({
                    query: title,
                    match: top
                        ? {
                            malId: top.mal_id,
                            title: top.title,
                            titleEnglish: top.title_english || top.title,
                            coverImage: top.images?.jpg?.large_image_url || "",
                            synopsis: top.synopsis || "",
                            genres: top.genres?.map((g) => g.name) || [],
                            episodes: top.episodes || null,
                            studio: top.studios?.[0]?.name || "Unknown",
                            year: top.year || null,
                        }
                        : null,
                });
            } catch {
                results.push({ query: title, match: null });
            }
        }

        // Default all non-library matches to confirmed
        const initialConfirmed = {};
        results.forEach((r, i) => {
            if (r.match && !isInLibrary(r.match.malId)) {
                initialConfirmed[i] = true;
            }
        });

        setMatches(results);
        setConfirmed(initialConfirmed);
        setStep(STEPS.REVIEW);
    };

    // ── Step 3: toggle confirm/skip ───────────────────────────────────────────
    const toggleConfirm = (i) => {
        setConfirmed((prev) => ({ ...prev, [i]: !prev[i] }));
    };

    // ── Step 4: import confirmed ──────────────────────────────────────────────
    const handleImport = () => {
        let count = 0;
        matches.forEach((r, i) => {
            if (confirmed[i] && r.match && !isInLibrary(r.match.malId)) {
                const isCompleted = defaultStatus === "completed";
                addAnime({
                    ...r.match,
                    status: defaultStatus,
                    episodeProgress: isCompleted ? (r.match.episodes || 0) : 0,
                });
                count++;
            }
        });
        setImportCount(count);
        setStep(STEPS.DONE);
    };

    const handleReset = () => {
        setStep(STEPS.INPUT);
        setText("");
        setMatches([]);
        setConfirmed({});
        setProgress({ current: 0, total: 0 });
    };

    const confirmedCount = Object.values(confirmed).filter(Boolean).length;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="bulk-page">

            {/* ── Header ── */}
            <div className="bulk-page__header">
                <h1 className="bulk-page__title">Bulk Import</h1>
                <p className="bulk-page__subtitle">
                    Paste your anime titles and we'll match them automatically via Jikan
                </p>
            </div>

            {/* ══ STEP 1: INPUT ══ */}
            {step === STEPS.INPUT && (
                <div className="bulk-step">
                    <div className="bulk-step__field">
                        <label className="bulk-step__label">
                            Paste titles — one per line
                        </label>
                        <textarea
                            className="bulk-step__textarea"
                            placeholder={`Attack on Titan\nFullmetal Alchemist Brotherhood\nSteins;Gate\nHunter x Hunter`}
                            rows={12}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <p className="bulk-step__hint">
                            {parseTitles().length} title{parseTitles().length !== 1 ? "s" : ""} detected
                        </p>
                    </div>

                    <div className="bulk-step__field">
                        <label className="bulk-step__label">Default status</label>
                        <select
                            className="bulk-step__select"
                            value={defaultStatus}
                            onChange={(e) => setDefaultStatus(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.key} value={opt.key}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="bulk-step__btn"
                        onClick={handleMatch}
                        disabled={parseTitles().length === 0}
                    >
                        <Upload size={16} />
                        Match Titles
                    </button>
                </div>
            )}

            {/* ══ STEP 2: MATCHING ══ */}
            {step === STEPS.MATCHING && (
                <div className="bulk-matching">
                    <Loader size={36} className="bulk-matching__spinner" />
                    <p className="bulk-matching__text">
                        Matching {progress.current} of {progress.total}...
                    </p>
                    <div className="bulk-matching__bar-track">
                        <div
                            className="bulk-matching__bar-fill"
                            style={{
                                width: `${(progress.current / progress.total) * 100}%`,
                            }}
                        />
                    </div>
                    <p className="bulk-matching__hint">
                        Jikan rate-limits requests — this may take a minute
                    </p>
                </div>
            )}

            {/* ══ STEP 3: REVIEW ══ */}
            {step === STEPS.REVIEW && (
                <div className="bulk-review">
                    <div className="bulk-review__header">
                        <p className="bulk-review__summary">
                            <span className="bulk-review__count">{confirmedCount}</span> of{" "}
                            {matches.length} selected for import
                        </p>
                        <div className="bulk-review__actions">
                            <button
                                className="bulk-review__select-all"
                                onClick={() => {
                                    const next = {};
                                    matches.forEach((r, i) => {
                                        if (r.match && !isInLibrary(r.match.malId)) next[i] = true;
                                    });
                                    setConfirmed(next);
                                }}
                            >
                                Select all
                            </button>
                            <button
                                className="bulk-review__select-none"
                                onClick={() => setConfirmed({})}
                            >
                                Deselect all
                            </button>
                            <button
                                className="bulk-review__import-btn"
                                onClick={handleImport}
                                disabled={confirmedCount === 0}
                            >
                                Import {confirmedCount} Anime
                            </button>
                        </div>
                    </div>

                    <div className="bulk-review__list">
                        {matches.map((result, i) => {
                            const alreadyInLibrary = result.match && isInLibrary(result.match.malId);
                            const isConfirmed = confirmed[i];

                            return (
                                <div
                                    key={i}
                                    className={`bulk-item ${isConfirmed ? "bulk-item--confirmed" : ""} ${alreadyInLibrary ? "bulk-item--in-library" : ""
                                        } ${!result.match ? "bulk-item--no-match" : ""}`}
                                >
                                    {/* Cover */}
                                    {result.match ? (
                                        <img
                                            src={result.match.coverImage}
                                            alt={result.match.title}
                                            className="bulk-item__cover"
                                        />
                                    ) : (
                                        <div className="bulk-item__cover bulk-item__cover--empty" />
                                    )}

                                    {/* Info */}
                                    <div className="bulk-item__info">
                                        <p className="bulk-item__query">"{result.query}"</p>
                                        {result.match ? (
                                            <>
                                                <p className="bulk-item__match-title">{result.match.title}</p>
                                                <p className="bulk-item__match-meta">
                                                    {result.match.year || "—"} ·{" "}
                                                    {result.match.episodes
                                                        ? `${result.match.episodes} eps`
                                                        : "? eps"}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="bulk-item__no-match">No match found</p>
                                        )}
                                        {alreadyInLibrary && (
                                            <p className="bulk-item__already">Already in library</p>
                                        )}
                                    </div>

                                    {/* Toggle */}
                                    {result.match && !alreadyInLibrary && (
                                        <button
                                            className={`bulk-item__toggle ${isConfirmed ? "bulk-item__toggle--confirmed" : ""
                                                }`}
                                            onClick={() => toggleConfirm(i)}
                                        >
                                            {isConfirmed ? (
                                                <CheckCircle size={22} />
                                            ) : (
                                                <XCircle size={22} />
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══ STEP 4: DONE ══ */}
            {step === STEPS.DONE && (
                <div className="bulk-done">
                    <div className="bulk-done__icon">✓</div>
                    <h2 className="bulk-done__title">Import complete!</h2>
                    <p className="bulk-done__sub">
                        <span className="bulk-done__count">{importCount}</span> anime added
                        to your library
                    </p>
                    <button className="bulk-done__btn" onClick={handleReset}>
                        Import more
                    </button>
                </div>
            )}

        </div>
    );
}