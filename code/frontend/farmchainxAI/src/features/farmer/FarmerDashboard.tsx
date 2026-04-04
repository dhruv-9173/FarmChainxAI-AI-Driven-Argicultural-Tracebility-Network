import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  Batch,
  FarmerPredictiveInsights,
  KPICard,
  ActivityItem,
  QualityTrendPoint,
  ShelfLifeItem,
} from "../../types/dashboard.types";
import type {
  BatchTransferResponse,
  TransferRecipientDto,
} from "../transfer/api/transferApi";
import { useProfile } from "../../contexts/ProfileContext";
import {
  getFarmerBatches,
  getFarmerActivities,
  getFarmerKPIs,
  getFarmerQualityTrends,
  getFarmerShelfLife,
  markBatchAsHarvested,
  getBatchTransferReceipt,
  type TransferReceiptDto,
} from "./api/farmerApi";
import { getFarmerPredictiveInsights } from "../../api/analyticsApi";

import TopNavBar from "./components/TopNavBar";
import PageHeader from "./components/PageHeader";
import KPISummaryCards from "./components/KPISummaryCards";
import QuickActions from "./components/QuickActions";
import BatchesTable from "./components/BatchesTable";
import RecentActivity from "./components/RecentActivity";
import AIInsights from "./components/AIInsights";
import ShelfLifePanel from "./components/ShelfLifePanel";
import BatchDetailsModal from "../../components/common/BatchDetailsModal";
import type { BatchDetail } from "../../components/common/BatchDetailsModal";
import CreateBatchModal from "./components/createBatch/CreateBatchModal";
import TransferBatchModal from "./components/transferBatch/TransferBatchModal";

import styles from "./FarmerDashboard.module.css";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useProfile();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [kpiCards, setKpiCards] = useState<KPICard[]>([]);
  const [qualityTrends, setQualityTrends] = useState<QualityTrendPoint[]>([]);
  const [shelfLifeItems, setShelfLifeItems] = useState<ShelfLifeItem[]>([]);
  const [predictiveInsights, setPredictiveInsights] =
    useState<FarmerPredictiveInsights | null>(null);
  const [selectedReceipt, setSelectedReceipt] =
    useState<TransferReceiptDto | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  useEffect(() => {
    getFarmerBatches()
      .then((data) => setBatches(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch batches:", error);
        setBatches([]);
      });
    getFarmerActivities()
      .then((data) => setActivities(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch activities:", error);
        setActivities([]);
      });
    getFarmerKPIs()
      .then((data) => setKpiCards(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch KPIs:", error);
        setKpiCards([]);
      });
    getFarmerQualityTrends()
      .then((data) => setQualityTrends(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch quality trends:", error);
        setQualityTrends([]);
      });
    getFarmerShelfLife()
      .then((data) => setShelfLifeItems(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch shelf life data:", error);
        setShelfLifeItems([]);
      });
  }, []);

  useEffect(() => {
    getFarmerPredictiveInsights()
      .then((data) => setPredictiveInsights(data || null))
      .catch((error) => {
        console.error("Failed to fetch farmer predictive insights:", error);
        setPredictiveInsights(null);
      });
  }, []);

  /* Transfer Batch */
  const [showTransferBatch, setShowTransferBatch] = useState(false);
  const [transferPreselectedBatch, setTransferPreselectedBatch] =
    useState<Batch | null>(null);

  const handleOpenTransfer = useCallback(() => {
    setTransferPreselectedBatch(null);
    setShowTransferBatch(true);
  }, []);

  const handleOpenTransferFromRow = useCallback((batch: Batch) => {
    setTransferPreselectedBatch(batch);
    setShowTransferBatch(true);
  }, []);

  const handleTransferComplete = useCallback(
    (transfer: BatchTransferResponse, recipient: TransferRecipientDto) => {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === transfer.batchId
            ? { ...b, status: "TRANSFERRED" as const }
            : b
        )
      );
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setActivities((prev) => [
        {
          id: `transfer-${Date.now()}`,
          title: "Batch Transferred",
          description: `${transfer.batchId} → ${recipient.fullName}`,
          time: `Just now (${timeStr})`,
          badge: "Transfer",
          badgeColor: "#7C3AED",
        },
        ...prev,
      ]);
    },
    []
  );

  const handleBatchCreated = useCallback((newBatch: Batch) => {
    setBatches((prev) => [newBatch, ...prev]);
  }, []);

  const handleMarkHarvested = useCallback(async (batch: Batch) => {
    const updated = await markBatchAsHarvested(batch.id);

    setBatches((prev) =>
      prev.map((b) =>
        b.id === batch.id ? { ...b, ...updated, status: "HARVESTED" } : b
      )
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setActivities((prev) => [
      {
        id: `harvest-${Date.now()}`,
        title: "Batch Harvested",
        description: `${batch.id} marked as harvested`,
        time: `Just now (${timeStr})`,
        badge: "Harvest",
        badgeColor: "#D97706",
      },
      ...prev,
    ]);
  }, []);

  const handleViewReceipt = useCallback(async (batch: Batch) => {
    setReceiptError(null);
    try {
      const receipt = await getBatchTransferReceipt(batch.id);
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
        userName={userProfile.fullName}
        userRole={userProfile.role}
        onNavigateToProfile={() => navigate("/farmer/profile")}
        avatarUrl={userProfile.avatarUrl}
        activities={activities}
      />
      <PageHeader />
      <KPISummaryCards cards={kpiCards} />
      <QuickActions
        onCreateBatch={() => setShowCreateBatch(true)}
        onTransferBatch={handleOpenTransfer}
      />

      <div className={styles.mainGrid}>
        <div className={styles.tableArea}>
          <BatchesTable
            batches={batches}
            onViewBatch={(batch) => navigate(`/batch/${batch.id}`)}
            onTransferBatch={handleOpenTransferFromRow}
            onMarkHarvested={handleMarkHarvested}
            onViewReceipt={handleViewReceipt}
          />
          {receiptError && (
            <div className={styles.receiptError}>{receiptError}</div>
          )}
        </div>
        <div className={styles.activityArea}>
          <RecentActivity activities={activities} />
        </div>
      </div>

      <div className={styles.analyticsGrid}>
        <AIInsights
          data={qualityTrends}
          predictiveInsights={predictiveInsights}
        />
        <ShelfLifePanel items={shelfLifeItems} />
      </div>

      {selectedBatch &&
        (() => {
          const detail: BatchDetail = {
            id: selectedBatch.id,
            cropType: selectedBatch.cropType,
            variety: selectedBatch.variety,
            quantity: selectedBatch.quantity,
            qualityScore: selectedBatch.qualityScore,
            shelfLifeDays: selectedBatch.shelfLifeDays,
            shelfLifePercent: selectedBatch.shelfLifePercent,
            organic: selectedBatch.organic ?? false,
            gapCertified: selectedBatch.gapCertified,
            basePrice: selectedBatch.basePrice,
            marketPrice: selectedBatch.marketPrice,
            farmerName: selectedBatch.farmerName,
            farmLocation: selectedBatch.location,
            status: selectedBatch.status,
            createdAt: selectedBatch.createdAt,
            cropImagePreview: selectedBatch.cropImagePreview,
          };
          return (
            <BatchDetailsModal
              batch={detail}
              role="farmer"
              accentColor="#166534"
              onClose={() => setSelectedBatch(null)}
            />
          );
        })()}

      {showCreateBatch && (
        <CreateBatchModal
          onClose={() => setShowCreateBatch(false)}
          onBatchCreated={handleBatchCreated}
        />
      )}

      {showTransferBatch && (
        <TransferBatchModal
          onClose={() => {
            setShowTransferBatch(false);
            setTransferPreselectedBatch(null);
          }}
          onTransferComplete={handleTransferComplete}
          batches={batches}
          preselectedBatch={transferPreselectedBatch}
        />
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
                <span>Transfer Price</span>
                <strong>
                  {Number.isFinite(Number(selectedReceipt.transferPrice))
                    ? `₹${Number(selectedReceipt.transferPrice).toLocaleString(
                        "en-IN"
                      )}`
                    : "-"}
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
