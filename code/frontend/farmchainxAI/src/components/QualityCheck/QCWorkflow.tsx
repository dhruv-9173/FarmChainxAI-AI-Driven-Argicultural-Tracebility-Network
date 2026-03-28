import React, { useState, useEffect } from "react";
import {
  getPendingQCItems,
  initiateQualityCheck,
  approveQualityCheck,
  rejectQualityCheck,
} from "../../api/qualityCheckApi";
import styles from "./QCWorkflow.module.css";

interface QCBatch {
  batchId: string;
  cropType: string;
  variety: string;
  quantity: number;
  quantityUnit: string;
  status: string;
}

interface QCApprovalForm {
  color: "GOOD" | "FAIR" | "POOR";
  texture: "GOOD" | "FAIR" | "POOR";
  smell: "NORMAL" | "MILD" | "STRONG";
  pestInfestation: boolean;
  moldPresence: boolean;
  foreignMatter: boolean;
  finalNotes: string;
}

interface Props {
  token: string;
  onQCComplete?: () => void;
}

export const QCWorkflow: React.FC<Props> = ({ token, onQCComplete }) => {
  const [pendingItems, setPendingItems] = useState<QCBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<QCBatch | null>(null);
  const [step, setStep] = useState<
    "list" | "initiate" | "assess" | "rejectConfirm" | "success"
  >("list");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [approvalForm, setApprovalForm] = useState<QCApprovalForm>({
    color: "GOOD",
    texture: "GOOD",
    smell: "NORMAL",
    pestInfestation: false,
    moldPresence: false,
    foreignMatter: false,
    finalNotes: "",
  });
  const [rejectionReason, setRejectionReason] = useState("");

  // Load pending QC items
  useEffect(() => {
    const loadPendingItems = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getPendingQCItems(token);
        setPendingItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load pending QC items");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPendingItems();
  }, [token]);

  const handleInitiate = async (batch: QCBatch) => {
    if (!token) return;
    setLoading(true);
    try {
      await initiateQualityCheck(token, batch.batchId, {
        notes: "Quality check initiated",
      });
      setSelectedBatch(batch);
      setStep("assess");
    } catch (err) {
      setError("Failed to initiate quality check");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate a preview quality score based on form
  const calculateQualityScore = () => {
    let score = 100;
    if (approvalForm.color !== "GOOD") score -= approvalForm.color === "FAIR" ? 5 : 10;
    if (approvalForm.texture !== "GOOD") score -= approvalForm.texture === "FAIR" ? 5 : 10;
    if (approvalForm.smell !== "NORMAL") score -= 15;
    if (approvalForm.pestInfestation) score -= 20;
    if (approvalForm.moldPresence) score -= 20;
    if (approvalForm.foreignMatter) score -= 15;
    return Math.max(0, Math.round(score));
  };

  const handleApprove = async () => {
    if (!selectedBatch || !token) return;
    setLoading(true);
    try {
      await approveQualityCheck(token, selectedBatch.batchId, approvalForm);
      setError("");
      setStep("success");
      onQCComplete?.();
      // Remove from pending list locally so it doesn't show up again
      setPendingItems(prev => prev.filter(item => item.batchId !== selectedBatch.batchId));
      // Reset
      setTimeout(() => {
        setSelectedBatch(null);
        setStep("list");
        setApprovalForm({
          color: "GOOD",
          texture: "GOOD",
          smell: "NORMAL",
          pestInfestation: false,
          moldPresence: false,
          foreignMatter: false,
          finalNotes: "",
        });
      }, 2000);
    } catch (err) {
      setError("Failed to approve quality check");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBatch || !token || !rejectionReason) return;
    setLoading(true);
    try {
      await rejectQualityCheck(token, selectedBatch.batchId, {
        rejectionReason,
      });
      setError("");
      setStep("success");
      onQCComplete?.();
      // Remove from pending list locally so it doesn't show up again
      setPendingItems(prev => prev.filter(item => item.batchId !== selectedBatch.batchId));
      // Reset
      setTimeout(() => {
        setSelectedBatch(null);
        setStep("list");
        setRejectionReason("");
      }, 2000);
    } catch (err) {
      setError("Failed to reject batch");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>⚠️ {error}</div>}

      {/* ── List View ───────────────────────────────────────── */}
      {step === "list" && (
        <div className={styles.listView}>
          <div className={styles.listHeader}>
            <h2>🔬 Quality Inspection Queue</h2>
            <p>Batches awaiting quality verification before transfer</p>
          </div>
          <div className={styles.listBody}>
            {loading && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>⏳</div>
                <h3>Loading batches...</h3>
              </div>
            )}
            {!loading && pendingItems.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✅</div>
                <h3>All clear!</h3>
                <p>No batches are currently awaiting quality inspection.</p>
              </div>
            )}
            {!loading && pendingItems.length > 0 && (
              <div className={styles.batchCardGrid}>
                {pendingItems.map((item) => (
                  <div key={item.batchId} className={styles.batchListCard}>
                    <div className={styles.batchListCardInfo}>
                      <div className={styles.batchListCardTitle}>
                        🌾 {item.cropType}{item.variety ? ` · ${item.variety}` : ""}
                      </div>
                      <div className={styles.batchListCardMeta}>
                        <span>📦 {item.quantity} {item.quantityUnit}</span>
                        <span>🏷️ ID: {item.batchId.slice(0, 16)}…</span>
                        <span className={styles.statusPill}>{item.status}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInitiate(item)}
                      className={styles.initiateBtn}
                      disabled={loading}
                    >
                      {loading ? "Starting…" : "▶ Start Inspection"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Assessment View ──────────────────────────────────── */}
      {step === "assess" && selectedBatch && (
        <div className={styles.assessmentView}>
          <div className={styles.assessHeader}>
            <h2>🔬 Quality Assessment</h2>
            <p>Inspect the batch and record your observations below</p>
          </div>
          <div className={styles.assessBody}>
            {/* Batch info stripe */}
            <div className={styles.batchInfoStripe}>
              <div className={styles.batchInfoItem}>
                <span className={styles.batchInfoLabel}>Crop</span>
                <span className={styles.batchInfoValue}>{selectedBatch.cropType}</span>
              </div>
              {selectedBatch.variety && (
                <div className={styles.batchInfoItem}>
                  <span className={styles.batchInfoLabel}>Variety</span>
                  <span className={styles.batchInfoValue}>{selectedBatch.variety}</span>
                </div>
              )}
              <div className={styles.batchInfoItem}>
                <span className={styles.batchInfoLabel}>Quantity</span>
                <span className={styles.batchInfoValue}>{selectedBatch.quantity} {selectedBatch.quantityUnit}</span>
              </div>
              <div className={styles.batchInfoItem}>
                <span className={styles.batchInfoLabel}>Batch ID</span>
                <span className={styles.batchInfoValue} style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {selectedBatch.batchId.slice(0, 20)}…
                </span>
              </div>
            </div>

            {/* Quality Parameters Grid */}
            <div className={styles.formGrid}>
              <div className={styles.parameterGroup}>
                <label>🎨 Color Quality</label>
                <select
                  value={approvalForm.color}
                  onChange={(e) =>
                    setApprovalForm({ ...approvalForm, color: e.target.value as "GOOD" | "FAIR" | "POOR" })
                  }
                  className={styles.slider}
                >
                  <option value="GOOD">Good ✅</option>
                  <option value="FAIR">Fair ⚠️</option>
                  <option value="POOR">Poor ❌</option>
                </select>
              </div>

              <div className={styles.parameterGroup}>
                <label>🤲 Texture Quality</label>
                <select
                  value={approvalForm.texture}
                  onChange={(e) =>
                    setApprovalForm({ ...approvalForm, texture: e.target.value as "GOOD" | "FAIR" | "POOR" })
                  }
                  className={styles.slider}
                >
                  <option value="GOOD">Good ✅</option>
                  <option value="FAIR">Fair ⚠️</option>
                  <option value="POOR">Poor ❌</option>
                </select>
              </div>

              <div className={styles.parameterGroup}>
                <label>👃 Smell / Odour</label>
                <select
                  value={approvalForm.smell}
                  onChange={(e) =>
                    setApprovalForm({ ...approvalForm, smell: e.target.value as "NORMAL" | "MILD" | "STRONG" })
                  }
                  className={styles.slider}
                >
                  <option value="NORMAL">Normal ✅</option>
                  <option value="MILD">Mild Odour ⚠️</option>
                  <option value="STRONG">Strong Odour ❌</option>
                </select>
              </div>
            </div>

            <hr className={styles.divider} />

            {/* Defect Detection */}
            <div className={styles.defectsSection}>
              <h4>🚨 Defect Detection <small style={{ fontWeight: 400, color: "#9ca3af" }}>— Check all that apply</small></h4>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={approvalForm.pestInfestation}
                    onChange={(e) => setApprovalForm({ ...approvalForm, pestInfestation: e.target.checked })}
                  />
                  🐛 Pest Infestation
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={approvalForm.moldPresence}
                    onChange={(e) => setApprovalForm({ ...approvalForm, moldPresence: e.target.checked })}
                  />
                  🍄 Mold / Fungus
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={approvalForm.foreignMatter}
                    onChange={(e) => setApprovalForm({ ...approvalForm, foreignMatter: e.target.checked })}
                  />
                  🪨 Foreign Matter
                </label>
              </div>
            </div>

            <hr className={styles.divider} />

            {/* Live Score Preview */}
            {(() => {
              const score = calculateQualityScore();
              const scoreClass = score >= 70 ? styles.scoreGood : score >= 50 ? styles.scoreMid : styles.scorePoor;
              return (
                <div className={styles.scorePreview}>
                  <div className={styles.scorePreviewLeft}>
                    <p>Estimated Quality Score</p>
                    <small>{score >= 70 ? "✅ Batch will PASS quality check" : "❌ Batch will FAIL quality check"}</small>
                  </div>
                  <div className={`${styles.scoreBadge} ${scoreClass}`}>{score}</div>
                </div>
              );
            })()}

            {/* Notes */}
            <div className={styles.formGroup}>
              <label>📝 Inspector Notes (optional)</label>
              <textarea
                value={approvalForm.finalNotes}
                onChange={(e) => setApprovalForm({ ...approvalForm, finalNotes: e.target.value })}
                placeholder="Add any additional observations or notes..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button onClick={handleApprove} className={styles.approveBtn} disabled={loading}>
                {loading ? "Processing..." : "✓ Approve & Pass Batch"}
              </button>
              <button onClick={() => setStep("rejectConfirm")} className={styles.rejectInitBtn} disabled={loading}>
                ✕ Reject Batch
              </button>
              <button onClick={() => { setSelectedBatch(null); setStep("list"); }} className={styles.cancelBtn} disabled={loading}>
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Confirm View ──────────────────────────────── */}
      {step === "rejectConfirm" && selectedBatch && (
        <div className={styles.decisionView}>
          <div className={styles.rejectHeader}>
            <h2>✕ Reject Batch</h2>
            <p>This will mark the batch as rejected and notify the farmer.</p>
          </div>
          <div className={styles.rejectBody}>
            <div className={styles.warningBox}>
              <p>⚠️ You are about to reject: <strong>{selectedBatch.cropType}{selectedBatch.variety ? ` (${selectedBatch.variety})` : ""}</strong></p>
            </div>
            <div className={styles.formGroup}>
              <label>Rejection Reason <span style={{ color: "#ef4444" }}>*</span></label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Describe why this batch fails quality standards..."
                rows={4}
                className={styles.reasonInput}
              />
            </div>
            <div className={styles.actionButtons}>
              <button
                onClick={handleReject}
                className={styles.confirmRejectBtn}
                disabled={loading || !rejectionReason.trim()}
              >
                {loading ? "Processing..." : "Confirm Rejection"}
              </button>
              <button
                onClick={() => { setStep("assess"); setRejectionReason(""); }}
                className={styles.backBtn}
                disabled={loading}
              >
                ← Back to Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success View ───────────────────────────────────�export default QCWorkflow;
nt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {step === "success" && (
        <div className={styles.successMessage}>
          <div className={styles.checkmark}>✓</div>
          <h3>Quality Check Complete</h3>
          <p>Batch assessment has been recorded successfully.</p>
        </div>
      )}
    </div>
  );
};

export default QCWorkflow;
