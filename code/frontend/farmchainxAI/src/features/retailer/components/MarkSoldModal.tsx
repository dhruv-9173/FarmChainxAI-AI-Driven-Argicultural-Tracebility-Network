import { useState } from "react";
import styles from "./MarkSoldModal.module.css";
import type { RetailerBatch } from "../types/retailer.types";

interface Props {
  batch: RetailerBatch;
  onClose: () => void;
  onSubmit: (quantitySold: number, sellingPrice: number) => Promise<void>;
}

export default function MarkSoldModal({ batch, onClose, onSubmit }: Props) {
  // Try to parse quantity if it has units e.g. "2,400 kg"
  const rawQty = String(batch.quantity);
  const totalQtyStr = rawQty.replace(/[^0-9.]/g, "");
  const totalQty = parseFloat(totalQtyStr) || 0;
  const unitMatch = rawQty.match(/\b(kg|ton|quintal)\b/i);
  const unit = unitMatch ? unitMatch[1].toLowerCase() : "kg";

  const [quantity, setQuantity] = useState<string>(totalQty.toString());
  const [price, setPrice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const q = parseFloat(quantity);
    const p = parseFloat(price);

    if (isNaN(q) || q <= 0 || q > totalQty) {
      setError(`Quantity must be between 0 and ${totalQty}`);
      return;
    }
    if (isNaN(p) || p <= 0) {
      setError("Please enter a valid selling price");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(q, p);
      onClose();
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message || "Failed to mark as sold");
        } else {
            setError("Failed to mark as sold");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Mark Batch as Sold</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <div className={styles.batchInfo}>
              <div>
                <h4>Batch ID</h4>
                <p>#{batch.id.substring(0, 8)}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h4>Crop</h4>
                <p>{batch.cropType}</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Quantity Sold</label>
              <div className={styles.inputWrapper}>
                <input
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`${styles.input} ${styles.withSuffix}`}
                  placeholder="0.00"
                  max={totalQty}
                  disabled={loading}
                />
                <span className={styles.suffix}>{unit}</span>
              </div>
              <p className={styles.hint} style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Available: {totalQty} {unit}
              </p>
            </div>

            <div className={styles.formGroup}>
              <label>Selling Price (per {unit})</label>
              <div className={styles.inputWrapper}>
                <span className={styles.prefix}>₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`${styles.input} ${styles.withPrefix}`}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
