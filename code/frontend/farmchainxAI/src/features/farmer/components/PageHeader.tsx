import styles from "./PageHeader.module.css";

export default function PageHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <nav className={styles.breadcrumb}>
          <span className={styles.breadcrumbLink}>FarmChainX</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Dashboard</span>
        </nav>
        <h1 className={styles.title}>Farmer Dashboard</h1>
        <p className={styles.subtitle}>
          Track, manage, and optimize your agricultural batches with AI-powered
          insights.
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
