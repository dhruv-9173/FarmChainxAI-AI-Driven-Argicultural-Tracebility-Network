import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  DistributorBatch,
  DistributorBatchStatus,
} from "../types/distributor.types";
import BatchDetailsModal from "../../../components/common/BatchDetailsModal";
import type { BatchDetail } from "../../../components/common/BatchDetailsModal";
import styles from "./ReceivedBatchesTable.module.css";

interface Props {
  batches: DistributorBatch[];
}

const STATUS_CONFIG: Record<
  string,
  { dot: string; bg: string; color: string }
> = {
  RECEIVED_BY_DIST: { dot: "#F59E0B", bg: "#FEF3C7", color: "#92400E" },
  QUALITY_PASSED: { dot: "#16A34A", bg: "#F0FDF4", color: "#166534" },
  REJECTED_BY_DIST: { dot: "#EF4444", bg: "#FEF2F2", color: "#991B1B" },
  RECEIVED_BY_RETAIL: { dot: "#3B82F6", bg: "#EFF6FF", color: "#1E3A8A" },
  Transferred: { dot: "#6B7280", bg: "#F9FAFB", color: "#374151" },
  Accepted: { dot: "#16A34A", bg: "#F0FDF4", color: "#166534" },
  "In Transit": { dot: "#7C3AED", bg: "#F5F3FF", color: "#5B21B6" },
  Rejected: { dot: "#EF4444", bg: "#FEF2F2", color: "#991B1B" },
};

const FILTER_OPTIONS = [
  "All",
  "RECEIVED_BY_DIST",
  "QUALITY_PASSED",
  "REJECTED_BY_DIST",
  "RECEIVED_BY_RETAIL"
] as const;

const PAGE_SIZE = 7;

function QualityBar({ score }: { score: number }) {
  const color = score >= 85 ? "#16A34A" : score >= 70 ? "#F59E0B" : "#EF4444";
  return (
    <div className={styles.scoreCell}>
      <span className={styles.scoreValue} style={{ color }}>
        {score}
      </span>
      <div className={styles.scoreBarBg}>
        <div
          className={styles.scoreBarFill}
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ReceivedBatchesTable({ batches }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | DistributorBatchStatus>("All");
  const [page, setPage] = useState(1);
  const [viewBatch, setViewBatch] = useState<DistributorBatch | null>(null);

  const filtered = batches.filter((b) => {
    const matchFilter = filter === "All" || b.status === filter;
    const matchSearch =
      search === "" ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.cropType.toLowerCase().includes(search.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className={styles.section}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Received Batches</h3>
            <span className={styles.count}>
              {filtered.length} batches found
            </span>
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
                placeholder="Search batch, crop or farmer..."
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
                setFilter(e.target.value as typeof filter);
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

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Quality</th>
                <th>Farmer</th>
                <th>Received</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    No batches match your search or filter.
                  </td>
                </tr>
              ) : (
                paginated.map((batch) => {
                  const cfg = STATUS_CONFIG[batch.status] || { dot: "#6B7280", bg: "#F3F4F6", color: "#374151" };
                  return (
                    <tr
                      key={batch.id}
                      className={styles.row}
                      onClick={() => navigate(`/batch/${batch.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className={styles.batchId}>{batch.id}</td>
                      <td>
                        <div className={styles.cropName}>{batch.cropType}</div>
                        {batch.variety && (
                          <div className={styles.cropVariety}>
                            {batch.variety}
                          </div>
                        )}
                      </td>
                      <td>{batch.quantity}</td>
                      <td>
                        <QualityBar score={batch.qualityScore} />
                      </td>
                      <td>
                        <div className={styles.farmerName}>
                          {batch.farmerName}
                        </div>
                        <div className={styles.farmLocation}>
                          {batch.farmLocation}
                        </div>
                      </td>
                      <td className={styles.date}>{batch.receivedAt}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <span
                            className={styles.statusDot}
                            style={{ background: cfg.dot }}
                          />
                          {batch.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {/* View details â€” always visible */}
                          <button
                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                            title="View Details & Supply Chain"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewBatch(batch);
                            }}
                          >
                            <svg
                              width="26"
                              height="26"
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

                          {batch.status === "In Transit" && (
                            <span className={styles.inTransitTag}>
                              ðŸšš In Transit
                            </span>
                          )}
                          {(batch.status === "RECEIVED_BY_RETAIL" ||
                            batch.status === "REJECTED_BY_DIST") && (
                              <span className={styles.completedTag}>
                                {batch.status === "REJECTED_BY_DIST"
                                  ? "âœ— Rejected"
                                  : "âœ“ Done"}
                              </span>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              â† Prev
            </button>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next â†’
            </button>
          </div>
        )}
      </div>

      {viewBatch &&
        (() => {
          const detail: BatchDetail = {
            id: viewBatch.id,
            cropType: viewBatch.cropType,
            variety: viewBatch.variety,
            quantity: viewBatch.quantity,
            qualityScore: viewBatch.qualityScore,
            qualityGrade: viewBatch.qualityGrade,
            shelfLifeDays: viewBatch.shelfLifeDays,
            shelfLifePercent: viewBatch.shelfLifePercent,
            organic: viewBatch.organic ?? false,
            basePrice: viewBatch.basePrice,
            marketPrice: viewBatch.marketPrice,
            farmerName: viewBatch.farmerName,
            farmerId: viewBatch.farmerId,
            farmLocation: viewBatch.farmLocation,
            status: viewBatch.status,
            receivedAt: viewBatch.receivedAt,
            transferredTo: viewBatch.transferredTo,
            transferredAt: viewBatch.transferredAt,
            recipientType: viewBatch.recipientType,
            inspectionNote: viewBatch.inspectionNote,
          };
          return (
            <BatchDetailsModal
              batch={detail}
              role="distributor"
              accentColor="#2563EB"
              onClose={() => setViewBatch(null)}
            />
          );
        })()}
    </>
  );
}
