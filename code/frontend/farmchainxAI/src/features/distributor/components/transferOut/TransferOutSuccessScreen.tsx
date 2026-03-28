import type {
  DistributorBatch,
} from "../../types/distributor.types";
import type {
  BatchTransferResponse,
  TransferRecipientDto,
} from "../../../transfer/api/transferApi";
import styles from "./TransferOutModal.module.css";

interface Props {
  batch: DistributorBatch;
  recipient: TransferRecipientDto;
  transfer: BatchTransferResponse;
  onClose: () => void;
  onTransferAnother: () => void;
}

export default function TransferOutSuccessScreen({
  batch,
  recipient,
  transfer,
  onClose,
  onTransferAnother,
}: Props) {
  return (
    <div className={styles.successScreen}>
      {/* Animated check */}
      <div className={styles.successIconWrap}>
        <div className={styles.successIconCircle}>
          <svg
            width="40"
            height="40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#fff"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h2 className={styles.successTitle}>Batch Successfully Transferred!</h2>
      <p className={styles.successSubtitle}>
        The batch is now in transit and the recipient has been notified.
      </p>

      {/* Summary */}
      <div className={styles.successCard}>
        <div className={styles.successRow}>
          <span className={styles.successLabel}>Batch ID</span>
          <span
            className={styles.successValue}
            style={{ fontFamily: "monospace" }}
          >
            {batch.id}
          </span>
        </div>
        <div className={styles.successRow}>
          <span className={styles.successLabel}>Crop</span>
          <span className={styles.successValue}>{batch.cropType}</span>
        </div>
        <div className={styles.successRow}>
          <span className={styles.successLabel}>Recipient</span>
          <span className={styles.successValue}>{recipient.fullName}</span>
        </div>
        <div className={styles.successRow}>
          <span className={styles.successLabel}>Transfer ID</span>
          <span className={styles.successValue}>{transfer.transferId}</span>
        </div>
        <div className={styles.successRow}>
          <span className={styles.successLabel}>Status</span>
          <span className={styles.inTransitBadge}>{transfer.status}</span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.successActions}>
        <button
          className={styles.successSecondaryBtn}
          onClick={onTransferAnother}
        >
          Transfer Another Batch
        </button>
        <button className={styles.successPrimaryBtn} onClick={onClose}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

