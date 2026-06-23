import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { X, Loader } from "lucide-react";
import "./AvatarPicker.css";

export default function AvatarPicker({ avatars, onClose }) {
    const { user, updateAvatar } = useAuth();
    const [selected, setSelected] = useState(user?.avatar || null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await updateAvatar(selected);
            onClose();
        } catch (err) {
            console.error("Failed to update avatar:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="avatar-picker__backdrop" onClick={onClose}>
            <div className="avatar-picker" onClick={(e) => e.stopPropagation()}>
                <div className="avatar-picker__header">
                    <h2 className="avatar-picker__title">Choose your avatar</h2>
                    <button className="avatar-picker__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {avatars.length === 0 ? (
                    <div className="avatar-picker__loading">
                        <Loader size={28} className="avatar-picker__spinner" />
                        <p>Loading characters...</p>
                    </div>
                ) : (
                    <div className="avatar-picker__grid">
                        {avatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                className={`avatar-picker__item ${selected === avatar.url ? "avatar-picker__item--selected" : ""}`}
                                onClick={() => setSelected(avatar.url)}
                                title={avatar.name}
                            >
                                <img
                                    src={avatar.url}
                                    alt={avatar.name}
                                    className="avatar-picker__img"
                                />
                                <span className="avatar-picker__name">{avatar.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="avatar-picker__footer">
                    <button className="avatar-picker__cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="avatar-picker__save"
                        onClick={handleSave}
                        disabled={!selected || saving}
                    >
                        {saving ? "Saving..." : "Save Avatar"}
                    </button>
                </div>
            </div>
        </div>
    );
}