import { useState, useEffect } from "react";
import TopNavBar from "../farmer/components/TopNavBar";
import AdminKPICards from "./components/AdminKPICards";
import UserManagementTable from "./components/UserManagementTable";
import BatchTracker from "./components/BatchTracker";
import AdminAnalytics from "./components/AdminAnalytics";
import AdminNotificationsPanel from "./components/AdminNotificationsPanel";
import SystemHealth from "./components/SystemHealth";
import SendNotificationModal from "./components/SendNotificationModal";
import UserProfileModal from "./components/UserProfileModal";
import type {
  AdminUser,
  AdminNotification,
  AdminBatch,
  AdminAnalyticsPoint,
  SystemHealthMetric,
} from "./types/admin.types";
import {
  getAdminUsers,
  getAdminBatches,
  getAdminNotifications,
  getAdminAnalytics,
  getSystemHealth,
  sendAdminNotification,
} from "./api/adminApi";
import { useAuth } from "../../hooks/useAuth";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [adminBatches, setAdminBatches] = useState<AdminBatch[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [adminAnalytics, setAdminAnalytics] = useState<AdminAnalyticsPoint[]>(
    []
  );
  const [systemHealthData, setSystemHealthData] = useState<
    SystemHealthMetric[]
  >([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    getAdminUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      });
    getAdminBatches()
      .then((data) => setAdminBatches(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch batches:", error);
        setAdminBatches([]);
      });
    getAdminNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      });
    getAdminAnalytics()
      .then((data) => setAdminAnalytics(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch analytics:", error);
        setAdminAnalytics([]);
      });
    getSystemHealth()
      .then((data) => setSystemHealthData(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch system health:", error);
        setSystemHealthData([]);
      });
  }, []);

  const handleApprove = (id: string) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: "Active" as const, verified: true } : u
      )
    );

  const handleSuspend = (id: string) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: "Suspended" as const } : u
      )
    );

  const handleActivate = (id: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "Active" as const } : u))
    );

  const handleMarkRead = (notifId: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );

  const handleMarkAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleSendNotification = async (payload: {
    targetRole: string;
    message: string;
    priority: string;
  }) => {
    try {
      const newNotif = await sendAdminNotification({
        targetRole: payload.targetRole,
        title: "Admin Broadcast",
        message: payload.message,
        priority: payload.priority as "low" | "medium" | "high",
      });
      setNotifications((prev) => [newNotif, ...prev]);
    } catch (err) {
      console.error("Failed to send notification", err);
    }
  };

  return (
    <div className={styles.page}>
      <TopNavBar
        userName={user?.fullName ?? "Admin"}
        userRole="Administrator"
        onNavigateToProfile={() => {}}
      />

      <main className={styles.main}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Admin Control Panel</h1>
            <p className={styles.pageSub}>
              Manage users, monitor batches, and oversee platform health.
            </p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.adminId}>🆔 {user?.id ?? ""}</div>
            <button
              className={styles.notifBtn}
              onClick={() => setShowNotifModal(true)}
            >
              📣 Send Notification
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <AdminKPICards users={users} batches={adminBatches} />

        {/* User Management + Notifications */}
        <div className={styles.splitRow}>
          <div className={styles.mainCol}>
            <UserManagementTable
              users={users}
              onApprove={handleApprove}
              onSuspend={handleSuspend}
              onActivate={handleActivate}
              onViewProfile={setSelectedUser}
            />
          </div>
          <div className={styles.sideCol}>
            <AdminNotificationsPanel
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
            />
          </div>
        </div>

        {/* Batch Tracker */}
        <BatchTracker batches={adminBatches} />

        {/* Analytics + System Health */}
        <div className={styles.bottomRow}>
          <div className={styles.analyticsCol}>
            <AdminAnalytics data={adminAnalytics} />
          </div>
          <div className={styles.healthCol}>
            <SystemHealth metrics={systemHealthData} />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showNotifModal && (
        <SendNotificationModal
          onClose={() => setShowNotifModal(false)}
          onSend={handleSendNotification}
        />
      )}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={handleApprove}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
        />
      )}
    </div>
  );
}
