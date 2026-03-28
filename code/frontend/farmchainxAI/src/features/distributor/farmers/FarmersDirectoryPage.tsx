import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Deprecated: This component has been replaced by DistributorBrowsePage
 * It automatically redirects to the new browse page
 */
export default function FarmersDirectoryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/distributor/browse", { replace: true });
  }, [navigate]);

  return null;
}
          <p className={styles.cardLoc}>
            📍 {farmer.location}, {farmer.state}
          </p>
        </div>
        {farmer.organic && (
          <span className={styles.organicBadge}>🌿 Organic</span>
        )}
      </div>

      <div className={styles.cardMeta}>
        <span className={styles.metaChip}>🌾 {farmer.specialization}</span>
        <span className={styles.ratingChip}>
          ★ {farmer.rating.toFixed(1)}
          <span className={styles.ratingFull}>
            &nbsp;{starStr(farmer.rating)}
          </span>
        </span>
      </div>

      <div className={styles.cardStats}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{farmer.totalBatchesSent}</span>
          <span className={styles.statLbl}>Batches Sent</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum} style={{ color: "#16A34A" }}>
            {farmer.activeBatches}
          </span>
          <span className={styles.statLbl}>Available Now</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>{farmer.joinedDate}</span>
          <span className={styles.statLbl}>Member Since</span>
        </div>
      </div>

      <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
        <button className={styles.viewBtn} onClick={onView}>
          View Profile & Batches
        </button>
        <button
          className={styles.emailBtn}
          onClick={() => openEmailClient(farmer)}
        >
          ✉️ Email
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════ */
export default function FarmersDirectoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [farmerDirectory, setFarmerDirectory] = useState<FarmerListing[]>([]);
  const [search, setSearch] = useState("");
  const [filterOrganic, setFilterOrganic] = useState<
    "all" | "organic" | "conventional"
  >("all");
  const [sortBy, setSortBy] = useState<"rating" | "batches" | "name">("rating");

  const [viewFarmer, setViewFarmer] = useState<FarmerListing | null>(null);

  useEffect(() => {
    getFarmerDirectory().then(setFarmerDirectory).catch(console.error);
  }, []);

  const farmers = farmerDirectory
    .filter((f) => {
      const matchSearch =
        search === "" ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.farmName.toLowerCase().includes(search.toLowerCase()) ||
        f.location.toLowerCase().includes(search.toLowerCase()) ||
        f.specialization.toLowerCase().includes(search.toLowerCase());
      const matchOrganic =
        filterOrganic === "all" ||
        (filterOrganic === "organic" && f.organic) ||
        (filterOrganic === "conventional" && !f.organic);
      return matchSearch && matchOrganic;
    })
    .sort((a, b) =>
      sortBy === "rating"
        ? b.rating - a.rating
        : sortBy === "batches"
        ? b.totalBatchesSent - a.totalBatchesSent
        : a.name.localeCompare(b.name)
    );

  return (
    <div className={styles.page}>
      <TopNavBar
        userName={user?.fullName ?? ""}
        userRole={user?.role ?? "DISTRIBUTOR"}
        onNavigateToProfile={() => navigate("/distributor/profile")}
      />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button
            className={styles.breadLink}
            onClick={() => navigate("/distributor/dashboard")}
          >
            Dashboard
          </button>
          <span className={styles.breadSep}>›</span>
          <span>Farmer Directory</span>
        </div>

        {/* Page head */}
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Farmer Directory</h1>
            <p className={styles.pageSubtitle}>
              Browse registered farmers, view their profiles, available batches,
              and get in touch
            </p>
          </div>
          <div className={styles.headStats}>
            <div className={styles.headStat}>
              <span className={styles.headStatNum}>
                {farmerDirectory.length}
              </span>
              <span className={styles.headStatLbl}>Registered Farmers</span>
            </div>
            <div className={styles.headStat}>
              <span className={styles.headStatNum} style={{ color: "#16A34A" }}>
                {farmerDirectory.reduce((s, f) => s + f.activeBatches, 0)}
              </span>
              <span className={styles.headStatLbl}>Available Batches</span>
            </div>
            <div className={styles.headStat}>
              <span className={styles.headStatNum} style={{ color: "#7C3AED" }}>
                {farmerDirectory.filter((f) => f.organic).length}
              </span>
              <span className={styles.headStatLbl}>Organic Farmers</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
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
              placeholder="Search by name, farm, location or crop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <select
              className={styles.filterSelect}
              value={filterOrganic}
              onChange={(e) =>
                setFilterOrganic(e.target.value as typeof filterOrganic)
              }
            >
              <option value="all">All Farmers</option>
              <option value="organic">Organic Only</option>
              <option value="conventional">Conventional</option>
            </select>
            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="rating">Sort: Rating</option>
              <option value="batches">Sort: Batches Sent</option>
              <option value="name">Sort: Name A–Z</option>
            </select>
          </div>
          <span className={styles.resultCount}>
            {farmers.length} farmers found
          </span>
        </div>

        {/* Cards grid */}
        {farmers.length === 0 ? (
          <div className={styles.empty}>
            <span>🌾</span>
            <p>No farmers match your search.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {farmers.map((f) => (
              <FarmerCard
                key={f.id}
                farmer={f}
                onView={() => setViewFarmer(f)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Farmer profile modal */}
      {viewFarmer && (
        <FarmerProfileModal
          farmer={viewFarmer}
          onClose={() => setViewFarmer(null)}
        />
      )}
    </div>
  );
}
