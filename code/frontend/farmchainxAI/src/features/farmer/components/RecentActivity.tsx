import type { ActivityItem } from "../../../types/dashboard.types";
import styles from "./RecentActivity.module.css";

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Activity</h3>
        <p className={styles.subtitle}>Latest events &amp; notifications</p>
      </div>
      <div className={styles.list}>
        {activities.map((a) => (
          <div className={styles.item} key={a.id}>
            <div
              className={styles.itemDot}
              style={{ background: a.badgeColor }}
            />
            <div className={styles.itemContent}>
              <div className={styles.itemTop}>
                <span className={styles.itemTitle}>{a.title}</span>
                <span
                  className={styles.itemBadge}
                  style={{
                    background: `${a.badgeColor}14`,
                    color: a.badgeColor,
                  }}
                >
                  {a.badge}
                </span>
              </div>
              <p className={styles.itemDesc}>{a.description}</p>
              <span className={styles.itemTime}>{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
