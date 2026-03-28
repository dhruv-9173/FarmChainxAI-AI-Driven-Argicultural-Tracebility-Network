import type { DistributorBatch } from "../types/distributor.types";
import styles from "./BatchPipelinePanel.module.css";

interface Props {
  batches: DistributorBatch[];
}

const STAGES = [
  { key: "Incoming" as const, label: "Incoming", icon: "📥", color: "#2563EB" },
  { key: "Accepted" as const, label: "Accepted", icon: "✅", color: "#16A34A" },
  {
    key: "In Transit" as const,
    label: "In Transit",
    icon: "🚚",
    color: "#7C3AED",
  },
  {
    key: "Transferred" as const,
    label: "Transferred",
    icon: "📤",
    color: "#6B7280",
  },
];

export default function BatchPipelinePanel({ batches }: Props) {
  const counts = {
    Incoming: batches.filter((b) => b.status === "Incoming").length,
    Accepted: batches.filter((b) => b.status === "Accepted").length,
    "In Transit": batches.filter((b) => b.status === "In Transit").length,
    Transferred: batches.filter((b) => b.status === "Transferred").length,
    Rejected: batches.filter((b) => b.status === "Rejected").length,
  };

  const totalActive = batches.length - counts.Rejected;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Batch Pipeline</h3>
          <p className={styles.subtitle}>Live supply chain status</p>
        </div>
        <span className={styles.totalBadge}>{totalActive} active</span>
      </div>

      {/* Pipeline flow */}
      <div className={styles.pipeline}>
        {STAGES.map((stage, i) => (
          <div key={stage.key} className={styles.stageWrapper}>
            <div
              className={styles.stageBox}
              style={{
                borderColor: `${stage.color}40`,
                background: `${stage.color}08`,
              }}
            >
              <span className={styles.stageIcon}>{stage.icon}</span>
              <span
                className={styles.stageCount}
                style={{ color: stage.color }}
              >
                {counts[stage.key]}
              </span>
              <span className={styles.stageLabel}>{stage.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={styles.arrow}>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#d1d5db"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rejected row */}
      <div className={styles.rejectedRow}>
        <span className={styles.rejectedIcon}>✗</span>
        <span className={styles.rejectedText}>
          <strong>{counts.Rejected}</strong> batches rejected
        </span>
        {counts.Rejected > 0 && (
          <span className={styles.rejectedBadge}>Review required</span>
        )}
      </div>

      {/* Quick stats grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ borderLeftColor: "#2563EB" }}>
          <p className={styles.statLabel}>Avg Quality</p>
          <p className={styles.statValue} style={{ color: "#2563EB" }}>
            {batches.length > 0
              ? (
                  batches.reduce((s, b) => s + b.qualityScore, 0) /
                  batches.length
                ).toFixed(0)
              : 0}
          </p>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: "#16A34A" }}>
          <p className={styles.statLabel}>Organic</p>
          <p className={styles.statValue} style={{ color: "#16A34A" }}>
            {batches.filter((b) => b.organic).length}
          </p>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: "#7C3AED" }}>
          <p className={styles.statLabel}>To Retailers</p>
          <p className={styles.statValue} style={{ color: "#7C3AED" }}>
            {batches.filter((b) => b.recipientType === "Retailer").length}
          </p>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: "#F59E0B" }}>
          <p className={styles.statLabel}>To Consumers</p>
          <p className={styles.statValue} style={{ color: "#F59E0B" }}>
            {batches.filter((b) => b.recipientType === "Consumer").length}
          </p>
        </div>
      </div>

      {/* Storage utilization */}
      <div className={styles.storageSection}>
        <div className={styles.storageLabelRow}>
          <span className={styles.storageLabel}>Warehouse Utilization</span>
          <span className={styles.storagePercent}>82%</span>
        </div>
        <div className={styles.storageBarBg}>
          <div
            className={styles.storageBarFill}
            style={{ width: "82%", background: "#F59E0B" }}
          />
        </div>
        <p className={styles.storageNote}>
          41,000 MT / 50,000 MT capacity used
        </p>
      </div>
    </div>
  );
}

