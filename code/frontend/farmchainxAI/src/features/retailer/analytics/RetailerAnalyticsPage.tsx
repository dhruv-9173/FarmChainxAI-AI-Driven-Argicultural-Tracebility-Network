import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopNavBar from "../../farmer/components/TopNavBar";
import { useAuth } from "../../../hooks/useAuth";
import { getRetailerBatches, getRetailerAnalytics } from "../api/retailerApi";
import type {
  RetailerBatch,
  RetailerAnalyticsPoint,
} from "../types/retailer.types";
import styles from "./RetailerAnalyticsPage.module.css";

/* ── Mini Bar Chart ───────────────────────────────────────── */
function BarChart({
  data,
}: {
  data: { month: string; received: number; sold: number; expired: number }[];
}) {
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.received, d.sold, d.expired))
  );
  return (
    <div className={styles.chart}>
      <div className={styles.chartBars}>
        {data.map((d) => (
          <div key={d.month} className={styles.chartGroup}>
            <div className={styles.barGroup}>
              <div
                className={styles.bar}
                style={{
                  height: `${(d.received / maxVal) * 100}%`,
                  background: "#2563EB",
                }}
                title={`Received: ${d.received}`}
              />
              <div
                className={styles.bar}
                style={{
                  height: `${(d.sold / maxVal) * 100}%`,
                  background: "#16A34A",
                }}
                title={`Sold: ${d.sold}`}
              />
              <div
                className={styles.bar}
                style={{
                  height: `${(d.expired / maxVal) * 100}%`,
                  background: "#EF4444",
                }}
                title={`Expired: ${d.expired}`}
              />
            </div>
            <span className={styles.barLabel}>{d.month}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartLegend}>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ background: "#2563EB" }}
          />{" "}
          Received
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ background: "#16A34A" }}
          />{" "}
          Sold
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ background: "#EF4444" }}
          />{" "}
          Expired
        </span>
      </div>
    </div>
  );
}

/* ── Revenue Chart ─────────────────────────────────────────  */
function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  const max = Math.max(...data.map((d) => d.revenue));
  return (
    <div className={styles.chart}>
      <div className={styles.chartBars}>
        {data.map((d) => (
          <div key={d.month} className={styles.chartGroup}>
            <div className={styles.barGroup}>
              <div
                className={styles.bar}
                style={{
                  height: `${(d.revenue / max) * 100}%`,
                  background: "linear-gradient(to top, #15803d, #16a34a)",
                }}
                title={`₹${(d.revenue / 1000).toFixed(0)}K`}
              />
            </div>
            <span className={styles.barLabel}>{d.month}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartLegend}>
        {data.map((d) => (
          <span
            key={d.month}
            className={styles.legendItem}
            style={{ color: "#16A34A", fontSize: 11 }}
          >
            {d.month}: ₹{(d.revenue / 1000).toFixed(0)}K
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RetailerAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [retailerBatches, setRetailerBatches] = useState<RetailerBatch[]>([]);
  const [retailerAnalytics, setRetailerAnalytics] = useState<
    RetailerAnalyticsPoint[]
  >([]);

  useEffect(() => {
    getRetailerBatches().then(setRetailerBatches).catch(console.error);
    getRetailerAnalytics().then(setRetailerAnalytics).catch(console.error);
  }, []);

  const inStock = useMemo(
    () =>
      retailerBatches.filter(
        (b) =>
          b.status === "Available" ||
          b.status === "Low Stock" ||
          b.status === "Accepted"
      ),
    [retailerBatches]
  );
  const totalRevenue = useMemo(
    () => retailerBatches.reduce((s, b) => s + (b.revenue ?? 0), 0),
    [retailerBatches]
  );
  const soldCount = useMemo(
    () => retailerBatches.filter((b) => b.status === "Sold Out").length,
    [retailerBatches]
  );
  const expiredCount = useMemo(
    () => retailerBatches.filter((b) => b.status === "Expired").length,
    [retailerBatches]
  );
  const avgQuality = useMemo(
    () =>
      retailerBatches.length === 0
        ? 0
        : Math.round(
            retailerBatches.reduce((s, b) => s + b.qualityScore, 0) /
              retailerBatches.length
          ),
    [retailerBatches]
  );

  /* Category breakdown */
  const { categories, maxCat } = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    retailerBatches.forEach((b) => {
      categoryMap[b.cropType] = (categoryMap[b.cropType] ?? 0) + 1;
    });
    const cats = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    return { categories: cats, maxCat: Math.max(0, ...cats.map(([, v]) => v)) };
  }, [retailerBatches]);

  /* Source breakdown */
  const farmerBatches = useMemo(
    () => retailerBatches.filter((b) => b.sourceType === "Farmer").length,
    [retailerBatches]
  );
  const distBatches = useMemo(
    () => retailerBatches.filter((b) => b.sourceType === "Distributor").length,
    [retailerBatches]
  );

  return (
    <div className={styles.page}>
      <TopNavBar
        userName={user?.fullName ?? ""}
        userRole={user?.role ?? "RETAILER"}
        onNavigateToProfile={() => navigate("/retailer/profile")}
      />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button
            className={styles.breadLink}
            onClick={() => navigate("/retailer/dashboard")}
          >
            Dashboard
          </button>
          <span className={styles.breadSep}>›</span>
          <span>Analytics</span>
        </div>

        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>Store Analytics</h1>
          <p className={styles.pageSub}>
            Inventory performance, revenue, shelf life and batch insights
          </p>
        </div>

        {/* KPI Row */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard} style={{ borderTopColor: "#16A34A" }}>
            <span className={styles.kpiIcon}>💰</span>
            <span className={styles.kpiVal} style={{ color: "#16A34A" }}>
              ₹{(totalRevenue / 1000).toFixed(1)}K
            </span>
            <span className={styles.kpiLbl}>Total Revenue</span>
          </div>
          <div className={styles.kpiCard} style={{ borderTopColor: "#0891B2" }}>
            <span className={styles.kpiIcon}>🏪</span>
            <span className={styles.kpiVal} style={{ color: "#0891B2" }}>
              {inStock.length}
            </span>
            <span className={styles.kpiLbl}>Currently In Stock</span>
          </div>
          <div className={styles.kpiCard} style={{ borderTopColor: "#6B7280" }}>
            <span className={styles.kpiIcon}>✓</span>
            <span className={styles.kpiVal} style={{ color: "#6B7280" }}>
              {soldCount}
            </span>
            <span className={styles.kpiLbl}>Batches Sold</span>
          </div>
          <div className={styles.kpiCard} style={{ borderTopColor: "#EF4444" }}>
            <span className={styles.kpiIcon}>⏰</span>
            <span className={styles.kpiVal} style={{ color: "#EF4444" }}>
              {expiredCount}
            </span>
            <span className={styles.kpiLbl}>Expired Batches</span>
          </div>
          <div className={styles.kpiCard} style={{ borderTopColor: "#F59E0B" }}>
            <span className={styles.kpiIcon}>⭐</span>
            <span className={styles.kpiVal} style={{ color: "#F59E0B" }}>
              {avgQuality}
            </span>
            <span className={styles.kpiLbl}>Avg. Quality Score</span>
          </div>
        </div>

        {/* Charts Row */}
        <div className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <div className={styles.chartHead}>
              <h3 className={styles.chartTitle}>Batch Volume (6 Months)</h3>
              <p className={styles.chartSub}>Received vs Sold vs Expired</p>
            </div>
            <BarChart data={retailerAnalytics} />
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHead}>
              <h3 className={styles.chartTitle}>Revenue Trend (6 Months)</h3>
              <p className={styles.chartSub}>
                Monthly revenue from sold batches
              </p>
            </div>
            <RevenueChart data={retailerAnalytics} />
          </div>
        </div>

        {/* Shelf Life + Category + Source */}
        <div className={styles.bottomRow}>
          {/* Shelf Life */}
          <div className={styles.analyticsCard}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Shelf Life Status</h3>
              <p className={styles.cardSub}>Current stock expiry overview</p>
            </div>
            <div className={styles.shelfList}>
              {inStock.length === 0 ? (
                <div className={styles.empty}>No in-stock batches</div>
              ) : (
                inStock.map((b) => {
                  const color =
                    b.shelfLifePercent >= 60
                      ? "#16A34A"
                      : b.shelfLifePercent >= 30
                      ? "#F59E0B"
                      : "#EF4444";
                  return (
                    <div key={b.id} className={styles.shelfRow}>
                      <div className={styles.shelfInfo}>
                        <span className={styles.shelfCrop}>{b.cropType}</span>
                        <span className={styles.shelfDays} style={{ color }}>
                          {b.shelfLifeDays}d left
                        </span>
                      </div>
                      <div className={styles.shelfBarOuter}>
                        <div
                          className={styles.shelfBarInner}
                          style={{
                            width: `${b.shelfLifePercent}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <span className={styles.shelfPct} style={{ color }}>
                        {b.shelfLifePercent}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className={styles.shelfSummary}>
              <div className={styles.shelfStat}>
                <span
                  className={styles.shelfStatDot}
                  style={{ background: "#16A34A" }}
                />
                Good ({inStock.filter((b) => b.shelfLifePercent >= 60).length})
              </div>
              <div className={styles.shelfStat}>
                <span
                  className={styles.shelfStatDot}
                  style={{ background: "#F59E0B" }}
                />
                Watch (
                {
                  inStock.filter(
                    (b) => b.shelfLifePercent >= 30 && b.shelfLifePercent < 60
                  ).length
                }
                )
              </div>
              <div className={styles.shelfStat}>
                <span
                  className={styles.shelfStatDot}
                  style={{ background: "#EF4444" }}
                />
                Critical (
                {inStock.filter((b) => b.shelfLifePercent < 30).length})
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className={styles.analyticsCard}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Inventory by Category</h3>
              <p className={styles.cardSub}>Batch count per crop type</p>
            </div>
            <div className={styles.categoryList}>
              {categories.map(([crop, count]) => (
                <div key={crop} className={styles.categoryRow}>
                  <span className={styles.categoryName}>{crop}</span>
                  <div className={styles.categoryBarOuter}>
                    <div
                      className={styles.categoryBarInner}
                      style={{
                        width: `${(count / maxCat) * 100}%`,
                        background: "#16A34A",
                      }}
                    />
                  </div>
                  <span className={styles.categoryCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Breakdown */}
          <div className={styles.analyticsCard}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Source Breakdown</h3>
              <p className={styles.cardSub}>Batches by supplier type</p>
            </div>
            <div className={styles.sourceWrap}>
              <div className={styles.donutWrap}>
                <div className={styles.donutOuter}>
                  <svg viewBox="0 0 36 36" className={styles.donut}>
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9154943"
                      fill="none"
                      stroke="#EFF6FF"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9154943"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="4"
                      strokeDasharray={`${
                        (distBatches / retailerBatches.length) * 100
                      } 100`}
                      strokeDashoffset="25"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9154943"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="4"
                      strokeDasharray={`${
                        (farmerBatches / retailerBatches.length) * 100
                      } 100`}
                      strokeDashoffset={`${
                        25 - (distBatches / retailerBatches.length) * 100
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className={styles.donutCenter}>
                    <span className={styles.donutTotal}>
                      {retailerBatches.length}
                    </span>
                    <span className={styles.donutLbl}>Total</span>
                  </div>
                </div>
              </div>
              <div className={styles.sourceList}>
                <div className={styles.sourceItem}>
                  <span
                    className={styles.sourceDot}
                    style={{ background: "#16A34A" }}
                  />
                  <div>
                    <div className={styles.sourceLabel}>From Farmers</div>
                    <div className={styles.sourceVal}>
                      {farmerBatches} batches (
                      {Math.round(
                        (farmerBatches / retailerBatches.length) * 100
                      )}
                      %)
                    </div>
                  </div>
                </div>
                <div className={styles.sourceItem}>
                  <span
                    className={styles.sourceDot}
                    style={{ background: "#2563EB" }}
                  />
                  <div>
                    <div className={styles.sourceLabel}>From Distributors</div>
                    <div className={styles.sourceVal}>
                      {distBatches} batches (
                      {Math.round((distBatches / retailerBatches.length) * 100)}
                      %)
                    </div>
                  </div>
                </div>
                <div className={styles.sourceItem}>
                  <span
                    className={styles.sourceDot}
                    style={{ background: "#6B7280" }}
                  />
                  <div>
                    <div className={styles.sourceLabel}>Organic Batches</div>
                    <div className={styles.sourceVal}>
                      {retailerBatches.filter((b) => b.organic).length} batches
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
