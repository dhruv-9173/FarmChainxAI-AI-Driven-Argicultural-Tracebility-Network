import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { DistributorBatch } from "../../types/distributor.types";
import { useTransfer } from "../../../../hooks/useTransfer";
import type { TransferableBatch } from "../../../../types/transfer.types";
import {
  getRecipientsByRole,
  searchUsers,
  initiateDistributorTransfer,
  type BatchTransferResponse,
  type TransferRecipientDto,
  type TransferRole,
} from "../../../transfer/api/transferApi";
import StepRecipientType from "./StepRecipientType";
import StepSelectRecipient from "./StepSelectRecipient";
import StepChooseBatch from "./StepChooseBatch";
import StepConfirm from "./StepConfirm";
import TransferOutSuccessScreen from "./TransferOutSuccessScreen";
import styles from "./TransferOutModal.module.css";

const STEP_LABELS = [
  "Recipient Type",
  "Select Recipient",
  "Choose Batch",
  "Confirm",
] as const;

interface Props {
  batch?: DistributorBatch; // Made optional to support batch selection
  onClose: () => void;
  onTransferComplete: (
    transfer: BatchTransferResponse,
    recipient: TransferRecipientDto
  ) => void;
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function TransferOutModal({
  batch: preselectedBatch,
  onClose,
  onTransferComplete,
}: Props) {
  const { fetchTransferableBatches } = useTransfer();

  const [step, setStep] = useState(0);
  const [recipientType, setRecipientType] = useState<
    "Retailer" | "Consumer" | null
  >(null);
  const [selectedRecipient, setSelectedRecipient] =
    useState<TransferRecipientDto | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<TransferableBatch | null>(
    null
  );
  const [availableBatches, setAvailableBatches] = useState<TransferableBatch[]>(
    []
  );
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesError, setBatchesError] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [recipients, setRecipients] = useState<TransferRecipientDto[]>([]);
  const [search, setSearch] = useState("");
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [transferResult, setTransferResult] =
    useState<BatchTransferResponse | null>(null);

  const hasPreselectedBatch = Boolean(preselectedBatch);
  const toTransferRole = (type: "Retailer" | "Consumer"): TransferRole =>
    type === "Retailer" ? "RETAILER" : "CONSUMER";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // Fetch available batches when no batch is preselected
  useEffect(() => {
    if (hasPreselectedBatch) return; // Skip if batch is already selected

    const fetchBatches = async () => {
      setBatchesLoading(true);
      setBatchesError("");
      try {
        // Distributor can transfer batches that are received or have passed quality check
        const batches = await fetchTransferableBatches();
        setAvailableBatches(batches);
      } catch (err: unknown) {
        setBatchesError(
          err instanceof Error
            ? err.message
            : "Failed to load available batches"
        );
        setAvailableBatches([]);
      } finally {
        setBatchesLoading(false);
      }
    };

    fetchBatches();
  }, [fetchTransferableBatches, hasPreselectedBatch]);

  useEffect(() => {
    if (!recipientType) return;

    let cancelled = false;
    const role = toTransferRole(recipientType);

    const fetchRecipients = async () => {
      setLoadingRecipients(true);
      setRecipientError("");
      try {
        const data = search.trim()
          ? await searchUsers(role, search.trim())
          : await getRecipientsByRole(role);
        if (!cancelled) setRecipients(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setRecipients([]);
          setRecipientError(
            err instanceof Error ? err.message : "Failed to load recipients"
          );
        }
      } finally {
        if (!cancelled) setLoadingRecipients(false);
      }
    };

    const timer = window.setTimeout(fetchRecipients, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [recipientType, search]);

  function handleRecipientTypeSelect(type: "Retailer" | "Consumer") {
    setSearch("");
    setSelectedRecipient(null);
    setSubmitError("");
    setRecipientType(type);
    setStep(1);
  }

  function handleRecipientSelect(r: TransferRecipientDto) {
    setSubmitError("");
    setSelectedRecipient(r);
    // Skip batch selection if batch is preselected
    setStep(hasPreselectedBatch ? 3 : 2);
  }

  function handleBatchSelect(batch: TransferableBatch) {
    setSelectedBatch(batch);
  }

  function handleNextFromBatchSelection() {
    if (selectedBatch) {
      setStep(3);
    }
  }

  async function handleConfirm() {
    if (!selectedRecipient || !selectedBatch) return;

    setConfirming(true);

    try {
      const recipientRole = recipientType
        ? toTransferRole(recipientType)
        : null;
      if (!recipientRole) {
        throw new Error(
          "Validation failed: Distributor can transfer only to RETAILER or CONSUMER"
        );
      }
      if (selectedRecipient.role !== recipientRole) {
        throw new Error(
          "Validation failed: Selected recipient role does not match recipient type"
        );
      }

      const transfer = await initiateDistributorTransfer({
        batchId: selectedBatch.id,
        recipientId: selectedRecipient.id,
        recipientRole,
        note: note.trim() || undefined,
      });

      onTransferComplete(transfer, selectedRecipient);
      setTransferResult(transfer);
      setDone(true);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to initiate transfer"
      );
    } finally {
      setConfirming(false);
    }
  }

  function handleTransferAnother() {
    setStep(0);
    setRecipientType(null);
    setSelectedRecipient(null);
    setSelectedBatch(null);
    setBatchesError("");
    setNote("");
    setDone(false);
    setSearch("");
    setRecipientError("");
    setSubmitError("");
    setTransferResult(null);
  }

  // Determine visible step labels (skip batch selection if preselected)
  const visibleStepLabels = hasPreselectedBatch
    ? STEP_LABELS.filter((_, i) => i !== 2) // Remove "Choose Batch"
    : STEP_LABELS;

  // Map logical step to visible step index
  const getVisibleStep = (logicalStep: number): number => {
    if (!hasPreselectedBatch) return logicalStep;
    if (logicalStep <= 1) return logicalStep;
    return logicalStep - 1; // step 3 → visible index 2 when batch selection is skipped
  };

  const visibleStep = getVisibleStep(step);

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {done && selectedRecipient && transferResult && selectedBatch ? (
          <TransferOutSuccessScreen
            batch={{
              ...selectedBatch,
              quantity: `${selectedBatch.quantity} ${selectedBatch.quantityUnit}`,
              status: "Transferred" as const,
              farmerName: "Unknown",
              farmerId: "Unknown",
              farmLocation: selectedBatch.farmCity || "Unknown",
              receivedAt: new Date().toISOString().split("T")[0],
              transferredTo: selectedRecipient.fullName,
              transferredAt: new Date().toISOString().split("T")[0],
              recipientType:
                recipientType === "Retailer" ? "Retailer" : "Consumer",
              shelfLifeDays: selectedBatch.expectedShelfLifeDays,
              shelfLifePercent: Math.round(
                (selectedBatch.currentShelfLifeDays /
                  selectedBatch.expectedShelfLifeDays) *
                  100
              ),
              qualityGrade: selectedBatch.qualityGrade || "A",
            }}
            recipient={selectedRecipient}
            transfer={transferResult}
            onClose={onClose}
            onTransferAnother={handleTransferAnother}
          />
        ) : (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div>
                <h2 className={styles.title}>Transfer Batch Out</h2>
                <p className={styles.subtitle}>
                  {selectedBatch ? (
                    <>
                      Sending{" "}
                      <strong style={{ fontFamily: "monospace" }}>
                        {selectedBatch.id}
                      </strong>{" "}
                      — {selectedBatch.cropType}, {selectedBatch.quantity}{" "}
                      {selectedBatch.quantityUnit}
                    </>
                  ) : (
                    "Select a batch and recipient to transfer"
                  )}
                </p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close"
              >
                <svg
                  width="30"
                  height="30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Step progress */}
            <div className={styles.stepBar}>
              {visibleStepLabels.map((label, i) => (
                <div key={label} className={styles.stepItem}>
                  <div
                    className={`${styles.stepCircle} ${
                      i < visibleStep
                        ? styles.stepDone
                        : i === visibleStep
                        ? styles.stepActive
                        : ""
                    }`}
                  >
                    {i < visibleStep ? <CheckIcon /> : i + 1}
                  </div>
                  <span
                    className={`${styles.stepLabel} ${
                      i === visibleStep
                        ? styles.stepLabelActive
                        : i < visibleStep
                        ? styles.stepLabelDone
                        : ""
                    }`}
                  >
                    {label}
                  </span>
                  {i < visibleStepLabels.length - 1 && (
                    <div
                      className={`${styles.stepLine} ${
                        i < visibleStep ? styles.stepLineDone : ""
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className={styles.content}>
              {step === 0 && (
                <StepRecipientType
                  selected={recipientType}
                  onSelect={handleRecipientTypeSelect}
                />
              )}
              {step === 1 && recipientType && (
                <StepSelectRecipient
                  recipientType={recipientType}
                  recipients={recipients}
                  search={search}
                  onSearchChange={setSearch}
                  loading={loadingRecipients}
                  error={recipientError}
                  onSelect={handleRecipientSelect}
                />
              )}
              {step === 2 && !hasPreselectedBatch && (
                <StepChooseBatch
                  batches={availableBatches}
                  selectedBatch={selectedBatch}
                  onSelect={handleBatchSelect}
                  loading={batchesLoading}
                  error={batchesError}
                />
              )}
              {step === 3 && selectedRecipient && selectedBatch && (
                <StepConfirm
                  batch={{
                    ...selectedBatch,
                    quantity: `${selectedBatch.quantity} ${selectedBatch.quantityUnit}`,
                    status: "Accepted" as const,
                    farmerName: "Unknown",
                    farmerId: "Unknown",
                    farmLocation: selectedBatch.farmCity || "Unknown",
                    receivedAt: new Date().toISOString().split("T")[0],
                    shelfLifeDays: selectedBatch.expectedShelfLifeDays,
                    shelfLifePercent: Math.round(
                      (selectedBatch.currentShelfLifeDays /
                        selectedBatch.expectedShelfLifeDays) *
                        100
                    ),
                    qualityScore: selectedBatch.qualityScore,
                    qualityGrade: selectedBatch.qualityGrade || "A",
                  }}
                  recipient={selectedRecipient}
                  note={note}
                  onNoteChange={setNote}
                  onConfirm={handleConfirm}
                  confirming={confirming}
                />
              )}
              {submitError && (
                <p
                  style={{
                    marginTop: 12,
                    marginBottom: 0,
                    color: "#B91C1C",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {submitError}
                </p>
              )}
            </div>

            {/* Footer nav */}
            <div className={styles.footer}>
              {step === 0 ? (
                <button className={styles.cancelBtn} onClick={onClose}>
                  Cancel
                </button>
              ) : (
                <button
                  className={styles.backBtn}
                  onClick={() => {
                    if (step === 3 && hasPreselectedBatch) {
                      setStep(1); // Skip back over batch selection
                    } else {
                      setStep((s) => s - 1);
                    }
                  }}
                  disabled={confirming}
                >
                  ← Back
                </button>
              )}
              <div className={styles.footerRight}>
                <span className={styles.stepCounter}>
                  Step {visibleStep + 1} of {visibleStepLabels.length}
                </span>
                {step === 2 && !hasPreselectedBatch && (
                  <button
                    className={styles.nextBtn}
                    onClick={handleNextFromBatchSelection}
                    disabled={!selectedBatch}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: !selectedBatch ? "#E5E7EB" : "#2563EB",
                      color: !selectedBatch ? "#9CA3AF" : "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: !selectedBatch ? "not-allowed" : "pointer",
                      marginLeft: "12px",
                    }}
                  >
                    Next →
                  </button>
                )}
                {step === 3 && selectedRecipient && selectedBatch && (
                  <button
                    className={styles.nextBtn}
                    onClick={handleConfirm}
                    disabled={confirming}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: confirming ? "#E5E7EB" : "#16A34A",
                      color: confirming ? "#9CA3AF" : "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: confirming ? "not-allowed" : "pointer",
                      marginLeft: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {confirming ? "Processing..." : "Confirm Transfer"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
