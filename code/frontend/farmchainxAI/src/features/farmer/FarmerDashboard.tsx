import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  Batch,
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
} from "./api/farmerApi";

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
          />
        </div>
        <div className={styles.activityArea}>
          <RecentActivity activities={activities} />
        </div>
      </div>

      <div className={styles.analyticsGrid}>
        <AIInsights data={qualityTrends} />
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
    </div>
  );
}
