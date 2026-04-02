import type { DistributorBatch } from "../types/distributor.types";
import styles from "./DistributorKPICards.module.css";

interface Props {
  batches: DistributorBatch[];
}

export default function DistributorKPICards({ batches }: Props) {
  const totalReceived = batches.length;
  const pendingAcceptance = batches.filter(
    (b) => b.status === "RECEIVED_BY_DIST"
  ).length;
  const transferredOut = batches.filter(
    (b) => b.status === "Transferred" || b.status === "In Transit"
  ).length;
  const avgQuality =
    batches.length > 0
      ? (
          batches.reduce((s, b) => s + b.qualityScore, 0) / batches.length
        ).toFixed(1)
      : "0";

  const cards = [
    {
      title: "Batches Received",
      value: String(totalReceived),
      subtitle: "+5 this week",
      icon: "📥",
      color: "#2563EB",
    },
    {
      title: "Pending Acceptance",
      value: String(pendingAcceptance),
      subtitle:
        pendingAcceptance > 0
          ? `${pendingAcceptance} need review`
          : "All clear ✓",
      icon: "⏳",
      color: "#F59E0B",
    },
    {
      title: "Transferred Out",
      value: String(transferredOut),
      subtitle: "To retailers & consumers",
      icon: "📤",
      color: "#7C3AED",
    },
    {
      title: "Avg Quality Score",
      value: avgQuality,
      subtitle: "+1.8 vs last month",
      icon: "⭐",
      color: "#16A34A",
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div className={styles.card} key={card.title}>
          <div className={styles.cardTop}>
            <div>
              <p className={styles.cardTitle}>{card.title}</p>
              <h3 className={styles.cardValue}>{card.value}</h3>
              <span className={styles.cardSub}>{card.subtitle}</span>
            </div>
            <span
              className={styles.iconCircle}
              style={{ background: `${card.color}18`, color: card.color }}
            >
              {card.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
