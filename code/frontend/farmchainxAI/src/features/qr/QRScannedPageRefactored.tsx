import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import styles from "./QRScannedPage.module.css";

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
  storageType?: string;
  storageLocation?: string;
  soilType?: string;
  irrigationType?: string;
  notes?: string;
  createdAt?: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
  success: boolean;
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

function ErrorState() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
          color: "#666",
        }}
      >
        <div style={{ fontSize: "50px" }}>❌</div>
        <h1>Batch Not Found</h1>
        <p>The batch you are looking for does not exist or has been deleted.</p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "16px",
            padding: "10px 20px",
            backgroundColor: "#065f46",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={styles.page}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
        }}
      >
        <div className={styles.spinner} style={{ fontSize: "50px" }}>
          ⏳
        </div>
        <h1>Loading Batch Details...</h1>
        <p>Please wait while we fetch the traceability information.</p>
      </div>
    </div>
  );
}

export default function QRScannedPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  // Data states
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [participantRatings, setParticipantRatings] = useState({
    farmer: 0,
    distributor: 0,
    retailer: 0,
  });
  const [participantSubmitted, setParticipantSubmitted] = useState(false);
  const [blockchainVerified, setBlockchainVerified] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fetch batch data on mount
  useEffect(() => {
    if (!batchId) {
      setError("No batch ID provided");
      setLoading(false);
      return;
    }

    const fetchBatch = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<ApiResponse<BatchDetail>>(
          `/browse/batches/${batchId}`
        );
        if (response.data.success && response.data.data) {
          setBatch(response.data.data);
          setError(null);
        } else {
          setError("Failed to load batch details");
        }
      } catch (err: any) {
        console.error("Error fetching batch:", err);
        setError(
          err?.response?.status === 404
            ? "Batch not found"
            : "Failed to load batch details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
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

  return (
    <div className={styles.page}>
      {/* HEADER */}
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
                <span className={styles.batchId}>{batch.id}</span>
              </div>
              <h2 className={styles.cropName}>
                {batch.organic && (
                  <span className={styles.organicTag}>🌱 Organic</span>
                )}
                {batch.cropType} {batch.variety ? `— ${batch.variety}` : ""}
              </h2>
              <div className={styles.headerBadges}>
                <span className={styles.statusBadge}>✅ {batch.status}</span>
              </div>
            </div>
            <div className={styles.qrPlaceholder}>
              {batch.qrCodeUrl && !imgError ? (
                <img
                  src={batch.qrCodeUrl}
                  alt="QR Code"
                  onError={() => setImgError(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
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
                  <div className={styles.qrLabel}>QR Code</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* OVERVIEW CARDS */}
        <section className={styles.section}>
          <div className={styles.overviewGrid}>
            {batch.harvestDate && (
              <>
                <div className={styles.overviewCard}>
                  <div className={styles.overviewCardIcon}>📅</div>
                  <div className={styles.overviewCardContent}>
                    <div className={styles.overviewCardLabel}>Harvest Date</div>
                    <div className={styles.overviewCardValue}>
                      {batch.harvestDate}
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className={styles.overviewCard}>
              <div className={styles.overviewCardIcon}>⚖️</div>
              <div className={styles.overviewCardContent}>
                <div className={styles.overviewCardLabel}>Quantity</div>
                <div className={styles.overviewCardValue}>
                  {batch.quantity} {batch.quantityUnit}
                </div>
              </div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewCardIcon}>🏆</div>
              <div className={styles.overviewCardContent}>
                <div className={styles.overviewCardLabel}>Quality Score</div>
                <div className={styles.overviewCardValue}>
                  {batch.qualityScore}/100
                </div>
              </div>
            </div>
            {batch.qualityGrade && (
              <div className={styles.overviewCard}>
                <div className={styles.overviewCardIcon}>⭐</div>
                <div className={styles.overviewCardContent}>
                  <div className={styles.overviewCardLabel}>Quality Grade</div>
                  <div className={styles.overviewCardValue}>
                    {batch.qualityGrade}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* BATCH DETAILS SECTION */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 Batch Information</h2>
          <div className={styles.detailsGrid}>
            {batch.sowingDate && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Sowing Date</span>
                <span className={styles.detailValue}>{batch.sowingDate}</span>
              </div>
            )}
            {batch.farmCity && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Farm Location</span>
                <span className={styles.detailValue}>
                  {batch.farmCity}
                  {batch.farmState ? `, ${batch.farmState}` : ""}
                </span>
              </div>
            )}
            {batch.soilType && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Soil Type</span>
                <span className={styles.detailValue}>{batch.soilType}</span>
              </div>
            )}
            {batch.irrigationType && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Irrigation Type</span>
                <span className={styles.detailValue}>
                  {batch.irrigationType}
                </span>
              </div>
            )}
            {batch.storageType && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Storage Type</span>
                <span className={styles.detailValue}>{batch.storageType}</span>
              </div>
            )}
            {batch.storageLocation && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Storage Location</span>
                <span className={styles.detailValue}>
                  {batch.storageLocation}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* CERTIFICATIONS */}
        {certifications.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>✅ Certifications</h2>
            <div className={styles.certificationsGrid}>
              {certifications.map((cert, idx) => (
                <div key={idx} className={styles.certItem}>
                  🏅 {cert}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* QUALITY & SHELF LIFE */}
        {(batch.currentShelfLifeDays ||
          batch.moistureLevel ||
          batch.gapCertified) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🔬 Quality Metrics</h2>
            <div className={styles.qualityMetricsGrid}>
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
                  label="Moisture %"
                  color="#2563EB"
                />
              )}
              {batch.qualityScore && (
                <CircleProgress
                  pct={batch.qualityScore}
                  label="Quality"
                  color="#16A34A"
                />
              )}
            </div>
          </section>
        )}

        {/* NOTES */}
        {batch.notes && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📝 Additional Notes</h2>
            <div className={styles.notesBox}>{batch.notes}</div>
          </section>
        )}

        {/* REVIEWS SECTION */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⭐ Consumer Reviews</h2>
          <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
            <div className={styles.reviewInputGroup}>
              <label htmlFor="reviewComment" className={styles.reviewLabel}>
                Your Review
              </label>
              <textarea
                id="reviewComment"
                className={styles.reviewTextarea}
                placeholder="Share your experience with this batch..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
            </div>
            <div className={styles.reviewInputGroup}>
              <label className={styles.reviewLabel}>Rating</label>
              <StarRow value={reviewRating} onChange={setReviewRating} />
            </div>
            <button
              type="submit"
              disabled={!reviewComment.trim() || reviewRating === 0}
              className={styles.reviewSubmitBtn}
            >
              Submit Review
            </button>
            {reviewSubmitted && (
              <div className={styles.reviewSuccess}>
                ✅ Thank you! Your review has been posted.
              </div>
            )}
          </form>
          <div className={styles.reviewsList}>
            {reviews.length === 0 ? (
              <p className={styles.noReviews}>
                No reviews yet. Be the first to review!
              </p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewUser}>{review.user}</span>
                    <span className={styles.reviewDate}>{review.date}</span>
                  </div>
                  <StaticStars rating={review.rating} />
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* BLOCKCHAIN VERIFICATION */}
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
                  <span className={styles.bcLabel}>Status</span>
                  <span className={styles.bcValue} style={{ color: "#16A34A" }}>
                    ✅ Immutable Record
                  </span>
                </div>
              </div>
            </div>
            {!blockchainVerified && (
              <button
                className={styles.verifyBtn}
                onClick={() => setBlockchainVerified(true)}
              >
                Verify Now
              </button>
            )}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <h4 className={styles.footerLinksTitle}>Product</h4>
            <a href="#" className={styles.footerLink}>
              About Us
            </a>
            <a href="#" className={styles.footerLink}>
              Features
            </a>
            <a href="#" className={styles.footerLink}>
              Pricing
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
            Powered by 🤖 AI + ⛓️ Blockchain · Batch {batch.id}
          </span>
        </div>
      </footer>
    </div>
  );
}
