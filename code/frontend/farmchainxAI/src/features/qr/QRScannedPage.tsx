import { useState } from "react";
import styles from "./QRScannedPage.module.css";

/* ── Sample Batch Data ─────────────────────────────────────── */
const BATCH = {
  id: "BCH-2026-001",
  crop: "Wheat",
  variety: "Sharbati Wheat",
  status: "Verified" as const,
  organic: true,
  certifications: ["India Organic", "FSSAI Certified", "PGS-India"],
  harvestDate: "12 Jan 2026",
  sowingDate: "15 Oct 2025",
  quantity: 1200,
  qualityScore: 92,
  qualityGrade: "Premium",
  shelfLifePercent: 68,
  shelfLifeDays: 8,
  farmLocation: "Amritsar, Punjab",
  farmingMethod: "Organic",
  pricePerKg: 42,
  priceRange: "₹40 – ₹45 / kg",
  scanCount: 124,
  blockchainHash: "0x7f4a2c9e1b3d8f56a0c4e7290d3b1f8e2a5c7d9b",
  blockchainTimestamp: "12 Jan 2026, 10:20 AM",
  blockchainVerified: true,
  imageUrl:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
};

const SUPPLY_CHAIN = [
  {
    stage: 1,
    icon: "🌾",
    role: "Farmer",
    name: "Rajesh Kumar",
    entity: "Kumar Organic Farms",
    action: "Batch Created",
    date: "12 Jan 2026, 09:00 AM",
    location: "Amritsar, Punjab",
    status: "completed" as const,
  },
  {
    stage: 2,
    icon: "🏭",
    role: "Distributor",
    name: "Priya Mehta",
    entity: "Agro Warehouse Ltd.",
    action: "Batch Accepted & Stored",
    date: "14 Jan 2026, 11:30 AM",
    location: "Ludhiana, Punjab",
    status: "completed" as const,
  },
  {
    stage: 3,
    icon: "🚚",
    role: "Distributor",
    name: "Priya Mehta",
    entity: "Agro Warehouse Ltd.",
    action: "Transported to Retailer",
    date: "18 Jan 2026, 07:45 AM",
    location: "Chandigarh → Mumbai",
    status: "completed" as const,
  },
  {
    stage: 4,
    icon: "🏪",
    role: "Retailer",
    name: "Arjun Sharma",
    entity: "FreshMart Grocers",
    action: "Received & Shelved",
    date: "20 Jan 2026, 03:15 PM",
    location: "Mumbai, Maharashtra",
    status: "completed" as const,
  },
  {
    stage: 5,
    icon: "👥",
    role: "Consumer",
    name: "Available for Purchase",
    entity: "FreshMart Grocers",
    action: "On Shelf",
    date: "20 Jan 2026, 04:00 PM",
    location: "Mumbai, Maharashtra",
    status: "active" as const,
  },
];

const QUALITY_TREND = [
  { day: "Day 0", score: 92 },
  { day: "Day 2", score: 89 },
  { day: "Day 4", score: 85 },
  { day: "Day 6", score: 79 },
  { day: "Day 8", score: 72 },
  { day: "Day 10", score: 62 },
  { day: "Day 12", score: 50 },
];

const SAMPLE_REVIEWS = [
  {
    id: 1,
    user: "Anjali R.",
    rating: 5,
    comment:
      "Excellent wheat quality! Very fresh and aromatic. Will definitely buy again.",
    date: "22 Jan 2026",
  },
  {
    id: 2,
    user: "Mohan P.",
    rating: 4,
    comment:
      "Good quality product. The traceability feature is very reassuring.",
    date: "23 Jan 2026",
  },
  {
    id: 3,
    user: "Sita K.",
    rating: 5,
    comment: "Love this organic wheat. Great transparency in supply chain!",
    date: "24 Jan 2026",
  },
];

const PARTICIPANT_RATINGS = {
  farmer: { name: "Rajesh Kumar", rating: 4.7, count: 48 },
  distributor: { name: "Priya Mehta", rating: 4.5, count: 31 },
  retailer: { name: "Arjun Sharma", rating: 4.6, count: 62 },
};

/* ── Helpers ───────────────────────────────────────────────── */
function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`${styles.starBtn} ${
            s <= (hover || value) ? styles.starActive : ""
          }`}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          aria-label={`${s} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StaticStars({ rating }: { rating: number }) {
  return (
    <span className={styles.staticStars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={
            s <= Math.round(rating) ? styles.starFilled : styles.starEmpty
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

function CircleProgress({
  pct,
  label,
  color,
}: {
  pct: number;
  label: string;
  color: string;
}) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className={styles.circleWrap}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="46"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fill="#111827"
        >
          {pct}%
        </text>
        <text x="50" y="60" textAnchor="middle" fontSize="7.5" fill="#6B7280">
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function QRScannedPage() {
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [participantRatings, setParticipantRatings] = useState({
    farmer: 0,
    distributor: 0,
    retailer: 0,
  });
  const [participantSubmitted, setParticipantSubmitted] = useState(false);
  const [blockchainVerified, setBlockchainVerified] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewComment.trim()) return;
    setReviews((prev) => [
      {
        id: Date.now(),
        user: "You",
        rating: reviewRating,
        comment: reviewComment.trim(),
        date: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      },
      ...prev,
    ]);
    setReviewSubmitted(true);
    setReviewComment("");
    setReviewRating(0);
  };

  const handleParticipantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParticipantSubmitted(true);
  };

  const maxTrend = Math.max(...QUALITY_TREND.map((d) => d.score));

  return (
    <div className={styles.page}>
      {/* ── 1. HEADER ─────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerBg} />
        <div className={styles.headerContent}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>🌿</div>
            <div>
              <h1 className={styles.logoTitle}>
                FarmChainX Traceability Portal
              </h1>
              <p className={styles.logoSub}>
                Verified Agricultural Supply Chain Information
              </p>
            </div>
          </div>

          <div className={styles.batchHero}>
            <div className={styles.batchMeta}>
              <div className={styles.batchIdRow}>
                <span className={styles.batchLabel}>BATCH ID</span>
                <span className={styles.batchId}>{BATCH.id}</span>
              </div>
              <h2 className={styles.cropName}>
                {BATCH.organic && (
                  <span className={styles.organicTag}>🌱 Organic</span>
                )}
                {BATCH.crop} — {BATCH.variety}
              </h2>
              <div className={styles.headerBadges}>
                <span className={styles.statusBadge}>✅ {BATCH.status}</span>
                <span className={styles.scanBadge}>
                  👁 Scanned by {BATCH.scanCount} consumers
                </span>
              </div>
            </div>
            <div className={styles.qrPlaceholder}>
              <div className={styles.qrInner}>
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h3v3h-3z" />
                </svg>
                <div className={styles.qrLabel}>QR Verified</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* ── 2. BATCH OVERVIEW CARDS ───────────────────────── */}
        <section className={styles.section}>
          <div className={styles.overviewGrid}>
            {[
              { icon: "📅", label: "Harvest Date", value: BATCH.harvestDate },
              {
                icon: "⚖️",
                label: "Quantity",
                value: `${BATCH.quantity.toLocaleString()} kg`,
              },
              {
                icon: "🏆",
                label: "Quality Score",
                value: `${BATCH.qualityScore}/100`,
              },
              {
                icon: "⏳",
                label: "Shelf Life Left",
                value: `${BATCH.shelfLifeDays} Days`,
              },
              { icon: "💰", label: "Price Range", value: BATCH.priceRange },
            ].map(({ icon, label, value }) => (
              <div key={label} className={styles.overviewCard}>
                <span className={styles.overviewIcon}>{icon}</span>
                <span className={styles.overviewLabel}>{label}</span>
                <span className={styles.overviewValue}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. CROP IMAGE + AI HEALTH PANEL ──────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            🌾 Crop Image & AI Health Analysis
          </h2>
          <div className={styles.imageAiRow}>
            {/* Left: Crop image */}
            <div className={styles.imagePanel}>
              <div className={styles.imageWrap}>
                {imgError ? (
                  <div className={styles.imageFallback}>
                    <span style={{ fontSize: "4rem" }}>🌾</span>
                    <p>Crop Image</p>
                  </div>
                ) : (
                  <img
                    src={BATCH.imageUrl}
                    alt={BATCH.crop}
                    className={styles.cropImage}
                    onError={() => setImgError(true)}
                  />
                )}
                <div className={styles.imageOverlay}>
                  <span className={styles.imageOverlayBadge}>
                    📸 Farmer Uploaded
                  </span>
                </div>
              </div>
              <div className={styles.imageCerts}>
                {BATCH.certifications.map((c) => (
                  <span key={c} className={styles.certBadge}>
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: AI Panel */}
            <div className={styles.aiPanel}>
              <div className={styles.aiHeader}>
                <span className={styles.aiIcon}>🤖</span>
                <div>
                  <h3 className={styles.aiTitle}>AI Analysis Panel</h3>
                  <p className={styles.aiSub}>
                    Powered by FarmChainX AI Engine
                  </p>
                </div>
              </div>

              <div className={styles.aiMetrics}>
                <div className={styles.aiMetric}>
                  <div className={styles.aiMetricHeader}>
                    <span>🏆 AI Quality Score</span>
                    <span
                      className={styles.aiMetricVal}
                      style={{ color: "#16A34A" }}
                    >
                      92 / 100
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: "92%",
                        background: "linear-gradient(90deg,#16A34A,#22C55E)",
                      }}
                    />
                  </div>
                </div>

                <div className={styles.aiMetric}>
                  <div className={styles.aiMetricHeader}>
                    <span>⚠️ Spoilage Risk</span>
                    <span
                      className={styles.riskBadge}
                      style={{ background: "#F0FDF4", color: "#16A34A" }}
                    >
                      Low
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: "12%",
                        background: "linear-gradient(90deg,#16A34A,#22C55E)",
                      }}
                    />
                  </div>
                </div>

                <div className={styles.aiMetric}>
                  <div className={styles.aiMetricHeader}>
                    <span>💧 Moisture Level</span>
                    <span
                      className={styles.riskBadge}
                      style={{ background: "#EFF6FF", color: "#2563EB" }}
                    >
                      Optimal
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: "65%",
                        background: "linear-gradient(90deg,#2563EB,#60A5FA)",
                      }}
                    />
                  </div>
                </div>

                <div className={styles.aiMetric}>
                  <div className={styles.aiMetricHeader}>
                    <span>📦 Shelf Life</span>
                    <span
                      className={styles.aiMetricVal}
                      style={{ color: "#D97706" }}
                    >
                      {BATCH.shelfLifePercent}%
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${BATCH.shelfLifePercent}%`,
                        background: "linear-gradient(90deg,#F59E0B,#FCD34D)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.storageRec}>
                <div className={styles.storageRecIcon}>🌡️</div>
                <div>
                  <div className={styles.storageRecTitle}>
                    Storage Recommendation
                  </div>
                  <div className={styles.storageRecText}>
                    Store at 4°C – 8°C in a dry, well-ventilated area. Avoid
                    direct sunlight and moisture exposure.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. BATCH INFORMATION ─────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 Batch Information</h2>
          <div className={styles.infoCard}>
            <div className={styles.infoGrid}>
              {[
                { label: "Crop Type", value: BATCH.crop },
                { label: "Crop Variety", value: BATCH.variety },
                { label: "Harvest Date", value: BATCH.harvestDate },
                { label: "Sowing Date", value: BATCH.sowingDate },
                { label: "Farm Location", value: BATCH.farmLocation },
                { label: "Farming Method", value: BATCH.farmingMethod },
                { label: "Quality Grade", value: BATCH.qualityGrade },
                { label: "Price per Kg", value: `₹${BATCH.pricePerKg}` },
              ].map(({ label, value }) => (
                <div key={label} className={styles.infoItem}>
                  <span className={styles.infoLabel}>{label}</span>
                  <span className={styles.infoValue}>{value}</span>
                </div>
              ))}
            </div>
            <div className={styles.infoCerts}>
              <span className={styles.infoLabel}>Certifications</span>
              <div className={styles.certsList}>
                {BATCH.certifications.map((c) => (
                  <span key={c} className={styles.certPill}>
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. SUPPLY CHAIN TIMELINE ─────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔗 Supply Chain Tracking</h2>
          <p className={styles.sectionSub}>
            Complete traceability from farm to your hands
          </p>
          <div className={styles.timeline}>
            {SUPPLY_CHAIN.map((step, idx) => (
              <div
                key={step.stage}
                className={`${styles.timelineItem} ${
                  step.status === "active" ? styles.timelineActive : ""
                }`}
              >
                <div className={styles.timelineLeft}>
                  <div
                    className={`${styles.timelineDot} ${
                      step.status === "completed"
                        ? styles.dotCompleted
                        : step.status === "active"
                        ? styles.dotActive
                        : styles.dotPending
                    }`}
                  >
                    {step.icon}
                  </div>
                  {idx < SUPPLY_CHAIN.length - 1 && (
                    <div
                      className={`${styles.timelineLine} ${
                        step.status === "completed"
                          ? styles.lineCompleted
                          : styles.linePending
                      }`}
                    />
                  )}
                </div>
                <div className={styles.timelineCard}>
                  <div className={styles.timelineCardTop}>
                    <div>
                      <div className={styles.timelineAction}>{step.action}</div>
                      <div className={styles.timelinePerson}>
                        <strong>{step.name}</strong>
                        <span className={styles.timelineRole}>{step.role}</span>
                      </div>
                    </div>
                    <span
                      className={`${styles.timelineStatus} ${
                        step.status === "completed"
                          ? styles.statusCompleted
                          : styles.statusActive
                      }`}
                    >
                      {step.status === "completed" ? "✓ Done" : "● Live"}
                    </span>
                  </div>
                  <div className={styles.timelineMeta}>
                    <span>🏢 {step.entity}</span>
                    <span>📍 {step.location}</span>
                    <span>🕐 {step.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. AI PREDICTIONS & ANALYTICS ────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📊 AI Predictions & Analytics</h2>
          <div className={styles.analyticsGrid}>
            {/* Circle gauges */}
            <div className={styles.analyticsCard}>
              <h3 className={styles.analyticsCardTitle}>
                Shelf Life Prediction
              </h3>
              <div className={styles.circlesRow}>
                <div className={styles.circleItem}>
                  <CircleProgress
                    pct={BATCH.shelfLifePercent}
                    label="Remaining"
                    color="#F59E0B"
                  />
                  <div className={styles.circleCaption}>
                    {BATCH.shelfLifeDays} Days Left
                  </div>
                </div>
                <div className={styles.circleItem}>
                  <CircleProgress
                    pct={BATCH.qualityScore}
                    label="Quality"
                    color="#16A34A"
                  />
                  <div className={styles.circleCaption}>
                    Grade {BATCH.qualityGrade}
                  </div>
                </div>
                <div className={styles.circleItem}>
                  <CircleProgress pct={88} label="Safety" color="#2563EB" />
                  <div className={styles.circleCaption}>Safe to Consume</div>
                </div>
              </div>
            </div>

            {/* Quality trend chart */}
            <div className={styles.analyticsCard}>
              <h3 className={styles.analyticsCardTitle}>
                Quality Decline Trend
              </h3>
              <div className={styles.trendChart}>
                <div className={styles.trendBars}>
                  {QUALITY_TREND.map((d) => (
                    <div key={d.day} className={styles.trendBarGroup}>
                      <div className={styles.trendBarWrap}>
                        <div
                          className={styles.trendBar}
                          style={{
                            height: `${(d.score / maxTrend) * 100}%`,
                            background:
                              d.score >= 80
                                ? "#16A34A"
                                : d.score >= 65
                                ? "#F59E0B"
                                : "#EF4444",
                          }}
                          title={`${d.day}: ${d.score}`}
                        />
                      </div>
                      <div className={styles.trendLabel}>
                        <div>{d.day.replace("Day ", "D")}</div>
                        <div style={{ fontWeight: 700 }}>{d.score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market price */}
            <div className={styles.analyticsCard}>
              <h3 className={styles.analyticsCardTitle}>
                Market Price Prediction
              </h3>
              <div className={styles.marketBars}>
                {[
                  { label: "Jan", price: 40, highlight: false },
                  { label: "Feb", price: 42, highlight: false },
                  { label: "Mar", price: 45, highlight: true },
                  { label: "Apr", price: 43, highlight: false },
                  { label: "May", price: 38, highlight: false },
                ].map((m) => (
                  <div key={m.label} className={styles.marketBarGroup}>
                    <div className={styles.marketBarWrap}>
                      <div
                        className={styles.marketBar}
                        style={{
                          height: `${(m.price / 50) * 100}%`,
                          background: m.highlight
                            ? "linear-gradient(180deg,#2563EB,#60A5FA)"
                            : "linear-gradient(180deg,#93C5FD,#BFDBFE)",
                        }}
                      />
                    </div>
                    <div className={styles.marketLabel}>
                      <div>{m.label}</div>
                      <div style={{ fontWeight: 700, color: "#2563EB" }}>
                        ₹{m.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.marketNote}>
                <span className={styles.marketNoteText}>
                  📈 Expected peak price in March 2026
                </span>
              </div>
            </div>

            {/* Storage details */}
            <div className={styles.analyticsCard + " " + styles.storageCard}>
              <h3 className={styles.analyticsCardTitle}>
                🌡️ Storage Conditions
              </h3>
              <div className={styles.storageDetails}>
                {[
                  {
                    label: "Recommended Temperature",
                    value: "4°C – 8°C",
                    icon: "🌡️",
                  },
                  { label: "Humidity", value: "50% – 60% RH", icon: "💧" },
                  { label: "Storage Type", value: "Dry Warehouse", icon: "🏭" },
                  { label: "Packaging", value: "Jute/Cloth Bags", icon: "📦" },
                  {
                    label: "Light Exposure",
                    value: "Avoid Direct Sun",
                    icon: "☀️",
                  },
                  { label: "Ventilation", value: "High Airflow", icon: "🌬️" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className={styles.storageItem}>
                    <span className={styles.storageItemIcon}>{icon}</span>
                    <div>
                      <div className={styles.storageItemLabel}>{label}</div>
                      <div className={styles.storageItemValue}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. RATINGS & COMMENTS ────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⭐ Ratings & Reviews</h2>
          <div className={styles.ratingLayout}>
            {/* Summary */}
            <div className={styles.ratingSummary}>
              <div className={styles.avgRating}>
                {(
                  reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
                ).toFixed(1)}
              </div>
              <StaticStars
                rating={
                  reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
                }
              />
              <div className={styles.ratingCount}>{reviews.length} reviews</div>

              {/* Distribution */}
              <div className={styles.ratingDist}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct =
                    reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className={styles.distRow}>
                      <span className={styles.distLabel}>{star}★</span>
                      <div className={styles.distBar}>
                        <div
                          className={styles.distFill}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={styles.distCount}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write review */}
            <div className={styles.reviewForm}>
              <h3 className={styles.reviewFormTitle}>Write a Review</h3>
              {reviewSubmitted ? (
                <div className={styles.reviewSuccess}>
                  ✅ Thank you for your review! Your feedback helps other
                  consumers.
                </div>
              ) : (
                <form
                  onSubmit={handleReviewSubmit}
                  className={styles.reviewFormInner}
                >
                  <div className={styles.reviewRatingRow}>
                    <span className={styles.reviewRatingLabel}>
                      Your Rating:
                    </span>
                    <StarRow value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <textarea
                    className={styles.reviewTextarea}
                    placeholder="Share your experience with this product…"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    maxLength={300}
                  />
                  <div className={styles.reviewFormFooter}>
                    <span className={styles.reviewCharCount}>
                      {reviewComment.length}/300
                    </span>
                    <button
                      type="submit"
                      className={styles.reviewSubmitBtn}
                      disabled={reviewRating === 0 || !reviewComment.trim()}
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Review list */}
          <div className={styles.reviewList}>
            {reviews.map((r) => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewAvatar}>{r.user[0]}</div>
                  <div className={styles.reviewMeta}>
                    <strong className={styles.reviewUser}>{r.user}</strong>
                    <div className={styles.reviewDate}>{r.date}</div>
                  </div>
                  <StaticStars rating={r.rating} />
                </div>
                <p className={styles.reviewComment}>{r.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. SUPPLY CHAIN PARTICIPANT RATINGS ──────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            👨‍🌾 Rate Supply Chain Participants
          </h2>
          <p className={styles.sectionSub}>
            Help us improve traceability by rating the participants involved in
            this batch
          </p>
          <div className={styles.participantGrid}>
            {(["farmer", "distributor", "retailer"] as const).map((role) => {
              const icons = { farmer: "🌾", distributor: "🚚", retailer: "🏪" };
              const info = PARTICIPANT_RATINGS[role];
              return (
                <div key={role} className={styles.participantCard}>
                  <div className={styles.participantCardTop}>
                    <span className={styles.participantIcon}>
                      {icons[role]}
                    </span>
                    <div>
                      <div className={styles.participantRole}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </div>
                      <div className={styles.participantName}>{info.name}</div>
                    </div>
                  </div>
                  <div className={styles.participantCurrentRating}>
                    <StaticStars rating={info.rating} />
                    <span className={styles.participantRatingVal}>
                      {info.rating}
                    </span>
                    <span className={styles.participantRatingCount}>
                      ({info.count} ratings)
                    </span>
                  </div>
                  {!participantSubmitted ? (
                    <div className={styles.participantRateRow}>
                      <span className={styles.participantRateLabel}>
                        Your rating:
                      </span>
                      <StarRow
                        value={participantRatings[role]}
                        onChange={(v) =>
                          setParticipantRatings((prev) => ({
                            ...prev,
                            [role]: v,
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <div className={styles.participantThanks}>✅ Rated!</div>
                  )}
                </div>
              );
            })}
          </div>
          {!participantSubmitted && (
            <form
              onSubmit={handleParticipantSubmit}
              className={styles.participantSubmitRow}
            >
              <button
                type="submit"
                className={styles.participantSubmitBtn}
                disabled={Object.values(participantRatings).every(
                  (v) => v === 0
                )}
              >
                Submit Ratings
              </button>
            </form>
          )}
          {participantSubmitted && (
            <div className={styles.participantSuccess}>
              ✅ Thank you! Your ratings have been recorded on the blockchain.
            </div>
          )}
        </section>

        {/* ── 9. BLOCKCHAIN VERIFICATION ───────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⛓️ Blockchain Verification</h2>
          <div className={styles.blockchainCard}>
            <div className={styles.blockchainLeft}>
              <div className={styles.blockchainStatus}>
                <div
                  className={`${styles.blockchainDot} ${
                    blockchainVerified
                      ? styles.blockchainDotVerified
                      : styles.blockchainDotDefault
                  }`}
                />
                <span className={styles.blockchainStatusText}>
                  {blockchainVerified
                    ? "Verified on Blockchain ✓"
                    : "Pending Verification"}
                </span>
              </div>
              <div className={styles.blockchainDetails}>
                <div className={styles.blockchainRow}>
                  <span className={styles.bcLabel}>Transaction Hash</span>
                  <span className={styles.bcHash}>{BATCH.blockchainHash}</span>
                </div>
                <div className={styles.blockchainRow}>
                  <span className={styles.bcLabel}>Verified</span>
                  <span className={styles.bcValue} style={{ color: "#16A34A" }}>
                    ✅ Yes — Immutable Record
                  </span>
                </div>
                <div className={styles.blockchainRow}>
                  <span className={styles.bcLabel}>Timestamp</span>
                  <span className={styles.bcValue}>
                    {BATCH.blockchainTimestamp}
                  </span>
                </div>
                <div className={styles.blockchainRow}>
                  <span className={styles.bcLabel}>Network</span>
                  <span className={styles.bcValue}>
                    FarmChainX Private Blockchain
                  </span>
                </div>
                <div className={styles.blockchainRow}>
                  <span className={styles.bcLabel}>Block Height</span>
                  <span className={styles.bcValue}>#1,048,576</span>
                </div>
              </div>
            </div>
            <div className={styles.blockchainRight}>
              <div className={styles.blockchainIcon}>⛓️</div>
              <button
                className={`${styles.verifyBtn} ${
                  blockchainVerified ? styles.verifyBtnDone : ""
                }`}
                onClick={() => setBlockchainVerified(true)}
              >
                {blockchainVerified
                  ? "✓ Transaction Verified"
                  : "Verify Transaction"}
              </button>
              {blockchainVerified && (
                <div className={styles.verifyNote}>
                  Record confirmed on-chain. Data is tamper-proof.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      {/* end container */}

      {/* ── 10. FOOTER ───────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>🌿 FarmChainX</span>
            <p className={styles.footerTagline}>
              AI + Blockchain Agricultural Traceability
            </p>
            <p className={styles.footerSub}>
              Connecting farmers to consumers with trust & transparency
            </p>
          </div>
          <div className={styles.footerLinks}>
            <h4 className={styles.footerLinksTitle}>Platform</h4>
            <a href="#" className={styles.footerLink}>
              About FarmChainX
            </a>
            <a href="#" className={styles.footerLink}>
              How It Works
            </a>
            <a href="#" className={styles.footerLink}>
              For Farmers
            </a>
            <a href="#" className={styles.footerLink}>
              For Retailers
            </a>
          </div>
          <div className={styles.footerLinks}>
            <h4 className={styles.footerLinksTitle}>Legal</h4>
            <a href="#" className={styles.footerLink}>
              Privacy Policy
            </a>
            <a href="#" className={styles.footerLink}>
              Terms of Service
            </a>
            <a href="#" className={styles.footerLink}>
              Data Security
            </a>
          </div>
          <div className={styles.footerLinks}>
            <h4 className={styles.footerLinksTitle}>Contact</h4>
            <a href="#" className={styles.footerLink}>
              support@farmchainx.com
            </a>
            <a href="#" className={styles.footerLink}>
              +91 1800-FCX-HELP
            </a>
            <a href="#" className={styles.footerLink}>
              Report an Issue
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 FarmChainX. All rights reserved.</span>
          <span className={styles.footerBottomRight}>
            Powered by 🤖 AI + ⛓️ Blockchain · Batch {BATCH.id}
          </span>
        </div>
      </footer>
    </div>
  );
}
