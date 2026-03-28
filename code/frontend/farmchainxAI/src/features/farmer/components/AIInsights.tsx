import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { QualityTrendPoint } from "../../../types/dashboard.types";
import styles from "./AIInsights.module.css";

interface AIInsightsProps {
  data: QualityTrendPoint[];
}

export default function AIInsights({ data }: AIInsightsProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>AI Insights &amp; Analytics</h3>
          <p className={styles.subtitle}>Powered by FarmChainX AI</p>
        </div>
        <span className={styles.improvBadge}>+5.2% avg</span>
      </div>

      <p className={styles.chartLabel}>Quality Score Trends</p>

      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              domain={[60, 100]}
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
            <Line
              type="monotone"
              dataKey="wheat"
              name="Wheat"
              stroke="#16A34A"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#16A34A" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="rice"
              name="Rice"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#2563EB" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
