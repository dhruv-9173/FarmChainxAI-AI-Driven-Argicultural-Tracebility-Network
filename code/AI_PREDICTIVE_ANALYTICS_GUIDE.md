# FarmChainX AI Predictive Analytics Guide

## 1) Purpose

This guide documents the complete AI addition for predictive analytics in FarmChainX, including:

- What was added in backend and frontend
- How predictions are generated and displayed
- Which tools and frameworks are used
- API contracts and data flow
- Validation, limitations, and upgrade path

The current implementation is a production-safe baseline model layer designed for fast value delivery and easy future upgrades to advanced ML.

## 2) What Was Added

### Backend

New predictive endpoints were added under Analytics Controller:

- GET /api/v1/analytics/predictive/farmer
- GET /api/v1/analytics/predictive/distributor

Baseline prediction logic was added in Analytics Service:

- Farmer insights:
  - qualityForecast
  - shelfLifeRisk
  - demandTrend
- Distributor insights:
  - transferDelayRisk
  - qualityDeclineForecast
  - demandTrend

### Frontend

Predictive API client calls were added in analytics API layer.

Farmer dashboard integration:

- Fetch predictive payload
- Render predicted quality trajectory and shelf-life risk cards in AIInsights

Distributor dashboard integration:

- Fetch predictive payload
- Render delay and quality outlook in DistributorAnalytics

## 3) File-Level Changes

### Backend files

- backend/FarmchainxAI/src/main/java/infosys/project/farmchainxai/controller/AnalyticsController.java
- backend/FarmchainxAI/src/main/java/infosys/project/farmchainxai/service/AnalyticsService.java

### Frontend files

- frontend/farmchainxAI/src/api/analyticsApi.ts
- frontend/farmchainxAI/src/types/dashboard.types.ts
- frontend/farmchainxAI/src/features/farmer/FarmerDashboard.tsx
- frontend/farmchainxAI/src/features/farmer/components/AIInsights.tsx
- frontend/farmchainxAI/src/features/farmer/components/AIInsights.module.css
- frontend/farmchainxAI/src/features/distributor/types/distributor.types.ts
- frontend/farmchainxAI/src/features/distributor/DistributorDashboard.tsx
- frontend/farmchainxAI/src/features/distributor/components/DistributorAnalytics.tsx
- frontend/farmchainxAI/src/features/distributor/components/DistributorAnalytics.module.css

## 4) End-to-End Working Flow

1. User opens Farmer or Distributor dashboard.
2. Dashboard fetches normal analytics plus predictive insights.
3. Backend loads historical Batch and SupplyChainEvent data.
4. Baseline model functions compute trend slopes, projections, and risk levels.
5. API returns structured predictive payload with confidence and modelVersion.
6. UI renders charts and risk cards.
7. If predictive API fails, dashboard gracefully falls back to existing non-predictive analytics.

## 5) Prediction Logic (Current Baseline)

This is deterministic baseline logic, not external ML serving yet.

### 5.1 Farmer

Quality Forecast:

- Take recent quality samples
- Compute average quality and simple slope
- Project predicted quality points

Shelf-Life Risk:

- Count batches where currentShelfLifeDays <= 2
- Compute avgRemainingShelfLifeDays
- Map risk level:
  - HIGH if highRiskBatches >= 20
  - MEDIUM if highRiskBatches >= 8
  - LOW otherwise

Demand Trend:

- Aggregate monthly created batches
- Compute baseline demand and slope
- Forecast next 3 months

### 5.2 Distributor

Transfer Delay Risk:

- For each batch, find earliest IN_TRANSIT and earliest RECEIVED event
- Calculate transit hours
- lateTransferProbabilityPct = delayedTransfers over totalTransitSamples
- Risk levels:
  - HIGH if late probability >= 40
  - MEDIUM if late probability >= 20
  - LOW otherwise

Quality Decline Forecast:

- Build quality time series from batches
- Compute slope and project quality for next 7 and 30 days
- Trend label: DECLINING, IMPROVING, or STABLE

Demand Trend:

- Aggregate monthly RECEIVED events
- Forecast next 3 months from baseline and slope

## 6) API Contract Summary

### 6.1 Farmer Predictive Endpoint

Path:

- /api/v1/analytics/predictive/farmer

Response data shape (simplified):

    {
    	"qualityForecast": [
    		{ "label": "2026-03-01", "actual": 84, "predicted": 82.4 }
    	],
    	"shelfLifeRisk": {
    		"highRiskBatches": 5,
    		"avgRemainingShelfLifeDays": 3.2,
    		"riskLevel": "MEDIUM",
    		"confidence": 0.72
    	},
    	"demandTrend": [
    		{ "month": "2026-03", "actual": 42, "forecast": 44.6 }
    	],
    	"modelVersion": "baseline-regression-v1",
    	"generatedAt": "2026-04-02T10:11:12",
    	"confidence": 0.74
    }

### 6.2 Distributor Predictive Endpoint

Path:

- /api/v1/analytics/predictive/distributor

Response data shape (simplified):

    {
    	"transferDelayRisk": {
    		"avgTransitHours": 18.6,
    		"lateTransferProbabilityPct": 22.5,
    		"riskLevel": "MEDIUM",
    		"recommendedBufferHours": 6,
    		"confidence": 0.70
    	},
    	"qualityDeclineForecast": {
    		"currentAvgQuality": 81.2,
    		"predictedQualityNext7Days": 80.4,
    		"predictedQualityNext30Days": 77.9,
    		"trend": "DECLINING"
    	},
    	"demandTrend": [
    		{ "month": "2026-03", "actual": 38, "forecast": 39.7 }
    	],
    	"modelVersion": "baseline-regression-v1",
    	"generatedAt": "2026-04-02T10:11:12",
    	"confidence": 0.71
    }

## 7) Frontend Integration Details

### Farmer

- FarmerDashboard fetches predictive insights through the internal app API layer.
- AIInsights receives predictiveInsights prop.
- UI shows:
  - Existing quality trend chart
  - Predicted quality trajectory chart (actual vs predicted)
  - Risk cards for shelf-life indicators

### Distributor

- DistributorDashboard fetches both historical analytics and predictive insights.
- DistributorAnalytics receives predictiveInsights prop.
- UI shows:
  - Existing bar analytics
  - Predictive cards for delay risk, transit average, quality 30-day projection

## 8) Tools and Technology Used

### Backend runtime and framework tools

- Java
- Spring Boot
- Spring MVC (REST endpoints)
- Spring Transactional
- Spring Data JPA repositories

### Frontend runtime and framework tools

- React
- TypeScript
- Vite
- Recharts for visual analytics
- Axios wrapper through apiClient

### Modeling tools currently used

- In-code baseline regression-style trend logic
- Slope-based projection
- Heuristic risk classification

### Development and validation tools used during implementation

- TypeScript build validation in frontend
- Static error inspection in edited files
- Existing project APIs and types as contracts

## 9) Why Baseline First

The baseline approach was selected to:

- Deliver immediate decision support without infra complexity
- Avoid introducing external model serving dependencies too early
- Keep API contract stable while model internals evolve

This means you can upgrade model quality later without changing frontend payload contracts.

## 10) Known Constraints

- Backend analytics quality depends on historical data completeness.
- Distributor monthly analytics source still has areas that can be further grounded in real timeline aggregation.
- Confidence values are baseline estimates, not calibrated probabilities.
- Build tooling for backend may depend on local Maven wrapper and shell availability.

## 11) Upgrade Path to Advanced ML

Recommended sequence:

1. Replace baseline internals with pluggable predictor interfaces.
2. Introduce feature engineering module for reusable training features.
3. Add model training pipeline:
   - XGBoost or LightGBM for tabular quality and delay risks
   - Prophet for seasonal demand trends
4. Add model registry metadata:
   - version
   - trainedAt
   - metrics
5. Add drift monitoring and periodic retraining jobs.

## 12) Security and Reliability Notes

- Predictive endpoints follow existing authenticated analytics patterns.
- Frontend handles API failure gracefully by falling back to core analytics.
- Model metadata (modelVersion and generatedAt) is returned for traceability.

## 13) Operational Usage Guide

How product users should interpret this feature:

- Farmer dashboard:

  - Use shelf-life risk to prioritize dispatch and storage decisions.
  - Use demand trend to plan harvest transfer windows.

- Distributor dashboard:
  - Use delay risk to adjust buffer times and transfer scheduling.
  - Use quality outlook to reorder quality checks and destination routing.

## 14) Testing Checklist

- Endpoint response keys remain stable across releases.
- Forecast arrays always return predictable keys even for sparse history.
- UI handles empty predictive arrays.
- UI handles missing predictive payload without crashing.
- Predictive calls use the same internal API client flow as the rest of the app, with no third-party authentication dependency in this module.

## 15) Next Recommended Improvements

- Add route-level filters by crop type and geography for predictions.
- Add per-batch predictive drill-down endpoint.
- Add model explanation snippets for high-risk flags.
- Add analytics export for operations teams.

---

This document is intended as the primary descriptive guide for AI addition and working in this project.
