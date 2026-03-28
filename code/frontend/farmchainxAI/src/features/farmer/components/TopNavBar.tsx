import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ActivityItem } from "../../../types/dashboard.types";
import styles from "./TopNavBar.module.css";

interface TopNavBarProps {
  userName: string;
  userRole: string;
  onNavigateToProfile?: () => void;
  avatarUrl?: string;
  activities?: ActivityItem[];
}

// Helper function to get emoji icon based on activity badge
const getActivityIcon = (badge: string): string => {
  const iconMap: Record<string, string> = {
    Transfer: "🔄",
    Created: "➕",
    Updated: "✏️",
    Received: "📥",
    Completed: "✅",
    Pending: "⏳",
    Alert: "⚠️",
    Quality: "📊",
    Batch: "📦",
  };
  return iconMap[badge] || "📬";
};

export default function TopNavBar({
  userName,
  userRole,
  onNavigateToProfile,
  avatarUrl,
  activities = [],
}: TopNavBarProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const unreadCount = activities.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <span className={styles.day}>{dayName}</span>
        <span className={styles.date}>{dateStr}</span>
        <h2 className={styles.welcome}>Welcome back, {userName} 👋</h2>
      </div>

      <div className={styles.right}>
        {/* Notification Bell */}
        <div className={styles.notifArea} ref={notifRef}>
          <button
            className={styles.bellBtn}
            title="Notifications"
            onClick={() => {
              setNotifOpen((v) => !v);
              setDropdownOpen(false);
            }}
          >
            <svg
              width="44"
              height="44"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.6}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className={styles.notifPanel}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Recent Activities</span>
              </div>
              <div className={styles.notifList}>
                {activities.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#6B7280",
                    }}
                  >
                    No recent activities
                  </p>
                ) : (
                  activities.slice(0, 10).map((activity) => (
                    <div
                      key={activity.id}
                      className={styles.notifItem}
                      onClick={() => setNotifOpen(false)}
                    >
                      <span className={styles.notifIcon}>
                        {getActivityIcon(activity.badge)}
                      </span>
                      <div className={styles.notifContent}>
                        <p className={styles.notifItemTitle}>
                          {activity.title}
                        </p>
                        <p className={styles.notifDesc}>
                          {activity.description}
                        </p>
                        <span className={styles.notifTime}>
                          {activity.time}
                        </span>
                      </div>
                      <span
                        className={styles.unreadDot}
                        style={{
                          backgroundColor: activity.badgeColor,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
              {activities.length > 0 && (
                <p className={styles.allReadMsg}>
                  📋 {activities.length} recent activit
                  {activities.length > 1 ? "ies" : "y"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className={styles.profileArea} ref={dropdownRef}>
          <button
            className={styles.profileBtn}
            onClick={() => {
              setDropdownOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <span className={styles.avatar}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                initials
              )}
            </span>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{userName}</span>
              <span className={styles.profileRole}>{userRole}</span>
            </div>
            <svg
              className={`${styles.chevron} ${
                dropdownOpen ? styles.chevronOpen : ""
              }`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setDropdownOpen(false);
                  onNavigateToProfile?.();
                }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
              </button>
              <div className={styles.dropdownDivider} />
              <button
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
