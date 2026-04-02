import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import type {
  RetailerBatch,
  RetailerBatchStatus,
} from "../../types/retailer.types";
import styles from "./RetailerBatchDetailsModal.module.css";

interface Props {
  batch: RetailerBatch;
  onClose: () => void;
  onStatusChange: (
    batch: RetailerBatch,
    newStatus: RetailerBatchStatus
  ) => void;
}

type TabKey = "info" | "supply" | "price" | "ai" | "rate";

const TABS: { key: TabKey; label: string }[] = [
  { key: "info", label: "Batch Info" },
  { key: "supply", label: "Supply Chain" },
  { key: "price", label: "Price & Market" },
  { key: "ai", label: "AI Insights" },
  { key: "rate", label: "â­ Rate Supplier" },
];

function qualityColor(score: number) {
  return score >= 85 ? "#16A34A" : score >= 70 ? "#F59E0B" : "#EF4444";
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

/* â”€â”€ Supply Chain Node â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€ Tab: Batch Info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function BatchInfoTab({ batch }: { batch: RetailerBatch }) {
  return (
    <div className={styles.infoGrid}>
      <InfoRow label="Batch ID" value={batch.id} />
      <InfoRow label="Crop Type" value={batch.cropType} />
      <InfoRow label="Variety" value={batch.variety ?? "â€”"} />
      <InfoRow label="Total Quantity" value={batch.quantity} />
      <InfoRow label="Remaining" value={batch.remainingQty} />
      <InfoRow label="Status" value={batch.status} />
      <InfoRow label="Source" value={batch.sourceName} />
      <InfoRow label="Source Type" value={batch.sourceType} />
      <InfoRow label="Source Location" value={batch.sourceLocation} />
      <InfoRow label="Quality Score" value={`${batch.qualityScore}/100`} />
      <InfoRow label="Quality Grade" value={batch.qualityGrade ?? "â€”"} />
      <InfoRow label="Organic" value={batch.organic ? "Yes ðŸŒ¿" : "No"} />
      <InfoRow label="Received On" value={batch.receivedAt} />
      <InfoRow label="Expires On" value={batch.expiresAt} />
      <InfoRow
        label="Shelf Life"
        value={`${batch.shelfLifeDays} days (${batch.shelfLifePercent}%)`}
      />
      {batch.section && <InfoRow label="Store Section" value={batch.section} />}
      {batch.inspectionNote && (
        <InfoRow label="Inspection Note" value={batch.inspectionNote} />
      )}
    </div>
  );
}

/* â”€â”€ Tab: Supply Chain â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SupplyChainTab({ batch }: { batch: RetailerBatch }) {
  const fromFarmer = batch.sourceType === "Farmer";
  const isAccepted = [
    "Accepted",
    "Available",
    "Low Stock",
    "Sold Out",
    "Expired",
  ].includes(batch.status);
  const isRejected = batch.status === "Rejected";
  const isAvailable = [
    "Available",
    "Low Stock",
    "Sold Out",
    "Expired",
  ].includes(batch.status);

  return (
    <div className={styles.timeline}>
      <div className={styles.blockchainBadge}>
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        Blockchain Verified
      </div>

      {/* Stage 1 â€“ Source (Farmer or Distributor) */}
      <SCNode
        icon={fromFarmer ? "ðŸŒ¾" : "ðŸ­"}
        label={fromFarmer ? "ORIGIN â€” FARM" : "ORIGIN â€” DISTRIBUTOR"}
        name={batch.sourceName}
        sub={`ID: ${batch.sourceId}`}
        detail={`ðŸ“ ${batch.sourceLocation}`}
        status="Dispatched âœ“"
        statusColor="#16A34A"
        active
      />

      {/* Stage 2 â€“ Retailer */}
      <SCNode
        icon="ðŸ›’"
        label="RETAILER â€” STORE"
        name="Your Store"
        detail={`Received: ${batch.receivedAt}`}
        status={
          isRejected
            ? "Rejected âœ—"
            : isAccepted
            ? "Accepted âœ“"
            : "Pending Review"
        }
        statusColor={
          isRejected ? "#EF4444" : isAccepted ? "#16A34A" : "#F59E0B"
        }
        active={isAccepted || isRejected}
      />

      {/* Stage 3 â€“ Customer */}
      <SCNode
        icon="ðŸ‘¤"
        label="END CUSTOMER"
        name="Available to Customers"
        detail={
          isAvailable ? `On shelf since ${batch.receivedAt}` : "Not yet shelved"
        }
        status={
          batch.status === "Sold Out"
            ? "Sold Out âœ“"
            : isAvailable
            ? "On Shelf ðŸ›ï¸"
            : "Awaiting"
        }
        statusColor={
          batch.status === "Sold Out"
            ? "#6B7280"
            : isAvailable
            ? "#0891B2"
            : "#9CA3AF"
        }
        active={isAvailable}
        last
      />
    </div>
  );
}

/* â”€â”€ Tab: Price & Market â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PriceTab({ batch }: { batch: RetailerBatch }) {
  const qty = parseFloat(batch.quantity.replace(/[^0-9.]/g, "")) || 0;
  const costValue = batch.pricePerKg * qty;
  const revenueValue = batch.sellingPricePerKg * qty;
  const margin =
    costValue > 0
      ? Math.round(((revenueValue - costValue) / costValue) * 100)
      : 0;

  return (
    <div>
      <div className={styles.priceCards}>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>Buy Price / kg</span>
          <span className={styles.priceValue}>â‚¹{batch.pricePerKg}</span>
        </div>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>Sell Price / kg</span>
          <span className={styles.priceValue}>
            â‚¹{batch.sellingPricePerKg}
          </span>
        </div>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>Est. Revenue</span>
          <span className={styles.priceValue}>
            â‚¹{revenueValue.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      <div className={styles.insightBox}>
        <p>
          Total procurement cost:{" "}
          <strong>â‚¹{costValue.toLocaleString("en-IN")}</strong>
        </p>
        <p>
          Estimated revenue:{" "}
          <strong>â‚¹{revenueValue.toLocaleString("en-IN")}</strong>
        </p>
        <p>
          Gross margin: <strong>{margin}%</strong>
        </p>
        {batch.revenue !== undefined && batch.revenue > 0 && (
          <p>
            Actual revenue earned:{" "}
            <strong>â‚¹{batch.revenue.toLocaleString("en-IN")}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

/* â”€â”€ Tab: AI Insights â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AITab({ batch }: { batch: RetailerBatch }) {
  const qColor = qualityColor(batch.qualityScore);
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

  return (
    <div className={styles.aiSection}>
      <div className={styles.aiCard}>
        <span className={styles.aiLabel}>Quality Assessment</span>
        <span className={styles.aiValue}>{batch.qualityScore}/100</span>
        <span className={styles.aiStatus} style={{ color: qColor }}>
          {qualityLevel}
        </span>
      </div>
      <div className={styles.aiCard}>
        <span className={styles.aiLabel}>Shelf Life Status</span>
        <span className={styles.aiValue}>{batch.shelfLifeDays} days</span>
        <span className={styles.aiStatus} style={{ color: shelfColor }}>
          {shelfLevel}
        </span>
      </div>
      <div className={styles.aiCard}>
        <span className={styles.aiLabel}>Pricing Recommendation</span>
        <span className={styles.aiValue}>â‚¹{batch.sellingPricePerKg}/kg</span>
        <span className={styles.aiStatus} style={{ color: "#2563EB" }}>
          {batch.shelfLifePercent < 30
            ? "Consider discount pricing"
            : "Price optimal"}
        </span>
      </div>
      <div className={styles.insightBox}>
        <p>
          Quality is{" "}
          <strong>{batch.qualityScore >= 85 ? "above" : "at"} average</strong>.
          Shelf life is <strong>{shelfLevel.toLowerCase()}</strong> at{" "}
          {batch.shelfLifePercent}%.
          {batch.shelfLifePercent < 30
            ? " Consider clearing stock soon or offering promotions."
            : ` Consider selling within the next ${Math.min(
                batch.shelfLifeDays,
                14
              )} days for optimal freshness.`}
        </p>
      </div>
    </div>
  );
}

/* â”€â”€ Status action buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StatusActions({
  batch,
  onStatusChange,
  onClose,
}: {
  batch: RetailerBatch;
  onStatusChange: (b: RetailerBatch, s: RetailerBatchStatus) => void;
  onClose: () => void;
}) {
  const act = (s: RetailerBatchStatus) => {
    onStatusChange(batch, s);
    onClose();
  };
  const { status } = batch;
  if (status === "Accepted") {
    return (
      <div className={styles.actionBtns}>
        <button className={styles.actionCyan} onClick={() => act("Available")}>
          ðŸ›’ Mark Available for Customers
        </button>
      </div>
    );
  }
  if (status === "Available" || status === "Low Stock") {
    return (
      <div className={styles.actionBtns}>
        <button className={styles.actionGrey} onClick={() => act("Sold Out")}>
          âœ“ Mark as Sold Out / Finished
        </button>
        <button className={styles.actionRed} onClick={() => act("Expired")}>
          â° Mark as Expired
        </button>
      </div>
    );
  }
  return null;
}

/* â”€â”€ Main Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function RetailerBatchDetailsModal({
  batch,
  onClose,
  onStatusChange,
}: Props) {
  const [tab, setTab] = useState<TabKey>("info");
  const [qrUrl, setQrUrl] = useState("");
  /* Rating state */
  const ratingKey = `fcx-retailer-rating-${batch.id}`;
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
      color: { dark: "#166534", light: "#ffffff" },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(""));
  }, [batch.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const qColor = qualityColor(batch.qualityScore);
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
            <h2 className={styles.batchId}>{batch.id}</h2>
            <p className={styles.batchMeta}>
              {batch.cropType}
              {batch.variety ? ` Â· ${batch.variety}` : ""} Â· {batch.quantity}
            </p>
            <p className={styles.batchSub}>
              From: {batch.sourceName} Â· {batch.sourceType}
            </p>
            <div className={styles.badges}>
              <span className={styles.badgeStatus}>{batch.status}</span>
              {batch.organic && (
                <span className={styles.badgeGreen}>ðŸŒ¿ Organic</span>
              )}
            </div>
          </div>
          <div className={styles.headerRight}>
            {qrUrl && (
              <div className={styles.qrMini}>
                <img src={qrUrl} alt="Batch QR" />
                <span>Scan to verify</span>
              </div>
            )}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              title="Close (Esc)"
            >
              <svg
                width="30"
                height="30"
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
        </div>

        {/* Quick Metrics */}
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Remaining Qty</span>
            <span className={styles.metricValue}>{batch.remainingQty}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Quality Score</span>
            <span className={styles.metricValue} style={{ color: qColor }}>
              {batch.qualityScore}/100
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Shelf Life</span>
            <span className={styles.metricValue} style={{ color: shelfColor }}>
              {batch.shelfLifeDays} days
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Buy Price</span>
            <span className={styles.metricValue}>â‚¹{batch.pricePerKg}/kg</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Sell Price</span>
            <span className={styles.metricValue}>
              â‚¹{batch.sellingPricePerKg}/kg
            </span>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {tab === "info" && <BatchInfoTab batch={batch} />}
          {tab === "supply" && <SupplyChainTab batch={batch} />}
          {tab === "price" && <PriceTab batch={batch} />}
          {tab === "ai" && <AITab batch={batch} />}
          {tab === "rate" && (
            <div className={styles.rateSection}>
              <div className={styles.supplierCard}>
                <div className={styles.supplierIcon}>
                  {batch.sourceType === "Farmer" ? "ðŸŒ¾" : "ðŸ¤"}
                </div>
                <div className={styles.supplierInfo}>
                  <span className={styles.supplierRole}>Purchased From</span>
                  <strong className={styles.supplierName}>
                    {batch.sourceName}
                  </strong>
                  <span className={styles.supplierSub}>
                    {batch.sourceType} Â· ID: {batch.sourceId}
                  </span>
                  <span className={styles.supplierSub}>
                    ðŸ“ {batch.sourceLocation}
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
                        â˜…
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
                    How was the quality and service from {batch.sourceName}?
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
                        â˜…
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
                    placeholder={`Share your experience with ${batch.sourceName} â€” quality of produce, packaging, deliveryâ€¦`}
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

          {/* Status Actions always visible at bottom */}
          <div className={styles.actionSection}>
            <h4 className={styles.actionTitle}>Change Status</h4>
            <StatusActions
              batch={batch}
              onStatusChange={onStatusChange}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
