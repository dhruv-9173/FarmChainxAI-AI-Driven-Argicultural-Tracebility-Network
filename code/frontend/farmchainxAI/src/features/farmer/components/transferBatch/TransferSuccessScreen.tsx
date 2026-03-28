import type {
    BatchTransferResponse,
    TransferRecipientDto,
} from "../../../transfer/api/transferApi";
import styles from "./TransferBatchModal.module.css";

interface Props {
    batchId: string;
    recipient: TransferRecipientDto;
    transfer: BatchTransferResponse;
    onViewBatch: () => void;
    onTransferAnother: () => void;
    onClose: () => void;
}

export default function TransferSuccessScreen({
    batchId,
    recipient,
    transfer,
    onViewBatch,
    onTransferAnother,
    onClose,
}: Props) {
    return (
        <div className={styles.successOverlay}>
            {/* Animated checkmark icon */}
            <div className={styles.successIcon}>
                <svg
                    width="36"
                    height="36"
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

            <h2 className={styles.successTitle}>Batch Successfully Transferred!</h2>
            <p className={styles.successSubtitle}>
                The transfer has been initiated and the recipient has been notified.
            </p>

            {/* Details */}
            <div className={styles.successDetails}>
                <div className={styles.successDetailRow}>
                    <span className={styles.successDetailLabel}>Batch ID</span>
                    <span className={styles.successDetailValue}>{batchId}</span>
                </div>
                <div className={styles.successDetailRow}>
                    <span className={styles.successDetailLabel}>Recipient</span>
                    <span className={styles.successDetailValue}>{recipient.fullName}</span>
                </div>
                <div className={styles.successDetailRow}>
                    <span className={styles.successDetailLabel}>Transfer ID</span>
                    <span className={styles.successDetailValue}>
                        {transfer.transferId}
                    </span>
                </div>
                <div className={styles.successDetailRow}>
                    <span className={styles.successDetailLabel}>Status</span>
                    <span className={styles.awaitingBadge}>{transfer.status}</span>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.successActions}>
                <button className={styles.btnOutline} onClick={onViewBatch} type="button">
                    View Batch
                </button>
                <button className={styles.btnPrimary} onClick={onTransferAnother} type="button">
                    Transfer Another Batch
                </button>
                <button className={styles.btnGreen} onClick={onClose} type="button">
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}
