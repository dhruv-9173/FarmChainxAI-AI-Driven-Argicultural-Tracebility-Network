import { useState, useCallback, useEffect } from "react";
import type {
  RetailerBatch,
  RetailerBatchStatus,
} from "./types/retailer.types";
import { useAuth } from "../../hooks/useAuth";
import { getRetailerBatches } from "./api/retailerApi";
import TopNavBar from "../farmer/components/TopNavBar";
import RetailerPageHeader from "./components/RetailerPageHeader";
import RetailerKPICards from "./components/RetailerKPICards";
import RetailerQuickActions from "./components/RetailerQuickActions";
import InventoryTable from "./components/InventoryTable";
import styles from "./RetailerDashboard.module.css";

export default function RetailerDashboard() {
  const { user } = useAuth();

  /* State */
  const [batches, setBatches] = useState<RetailerBatch[]>([]);

  useEffect(() => {
    getRetailerBatches()
      .then((data) => setBatches(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to fetch batches:", error);
        setBatches([]);
      });
  }, []);

  /* Update batch status (e.g., Accepted -> Available -> Sold Out) */
  const handleStatusChange = useCallback(
    (batch: RetailerBatch, newStatus: RetailerBatchStatus) => {
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, status: newStatus } : b))
      );
    },
    []
  );

  return (
    <div className={styles.container}>
      <TopNavBar
        userName={user?.fullName ?? "User"}
        userRole={user?.role ?? "RETAILER"}
      />

      <RetailerPageHeader
        storeName="Store"
        userName={user?.fullName ?? "User"}
        totalBatches={batches.length}
        inStockBatches={
          batches.filter(
            (b) => b.status === "Available" || b.status === "Low Stock"
          ).length
        }
        lowStockCount={batches.filter((b) => b.status === "Low Stock").length}
      />

      <RetailerKPICards batches={batches} />

      <RetailerQuickActions />

      <InventoryTable
        batches={batches}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
