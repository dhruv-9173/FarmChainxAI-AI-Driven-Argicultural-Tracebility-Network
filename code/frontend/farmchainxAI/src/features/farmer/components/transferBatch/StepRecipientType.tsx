import type { RecipientType } from "../../../../types/dashboard.types";
import styles from "./TransferBatchModal.module.css";

interface Props {
  selected: RecipientType | null;
  onSelect: (type: RecipientType) => void;
}

const TYPES: {
  type: RecipientType;
  icon: string;
  name: string;
  desc: string;
}[] = [
  {
    type: "Distributor",
    icon: "🏭",
    name: "Distributor",
    desc: "Regional wholesalers & distribution hubs",
  },
  {
    type: "Retailer",
    icon: "🛒",
    name: "Retailer",
    desc: "Grocery chains, local shops, agri stores",
  },
  {
    type: "Consumer",
    icon: "👤",
    name: "Consumer",
    desc: "Direct-to-consumer buyers and cooperatives",
  },
];

export default function StepRecipientType({ selected, onSelect }: Props) {
  return (
    <div>
      <p
        style={{
          fontSize: "0.88rem",
          color: "#6B7280",
          marginBottom: "20px",
          marginTop: 0,
        }}
      >
        Who would you like to transfer this batch to?
      </p>
      <div className={styles.recipientTypeGrid}>
        {TYPES.map(({ type, icon, name, desc }) => (
          <button
            key={type}
            className={`${styles.recipientTypeCard} ${
              selected === type ? styles.selected : ""
            }`}
            onClick={() => onSelect(type)}
            type="button"
          >
            <span className={styles.recipientTypeIcon}>{icon}</span>
            <p className={styles.recipientTypeName}>{name}</p>
            <p className={styles.recipientTypeDesc}>{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
