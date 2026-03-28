import { useEffect, useState } from "react";
import styles from "./profile.module.css";

interface Props {
    message: string;
    type?: "success" | "error";
    onDismiss: () => void;
}

export default function ProfileToast({ message, type = "success", onDismiss }: Props) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setExiting(true), 3000);
        const t2 = setTimeout(() => onDismiss(), 3400);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [onDismiss]);

    return (
        <div
            className={`${styles.toast} ${type === "success" ? styles.toastSuccess : styles.toastError} ${exiting ? styles.toastExiting : ""}`}
        >
            {type === "success" ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            {message}
        </div>
    );
}
