import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./AcceptBatchModal.module.css";

export interface AcceptBatchInfo {
    id: string;
    cropType: string;
    variety?: string;
    quantity: string;
    organic: boolean;
    qualityScore: number;
    qualityGrade?: string;
    shelfLifeDays: number;
    farmerName?: string;
    farmerId?: string;
    farmLocation?: string;
    sourceName?: string;
    sourceType?: string;
    basePrice?: number;
    marketPrice?: number;
    pricePerKg?: number;
    sellingPricePerKg?: number;
    receivedAt?: string;
}

export interface AcceptBatchModalProps {
    batch: AcceptBatchInfo;
    role: "distributor" | "retailer";
    onClose: () => void;
    onAccept: (note: string) => void;
    onReject: (note: string) => void;
}

export default function AcceptBatchModal({
    batch, role, onClose, onAccept, onReject,
}: AcceptBatchModalProps) {
    const [note, setNote] = useState("");
    const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handler);
        return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", handler); };
    }, [onClose]);

    const scoreColor = batch.qualityScore >= 85 ? "#16A34A" : batch.qualityScore >= 70 ? "#F59E0B" : "#EF4444";
    const scoreLabel = batch.qualityScore >= 85 ? "Excellent" : batch.qualityScore >= 70 ? "Good" : "Below Standard";

    const handleConfirm = async () => {
        if (!decision) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        if (decision === "accept") onAccept(note);
        else onReject(note);
        setLoading(false);
        onClose();
    };

    const supplierName = role === "retailer" ? batch.sourceName : batch.farmerName;


    const detailRows = [
        ["Crop", `${batch.cropType}${batch.variety ? ` (${batch.variety})` : ""}`],
        ["Quantity", batch.quantity],
        ...(role === "distributor"
            ? [
                ["Farmer", batch.farmerName ?? "—"],
                ["Farm Location", batch.farmLocation ?? "—"],
                ["Quality Grade", batch.qualityGrade ?? "—"],
                ["Farmer ID", batch.farmerId ?? "—"],
                ["Received On", batch.receivedAt ?? "—"],
                ["Shelf Life", `${batch.shelfLifeDays} days remaining`],
            ]
            : [
                ["Source", supplierName ?? "—"],
                ["Source Type", role === "retailer" ? batch.sourceType ?? "—" : "—"],
                ["Buy Price", `₹${batch.pricePerKg ?? "—"}/kg`],
                ["Sell Price", `₹${batch.sellingPricePerKg ?? "—"}/kg`],
                ["Quality Grade", batch.qualityGrade ?? "—"],
                ["Shelf Life", `${batch.shelfLifeDays} days`],
            ]),
    ];

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <p className={styles.batchIdLabel}>{batch.id}</p>
                        <h2 className={styles.title}>Review Incoming Batch</h2>
                        <p className={styles.subtitle}>Inspect and accept or reject this batch</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Batch card */}
                <div className={styles.batchCard}>
                    <div className={styles.batchCardTop}>
                        <div>
                            <span className={styles.batchId}>{batch.id}</span>
                            <span className={styles.incomingBadge}>📥 Incoming</span>
                        </div>
                        {batch.organic && <span className={styles.organicBadge}>🌿 Organic</span>}
                    </div>

                    <div className={styles.detailGrid}>
                        {detailRows.map(([label, value]) => (
                            <div className={styles.detailItem} key={label}>
                                <span className={styles.detailLabel}>{label}</span>
                                <span className={styles.detailValue}>{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Quality bar */}
                    <div className={styles.qualitySection}>
                        <span className={styles.qualityLabel}>Quality Score</span>
                        <div className={styles.qualityScoreRow}>
                            <span className={styles.qualityScore} style={{ color: scoreColor }}>{batch.qualityScore}</span>
                            <span className={styles.qualityMax}>/100</span>
                            <span className={styles.qualityTag} style={{ background: `${scoreColor}14`, color: scoreColor }}>
                                {scoreLabel}
                            </span>
                        </div>
                        <div className={styles.qualityBarWrap}>
                            <div className={styles.qualityBarBg}>
                                <div className={styles.qualityBarFill} style={{ width: `${batch.qualityScore}%`, background: scoreColor }} />
                            </div>
                            <div className={styles.qualityThresholds}>
                                <span style={{ left: "70%" }} className={styles.thresholdMark} />
                                <span style={{ left: "85%" }} className={styles.thresholdMark} />
                            </div>
                        </div>
                    </div>

                    {/* Price info (distributor only) */}
                    {role === "distributor" && batch.basePrice && batch.marketPrice && (
                        <div className={styles.priceRow}>
                            <div className={styles.priceItem}>
                                <span className={styles.priceLabel}>Base Price</span>
                                <span className={styles.priceValue}>₹{batch.basePrice}/kg</span>
                            </div>
                            <div className={styles.priceItem}>
                                <span className={styles.priceLabel}>Market Price</span>
                                <span className={styles.priceValue} style={{ color: "#16A34A" }}>₹{batch.marketPrice}/kg</span>
                            </div>
                            <div className={styles.priceItem}>
                                <span className={styles.priceLabel}>Margin</span>
                                <span className={styles.priceValue} style={{ color: "#7C3AED" }}>
                                    +{Math.round(((batch.marketPrice - batch.basePrice) / batch.basePrice) * 100)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Decision toggle */}
                <div className={styles.decisionRow}>
                    <button
                        className={`${styles.decBtn} ${styles.decAccept} ${decision === "accept" ? styles.decSelected : ""}`}
                        onClick={() => setDecision("accept")}
                    >✓ Accept Batch</button>
                    <button
                        className={`${styles.decBtn} ${styles.decReject} ${decision === "reject" ? styles.decSelectedRed : ""}`}
                        onClick={() => setDecision("reject")}
                    >✕ Reject Batch</button>
                </div>

                {/* Notes */}
                <div className={styles.notesSection}>
                    <label className={styles.notesLabel}>
                        Inspection Notes <span className={styles.notesOptional}>(optional)</span>
                    </label>
                    <textarea
                        className={styles.notesInput}
                        rows={3}
                        placeholder="Add quality inspection notes, condition observations, or rejection reason..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className={
                            decision === "accept" ? styles.confirmGreen :
                                decision === "reject" ? styles.confirmRed : styles.confirmDisabled
                        }
                        onClick={handleConfirm}
                        disabled={!decision || loading}
                    >
                        {loading ? "Processing…" :
                            decision === "accept" ? "Confirm Accept" :
                                decision === "reject" ? "Confirm Reject" : "Select Decision"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
