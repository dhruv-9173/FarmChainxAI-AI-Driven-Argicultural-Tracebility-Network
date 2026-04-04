/**
 * PublicBatchTracker.tsx
 * Public-facing component for consumers to track batches via QR code
 * No authentication required
 */

import React, { useState, useEffect } from "react";
import { blockchainApi } from "../../api/blockchainApi";
import type { PublicTrackingData } from "../../types/blockchain.types";
import styles from "./PublicBatchTracker.module.css";

interface PublicBatchTrackerProps {
  batchId?: string;
}

export const PublicBatchTracker: React.FC<PublicBatchTrackerProps> = ({
  batchId: initialBatchId,
}) => {
  const [batchId, setBatchId] = useState(initialBatchId || "");
  const [trackingData, setTrackingData] = useState<PublicTrackingData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialBatchId) {
      searchBatch(initialBatchId);
    }
  }, [initialBatchId]);

  const searchBatch = async (id: string) => {
    if (!id.trim()) {
      setError("Please enter a batch ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await blockchainApi.publicTrack(id);
      setTrackingData(data);
      setSearched(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Batch not found or tracking unavailable"
      );
      setTrackingData(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBatch(batchId);
  };

  const stageEmojis: Record<string, string> = {
    CREATED: "🌱",
    IN_TRANSIT: "🚚",
    RECEIVED: "📦",
    QUALITY_CHECK: "✅",
    STORED: "🏪",
    SOLD: "💳",
    REJECTED: "⛔",
    EXPIRED: "⏰",
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🌾 Track Your Farm Product</h1>
        <p>
          Scan the QR code or enter the batch ID to view the complete supply
          chain journey
        </p>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Enter Batch ID (e.g., BATCH-001)"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.searchBtn} disabled={loading}>
            {loading ? "Tracking..." : "Track Batch"}
          </button>
        </div>
      </form>

      {searched && !trackingData && !loading && (
        <div className={styles.noResults}>
          <p>❌ {error || "No batch found"}</p>
        </div>
      )}

      {trackingData && trackingData.status === "success" && (
        <div className={styles.trackingResult}>
          <div className={styles.batchInfo}>
            <h2>Batch ID: {trackingData.batchId}</h2>
            <div className={styles.verificationBadge}>
              {trackingData.verified ? (
                <>
                  <span className={styles.verifiedIcon}>✓</span>
                  <span>Verified on Blockchain</span>
                </>
              ) : (
                <>
                  <span className={styles.unverifiedIcon}>⚠</span>
                  <span>Verification Required</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.journey}>
            <h3>Farm to Your Table Journey</h3>
            <div className={styles.stageContainer}>
              {trackingData.journey.map((stop, index) => (
                <div key={index} className={styles.stop}>
                  <div className={styles.stopNumber}>{index + 1}</div>
                  <div className={styles.stopContent}>
                    <div className={styles.stage}>
                      <span className={styles.emoji}>
                        {stageEmojis[stop.stage] || "📍"}
                      </span>
                      <span className={styles.stageName}>{stop.stage}</span>
                    </div>
                    <div className={styles.stopDetails}>
                      <p className={styles.timestamp}>
                        📅 {new Date(stop.timestamp).toLocaleString()}
                      </p>
                      <p className={styles.location}>📍 {stop.location}</p>
                      <p className={styles.handler}>
                        👤 Handled by: <strong>{stop.actorRole}</strong>
                      </p>
                      {stop.qualityScore > 0 && (
                        <p className={styles.quality}>
                          ⭐ Quality: <strong>{stop.qualityScore}/100</strong>
                        </p>
                      )}
                      {stop.unitPrice !== undefined &&
                        stop.unitPrice !== null &&
                        Number.isFinite(Number(stop.unitPrice)) && (
                          <p className={styles.quality}>
                            ₹ Unit Price:{" "}
                            <strong>
                              ₹{Number(stop.unitPrice).toLocaleString("en-IN")}
                            </strong>
                          </p>
                        )}
                    </div>
                  </div>
                  {index < trackingData.journey.length - 1 && (
                    <div className={styles.connector} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.trustBadge}>
            <div className={styles.trustContent}>
              <span className={styles.lockIcon}>🔐</span>
              <div>
                <h4>Blockchain Verified</h4>
                <p>
                  This product's journey has been verified using blockchain
                  technology. Every step is immutable and tamper-proof.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!searched && (
        <div className={styles.info}>
          <div className={styles.infoSection}>
            <h3>📱 How to Track</h3>
            <ol>
              <li>Scan the QR code on your product packaging</li>
              <li>Or enter the batch ID manually</li>
              <li>View the complete supply chain journey</li>
              <li>Verify product authenticity on blockchain</li>
            </ol>
          </div>

          <div className={styles.infoSection}>
            <h3>✅ Why It Matters</h3>
            <ul>
              <li>Know exactly where your food came from</li>
              <li>Verify it hasn't been tampered with</li>
              <li>See quality checks at each stage</li>
              <li>Support transparent farming</li>
            </ul>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <p>🌍 FarmChainX - Farm to Table Transparency</p>
      </footer>
    </div>
  );
};
