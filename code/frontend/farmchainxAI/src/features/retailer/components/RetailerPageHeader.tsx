import styles from "./RetailerPageHeader.module.css";

interface Props {
  storeName: string;
  userName: string;
  totalBatches: number;
  inStockBatches: number;
  lowStockCount: number;
}

export default function RetailerPageHeader({
  storeName,
  userName,
  totalBatches,
  inStockBatches,
  lowStockCount,
}: Props) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <p className={styles.greeting}>
          {greeting}, {userName.split(" ")[0]} 👋
        </p>
        <h1 className={styles.title}>{storeName}</h1>
        <p className={styles.date}>{today}</p>
      </div>
      <div className={styles.right}>
        <div className={styles.chip}>
          <span className={styles.chipDot} style={{ background: "#16A34A" }} />
          <span>{totalBatches} Total Batches</span>
        </div>
        <div className={styles.chip}>
          <span className={styles.chipDot} style={{ background: "#0891B2" }} />
          <span>{inStockBatches} In Stock</span>
        </div>
        {lowStockCount > 0 && (
          <div className={`${styles.chip} ${styles.chipAlert}`}>
            <span
              className={styles.chipDot}
              style={{ background: "#EA580C" }}
            />
            <span>{lowStockCount} Low Stock</span>
          </div>
        )}
      </div>
    </div>
  );
}
