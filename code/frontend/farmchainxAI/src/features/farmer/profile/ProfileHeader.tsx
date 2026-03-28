import { useRef, useState } from "react";
import { useProfile } from "../../../contexts/ProfileContext";
import styles from "./profile.module.css";

interface Props {
    editMode: boolean;
    onEditToggle: () => void;
    onChangePassword: () => void;
}

export default function ProfileHeader({ editMode, onEditToggle, onChangePassword }: Props) {
    const { userProfile, updateUserProfile } = useProfile();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const initials = userProfile.fullName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            updateUserProfile({ avatarUrl: e.target?.result as string });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={styles.profileHeaderCard}>
            <div className={styles.headerLeft}>
                {/* Avatar */}
                <div className={styles.avatarWrap}>
                    <div
                        className={`${styles.avatarCircle} ${dragOver ? styles.dragActive : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            const file = e.dataTransfer.files[0];
                            if (file) handleFile(file);
                        }}
                        title="Click or drag to upload photo"
                    >
                        {userProfile.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt="Profile" />
                        ) : (
                            initials
                        )}
                        <div className={styles.avatarUploadOverlay}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Upload
                        </div>
                    </div>
                    <div className={styles.avatarUploadBadge} onClick={() => fileInputRef.current?.click()}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />
                </div>

                {/* Name & badges */}
                <div className={styles.headerInfo}>
                    <h2 className={styles.headerName}>{userProfile.fullName}</h2>
                    <div className={styles.headerBadges}>
                        <span className={styles.rolePill}>{userProfile.role}</span>
                        <span className={styles.idPill}>{userProfile.farmerId}</span>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className={styles.headerRight}>
                <button
                    className={`${styles.editBtn} ${editMode ? styles.active : ""}`}
                    onClick={onEditToggle}
                >
                    {editMode ? (
                        <>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Edit
                        </>
                    ) : (
                        <>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </>
                    )}
                </button>

                <button className={styles.pwdBtn} onClick={onChangePassword}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                </button>
            </div>
        </div>
    );
}
