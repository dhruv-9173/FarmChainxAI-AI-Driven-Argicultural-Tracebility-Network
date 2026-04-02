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
import type {
  FarmerPredictiveInsights,
  QualityTrendPoint,
} from "../../../types/dashboard.types";
import styles from "./AIInsights.module.css";

interface AIInsightsProps {
  data: QualityTrendPoint[];
  predictiveInsights?: FarmerPredictiveInsights | null;
}

export default function AIInsights({
  data,
  predictiveInsights,
}: AIInsightsProps) {
  const shelfLifeRisk = predictiveInsights?.shelfLifeRisk;

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

      {predictiveInsights && (
        <>
          <div className={styles.predictiveHeaderRow}>
            <p className={styles.chartLabel}>Predicted Quality Trajectory</p>
            <span className={styles.modelMeta}>
              {predictiveInsights.modelVersion} | conf.
              {Math.round(predictiveInsights.confidence * 100)}%
            </span>
          </div>

          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={predictiveInsights.qualityForecast}
                margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
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
                  dataKey="actual"
                  name="Actual"
                  stroke="#0EA5E9"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0EA5E9" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#F59E0B" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {shelfLifeRisk && (
            <div className={styles.riskGrid}>
              <div className={styles.riskCard}>
                <p className={styles.riskLabel}>Shelf-Life Risk</p>
                <p className={styles.riskValue}>{shelfLifeRisk.riskLevel}</p>
              </div>
              <div className={styles.riskCard}>
                <p className={styles.riskLabel}>High-Risk Batches</p>
                <p className={styles.riskValue}>
                  {shelfLifeRisk.highRiskBatches}
                </p>
              </div>
              <div className={styles.riskCard}>
                <p className={styles.riskLabel}>Avg Days Left</p>
                <p className={styles.riskValue}>
                  {shelfLifeRisk.avgRemainingShelfLifeDays}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
