import type { ShelfLifeItem } from "../../../types/dashboard.types";
import styles from "./ShelfLifePanel.module.css";

interface ShelfLifePanelProps {
  items: ShelfLifeItem[];
}

const STATUS_COLORS: Record<string, string> = {
  Healthy: "#16A34A",
  Moderate: "#F59E0B",
  Critical: "#EF4444",
};

export default function ShelfLifePanel({ items }: ShelfLifePanelProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Shelf Life Estimation</h3>
        <p className={styles.subtitle}>AI-predicted batch shelf life</p>
      </div>
      <div className={styles.list}>
        {items.map((item) => {
          const color = STATUS_COLORS[item.status];
          return (
            <div className={styles.item} key={item.batchId}>
              <div className={styles.itemTop}>
                <div>
                  <span className={styles.crop}>{item.crop}</span>
                  <span className={styles.batchId}>{item.batchId}</span>
                </div>
                <span className={styles.days}>{item.daysLeft} days left</span>
              </div>
              <div className={styles.barBg}>
                <div
                  className={styles.barFill}
                  style={{ width: `${item.percent}%`, background: color }}
                />
              </div>
              <div className={styles.itemBottom}>
                <span className={styles.pct}>
                  {item.percent}% shelf life remaining
                </span>
                <span className={styles.status} style={{ color }}>
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
