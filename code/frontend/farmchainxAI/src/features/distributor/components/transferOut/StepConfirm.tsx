import type {
  DistributorBatch,
} from "../../types/distributor.types";
import type { TransferRecipientDto } from "../../../transfer/api/transferApi";
import styles from "./TransferOutModal.module.css";

interface Props {
  batch: DistributorBatch;
  recipient: TransferRecipientDto;
  note: string;
  onNoteChange: (v: string) => void;
  onConfirm: () => void;
  confirming: boolean;
}

export default function StepConfirm({
  batch,
  recipient,
  note,
  onNoteChange,
  onConfirm,
  confirming,
}: Props) {
  const scoreColor =
    batch.qualityScore >= 85
      ? "#16A34A"
      : batch.qualityScore >= 70
      ? "#F59E0B"
      : "#EF4444";

  return (
    <div>
      <p className={styles.stepDesc}>
        Review the transfer details below and confirm to proceed.
      </p>

      {/* Summary card */}
      <div className={styles.summaryCard}>
        <h4 className={styles.summaryTitle}>Transfer Summary</h4>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Batch ID</span>
            <span
              className={styles.summaryValue}
              style={{ fontFamily: "monospace" }}
            >
              {batch.id}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Crop</span>
            <span className={styles.summaryValue}>
              {batch.cropType}
              {batch.variety ? ` (${batch.variety})` : ""}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Quantity</span>
            <span className={styles.summaryValue}>{batch.quantity}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Quality Score</span>
            <span className={styles.summaryValue} style={{ color: scoreColor }}>
              {batch.qualityScore}/100
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Recipient Type</span>
            <span className={styles.summaryValue}>{recipient.role}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Recipient</span>
            <span className={styles.summaryValue}>{recipient.fullName}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Email</span>
            <span className={styles.summaryValue}>{recipient.email}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Contact</span>
            <span className={styles.summaryValue}>{recipient.phone}</span>
          </div>
        </div>
      </div>

      {/* Transfer note */}
      <div className={styles.noteSection}>
        <label className={styles.noteLabel}>
          Transfer Note
          <span className={styles.noteOptional}>(optional)</span>
        </label>
        <textarea
          className={styles.noteInput}
          placeholder="Any instructions or notes for the recipient..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* Confirm */}
      <div className={styles.confirmRow}>
        <button
          className={styles.confirmBtn}
          onClick={onConfirm}
          disabled={confirming}
        >
          {confirming ? (
            "Processing…"
          ) : (
            <>
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Confirm Transfer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

