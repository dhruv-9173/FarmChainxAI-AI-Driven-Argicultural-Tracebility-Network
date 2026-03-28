import type { UserProfile } from "../../api/browseApi";
import styles from "./UserCard.module.css";

interface UserCardProps {
  user: UserProfile;
  onClick: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      {/* Header with Profile Image and Basic Info */}
      <div className={styles.header}>
        <div className={styles.profileImage}>
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={user.fullName} />
          ) : (
            <div className={styles.defaultAvatar}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className={styles.basicInfo}>
          <h3 className={styles.name}>{user.fullName}</h3>
          <p className={styles.role}>{user.role}</p>
          {user.verificationStatus && (
            <span
              className={`${styles.badge} ${
                user.verificationStatus === "Verified"
                  ? styles.verified
                  : styles.unverified
              }`}
            >
              {user.verificationStatus === "Verified" ? "✓" : "●"}{" "}
              {user.verificationStatus}
            </span>
          )}
        </div>
      </div>

      {/* Role-Specific Info */}
      {user.role === "FARMER" && (
        <div className={styles.roleSpecific}>
          {user.farmName && <p className={styles.label}>{user.farmName}</p>}
          {user.location && (
            <p className={styles.location}>📍 {user.location}</p>
          )}
          {user.primaryCrops && (
            <p className={styles.crops}>🌾 {user.primaryCrops}</p>
          )}
        </div>
      )}

      {(user.role === "DISTRIBUTOR" || user.role === "RETAILER") && (
        <div className={styles.roleSpecific}>
          {user.businessName && (
            <p className={styles.label}>{user.businessName}</p>
          )}
          {user.email && <p className={styles.email}>📧 {user.email}</p>}
        </div>
      )}

      {/* Statistics */}
      <div className={styles.stats}>
        {user.rating !== undefined && user.rating !== null && (
          <div className={styles.statItem}>
            <span className={styles.label}>Rating</span>
            <span className={styles.value}>⭐ {user.rating.toFixed(1)}</span>
          </div>
        )}
        {user.totalBatches !== undefined && (
          <div className={styles.statItem}>
            <span className={styles.label}>Batches</span>
            <span className={styles.value}>{user.totalBatches}</span>
          </div>
        )}
        {user.activeBatches !== undefined && (
          <div className={styles.statItem}>
            <span className={styles.label}>Active</span>
            <span className={styles.value}>{user.activeBatches}</span>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className={styles.contact}>
        {user.phone && <span title={user.phone}>📞 {user.phone}</span>}
        {user.email && <span title={user.email}>✉️ Email</span>}
      </div>

      {/* View Details Button */}
      <button className={styles.viewButton}>View Profile →</button>
    </div>
  );
}
