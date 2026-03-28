import { useState } from "react";
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
} from "../types/admin.types";
import styles from "./UserManagementTable.module.css";

interface Props {
  users: AdminUser[];
  onApprove: (userId: string) => void;
  onSuspend: (userId: string) => void;
  onActivate: (userId: string) => void;
  onViewProfile: (user: AdminUser) => void;
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

type Filter = "All" | AdminUserRole | AdminUserStatus;

export default function UserManagementTable({
  users,
  onApprove,
  onSuspend,
  onActivate,
  onViewProfile,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sortBy, setSortBy] = useState<"name" | "role" | "status" | "batches">(
    "name"
  );

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.entityName.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q);
      const matchFilter =
        filter === "All" || u.role === filter || u.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
      if (sortBy === "role") return a.role.localeCompare(b.role);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      if (sortBy === "batches") return b.batchCount - a.batchCount;
      return 0;
    });

  const filterOptions: Filter[] = [
    "All",
    "FARMER",
    "DISTRIBUTOR",
    "RETAILER",
    "CONSUMER",
    "Active",
    "Pending",
    "Inactive",
    "Suspended",
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h3 className={styles.title}>👥 User Management</h3>
          <span className={styles.count}>
            {filtered.length} of {users.length} users
          </span>
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.searchWrap}>
            <svg
              className={styles.searchIcon}
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35"
              />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search name, email, entity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="name">Sort: Name</option>
            <option value="role">Sort: Role</option>
            <option value="status">Sort: Status</option>
            <option value="batches">Sort: Batches</option>
          </select>
        </div>
      </div>

      {/* Filter chips */}
      <div className={styles.filters}>
        {filterOptions.map((f) => (
          <button
            key={f}
            className={`${styles.filterChip} ${
              filter === f ? styles.filterActive : ""
            }`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Entity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Batches</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  No users match your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const rc = ROLE_COLORS[user.role];
                const sc = STATUS_COLORS[user.status];
                return (
                  <tr key={user.id} className={styles.row}>
                    <td>
                      <div className={styles.userCell}>
                        <div
                          className={styles.avatar}
                          style={{ background: rc.bg, color: rc.color }}
                        >
                          {user.avatarInitials}
                        </div>
                        <div>
                          <div className={styles.userName}>
                            {user.fullName}
                            {user.verified && (
                              <span
                                className={styles.verifiedBadge}
                                title="Verified"
                              >
                                ✓
                              </span>
                            )}
                          </div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={styles.rolePill}
                        style={{ background: rc.bg, color: rc.color }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className={styles.entityCell}>{user.entityName}</td>
                    <td className={styles.locationCell}>{user.location}</td>
                    <td>
                      <span
                        className={styles.statusPill}
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.batchCell}>{user.batchCount}</td>
                    <td className={styles.dateCell}>{user.registeredAt}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.btnView}
                          onClick={() => onViewProfile(user)}
                          title="View Profile"
                        >
                          View
                        </button>
                        {user.status === "Pending" && (
                          <button
                            className={styles.btnApprove}
                            onClick={() => onApprove(user.id)}
                            title="Approve User"
                          >
                            Approve
                          </button>
                        )}
                        {(user.status === "Active" ||
                          user.status === "Inactive") && (
                          <button
                            className={styles.btnSuspend}
                            onClick={() => onSuspend(user.id)}
                            title="Suspend account"
                          >
                            Suspend
                          </button>
                        )}
                        {(user.status === "Suspended" ||
                          user.status === "Inactive") && (
                          <button
                            className={styles.btnActivate}
                            onClick={() => onActivate(user.id)}
                            title="Re-activate account"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

