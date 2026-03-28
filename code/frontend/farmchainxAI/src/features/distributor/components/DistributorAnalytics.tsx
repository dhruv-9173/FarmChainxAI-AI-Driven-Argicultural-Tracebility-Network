import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  DistributorAnalyticsPoint,
  DistributorActivityItem,
} from "../types/distributor.types";
import styles from "./DistributorAnalytics.module.css";

interface Props {
  data: DistributorAnalyticsPoint[];
  activities: DistributorActivityItem[];
}

export default function DistributorAnalytics({ data, activities }: Props) {
  const totalReceived = data.reduce((s, d) => s + d.received, 0);
  const totalTransferred = data.reduce((s, d) => s + d.transferred, 0);
  const successRate =
    totalReceived > 0
      ? Math.round((totalTransferred / totalReceived) * 100)
      : 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Batch Analytics</h3>
          <p className={styles.subtitle}>
            Received vs Transferred — last 6 months
          </p>
        </div>
        <span className={styles.rateBadge}>{successRate}% success rate</span>
      </div>

      {/* Bar chart */}
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 0, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: 13,
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
            />
            <Bar
              dataKey="received"
              name="Received"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="transferred"
              name="Transferred"
              fill="#7C3AED"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="rejected"
              name="Rejected"
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue} style={{ color: "#2563EB" }}>
            {totalReceived}
          </span>
          <span className={styles.statLabel}>Total Received</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue} style={{ color: "#7C3AED" }}>
            {totalTransferred}
          </span>
          <span className={styles.statLabel}>Transferred Out</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue} style={{ color: "#16A34A" }}>
            {successRate}%
          </span>
          <span className={styles.statLabel}>Transfer Rate</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h4 className={styles.activityHeader}>Recent Activity</h4>
        <div className={styles.activityList}>
          {activities.slice(0, 5).map((a) => (
            <div key={a.id} className={styles.activityItem}>
              <div
                className={styles.activityDot}
                style={{ background: a.badgeColor }}
              />
              <div className={styles.activityContent}>
                <div className={styles.activityTop}>
                  <span className={styles.activityTitle}>{a.title}</span>
                  <span
                    className={styles.activityBadge}
                    style={{
                      background: `${a.badgeColor}14`,
                      color: a.badgeColor,
                    }}
                  >
                    {a.badge}
                  </span>
                </div>
                <p className={styles.activityDesc}>{a.description}</p>
                <span className={styles.activityTime}>{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

