import "./ThemePicker.css";

const THEMES = [
    {
        id: "dark",
        name: "AniVault Dark",
        description: "Default dark theme with mint & lavender",
        preview: { bg: "#08090f", accent: "#5eeab0", surface: "#0f1218", text: "#e8eaf0" },
    },
    {
        id: "ghibli",
        name: "Studio Ghibli",
        description: "Warm cream tones, soft and dreamy",
        preview: { bg: "#faf6ed", accent: "#8aab83", surface: "#ffffff", text: "#3d3a31" },
    },
    {
        id: "otaku",
        name: "Full Otaku",
        description: "Bold manga-style with red & yellow",
        preview: { bg: "#0a0a0a", accent: "#ffd60a", surface: "#161616", text: "#ffffff" },
    },
    {
        id: "cyberpunk",
        name: "Cyberpunk",
        description: "Neon Tokyo nights, pink & cyan",
        preview: { bg: "#050510", accent: "#00ffcc", surface: "#0a0a1a", text: "#e0e0ff" },
    },
    {
        id: "nord",
        name: "Nord",
        description: "Cool blue-grey Arctic palette",
        preview: { bg: "#2e3440", accent: "#88c0d0", surface: "#3b4252", text: "#eceff4" },
    },
];

export default function ThemePicker({ currentTheme, onSelect, onClose }) {
    return (
        <div className="theme-picker__backdrop" onClick={onClose}>
            <div className="theme-picker" onClick={(e) => e.stopPropagation()}>
                <div className="theme-picker__header">
                    <h2 className="theme-picker__title">Choose Theme</h2>
                    <button className="theme-picker__close" onClick={onClose}>✕</button>
                </div>
                <div className="theme-picker__grid">
                    {THEMES.map((theme) => (
                        <button
                            key={theme.id}
                            className={`theme-picker__card ${currentTheme === theme.id ? "theme-picker__card--active" : ""}`}
                            onClick={() => { onSelect(theme.id); onClose(); }}
                        >
                            {/* Mini preview */}
                            <div
                                className="theme-picker__preview"
                                style={{ background: theme.preview.bg }}
                            >
                                <div className="theme-picker__preview-nav" style={{ background: theme.preview.surface, borderBottom: `2px solid ${theme.preview.accent}` }}>
                                    <div className="theme-picker__preview-dot" style={{ background: theme.preview.accent }} />
                                    <div className="theme-picker__preview-lines">
                                        <div style={{ background: theme.preview.text, opacity: 0.3, height: 3, borderRadius: 2, width: "30%" }} />
                                        <div style={{ background: theme.preview.text, opacity: 0.2, height: 3, borderRadius: 2, width: "20%" }} />
                                        <div style={{ background: theme.preview.text, opacity: 0.2, height: 3, borderRadius: 2, width: "20%" }} />
                                    </div>
                                </div>
                                <div className="theme-picker__preview-body">
                                    <div className="theme-picker__preview-card" style={{ background: theme.preview.surface }}>
                                        <div style={{ background: theme.preview.accent, height: 4, borderRadius: 2, width: "60%", marginBottom: 4 }} />
                                        <div style={{ background: theme.preview.text, opacity: 0.2, height: 3, borderRadius: 2, width: "80%" }} />
                                    </div>
                                    <div className="theme-picker__preview-card" style={{ background: theme.preview.surface }}>
                                        <div style={{ background: theme.preview.accent, height: 4, borderRadius: 2, width: "45%", marginBottom: 4 }} />
                                        <div style={{ background: theme.preview.text, opacity: 0.2, height: 3, borderRadius: 2, width: "70%" }} />
                                    </div>
                                </div>
                            </div>
                            <div className="theme-picker__info">
                                <p className="theme-picker__name">{theme.name}</p>
                                <p className="theme-picker__desc">{theme.description}</p>
                            </div>
                            {currentTheme === theme.id && (
                                <span className="theme-picker__active-badge">✓ Active</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}