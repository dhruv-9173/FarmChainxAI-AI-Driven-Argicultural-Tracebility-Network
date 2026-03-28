import type { TransferRecipientDto } from "../../../transfer/api/transferApi";
import styles from "./TransferOutModal.module.css";

interface Props {
  recipientType: "Retailer" | "Consumer";
  recipients: TransferRecipientDto[];
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  error: string;
  onSelect: (r: TransferRecipientDto) => void;
}

function getInitials(name: string) {
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
    recipientType === "Retailer"
      ? "Search retailers by name or email..."
      : "Search consumers by name or email...";

  return (
    <div>
      <p className={styles.stepDesc}>
        Select a {recipientType.toLowerCase()} to transfer this batch to.
      </p>

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
              <div className={styles.avatar}>{getInitials(r.fullName)}</div>

              {/* Info */}
              <div className={styles.recipientInfo}>
                <div className={styles.recipientNameRow}>
                  <span className={styles.recipientName}>{r.fullName}</span>
                </div>
                <div className={styles.recipientMeta}>
                  <span>✉ {r.email}</span>
                  <span>📞 {r.phone}</span>
                </div>
                <div className={styles.recipientMeta}>
                  <span className={styles.metaItem}>{r.transferCount} transfers</span>
                  <span className={styles.specialtyTag}>{r.role}</span>
                </div>
              </div>

              {/* Action */}
              <button
                className={styles.selectBtn}
                onClick={() => onSelect(r)}
                type="button"
              >
                Select →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

