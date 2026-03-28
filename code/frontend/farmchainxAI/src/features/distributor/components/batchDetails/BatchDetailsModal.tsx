import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { DistributorBatch } from "../../types/distributor.types";
import styles from "./BatchDetailsModal.module.css";

interface Props {
  batch: DistributorBatch;
  onClose: () => void;
}

/* ── Supply-chain node ────────────────────────────────────── */
function SCNode({
  icon,
  label,
  name,
  sub,
  detail,
  status,
  statusColor,
  active,
  last,
}: {
  icon: string;
  label: string;
  name: string;
  sub?: string;
  detail?: string;
  status: string;
  statusColor: string;
  active: boolean;
  last?: boolean;
}) {
  return (
    <div className={styles.scStep}>
      <div className={styles.scLeft}>
        <div
          className={styles.scIconCircle}
          style={{
            background: active ? `${statusColor}18` : "#F3F4F6",
            border: `2px solid ${active ? statusColor : "#E5E7EB"}`,
          }}
        >
          <span className={styles.scIcon}>{icon}</span>
        </div>
        {!last && (
          <div
            className={styles.scLine}
            style={{ background: active ? statusColor : "#E5E7EB" }}
          />
        )}
      </div>
      <div className={styles.scCard}>
        <span className={styles.scLabel}>{label}</span>
        <div className={styles.scName}>{name}</div>
        {sub && <div className={styles.scSub}>{sub}</div>}
        {detail && <div className={styles.scDetail}>{detail}</div>}
        <span
          className={styles.scStatus}
          style={{ background: `${statusColor}18`, color: statusColor }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

/* ── Quality colour ───────────────────────────────────────── */
function qualityColor(score: number) {
  return score >= 85 ? "#16A34A" : score >= 70 ? "#F59E0B" : "#EF4444";
}

type TabKey = "info" | "supply" | "price" | "ai" | "rate";

const TABS: { key: TabKey; label: string }[] = [
  { key: "info", label: "Batch Info" },
  { key: "supply", label: "Supply Chain" },
  { key: "price", label: "Price & Market" },
  { key: "ai", label: "AI Insights" },
  { key: "rate", label: "⭐ Rate Supplier" },
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

/* ── Main modal ───────────────────────────────────────────── */
export default function BatchDetailsModal({ batch, onClose }: Props) {
  const [tab, setTab] = useState<TabKey>("info");
  const [qrUrl, setQrUrl] = useState("");

  /* Rating state */
  const ratingKey = `fcx-dist-rating-${batch.id}`;
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [savedRating, setSavedRating] = useState<{
    rating: number;
    feedback: string;
    submittedAt: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ratingKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedRating(parsed);
        setRating(parsed.rating);
        setFeedback(parsed.feedback);
        setSubmitted(true);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch.id]);

  const handleRatingSubmit = () => {
    if (rating === 0) return;
    const data = { rating, feedback, submittedAt: new Date().toISOString() };
    localStorage.setItem(ratingKey, JSON.stringify(data));
    setSavedRating(data);
    setSubmitted(true);
  };

  const handleRatingEdit = () => {
    setSubmitted(false);
    setSavedRating(null);
    localStorage.removeItem(ratingKey);
  };

  useEffect(() => {
    QRCode.toDataURL(`https://farmchainx.com/batch/${batch.id}`, {
      width: 200,
      margin: 2,
      color: { dark: "#1e3a8a", light: "#ffffff" },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(""));
  }, [batch.id]);

  /* lock scroll + Esc */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  const qColor = qualityColor(batch.qualityScore);

  /* Supply-chain stage computation */
  const isTransferred = batch.status === "Transferred";
  const isInTransit = batch.status === "In Transit";
  const isRejected = batch.status === "Rejected";
  const farmerDone = true;
  const distDone = !["Incoming"].includes(batch.status);
  const recipientActive = isTransferred || isInTransit;

  const qty = parseFloat(batch.quantity.replace(/[^0-9.]/g, "")) || 0;
  const costValue = (batch.basePrice ?? 0) * qty;
  const marketValue = (batch.marketPrice ?? 0) * qty;
  const profit = marketValue - costValue;
  const margin = costValue > 0 ? Math.round((profit / costValue) * 100) : 0;

  const qualityLevel =
    batch.qualityScore >= 85
      ? "Excellent"
      : batch.qualityScore >= 70
      ? "Good"
      : "Needs Attention";
  const shelfLevel =
    batch.shelfLifePercent >= 60
      ? "Healthy"
      : batch.shelfLifePercent >= 30
      ? "Moderate"
      : "Critical";
  const shelfColor =
    batch.shelfLifePercent >= 60
      ? "#16A34A"
      : batch.shelfLifePercent >= 30
      ? "#F59E0B"
      : "#EF4444";

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.batchId}>{batch.id}</span>
            <h2 className={styles.title}>
              {batch.cropType}
              {batch.variety ? ` · ${batch.variety}` : ""}
            </h2>
          </div>
          <div className={styles.headerRight}>
            {qrUrl && (
              <div className={styles.qrMini}>
                <img src={qrUrl} alt="QR" width={64} height={64} />
                <span>Scan to verify</span>
              </div>
            )}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick metrics */}
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Quantity</span>
            <span className={styles.metricValue}>{batch.quantity}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Quality</span>
            <span className={styles.metricValue} style={{ color: qColor }}>
              {batch.qualityScore}/100
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Shelf Life</span>
            <span className={styles.metricValue} style={{ color: shelfColor }}>
              {batch.shelfLifePercent}%
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Base Price</span>
            <span className={styles.metricValue}>
              ₹{batch.basePrice ?? "—"}/kg
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Status</span>
            <span
              className={styles.metricValue}
              style={{ color: statusColor(batch.status) }}
            >
              {batch.status}
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div className={styles.tabBar}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${styles.tabBtn} ${
                tab === t.key ? styles.tabActive : ""
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className={styles.tabContent}>
          {/* ── Batch Info ── */}
          {tab === "info" && (
            <div className={styles.infoGrid}>
              <InfoRow label="Batch ID" value={batch.id} />
              <InfoRow label="Crop Type" value={batch.cropType} />
              <InfoRow label="Variety" value={batch.variety ?? "—"} />
              <InfoRow label="Quantity" value={batch.quantity} />
              <InfoRow
                label="Quality Score"
                value={`${batch.qualityScore}/100`}
              />
              <InfoRow
                label="Quality Grade"
                value={batch.qualityGrade ?? "—"}
              />
              <InfoRow label="Organic" value={batch.organic ? "Yes ✓" : "No"} />
              <InfoRow
                label="Shelf Life"
                value={`${batch.shelfLifeDays} days (${batch.shelfLifePercent}% remaining)`}
              />
              <InfoRow label="Status" value={batch.status} />
              <InfoRow label="Farmer Name" value={batch.farmerName} />
              <InfoRow label="Farmer ID" value={batch.farmerId} />
              <InfoRow label="Farm Location" value={batch.farmLocation} />
              <InfoRow label="Received On" value={batch.receivedAt} />
              <InfoRow
                label="Transferred To"
                value={batch.transferredTo ?? "—"}
              />
              <InfoRow
                label="Transferred On"
                value={batch.transferredAt ?? "—"}
              />
              <InfoRow
                label="Recipient Type"
                value={batch.recipientType ?? "—"}
              />
              <InfoRow
                label="Base Price"
                value={batch.basePrice ? `₹${batch.basePrice}/kg` : "—"}
              />
              <InfoRow
                label="Market Price"
                value={batch.marketPrice ? `₹${batch.marketPrice}/kg` : "—"}
              />
              {batch.inspectionNote && (
                <div
                  className={styles.noteBox}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <span className={styles.noteLabel}>Inspection Note</span>
                  <p className={styles.noteText}>{batch.inspectionNote}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Supply Chain ── */}
          {tab === "supply" && (
            <div>
              <div className={styles.blockchainBadge}>
                ⛓ Blockchain Verified — Immutable Ledger
              </div>
              <div className={styles.supplyChain}>
                <SCNode
                  icon="🌾"
                  label="ORIGIN — FARM"
                  name={batch.farmerName}
                  sub={`ID: ${batch.farmerId}`}
                  detail={`📍 ${batch.farmLocation}`}
                  status={farmerDone ? "Dispatched ✓" : "Pending"}
                  statusColor={farmerDone ? "#16A34A" : "#9CA3AF"}
                  active={farmerDone}
                />
                <SCNode
                  icon="🏭"
                  label="DISTRIBUTOR — WAREHOUSE"
                  name="Agro Warehouse Ltd."
                  sub="Arjun Mehta · FCX-DIST-001"
                  detail={`Received: ${batch.receivedAt}`}
                  status={
                    isRejected
                      ? "Rejected ✗"
                      : distDone
                      ? "Accepted ✓"
                      : "Pending Review"
                  }
                  statusColor={
                    isRejected ? "#EF4444" : distDone ? "#2563EB" : "#F59E0B"
                  }
                  active={distDone || isRejected}
                />
                {!isRejected && (
                  <SCNode
                    icon={batch.recipientType === "Consumer" ? "👤" : "🛒"}
                    label={`RECIPIENT — ${
                      batch.recipientType?.toUpperCase() ??
                      "RETAILER / CONSUMER"
                    }`}
                    name={batch.transferredTo ?? "Not yet assigned"}
                    detail={
                      batch.transferredAt
                        ? `Transferred: ${batch.transferredAt}`
                        : isInTransit
                        ? "Shipment in progress…"
                        : "Awaiting transfer"
                    }
                    status={
                      isTransferred
                        ? "Delivered ✓"
                        : isInTransit
                        ? "In Transit 🚚"
                        : "Pending"
                    }
                    statusColor={
                      isTransferred
                        ? "#16A34A"
                        : isInTransit
                        ? "#7C3AED"
                        : "#9CA3AF"
                    }
                    active={recipientActive}
                    last
                  />
                )}
                {isRejected && (
                  <SCNode
                    icon="✗"
                    label="RETURNED / REJECTED"
                    name="Batch not accepted"
                    detail={batch.inspectionNote ?? "Failed quality inspection"}
                    status="Rejected"
                    statusColor="#EF4444"
                    active
                    last
                  />
                )}
              </div>
            </div>
          )}

          {/* ── Price & Market ── */}
          {tab === "price" && (
            <div>
              <div className={styles.priceCards}>
                <div className={styles.priceCard}>
                  <span className={styles.priceLabel}>Base Price</span>
                  <span className={styles.priceValue}>
                    ₹{batch.basePrice ?? "—"}
                    <small>/kg</small>
                  </span>
                </div>
                <div className={styles.priceCard}>
                  <span className={styles.priceLabel}>Market Price</span>
                  <span
                    className={styles.priceValue}
                    style={{ color: "#2563EB" }}
                  >
                    ₹{batch.marketPrice ?? "—"}
                    <small>/kg</small>
                  </span>
                </div>
                <div className={styles.priceCard}>
                  <span className={styles.priceLabel}>Est. Total Value</span>
                  <span
                    className={styles.priceValue}
                    style={{ color: "#16A34A" }}
                  >
                    ₹{Math.round(marketValue).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className={styles.insightBox}>
                <strong>📊 Margin Analysis:</strong> Cost value ₹
                {Math.round(costValue).toLocaleString()} → Market value ₹
                {Math.round(marketValue).toLocaleString()}.
                {margin >= 0
                  ? ` Potential margin of ${margin}% above cost.`
                  : ` Market price is below cost — pricing review recommended.`}
                {batch.organic &&
                  " Organic certification may command a 15–20% premium in retail markets."}
              </div>
            </div>
          )}

          {/* ── AI Insights ── */}
          {tab === "ai" && (
            <div className={styles.aiSection}>
              <div className={styles.aiCard}>
                <span className={styles.aiLabel}>Quality Assessment</span>
                <span className={styles.aiValue}>{qualityLevel}</span>
                <span
                  className={styles.aiStatus}
                  style={{ background: `${qColor}18`, color: qColor }}
                >
                  Score: {batch.qualityScore}/100
                </span>
              </div>
              <div className={styles.aiCard}>
                <span className={styles.aiLabel}>Shelf Life Status</span>
                <span className={styles.aiValue}>{shelfLevel}</span>
                <span
                  className={styles.aiStatus}
                  style={{ background: `${shelfColor}18`, color: shelfColor }}
                >
                  {batch.shelfLifePercent}% remaining · {batch.shelfLifeDays}{" "}
                  days
                </span>
              </div>
              <div className={styles.aiCard}>
                <span className={styles.aiLabel}>Market Recommendation</span>
                <span className={styles.aiValue}>
                  {batch.qualityScore >= 85
                    ? "Premium Listing"
                    : batch.qualityScore >= 70
                    ? "Standard Listing"
                    : "Discounted Listing"}
                </span>
                <span
                  className={styles.aiStatus}
                  style={{ background: "#EFF6FF", color: "#1E40AF" }}
                >
                  Suggested: ₹{batch.marketPrice ?? "—"}/kg
                </span>
              </div>
              <div className={styles.insightBox}>
                <strong>🤖 AI Summary:</strong> {batch.cropType}
                {batch.variety ? ` (${batch.variety})` : ""} shows{" "}
                {qualityLevel.toLowerCase()} quality characteristics with{" "}
                {shelfLevel.toLowerCase()} shelf life.{" "}
                {batch.qualityScore >= 85
                  ? "Prioritise fast dispatch to premium retail channels."
                  : batch.qualityScore >= 70
                  ? "Standard distribution channels recommended."
                  : "Consider value-processing or discounted distribution to minimise losses."}
              </div>
            </div>
          )}
          {/* ── Rate Supplier ── */}
          {tab === "rate" && (
            <div className={styles.rateSection}>
              <div className={styles.supplierCard}>
                <div className={styles.supplierIcon}>🌾</div>
                <div className={styles.supplierInfo}>
                  <span className={styles.supplierRole}>Purchased From</span>
                  <strong className={styles.supplierName}>
                    {batch.farmerName}
                  </strong>
                  <span className={styles.supplierSub}>
                    Farmer · ID: {batch.farmerId}
                  </span>
                  <span className={styles.supplierSub}>
                    📍 {batch.farmLocation}
                  </span>
                </div>
              </div>

              {submitted && savedRating ? (
                <div className={styles.submitted}>
                  <div className={styles.submittedStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={
                          s <= savedRating.rating
                            ? styles.starFilled
                            : styles.starEmpty
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className={styles.submittedMsg}>
                    Thanks for your feedback!
                  </p>
                  {savedRating.feedback && (
                    <p className={styles.submittedFeedback}>
                      &ldquo;{savedRating.feedback}&rdquo;
                    </p>
                  )}
                  <p className={styles.submittedDate}>
                    Submitted on{" "}
                    {new Date(savedRating.submittedAt).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </p>
                  <button
                    className={styles.editRatingBtn}
                    onClick={handleRatingEdit}
                  >
                    Edit Rating
                  </button>
                </div>
              ) : (
                <>
                  <p className={styles.ratePrompt}>
                    How was the quality of produce received from this farmer?
                  </p>
                  <div
                    className={styles.starRow}
                    onMouseLeave={() => setHovered(0)}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        className={`${styles.starBtn} ${
                          s <= (hovered || rating)
                            ? styles.starFilled
                            : styles.starEmpty
                        }`}
                        onMouseEnter={() => setHovered(s)}
                        onClick={() => setRating(s)}
                        aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className={styles.ratingLabels}>
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                  {rating > 0 && (
                    <p className={styles.ratingSelectedMsg}>
                      {
                        ["Poor", "Fair", "Good", "Very Good", "Excellent"][
                          rating - 1
                        ]
                      }{" "}
                      ({rating}/5)
                    </p>
                  )}
                  <textarea
                    className={styles.feedbackArea}
                    placeholder={`Share your experience with ${batch.farmerName} — quality of produce, packaging, communication…`}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <div className={styles.feedbackFooter}>
                    <span className={styles.charCount}>
                      {feedback.length}/500
                    </span>
                    <button
                      className={styles.submitRatingBtn}
                      onClick={handleRatingSubmit}
                      disabled={rating === 0}
                    >
                      Submit Feedback
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Status colour helper ─────────────────────────────────── */
function statusColor(s: string) {
  const m: Record<string, string> = {
    Incoming: "#1E40AF",
    Accepted: "#166534",
    "In Transit": "#5B21B6",
    Transferred: "#374151",
    Rejected: "#991B1B",
  };
  return m[s] ?? "#374151";
}

