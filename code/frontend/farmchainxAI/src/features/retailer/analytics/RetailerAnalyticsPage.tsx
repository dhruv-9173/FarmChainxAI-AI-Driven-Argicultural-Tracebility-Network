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

/* ── Mini Bar Chart ──────────────────────────────────── */
function BarChart({ data }: { data: RetailerAnalyticsPoint[] }) {
  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.received, d.sold, d.expired)));
  return (
    <div className={styles.chart}>
      <div className={styles.chartBars}>
        {data.map((d) => (
          <div key={d.month} className={styles.chartGroup}>
            <div className={styles.barGroup}>
              <div className={styles.bar} style={{ height: `${(d.received / maxVal) * 100}%`, background: "#2563EB" }} title={`Received: ${d.received}`} />
              <div className={styles.bar} style={{ height: `${(d.sold / maxVal) * 100}%`, background: "#16A34A" }} title={`Sold: ${d.sold}`} />
              <div className={styles.bar} style={{ height: `${(d.expired / maxVal) * 100}%`, background: "#EF4444" }} title={`Expired: ${d.expired}`} />
            </div>
            <span className={styles.barLabel}>{d.month}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartLegend}>
        {[["#2563EB", "Received"], ["#16A34A", "Sold"], ["#EF4444", "Expired"]].map(([color, label]) => (
          <span key={label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Revenue Chart ─────────────────────────────────── */
function RevenueChart({ data }: { data: RetailerAnalyticsPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  return (
    <div className={styles.chart}>
      <div className={styles.chartBars}>
        {data.map((d) => (
          <div key={d.month} className={styles.chartGroup}>
            <div className={styles.barGroup}>
              <div
                className={styles.bar}
                style={{ height: `${(d.revenue / max) * 100}%`, background: "linear-gradient(to top, #15803d, #16a34a)" }}
                title={`₹${(d.revenue / 1000).toFixed(1)}K`}
              />
            </div>
            <span className={styles.barLabel}>{d.month}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartLegend}>
        {data.map((d) => (
          <span key={d.month} className={styles.legendItem} style={{ color: "#16A34A" }}>
            {d.month}: ₹{(d.revenue / 1000).toFixed(1)}K
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────── */
export default function RetailerAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [batches, setBatches] = useState<RetailerBatch[]>([]);
  const [analytics, setAnalytics] = useState<RetailerAnalyticsPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRetailerBatches().catch(() => []),
      getRetailerAnalytics().catch(() => []),
    ]).then(([b, a]) => {
      setBatches(b);
      setAnalytics(a);
      setLoading(false);
    });
  }, []);

  const inStock = useMemo(() => batches.filter(b => b.status === "Available" || b.status === "Low Stock" || b.status === "Accepted"), [batches]);
  const totalRevenue = useMemo(() => analytics.reduce((s, a) => s + (a.revenue ?? 0), 0), [analytics]);
  const soldCount = useMemo(() => batches.filter(b => b.status === "Sold Out").length, [batches]);
  const expiredCount = useMemo(() => batches.filter(b => b.status === "Expired").length, [batches]);
  const avgQuality = useMemo(() =>
    batches.length === 0 ? 0 : Math.round(batches.reduce((s, b) => s + b.qualityScore, 0) / batches.length),
    [batches]
  );

  const { categories, maxCat } = useMemo(() => {
    const map: Record<string, number> = {};
    batches.forEach(b => { map[b.cropType] = (map[b.cropType] ?? 0) + 1; });
    const cats = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return { categories: cats, maxCat: Math.max(1, ...cats.map(([, v]) => v)) };
  }, [batches]);

  const farmerBatches = useMemo(() => batches.filter(b => b.sourceType === "Farmer").length, [batches]);
  const distBatches = useMemo(() => batches.filter(b => b.sourceType === "Distributor").length, [batches]);
  const total = batches.length || 1;

  const kpiCards = [
    { icon: "💰", val: `₹${(totalRevenue / 1000).toFixed(1)}K`, lbl: "Total Revenue", color: "#16A34A" },
    { icon: "🏪", val: String(inStock.length), lbl: "In Stock", color: "#0891B2" },
    { icon: "✓", val: String(soldCount), lbl: "Batches Sold", color: "#6B7280" },
    { icon: "⏰", val: String(expiredCount), lbl: "Expired", color: "#EF4444" },
    { icon: "⭐", val: String(avgQuality), lbl: "Avg. Quality Score", color: "#F59E0B" },
  ];

  return (
    <div className={styles.page}>
      <TopNavBar userName={user?.fullName ?? ""} userRole={user?.role ?? "RETAILER"} onNavigateToProfile={() => navigate("/retailer/profile")} />

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <button className={styles.breadLink} onClick={() => navigate("/retailer/dashboard")}>Dashboard</button>
          <span className={styles.breadSep}>›</span>
          <span>Analytics</span>
        </div>

        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>📊 Store Analytics</h1>
          <p className={styles.pageSub}>Inventory performance, revenue trends, shelf life and batch insights</p>
        </div>

        {loading ? (
          <div className={styles.loadingRow}>
            {[1, 2, 3, 4, 5].map(i => <div key={i} className={styles.skeletonKpi} />)}
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className={styles.kpiRow}>
              {kpiCards.map(({ icon, val, lbl, color }) => (
                <div key={lbl} className={styles.kpiCard} style={{ borderTopColor: color }}>
                  <span className={styles.kpiIcon}>{icon}</span>
                  <span className={styles.kpiVal} style={{ color }}>{val}</span>
                  <span className={styles.kpiLbl}>{lbl}</span>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className={styles.chartsRow}>
              <div className={styles.chartCard}>
                <div className={styles.chartHead}>
                  <h3 className={styles.chartTitle}>Batch Volume (6 Months)</h3>
                  <p className={styles.chartSub}>Received vs Sold vs Expired per month</p>
                </div>
                {analytics.length === 0 ? (
                  <div className={styles.chartEmpty}>No data available yet</div>
                ) : (
                  <BarChart data={analytics} />
                )}
              </div>
              <div className={styles.chartCard}>
                <div className={styles.chartHead}>
                  <h3 className={styles.chartTitle}>Revenue Trend (6 Months)</h3>
                  <p className={styles.chartSub}>Monthly revenue from sold batches</p>
                </div>
                {analytics.length === 0 ? (
                  <div className={styles.chartEmpty}>No revenue data yet — sell batches to track revenue</div>
                ) : (
                  <RevenueChart data={analytics} />
                )}
              </div>
            </div>

            {/* Bottom Row */}
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
                      const color = b.shelfLifePercent >= 60 ? "#16A34A" : b.shelfLifePercent >= 30 ? "#F59E0B" : "#EF4444";
                      return (
                        <div key={b.id} className={styles.shelfRow}>
                          <div className={styles.shelfInfo}>
                            <span className={styles.shelfCrop}>{b.cropType}</span>
                            <span className={styles.shelfDays} style={{ color }}>{b.shelfLifeDays}d left</span>
                          </div>
                          <div className={styles.shelfBarOuter}>
                            <div className={styles.shelfBarInner} style={{ width: `${b.shelfLifePercent}%`, background: color }} />
                          </div>
                          <span className={styles.shelfPct} style={{ color }}>{b.shelfLifePercent}%</span>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className={styles.shelfSummary}>
                  {[["#16A34A", "Good", inStock.filter(b => b.shelfLifePercent >= 60).length],
                    ["#F59E0B", "Watch", inStock.filter(b => b.shelfLifePercent >= 30 && b.shelfLifePercent < 60).length],
                    ["#EF4444", "Critical", inStock.filter(b => b.shelfLifePercent < 30).length]
                  ].map(([color, label, count]) => (
                    <div key={String(label)} className={styles.shelfStat}>
                      <span className={styles.shelfStatDot} style={{ background: String(color) }} />
                      {label} ({count})
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className={styles.analyticsCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardTitle}>Inventory by Crop</h3>
                  <p className={styles.cardSub}>Batch count per crop type</p>
                </div>
                <div className={styles.categoryList}>
                  {categories.length === 0 ? (
                    <div className={styles.empty}>No batches</div>
                  ) : (
                    categories.map(([crop, count]) => (
                      <div key={crop} className={styles.categoryRow}>
                        <span className={styles.categoryName}>{crop}</span>
                        <div className={styles.categoryBarOuter}>
                          <div className={styles.categoryBarInner} style={{ width: `${(count / maxCat) * 100}%`, background: "#16A34A" }} />
                        </div>
                        <span className={styles.categoryCount}>{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Source Breakdown */}
              <div className={styles.analyticsCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardTitle}>Source Breakdown</h3>
                  <p className={styles.cardSub}>Batches by supplier type</p>
                </div>
                <div className={styles.sourceWrap}>
                  <div className={styles.donutOuter}>
                    <svg viewBox="0 0 36 36" className={styles.donut}>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EFF6FF" strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563EB" strokeWidth="4"
                        strokeDasharray={`${(distBatches / total) * 100} 100`} strokeDashoffset="25" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#16A34A" strokeWidth="4"
                        strokeDasharray={`${(farmerBatches / total) * 100} 100`}
                        strokeDashoffset={`${25 - (distBatches / total) * 100}`} strokeLinecap="round" />
                    </svg>
                    <div className={styles.donutCenter}>
                      <span className={styles.donutTotal}>{batches.length}</span>
                      <span className={styles.donutLbl}>Total</span>
                    </div>
                  </div>
                  <div className={styles.sourceList}>
                    {[
                      { color: "#16A34A", label: "From Farmers", count: farmerBatches },
                      { color: "#2563EB", label: "From Distributors", count: distBatches },
                      { color: "#6B7280", label: "Organic Batches", count: batches.filter(b => b.organic).length },
                    ].map(({ color, label, count }) => (
                      <div key={label} className={styles.sourceItem}>
                        <span className={styles.sourceDot} style={{ background: color }} />
                        <div>
                          <div className={styles.sourceLabel}>{label}</div>
                          <div className={styles.sourceVal}>{count} batches ({Math.round((count / total) * 100)}%)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
