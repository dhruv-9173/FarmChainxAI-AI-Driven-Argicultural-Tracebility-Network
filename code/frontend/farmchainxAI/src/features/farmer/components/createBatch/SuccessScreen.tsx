import styles from "./SuccessScreen.module.css";

interface Props {
  batchId: string;
  qrDataUrl: string;
  onViewBatch: () => void;
  onCreateAnother: () => void;
  onClose: () => void;
}

export default function SuccessScreen({
  batchId,
  qrDataUrl,
  onViewBatch,
  onCreateAnother,
  onClose,
}: Props) {
  const handleDownloadQR = () => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${batchId}-qr.png`;
    a.click();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.iconCircle}>
        <svg
          width="40"
          height="40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#16A34A"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className={styles.title}>Batch Successfully Created</h2>
      <p className={styles.subtitle}>
        Your crop batch has been registered on FarmChainX
      </p>

      <div className={styles.idCard}>
        <span className={styles.idLabel}>Batch ID</span>
        <span className={styles.idValue}>{batchId}</span>
      </div>

      <div className={styles.qrSection}>
        <img src={qrDataUrl} alt="Batch QR Code" className={styles.qrImage} />
        <span className={styles.qrHint}>
          Scan to verify batch on blockchain
        </span>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={handleDownloadQR}>
          <svg
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download QR
        </button>
        <button className={styles.btnSecondary} onClick={onViewBatch}>
          <svg
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View Batch
        </button>
        <button className={styles.btnOutline} onClick={onCreateAnother}>
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Another Batch
        </button>
      </div>

      <button className={styles.doneBtn} onClick={onClose}>
        Done
      </button>
    </div>
  );
}
