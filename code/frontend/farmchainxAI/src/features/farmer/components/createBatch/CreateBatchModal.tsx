import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import type {
  CreateBatchFormData,
  Batch,
  BatchStatus,
} from "../../../../types/dashboard.types";
import {
  createBatch,
  type CreateBatchPayload,
  type FarmerBatchDto,
} from "../../api/farmerApi";
import StepCropDetails from "./StepCropDetails";
import StepFarmInfo from "./StepFarmInfo";
import StepStorageQuality from "./StepStorageQuality";
import SuccessScreen from "./SuccessScreen";
import styles from "./CreateBatchModal.module.css";

interface Props {
  onClose: () => void;
  onBatchCreated: (batch: Batch) => void;
}

const DRAFT_KEY = "fcx_batch_draft";

const INITIAL: CreateBatchFormData = {
  cropType: "",
  cropVariety: "",
  quantity: "",
  quantityUnit: "kg",
  harvestDate: "",
  sowingDate: "",
  qualityGrade: "",
  certifications: [],
  notes: "",
  farmerName: "Rajesh Kumar",
  farmId: "",
  farmCity: "",
  farmState: "",
  fieldArea: "",
  soilType: "",
  irrigationType: "",
  storageType: "",
  storageLocation: "",
  expectedShelfLife: "",
  moistureLevel: "",
  initialQualityScore: "",
  cropImage: null,
  cropImagePreview: "",
};

const STEP_LABELS = ["Crop Details", "Farm Info", "Storage & Quality"];

const BATCH_STATUSES: BatchStatus[] = [
  "PENDING",
  "ACTIVE",
  "TRANSFERRED",
  "RECEIVED",
  "SOLD",
  "REJECTED",
  "EXPIRED",
  "Active",
  "Transferred",
  "Pending",
  "Flagged",
];

const toBatchStatus = (value: unknown): BatchStatus => {
  if (
    typeof value === "string" &&
    BATCH_STATUSES.includes(value as BatchStatus)
  ) {
    return value as BatchStatus;
  }
  return "PENDING";
};

const normalizeCertifications = (
  value: FarmerBatchDto["certifications"] | string[] | undefined,
  fallback: string[]
): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }
  return fallback;
};

/* ── Validation ── */
function validateStep(
  step: number,
  data: CreateBatchFormData
): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 0) {
    if (!data.cropType) e.cropType = "Crop type is required";
    if (!data.cropVariety.trim()) e.cropVariety = "Crop variety is required";
    if (data.quantity === "" || Number(data.quantity) <= 0)
      e.quantity = "Enter a valid quantity";
    if (!data.qualityGrade) e.qualityGrade = "Quality grade is required";
    if (!data.harvestDate) e.harvestDate = "Harvest date is required";
    if (!data.sowingDate) e.sowingDate = "Sowing date is required";
    if (
      data.sowingDate &&
      data.harvestDate &&
      data.sowingDate > data.harvestDate
    ) {
      e.harvestDate = "Harvest date must be on/after sowing date";
    }
  }
  if (step === 1) {
    if (!data.farmId.trim()) e.farmId = "Farm ID is required";
    if (!data.farmCity.trim()) e.farmCity = "City is required";
    if (!data.farmState.trim()) e.farmState = "State is required";
    if (data.fieldArea === "" || Number(data.fieldArea) <= 0)
      e.fieldArea = "Enter a valid field area";
    if (!data.soilType.trim()) e.soilType = "Soil type is required";
    if (!data.irrigationType.trim())
      e.irrigationType = "Irrigation type is required";
  }
  if (step === 2) {
    if (!data.storageType) e.storageType = "Storage type is required";
    if (!data.storageLocation.trim())
      e.storageLocation = "Storage location is required";
    if (data.expectedShelfLife === "" || Number(data.expectedShelfLife) <= 0)
      e.expectedShelfLife = "Enter valid shelf life";
    if (
      data.moistureLevel === "" ||
      Number(data.moistureLevel) < 0 ||
      Number(data.moistureLevel) > 100
    ) {
      e.moistureLevel = "Enter moisture level between 0 and 100";
    }
    if (
      data.initialQualityScore !== "" &&
      (Number(data.initialQualityScore) < 0 ||
        Number(data.initialQualityScore) > 100)
    ) {
      e.initialQualityScore = "Enter score 0-100";
    }
  }
  return e;
}

export default function CreateBatchModal({ onClose, onBatchCreated }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CreateBatchFormData>(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CreateBatchFormData;
        return { ...parsed, cropImage: null, cropImagePreview: "" };
      }
    } catch {
      /* ignore */
    }
    return { ...INITIAL };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  /* Success state */
  const [createdBatchId, setCreatedBatchId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  /* Auto-save draft */
  useEffect(() => {
    const { cropImage: _ci, cropImagePreview: _cp, ...rest } = data;
    void _ci;
    void _cp;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
  }, [data]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* Esc key */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const onChange = useCallback((patch: Partial<CreateBatchFormData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(patch)) delete next[k];
      return next;
    });
  }, []);

  const handleNext = () => {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleCreate = async () => {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setCreating(true);

    try {
      const qty = Number(data.quantity);
      const shelfDays = Number(data.expectedShelfLife);
      const score =
        data.initialQualityScore === "" ? 75 : Number(data.initialQualityScore);
      const fieldArea = Number(data.fieldArea);
      const moisture = Number(data.moistureLevel);

      const payload: CreateBatchPayload = {
        cropType: data.cropType,
        cropVariety: data.cropVariety,
        quantity: qty,
        quantityUnit: data.quantityUnit,
        qualityGrade: data.qualityGrade,
        initialQualityScore: score,
        farmId: data.farmId,
        farmCity: data.farmCity,
        farmState: data.farmState,
        fieldArea,
        soilType: data.soilType,
        irrigationType: data.irrigationType,
        storageType: data.storageType,
        storageLocation: data.storageLocation,
        expectedShelfLife: shelfDays,
        moistureLevel: moisture,
        certifications: data.certifications,
        sowingDate: data.sowingDate,
        harvestDate: data.harvestDate,
        notes: data.notes || undefined,
      };

      const createdBatchFromApi = await createBatch(payload);

      // Auto-generate QR code for the success screen (using the real DB batchId)
      const batchId = createdBatchFromApi.id || `BCH-${Date.now()}`;
      if (createdBatchFromApi.qrCodeBase64) {
        setQrDataUrl(createdBatchFromApi.qrCodeBase64);
      } else {
        try {
          const qr = await QRCode.toDataURL(
            createdBatchFromApi.qrCodeUrl ||
              `https://farmchainx.com/batch/${batchId}`,
            {
              width: 320,
              margin: 2,
              color: { dark: "#166534", light: "#ffffff" },
            }
          );
          setQrDataUrl(qr);
        } catch {
          setQrDataUrl("");
        }
      }

      const newBatch: Batch = {
        id: batchId,
        cropType: createdBatchFromApi.cropType || data.cropType,
        variety: createdBatchFromApi.variety || data.cropVariety,
        quantity: `${createdBatchFromApi.quantity ?? qty} ${
          createdBatchFromApi.quantityUnit ?? data.quantityUnit
        }`,
        qualityScore: createdBatchFromApi.qualityScore ?? score,
        status: toBatchStatus(createdBatchFromApi.status),
        farmerName: data.farmerName,
        createdAt: createdBatchFromApi.createdAt
          ? String(createdBatchFromApi.createdAt).slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        shelfLifeDays:
          createdBatchFromApi.currentShelfLifeDays ??
          createdBatchFromApi.expectedShelfLifeDays ??
          shelfDays,
        shelfLifePercent: 100, // Hardcoded initial
        location: createdBatchFromApi.storageLocation || data.storageLocation,
        basePrice: createdBatchFromApi.basePrice ?? 0,
        marketPrice: createdBatchFromApi.marketPrice ?? 0,
        organic:
          createdBatchFromApi.organic ??
          data.certifications.includes("Organic"),
        gapCertified:
          createdBatchFromApi.gapCertified ??
          data.certifications.some((cert) => cert.includes("GAP")),
        qrDataUrl: "",
        cropImagePreview: data.cropImagePreview,
        farmId: data.farmId,
        farmCity: createdBatchFromApi.farmCity || data.farmCity,
        farmState: createdBatchFromApi.farmState || data.farmState,
        storageType: createdBatchFromApi.storageType || data.storageType,
        certifications: normalizeCertifications(
          createdBatchFromApi.certifications,
          data.certifications
        ),
      };

      onBatchCreated(newBatch);
      localStorage.removeItem(DRAFT_KEY);
      setCreatedBatchId(batchId);
    } catch (err: unknown) {
      console.error("Failed to create batch via API:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create batch";
      setErrors({ global: errorMessage });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAnother = () => {
    setData({ ...INITIAL });
    setStep(0);
    setCreatedBatchId("");
    setQrDataUrl("");
    setErrors({});
  };

  const showSuccess = createdBatchId !== "";

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {showSuccess ? (
          <SuccessScreen
            batchId={createdBatchId}
            qrDataUrl={qrDataUrl}
            onViewBatch={onClose}
            onCreateAnother={handleCreateAnother}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div>
                <h2 className={styles.title}>Create New Batch</h2>
                <p className={styles.subtitle}>
                  Register a new crop batch with full traceability details
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

            {/* Step indicator */}
            <div className={styles.stepper}>
              {STEP_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`${styles.stepItem} ${
                    i === step ? styles.stepActive : ""
                  } ${i < step ? styles.stepDone : ""}`}
                >
                  <span className={styles.stepCircle}>
                    {i < step ? (
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className={styles.stepLabel}>{label}</span>
                </div>
              ))}
            </div>

            {/* Form content */}
            <div className={styles.body}>
              {step === 0 && (
                <StepCropDetails
                  data={data}
                  errors={errors}
                  onChange={onChange}
                />
              )}
              {step === 1 && (
                <StepFarmInfo data={data} errors={errors} onChange={onChange} />
              )}
              {step === 2 && (
                <StepStorageQuality
                  data={data}
                  errors={errors}
                  onChange={onChange}
                />
              )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.footerLeft}>
                {step > 0 && (
                  <button
                    className={styles.backBtn}
                    onClick={handleBack}
                    type="button"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back
                  </button>
                )}
              </div>
              <div className={styles.footerRight}>
                <span className={styles.stepCounter}>
                  Step {step + 1} of {STEP_LABELS.length}
                </span>
                {step < STEP_LABELS.length - 1 ? (
                  <button
                    className={styles.nextBtn}
                    onClick={handleNext}
                    type="button"
                  >
                    Next
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    className={styles.createBtn}
                    onClick={handleCreate}
                    type="button"
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create Batch"}
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
