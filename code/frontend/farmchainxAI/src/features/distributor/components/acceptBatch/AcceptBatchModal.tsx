import { useState } from "react";
import { createPortal } from "react-dom";
import type { DistributorBatch } from "../../types/distributor.types";
import styles from "./AcceptBatchModal.module.css";

interface Props {
  batch: DistributorBatch;
  onClose: () => void;
  onAccept: (note: string) => void;
  onReject: (note: string) => void;
}

export default function AcceptBatchModal({
  batch,
  onClose,
  onAccept,
  onReject,
}: Props) {
  const [note, setNote] = useState("");
  const [acting, setActing] = useState<"accept" | "reject" | null>(null);

  const scoreColor =
    batch.qualityScore >= 85
      ? "#16A34A"
      : batch.qualityScore >= 70
      ? "#F59E0B"
      : "#EF4444";
  const scoreLabel =
    batch.qualityScore >= 85
      ? "Excellent"
      : batch.qualityScore >= 70
      ? "Good"
      : "Below Standard";

  function handleAccept() {
    setActing("accept");
    setTimeout(() => onAccept(note), 250);
  }

  function handleReject() {
    setActing("reject");
    setTimeout(() => onReject(note), 250);
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Review Incoming Batch</h2>
            <p className={styles.subtitle}>
              Inspect and accept or reject this batch
            </p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="30"
              height="30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Batch summary card */}
        <div className={styles.batchCard}>
          <div className={styles.batchCardTop}>
            <div>
              <span className={styles.batchId}>{batch.id}</span>
              <span className={styles.incomingBadge}>ðŸ“¥ Incoming</span>
            </div>
            {batch.organic && (
              <span className={styles.organicBadge}>ðŸŒ¿ Organic</span>
            )}
          </div>

          <div className={styles.detailGrid}>
            {[
              [
                "Crop",
                `${batch.cropType}${
                  batch.variety ? ` (${batch.variety})` : ""
                }`,
              ],
              ["Quantity", batch.quantity],
              ["Farmer", batch.farmerName],
              ["Farm Location", batch.farmLocation],
              ["Quality Grade", batch.qualityGrade ?? "â€”"],
              ["Farmer ID", batch.farmerId],
              ["Received On", batch.receivedAt],
              ["Shelf Life", `${batch.shelfLifeDays} days remaining`],
            ].map(([label, value]) => (
              <div className={styles.detailItem} key={label}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailValue}>{value}</span>
              </div>
            ))}
          </div>

          {/* Quality score */}
          <div className={styles.qualitySection}>
            <div className={styles.qualityLeft}>
              <span className={styles.qualityLabel}>Quality Score</span>
              <div className={styles.qualityScoreRow}>
                <span
                  className={styles.qualityScore}
                  style={{ color: scoreColor }}
                >
                  {batch.qualityScore}
                </span>
                <span className={styles.qualityMax}>/100</span>
                <span
                  className={styles.qualityTag}
                  style={{ background: `${scoreColor}14`, color: scoreColor }}
                >
                  {scoreLabel}
                </span>
              </div>
            </div>
            <div className={styles.qualityBarWrap}>
              <div className={styles.qualityBarBg}>
                <div
                  className={styles.qualityBarFill}
                  style={{
                    width: `${batch.qualityScore}%`,
                    background: scoreColor,
                  }}
                />
              </div>
              <div className={styles.qualityThresholds}>
                <span
                  style={{ left: "70%" }}
                  className={styles.thresholdMark}
                />
                <span
                  style={{ left: "85%" }}
                  className={styles.thresholdMark}
                />
              </div>
            </div>
          </div>

          {/* Price info if available */}
          {batch.basePrice && batch.marketPrice && (
            <div className={styles.priceRow}>
              <div className={styles.priceItem}>
                <span className={styles.priceLabel}>Base Price</span>
                <span className={styles.priceValue}>â‚¹{batch.basePrice}/kg</span>
              </div>
              <div className={styles.priceItem}>
                <span className={styles.priceLabel}>Market Price</span>
                <span
                  className={styles.priceValue}
                  style={{ color: "#16A34A" }}
                >
                  â‚¹{batch.marketPrice}/kg
                </span>
              </div>
              <div className={styles.priceItem}>
                <span className={styles.priceLabel}>Margin</span>
                <span
                  className={styles.priceValue}
                  style={{ color: "#7C3AED" }}
                >
                  +
                  {Math.round(
                    ((batch.marketPrice - batch.basePrice) / batch.basePrice) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Inspection notes */}
        <div className={styles.notesSection}>
          <label className={styles.notesLabel}>
            Inspection Notes
            <span className={styles.notesOptional}>(optional)</span>
          </label>
          <textarea
            className={styles.notesInput}
            placeholder="Add inspection observations, quality notes, or reason for rejection..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        {/* Footer actions */}
        <div className={styles.footer}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={acting !== null}
          >
            Cancel
          </button>
          <div className={styles.actionBtns}>
            <button
              className={styles.rejectBtn}
              onClick={handleReject}
              disabled={acting !== null}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {acting === "reject" ? "Rejectingâ€¦" : "Reject Batch"}
            </button>
            <button
              className={styles.acceptBtn}
              onClick={handleAccept}
              disabled={acting !== null}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {acting === "accept" ? "Acceptingâ€¦" : "Accept Batch"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
