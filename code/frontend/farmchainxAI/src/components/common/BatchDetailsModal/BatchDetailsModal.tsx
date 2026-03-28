import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import styles from "./BatchDetailsModal.module.css";

/* ── Public batch shape (normalized from Batch / DistributorBatch / RetailerBatch) ── */
export interface BatchDetail {
  id: string;
  cropType: string;
  variety?: string;
  quantity: string;
  qualityScore: number;
  qualityGrade?: string;
  shelfLifeDays: number;
  shelfLifePercent: number;
  organic: boolean;
  gapCertified?: boolean;
  basePrice?: number;
  marketPrice?: number;
  sellingPrice?: number; // retailer sell price / kg
  pricePerKg?: number; // retailer buy price / kg
  farmerName?: string;
  farmerId?: string;
  farmLocation?: string;
  sourceName?: string;
  sourceId?: string;
  sourceType?: string;
  sourceLocation?: string;
  status: string;
  createdAt?: string;
  receivedAt?: string;
  transferredTo?: string;
  transferredAt?: string;
  recipientType?: string;
  remainingQty?: string;
  expiresAt?: string;
  section?: string;
  inspectionNote?: string;
  cropImagePreview?: string;
}

export interface BatchDetailsModalProps {
  batch: BatchDetail;
  role: "farmer" | "distributor" | "retailer";
  accentColor: string; // e.g. "#166534"
  onClose: () => void;
  onStatusChange?: (newStatus: string) => void; // retailer only
}

type TabKey = "info" | "supply" | "price" | "ai" | "rate";

/* ── Helpers ── */
function qualityColor(score: number) {
  return score >= 85 ? "#16A34A" : score >= 70 ? "#F59E0B" : "#EF4444";
}

function shelfColor(pct: number) {
  return pct >= 60 ? "#16A34A" : pct >= 30 ? "#F59E0B" : "#EF4444";
}

function qualityLabel(score: number) {
  return score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Needs Attention";
}

function shelfLabel(pct: number) {
  return pct >= 60 ? "Healthy" : pct >= 30 ? "Moderate" : "Critical";
}

/* ── Sub-components ── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

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

function SupplyChainTab({
  batch,
  role,
}: {
  batch: BatchDetail;
  role: BatchDetailsModalProps["role"];
}) {
  if (role === "farmer") {
    const events = [
      {
        title: "Batch Created",
        timestamp: batch.createdAt ?? "—",
        completed: true,
      },
      { title: "Quality Assessed", timestamp: "AI verified", completed: true },
      {
        title: "Ready for Transfer",
        timestamp: "Pending dispatch",
        completed: batch.status !== "Active",
      },
    ];
    return (
      <div className={styles.supplyChain}>
        <div className={styles.blockchainBadge}>⛓ Blockchain Verified</div>
        {events.map((ev, i) => (
          <SCNode
            key={i}
            icon={ev.completed ? "✓" : "⏳"}
            label={`Step ${i + 1}`}
            name={ev.title}
            detail={ev.timestamp}
            status={ev.completed ? "Completed" : "Pending"}
            statusColor={ev.completed ? "#16A34A" : "#9CA3AF"}
            active={ev.completed}
            last={i === events.length - 1}
          />
        ))}
      </div>
    );
  }

  if (role === "distributor") {
    const isRejected = batch.status === "Rejected";
    const isTransferred = batch.status === "Transferred";
    const isInTransit = batch.status === "In Transit";
    const farmerDone = true;
    const distDone = batch.status !== "Incoming";
    const recipientActive = isTransferred || isInTransit;

    return (
      <div>
        <div className={styles.blockchainBadge}>
          ⛓ Blockchain Verified — Immutable Ledger
        </div>
        <div className={styles.supplyChain}>
          <SCNode
            icon="🌾"
            label="ORIGIN — FARM"
            name={batch.farmerName ?? "Farmer"}
            sub={`ID: ${batch.farmerId ?? "—"}`}
            detail={`📍 ${batch.farmLocation ?? "—"}`}
            status={farmerDone ? "Dispatched ✓" : "Pending"}
            statusColor={farmerDone ? "#16A34A" : "#9CA3AF"}
            active={farmerDone}
          />
          <SCNode
            icon="🏭"
            label="DISTRIBUTOR — WAREHOUSE"
            name="Agro Warehouse Ltd."
            detail={`Received: ${batch.receivedAt ?? "—"}`}
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
                batch.recipientType?.toUpperCase() ?? "RETAILER / CONSUMER"
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
                isTransferred ? "#16A34A" : isInTransit ? "#7C3AED" : "#9CA3AF"
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
    );
  }

  // retailer
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
    <div className={styles.supplyChain}>
      <div className={styles.blockchainBadge}>⛓ Blockchain Verified</div>
      <SCNode
        icon={fromFarmer ? "🌾" : "🏭"}
        label={fromFarmer ? "ORIGIN — FARM" : "ORIGIN — DISTRIBUTOR"}
        name={batch.sourceName ?? "—"}
        sub={`ID: ${batch.sourceId ?? "—"}`}
        detail={`📍 ${batch.sourceLocation ?? "—"}`}
        status="Dispatched ✓"
        statusColor="#16A34A"
        active
      />
      <SCNode
        icon="🛒"
        label="RETAILER — STORE"
        name="Your Store"
        detail={`Received: ${batch.receivedAt ?? "—"}`}
        status={
          isRejected
            ? "Rejected ✗"
            : isAccepted
            ? "Accepted ✓"
            : "Pending Review"
        }
        statusColor={
          isRejected ? "#EF4444" : isAccepted ? "#16A34A" : "#F59E0B"
        }
        active={isAccepted || isRejected}
      />
      <SCNode
        icon="👤"
        label="END CUSTOMER"
        name="Available to Customers"
        detail={
          isAvailable
            ? `On shelf since ${batch.receivedAt ?? "—"}`
            : "Not yet shelved"
        }
        status={
          batch.status === "Sold Out"
            ? "Sold Out ✓"
            : isAvailable
            ? "On Shelf 🛍️"
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

function PriceTab({
  batch,
  role,
}: {
  batch: BatchDetail;
  role: BatchDetailsModalProps["role"];
}) {
  const qty = parseFloat(batch.quantity.replace(/[^0-9.]/g, "")) || 0;

  if (role === "retailer") {
    const buy = (batch.pricePerKg ?? 0) * qty;
    const sell = (batch.sellingPrice ?? 0) * qty;
    const margin = buy > 0 ? Math.round(((sell - buy) / buy) * 100) : 0;
    return (
      <div>
        <div className={styles.priceCards}>
          <div className={styles.priceCard}>
            <span className={styles.priceLabel}>Buy Price / kg</span>
            <span className={styles.priceValue}>
              ₹{batch.pricePerKg ?? "—"}
            </span>
          </div>
          <div className={styles.priceCard}>
            <span className={styles.priceLabel}>Sell Price / kg</span>
            <span className={styles.priceValue}>
              ₹{batch.sellingPrice ?? "—"}
            </span>
          </div>
          <div className={styles.priceCard}>
            <span className={styles.priceLabel}>Est. Revenue</span>
            <span className={styles.priceValue}>
              ₹{sell.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        <div className={styles.insightBox}>
          <p>
            Procurement cost: <strong>₹{buy.toLocaleString("en-IN")}</strong>
          </p>
          <p>
            Estimated revenue: <strong>₹{sell.toLocaleString("en-IN")}</strong>
          </p>
          <p>
            Gross margin: <strong>{margin}%</strong>
          </p>
        </div>
      </div>
    );
  }

  // farmer or distributor
  const cost = (batch.basePrice ?? 0) * qty;
  const market = (batch.marketPrice ?? 0) * qty;
  const profit = market - cost;
  const margin = cost > 0 ? Math.round((profit / cost) * 100) : 0;

  return (
    <div>
      <div className={styles.priceCards}>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>Base Price / kg</span>
          <span className={styles.priceValue}>₹{batch.basePrice ?? "—"}</span>
        </div>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>Market Price / kg</span>
          <span className={styles.priceValue} style={{ color: "#2563EB" }}>
            ₹{batch.marketPrice ?? "—"}
          </span>
        </div>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>Total Batch Value</span>
          <span className={styles.priceValue} style={{ color: "#16A34A" }}>
            ₹{Math.round(market).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      <div className={styles.insightBox}>
        <p>
          Cost value:{" "}
          <strong>₹{Math.round(cost).toLocaleString("en-IN")}</strong>
        </p>
        <p>
          Market value:{" "}
          <strong>₹{Math.round(market).toLocaleString("en-IN")}</strong>
        </p>
        <p>
          Potential margin: <strong>{margin}%</strong>
          {batch.organic &&
            " — Organic certification may command a 15–20% premium."}
        </p>
      </div>
    </div>
  );
}

function AITab({
  batch,
  accentColor,
}: {
  batch: BatchDetail;
  accentColor: string;
}) {
  const qColor = qualityColor(batch.qualityScore);
  const sColor = shelfColor(batch.shelfLifePercent);

  return (
    <div className={styles.aiSection}>
      <div className={styles.aiCard}>
        <span className={styles.aiLabel}>Quality Assessment</span>
        <span className={styles.aiValue}>{batch.qualityScore}/100</span>
        <span
          className={styles.aiStatus}
          style={{ background: `${qColor}18`, color: qColor }}
        >
          {qualityLabel(batch.qualityScore)}
        </span>
      </div>
      <div className={styles.aiCard}>
        <span className={styles.aiLabel}>Shelf Life Prediction</span>
        <span className={styles.aiValue}>{batch.shelfLifeDays} days</span>
        <span
          className={styles.aiStatus}
          style={{ background: `${sColor}18`, color: sColor }}
        >
          {shelfLabel(batch.shelfLifePercent)} — {batch.shelfLifePercent}%
          remaining
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
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          Prices trending up
        </span>
      </div>
      <div className={styles.insightBox}>
        <p>
          <strong>🤖 AI Summary:</strong> {batch.cropType}
          {batch.variety ? ` (${batch.variety})` : ""} shows{" "}
          <strong>{qualityLabel(batch.qualityScore).toLowerCase()}</strong>{" "}
          quality with{" "}
          <strong>{shelfLabel(batch.shelfLifePercent).toLowerCase()}</strong>{" "}
          shelf life.{" "}
          {batch.qualityScore >= 85
            ? "Prioritise fast dispatch to premium channels."
            : batch.qualityScore >= 70
            ? "Standard distribution channels recommended."
            : "Consider value-processing or discounted distribution to minimise losses."}
        </p>
      </div>
    </div>
  );
}

function RateTab({
  batch,
  role,
  ratingKey,
}: {
  batch: BatchDetail;
  role: string;
  ratingKey: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState<{
    rating: number;
    feedback: string;
    submittedAt: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ratingKey);
      if (stored) {
        const p = JSON.parse(stored);
        setSaved(p);
        setRating(p.rating);
        setFeedback(p.feedback);
        setSubmitted(true);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [ratingKey]);

  const handleSubmit = () => {
    if (!rating) return;
    const data = { rating, feedback, submittedAt: new Date().toISOString() };
    localStorage.setItem(ratingKey, JSON.stringify(data));
    setSaved(data);
    setSubmitted(true);
  };

  const handleEdit = () => {
    setSubmitted(false);
    setSaved(null);
    localStorage.removeItem(ratingKey);
  };

  const supplierName =
    role === "retailer" ? batch.sourceName : batch.farmerName;
  const supplierId = role === "retailer" ? batch.sourceId : batch.farmerId;
  const supplierLoc =
    role === "retailer" ? batch.sourceLocation : batch.farmLocation;
  const supplierType = role === "retailer" ? batch.sourceType : "Farmer";

  return (
    <div className={styles.rateSection}>
      <div className={styles.supplierCard}>
        <div className={styles.supplierIcon}>
          {supplierType === "Farmer" ? "🌾" : "🏭"}
        </div>
        <div className={styles.supplierInfo}>
          <span className={styles.supplierRole}>Purchased From</span>
          <strong className={styles.supplierName}>{supplierName ?? "—"}</strong>
          <span className={styles.supplierSub}>
            {supplierType} · ID: {supplierId ?? "—"}
          </span>
          <span className={styles.supplierSub}>📍 {supplierLoc ?? "—"}</span>
        </div>
      </div>

      {submitted && saved ? (
        <div className={styles.submitted}>
          <div className={styles.submittedStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={
                  s <= saved.rating ? styles.starFilled : styles.starEmpty
                }
              >
                ★
              </span>
            ))}
          </div>
          <p className={styles.submittedMsg}>Thanks for your feedback!</p>
          {saved.feedback && (
            <p className={styles.submittedFeedback}>
              &ldquo;{saved.feedback}&rdquo;
            </p>
          )}
          <p className={styles.submittedDate}>
            Submitted on{" "}
            {new Date(saved.submittedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <button className={styles.editRatingBtn} onClick={handleEdit}>
            Edit Rating
          </button>
        </div>
      ) : (
        <>
          <p className={styles.ratePrompt}>
            How was the quality and service from{" "}
            {supplierName ?? "this supplier"}?
          </p>
          <div className={styles.starRow} onMouseLeave={() => setHovered(0)}>
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
              {["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1]} (
              {rating}/5)
            </p>
          )}
          <textarea
            className={styles.feedbackArea}
            rows={4}
            maxLength={500}
            placeholder={`Share your experience with ${
              supplierName ?? "this supplier"
            } — quality, packaging, delivery…`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className={styles.feedbackFooter}>
            <span className={styles.charCount}>{feedback.length}/500</span>
            <button
              className={styles.submitRatingBtn}
              onClick={handleSubmit}
              disabled={!rating}
            >
              Submit Feedback
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function RetailerStatusActions({
  status,
  onStatusChange,
  onClose,
}: {
  status: string;
  onStatusChange: (s: string) => void;
  onClose: () => void;
}) {
  const act = (s: string) => {
    onStatusChange(s);
    onClose();
  };

  if (status === "Incoming")
    return (
      <div className={styles.actionBtns}>
        <button className={styles.actionGreen} onClick={() => act("Accepted")}>
          ✓ Accept Batch
        </button>
        <button className={styles.actionRed} onClick={() => act("Rejected")}>
          ✕ Reject Batch
        </button>
      </div>
    );
  if (status === "Accepted")
    return (
      <div className={styles.actionBtns}>
        <button className={styles.actionCyan} onClick={() => act("Available")}>
          🛒 Mark Available for Customers
        </button>
      </div>
    );
  if (status === "Available" || status === "Low Stock")
    return (
      <div className={styles.actionBtns}>
        <button className={styles.actionGrey} onClick={() => act("Sold Out")}>
          ✓ Mark as Sold Out
        </button>
        <button className={styles.actionRed} onClick={() => act("Expired")}>
          ⏰ Mark as Expired
        </button>
      </div>
    );
  return null;
}

/* ── Main Modal ── */
export default function BatchDetailsModal({
  batch,
  role,
  accentColor,
  onClose,
  onStatusChange,
}: BatchDetailsModalProps) {
  const [tab, setTab] = useState<TabKey>("info");
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(`https://farmchainx.com/batch/${batch.id}`, {
      width: 200,
      margin: 2,
      color: { dark: accentColor, light: "#ffffff" },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(""));
  }, [batch.id, accentColor]);

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

  const tabs: { key: TabKey; label: string }[] = [
    { key: "info", label: "Batch Info" },
    { key: "supply", label: "Supply Chain" },
    { key: "price", label: "Price & Market" },
    { key: "ai", label: "AI Insights" },
    ...(role !== "farmer"
      ? [{ key: "rate" as TabKey, label: "⭐ Rate Supplier" }]
      : []),
  ];

  const headerGradient =
    role === "farmer"
      ? "linear-gradient(135deg, #14532d 0%, #166534 100%)"
      : role === "distributor"
      ? "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)"
      : "linear-gradient(135deg, #15803d 0%, #0891b2 100%)";

  const ratingKey = `fcx-${role}-rating-${batch.id}`;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Crop image banner (farmer only) */}
        {batch.cropImagePreview && (
          <div className={styles.imageBanner}>
            <img
              src={batch.cropImagePreview}
              alt={`${batch.cropType} sample`}
            />
          </div>
        )}

        {/* Header */}
        <div className={styles.header} style={{ background: headerGradient }}>
          <div>
            <span className={styles.batchId}>{batch.id}</span>
            <h2 className={styles.batchTitle}>
              {batch.cropType}
              {batch.variety ? ` · ${batch.variety}` : ""}
            </h2>
            {(batch.farmerName || batch.sourceName) && (
              <p className={styles.batchMeta}>
                {role === "farmer"
                  ? `Farmer: ${batch.farmerName}`
                  : `From: ${batch.sourceName ?? batch.farmerName}`}
                {batch.quantity ? ` · ${batch.quantity}` : ""}
              </p>
            )}
            <div className={styles.badges}>
              <span className={styles.badge}>{batch.status}</span>
              {batch.organic && (
                <span className={styles.badgeGreen}>🌿 Organic</span>
              )}
              {batch.gapCertified && (
                <span className={styles.badge}>GAP Certified</span>
              )}
            </div>
          </div>
          <div className={styles.headerRight}>
            {qrUrl && (
              <div className={styles.qrMini}>
                <img src={qrUrl} alt="Batch QR" width={64} height={64} />
                <span>Scan to verify</span>
              </div>
            )}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close (Esc)"
            >
              <svg
                width="22"
                height="22"
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

        {/* Metrics bar */}
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Quantity</span>
            <span className={styles.metricValue}>{batch.quantity}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Quality</span>
            <span
              className={styles.metricValue}
              style={{ color: qualityColor(batch.qualityScore) }}
            >
              {batch.qualityScore}/100
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Shelf Life</span>
            <span
              className={styles.metricValue}
              style={{ color: shelfColor(batch.shelfLifePercent) }}
            >
              {batch.shelfLifeDays}d
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>
              {role === "retailer" ? "Buy Price" : "Base Price"}
            </span>
            <span className={styles.metricValue}>
              ₹
              {(role === "retailer" ? batch.pricePerKg : batch.basePrice) ??
                "—"}
              /kg
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Status</span>
            <span className={styles.metricValue} style={{ color: accentColor }}>
              {batch.status}
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className={styles.tabBar}
          style={{ "--tab-accent": accentColor } as React.CSSProperties}
        >
          {tabs.map((t) => (
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
              {batch.qualityGrade && (
                <InfoRow label="Quality Grade" value={batch.qualityGrade} />
              )}
              <InfoRow
                label="Shelf Life"
                value={`${batch.shelfLifeDays} days (${batch.shelfLifePercent}%)`}
              />
              <InfoRow label="Status" value={batch.status} />
              <InfoRow label="Organic" value={batch.organic ? "Yes ✓" : "No"} />
              {batch.farmerName && (
                <InfoRow label="Farmer" value={batch.farmerName} />
              )}
              {batch.farmerId && (
                <InfoRow label="Farmer ID" value={batch.farmerId} />
              )}
              {batch.farmLocation && (
                <InfoRow label="Farm Location" value={batch.farmLocation} />
              )}
              {batch.sourceName && (
                <InfoRow label="Source" value={batch.sourceName} />
              )}
              {batch.sourceType && (
                <InfoRow label="Source Type" value={batch.sourceType} />
              )}
              {batch.sourceLocation && (
                <InfoRow label="Source Location" value={batch.sourceLocation} />
              )}
              {batch.receivedAt && (
                <InfoRow label="Received On" value={batch.receivedAt} />
              )}
              {batch.expiresAt && (
                <InfoRow label="Expires On" value={batch.expiresAt} />
              )}
              {batch.transferredTo && (
                <InfoRow label="Transferred To" value={batch.transferredTo} />
              )}
              {batch.remainingQty && (
                <InfoRow label="Remaining Qty" value={batch.remainingQty} />
              )}
              {batch.section && (
                <InfoRow label="Store Section" value={batch.section} />
              )}
              {batch.inspectionNote && (
                <div className={styles.noteBox}>
                  <span className={styles.noteLabel}>Inspection Note</span>
                  <p className={styles.noteText}>{batch.inspectionNote}</p>
                </div>
              )}
            </div>
          )}

          {tab === "supply" && <SupplyChainTab batch={batch} role={role} />}
          {tab === "price" && <PriceTab batch={batch} role={role} />}
          {tab === "ai" && <AITab batch={batch} accentColor={accentColor} />}
          {tab === "rate" && (
            <RateTab batch={batch} role={role} ratingKey={ratingKey} />
          )}

          {/* Retailer status actions shown at bottom of every tab */}
          {role === "retailer" && onStatusChange && (
            <div className={styles.actionSection}>
              <h4 className={styles.actionTitle}>Change Status</h4>
              <RetailerStatusActions
                status={batch.status}
                onStatusChange={onStatusChange}
                onClose={onClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
