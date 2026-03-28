import { useNavigate } from "react-router-dom";
import styles from "./DistributorQuickActions.module.css";

interface Props {
  onTransferOut?: () => void;
  onQualityCheck?: () => void;
}

export default function DistributorQuickActions({ onTransferOut, onQualityCheck }: Props) {
  const navigate = useNavigate();
  return (
    <div className={styles.section}>
      <div className={styles.textArea}>
        <h3 className={styles.title}>Quick Actions</h3>
        <p className={styles.subtitle}>
          Manage incoming and outbound batches efficiently
        </p>
      </div>
      <div className={styles.buttons}>
        <button className={styles.purple} onClick={onTransferOut}>
          <svg
            width="17"
            height="17"
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
          Transfer Out
        </button>

        <button className={styles.outline} onClick={onQualityCheck}>
          <svg
            width="17"
            height="17"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quality Check
        </button>

        <button
          className={styles.outline}
          onClick={() => navigate("/distributor/browse")}
        >
          <svg
            width="17"
            height="17"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Browse Users
        </button>
      </div>
    </div>
  );
}
