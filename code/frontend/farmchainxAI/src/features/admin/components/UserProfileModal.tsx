import { createPortal } from "react-dom";
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
} from "../types/admin.types";
import styles from "./UserProfileModal.module.css";

interface Props {
  user: AdminUser;
  onClose: () => void;
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
}

const ROLE_COLORS: Record<AdminUserRole, { bg: string; color: string }> = {
  FARMER: { bg: "#F0FDF4", color: "#16A34A" },
  DISTRIBUTOR: { bg: "#EFF6FF", color: "#2563EB" },
  RETAILER: { bg: "#FFF7ED", color: "#EA580C" },
  CONSUMER: { bg: "#F5F3FF", color: "#7C3AED" },
};

const STATUS_COLORS: Record<AdminUserStatus, { bg: string; color: string }> = {
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  Inactive: { bg: "#F9FAFB", color: "#6B7280" },
  Suspended: { bg: "#FEF2F2", color: "#DC2626" },
};

const ROLE_ICONS: Record<AdminUserRole, string> = {
  FARMER: "🌾",
  DISTRIBUTOR: "🚚",
  RETAILER: "🏪",
  CONSUMER: "👤",
};

export default function UserProfileModal({
  user,
  onClose,
  onApprove,
  onSuspend,
  onActivate,
}: Props) {
  const rc = ROLE_COLORS[user.role];
  const sc = STATUS_COLORS[user.status];

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.header}
          style={{
            background: `linear-gradient(135deg, ${rc.color}22, ${rc.color}11)`,
            borderBottom: `3px solid ${rc.color}`,
          }}
        >
          <div className={styles.avatarWrap}>
            <div
              className={styles.avatar}
              style={{ background: rc.bg, color: rc.color }}
            >
              {user.avatarInitials}
            </div>
            {user.verified && (
              <div className={styles.verifiedRing} title="Verified" />
            )}
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.name}>
              {user.fullName}
              {user.verified && <span className={styles.verifiedIcon}>✓</span>}
            </h2>
            <div className={styles.email}>{user.email}</div>
            <div className={styles.pills}>
              <span
                className={styles.rolePill}
                style={{ background: rc.bg, color: rc.color }}
              >
                {ROLE_ICONS[user.role]} {user.role}
              </span>
              <span
                className={styles.statusPill}
                style={{ background: sc.bg, color: sc.color }}
              >
                {user.status}
              </span>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="30"
              height="30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>📞 Phone</span>
              <span className={styles.infoVal}>{user.phone}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>🏢 Entity</span>
              <span className={styles.infoVal}>{user.entityName}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>📍 Location</span>
              <span className={styles.infoVal}>{user.location}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>📦 Batches</span>
              <span
                className={styles.infoVal}
                style={{ color: "#2563EB", fontWeight: 700 }}
              >
                {user.batchCount}
              </span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>📅 Registered</span>
              <span className={styles.infoVal}>{user.registeredAt}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>🕐 Last Login</span>
              <span className={styles.infoVal}>{user.lastLogin}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>🆔 User ID</span>
              <span
                className={styles.infoVal}
                style={{ fontFamily: "monospace", fontSize: "0.82rem" }}
              >
                {user.id}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            {user.status === "Pending" && (
              <button
                className={styles.btnPrimary}
                style={{ background: "#16A34A" }}
                onClick={() => {
                  onApprove(user.id);
                  onClose();
                }}
              >
                ✓ Approve User
              </button>
            )}
            {(user.status === "Active" || user.status === "Inactive") && (
              <button
                className={styles.btnSecondary}
                style={{ borderColor: "#D97706", color: "#D97706" }}
                onClick={() => {
                  onSuspend(user.id);
                  onClose();
                }}
              >
                ⊘ Suspend Account
              </button>
            )}
            {(user.status === "Suspended" || user.status === "Inactive") && (
              <button
                className={styles.btnPrimary}
                style={{ background: "#2563EB" }}
                onClick={() => {
                  onActivate(user.id);
                  onClose();
                }}
              >
                ↺ Reactivate Account
              </button>
            )}
            <button className={styles.btnClose} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

