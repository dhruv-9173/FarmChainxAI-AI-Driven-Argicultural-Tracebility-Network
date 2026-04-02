import type { TransferableBatch } from "../../../../types/transfer.types";
import styles from "./TransferOutModal.module.css";

interface Props {
  batches: TransferableBatch[];
  selectedBatch: TransferableBatch | null;
  onSelect: (batch: TransferableBatch) => void;
  loading?: boolean;
  error?: string;
}

function qualityStyle(score: number): { color: string; bg: string } {
  if (score >= 85) return { color: "#166534", bg: "#DCFCE7" };
  if (score >= 70) return { color: "#92400E", bg: "#FEF3C7" };
  return { color: "#991B1B", bg: "#FEE2E2" };
}

export default function StepChooseBatch({
  batches,
  selectedBatch,
  onSelect,
  loading = false,
  error,
}: Props) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading available batches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading batches: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.batchHint}>
        <svg
          width="15"
          height="15"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#2563EB"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Select a batch that has passed quality check to transfer.
      </div>

      {batches.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No batches available for transfer.</p>
          <p style={{ fontSize: "0.8rem", marginTop: 4 }}>
            Only batches with "QUALITY_PASSED" status can be transferred.
          </p>
        </div>
      ) : (
        <div className={styles.batchList}>
          {batches.map((batch) => {
            const isSelected = selectedBatch?.id === batch.id;
            const qs = qualityStyle(batch.qualityScore);
            return (
              <div
                key={batch.id}
                className={`${styles.batchCard} ${
                  isSelected ? styles.batchSelected : ""
                }`}
                onClick={() => onSelect(batch)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(batch)}
              >
                <div className={styles.batchCardLeft}>
                  <p className={styles.batchCardId}>{batch.id}</p>
                  <p className={styles.batchCardMeta}>
                    Crop: {batch.cropType}
                    {batch.variety ? ` · ${batch.variety}` : ""} &nbsp;·&nbsp;
                    Qty: {batch.quantity} {batch.quantityUnit}
                  </p>
                  {batch.organic && (
                    <span className={styles.organicBadge}>Organic</span>
                  )}
                </div>
                <span
                  className={styles.qualityPill}
                  style={{ background: qs.bg, color: qs.color }}
                >
                  Quality {batch.qualityScore}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
