import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  DistributorBatch,
  DistributorNotification,
} from "./types/distributor.types";
import type {
  BatchTransferResponse,
  TransferRecipientDto,
} from "../transfer/api/transferApi";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { getDistributorBatches } from "./api/distributorApi";

import TopNavBar from "../farmer/components/TopNavBar";
import DistributorPageHeader from "./components/DistributorPageHeader";
import DistributorKPICards from "./components/DistributorKPICards";
import DistributorQuickActions from "./components/DistributorQuickActions";
import ReceivedBatchesTable from "./components/ReceivedBatchesTable";
import NotificationsPanel from "./components/NotificationsPanel";
import BatchPipelinePanel from "./components/BatchPipelinePanel";

import TransferOutModal from "./components/transferOut/TransferOutModal";

import QCWorkflow from "../../components/QualityCheck/QCWorkflow";

import styles from "./DistributorDashboard.module.css";

export default function DistributorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchUnreadNotifications, markAsRead, markAllAsRead } =
    useNotifications();

  const [batches, setBatches] = useState<DistributorBatch[]>([]);
  const [notifications, setNotifications] = useState<DistributorNotification[]>(
    []
  );
  const [transferBatch, setTransferBatch] = useState<DistributorBatch | null>(
    null
  );
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showQCModal, setShowQCModal] = useState(false);

  useEffect(() => {
    // Fetch batches - keeping existing distributor API for now
    getDistributorBatches()
      .then((data) => setBatches(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch batches:", error);
        setBatches([]);
      });

    // Fetch notifications using centralized API
    fetchUnreadNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? (data as DistributorNotification[]) : []))
      .catch((error) => {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      });
  }, [fetchUnreadNotifications]);

  /* ── Handlers ── */
  const handleTransferComplete = useCallback(
    (_transfer: BatchTransferResponse, recipient: TransferRecipientDto) => {
      if (!transferBatch) return;
      setBatches((prev) =>
        prev.map((b) =>
          b.id === transferBatch.id
            ? {
                ...b,
                status: "In Transit" as const,
                transferredTo: recipient.fullName,
                transferredAt: new Date().toISOString().split("T")[0],
                recipientType:
                  recipient.role === "RETAILER" ? "Retailer" : "Consumer",
              }
            : b
        )
      );
      // Activity logged: Batch Transferred
    },
    [transferBatch]
  );

  /* Quick-action helpers */
  const handleOpenTransferQuick = useCallback(() => {
    // Open transfer modal to allow batch selection
    setShowTransferModal(true);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        await markAsRead(id);
        // Update local state optimistically
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [markAsRead]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      // Update local state optimistically
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [markAllAsRead]);

  return (
    <div className={styles.page}>
      <TopNavBar
        userName={user?.fullName ?? ""}
        userRole={user?.role ?? "DISTRIBUTOR"}
        onNavigateToProfile={() => navigate("/distributor/profile")}
      />

      <DistributorPageHeader />

      <DistributorKPICards batches={batches} />

      <DistributorQuickActions 
        onTransferOut={handleOpenTransferQuick}
        onQualityCheck={() => setShowQCModal(true)}
      />

      <div className={styles.mainGrid}>
        <div className={styles.tableArea}>
          <ReceivedBatchesTable
            batches={batches}
          />
        </div>
        <div className={styles.notifArea}>
          <NotificationsPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />
        </div>
      </div>

      <BatchPipelinePanel batches={batches} />

      {(transferBatch || showTransferModal) && (
        <TransferOutModal
          batch={transferBatch || undefined}
          onClose={() => {
            setTransferBatch(null);
            setShowTransferModal(false);
          }}
          onTransferComplete={handleTransferComplete}
        />
      )}

      {showQCModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className={styles.modalHeader}>
              <h2>Quality Check Dashboard</h2>
              <button 
                className={styles.closeBtn} 
                onClick={() => setShowQCModal(false)}
              >
                ✕
              </button>
            </div>
            <QCWorkflow 
              token={localStorage.getItem("token") || ""} 
              onQCComplete={() => {
                // Refresh batches after a successful QC to reflect the state change to QUALITY_PASSED
                getDistributorBatches()
                  .then((data) => setBatches(Array.isArray(data) ? data : []))
                  .catch(console.error);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
