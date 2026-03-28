import type { DistributorNotification } from "../types/distributor.types";
import styles from "./NotificationsPanel.module.css";

interface Props {
  notifications: DistributorNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const TYPE_COLOR: Record<DistributorNotification["type"], string> = {
  incoming_batch: "#2563EB",
  transfer_confirmed: "#16A34A",
  quality_alert: "#F59E0B",
  system: "#6B7280",
};

export default function NotificationsPanel({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
}: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Notifications</h3>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} new</span>
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
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔔</span>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.unread : ""}`}
              onClick={() => !n.read && onMarkRead(n.id)}
            >
              <div
                className={styles.iconCircle}
                style={{
                  background: `${TYPE_COLOR[n.type]}14`,
                  color: TYPE_COLOR[n.type],
                }}
              >
                {n.icon}
              </div>
              <div className={styles.content}>
                <div className={styles.itemTop}>
                  <span className={styles.itemTitle}>{n.title}</span>
                  {!n.read && <span className={styles.dot} />}
                </div>
                <p className={styles.message}>{n.message}</p>
                <span className={styles.timestamp}>{n.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

