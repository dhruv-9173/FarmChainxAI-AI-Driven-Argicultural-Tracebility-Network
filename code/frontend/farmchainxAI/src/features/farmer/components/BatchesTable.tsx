import { useState } from "react";
import type { Batch, BatchStatus } from "../../../types/dashboard.types";
import styles from "./BatchesTable.module.css";

interface BatchesTableProps {
  batches: Batch[];
  onViewBatch: (batch: Batch) => void;
  onTransferBatch?: (batch: Batch) => void;
}

const STATUS_CONFIG: Record<
  string,
  { dot: string; bg: string; color: string }
> = {
  PENDING: { dot: "#F59E0B", bg: "#FFFBEB", color: "#92400E" },
  ACTIVE: { dot: "#16A34A", bg: "#F0FDF4", color: "#166534" },
  TRANSFERRED: { dot: "#2563EB", bg: "#EFF6FF", color: "#1E40AF" },
  RECEIVED: { dot: "#0EA5E9", bg: "#ECFEFF", color: "#0C4A6E" },
  SOLD: { dot: "#7C3AED", bg: "#F5F3FF", color: "#5B21B6" },
  REJECTED: { dot: "#EF4444", bg: "#FEF2F2", color: "#991B1B" },
  EXPIRED: { dot: "#6B7280", bg: "#F3F4F6", color: "#374151" },
  Active: { dot: "#16A34A", bg: "#F0FDF4", color: "#166534" },
  Transferred: { dot: "#2563EB", bg: "#EFF6FF", color: "#1E40AF" },
  Pending: { dot: "#F59E0B", bg: "#FFFBEB", color: "#92400E" },
  Flagged: { dot: "#EF4444", bg: "#FEF2F2", color: "#991B1B" },
};

const FILTER_OPTIONS: ("All" | BatchStatus)[] = [
  "All",
  "PENDING",
  "ACTIVE",
  "TRANSFERRED",
  "RECEIVED",
  "SOLD",
  "REJECTED",
  "EXPIRED",
];

const PAGE_SIZE = 7;

export default function BatchesTable({
  batches,
  onViewBatch,
  onTransferBatch,
}: BatchesTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | BatchStatus>("All");
  const [page, setPage] = useState(1);

  const filtered = batches.filter((b) => {
    const matchesFilter = filter === "All" || b.status === filter;
    const matchesSearch =
      search === "" ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.cropType.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>My Batches</h3>
          <span className={styles.count}>{filtered.length} batches found</span>
        </div>
        <div className={styles.controls}>
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search batch or crop..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as "All" | BatchStatus);
              setPage(1);
            }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Crop Type</th>
              <th>Quantity</th>
              <th>Quality Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  No batches found matching your criteria.
                </td>
              </tr>
            ) : (
              paginated.map((b) => {
                const cfg = STATUS_CONFIG[b.status] ?? {
                  dot: "#6B7280",
                  bg: "#F3F4F6",
                  color: "#374151",
                };
                const scoreColor =
                  b.qualityScore >= 85
                    ? "#16A34A"
                    : b.qualityScore >= 70
                    ? "#F59E0B"
                    : "#EF4444";
                return (
                  <tr key={b.id} className={styles.row}>
                    <td className={styles.batchId}>{b.id}</td>
                    <td>{b.cropType}</td>
                    <td>{b.quantity}</td>
                    <td>
                      <div className={styles.scoreCell}>
                        <span className={styles.scoreValue}>
                          {b.qualityScore}
                        </span>
                        <div className={styles.scoreBarBg}>
                          <div
                            className={styles.scoreBarFill}
                            style={{
                              width: `${b.qualityScore}%`,
                              background: scoreColor,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <span
                          className={styles.statusDot}
                          style={{ background: cfg.dot }}
                        />
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          title="View"
                          onClick={() => onViewBatch(b)}
                        >
                          <svg
                            width="28"
                            height="28"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        {(b.status === "ACTIVE" || b.status === "Active") && (
                          <button
                            className={styles.actionBtn}
                            title="Transfer"
                            onClick={() => onTransferBatch?.(b)}
                          >
                            <svg
                              width="28"
                              height="28"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                          </button>
                        )}
                        <button className={styles.actionBtn} title="Track">
                          <svg
                            width="28"
                            height="28"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
          batches
        </span>
        <div className={styles.pageButtons}>
          <button
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.pageBtn} ${
                p === page ? styles.pageBtnActive : ""
              }`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
