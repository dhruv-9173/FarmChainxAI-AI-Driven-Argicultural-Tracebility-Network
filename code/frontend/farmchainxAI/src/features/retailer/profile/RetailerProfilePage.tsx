import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getRetailerProfile, updateRetailerProfile } from "../api/retailerApi";
import { getRetailerBatches } from "../api/retailerApi";
import TopNavBar from "../../farmer/components/TopNavBar";
import styles from "./RetailerProfilePage.module.css";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  storeLocation: string;
  storeCity: string;
  storeState: string;
}

interface Stats {
  inStock: number;
  sold: number;
  lowStock: number;
  totalBatches: number;
}

export default function RetailerProfilePage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData>({
    fullName: authUser?.fullName ?? "",
    email: authUser?.email ?? "",
    phone: authUser?.phone ?? "",
    storeLocation: "",
    storeCity: "",
    storeState: "",
  });

  const [stats, setStats] = useState<Stats>({ inStock: 0, sold: 0, lowStock: 0, totalBatches: 0 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, batches] = await Promise.all([
          getRetailerProfile(),
          getRetailerBatches().catch(() => []),
        ]);

        if (profileData) {
          const merged: ProfileData = {
            fullName: profileData.fullName || authUser?.fullName || "",
            email: profileData.email || authUser?.email || "",
            phone: profileData.phone || authUser?.phone || "",
            storeLocation: profileData.storeLocation || "",
            storeCity: profileData.storeCity || "",
            storeState: profileData.storeState || "",
          };
          setProfile(merged);
          setDraft(merged);
        }

        if (Array.isArray(batches)) {
          setStats({
            totalBatches: batches.length,
            inStock: batches.filter(b => b.status === "Available" || b.status === "Accepted").length,
            lowStock: batches.filter(b => b.status === "Low Stock").length,
            sold: batches.filter(b => b.status === "Sold Out").length,
          });
        }
      } catch (e) {
        console.error("Profile load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authUser]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateRetailerProfile({
        fullName: draft.fullName,
        phone: draft.phone,
        storeLocation: draft.storeLocation,
        storeCity: draft.storeCity,
        storeState: draft.storeState,
      });
      setProfile(draft);
      setEditing(false);
      setSaveMsg({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err: unknown) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
    setSaveMsg(null);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <TopNavBar userName={authUser?.fullName ?? ""} userRole="RETAILER" />
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <TopNavBar
        userName={profile.fullName || authUser?.fullName || ""}
        userRole="RETAILER"
        onNavigateToProfile={() => navigate("/retailer/profile")}
      />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button className={styles.breadLink} onClick={() => navigate("/retailer/dashboard")}>
            Dashboard
          </button>
          <span className={styles.breadSep}>›</span>
          <span>Profile</span>
        </div>

        {/* Save Message */}
        {saveMsg && (
          <div className={`${styles.saveMsg} ${styles[saveMsg.type]}`}>
            {saveMsg.type === "success" ? "✓" : "✕"} {saveMsg.text}
          </div>
        )}

        <div className={styles.profileGrid}>
          {/* LEFT — Avatar + Stats */}
          <aside className={styles.sidebar}>
            {/* Avatar */}
            <div className={styles.avatarCard}>
              <div className={styles.avatarRing}>
                <div className={styles.avatar}>
                  {profile.fullName
                    ? profile.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                    : "R"}
                </div>
              </div>
              <h2 className={styles.avatarName}>{profile.fullName || "Retailer"}</h2>
              <span className={styles.avatarRole}>🛒 Retailer</span>
              <p className={styles.avatarEmail}>{profile.email}</p>
              {profile.storeCity && (
                <p className={styles.avatarLocation}>
                  📍 {profile.storeCity}{profile.storeState ? `, ${profile.storeState}` : ""}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className={styles.statsCard}>
              <h3 className={styles.statsTitle}>Inventory Overview</h3>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <div className={styles.statDot} style={{ background: "#16A34A" }} />
                  <div>
                    <div className={styles.statVal}>{stats.totalBatches}</div>
                    <div className={styles.statLbl}>Total Batches</div>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statDot} style={{ background: "#0891B2" }} />
                  <div>
                    <div className={styles.statVal}>{stats.inStock}</div>
                    <div className={styles.statLbl}>In Stock</div>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statDot} style={{ background: "#EA580C" }} />
                  <div>
                    <div className={styles.statVal}>{stats.lowStock}</div>
                    <div className={styles.statLbl}>Low Stock</div>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statDot} style={{ background: "#6B7280" }} />
                  <div>
                    <div className={styles.statVal}>{stats.sold}</div>
                    <div className={styles.statLbl}>Sold Out</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.quickLinks}>
              <button className={styles.quickLink} onClick={() => navigate("/retailer/dashboard")}>
                <span>📊</span> Dashboard
              </button>
              <button className={styles.quickLink} onClick={() => navigate("/retailer/analytics")}>
                <span>📈</span> Analytics
              </button>
              <button className={styles.quickLink} onClick={() => navigate("/retailer/suppliers")}>
                <span>🤝</span> Suppliers
              </button>
            </div>
          </aside>

          {/* RIGHT — Form */}
          <main className={styles.main}>
            {/* Personal Info */}
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>👤 Personal Information</h3>
                  <p className={styles.cardSub}>Your account and contact details</p>
                </div>
                {!editing && (
                  <button className={styles.editBtn} onClick={() => setEditing(true)}>
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  {editing ? (
                    <input
                      className={styles.input}
                      value={draft.fullName}
                      onChange={e => setDraft(d => ({ ...d, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className={styles.fieldVal}>{profile.fullName || "—"}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <div className={styles.fieldVal}>
                    {profile.email}
                    <span className={styles.lockedBadge}>🔒 Cannot change</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  {editing ? (
                    <input
                      className={styles.input}
                      value={draft.phone}
                      onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      type="tel"
                    />
                  ) : (
                    <div className={styles.fieldVal}>{profile.phone || "—"}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Retailer ID</label>
                  <div className={`${styles.fieldVal} ${styles.mono}`}>{authUser?.id || "—"}</div>
                </div>
              </div>
            </div>

            {/* Store Info */}
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>🛒 Store Information</h3>
                  <p className={styles.cardSub}>Your store location and business details</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Store Location / Address</label>
                  {editing ? (
                    <input
                      className={styles.input}
                      value={draft.storeLocation}
                      onChange={e => setDraft(d => ({ ...d, storeLocation: e.target.value }))}
                      placeholder="Shop No. 5, Market Lane"
                    />
                  ) : (
                    <div className={styles.fieldVal}>{profile.storeLocation || "—"}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>City</label>
                  {editing ? (
                    <input
                      className={styles.input}
                      value={draft.storeCity}
                      onChange={e => setDraft(d => ({ ...d, storeCity: e.target.value }))}
                      placeholder="Mumbai"
                    />
                  ) : (
                    <div className={styles.fieldVal}>{profile.storeCity || "—"}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>State</label>
                  {editing ? (
                    <input
                      className={styles.input}
                      value={draft.storeState}
                      onChange={e => setDraft(d => ({ ...d, storeState: e.target.value }))}
                      placeholder="Maharashtra"
                    />
                  ) : (
                    <div className={styles.fieldVal}>{profile.storeState || "—"}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Role</label>
                  <div className={styles.fieldVal}>
                    <span className={styles.roleBadge}>RETAILER</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save / Cancel */}
            {editing && (
              <div className={styles.actionRow}>
                <button
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <><span className={styles.btnSpinner} /> Saving...</>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
