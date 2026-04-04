import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavBar from "../../../features/farmer/components/TopNavBar";
import styles from "./ProfilePage.module.css";

/* ─── Public types ─── */
export interface ProfileField {
  key: string;
  label: string;
  value: string;
  editable?: boolean;
  type?: string;
  mono?: boolean;
}

export interface ProfileSection {
  icon: string;
  title: string;
  subtitle: string;
  fields: ProfileField[];
}

export interface ProfileStat {
  label: string;
  value: string;
  color: string;
}

export interface ProfileUser {
  fullName: string;
  role: string;
  roleId: string; // farmerId / distributorId / retailerId
  memberSince: string;
  avatarUrl?: string;
  bizName?: string; // company / store name shown below avatar
}

export interface ProfilePageLayoutProps {
  user: ProfileUser;
  sections: ProfileSection[];
  stats: ProfileStat[];
  dashboardPath: string; // e.g. "/farmer/dashboard"
  profilePath: string; // e.g. "/farmer/profile"
  accentCss: string; // CSS variable string, e.g. "--accent: #166534; --accent-bg: #f0fdf4;"
  onSave: (draftSections: ProfileSection[]) => Promise<void>;
  onChangePassword?: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

/* ─── Small helpers ─── */
function Toast({
  msg,
  type,
  onDismiss,
}: {
  msg: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div
      className={`${styles.toast} ${
        type === "error" ? styles.toastError : styles.toastSuccess
      }`}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      {msg}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function FieldRow({
  label,
  value,
  editing,
  type = "text",
  mono = false,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  type?: string;
  mono?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      {editing ? (
        <input
          className={styles.fieldInput}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <span
          className={`${styles.fieldValue} ${mono ? styles.fieldMono : ""}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: ProfileStat) {
  return (
    <div className={styles.statBox} style={{ borderColor: `${color}33` }}>
      <span className={styles.statValue} style={{ color }}>
        {value}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

/* ─── Password Modal ─── */
function ChangePasswordModal({
  onClose,
  onSuccess,
  onSubmit,
}: {
  onClose: () => void;
  onSuccess: () => void;
  onSubmit?: (currentPassword: string, newPassword: string) => Promise<void>;
}) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.current) {
      setErr("Current password is required.");
      return;
    }
    if (form.next.length < 8) {
      setErr("New password must be ≥ 8 characters.");
      return;
    }
    if (form.next !== form.confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setErr("");
    try {
      setSaving(true);
      if (onSubmit) {
        await onSubmit(form.current, form.next);
      }
      onSuccess();
      onClose();
    } catch (error) {
      setErr(
        error instanceof Error ? error.message : "Failed to update password."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Change Password</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>
        {err && <p className={styles.pwdErr}>{err}</p>}
        <div className={styles.fieldList} style={{ padding: "16px 24px 0" }}>
          {[
            { lbl: "Current Password", key: "current" as const },
            {
              lbl: "New Password",
              key: "next" as const,
              hint: "Min. 8 characters",
            },
            {
              lbl: "Confirm Password",
              key: "confirm" as const,
              hint: "Repeat new password",
            },
          ].map(({ lbl, key, hint }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label className={styles.fieldLabel}>{lbl}</label>
              <input
                className={styles.fieldInput}
                type="password"
                style={{ maxWidth: "100%", display: "block", marginTop: 4 }}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                placeholder={hint ?? "••••••••"}
              />
            </div>
          ))}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.saveBtn}
            onClick={() => void handleSubmit()}
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Layout ─── */
export default function ProfilePageLayout({
  user,
  sections,
  stats,
  dashboardPath,
  profilePath,
  accentCss,
  onSave,
  onChangePassword,
}: ProfilePageLayoutProps) {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<ProfileSection[]>(sections);
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" = "success") => {
      setToast({ msg, type });
    },
    []
  );

  const handleEditToggle = () => {
    if (editMode) setDraft(sections); // cancel → reset
    setEditMode((v) => !v);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      showToast("Profile updated successfully");
    } catch {
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
      setEditMode(false);
    }
  };

  const updateField = (sectionIdx: number, fieldKey: string, value: string) => {
    setDraft((prev) =>
      prev.map((s, si) =>
        si !== sectionIdx
          ? s
          : {
              ...s,
              fields: s.fields.map((f) =>
                f.key === fieldKey ? { ...f, value } : f
              ),
            }
      )
    );
  };

  return (
    <div
      className={styles.page}
      style={{
        ["--accent" as string]: "unset",
        ...Object.fromEntries(
          accentCss
            .split(";")
            .filter(Boolean)
            .map((r) => {
              const [k, v] = r.split(":").map((s) => s.trim());
              return [k, v];
            })
        ),
      }}
    >
      <TopNavBar
        userName={user.fullName}
        userRole={user.role}
        onNavigateToProfile={() => navigate(profilePath)}
        avatarUrl={user.avatarUrl}
      />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button
            className={styles.breadLink}
            onClick={() => navigate(dashboardPath)}
          >
            Dashboard
          </button>
          <span className={styles.breadSep}>›</span>
          <span>My Profile</span>
        </div>

        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>
            Manage your personal and professional information
          </p>
        </div>

        {/* Header card */}
        <div className={styles.headerCard}>
          <div className={styles.avatarArea}>
            <div className={styles.avatar}>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "18px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                getInitials(user.fullName)
              )}
            </div>
            <div>
              <h2 className={styles.headerName}>{user.fullName}</h2>
              <span className={styles.headerRole}>{user.role}</span>
              <div className={styles.headerMeta}>
                <span>🪪 {user.roleId}</span>
                <span>·</span>
                <span>📅 Member since {user.memberSince}</span>
              </div>
              {user.bizName && (
                <div className={styles.bizName}>{user.bizName}</div>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.editBtn} onClick={handleEditToggle}>
              {editMode ? "Cancel Editing" : "✏️ Edit Profile"}
            </button>
            <button className={styles.pwdBtn} onClick={() => setShowPwd(true)}>
              🔒 Change Password
            </button>
          </div>
        </div>

        {/* Sections grid */}
        <div className={styles.grid}>
          {sections.map((section, si) => {
            const draftSection = draft[si];
            return (
              <div key={si} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>{section.icon}</span>
                  <div>
                    <h3 className={styles.cardTitle}>{section.title}</h3>
                    <p className={styles.cardSub}>{section.subtitle}</p>
                  </div>
                </div>
                <div className={styles.fieldList}>
                  {section.fields.map((f) => {
                    const draftVal =
                      draftSection?.fields.find((df) => df.key === f.key)
                        ?.value ?? f.value;
                    return (
                      <FieldRow
                        key={f.key}
                        label={f.label}
                        value={
                          editMode && f.editable !== false ? draftVal : f.value
                        }
                        editing={editMode && f.editable !== false}
                        type={f.type}
                        mono={f.mono}
                        onChange={(v) => updateField(si, f.key, v)}
                      />
                    );
                  })}
                </div>
                {editMode &&
                  section.fields.some((f) => f.editable !== false) && (
                    <div className={styles.cardFooter}>
                      <button
                        className={styles.saveBtn}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                      <button
                        className={styles.cancelBtn}
                        onClick={handleEditToggle}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
              </div>
            );
          })}

          {/* Account Security card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🔐</span>
              <div>
                <h3 className={styles.cardTitle}>Account Security</h3>
                <p className={styles.cardSub}>
                  Manage your password and access
                </p>
              </div>
            </div>
            <div className={styles.fieldList}>
              {[
                { label: "Password", value: "••••••••••••" },
                { label: "Last Login", value: "Today" },
                { label: "Account Status", value: "Active & Verified ✓" },
              ].map((r) => (
                <FieldRow
                  key={r.label}
                  label={r.label}
                  value={r.value}
                  editing={false}
                  onChange={() => {}}
                />
              ))}
            </div>
            <div className={styles.cardFooter}>
              <button
                className={styles.pwdActionBtn}
                onClick={() => setShowPwd(true)}
              >
                🔒 Change Password
              </button>
            </div>
          </div>

          {/* Activity Summary card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📊</span>
              <div>
                <h3 className={styles.cardTitle}>Activity Summary</h3>
                <p className={styles.cardSub}>Your performance metrics</p>
              </div>
            </div>
            <div className={styles.statGrid}>
              {stats.map((s) => (
                <StatBox key={s.label} {...s} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPwd && (
        <ChangePasswordModal
          onClose={() => setShowPwd(false)}
          onSuccess={() => showToast("Password updated successfully")}
          onSubmit={onChangePassword}
        />
      )}

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
