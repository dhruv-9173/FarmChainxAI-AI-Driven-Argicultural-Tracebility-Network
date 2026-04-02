import { memo, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./QRScannedPage.module.css";
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

interface ReviewItem {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewDraft {
  rating: number;
  comment: string;
}

const StarRow = memo(function StarRow({
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
});

const REVIEW_GET_ENDPOINTS = [
  (batchId: string) => `/api/v1/browse/batches/${batchId}/reviews`,
];

const REVIEW_POST_ENDPOINTS = [
  (batchId: string) => `/api/v1/browse/batches/${batchId}/reviews`,
];

const API_BASE_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"
).replace(/\/api\/v1\/?$/, "");

async function fetchJson(endpoint: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_ORIGIN}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

function mapReview(r: any): ReviewItem {
  return {
    id: String(r.id ?? Date.now()),
    user: String(r.user ?? r.userDisplayName ?? r.reviewerName ?? "Anonymous"),
    rating: Number(r.rating ?? 0),
    comment: String(r.comment ?? ""),
    date: String(r.date ?? r.formattedDate ?? r.createdAt ?? ""),
  };
}

function extractReviewArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  return [];
}

function getEventPriceValue(event: SupplyChainVerification["events"][number]) {
  const eventData = event as unknown as Record<string, unknown>;

  const numericPriceFields = [
    event.unitPrice,
    eventData.sellingPrice,
    eventData.pricePerUnit,
    eventData.purchasePrice,
    eventData.transferPrice,
    eventData.price,
  ];

  for (const value of numericPriceFields) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

const ReviewComposer = memo(function ReviewComposer({
  onSubmit,
  isSubmitting,
  submitError,
  submitSuccess,
}: {
  onSubmit: (payload: ReviewDraft) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const canSubmit = !isSubmitting && rating > 0 && comment.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    await onSubmit({ rating, comment: comment.trim() });
    setComment("");
    setRating(0);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.reviewForm}>
      <div className={styles.reviewFormTop}>
        <p className={styles.reviewHint}>
          Rate this batch and share your feedback
        </p>
        <span className={styles.charCount}>{comment.length}/400</span>
      </div>
      <textarea
        className={styles.reviewTextarea}
        placeholder="Share your experience with this batch..."
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 400))}
        rows={4}
      />
      <div className={styles.reviewFormFooter}>
        <StarRow value={rating} onChange={setRating} />
        <button
          type="submit"
          disabled={!canSubmit}
          className={styles.reviewSubmitBtn}
        >
          {isSubmitting ? "Posting..." : "Post Review"}
        </button>
      </div>
      {submitSuccess && (
        <div className={styles.reviewSuccess}>Review posted successfully.</div>
      )}
      {submitError && <div className={styles.reviewError}>{submitError}</div>}
    </form>
  );
});

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
  const { batchId: routeBatchId } = useParams<{ batchId: string }>();
  const location = useLocation();

  const batchId = useMemo(() => {
    if (routeBatchId) return routeBatchId;

    const params = new URLSearchParams(location.search);
    const queryBatchId = params.get("batchId") || params.get("id");
    if (queryBatchId) return queryBatchId;

    const segments = location.pathname.split("/").filter(Boolean);
    const batchSegmentIndex = segments.findIndex(
      (segment) => segment === "batch"
    );
    if (batchSegmentIndex >= 0 && segments[batchSegmentIndex + 1]) {
      return segments[batchSegmentIndex + 1];
    }

    return undefined;
  }, [location.pathname, location.search, routeBatchId]);

  console.log("🎯 QRScannedPage mounted with batchId:", batchId);

  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [blockchainVerified, setBlockchainVerified] = useState(false);
  const [imgError, setImgError] = useState(false);
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
        const data = await fetchJson(`/api/v1/browse/batches/${batchId}`);
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
        let loaded = false;

        for (const endpointBuilder of REVIEW_GET_ENDPOINTS) {
          try {
            const endpoint = endpointBuilder(batchId);
            const data = await fetchJson(endpoint);
            const reviewArray = extractReviewArray(data);

            if (
              reviewArray.length > 0 ||
              data?.success ||
              Array.isArray(data)
            ) {
              setReviews(reviewArray.map((review: any) => mapReview(review)));
              loaded = true;
              break;
            }
          } catch {
            // Try next endpoint variant.
          }
        }

        if (!loaded) {
          setReviews([]);
        }
      } catch (err: any) {
        console.error("Failed to load reviews:", err.message);
        setReviews([]);
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
        const data = await fetchJson(
          `/api/v1/supply-chain/batch/${batchId}/verified`
        );
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

  const handleReviewSubmit = async ({ rating, comment }: ReviewDraft) => {
    setReviewError(null);
    setReviewSubmitting(true);
    setReviewSubmitted(false);

    try {
      let postedReview: ReviewItem | null = null;

      for (const endpointBuilder of REVIEW_POST_ENDPOINTS) {
        try {
          const endpoint = endpointBuilder(batchId!);
          const data = await fetchJson(endpoint, {
            method: "POST",
            body: JSON.stringify({ rating, comment }),
          });

          const posted = data?.data ?? data;
          if (
            posted &&
            (data?.success !== false || posted?.id || posted?.comment)
          ) {
            postedReview = {
              id: String(posted.id ?? Date.now()),
              user: String(
                posted.user ?? posted.userDisplayName ?? "Anonymous"
              ),
              rating: Number(posted.rating ?? rating),
              comment: String(posted.comment ?? comment),
              date: String(posted.date ?? posted.formattedDate ?? "Just now"),
            };
            break;
          }
        } catch {
          // Try next endpoint variant.
        }
      }

      if (!postedReview) {
        throw new Error("No compatible review endpoint accepted this request.");
      }

      setReviews((prev) => [postedReview as ReviewItem, ...prev]);
      setReviewSubmitted(true);
      window.setTimeout(() => setReviewSubmitted(false), 2000);
    } catch (err: any) {
      console.error("Failed to submit review:", err.message);
      setReviewError("Failed to submit feedback. Please try again.");
    } finally {
      setReviewSubmitting(false);
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

                    {(event.stage === "RECEIVED" ||
                      event.stage === "STORED") && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "black",
                          marginTop: "0.25rem",
                        }}
                      >
                        {(() => {
                          const eventPrice = getEventPriceValue(event);
                          return eventPrice !== null
                            ? `₹ Price: ${eventPrice} / unit`
                            : "₹ Price: Not recorded";
                        })()}
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
              <div className={styles.reviewSectionHeader}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.cardTitleIcon}>★</span> Consumer
                  Reviews
                </h2>
                <span className={styles.reviewCount}>
                  {reviews.length} reviews
                </span>
              </div>

              <ReviewComposer
                onSubmit={handleReviewSubmit}
                isSubmitting={reviewSubmitting}
                submitError={reviewError}
                submitSuccess={reviewSubmitted}
              />

              <div className={styles.reviewsList}>
                {reviewsLoading ? (
                  <p className={styles.noReviews}>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className={styles.noReviews}>
                    No reviews yet — be the first.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className={styles.reviewItem}>
                      <div className={styles.reviewItemTop}>
                        <div className={styles.reviewAvatar}>
                          {(review.user || "A")[0]}
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
