import type { RetailerNotification } from "../types/retailer.types";
import styles from "./RetailerNotifications.module.css";

interface Props {
  notifications: RetailerNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const TYPE_COLOR: Record<RetailerNotification["type"], string> = {
  incoming_batch: "#2563EB",
  low_stock: "#EA580C",
  expiry_alert: "#EF4444",
  payment: "#16A34A",
  system: "#6B7280",
};

export default function RetailerNotifications({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
}: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Notifications</h3>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={onMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>No notifications</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.unread : ""}`}
              onClick={() => onMarkRead(n.id)}
              style={{ borderLeftColor: TYPE_COLOR[n.type] }}
            >
              <div className={styles.iconBox}>{n.icon}</div>
              <div className={styles.content}>
                <div className={styles.notifTitle}>{n.title}</div>
                <div className={styles.message}>{n.message}</div>
                {n.batchId && (
                  <div className={styles.batchRef}>Batch: {n.batchId}</div>
                )}
                <div className={styles.timestamp}>{n.timestamp}</div>
              </div>
              {!n.read && <div className={styles.dot} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
