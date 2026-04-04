import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Batch, RecipientType } from "../../../../types/dashboard.types";
import {
  getRecipientsByRole,
  searchUsers,
  initiateFarmerTransfer,
  type TransferRecipientDto,
  type TransferRole,
  type BatchTransferResponse,
} from "../../../transfer/api/transferApi";
import { getTransferableBatches } from "../../../../api/transferApi";
import styles from "./TransferBatchModal.module.css";

/* ── Sub-components ── */
import StepRecipientType from "./StepRecipientType";
import StepSelectRecipient from "./StepSelectRecipient";
import StepChooseBatch from "./StepChooseBatch";
import StepConfirm from "./StepConfirm";
import TransferSuccessScreen from "./TransferSuccessScreen";

interface Props {
  onClose: () => void;
  onTransferComplete: (
    transfer: BatchTransferResponse,
    recipient: TransferRecipientDto
  ) => void;
  batches: Batch[];
  preselectedBatch?: Batch | null;
}

const ALL_STEPS = [
  "Recipient Type",
  "Select Recipient",
  "Choose Batch",
  "Confirm",
] as const;

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export default function TransferBatchModal({
  onClose,
  onTransferComplete,
  batches,
  preselectedBatch,
}: Props) {
  // logical step: 0=RecipientType, 1=SelectRecipient, 2=ChooseBatch, 3=Confirm
  // When preselectedBatch is set, step 2 is skipped
  const [step, setStep] = useState(0);
  const [recipientType, setRecipientType] = useState<RecipientType | null>(
    null
  );
  const [selectedRecipient, setSelectedRecipient] =
    useState<TransferRecipientDto | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(
    preselectedBatch ?? null
  );
  const [note, setNote] = useState("");
  const [transferPrice, setTransferPrice] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [allRecipients, setAllRecipients] = useState<TransferRecipientDto[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transferResult, setTransferResult] =
    useState<BatchTransferResponse | null>(null);

  // ── Batch fetching for transfer ──
  const [transferableBatches, setTransferableBatches] = useState<Batch[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState("");

  const toTransferRole = (type: RecipientType): TransferRole => {
    if (type === "Distributor") return "DISTRIBUTOR";
    if (type === "Retailer") return "RETAILER";
    return "CONSUMER";
  };

  useEffect(() => {
    if (!recipientType) return;

    let cancelled = false;
    const role = toTransferRole(recipientType);

    const fetchRecipients = async () => {
      setRecipientLoading(true);
      setRecipientError("");

      try {
        const recipients = searchQuery.trim()
          ? await searchUsers(role, searchQuery.trim())
          : await getRecipientsByRole(role);
        if (!cancelled) setAllRecipients(recipients);
      } catch (err: unknown) {
        if (!cancelled) {
          setAllRecipients([]);
          setRecipientError(
            err instanceof Error
              ? err.message
              : "Failed to load recipients for transfer"
          );
        }
      } finally {
        if (!cancelled) setRecipientLoading(false);
      }
    };

    const timer = window.setTimeout(fetchRecipients, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [recipientType, searchQuery]);

  const hasPreselect = Boolean(preselectedBatch);

  // Build visible step list (skip step index 2 when preselected)
  const visibleSteps = hasPreselect
    ? ALL_STEPS.filter((_, i) => i !== 2)
    : [...ALL_STEPS];

  // Map logical step → visible step index
  const logicalToVisible = (logicalStep: number): number => {
    if (!hasPreselect) return logicalStep;
    if (logicalStep <= 1) return logicalStep;
    return logicalStep - 1; // step 3 → visible index 2
  };

  const visibleStep = logicalToVisible(step);

  /* ── Side effects ── */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // fetch harvested batches for transfer (batches that belong to this farmer)
  useEffect(() => {
    let cancelled = false;

    const fetchBatches = async () => {
      setBatchLoading(true);
      setBatchError("");

      try {
        // Farmer transfers batches that have been harvested and are ready for distributor
        const data = await getTransferableBatches("HARVESTED", 0, 100);
        if (!cancelled) {
          // Convert TransferableBatch to Batch format for compatibility with UI
          const convertedBatches: Batch[] = data.map((b) => ({
            id: b.id,
            cropType: b.cropType,
            variety: b.variety || "",
            quantity: b.quantity.toString(),
            qualityScore: b.qualityScore,
            status: "PENDING" as const,
            farmerName: b.farmCity || "",
            location: b.farmState || "",
            createdAt: b.createdAt,
            shelfLifeDays: b.expectedShelfLifeDays || 0,
            shelfLifePercent: 100,
            organic: b.organic || false,
            gapCertified: b.gapCertified || false,
            basePrice: b.basePrice,
            marketPrice: b.marketPrice,
            cropImagePreview: "",
          }));
          setTransferableBatches(convertedBatches);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setTransferableBatches([]);
          setBatchError(
            err instanceof Error
              ? err.message
              : "Failed to load batches available for transfer"
          );
        }
      } finally {
        if (!cancelled) setBatchLoading(false);
      }
    };

    // Only fetch if we don't have a preselected batch
    if (!preselectedBatch) {
      fetchBatches();
    }

    return () => {
      cancelled = true;
    };
  }, [preselectedBatch]);

  /* ── Navigation ── */
  const goNext = () => {
    if (step === 1 && hasPreselect) {
      setStep(3); // skip choose-batch
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const goBack = () => {
    if (step === 3 && hasPreselect) {
      setStep(1); // skip back over choose-batch
    } else {
      setStep((s) => Math.max(s - 1, 0));
    }
  };

  const handleSelectRecipientType = (type: RecipientType) => {
    setSearchQuery("");
    setSelectedRecipient(null);
    setSubmitError("");
    setRecipientType(type);
    goNext();
  };

  const handleSelectRecipient = (r: TransferRecipientDto) => {
    setSubmitError("");
    setSelectedRecipient(r);
    goNext();
  };

  const handleSelectBatch = (b: Batch) => {
    setSelectedBatch(b);
  };

  const handleConfirm = async () => {
    if (!selectedBatch || !selectedRecipient || !recipientType) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const normalizedPrice = Number(transferPrice);
      if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
        throw new Error("Enter a valid transfer price greater than 0.");
      }

      const recipientRole = toTransferRole(recipientType);
      if (selectedRecipient.role !== recipientRole) {
        throw new Error(
          "Validation failed: Selected recipient role does not match the chosen recipient type"
        );
      }

      const response = await initiateFarmerTransfer({
        batchId: selectedBatch.id,
        recipientId: selectedRecipient.id,
        recipientRole,
        note: note.trim() || undefined,
        transferPrice: normalizedPrice,
      });
      onTransferComplete(response, selectedRecipient);
      setTransferResult(response);
      setConfirmed(true);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to initiate transfer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferAnother = () => {
    setStep(0);
    setRecipientType(null);
    setSelectedRecipient(null);
    setSelectedBatch(preselectedBatch ?? null);
    setNote("");
    setTransferPrice("");
    setConfirmed(false);
    setSearchQuery("");
    setRecipientError("");
    setSubmitError("");
    setSubmitting(false);
    setTransferResult(null);
  };

  const activeBatches =
    transferableBatches.length > 0
      ? transferableBatches
      : batches.filter((b) => b.status === "PENDING" || b.status === "Pending");

  /* ── Render ── */
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {confirmed && selectedBatch && selectedRecipient && transferResult ? (
          <TransferSuccessScreen
            batchId={selectedBatch.id}
            recipient={selectedRecipient}
            transfer={transferResult}
            onViewBatch={onClose}
            onTransferAnother={handleTransferAnother}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerText}>
                <h2 className={styles.title}>Transfer Batch</h2>
                <p className={styles.subtitle}>
                  {step === 0 &&
                    "Select who you want to transfer this batch to"}
                  {step === 1 &&
                    `Select a ${recipientType ?? "recipient"} to transfer to`}
                  {step === 2 && "Choose a pending batch to transfer"}
                  {step === 3 && "Review and confirm the transfer details"}
                </p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                title="Close (Esc)"
              >
                <svg
                  width="30"
                  height="30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Stepper */}
            <div className={styles.stepper}>
              {visibleSteps.map((label, i) => (
                <div
                  key={label}
                  className={`${styles.stepItem} ${
                    i === visibleStep ? styles.stepActive : ""
                  } ${i < visibleStep ? styles.stepDone : ""}`}
                >
                  <span className={styles.stepCircle}>
                    {i < visibleStep ? <CheckIcon /> : i + 1}
                  </span>
                  <span className={styles.stepLabel}>{label}</span>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className={styles.body}>
              {step === 0 && (
                <StepRecipientType
                  selected={recipientType}
                  onSelect={handleSelectRecipientType}
                />
              )}
              {step === 1 && recipientType && (
                <StepSelectRecipient
                  recipientType={recipientType}
                  recipients={allRecipients}
                  search={searchQuery}
                  onSearchChange={setSearchQuery}
                  loading={recipientLoading}
                  error={recipientError}
                  onSelect={handleSelectRecipient}
                />
              )}
              {step === 2 && (
                <>
                  {batchLoading && (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#6B7280",
                        paddingTop: 20,
                      }}
                    >
                      Loading batches...
                    </p>
                  )}
                  {batchError && (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#B91C1C",
                        paddingTop: 20,
                        fontSize: "0.9rem",
                      }}
                    >
                      ⚠️ {batchError}
                    </p>
                  )}
                  {!batchLoading && !batchError && (
                    <StepChooseBatch
                      batches={activeBatches}
                      selectedBatch={selectedBatch}
                      onSelect={handleSelectBatch}
                    />
                  )}
                </>
              )}
              {step === 3 &&
                selectedBatch &&
                selectedRecipient &&
                recipientType && (
                  <StepConfirm
                    batch={selectedBatch}
                    recipient={selectedRecipient}
                    recipientType={recipientType}
                    note={note}
                    onNoteChange={setNote}
                    transferPrice={transferPrice}
                    onTransferPriceChange={setTransferPrice}
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

            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.footerLeft}>
                {step > 0 && (
                  <button
                    className={styles.backBtn}
                    onClick={goBack}
                    type="button"
                  >
                    <ChevronLeft />
                    Back
                  </button>
                )}
              </div>
              <div className={styles.footerRight}>
                <span className={styles.stepCounter}>
                  Step {visibleStep + 1} of {visibleSteps.length}
                </span>
                {step === 2 && (
                  <button
                    className={styles.nextBtn}
                    onClick={goNext}
                    type="button"
                    disabled={!selectedBatch}
                  >
                    Next
                    <ChevronRight />
                  </button>
                )}
                {step === 3 && (
                  <button
                    className={styles.confirmBtn}
                    onClick={handleConfirm}
                    type="button"
                    disabled={
                      !selectedBatch ||
                      !selectedRecipient ||
                      submitting ||
                      !Number.isFinite(Number(transferPrice)) ||
                      Number(transferPrice) <= 0
                    }
                  >
                    <svg
                      width="16"
                      height="16"
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
                    {submitting ? "Submitting..." : "Confirm Transfer"}
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
