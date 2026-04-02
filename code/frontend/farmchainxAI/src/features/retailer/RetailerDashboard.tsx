import { useState, useCallback, useEffect } from "react";
import type {
  RetailerBatch,
  RetailerActivityItem,
} from "./types/retailer.types";
import { useAuth } from "../../hooks/useAuth";
import {
  getRetailerBatches,
  getRetailerProfile,
  getRetailerActivities,
  acceptRetailerBatch,
  markBatchAsSold,
} from "./api/retailerApi";
import TopNavBar from "../farmer/components/TopNavBar";
import RetailerPageHeader from "./components/RetailerPageHeader";
import RetailerKPICards from "./components/RetailerKPICards";
import RetailerQuickActions from "./components/RetailerQuickActions";
import InventoryTable from "./components/InventoryTable";
import RetailerShelfPanel from "./components/RetailerShelfPanel";
import MarkSoldModal from "./components/MarkSoldModal";
import styles from "./RetailerDashboard.module.css";

export default function RetailerDashboard() {
  const { user } = useAuth();

  /* State */
  const [batches, setBatches] = useState<RetailerBatch[]>([]);
  const [activities, setActivities] = useState<RetailerActivityItem[]>([]);
  const [storeName, setStoreName] = useState<string>("Store");

  // Modals
  const [soldModalBatch, setSoldModalBatch] = useState<RetailerBatch | null>(
    null
  );

  const fetchData = useCallback(async () => {
    try {
      const [batchesData, profileData, acts] = await Promise.all([
        getRetailerBatches(),
        getRetailerProfile().catch(() => null),
        getRetailerActivities().catch(() => []),
      ]);

      setBatches(Array.isArray(batchesData) ? batchesData : []);
      if (profileData) {
        // Build a display name: storeCity + "Store" or fall back to user's name
        const loc = profileData.storeCity || profileData.storeLocation;
        setStoreName(
          loc ? `${loc} Store` : `${profileData.fullName ?? ""}'s Store`
        );
      }
      setActivities(Array.isArray(acts) ? acts : []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleShelveAction = async (batch: RetailerBatch) => {
    try {
      const entered = window.prompt(
        "Enter shelf price (INR per unit) for this batch:",
        batch.sellingPricePerKg > 0 ? String(batch.sellingPricePerKg) : ""
      );

      if (entered === null) {
        return;
      }

      const shelfPrice = Number(entered);
      if (!Number.isFinite(shelfPrice) || shelfPrice <= 0) {
        alert("Please enter a valid shelf price greater than 0.");
        return;
      }

      await acceptRetailerBatch(batch.id, { shelfPrice });
      fetchData(); // Refresh all data to show new statuses and activities
    } catch (e) {
      console.error("Failed to shelve batch", e);
      alert("Failed to move batch to shelves. Please check connection.");
    }
  };

  const handleMarkSoldSubmit = async (qty: number, price: number) => {
    if (!soldModalBatch) return;
    await markBatchAsSold(soldModalBatch.id, qty, price);
    setSoldModalBatch(null);
    fetchData(); // Refresh table and activities
  };

  const inStockBatches = batches.filter(
    (b) => b.status === "Available" || b.status === "Low Stock"
  ).length;
  const lowStockCount = batches.filter((b) => b.status === "Low Stock").length;

  return (
    <div className={styles.page}>
      <TopNavBar
        userName={user?.fullName ?? "User"}
        userRole={user?.role ?? "RETAILER"}
        onNavigateToProfile={() => (window.location.href = "/retailer/profile")}
      />

      <div className={styles.container}>
        <RetailerPageHeader
          storeName={storeName}
          userName={user?.fullName ?? "User"}
          totalBatches={batches.length}
          inStockBatches={inStockBatches}
          lowStockCount={lowStockCount}
        />

        <RetailerKPICards batches={batches} />
        <RetailerQuickActions />

        <div className={styles.mainGrid}>
          <div className={styles.leftCol}>
            <InventoryTable
              batches={batches}
              onShelve={handleShelveAction}
              onMarkSold={(b) => setSoldModalBatch(b)}
            />
          </div>
          <div className={styles.rightCol}>
            <RetailerShelfPanel batches={batches} activities={activities} />
          </div>
        </div>
      </div>

      {soldModalBatch && (
        <MarkSoldModal
          batch={soldModalBatch}
          onClose={() => setSoldModalBatch(null)}
          onSubmit={handleMarkSoldSubmit}
        />
      )}
    </div>
  );
}
