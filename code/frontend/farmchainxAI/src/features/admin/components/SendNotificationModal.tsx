import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./SendNotificationModal.module.css";

type TargetRole = "ALL" | "FARMER" | "DISTRIBUTOR" | "RETAILER" | "CONSUMER";
type Priority = "low" | "medium" | "high";

interface Props {
  onClose: () => void;
  onSend: (payload: {
    targetRole: TargetRole;
    message: string;
    priority: Priority;
  }) => void;
}

export default function SendNotificationModal({ onClose, onSend }: Props) {
  const [targetRole, setTargetRole] = useState<TargetRole>("ALL");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !title.trim()) return;
    onSend({ targetRole, message: message.trim(), priority });
    onClose();
  };

  const PRIORITY_COLORS: Record<Priority, string> = {
    low: "#2563EB",
    medium: "#D97706",
    high: "#DC2626",
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>📣</span>
            <div>
              <h2 className={styles.headerTitle}>Send Notification</h2>
              <p className={styles.headerSub}>
                Broadcast a message to platform users
              </p>
            </div>
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
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Target Role */}
          <div className={styles.field}>
            <label className={styles.label}>Target Audience</label>
            <div className={styles.roleGrid}>
              {(
                [
                  "ALL",
                  "FARMER",
                  "DISTRIBUTOR",
                  "RETAILER",
                  "CONSUMER",
                ] as TargetRole[]
              ).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.roleChip} ${
                    targetRole === r ? styles.roleChipActive : ""
                  }`}
                  onClick={() => setTargetRole(r)}
                >
                  {r === "ALL"
                    ? "🌐 All Users"
                    : r === "FARMER"
                    ? "🌾 Farmers"
                    : r === "DISTRIBUTOR"
                    ? "🚚 Distributors"
                    : r === "RETAILER"
                    ? "🏪 Retailers"
                    : "👤 Consumers"}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className={styles.field}>
            <label className={styles.label}>Priority</label>
            <div className={styles.priorityRow}>
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.priorityBtn} ${
                    priority === p ? styles.priorityBtnActive : ""
                  }`}
                  style={
                    priority === p
                      ? {
                          background: PRIORITY_COLORS[p],
                          borderColor: PRIORITY_COLORS[p],
                          color: "#fff",
                        }
                      : {}
                  }
                  onClick={() => setPriority(p)}
                >
                  {p === "high" ? "🔴" : p === "medium" ? "🟡" : "🔵"}{" "}
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label}>Notification Title</label>
            <input
              className={styles.input}
              placeholder="e.g. System Maintenance Notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
            />
          </div>

          {/* Message */}
          <div className={styles.field}>
            <label className={styles.label}>Message</label>
            <textarea
              className={styles.textarea}
              placeholder="Write your notification message here…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              required
            />
            <div className={styles.charCount}>{message.length}/500</div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!message.trim() || !title.trim()}
            >
              📣 Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
