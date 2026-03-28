import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  RetailerBatch,
  RetailerBatchStatus,
} from "../types/retailer.types";
import BatchDetailsModal from "../../../components/common/BatchDetailsModal";
import type { BatchDetail } from "../../../components/common/BatchDetailsModal";
import styles from "./InventoryTable.module.css";

interface Props {
  batches: RetailerBatch[];
  onStatusChange: (
    batch: RetailerBatch,
    newStatus: RetailerBatchStatus
  ) => void;
}

const STATUS_CONFIG: Record<
  RetailerBatchStatus,
  { dot: string; bg: string; color: string }
> = {
  Accepted: { dot: "#16A34A", bg: "#F0FDF4", color: "#166534" },
  Available: { dot: "#0891B2", bg: "#ECFEFF", color: "#0E7490" },
  "Low Stock": { dot: "#EA580C", bg: "#FFF7ED", color: "#C2410C" },
  "Sold Out": { dot: "#6B7280", bg: "#F9FAFB", color: "#374151" },
  Expired: { dot: "#EF4444", bg: "#FEF2F2", color: "#991B1B" },
  Rejected: { dot: "#EF4444", bg: "#FEF2F2", color: "#991B1B" },
};

const FILTER_OPTIONS = [
  "All",
  "Accepted",
  "Available",
  "Low Stock",
  "Sold Out",
  "Expired",
  "Rejected",
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

/* Ã¢â€â‚¬Ã¢â€â‚¬ Main Table Component Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
export default function InventoryTable({
  batches,
  onStatusChange,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | RetailerBatchStatus>("All");
  const [page, setPage] = useState(1);
  const [viewBatch, setViewBatch] = useState<RetailerBatch | null>(null);

  const filtered = batches.filter((b) => {
    const matchFilter = filter === "All" || b.status === filter;
    const matchSearch =
      search === "" ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.cropType.toLowerCase().includes(search.toLowerCase()) ||
      b.sourceName.toLowerCase().includes(search.toLowerCase());
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
            <h3 className={styles.title}>Store Inventory</h3>
            <span className={styles.count}>{filtered.length} batches</span>
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
                placeholder="Search batch, crop or supplier..."
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
                <th>Qty / Remaining</th>
                <th>Quality</th>
                <th>Source</th>
                <th>Shelf Life</th>
                <th>Section</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.empty}>
                    No batches match your search or filter.
                  </td>
                </tr>
              ) : (
                paginated.map((batch) => {
                  const cfg = STATUS_CONFIG[batch.status];
                  const shelfColor =
                    batch.shelfLifePercent >= 60
                      ? "#16A34A"
                      : batch.shelfLifePercent >= 30
                      ? "#F59E0B"
                      : "#EF4444";
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
                        {batch.organic && (
                          <span className={styles.organicChip}>Ã°Å¸Å’Â¿</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.qtyMain}>
                          {batch.remainingQty}
                        </div>
                        <div className={styles.qtySub}>of {batch.quantity}</div>
                      </td>
                      <td>
                        <QualityBar score={batch.qualityScore} />
                      </td>
                      <td>
                        <div className={styles.farmerName}>
                          {batch.sourceName}
                        </div>
                        <div className={styles.farmLocation}>
                          {batch.sourceType} Ã‚Â· {batch.sourceLocation}
                        </div>
                      </td>
                      <td>
                        <div className={styles.shelfCell}>
                          <div className={styles.shelfMini}>
                            <div
                              className={styles.shelfMiniFill}
                              style={{
                                width: `${batch.shelfLifePercent}%`,
                                background: shelfColor,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              color: shelfColor,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {batch.shelfLifePercent}%
                          </span>
                        </div>
                      </td>
                      <td className={styles.section}>
                        {batch.section ?? "Ã¢â‚¬â€"}
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
                          {batch.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                            title="View Details"
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
                          {batch.status === "Accepted" && (
                            <button
                              className={`${styles.actionBtn} ${styles.availBtn}`}
                              title="Mark Available"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(batch, "Available");
                              }}
                            >
                              Ã°Å¸â€ºâ€™ Shelve
                            </button>
                          )}
                          {(batch.status === "Available" ||
                            batch.status === "Low Stock") && (
                            <button
                              className={`${styles.actionBtn} ${styles.soldBtn}`}
                              title="Mark Sold Out"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(batch, "Sold Out");
                              }}
                            >
                              Ã¢Å“â€œ Sold
                            </button>
                          )}
                          {(batch.status === "Rejected" ||
                            batch.status === "Expired") && (
                            <span className={styles.completedTag}>
                              {batch.status === "Rejected"
                                ? "Ã¢Å“â€¢ Rejected"
                                : "Ã¢ÂÂ° Expired"}
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
              Ã¢â€ Â Prev
            </button>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next Ã¢â€ â€™
            </button>
          </div>
        )}
      </div>

      {viewBatch && (() => {
        const activeBatch = viewBatch;
        const detail: BatchDetail = {
          id: activeBatch.id,
          cropType: activeBatch.cropType,
          variety: activeBatch.variety,
          quantity: activeBatch.quantity,
          qualityScore: activeBatch.qualityScore,
          qualityGrade: activeBatch.qualityGrade,
          shelfLifeDays: activeBatch.shelfLifeDays,
          shelfLifePercent: activeBatch.shelfLifePercent,
          organic: activeBatch.organic ?? false,
          sourceName: activeBatch.sourceName,
          sourceId: activeBatch.sourceId,
          sourceType: activeBatch.sourceType,
          sourceLocation: activeBatch.sourceLocation,
          pricePerKg: activeBatch.pricePerKg,
          sellingPrice: activeBatch.sellingPricePerKg,
          status: activeBatch.status,
          receivedAt: activeBatch.receivedAt,
          remainingQty: activeBatch.remainingQty,
          expiresAt: activeBatch.expiresAt,
          section: activeBatch.section,
          inspectionNote: activeBatch.inspectionNote,
        };
        return (
          <BatchDetailsModal
            batch={detail}
            role="retailer"
            accentColor="#16A34A"
            onClose={() => setViewBatch(null)}
            onStatusChange={(newStatus) =>
              onStatusChange(activeBatch, newStatus as RetailerBatchStatus)
            }
          />
        );
      })()}
    </>
  );
}
