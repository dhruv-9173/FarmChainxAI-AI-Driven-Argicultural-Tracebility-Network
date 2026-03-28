import { useState, useEffect } from "react";
import QRCode from "qrcode";
import type { Batch, SupplyChainEvent } from "../../../types/dashboard.types";
import { getBatchTimeline } from "../api/farmerApi";
import styles from "./BatchDetailsModal.module.css";

interface BatchDetailsModalProps {
  batch: Batch;
  onClose: () => void;
}

type TabKey = "info" | "supply" | "price" | "ai";

export default function BatchDetailsModal({
  batch,
  onClose,
}: BatchDetailsModalProps) {
  const [tab, setTab] = useState<TabKey>("info");
  const [qrUrl, setQrUrl] = useState("");
  const [supplyChainEvents, setSupplyChainEvents] = useState<
    SupplyChainEvent[]
  >([]);

  useEffect(() => {
    getBatchTimeline(batch.id)
      .then((events: SupplyChainEvent[]) => setSupplyChainEvents(events))
      .catch(() => setSupplyChainEvents([]));
  }, [batch.id]);

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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const totalValue =
    (batch.basePrice ?? 0) * parseFloat(batch.quantity.replace(/,/g, ""));
  const marketValue =
    (batch.marketPrice ?? 0) * parseFloat(batch.quantity.replace(/,/g, ""));
  const profit = marketValue - totalValue;
  const margin = totalValue > 0 ? Math.round((profit / totalValue) * 100) : 0;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "info", label: "Batch Info" },
    { key: "supply", label: "Supply Chain" },
    { key: "price", label: "Price & Market" },
    { key: "ai", label: "AI Insights" },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Crop image banner */}
        {batch.cropImagePreview && (
          <div className={styles.imageBanner}>
            <img
              src={batch.cropImagePreview}
              alt={`${batch.cropType} sample`}
            />
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.batchId}>{batch.id}</h2>
            <p className={styles.batchMeta}>
              {batch.cropType}
              {batch.variety ? ` · ${batch.variety}` : ""} · {batch.quantity}
            </p>
            <p className={styles.farmer}>Farmer: {batch.farmerName}</p>
            <div className={styles.badges}>
              <span className={styles.badgeBlue}>In Transit</span>
              {batch.organic && (
                <span className={styles.badgeGreen}>Organic</span>
              )}
              {batch.gapCertified && (
                <span className={styles.badgeTeal}>GAP Certified</span>
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
            <span className={styles.metricLabel}>Quantity</span>
            <span className={styles.metricValue}>{batch.quantity}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Quality Score</span>
            <span className={styles.metricValue}>{batch.qualityScore}/100</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Shelf Life</span>
            <span className={styles.metricValue}>
              {batch.shelfLifeDays} days
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Location</span>
            <span className={styles.metricValue}>{batch.location ?? "—"}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Base Price</span>
            <span className={styles.metricValue}>
              ₹{batch.basePrice ?? 0}/kg
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabBar}>
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

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {tab === "info" && <BatchInfoTab batch={batch} />}
          {tab === "supply" && <SupplyChainTab events={supplyChainEvents} />}
          {tab === "price" && (
            <PriceTab
              batch={batch}
              totalValue={totalValue}
              marketValue={marketValue}
              profit={profit}
              margin={margin}
            />
          )}
          {tab === "ai" && <AITab batch={batch} />}
        </div>
      </div>
    </div>
  );
}

function BatchInfoTab({ batch }: { batch: Batch }) {
  return (
    <div className={styles.infoGrid}>
      <InfoRow label="Batch ID" value={batch.id} />
      <InfoRow label="Crop Type" value={batch.cropType} />
      <InfoRow label="Variety" value={batch.variety ?? "—"} />
      <InfoRow label="Quantity" value={batch.quantity} />
      <InfoRow label="Quality Score" value={`${batch.qualityScore}/100`} />
      <InfoRow label="Status" value={batch.status} />
      <InfoRow label="Created" value={batch.createdAt} />
      <InfoRow label="Farmer" value={batch.farmerName} />
      <InfoRow label="Location" value={batch.location ?? "—"} />
      <InfoRow label="Organic" value={batch.organic ? "Yes" : "No"} />
      <InfoRow
        label="GAP Certified"
        value={batch.gapCertified ? "Yes" : "No"}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

function SupplyChainTab({ events }: { events: SupplyChainEvent[] }) {
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
      {events.map((ev, i) => (
        <div className={styles.timelineItem} key={i}>
          <div
            className={`${styles.timelineDot} ${
              ev.completed ? styles.dotCompleted : styles.dotPending
            }`}
          />
          {i < events.length - 1 && (
            <div
              className={`${styles.timelineLine} ${
                ev.completed ? styles.lineCompleted : ""
              }`}
            />
          )}
          <div className={styles.timelineContent}>
            <span className={styles.timelineTitle}>{ev.title}</span>
            <span className={styles.timelineTime}>{ev.timestamp}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PriceTab({
  batch,
  totalValue,
  marketValue,
  profit,
  margin,
}: {
  batch: Batch;
  totalValue: number;
  marketValue: number;
  profit: number;
  margin: number;
}) {
  return (
    <div>
      <div className={styles.priceCards}>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>Base Price / kg</span>
          <span className={styles.priceValue}>₹{batch.basePrice ?? 0}</span>
        </div>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>Market Price / kg</span>
          <span className={styles.priceValue}>₹{batch.marketPrice ?? 0}</span>
        </div>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>Total Batch Value</span>
          <span className={styles.priceValue}>
            ₹{totalValue.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      <div className={styles.insightBox}>
        <p>
          Estimated market value:{" "}
          <strong>₹{marketValue.toLocaleString("en-IN")}</strong>
        </p>
        <p>
          Profit potential: <strong>₹{profit.toLocaleString("en-IN")}</strong> (
          {margin}% margin)
        </p>
      </div>
    </div>
  );
}

function AITab({ batch }: { batch: Batch }) {
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

  return (
    <div className={styles.aiSection}>
      <div className={styles.aiCard}>
        <span className={styles.aiLabel}>Quality Assessment</span>
        <span className={styles.aiValue}>{batch.qualityScore}/100</span>
        <span
          className={styles.aiStatus}
          style={{
            color:
              batch.qualityScore >= 85
                ? "#16A34A"
                : batch.qualityScore >= 70
                ? "#F59E0B"
                : "#EF4444",
          }}
        >
          {qualityLevel}
        </span>
      </div>
      <div className={styles.aiCard}>
        <span className={styles.aiLabel}>Shelf Life Prediction</span>
        <span className={styles.aiValue}>{batch.shelfLifeDays} days</span>
        <span
          className={styles.aiStatus}
          style={{
            color:
              batch.shelfLifePercent >= 60
                ? "#16A34A"
                : batch.shelfLifePercent >= 30
                ? "#F59E0B"
                : "#EF4444",
          }}
        >
          {shelfLevel}
        </span>
      </div>
      <div className={styles.aiCard}>
        <span className={styles.aiLabel}>Market Recommendation</span>
        <span className={styles.aiValue}>Sell Now</span>
        <span className={styles.aiStatus} style={{ color: "#2563EB" }}>
          Prices trending up
        </span>
      </div>
      <div className={styles.insightBox}>
        <p>
          Based on current market trends and quality metrics, this batch is
          performing{" "}
          <strong>{batch.qualityScore >= 85 ? "above" : "at"} average</strong>.
          Consider transferring within the next{" "}
          {Math.min(batch.shelfLifeDays, 14)} days for optimal pricing.
        </p>
      </div>
    </div>
  );
}
