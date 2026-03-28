import type { Batch } from "../../../../types/dashboard.types";
import styles from "./TransferBatchModal.module.css";

interface Props {
  batches: Batch[];
  selectedBatch: Batch | null;
  onSelect: (batch: Batch) => void;
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
}: Props) {
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
        Select a harvested batch below to initiate the transfer to distributor.
      </div>

      {batches.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No harvested batches available for transfer.</p>
          <p style={{ fontSize: "0.8rem", marginTop: 4 }}>
            Only batches with "HARVESTED" status can be transferred.
          </p>
        </div>
      ) : (
        <div className={styles.batchList}>
          {batches.map((b) => {
            const isSelected = selectedBatch?.id === b.id;
            const qs = qualityStyle(b.qualityScore);
            return (
              <div
                key={b.id}
                className={`${styles.batchCard} ${
                  isSelected ? styles.batchSelected : ""
                }`}
                onClick={() => onSelect(b)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(b)}
              >
                <div className={styles.batchCardLeft}>
                  <p className={styles.batchCardId}>{b.id}</p>
                  <p className={styles.batchCardMeta}>
                    Crop: {b.cropType}
                    {b.variety ? ` · ${b.variety}` : ""} &nbsp;·&nbsp; Qty:{" "}
                    {b.quantity}
                  </p>
                </div>
                <span
                  className={styles.qualityPill}
                  style={{ background: qs.bg, color: qs.color }}
                >
                  Quality {b.qualityScore}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
