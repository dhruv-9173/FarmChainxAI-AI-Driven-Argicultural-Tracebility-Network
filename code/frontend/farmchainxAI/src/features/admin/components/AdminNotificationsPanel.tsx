import type { AdminNotification } from "../types/admin.types";
import styles from "./AdminNotificationsPanel.module.css";

interface Props {
  notifications: AdminNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const PRIORITY_COLORS = {
  high: { bg: "#FEF2F2", border: "#FECACA", dot: "#DC2626" },
  medium: { bg: "#FFFBEB", border: "#FDE68A", dot: "#D97706" },
  low: { bg: "#EFF6FF", border: "#BFDBFE", dot: "#2563EB" },
};

export default function AdminNotificationsPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: Props) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>🔔 Notifications</h3>
          {unread > 0 && <span className={styles.badge}>{unread}</span>}
        </div>
        {unread > 0 && (
          <button className={styles.markAllBtn} onClick={onMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>No notifications.</div>
        ) : (
          notifications.map((n) => {
            const pc = PRIORITY_COLORS[n.priority];
            return (
              <div
                key={n.id}
                className={`${styles.item} ${n.read ? styles.itemRead : ""}`}
                style={{
                  background: n.read ? "#FAFAFA" : pc.bg,
                  borderLeft: `3px solid ${n.read ? "#E5E7EB" : pc.border}`,
                }}
              >
                <div className={styles.itemIcon}>{n.icon}</div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTitle}>
                    {!n.read && (
                      <span
                        className={styles.dot}
                        style={{ background: pc.dot }}
                      />
                    )}
                    {n.title}
                  </div>
                  <div className={styles.itemMsg}>{n.message}</div>
                  <div className={styles.itemMeta}>
                    <span className={styles.time}>{n.timestamp}</span>
                    {n.targetRole && (
                      <span className={styles.target}>→ {n.targetRole}</span>
                    )}
                  </div>
                </div>
                {!n.read && (
                  <button
                    className={styles.readBtn}
                    onClick={() => onMarkRead(n.id)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

