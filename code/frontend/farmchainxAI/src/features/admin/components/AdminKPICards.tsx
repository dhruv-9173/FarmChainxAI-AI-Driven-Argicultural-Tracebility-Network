import type { AdminUser, AdminBatch } from "../types/admin.types";
import styles from "./AdminKPICards.module.css";

interface Props {
  users: AdminUser[];
  batches: AdminBatch[];
}

export default function AdminKPICards({ users, batches }: Props) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const pendingUsers = users.filter((u) => u.status === "Pending").length;
  const suspendedUsers = users.filter((u) => u.status === "Suspended").length;

  const totalBatches = batches.length;
  const inTransitBatches = batches.filter(
    (b) =>
      b.status === "In Transit" ||
      b.status === "Incoming" ||
      b.status === "Accepted"
  ).length;
  const expiredBatches = batches.filter((b) => b.status === "Expired").length;
  const avgQuality =
    batches.length > 0
      ? Math.round(
          batches.reduce((sum, b) => sum + b.qualityScore, 0) / batches.length
        )
      : 0;

  const kpis = [
    {
      label: "Total Users",
      value: totalUsers,
      sub: `${activeUsers} active · ${pendingUsers} pending`,
      icon: "👥",
      color: "#2563EB",
      bg: "#EFF6FF",
      trend:
        pendingUsers > 0
          ? `+${pendingUsers} awaiting approval`
          : "All approved",
      trendColor: pendingUsers > 0 ? "#F59E0B" : "#16A34A",
    },
    {
      label: "Active Accounts",
      value: activeUsers,
      sub: `${Math.round((activeUsers / totalUsers) * 100)}% of total`,
      icon: "✅",
      color: "#16A34A",
      bg: "#F0FDF4",
      trend:
        suspendedUsers > 0 ? `${suspendedUsers} suspended` : "No suspensions",
      trendColor: suspendedUsers > 0 ? "#EF4444" : "#16A34A",
    },
    {
      label: "Total Batches",
      value: totalBatches,
      sub: `${inTransitBatches} in pipeline`,
      icon: "📦",
      color: "#7C3AED",
      bg: "#F5F3FF",
      trend: `${expiredBatches} expired`,
      trendColor: expiredBatches > 0 ? "#EF4444" : "#16A34A",
    },
    {
      label: "Avg. Quality Score",
      value: `${avgQuality}/100`,
      sub: "Across all batches",
      icon: "⭐",
      color: "#EA580C",
      bg: "#FFF7ED",
      trend:
        avgQuality >= 80 ? "Platform health: Good" : "Review flagged batches",
      trendColor: avgQuality >= 80 ? "#16A34A" : "#EF4444",
    },
  ];

  return (
    <div className={styles.grid}>
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={styles.card}
          style={{ borderTopColor: kpi.color }}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconWrap} style={{ background: kpi.bg }}>
              <span className={styles.icon}>{kpi.icon}</span>
            </div>
            <div className={styles.valueWrap}>
              <span className={styles.value} style={{ color: kpi.color }}>
                {kpi.value}
              </span>
              <span className={styles.label}>{kpi.label}</span>
            </div>
          </div>
          <p className={styles.sub}>{kpi.sub}</p>
          <p className={styles.trend} style={{ color: kpi.trendColor }}>
            {kpi.trend}
          </p>
        </div>
      ))}
    </div>
  );
}

