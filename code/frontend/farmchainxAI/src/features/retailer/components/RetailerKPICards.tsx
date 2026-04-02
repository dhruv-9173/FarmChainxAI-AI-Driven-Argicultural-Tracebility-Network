import type { RetailerBatch } from "../types/retailer.types";
import styles from "./RetailerKPICards.module.css";

interface Props {
  batches: RetailerBatch[];
}

function KPICard({
  label,
  value,
  sub,
  color,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  sub: string;
  color: string;
  icon: string;
  trend?: { direction: "up" | "down" | "stable"; percent: number };
}) {
  return (
    <div className={styles.card} style={{ borderTopColor: color }}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrap} style={{ background: `${color}15` }}>
          <span className={styles.icon}>{icon}</span>
        </div>
        {trend && (
          <div className={styles.trendBadge} style={{ color }}>
            {trend.direction === "up" && "↑"}
            {trend.direction === "down" && "↓"}
            {trend.direction === "stable" && "→"}
            {trend.percent}%
          </div>
        )}
      </div>
      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value} style={{ color }}>
          {value}
        </p>
        <p className={styles.sub}>{sub}</p>
      </div>
    </div>
  );
}

export default function RetailerKPICards({ batches }: Props) {
  const total = batches.length;
  const incoming = batches.filter((b) => b.status === "Accepted").length;
  const inStock = batches.filter(
    (b) =>
      b.status === "Available" ||
      b.status === "Low Stock" ||
      b.status === "Accepted"
  ).length;
  const lowStock = batches.filter((b) => b.status === "Low Stock").length;
  const soldOut = batches.filter((b) => b.status === "Sold Out").length;

  const totalRevenue = batches.reduce((sum, b) => sum + (b.revenue ?? 0), 0);
  const revenueStr =
    totalRevenue >= 100000
      ? `Rs ${(totalRevenue / 100000).toFixed(1)}L`
      : `Rs ${(totalRevenue / 1000).toFixed(1)}K`;

  const avgQuality =
    batches.length > 0
      ? Math.round(
          batches.reduce((s, b) => s + b.qualityScore, 0) / batches.length
        )
      : 0;

  const totalQty = batches.reduce((sum, b) => {
    const qtyStr = b.remainingQty?.split(" ")[0] || "0";
    return sum + parseInt(qtyStr, 10);
  }, 0);

  return (
    <div className={styles.grid}>
      <KPICard
        label="Total Batches"
        value={total}
        sub={`${inStock} in stock, ${incoming} awaiting shelfing`}
        color="#16A34A"
        icon="📦"
        trend={{ direction: "up", percent: 12 }}
      />
      <KPICard
        label="Available Stock"
        value={`${totalQty} kg`}
        sub={`${inStock} batches across sections`}
        color="#0891B2"
        icon="🏪"
        trend={{ direction: "up", percent: 8 }}
      />
      <KPICard
        label="Low Stock Alerts"
        value={lowStock}
        sub={lowStock > 0 ? "Reorder recommended" : "All levels healthy"}
        color={lowStock > 0 ? "#EA580C" : "#6B7280"}
        icon="⚠️"
        trend={lowStock > 0 ? { direction: "down", percent: 3 } : undefined}
      />
      <KPICard
        label="Sold This Month"
        value={soldOut}
        sub="Successfully sold batches"
        color="#7C3AED"
        icon="✓"
        trend={{ direction: "up", percent: 15 }}
      />
      <KPICard
        label="Total Revenue"
        value={revenueStr}
        sub="from sold batches"
        color="#F59E0B"
        icon="💰"
        trend={{ direction: "up", percent: 24 }}
      />
      <KPICard
        label="Avg. Quality Score"
        value={`${avgQuality}/100`}
        sub={
          avgQuality >= 85
            ? "Excellent quality"
            : avgQuality >= 70
            ? "Good quality"
            : "Needs improvement"
        }
        color={
          avgQuality >= 85
            ? "#16A34A"
            : avgQuality >= 70
            ? "#F59E0B"
            : "#EF4444"
        }
        icon="⭐"
      />
    </div>
  );
}
