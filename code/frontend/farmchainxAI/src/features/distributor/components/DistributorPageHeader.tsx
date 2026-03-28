import styles from "./DistributorPageHeader.module.css";

export default function DistributorPageHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <nav className={styles.breadcrumb}>
          <span className={styles.breadcrumbLink}>FarmChainX</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>
            Distributor Dashboard
          </span>
        </nav>
        <h1 className={styles.title}>Distributor Dashboard</h1>
        <p className={styles.subtitle}>
          Accept, inspect, and distribute crop batches across the supply chain
          with full traceability.
        </p>
      </div>
      <div className={styles.right}>
        <span className={styles.healthBadge}>
          <span className={styles.healthDot} />
          System Operational
        </span>
      </div>
    </div>
  );
}
