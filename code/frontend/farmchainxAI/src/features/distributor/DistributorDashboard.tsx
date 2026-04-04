import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  DistributorActivityItem,
  DistributorAnalyticsPoint,
  DistributorBatch,
  DistributorPredictiveInsights,
  DistributorNotification,
} from "./types/distributor.types";
import type {
  BatchTransferResponse,
  TransferRecipientDto,
} from "../transfer/api/transferApi";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import {
  getDistributorActivities,
  getDistributorAnalytics,
  getDistributorBatches,
  getDistributorTransferReceipt,
  type TransferReceiptDto,
} from "./api/distributorApi";
import { getDistributorPredictiveInsights } from "../../api/analyticsApi";

import TopNavBar from "../farmer/components/TopNavBar";
import DistributorPageHeader from "./components/DistributorPageHeader";
import DistributorKPICards from "./components/DistributorKPICards";
import DistributorQuickActions from "./components/DistributorQuickActions";
import ReceivedBatchesTable from "./components/ReceivedBatchesTable";
import NotificationsPanel from "./components/NotificationsPanel";
import BatchPipelinePanel from "./components/BatchPipelinePanel";
import DistributorAnalytics from "./components/DistributorAnalytics";

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
  const [selectedReceipt, setSelectedReceipt] =
    useState<TransferReceiptDto | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<
    DistributorAnalyticsPoint[]
  >([]);
  const [activitiesData, setActivitiesData] = useState<
    DistributorActivityItem[]
  >([]);
  const [predictiveInsights, setPredictiveInsights] =
    useState<DistributorPredictiveInsights | null>(null);

  const loadBatches = useCallback(async () => {
    try {
      const data = await getDistributorBatches();
      setBatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      setBatches([]);
    }
  }, []);

  const loadAnalyticsSection = useCallback(async () => {
    try {
      const [analytics, activities, predictive] = await Promise.all([
        getDistributorAnalytics(),
        getDistributorActivities(),
        getDistributorPredictiveInsights().catch(() => null),
      ]);

      setAnalyticsData(Array.isArray(analytics) ? analytics : []);
      setActivitiesData(Array.isArray(activities) ? activities : []);
      setPredictiveInsights(predictive || null);
    } catch (error) {
      console.error("Failed to refresh analytics section:", error);
      setAnalyticsData([]);
      setActivitiesData([]);
      setPredictiveInsights(null);
    }
  }, []);

  useEffect(() => {
    loadBatches();
    loadAnalyticsSection();

    // Fetch notifications using centralized API
    fetchUnreadNotifications()
      .then((data) =>
        setNotifications(
          Array.isArray(data) ? (data as DistributorNotification[]) : []
        )
      )
      .catch((error) => {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      });
  }, [fetchUnreadNotifications, loadAnalyticsSection, loadBatches]);

  /* ── Handlers ── */
  const handleTransferComplete = useCallback(
    async (
      _transfer: BatchTransferResponse,
      recipient: TransferRecipientDto
    ) => {
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
      await loadAnalyticsSection();
    },
    [loadAnalyticsSection, transferBatch]
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

  const handleViewReceipt = useCallback(async (batch: DistributorBatch) => {
    setReceiptError(null);
    try {
      const receipt = await getDistributorTransferReceipt(batch.id);
      setSelectedReceipt(receipt);
    } catch (error) {
      setSelectedReceipt(null);
      setReceiptError(
        error instanceof Error
          ? error.message
          : "Transfer receipt not found for this batch"
      );
    }
  }, []);

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
            onViewReceipt={handleViewReceipt}
          />
          {receiptError && (
            <div className={styles.receiptError}>{receiptError}</div>
          )}
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

      <div className={styles.analyticsGrid}>
        <BatchPipelinePanel batches={batches} />
        <DistributorAnalytics
          data={analyticsData}
          activities={activitiesData}
          predictiveInsights={predictiveInsights}
        />
      </div>

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
          <div
            className={styles.modalContent}
            style={{
              maxWidth: "800px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
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
              token={
                localStorage.getItem("accessToken") ||
                sessionStorage.getItem("accessToken") ||
                ""
              }
              onQCComplete={async () => {
                // Refresh batches and analytics after successful QC so chart data stays live.
                await Promise.all([loadBatches(), loadAnalyticsSection()]);
              }}
            />
          </div>
        </div>
      )}

      {selectedReceipt && (
        <div
          className={styles.receiptOverlay}
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className={styles.receiptModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.receiptHeader}>
              <h3 className={styles.receiptTitle}>Transfer Receipt</h3>
              <button
                className={styles.receiptClose}
                onClick={() => setSelectedReceipt(null)}
              >
                ×
              </button>
            </div>

            <div className={styles.receiptGrid}>
              <div className={styles.receiptRow}>
                <span>Transfer ID</span>
                <strong>{selectedReceipt.transferId}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Batch ID</span>
                <strong>{selectedReceipt.batchId}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Status</span>
                <strong>{selectedReceipt.status}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Recipient</span>
                <strong>
                  {selectedReceipt.recipientName} (
                  {selectedReceipt.recipientRole})
                </strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Recipient Contact</span>
                <strong>
                  {selectedReceipt.recipientEmail || "-"}
                  {selectedReceipt.recipientPhone
                    ? ` • ${selectedReceipt.recipientPhone}`
                    : ""}
                </strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Crop</span>
                <strong>{selectedReceipt.cropType}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Quantity</span>
                <strong>
                  {selectedReceipt.quantity}{" "}
                  {selectedReceipt.quantityUnit || ""}
                </strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Transfer Note</span>
                <strong>{selectedReceipt.transferNote || "-"}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
