import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./QRScannedPage.module.css";
import { blockchainApi } from "../../api/blockchainApi";
import type { SupplyChainVerification } from "../../types/blockchain.types";

interface BatchDetail {
  id: string;
  cropType: string;
  variety: string;
  quantity: number;
  quantityUnit: string;
  qualityScore: number;
  qualityGrade?: string;
  status: string;
  organic: boolean;
  certifications?: string;
  harvestDate?: string;
  sowingDate?: string;
  farmCity?: string;
  farmState?: string;
  currentShelfLifeDays?: number;
  expectedShelfLifeDays?: number;
  moistureLevel?: number;
  gapCertified?: boolean;
  cropImageUrl?: string;
  qrCodeUrl?: string;
  qrCodeBase64?: string;
  storageType?: string;
  storageLocation?: string;
  soilType?: string;
  irrigationType?: string;
  notes?: string;
  createdAt?: string;
}

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
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className={styles.circleWrap}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text
          x="48"
          y="44"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#fff"
          fontFamily="'DM Mono', monospace"
        >
          {pct}%
        </text>
        <text
          x="48"
          y="58"
          textAnchor="middle"
          fontSize="7"
          fill="rgba(255,255,255,0.5)"
          fontFamily="inherit"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

function ErrorState() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.stateScreen}>
        <div className={styles.stateIcon}>⌀</div>
        <h1 className={styles.stateTitle}>Batch Not Found</h1>
        <p className={styles.stateSub}>
          This batch doesn't exist or has been removed from the chain.
        </p>
        <button onClick={() => navigate("/")} className={styles.stateBtn}>
          ← Return Home
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={styles.page}>
      <div className={styles.stateScreen}>
        <div className={styles.loadingOrb} />
        <h1 className={styles.stateTitle}>Fetching Chain Data</h1>
        <p className={styles.stateSub}>Verifying traceability records…</p>
      </div>
    </div>
  );
}

export default function QRScannedPage() {
  const { batchId } = useParams<{ batchId: string }>();

  console.log("🎯 QRScannedPage mounted with batchId:", batchId);

  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [blockchainVerified, setBlockchainVerified] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [, setReviewsLoading] = useState(false);
  const [supplyChain, setSupplyChain] =
    useState<SupplyChainVerification | null>(null);

  // Fetch batch details
  useEffect(() => {
    console.log("batchId from URL:", batchId);

    if (!batchId) {
      setError("No batch ID provided");
      setLoading(false);
      return;
    }

    const fetchBatch = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching batch details for:", batchId);
        const res = await fetch(
          `http://localhost:8080/api/v1/browse/batches/${batchId}`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ Batch response:", data);

        if (data.success && data.data) {
          setBatch(data.data);
          setError(null);
          console.log("✅ Batch loaded successfully");
        } else {
          const msg =
            "Failed to load batch: " + (data.message || "Unknown error");
          setError(msg);
          console.error("❌", msg);
        }
      } catch (err: any) {
        console.error("❌ Batch fetch error:", err);
        setError(
          err?.message?.includes("404")
            ? "Batch not found"
            : "Failed to load batch: " + (err?.message || "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchId]);

  // Fetch reviews for the batch
  useEffect(() => {
    if (!batchId) return;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await fetch(
          `http://localhost:8080/api/v1/browse/batches/${batchId}/reviews`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.success && data.data) {
          setReviews(data.data);
        }
      } catch (err: any) {
        console.error("Failed to load reviews:", err.message);
        // Don't show error for reviews - they're optional
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [batchId]);

  // Fetch supply chain data for the batch
  useEffect(() => {
    if (!batchId) return;

    const fetchSupplyChain = async () => {
      try {
        console.log("🔗 Fetching supply chain for batch:", batchId);
        const data = await blockchainApi.getVerifiedSupplyChain(batchId);
        console.log("✅ Supply chain loaded:", data);
        setSupplyChain(data);
      } catch (err: any) {
        console.error("⚠ Failed to load supply chain:", err.message);
        // Don't show error - supply chain is optional
      }
    };

    fetchSupplyChain();
  }, [batchId]);

  if (loading) return <LoadingState />;
  if (error || !batch) return <ErrorState />;

  const certifications = batch.certifications
    ? typeof batch.certifications === "string"
      ? batch.certifications.split(",").map((c) => c.trim())
      : []
    : [];

  const shelfLifePercent = batch.expectedShelfLifeDays
    ? Math.round(
        ((batch.currentShelfLifeDays || 0) / batch.expectedShelfLifeDays) * 100
      )
    : 0;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewComment.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/browse/batches/${batchId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: reviewRating,
            comment: reviewComment.trim(),
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.data) {
        // Add the new review to the list
        setReviews((prev) => [data.data, ...prev]);
        setTimeout(() => {
          setReviewSubmitted(false);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Failed to submit review:", err.message);
      // Show error to user if needed
    }
  };

  return (
    <div className={styles.page}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        {batch.cropImageUrl && (
          <img
            src={batch.cropImageUrl}
            alt=""
            aria-hidden="true"
            className={styles.headerCoverImg}
          />
        )}
        <div
          className={`${styles.headerOverlay} ${
            batch.cropImageUrl
              ? styles.headerOverlayPhoto
              : styles.headerOverlayDefault
          }`}
        />
        <div className={styles.headerNoise} />
        <div className={batch.cropImageUrl ? "" : styles.headerGrid} />

        <div className={styles.headerInner}>
          {/* Top bar */}
          <div className={styles.topBar}>
            <div className={styles.brand}>
              <span className={styles.brandLeaf}>🌿</span>
              <div>
                <span className={styles.brandName}>FarmChainX</span>
                <span className={styles.brandSep}> · </span>
                <span className={styles.brandSub}>Traceability Portal</span>
              </div>
            </div>
            <div className={styles.topBadges}>
              {batch.organic && (
                <span className={styles.organicPill}>✦ Organic</span>
              )}
              <span className={styles.statusPill}>{batch.status}</span>
            </div>
          </div>

          {/* Hero row */}
          <div className={styles.heroRow}>
            <div className={styles.heroLeft}>
              <div className={styles.batchIdChip}>
                <span className={styles.batchIdLabel}>BATCH</span>
                <span className={styles.batchIdValue}>{batch.id}</span>
              </div>
              <h1 className={styles.cropTitle}>
                {batch.cropType}
                {batch.variety && (
                  <span className={styles.cropVariety}>{batch.variety}</span>
                )}
              </h1>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNum}>
                    {batch.qualityScore}
                  </span>
                  <span className={styles.heroStatLabel}>/ 100 Quality</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNum}>{batch.quantity}</span>
                  <span className={styles.heroStatLabel}>
                    {batch.quantityUnit}
                  </span>
                </div>
                {batch.qualityGrade && (
                  <>
                    <div className={styles.heroStatDivider} />
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatNum}>
                        {batch.qualityGrade}
                      </span>
                      <span className={styles.heroStatLabel}>Grade</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* QR panel */}
            <div className={styles.qrPanel}>
              {batch.qrCodeBase64 && !imgError ? (
                <img
                  src={batch.qrCodeBase64}
                  alt="QR Code"
                  onError={() => setImgError(true)}
                  className={styles.qrImage}
                />
              ) : (
                <div className={styles.qrFallback}>
                  <svg
                    width="52"
                    height="52"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h3v3h-3z" />
                  </svg>
                  <span className={styles.qrFallbackLabel}>QR CODE</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ── OVERVIEW STRIP ── */}
        <div className={styles.overviewStrip}>
          {batch.harvestDate && (
            <div className={styles.overviewItem}>
              <span className={styles.overviewItemIcon}>📅</span>
              <div>
                <div className={styles.overviewItemLabel}>Harvest</div>
                <div className={styles.overviewItemValue}>
                  {batch.harvestDate}
                </div>
              </div>
            </div>
          )}
          {batch.farmCity && (
            <div className={styles.overviewItem}>
              <span className={styles.overviewItemIcon}>📍</span>
              <div>
                <div className={styles.overviewItemLabel}>Origin</div>
                <div className={styles.overviewItemValue}>
                  {batch.farmCity}
                  {batch.farmState ? `, ${batch.farmState}` : ""}
                </div>
              </div>
            </div>
          )}
          {batch.soilType && (
            <div className={styles.overviewItem}>
              <span className={styles.overviewItemIcon}>🪨</span>
              <div>
                <div className={styles.overviewItemLabel}>Soil</div>
                <div className={styles.overviewItemValue}>{batch.soilType}</div>
              </div>
            </div>
          )}
          {batch.irrigationType && (
            <div className={styles.overviewItem}>
              <span className={styles.overviewItemIcon}>💧</span>
              <div>
                <div className={styles.overviewItemLabel}>Irrigation</div>
                <div className={styles.overviewItemValue}>
                  {batch.irrigationType}
                </div>
              </div>
            </div>
          )}
          {batch.storageType && (
            <div className={styles.overviewItem}>
              <span className={styles.overviewItemIcon}>🏪</span>
              <div>
                <div className={styles.overviewItemLabel}>Storage</div>
                <div className={styles.overviewItemValue}>
                  {batch.storageType}
                </div>
              </div>
            </div>
          )}
          {batch.sowingDate && (
            <div className={styles.overviewItem}>
              <span className={styles.overviewItemIcon}>🌱</span>
              <div>
                <div className={styles.overviewItemLabel}>Sowing</div>
                <div className={styles.overviewItemValue}>
                  {batch.sowingDate}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SUPPLY CHAIN JOURNEY ── */}
        {supplyChain && supplyChain.events && supplyChain.events.length > 0 && (
          <section className={styles.card} style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <h2 className={styles.cardTitle}>
                <span className={styles.cardTitleIcon}>🔗</span> Supply Chain
                Journey
              </h2>
              {supplyChain.isValid && (
                <span
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    color: "#22c55e",
                    padding: "0.5rem 1rem",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                  }}
                >
                  ✓ VERIFIED
                </span>
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {supplyChain.events.map((event, index) => (
                <div
                  key={event.id}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    paddingBottom: "1rem",
                    borderBottom:
                      index !== supplyChain.events.length - 1
                        ? "1px solid black"
                        : "none",
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: "40px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: event.isVerified ? "#22c55e" : "#f59e0b",
                        border: "2px solid black",
                        marginTop: "4px",
                      }}
                    />
                    {index !== supplyChain.events.length - 1 && (
                      <div
                        style={{
                          width: "2px",
                          height: "60px",
                          background: "black",
                          marginTop: "4px",
                        }}
                      />
                    )}
                  </div>

                  {/* Event details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "700",
                          color: "black",
                          textTransform: "uppercase",
                          fontSize: "13px",
                        }}
                      >
                        {event.stage}
                      </span>
                      {event.isVerified && (
                        <span style={{ color: "#22c55e", fontSize: "12px" }}>
                          ✓
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "black",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {new Date(event.timestamp).toLocaleString()}
                    </div>

                    {event.actorRole && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "black",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <strong>Actor:</strong> {event.actorRole}{" "}
                        {event.actorName && `(${event.actorName})`}
                      </div>
                    )}

                    {event.location && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "black",
                          marginBottom: "0.25rem",
                        }}
                      >
                        📍 {event.location}
                      </div>
                    )}

                    {event.temperatureC !== undefined ||
                    event.humidityPercent !== undefined ? (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "black",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {event.temperatureC !== undefined &&
                          `🌡 ${event.temperatureC}°C`}
                        {event.temperatureC !== undefined &&
                          event.humidityPercent !== undefined &&
                          " • "}
                        {event.humidityPercent !== undefined &&
                          `💧 ${event.humidityPercent}%`}
                      </div>
                    ) : null}

                    {event.qualityScore !== undefined && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "black",
                        }}
                      >
                        📊 Quality: {event.qualityScore}%
                      </div>
                    )}

                    {event.eventHash && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.5rem",
                          background: "",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontFamily: "'DM Mono', monospace",
                          color: "black",
                          overflow: "auto",
                          wordBreak: "break-all",
                        }}
                        title={event.eventHash}
                      >
                        Hash: {event.eventHash.substring(0, 32)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary frgba(255,255,255,0.05)ooter */}
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid black",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "1rem",
                fontSize: "12px",
              }}
            >
              <div>
                <div style={{ color: "black" }}>Total Events</div>
                <div
                  style={{ fontWeight: "700", color: "#fff", fontSize: "18px" }}
                >
                  {supplyChain.eventCount}
                </div>
              </div>
              <div>
                <div style={{ color: "black" }}>Validation</div>
                <div
                  style={{
                    fontWeight: "700",
                    color: supplyChain.isValid ? "#22c55e" : "#ef4444",
                  }}
                >
                  {supplyChain.isValid ? "VALID" : "INVALID"}
                </div>
              </div>
              {supplyChain.merkleRoot && (
                <div>
                  <div style={{ color: "black" }}>Merkle Root</div>
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      color: "black",
                      fontSize: "10px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={supplyChain.merkleRoot}
                  >
                    {supplyChain.merkleRoot.substring(0, 16)}...
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── TWO-COLUMN CONTENT ── */}
        <div className={styles.contentGrid}>
          {/* LEFT COLUMN */}
          <div className={styles.leftCol}>
            {/* Certifications */}
            {certifications.length > 0 && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.cardTitleIcon}>✦</span> Certifications
                </h2>
                <div className={styles.certGrid}>
                  {certifications.map((cert, i) => (
                    <div key={i} className={styles.certChip}>
                      <span className={styles.certCheck}>✓</span> {cert}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quality Metrics */}
            {(batch.currentShelfLifeDays ||
              batch.moistureLevel ||
              batch.qualityScore) && (
              <section className={styles.metricsCard}>
                <h2 className={styles.cardTitleLight}>
                  <span className={styles.cardTitleIcon}>◎</span> Quality
                  Metrics
                </h2>
                <div className={styles.circlesRow}>
                  {batch.currentShelfLifeDays && (
                    <CircleProgress
                      pct={shelfLifePercent}
                      label="Shelf Life"
                      color="#F59E0B"
                    />
                  )}
                  {batch.moistureLevel && (
                    <CircleProgress
                      pct={Math.round(Math.min(batch.moistureLevel * 10, 100))}
                      label="Moisture"
                      color="#38BDF8"
                    />
                  )}
                  {batch.qualityScore && (
                    <CircleProgress
                      pct={batch.qualityScore}
                      label="Quality"
                      color="#4ADE80"
                    />
                  )}
                </div>
              </section>
            )}

            {/* Notes */}
            {batch.notes && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.cardTitleIcon}>✎</span> Notes
                </h2>
                <p className={styles.notesText}>{batch.notes}</p>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightCol}>
            {/* Blockchain */}
            <section className={styles.blockchainCard}>
              <div className={styles.blockchainTop}>
                <div className={styles.blockchainTitleRow}>
                  <div
                    className={`${styles.bcDot} ${
                      blockchainVerified ? styles.bcDotGreen : styles.bcDotAmber
                    }`}
                  />
                  <span className={styles.blockchainTitle}>
                    {blockchainVerified
                      ? "Verified on Chain ✓"
                      : "Blockchain Verification"}
                  </span>
                </div>
                {!blockchainVerified && (
                  <button
                    className={styles.verifyBtn}
                    onClick={() => setBlockchainVerified(true)}
                  >
                    Verify Now →
                  </button>
                )}
              </div>
              <div className={styles.blockchainMeta}>
                <div className={styles.bcRow}>
                  <span className={styles.bcLabel}>BATCH ID</span>
                  <span className={styles.bcHash}>{batch.id}</span>
                </div>
                <div className={styles.bcRow}>
                  <span className={styles.bcLabel}>STATUS</span>
                  <span className={styles.bcValue}>{batch.status}</span>
                </div>
                {blockchainVerified && (
                  <div className={styles.bcRow}>
                    <span className={styles.bcLabel}>CONSENSUS</span>
                    <span className={styles.bcValueGreen}>
                      6/6 nodes confirmed
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardTitleIcon}>★</span> Consumer Reviews
              </h2>

              <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                <textarea
                  className={styles.reviewTextarea}
                  placeholder="Share your experience with this batch…"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                />
                <div className={styles.reviewFormFooter}>
                  <StarRow value={reviewRating} onChange={setReviewRating} />
                  <button
                    type="submit"
                    disabled={!reviewComment.trim() || reviewRating === 0}
                    className={styles.reviewSubmitBtn}
                  >
                    Post Review
                  </button>
                </div>
                {reviewSubmitted && (
                  <div className={styles.reviewSuccess}>
                    ✓ Review posted successfully
                  </div>
                )}
              </form>

              <div className={styles.reviewsList}>
                {reviews.length === 0 ? (
                  <p className={styles.noReviews}>
                    No reviews yet — be the first.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className={styles.reviewItem}>
                      <div className={styles.reviewItemTop}>
                        <div className={styles.reviewAvatar}>
                          {review.user[0]}
                        </div>
                        <div className={styles.reviewMeta}>
                          <span className={styles.reviewUser}>
                            {review.user}
                          </span>
                          <span className={styles.reviewDate}>
                            {review.date}
                          </span>
                        </div>
                        <StaticStars rating={review.rating} />
                      </div>
                      <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>🌿 FarmChainX</span>
            <p className={styles.footerTagline}>
              Verified Agricultural Supply Chain
            </p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>
              About
            </a>
            <a href="#" className={styles.footerLink}>
              Privacy
            </a>
            <a href="#" className={styles.footerLink}>
              Terms
            </a>
            <a href="#" className={styles.footerLink}>
              support@farmchainx.com
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 FarmChainX. All rights reserved.</span>
          <span>AI + Blockchain · Batch {batch.id}</span>
        </div>
      </footer>
    </div>
  );
}
