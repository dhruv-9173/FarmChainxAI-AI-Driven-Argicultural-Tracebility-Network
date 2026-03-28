import type {
  RetailerBatch,
  RetailerActivityItem,
} from "../types/retailer.types";
import styles from "./RetailerShelfPanel.module.css";

interface Props {
  batches: RetailerBatch[];
  activities: RetailerActivityItem[];
}

export default function RetailerShelfPanel({ batches, activities }: Props) {
  const inStock = batches.filter(
    (b) =>
      b.status === "Available" ||
      b.status === "Low Stock" ||
      b.status === "Accepted"
  );

  return (
    <div className={styles.grid}>
      {/* Shelf Life Panel */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Shelf Life Tracker</h3>
          <p className={styles.cardSub}>Current stock expiry status</p>
        </div>
        <div className={styles.shelfList}>
          {inStock.length === 0 ? (
            <div className={styles.empty}>No in-stock batches</div>
          ) : (
            inStock.map((b) => {
              const color =
                b.shelfLifePercent >= 60
                  ? "#16A34A"
                  : b.shelfLifePercent >= 30
                  ? "#F59E0B"
                  : "#EF4444";
              const label =
                b.shelfLifePercent >= 60
                  ? "Good"
                  : b.shelfLifePercent >= 30
                  ? "Watch"
                  : "Critical";
              return (
                <div key={b.id} className={styles.shelfItem}>
                  <div className={styles.shelfTop}>
                    <div className={styles.shelfName}>
                      <span className={styles.shelfCrop}>{b.cropType}</span>
                      <span className={styles.shelfId}>{b.id}</span>
                    </div>
                    <div className={styles.shelfRight}>
                      <span className={styles.shelfDays} style={{ color }}>
                        {b.shelfLifeDays}d
                      </span>
                      <span
                        className={styles.shelfLabel}
                        style={{ background: `${color}18`, color }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                  <div className={styles.shelfBarBg}>
                    <div
                      className={styles.shelfBarFill}
                      style={{
                        width: `${b.shelfLifePercent}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <div className={styles.shelfMeta}>
                    <span>Expires: {b.expiresAt}</span>
                    <span>{b.shelfLifePercent}% remaining</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
          <p className={styles.cardSub}>Latest store operations</p>
        </div>
        <div className={styles.activityList}>
          {activities.length === 0 ? (
            <div className={styles.empty}>No recent activity</div>
          ) : (
            activities.map((a) => (
              <div key={a.id} className={styles.actItem}>
                <div
                  className={styles.actBadge}
                  style={{
                    background: `${a.badgeColor}18`,
                    color: a.badgeColor,
                  }}
                >
                  {a.badge}
                </div>
                <div className={styles.actContent}>
                  <div className={styles.actTitle}>{a.title}</div>
                  <div className={styles.actDesc}>{a.description}</div>
                  <div className={styles.actTime}>{a.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
