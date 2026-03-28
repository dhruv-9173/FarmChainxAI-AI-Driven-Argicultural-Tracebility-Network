import type { SystemHealthMetric } from "../types/admin.types";
import styles from "./SystemHealth.module.css";

interface Props {
  metrics: SystemHealthMetric[];
}

const STATUS_CONFIG = {
  Operational: { color: "#16A34A", bg: "#F0FDF4", label: "Operational" },
  Degraded: { color: "#D97706", bg: "#FFFBEB", label: "Degraded" },
  Down: { color: "#DC2626", bg: "#FEF2F2", label: "Down" },
};

export default function SystemHealth({ metrics }: Props) {
  const allOk = metrics.every((m) => m.status === "Operational");
  const hasDegraded = metrics.some((m) => m.status === "Degraded");
  const hasDown = metrics.some((m) => m.status === "Down");

  const overallStatus = hasDown
    ? "Incident"
    : hasDegraded
    ? "Degraded"
    : "All Systems Operational";

  const overallColor = hasDown
    ? "#DC2626"
    : hasDegraded
    ? "#D97706"
    : "#16A34A";

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>⚙️ System Health</h3>
        <span
          className={styles.overallBadge}
          style={{
            color: overallColor,
            background: allOk ? "#F0FDF4" : hasDegraded ? "#FFFBEB" : "#FEF2F2",
          }}
        >
          {overallStatus}
        </span>
      </div>

      <div className={styles.grid}>
        {metrics.map((m) => {
          const sc = STATUS_CONFIG[m.status];
          return (
            <div
              key={m.name}
              className={styles.card}
              style={{ borderTop: `3px solid ${sc.color}` }}
            >
              <div className={styles.cardTop}>
                <span className={styles.icon}>{m.icon}</span>
                <span className={styles.dot} style={{ background: sc.color }} />
              </div>
              <div className={styles.serviceName}>{m.name}</div>
              <div
                className={styles.statusLabel}
                style={{ color: sc.color, background: sc.bg }}
              >
                {sc.label}
              </div>
              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Uptime</span>
                  <span className={styles.metricVal}>{m.uptime}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Latency</span>
                  <span className={styles.metricVal}>{m.latency}</span>
                </div>
              </div>
              {/* Uptime bar */}
              <div className={styles.uptimeBar}>
                <div
                  className={styles.uptimeFill}
                  style={{
                    width: m.uptime,
                    background: sc.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

