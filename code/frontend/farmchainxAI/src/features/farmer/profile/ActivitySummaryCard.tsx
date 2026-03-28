import { useEffect, useState } from "react";
import { getFarmerKPIs } from "../api/farmerApi";
import type { KPICard } from "../../../types/dashboard.types";
import styles from "./profile.module.css";

export default function ActivitySummaryCard() {
  const [stats, setStats] = useState<KPICard[]>([]);

  useEffect(() => {
    getFarmerKPIs()
      .then((data) => setStats(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch farmer KPI stats:", error);
        setStats([]);
      });
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIconWrap} style={{ background: "#F5F3FF" }}>
          <svg
            width="17"
            height="17"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#7C3AED"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className={styles.cardTitle}>Account Activity</h3>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.title} className={styles.statBox}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
