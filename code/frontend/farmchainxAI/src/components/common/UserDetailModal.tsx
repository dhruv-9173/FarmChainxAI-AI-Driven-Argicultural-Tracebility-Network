import type { UserProfile } from "../../api/browseApi";
import styles from "./UserDetailModal.module.css";

interface UserDetailModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailModal({
  user,
  isOpen,
  onClose,
}: UserDetailModalProps) {
  if (!isOpen || !user) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose}>
        {/* Modal */}
        <div className={styles.modal}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.userInfo}>
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.fullName}
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.defaultAvatar}>
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className={styles.name}>{user.fullName}</h2>
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
            <button className={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Contact Information */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Contact Information</h3>
              <div className={styles.grid}>
                <div className={styles.item}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{user.email}</span>
                </div>
                {user.phone && (
                  <div className={styles.item}>
                    <span className={styles.label}>Phone</span>
                    <span className={styles.value}>{user.phone}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Farmer-Specific Information */}
            {user.role === "FARMER" && (
              <>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Farm Information</h3>
                  <div className={styles.grid}>
                    {user.farmName && (
                      <div className={styles.item}>
                        <span className={styles.label}>Farm Name</span>
                        <span className={styles.value}>{user.farmName}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className={styles.item}>
                        <span className={styles.label}>Location</span>
                        <span className={styles.value}>{user.location}</span>
                      </div>
                    )}
                    {user.farmSize && (
                      <div className={styles.item}>
                        <span className={styles.label}>Farm Size</span>
                        <span className={styles.value}>
                          {user.farmSize} hectares
                        </span>
                      </div>
                    )}
                    {user.soilType && (
                      <div className={styles.item}>
                        <span className={styles.label}>Soil Type</span>
                        <span className={styles.value}>{user.soilType}</span>
                      </div>
                    )}
                    {user.primaryCrops && (
                      <div className={styles.item}>
                        <span className={styles.label}>Primary Crops</span>
                        <span className={styles.value}>
                          {user.primaryCrops}
                        </span>
                      </div>
                    )}
                    {user.farmVerified !== undefined && (
                      <div className={styles.item}>
                        <span className={styles.label}>Farm Verified</span>
                        <span
                          className={`${styles.value} ${
                            user.farmVerified
                              ? styles.verified
                              : styles.unverified
                          }`}
                        >
                          {user.farmVerified ? "Yes ✓" : "No"}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* Distributor/Retailer Information */}
            {(user.role === "DISTRIBUTOR" || user.role === "RETAILER") && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Business Information</h3>
                <div className={styles.grid}>
                  {user.businessName && (
                    <div className={styles.item}>
                      <span className={styles.label}>Business Name</span>
                      <span className={styles.value}>{user.businessName}</span>
                    </div>
                  )}
                  {user.businessRegistration && (
                    <div className={styles.item}>
                      <span className={styles.label}>Registration</span>
                      <span className={styles.value}>
                        {user.businessRegistration}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Statistics */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Statistics</h3>
              <div className={styles.statsGrid}>
                {user.rating !== undefined && user.rating !== null && (
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Rating</span>
                    <span className={styles.statValue}>
                      ⭐ {user.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                {user.totalBatches !== undefined && (
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Batches</span>
                    <span className={styles.statValue}>
                      {user.totalBatches}
                    </span>
                  </div>
                )}
                {user.activeBatches !== undefined && (
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Active Batches</span>
                    <span className={styles.statValue}>
                      {user.activeBatches}
                    </span>
                  </div>
                )}
                {user.completedBatches !== undefined && (
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Completed Batches</span>
                    <span className={styles.statValue}>
                      {user.completedBatches}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Batches List */}
            {user.batches && user.batches.length > 0 && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Recent Batches ({user.batches.length})
                </h3>
                <div className={styles.batchList}>
                  {user.batches.map((batch) => (
                    <div key={batch.batchCode} className={styles.batchCard}>
                      <div className={styles.batchHeader}>
                        <span className={styles.cropType}>
                          🌾 {batch.cropType}
                        </span>
                        <span
                          className={`${styles.status} ${
                            styles[
                              batch.batchStatus.toLowerCase().replace(/_/g, "-")
                            ]
                          }`}
                        >
                          {batch.batchStatus.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className={styles.batchDetails}>
                        {batch.cropVariety && (
                          <span>Variety: {batch.cropVariety}</span>
                        )}
                        <span>
                          Quantity: {batch.quantity} {batch.quantityUnit}
                        </span>
                        {batch.qualityScore !== undefined && (
                          <span>Quality: {batch.qualityScore}/100</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
