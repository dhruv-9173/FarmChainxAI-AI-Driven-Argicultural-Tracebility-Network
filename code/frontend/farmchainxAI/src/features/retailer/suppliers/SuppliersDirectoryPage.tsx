import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import TopNavBar from "../../farmer/components/TopNavBar";
import { useAuth } from "../../../hooks/useAuth";
import { getSupplierDirectory } from "../api/retailerApi";
import type {
  SupplierListing,
  SupplierBatchListing,
} from "../types/retailer.types";
import styles from "./SuppliersDirectoryPage.module.css";

/* â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
function qualColor(s: number) {
  return s >= 85 ? "#16A34A" : s >= 70 ? "#F59E0B" : "#EF4444";
}
function starStr(r: number) {
  return (
    "â˜…".repeat(Math.floor(r)) +
    (r % 1 >= 0.5 ? "Â½" : "") +
    "â˜†".repeat(5 - Math.ceil(r))
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Email Composer Modal
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
interface EmailProps {
  supplier: SupplierListing;
  batchId?: string;
  onClose: () => void;
}
function EmailComposerModal({ supplier, batchId, onClose }: EmailProps) {
  const isDistributor = supplier.type === "Distributor";
  const defaultSubject = batchId
    ? `Purchase Inquiry â€” Batch ${batchId}`
    : isDistributor
    ? `Procurement Inquiry from FreshBasket Supermart`
    : `Produce Purchase Inquiry from FreshBasket Supermart`;
  const defaultBody = batchId
    ? `Dear ${supplier.name},\n\nI am interested in purchasing batch ${batchId} from ${supplier.businessName}.\n\nPlease share the latest availability and pricing details.\n\nBest regards,\nKavita Nair\nFreshBasket Supermart`
    : `Dear ${supplier.name},\n\nWe are interested in sourcing produce from ${supplier.businessName}.\n\nCould you please share your available inventory and pricing?\n\nBest regards,\nKavita Nair\nFreshBasket Supermart`;

  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return createPortal(
      <div className={styles.emailOverlay} onClick={onClose}>
        <div className={styles.emailModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.sentBox}>
            <div
              className={styles.sentIcon}
              style={{ animation: "popIn 0.3s ease" }}
            >
              âœ“
            </div>
            <h3 className={styles.sentTitle}>Email Sent!</h3>
            <p className={styles.sentDesc}>
              Your message has been sent to {supplier.name}.
            </p>
            <button className={styles.sentClose} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className={styles.emailOverlay} onClick={onClose}>
      <div className={styles.emailModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.emailHeader}>
          <h3 className={styles.emailTitle}>âœ‰ï¸ Compose Email</h3>
          <button className={styles.emailClose} onClick={onClose}>
            âœ•
          </button>
        </div>
        <div className={styles.emailBody}>
          <div className={styles.emailField}>
            <label className={styles.emailLabel}>To</label>
            <input
              className={styles.emailInput}
              value={supplier.email}
              readOnly
            />
          </div>
          <div className={styles.emailField}>
            <label className={styles.emailLabel}>Subject</label>
            <input
              className={styles.emailInput}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className={styles.emailField}>
            <label className={styles.emailLabel}>Message</label>
            <textarea
              className={styles.emailTextarea}
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.emailFooter}>
          <button className={styles.emailCancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.emailSend}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? <span className={styles.spinner} /> : "Send Email"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Supplier Profile Modal
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
interface ProfileProps {
  supplier: SupplierListing;
  onClose: () => void;
  onEmail: (batchId?: string) => void;
}
function SupplierProfileModal({ supplier, onClose, onEmail }: ProfileProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const headerColor =
    supplier.type === "Distributor"
      ? "linear-gradient(135deg, #1d4ed8, #2563eb, #7c3aed)"
      : "linear-gradient(135deg, #15803d, #16a34a, #0891b2)";

  return createPortal(
    <div className={styles.profileOverlay} onClick={onClose}>
      <div className={styles.profileModal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          className={styles.profileHeader}
          style={{ background: headerColor }}
        >
          <div className={styles.profileAvatarWrap}>
            <div className={styles.profileAvatar}>
              {initials(supplier.name)}
            </div>
            <div className={styles.profileMeta}>
              <h2 className={styles.profileName}>{supplier.name}</h2>
              <div className={styles.profileBiz}>{supplier.businessName}</div>
              <div className={styles.profileLoc}>
                ðŸ“ {supplier.location}, {supplier.state}
              </div>
              <div className={styles.profileTags}>
                <span className={styles.typeTag}>{supplier.type}</span>
                {supplier.organic && (
                  <span className={styles.organicTag}>ðŸŒ¿ Organic</span>
                )}
              </div>
            </div>
          </div>
          <button className={styles.profileClose} onClick={onClose}>
            âœ•
          </button>
        </div>

        <div className={styles.profileBody}>
          {/* Details */}
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>ID</span>
              <span
                className={styles.detailValue}
                style={{ fontFamily: "monospace" }}
              >
                {supplier.id}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Specialization</span>
              <span className={styles.detailValue}>
                {supplier.specialization}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Phone</span>
              <span className={styles.detailValue}>{supplier.phone}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{supplier.email}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Rating</span>
              <span className={styles.detailValue} style={{ color: "#F59E0B" }}>
                {starStr(supplier.rating)} ({supplier.rating})
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Member Since</span>
              <span className={styles.detailValue}>{supplier.joinedDate}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Total Batches Sent</span>
              <span className={styles.detailValue}>
                {supplier.totalBatchesSent}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Active Batches</span>
              <span className={styles.detailValue}>
                {supplier.activeBatches}
              </span>
            </div>
          </div>

          {/* Available Batches */}
          {supplier.availableBatches.length > 0 && (
            <div className={styles.batchesSection}>
              <h4 className={styles.batchesSectionTitle}>Available Batches</h4>
              <div className={styles.batchTableWrap}>
                <table className={styles.batchTable}>
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Crop</th>
                      <th>Qty</th>
                      <th>Quality</th>
                      <th>â‚¹/kg</th>
                      <th>Until</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.availableBatches.map(
                      (b: SupplierBatchListing) => (
                        <tr key={b.id}>
                          <td style={{ fontFamily: "monospace", fontSize: 11 }}>
                            {b.id}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>
                              {b.cropType}
                            </div>
                            {b.variety && (
                              <div style={{ fontSize: 11, color: "#6b7280" }}>
                                {b.variety}
                              </div>
                            )}
                            {b.organic && (
                              <span style={{ fontSize: 10 }}>ðŸŒ¿</span>
                            )}
                          </td>
                          <td style={{ fontSize: 12 }}>{b.quantity}</td>
                          <td>
                            <span
                              style={{
                                color: qualColor(b.qualityScore),
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              {b.qualityScore}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                color: "#6b7280",
                                marginLeft: 4,
                              }}
                            >
                              {b.qualityGrade}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, fontWeight: 600 }}>
                            â‚¹{b.pricePerKg}
                          </td>
                          <td style={{ fontSize: 11, color: "#6b7280" }}>
                            {b.availableUntil}
                          </td>
                          <td>
                            <button
                              className={styles.inquireBtn}
                              onClick={() => {
                                onClose();
                                onEmail(b.id);
                              }}
                            >
                              Inquire
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className={styles.profileFooter}>
          <button
            className={styles.profileEmailBtn}
            onClick={() => {
              onClose();
              onEmail();
            }}
          >
            âœ‰ï¸ Send General Inquiry
          </button>
          <button className={styles.profileCloseBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Supplier Card
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function SupplierCard({
  supplier,
  onView,
  onEmail,
}: {
  supplier: SupplierListing;
  onView: () => void;
  onEmail: () => void;
}) {
  const isDistributor = supplier.type === "Distributor";
  const avatarGrad = isDistributor
    ? "linear-gradient(135deg, #2563eb, #7c3aed)"
    : "linear-gradient(135deg, #16a34a, #0891b2)";

  return (
    <div className={styles.card} onClick={onView}>
      <div className={styles.cardTop}>
        <div className={styles.cardAvatar} style={{ background: avatarGrad }}>
          {initials(supplier.name)}
        </div>
        <div className={styles.cardMeta}>
          <div className={styles.cardName}>{supplier.name}</div>
          <div className={styles.cardBiz}>{supplier.businessName}</div>
          <div className={styles.cardLoc}>
            ðŸ“ {supplier.location}, {supplier.state}
          </div>
          <div className={styles.cardTags}>
            <span
              className={styles.typeChip}
              style={{
                background: isDistributor ? "#EFF6FF" : "#F0FDF4",
                color: isDistributor ? "#2563EB" : "#16A34A",
              }}
            >
              {isDistributor ? "ðŸ­ Distributor" : "ðŸŒ¾ Farmer"}
            </span>
            {supplier.organic && (
              <span className={styles.organicChip}>ðŸŒ¿ Organic</span>
            )}
            <span className={styles.ratingChip}>â­ {supplier.rating}</span>
          </div>
          <div className={styles.cardSpec}>{supplier.specialization}</div>
        </div>
      </div>

      <div className={styles.cardStats}>
        <div className={styles.statBox}>
          <span className={styles.statVal}>{supplier.totalBatchesSent}</span>
          <span className={styles.statLbl}>Batches Sent</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statVal}>{supplier.activeBatches}</span>
          <span className={styles.statLbl}>Available Now</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statVal}>{supplier.joinedDate}</span>
          <span className={styles.statLbl}>Member Since</span>
        </div>
      </div>

      <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
        <button className={styles.viewBtn} onClick={onView}>
          View Profile & Batches
        </button>
        <button className={styles.emailBtn} onClick={onEmail}>
          âœ‰ï¸ Email
        </button>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Main Page
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function SuppliersDirectoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [supplierDirectory, setSupplierDirectory] = useState<SupplierListing[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "All" | "Farmer" | "Distributor"
  >("All");
  const [organicFilter, setOrganicFilter] = useState<"All" | "Organic">("All");
  const [sortKey, setSortKey] = useState<"rating" | "batches" | "name">(
    "rating"
  );

  const [profileSupplier, setProfileSupplier] =
    useState<SupplierListing | null>(null);
  const [emailSupplier, setEmailSupplier] = useState<SupplierListing | null>(
    null
  );
  const [emailBatchId, setEmailBatchId] = useState<string | undefined>();

  useEffect(() => {
    getSupplierDirectory().then(setSupplierDirectory).catch(console.error);
  }, []);

  const openEmail = useCallback(
    (supplier: SupplierListing, batchId?: string) => {
      setEmailSupplier(supplier);
      setEmailBatchId(batchId);
    },
    []
  );

  const filtered = supplierDirectory
    .filter((s) => {
      const matchType = typeFilter === "All" || s.type === typeFilter;
      const matchOrganic =
        organicFilter === "All" || (organicFilter === "Organic" && s.organic);
      const q = search.toLowerCase();
      const matchSearch =
        search === "" ||
        s.name.toLowerCase().includes(q) ||
        s.businessName.toLowerCase().includes(q) ||
        s.specialization.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q);
      return matchType && matchOrganic && matchSearch;
    })
    .sort((a, b) => {
      if (sortKey === "rating") return b.rating - a.rating;
      if (sortKey === "batches") return b.activeBatches - a.activeBatches;
      return a.name.localeCompare(b.name);
    });

  const totalAvailableBatches = supplierDirectory.reduce(
    (sum, s) => sum + s.availableBatches.length,
    0
  );
  const organicCount = supplierDirectory.filter((s) => s.organic).length;
  const farmerCount = supplierDirectory.filter(
    (s) => s.type === "Farmer"
  ).length;
  const distributorCount = supplierDirectory.filter(
    (s) => s.type === "Distributor"
  ).length;

  return (
    <div className={styles.page}>
      <TopNavBar
        userName={user?.fullName ?? ""}
        userRole={user?.role ?? "RETAILER"}
        onNavigateToProfile={() => navigate("/retailer/profile")}
      />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button
            className={styles.breadLink}
            onClick={() => navigate("/retailer/dashboard")}
          >
            Dashboard
          </button>
          <span className={styles.breadSep}>â€º</span>
          <span>Suppliers Directory</span>
        </div>

        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Suppliers Directory</h1>
            <p className={styles.pageSub}>
              Browse farmers and distributors â€” view profiles, available
              batches, and send inquiries
            </p>
          </div>
          <div className={styles.headStats}>
            <div className={styles.headStat}>
              <span className={styles.headStatVal}>
                {supplierDirectory.length}
              </span>
              <span className={styles.headStatLbl}>Total Suppliers</span>
            </div>
            <div
              className={styles.headStat}
              style={{ borderColor: "#16A34A33" }}
            >
              <span className={styles.headStatVal} style={{ color: "#16A34A" }}>
                {farmerCount}
              </span>
              <span className={styles.headStatLbl}>Farmers</span>
            </div>
            <div
              className={styles.headStat}
              style={{ borderColor: "#2563EB33" }}
            >
              <span className={styles.headStatVal} style={{ color: "#2563EB" }}>
                {distributorCount}
              </span>
              <span className={styles.headStatLbl}>Distributors</span>
            </div>
            <div
              className={styles.headStat}
              style={{ borderColor: "#16A34A33" }}
            >
              <span className={styles.headStatVal} style={{ color: "#16A34A" }}>
                {totalAvailableBatches}
              </span>
              <span className={styles.headStatLbl}>Available Batches</span>
            </div>
            <div className={styles.headStat}>
              <span className={styles.headStatVal} style={{ color: "#16A34A" }}>
                {organicCount}
              </span>
              <span className={styles.headStatLbl}>Organic Suppliers</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
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
              placeholder="Search by name, crop, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            {(["All", "Farmer", "Distributor"] as const).map((t) => (
              <button
                key={t}
                className={`${styles.typeBtn} ${
                  typeFilter === t ? styles.typeBtnActive : ""
                }`}
                onClick={() => setTypeFilter(t)}
              >
                {t === "Farmer"
                  ? "ðŸŒ¾ Farmers"
                  : t === "Distributor"
                  ? "ðŸ­ Distributors"
                  : "All"}
              </button>
            ))}
          </div>

          <select
            className={styles.filterSelect}
            value={organicFilter}
            onChange={(e) =>
              setOrganicFilter(e.target.value as typeof organicFilter)
            }
          >
            <option value="All">All Suppliers</option>
            <option value="Organic">Organic Only</option>
          </select>

          <select
            className={styles.filterSelect}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
          >
            <option value="rating">Sort: Rating</option>
            <option value="batches">Sort: Active Batches</option>
            <option value="name">Sort: Name Aâ€“Z</option>
          </select>

          <span className={styles.resultCount}>
            {filtered.length} suppliers
          </span>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              No suppliers match your search.
            </div>
          ) : (
            filtered.map((s) => (
              <SupplierCard
                key={s.id}
                supplier={s}
                onView={() => setProfileSupplier(s)}
                onEmail={() => openEmail(s)}
              />
            ))
          )}
        </div>
      </div>

      {profileSupplier && (
        <SupplierProfileModal
          supplier={profileSupplier}
          onClose={() => setProfileSupplier(null)}
          onEmail={(batchId) => {
            setProfileSupplier(null);
            openEmail(profileSupplier, batchId);
          }}
        />
      )}

      {emailSupplier && (
        <EmailComposerModal
          supplier={emailSupplier}
          batchId={emailBatchId}
          onClose={() => {
            setEmailSupplier(null);
            setEmailBatchId(undefined);
          }}
        />
      )}
    </div>
  );
}
