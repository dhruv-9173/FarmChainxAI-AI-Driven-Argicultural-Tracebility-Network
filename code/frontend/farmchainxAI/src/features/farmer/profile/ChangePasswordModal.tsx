import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./profile.module.css";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

interface Fields {
    current: string;
    next: string;
    confirm: string;
}

interface Errors {
    current?: string;
    next?: string;
    confirm?: string;
}

function getStrength(pwd: string): { pct: number; color: string; label: string } {
    if (pwd.length === 0) return { pct: 0, color: "#E5E7EB", label: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-zA-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    if (score <= 1) return { pct: 25, color: "#EF4444", label: "Weak" };
    if (score === 2) return { pct: 50, color: "#F59E0B", label: "Fair" };
    if (score === 3) return { pct: 75, color: "#2563EB", label: "Good" };
    return { pct: 100, color: "#16A34A", label: "Strong" };
}

export default function ChangePasswordModal({ onClose, onSuccess }: Props) {
    const [fields, setFields] = useState<Fields>({ current: "", next: "", confirm: "" });
    const [errors, setErrors] = useState<Errors>({});
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const [saving, setSaving] = useState(false);
    const strength = getStrength(fields.next);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", h);
        return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
    }, [onClose]);

    const validate = (): Errors => {
        const e: Errors = {};
        if (!fields.current) e.current = "Current password is required";
        if (!fields.next) e.next = "New password is required";
        else if (fields.next.length < 8) e.next = "Password must be at least 8 characters";
        else if (!/[a-zA-Z]/.test(fields.next) || !/[0-9]/.test(fields.next))
            e.next = "Password must include letters and numbers";
        if (fields.confirm !== fields.next) e.confirm = "Passwords do not match";
        return e;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true);
        await new Promise((r) => setTimeout(r, 900)); // simulated async
        setSaving(false);
        onSuccess();
        onClose();
    };

    const handleChange = (field: keyof Fields, val: string) => {
        setFields((p) => ({ ...p, [field]: val }));
        setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    };

    return createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Change Password</h3>
                    <button className={styles.modalCloseBtn} onClick={onClose}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {(["current", "next", "confirm"] as (keyof Fields)[]).map((key) => {
                        const labels = { current: "Current Password", next: "New Password", confirm: "Confirm Password" };
                        return (
                            <div key={key} className={styles.formRow}>
                                <label className={styles.formLabel}>{labels[key]}</label>
                                <div className={styles.passwordInput}>
                                    <input
                                        className={`${styles.passwordInputField} ${errors[key] ? styles.hasError : ""}`}
                                        type={show[key] ? "text" : "password"}
                                        value={fields[key]}
                                        onChange={(e) => handleChange(key, e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete={key === "current" ? "current-password" : "new-password"}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeBtn}
                                        onClick={() => setShow((p) => ({ ...p, [key]: !p[key] }))}
                                    >
                                        {show[key] ? (
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors[key] && <span className={styles.fieldError}>{errors[key]}</span>}
                                {key === "next" && fields.next && (
                                    <div className={styles.passwordStrength}>
                                        <div className={styles.strengthBar}>
                                            <div className={styles.strengthFill} style={{ width: `${strength.pct}%`, background: strength.color }} />
                                        </div>
                                        <span className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose} type="button">Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSubmit} type="button" disabled={saving}>
                        {saving ? <span className={styles.spinner} /> : (
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {saving ? "Updating..." : "Update Password"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
