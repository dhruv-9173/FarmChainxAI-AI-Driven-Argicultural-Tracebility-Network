import styles from "./profile.module.css";

export default function AccountSecurityCard() {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardIconWrap} style={{ background: "#FFF7ED" }}>
                    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h3 className={styles.cardTitle}>Account Security</h3>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.securityRow}>
                    <span className={styles.securityLabel}>Last Login</span>
                    <span className={styles.securityValue}>March 8, 2026</span>
                </div>
                <div className={styles.securityRow}>
                    <span className={styles.securityLabel}>Two-Factor Authentication</span>
                    <span className={styles.securityBadgeOff}>Disabled</span>
                </div>
                <div className={styles.securityRow}>
                    <span className={styles.securityLabel}>Account Status</span>
                    <span className={styles.securityBadgeOn}>Active</span>
                </div>
                <button className={styles.twoFaBtn} type="button">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Enable 2FA
                </button>
            </div>
        </div>
    );
}
