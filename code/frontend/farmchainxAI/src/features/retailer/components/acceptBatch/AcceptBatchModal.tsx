import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { RetailerBatch } from "../../types/retailer.types";
import styles from "./AcceptBatchModal.module.css";

interface Props {
  batch: RetailerBatch;
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
  const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleConfirm = async () => {
    if (!decision) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    if (decision === "accept") onAccept(note);
    else onReject(note);
    setLoading(false);
    onClose();
  };

  const qualColor =
    batch.qualityScore >= 85
      ? "#16A34A"
      : batch.qualityScore >= 70
      ? "#F59E0B"
      : "#EF4444";

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.batchId}>{batch.id}</div>
            <div className={styles.title}>Review Incoming Batch</div>
          </div>
          <button className={styles.close} onClick={onClose}>
            âœ•
          </button>
        </div>

        <div className={styles.body}>
          {/* Batch Summary */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <div className={styles.summaryItem}>
                <span className={styles.sumLabel}>Crop</span>
                <span className={styles.sumValue}>
                  {batch.cropType}
                  {batch.variety ? ` (${batch.variety})` : ""}
                  {batch.organic ? " ðŸŒ¿" : ""}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.sumLabel}>Quantity</span>
                <span className={styles.sumValue}>{batch.quantity}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.sumLabel}>Source</span>
                <span className={styles.sumValue}>{batch.sourceName}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.sumLabel}>Source Type</span>
                <span className={styles.sumValue}>{batch.sourceType}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.sumLabel}>Buy Price</span>
                <span className={styles.sumValue}>â‚¹{batch.pricePerKg}/kg</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.sumLabel}>Sell Price</span>
                <span className={styles.sumValue}>
                  â‚¹{batch.sellingPricePerKg}/kg
                </span>
              </div>
            </div>

            {/* Quality */}
            <div className={styles.qualityRow}>
              <span className={styles.sumLabel}>Quality Score</span>
              <div className={styles.qualBar}>
                <div className={styles.qualBarBg}>
                  <div
                    className={styles.qualBarFill}
                    style={{
                      width: `${batch.qualityScore}%`,
                      background: qualColor,
                    }}
                  />
                </div>
                <span style={{ color: qualColor, fontWeight: 700 }}>
                  {batch.qualityScore}/100
                </span>
                {batch.qualityGrade && (
                  <span className={styles.grade}>{batch.qualityGrade}</span>
                )}
              </div>
            </div>
          </div>

          {/* Decision */}
          <div className={styles.decisionRow}>
            <button
              className={`${styles.decBtn} ${styles.decAccept} ${
                decision === "accept" ? styles.decSelected : ""
              }`}
              onClick={() => setDecision("accept")}
            >
              âœ“ Accept Batch
            </button>
            <button
              className={`${styles.decBtn} ${styles.decReject} ${
                decision === "reject" ? styles.decSelectedRed : ""
              }`}
              onClick={() => setDecision("reject")}
            >
              âœ• Reject Batch
            </button>
          </div>

          {/* Note */}
          <div className={styles.noteWrap}>
            <label className={styles.noteLabel}>
              Inspection Note (optional)
            </label>
            <textarea
              className={styles.noteArea}
              rows={3}
              placeholder="Add quality inspection notes, condition observations, or rejection reason..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={
              decision === "accept"
                ? styles.confirmGreen
                : decision === "reject"
                ? styles.confirmRed
                : styles.confirmDisabled
            }
            onClick={handleConfirm}
            disabled={!decision || loading}
          >
            {loading
              ? "Processingâ€¦"
              : decision === "accept"
              ? "Confirm Accept"
              : decision === "reject"
              ? "Confirm Reject"
              : "Select Decision"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
