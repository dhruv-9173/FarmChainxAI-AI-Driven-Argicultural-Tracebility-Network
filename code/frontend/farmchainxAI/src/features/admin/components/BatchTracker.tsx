import { useState } from "react";
import type { AdminBatch, AdminBatchStatus } from "../types/admin.types";
import styles from "./BatchTracker.module.css";

interface Props {
  batches: AdminBatch[];
}

type TabFilter = "All" | "Pipeline" | "Completed" | "Issues";

const STATUS_MAP: Record<AdminBatchStatus, { bg: string; color: string }> = {
  Seeded: { bg: "#F0FDF4", color: "#16A34A" },
  Incoming: { bg: "#EFF6FF", color: "#2563EB" },
  Accepted: { bg: "#EFF6FF", color: "#2563EB" },
  "In Transit": { bg: "#FFFBEB", color: "#D97706" },
  Transferred: { bg: "#F5F3FF", color: "#7C3AED" },
  Available: { bg: "#F0FDF4", color: "#16A34A" },
  "Low Stock": { bg: "#FFFBEB", color: "#EA580C" },
  "Sold Out": { bg: "#F9FAFB", color: "#6B7280" },
  Expired: { bg: "#FEF2F2", color: "#DC2626" },
  Rejected: { bg: "#FEF2F2", color: "#DC2626" },
};

const PIPELINE_STATUSES: AdminBatchStatus[] = [
  "Seeded",
  "Incoming",
  "Accepted",
  "In Transit",
  "Transferred",
];
const COMPLETED_STATUSES: AdminBatchStatus[] = ["Available", "Sold Out"];
const ISSUE_STATUSES: AdminBatchStatus[] = ["Expired", "Rejected", "Low Stock"];

function qualityColor(score: number) {
  if (score >= 85) return { fg: "#16A34A", bg: "#F0FDF4" };
  if (score >= 70) return { fg: "#D97706", bg: "#FFFBEB" };
  return { fg: "#DC2626", bg: "#FEF2F2" };
}

export default function BatchTracker({ batches }: Props) {
  const [tab, setTab] = useState<TabFilter>("All");
  const [search, setSearch] = useState("");

  const filtered = batches.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      b.id.toLowerCase().includes(q) ||
      b.cropType.toLowerCase().includes(q) ||
      (b.variety?.toLowerCase().includes(q) ?? false) ||
      b.farmerName.toLowerCase().includes(q);
    const matchTab =
      tab === "All" ||
      (tab === "Pipeline" && PIPELINE_STATUSES.includes(b.status)) ||
      (tab === "Completed" && COMPLETED_STATUSES.includes(b.status)) ||
      (tab === "Issues" && ISSUE_STATUSES.includes(b.status));
    return matchSearch && matchTab;
  });

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "All", label: `All (${batches.length})` },
    {
      key: "Pipeline",
      label: `Pipeline (${
        batches.filter((b) => PIPELINE_STATUSES.includes(b.status)).length
      })`,
    },
    {
      key: "Completed",
      label: `Completed (${
        batches.filter((b) => COMPLETED_STATUSES.includes(b.status)).length
      })`,
    },
    {
      key: "Issues",
      label: `Issues (${
        batches.filter((b) => ISSUE_STATUSES.includes(b.status)).length
      })`,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>📦 Batch Tracker</h3>
          <span className={styles.count}>{filtered.length} batches</span>
        </div>
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search ID, crop, farmer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.tab} ${tab === key ? styles.tabActive : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Crop / Variety</th>
              <th>Qty (kg)</th>
              <th>Status</th>
              <th>Quality</th>
              <th>Farmer</th>
              <th>Current Holder</th>
              <th>Shelf Life</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.empty}>
                  No batches found.
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const sc = STATUS_MAP[b.status];
                const qc = qualityColor(b.qualityScore);
                const holderRoleLabel = b.currentHolderRole
                  ? ` (${b.currentHolderRole})`
                  : "";
                return (
                  <tr key={b.id} className={styles.row}>
                    <td>
                      <span className={styles.batchId}>{b.id}</span>
                      {b.organic && (
                        <span className={styles.organicTag}>Organic</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.cropName}>{b.cropType}</div>
                      {b.variety && (
                        <div className={styles.variety}>{b.variety}</div>
                      )}
                    </td>
                    <td className={styles.qty}>
                      {b.quantity.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={styles.statusPill}
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.qualityBadge}
                        style={{ background: qc.bg, color: qc.fg }}
                      >
                        {b.qualityScore}
                        {b.qualityGrade && ` (${b.qualityGrade})`}
                      </span>
                    </td>
                    <td>
                      <div className={styles.farmerName}>{b.farmerName}</div>
                      <div className={styles.farmLoc}>{b.farmLocation}</div>
                    </td>
                    <td className={styles.holder}>
                      {b.currentHolderName ? (
                        `${b.currentHolderName}${holderRoleLabel}`
                      ) : (
                        <span className={styles.na}>—</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.shelfBar}>
                        <div
                          className={styles.shelfFill}
                          style={{
                            width: `${b.shelfLifePercent}%`,
                            background:
                              b.shelfLifePercent > 60
                                ? "#16A34A"
                                : b.shelfLifePercent > 30
                                ? "#D97706"
                                : "#DC2626",
                          }}
                        />
                      </div>
                      <div className={styles.shelfPct}>
                        {b.shelfLifePercent}%
                      </div>
                    </td>
                    <td className={styles.date}>{b.createdAt}</td>
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

