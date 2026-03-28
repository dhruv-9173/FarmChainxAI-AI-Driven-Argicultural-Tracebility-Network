/**
 * STATUS MIGRATION GUIDE
 * 
 * This document tracks the status enum value migration from the old 8-state model
 * to the new 12-state unified model.
 * 
 * MIGRATION MAPPING:
 * ==================
 * 
 * OLD -> NEW (Recommended Mappings by Context)
 * 
 * PENDING:
 *   - When used for fresh batches → CREATED or HARVESTED
 *   - For batches awaiting action → HARVESTED (ready for transfer)
 *   - For transfer-related → Use PENDING from BatchTransfer.TransferStatus instead
 * 
 * ACTIVE:
 *   - Batches in farmer inventory → HARVESTED
 *   - Batches available for sale → AVAILABLE
 *   - General "in use" state → HARVESTED or AVAILABLE (context-dependent)
 * 
 * TRANSFERRED:
 *   - Batches in transit → HARVESTED (pre-acceptance)
 *   - After acceptance → RECEIVED_BY_DIST, RECEIVED_BY_RETAIL, or DELIVERED
 *   - Replace with role-specific RECEIVED_BY_* states
 * 
 * RECEIVED:
 *   - By distributor → RECEIVED_BY_DIST
 *   - By retailer → RECEIVED_BY_RETAIL
 *   - By consumer → DELIVERED
 *   - Use role-specific variants
 * 
 * QUALITY_CHECK:
 *   - Batches under inspection → QUALITY_PASSED (after success) or REJECTED_BY_DIST
 *   - Pre-acceptance quality → No intermediate state; use final status
 * 
 * REJECTED:
 *   - By farmer → REJECTED_BY_FARMER
 *   - By distributor → REJECTED_BY_DIST
 *   - By retailer → REJECTED_BY_RETAIL
 *   - Use role-specific variants
 * 
 * SOLD:
 *   - Retailer sold → DELIVERED (to consumer)
 *   - Consumer consumed → CONSUMED
 *   - Use destination-specific states
 * 
 * EXPIRED:
 *   - Remains EXPIRED (same in both models)
 * 
 * SERVICE FILES REQUIRING UPDATES:
 * ================================
 * 
 * 1. FarmerService.java
 *    - Line 68: PENDING → CREATED
 *    - Lines 378: ACTIVE, RECEIVED → HARVESTED, RECEIVED_BY_DIST
 * 
 * 2. RetailerService.java
 *    - Lines 99-100: RECEIVED, ACTIVE → RECEIVED_BY_RETAIL, AVAILABLE
 *    - Line 136-137: RECEIVED, ACTIVE → RECEIVED_BY_RETAIL, AVAILABLE
 *    - Line 142: SOLD → DELIVERED
 *    - Line 158: (context-dependent)
 *    - Line 185: SOLD → DELIVERED
 *    - Lines 218-219: RECEIVED, ACTIVE → RECEIVED_BY_RETAIL, AVAILABLE
 *    - Lines 234-235: RECEIVED, ACTIVE → RECEIVED_BY_RETAIL, AVAILABLE
 *    - Lines 253-254: RECEIVED, ACTIVE → RECEIVED_BY_RETAIL, AVAILABLE
 *    - Line 289: ACTIVE → AVAILABLE
 *    - Line 313: REJECTED → REJECTED_BY_RETAIL
 * 
 * 3. ConsumerService.java
 *    - Line 99: RECEIVED → DELIVERED
 *    - Line 106: (context-dependent)
 *    - Line 137: SOLD → CONSUMED
 *    - Line 147: (context-dependent)
 * 
 * 4. AnalyticsService.java
 *    - Lines 52-57: ACTIVE → AVAILABLE, SOLD → CONSUMED, REJECTED → REJECTED_BY_*
 *    - Line 131: SOLD → CONSUMED/DELIVERED
 *    - Lines 194-195: SOLD → DELIVERED/CONSUMED
 *    - Lines 254-256: ACTIVE, RECEIVED → AVAILABLE, RECEIVED_BY_*
 *    - Lines 259-260: QUALITY_CHECK → QUALITY_PASSED
 *    - Line 264: SOLD → CONSUMED/DELIVERED
 *    - Lines 267-268: REJECTED → REJECTED_BY_*
 * 
 * 5. QualityCheckService.java
 *    - Line 75: QUALITY_CHECK → QUALITY_PASSED
 *    - Line 82: (context-dependent)
 *    - Lines 122-123: QUALITY_CHECK, RECEIVED → QUALITY_PASSED, RECEIVED_BY_*
 *    - Line 132: ACTIVE → HARVESTED/AVAILABLE
 *    - Line 135: REJECTED → REJECTED_BY_DIST
 *    - Line 176: REJECTED → REJECTED_BY_DIST
 *    - Lines 216-217: RECEIVED, QUALITY_CHECK → RECEIVED_BY_*, QUALITY_PASSED
 *    - Lines 222-223: RECEIVED, QUALITY_CHECK → RECEIVED_BY_*, QUALITY_PASSED
 * 
 * 6. SupplyChainService.java
 *    - Lines 371-375: Complete status mapping switch statement
 *      CREATED → CREATED
 *      IN_TRANSIT → HARVESTED (not yet accepted)
 *      RECEIVED → RECEIVED_BY_DIST or RECEIVED_BY_RETAIL
 *      QUALITY_CHECK → QUALITY_PASSED
 *      STORED → AVAILABLE
 *      SOLD → DELIVERED or CONSUMED
 *      REJECTED → REJECTED_BY_*
 *      EXPIRED → EXPIRED
 * 
 * 7. UserBrowseService.java
 *    - Lines 211-213: PENDING, ACTIVE, TRANSFERRED → CREATED, AVAILABLE, HARVESTED
 *    - Line 216: TRANSFERRED → HARVESTED
 * 
 * IMPLEMENTATION STRATEGY:
 * =======================
 * 
 * Phase 1: Core Transfer Logic (COMPLETED)
 *   - ✅ Batch.java enum updated
 *   - ✅ BatchStatusHelper created
 *   - ✅ BatchTransferService updated
 * 
 * Phase 2: Service Layer Migration (IN PROGRESS)
 *   - Update FarmerService (highest priority - creates batches)
 *   - Update RetailerService (second priority - uses/sells batches)
 *   - Update remaining services in parallel
 * 
 * Phase 3: Testing & Validation
 *   - Integration tests for each service
 *   - Regression testing for batch flow
 * 
 * BACKWARD COMPATIBILITY NOTES:
 * =============================
 * 
 * The old SupplyChainStage enum remains as @Deprecated but not removed.
 * This allows for gradual migration of older code. However, new code should
 * use BatchStatus exclusively.
 * 
 * Migration tools provided:
 * - BatchStatusHelper.isValidTransition() for validation
 * - BatchStatusHelper.getVisibleStatusesForRole() for role-based visibility
 * - BatchStatusHelper.getStatusLabel() for UI display
 */
