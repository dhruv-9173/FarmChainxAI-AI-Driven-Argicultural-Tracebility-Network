import type { RecipientType } from "../../../../types/dashboard.types";
import type { TransferRecipientDto } from "../../../transfer/api/transferApi";
import styles from "./TransferBatchModal.module.css";

interface Props {
    recipientType: RecipientType;
    recipients: TransferRecipientDto[];
    search: string;
    onSearchChange: (value: string) => void;
    loading: boolean;
    error: string;
    onSelect: (recipient: TransferRecipientDto) => void;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

export default function StepSelectRecipient({
    recipientType,
    recipients,
    search,
    onSearchChange,
    loading,
    error,
    onSelect,
}: Props) {
    const placeholder =
        recipientType === "Distributor"
            ? "Search distributors by name or email..."
            : recipientType === "Retailer"
                ? "Search retailers by name or email..."
                : "Search consumers by name or email...";

    const roleBadgeColor = (role: string): string => {
        if (role === "DISTRIBUTOR") return "#1D4ED8";
        if (role === "RETAILER") return "#7C3AED";
        return "#4B5563";
    };

    return (
        <div>
            {/* Search */}
            <div className={styles.searchWrap}>
                <svg
                    className={styles.searchIcon}
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <input
                    className={styles.searchInput}
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className={styles.emptyState}>
                    <p>Loading recipients...</p>
                </div>
            ) : error ? (
                <div className={styles.emptyState}>
                    <p>{error}</p>
                </div>
            ) : recipients.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No {recipientType.toLowerCase()}s match your search.</p>
                </div>
            ) : (
                <div className={styles.recipientList}>
                    {recipients.map((r) => (
                        <div key={r.id} className={styles.recipientCard}>
                            {/* Avatar */}
                            <div className={styles.recipientAvatar}>{getInitials(r.fullName)}</div>

                            {/* Info */}
                            <div className={styles.recipientInfo}>
                                <p className={styles.recipientName}>{r.fullName}</p>
                                <p className={styles.recipientMeta}>
                                    ✉ {r.email} &nbsp;·&nbsp; 📞 {r.phone}
                                </p>
                                <div className={styles.recipientStats}>
                                    <span className={styles.statChip}>{r.transferCount} transfers</span>
                                    <span
                                        className={styles.statChip}
                                        style={{
                                            borderColor: `${roleBadgeColor(r.role)}55`,
                                            color: roleBadgeColor(r.role),
                                        }}
                                    >
                                        {r.role}
                                    </span>
                                    <span className={styles.statChip}>
                                        Last: {r.lastTransferDate || "N/A"}
                                    </span>
                                </div>
                            </div>

                            {/* Transfer button */}
                            <button
                                className={styles.transferBtn}
                                onClick={() => onSelect(r)}
                                type="button"
                            >
                                Transfer
                            </button>
                        </div>
                    ))}
        </div>
            )}
        </div>
    );
}
