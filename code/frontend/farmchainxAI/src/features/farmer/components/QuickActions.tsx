import { useNavigate } from "react-router-dom";
import styles from "./QuickActions.module.css";

interface QuickActionsProps {
  onCreateBatch?: () => void;
  onTransferBatch?: () => void;
}

export default function QuickActions({
  onCreateBatch,
  onTransferBatch,
}: QuickActionsProps) {
  const navigate = useNavigate();
  return (
    <div className={styles.section}>
      <div className={styles.textArea}>
        <h3 className={styles.title}>Quick Actions</h3>
        <p className={styles.subtitle}>Manage your farm batches efficiently</p>
      </div>
      <div className={styles.buttons}>
        <button className={styles.primary} onClick={onCreateBatch}>
          <svg
            width="18"
            height="18"
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
          Create New Batch
        </button>
        <button className={styles.secondary} onClick={onTransferBatch}>
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          Transfer Batch
        </button>
        <button
          className={styles.outline}
          onClick={() => navigate("/farmer/browse")}
        >
          <svg
            width="18"
            height="18"
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
          Explore Market
        </button>
      </div>
    </div>
  );
}
