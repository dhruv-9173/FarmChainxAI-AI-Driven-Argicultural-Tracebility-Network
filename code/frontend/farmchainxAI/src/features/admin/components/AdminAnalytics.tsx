import type { AdminAnalyticsPoint } from "../types/admin.types";
import styles from "./AdminAnalytics.module.css";

interface Props {
  data: AdminAnalyticsPoint[];
}

export default function AdminAnalytics({ data }: Props) {
  const maxBatches = Math.max(
    ...data.map((d) => Math.max(d.batchesCreated, d.batchesDelivered))
  );
  const maxUsers = Math.max(
    ...data.map((d) => d.farmers + d.distributors + d.retailers)
  );

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>📊 Platform Analytics</h3>

      {/* User growth chart */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>New Registrations by Role</span>
          <div className={styles.legend}>
            <span className={styles.legendItem} style={{ color: "#16A34A" }}>
              ● Farmers
            </span>
            <span className={styles.legendItem} style={{ color: "#2563EB" }}>
              ● Distributors
            </span>
            <span className={styles.legendItem} style={{ color: "#EA580C" }}>
              ● Retailers
            </span>
          </div>
        </div>
        <div className={styles.chartArea}>
          {data.map((d) => {
            const total = d.farmers + d.distributors + d.retailers;
            const farmerH = maxUsers > 0 ? (d.farmers / maxUsers) * 100 : 0;
            const distH = maxUsers > 0 ? (d.distributors / maxUsers) * 100 : 0;
            const retailH = maxUsers > 0 ? (d.retailers / maxUsers) * 100 : 0;
            return (
              <div key={d.month} className={styles.barGroup}>
                <div className={styles.bars}>
                  <div
                    className={styles.bar}
                    style={{ height: `${farmerH}%`, background: "#16A34A" }}
                    title={`Farmers: ${d.farmers}`}
                  />
                  <div
                    className={styles.bar}
                    style={{ height: `${distH}%`, background: "#2563EB" }}
                    title={`Distributors: ${d.distributors}`}
                  />
                  <div
                    className={styles.bar}
                    style={{ height: `${retailH}%`, background: "#EA580C" }}
                    title={`Retailers: ${d.retailers}`}
                  />
                </div>
                <div className={styles.barLabel}>{d.month.slice(0, 3)}</div>
                <div className={styles.barTotal}>{total}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batches chart */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>
            Batches Created vs Delivered
          </span>
          <div className={styles.legend}>
            <span className={styles.legendItem} style={{ color: "#7C3AED" }}>
              ● Created
            </span>
            <span className={styles.legendItem} style={{ color: "#06B6D4" }}>
              ● Delivered
            </span>
          </div>
        </div>
        <div className={styles.chartArea}>
          {data.map((d) => {
            const cH =
              maxBatches > 0 ? (d.batchesCreated / maxBatches) * 100 : 0;
            const dH =
              maxBatches > 0 ? (d.batchesDelivered / maxBatches) * 100 : 0;
            return (
              <div key={d.month} className={styles.barGroup}>
                <div className={styles.bars}>
                  <div
                    className={styles.bar}
                    style={{ height: `${cH}%`, background: "#7C3AED" }}
                    title={`Created: ${d.batchesCreated}`}
                  />
                  <div
                    className={styles.bar}
                    style={{ height: `${dH}%`, background: "#06B6D4" }}
                    title={`Delivered: ${d.batchesDelivered}`}
                  />
                </div>
                <div className={styles.barLabel}>{d.month.slice(0, 3)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary row */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal} style={{ color: "#16A34A" }}>
            {data.reduce((a, d) => a + d.farmers, 0)}
          </span>
          <span className={styles.summaryLabel}>Total Farmers</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal} style={{ color: "#2563EB" }}>
            {data.reduce((a, d) => a + d.distributors, 0)}
          </span>
          <span className={styles.summaryLabel}>Total Distributors</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal} style={{ color: "#EA580C" }}>
            {data.reduce((a, d) => a + d.retailers, 0)}
          </span>
          <span className={styles.summaryLabel}>Total Retailers</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal} style={{ color: "#7C3AED" }}>
            {data.reduce((a, d) => a + d.batchesCreated, 0)}
          </span>
          <span className={styles.summaryLabel}>Batches Created</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal} style={{ color: "#06B6D4" }}>
            {data.reduce((a, d) => a + d.batchesDelivered, 0)}
          </span>
          <span className={styles.summaryLabel}>Batches Delivered</span>
        </div>
      </div>
    </div>
  );
}

