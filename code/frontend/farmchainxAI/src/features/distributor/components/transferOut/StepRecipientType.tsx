import styles from "./TransferOutModal.module.css";

interface Props {
  selected: "Retailer" | "Consumer" | null;
  onSelect: (type: "Retailer" | "Consumer") => void;
}

const TYPES = [
  {
    type: "Retailer" as const,
    icon: "🛒",
    name: "Retailer",
    desc: "Grocery chains, local shops & agri stores",
    color: "#2563EB",
  },
  {
    type: "Consumer" as const,
    icon: "👤",
    name: "Consumer",
    desc: "Direct buyers, cooperatives & community groups",
    color: "#7C3AED",
  },
];

export default function StepRecipientType({ selected, onSelect }: Props) {
  return (
    <div>
      <p className={styles.stepDesc}>Who are you transferring this batch to?</p>
      <div className={styles.typeGrid}>
        {TYPES.map(({ type, icon, name, desc, color }) => (
          <button
            key={type}
            type="button"
            className={`${styles.typeCard} ${
              selected === type ? styles.typeSelected : ""
            }`}
            style={
              selected === type
                ? { borderColor: color, background: `${color}08` }
                : {}
            }
            onClick={() => onSelect(type)}
          >
            <span className={styles.typeIcon}>{icon}</span>
            <p className={styles.typeName}>{name}</p>
            <p className={styles.typeDesc}>{desc}</p>
            {selected === type && (
              <span className={styles.typeCheck} style={{ background: color }}>
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}


