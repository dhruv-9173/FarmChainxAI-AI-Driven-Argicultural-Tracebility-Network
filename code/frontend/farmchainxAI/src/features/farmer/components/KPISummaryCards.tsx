import type { KPICard } from "../../../types/dashboard.types";
import styles from "./KPISummaryCards.module.css";

interface KPISummaryCardsProps {
  cards: KPICard[];
}

export default function KPISummaryCards({ cards }: KPISummaryCardsProps) {
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
              style={{ background: `${card.color}14`, color: card.color }}
            >
              {card.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
