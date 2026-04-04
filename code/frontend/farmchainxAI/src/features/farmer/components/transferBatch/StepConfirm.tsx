import type { Batch, RecipientType } from "../../../../types/dashboard.types";
import type { TransferRecipientDto } from "../../../transfer/api/transferApi";
import styles from "./TransferBatchModal.module.css";

interface Props {
  batch: Batch;
  recipient: TransferRecipientDto;
  recipientType: RecipientType;
  note: string;
  onNoteChange: (val: string) => void;
  transferPrice: string;
  onTransferPriceChange: (val: string) => void;
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className={styles.summaryRow}>
      <span className={styles.summaryLabel}>{label}</span>
      <span className={styles.summaryValue}>{value}</span>
    </div>
  );
}

function qualityColor(score: number): string {
  if (score >= 85) return "#16A34A";
  if (score >= 70) return "#F59E0B";
  return "#EF4444";
}

export default function StepConfirm({
  batch,
  recipient,
  recipientType,
  note,
  onNoteChange,
  transferPrice,
  onTransferPriceChange,
}: Props) {
  const qColor = qualityColor(batch.qualityScore);

  return (
    <div className={styles.confirmSection}>
      {/* Summary card */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryCardHeader}>
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#7C3AED"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className={styles.summaryCardTitle}>Transfer Summary</span>
        </div>

        <div className={styles.summaryGrid}>
          <SummaryRow label="Batch ID" value={batch.id} />
          <SummaryRow
            label="Crop"
            value={`${batch.cropType}${
              batch.variety ? ` · ${batch.variety}` : ""
            }`}
          />
          <SummaryRow label="Quantity" value={batch.quantity} />
          <SummaryRow
            label="Quality Score"
            value={
              <span style={{ color: qColor, fontWeight: 700 }}>
                {batch.qualityScore}
              </span>
            }
          />
          <SummaryRow label="Recipient Type" value={recipientType} />
          <SummaryRow label="Recipient" value={recipient.fullName} />
          <SummaryRow label="Email" value={recipient.email} />
          <SummaryRow label="Contact" value={recipient.phone} />
          <SummaryRow
            label="Past Transfers"
            value={`${recipient.transferCount}`}
          />
        </div>
      </div>

      <div>
        <label className={styles.noteLabel} htmlFor="transfer-price">
          Transfer Price (INR per unit)
        </label>
        <input
          id="transfer-price"
          className={styles.noteInput}
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter transfer price"
          value={transferPrice}
          onChange={(e) => onTransferPriceChange(e.target.value)}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={styles.noteLabel} htmlFor="transfer-note">
          Transfer Note{" "}
          <span
            style={{ color: "#9CA3AF", fontWeight: 400, fontSize: "0.76rem" }}
          >
            (optional)
          </span>
        </label>
        <textarea
          id="transfer-note"
          className={styles.noteTextarea}
          placeholder="Any instructions or notes for the recipient..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
