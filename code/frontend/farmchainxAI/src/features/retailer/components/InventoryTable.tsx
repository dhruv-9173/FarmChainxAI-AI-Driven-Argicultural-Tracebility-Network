import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  RetailerBatch,
  RetailerBatchStatus,
} from "../types/retailer.types";
import styles from "./InventoryTable.module.css";

interface Props {
  batches: RetailerBatch[];
  onShelve: (batch: RetailerBatch) => void;
  onMarkSold: (batch: RetailerBatch) => void;
}

const STATUS_CONFIG: Record<
  RetailerBatchStatus,
  { dot: string; bg: string; color: string; label: string }
> = {
  Accepted: {
    dot: "#16A34A",
    bg: "#F0FDF4",
    color: "#166534",
    label: "Accepted",
  },
  Available: {
    dot: "#0891B2",
    bg: "#ECFEFF",
    color: "#0E7490",
    label: "In Stock",
  },
  "Low Stock": {
    dot: "#EA580C",
    bg: "#FFF7ED",
    color: "#C2410C",
    label: "Low Stock",
  },
  "Sold Out": {
    dot: "#6B7280",
    bg: "#F9FAFB",
    color: "#374151",
    label: "Sold Out",
  },
  Expired: {
    dot: "#EF4444",
    bg: "#FEF2F2",
    color: "#991B1B",
    label: "Expired",
  },
  Rejected: {
    dot: "#EF4444",
    bg: "#FEF2F2",
    color: "#991B1B",
    label: "Rejected",
  },
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

const PAGE_SIZE = 8;

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

function ShelfLifeBar({ percent }: { percent: number }) {
  const color =
    percent >= 60 ? "#16A34A" : percent >= 30 ? "#F59E0B" : "#EF4444";
  return (
    <div className={styles.shelfCell}>
      <div className={styles.shelfMini}>
        <div
          className={styles.shelfMiniFill}
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <span style={{ color, fontSize: 12, fontWeight: 600 }}>{percent}%</span>
    </div>
  );
}

/* ── Batch Detail Drawer ────────────────────────────────── */
function BatchDetailDrawer({
  batch,
  onClose,
  onShelve,
  onMarkSold,
}: {
  batch: RetailerBatch;
  onClose: () => void;
  onShelve: (b: RetailerBatch) => void;
  onMarkSold: (b: RetailerBatch) => void;
}) {
  const cfg = STATUS_CONFIG[batch.status];
  const shelfColor =
    batch.shelfLifePercent >= 60
      ? "#16A34A"
      : batch.shelfLifePercent >= 30
      ? "#F59E0B"
      : "#EF4444";

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div>
            <p className={styles.drawerBatchId}>
              #{batch.id.substring(0, 12)}…
            </p>
            <h3 className={styles.drawerTitle}>
              {batch.cropType}
              {batch.variety ? ` · ${batch.variety}` : ""}
              {batch.organic && (
                <span className={styles.organicBadge}>🌿 Organic</span>
              )}
            </h3>
          </div>
          <button className={styles.drawerClose} onClick={onClose}>
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className={styles.drawerBody}>
          {/* Status */}
          <div className={styles.drawerSection}>
            <p className={styles.drawerSectionLabel}>Current Status</p>
            <span
              className={styles.statusBadgeLg}
              style={{
                background: cfg.bg,
                color: cfg.color,
                borderColor: `${cfg.dot}40`,
              }}
            >
              <span
                className={styles.statusDot}
                style={{ background: cfg.dot }}
              />
              {cfg.label}
            </span>
          </div>

          {/* Key Metrics */}
          <div className={styles.drawerGrid}>
            <div className={styles.drawerItem}>
              <span className={styles.drawerLabel}>Quantity</span>
              <span className={styles.drawerValue}>{batch.quantity}</span>
            </div>
            <div className={styles.drawerItem}>
              <span className={styles.drawerLabel}>Remaining</span>
              <span className={styles.drawerValue}>{batch.remainingQty}</span>
            </div>
            <div className={styles.drawerItem}>
              <span className={styles.drawerLabel}>Quality Score</span>
              <span
                className={styles.drawerValue}
                style={{
                  color:
                    batch.qualityScore >= 85
                      ? "#16A34A"
                      : batch.qualityScore >= 70
                      ? "#F59E0B"
                      : "#EF4444",
                }}
              >
                {batch.qualityScore}/100{" "}
                {batch.qualityGrade ? `· ${batch.qualityGrade}` : ""}
              </span>
            </div>
            <div className={styles.drawerItem}>
              <span className={styles.drawerLabel}>Shelf Life</span>
              <span
                className={styles.drawerValue}
                style={{ color: shelfColor }}
              >
                {batch.shelfLifeDays}d · {batch.shelfLifePercent}% left
              </span>
            </div>
            <div className={styles.drawerItem}>
              <span className={styles.drawerLabel}>Source</span>
              <span className={styles.drawerValue}>{batch.sourceName}</span>
            </div>
            <div className={styles.drawerItem}>
              <span className={styles.drawerLabel}>Source Type</span>
              <span className={styles.drawerValue}>{batch.sourceType}</span>
            </div>
            <div className={styles.drawerItem}>
              <span className={styles.drawerLabel}>Received</span>
              <span className={styles.drawerValue}>
                {batch.receivedAt
                  ? new Date(batch.receivedAt).toLocaleDateString("en-IN")
                  : "—"}
              </span>
            </div>
            <div className={styles.drawerItem}>
              <span className={styles.drawerLabel}>Location</span>
              <span className={styles.drawerValue}>
                {batch.sourceLocation || "—"}
              </span>
            </div>
          </div>

          {/* Shelf Life Bar */}
          <div className={styles.drawerSection}>
            <p className={styles.drawerSectionLabel}>Shelf Life Remaining</p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 10,
                  background: "#e5e7eb",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${batch.shelfLifePercent}%`,
                    background: shelfColor,
                    borderRadius: 99,
                    transition: "width 0.5s",
                  }}
                />
              </div>
              <span
                style={{ color: shelfColor, fontWeight: 700, fontSize: 14 }}
              >
                {batch.shelfLifePercent}%
              </span>
            </div>
            {batch.expiresAt && (
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Expires: {batch.expiresAt}
              </p>
            )}
          </div>

          {/* Inspection Note */}
          {batch.inspectionNote && (
            <div className={styles.drawerSection}>
              <p className={styles.drawerSectionLabel}>Inspection Note</p>
              <div className={styles.noteBox}>{batch.inspectionNote}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.drawerActions}>
          {batch.status === "Accepted" && (
            <button
              className={`${styles.drawerBtn} ${styles.drawerBtnTeal}`}
              onClick={() => {
                onShelve(batch);
                onClose();
              }}
            >
              🛒 Move to Shelf
            </button>
          )}
          {(batch.status === "Available" || batch.status === "Low Stock") && (
            <button
              className={`${styles.drawerBtn} ${styles.drawerBtnPurple}`}
              onClick={() => {
                onMarkSold(batch);
                onClose();
              }}
            >
              ✓ Mark as Sold
            </button>
          )}
          <button
            className={`${styles.drawerBtn} ${styles.drawerBtnGrey}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Table ─────────────────────────────────────────── */
export default function InventoryTable({
  batches,
  onShelve,
  onMarkSold,
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

  const newBatchesCount = batches.filter((b) => b.status === "Accepted").length;

  return (
    <>
      <div className={styles.section}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>
              Store Inventory
              {newBatchesCount > 0 && (
                <span className={styles.newBadge}>{newBatchesCount} new</span>
              )}
            </h3>
            <span className={styles.count}>
              {filtered.length} of {batches.length} batches
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
                <th>Crop / Variety</th>
                <th>Quantity</th>
                <th>Quality</th>
                <th>Source</th>
                <th>Shelf Life</th>
                <th>Received</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.empty}>
                    {search || filter !== "All"
                      ? "No batches match your search or filter."
                      : "No inventory batches yet. They will appear here when a distributor or farmer transfers to you."}
                  </td>
                </tr>
              ) : (
                paginated.map((batch) => {
                  const cfg = STATUS_CONFIG[batch.status];
                  return (
                    <tr
                      key={batch.id}
                      className={`${styles.row} ${
                        batch.status === "Accepted" ? styles.rowNew : ""
                      }`}
                      onClick={() => navigate(`/batch/${batch.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className={styles.batchId}>
                        #{batch.id.substring(0, 8)}
                      </td>
                      <td>
                        <div className={styles.cropName}>{batch.cropType}</div>
                        {batch.variety && (
                          <div className={styles.cropVariety}>
                            {batch.variety}
                          </div>
                        )}
                        {batch.organic && (
                          <span className={styles.organicChip}>🌿 Organic</span>
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
                          {batch.sourceType} · {batch.sourceLocation}
                        </div>
                      </td>
                      <td>
                        <ShelfLifeBar percent={batch.shelfLifePercent} />
                      </td>
                      <td className={styles.receivedDate}>
                        {batch.receivedAt
                          ? new Date(batch.receivedAt).toLocaleDateString(
                              "en-IN",
                              { day: "2-digit", month: "short" }
                            )
                          : "—"}
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
                          {cfg.label}
                        </span>
                      </td>
                      <td>
                        <div
                          className={styles.actions}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* View Details */}
                          <button
                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                            title="View Details"
                            onClick={() => setViewBatch(batch)}
                          >
                            <svg
                              width="14"
                              height="14"
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

                          {/* Shelve (Accepted → Available) */}
                          {batch.status === "Accepted" && (
                            <button
                              className={`${styles.actionBtn} ${styles.availBtn}`}
                              title="Move to Shelf"
                              onClick={() => onShelve(batch)}
                            >
                              🛒 Shelve
                            </button>
                          )}

                          {/* Mark Sold (Available / Low Stock → Sold) */}
                          {(batch.status === "Available" ||
                            batch.status === "Low Stock") && (
                            <button
                              className={`${styles.actionBtn} ${styles.soldBtn}`}
                              title="Mark as Sold"
                              onClick={() => onMarkSold(batch)}
                            >
                              ✓ Sold
                            </button>
                          )}

                          {/* Terminal states */}
                          {(batch.status === "Rejected" ||
                            batch.status === "Expired" ||
                            batch.status === "Sold Out") && (
                            <span className={styles.completedTag}>
                              {batch.status === "Rejected"
                                ? "✕ Rejected"
                                : batch.status === "Expired"
                                ? "⏰ Expired"
                                : "✓ Completed"}
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
              ← Prev
            </button>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Batch Detail Drawer */}
      {viewBatch && (
        <BatchDetailDrawer
          batch={viewBatch}
          onClose={() => setViewBatch(null)}
          onShelve={onShelve}
          onMarkSold={onMarkSold}
        />
      )}
    </>
  );
}
