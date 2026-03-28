/**
 * SupplyChainTimeline.tsx
 * Component to display supply chain journey with blockchain verification
 */

import React, { useState, useEffect } from "react";
import { blockchainApi } from "../../api/blockchainApi";
import type { SupplyChainVerification } from "../../types/blockchain.types";
import styles from "./SupplyChainTimeline.module.css";

interface SupplyChainTimelineProps {
  batchId: string;
  showVerification?: boolean;
}

export const SupplyChainTimeline: React.FC<SupplyChainTimelineProps> = ({
  batchId,
  showVerification = true,
}) => {
  const [verification, setVerification] =
    useState<SupplyChainVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        setLoading(true);
        const data = await blockchainApi.getVerifiedSupplyChain(batchId);
        setVerification(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Verification failed");
        setVerification(null);
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      verify();
    }
  }, [batchId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Verifying blockchain supply chain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>⚠️ Verification Failed</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className={styles.container}>
        <div className={styles.noData}>
          <p>No supply chain data available for this batch</p>
        </div>
      </div>
    );
  }

  const stageColors: Record<string, string> = {
    CREATED: "#2dd4a0",
    IN_TRANSIT: "#4f8ef7",
    RECEIVED: "#f5a623",
    QUALITY_CHECK: "#b07af5",
    STORED: "#38bdf8",
    SOLD: "#86efac",
    REJECTED: "#f05252",
    EXPIRED: "#4e5370",
  };

  return (
    <div className={styles.container}>
      {showVerification && (
        <div
          className={
            verification.isValid
              ? styles.verificationValid
              : styles.verificationInvalid
          }
        >
          <div className={styles.verificationHeader}>
            <div className={styles.badgeIcon}>
              {verification.isValid ? "✓" : "✗"}
            </div>
            <div>
              <h3>
                {verification.isValid ? "Chain Verified" : "Chain Invalid"}
              </h3>
              <p>{verification.message}</p>
            </div>
          </div>
          {verification.merkleRoot && (
            <div className={styles.merkleRoot}>
              <strong>Merkle Root</strong>
              <code>{verification.merkleRoot.substring(0, 48)}...</code>
            </div>
          )}
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Events</span>
          <span className={styles.statValue}>{verification.eventCount}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Chain Status</span>
          <span className={styles.statValue}>
            {verification.isValid ? "Authentic" : "Tampered"}
          </span>
        </div>
      </div>

      <div className={styles.timeline}>
        <div className={styles.timelineHeader}>
          <h4>Supply Chain Journey</h4>
        </div>

        {verification.events.map((event, index) => (
          <div
            key={event.id}
            className={styles.timelineItem}
            style={{
              borderLeft: `3px solid ${stageColors[event.stage] ?? "#4e5370"}`,
            }}
          >
            <div
              className={styles.timelineMarker}
              style={{ background: stageColors[event.stage] ?? "#4e5370" }}
            >
              {index + 1}
            </div>

            <div className={styles.timelineContent}>
              <div className={styles.eventHeader}>
                <span
                  className={styles.stage}
                  style={{ background: stageColors[event.stage] ?? "#4e5370" }}
                >
                  {event.stage}
                </span>
                <span className={styles.timestamp}>
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>

              <div className={styles.eventDetails}>
                {event.location && (
                  <div className={styles.detail}>
                    <strong>📍 Location</strong> {event.location}
                  </div>
                )}

                <div className={styles.detail}>
                  <strong>👤 Handler</strong> {event.actorRole}
                </div>

                {event.qualityScore !== undefined &&
                  event.qualityScore !== null && (
                    <div className={styles.detail}>
                      <strong>⭐ Quality</strong> {event.qualityScore}/100
                    </div>
                  )}

                {event.temperatureC !== undefined &&
                  event.temperatureC !== null && (
                    <div className={styles.detail}>
                      <strong>🌡️ Temp</strong> {event.temperatureC}°C
                    </div>
                  )}

                {event.humidityPercent !== undefined &&
                  event.humidityPercent !== null && (
                    <div className={styles.detail}>
                      <strong>💧 Humidity</strong> {event.humidityPercent}%
                    </div>
                  )}

                {event.notes && (
                  <div className={styles.detail}>
                    <strong>📝 Notes</strong> {event.notes}
                  </div>
                )}
              </div>

              <div className={styles.hashInfo}>
                <div className={styles.hashLine}>
                  <span className={styles.hashLabel}>Hash</span>
                  <code className={styles.hash}>
                    {event.eventHash.substring(0, 24)}...
                  </code>
                  <span className={styles.verified}>✓</span>
                </div>

                {event.previousEventHash && (
                  <div className={styles.hashLine}>
                    <span className={styles.hashLabel}>Prev</span>
                    <code className={styles.hash}>
                      {event.previousEventHash.substring(0, 24)}...
                    </code>
                  </div>
                )}

                {index === 0 && (
                  <div className={styles.genesisMarker}>⛓ Chain Origin</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.note}>
          🔐 Verified via blockchain. Any modification to previous events breaks
          subsequent hashes — tampering is immediately detectable.
        </p>
      </div>
    </div>
  );
};
