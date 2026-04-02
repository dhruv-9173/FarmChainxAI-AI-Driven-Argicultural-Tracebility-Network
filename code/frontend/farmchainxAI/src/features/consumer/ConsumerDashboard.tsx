import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../hooks/useAuth";
import styles from "./ConsumerDashboard.module.css";

interface ConsumerProduct {
  id: string;
  cropType: string;
  variety?: string;
  cropImageUrl?: string;
  quantity?: number;
  quantityUnit?: string;
  qualityScore?: number;
  status?: string;
  retailerName: string;
  retailerShopName: string;
  retailerPhone?: string;
  retailerEmail?: string;
  retailerAddress?: string;
  retailerCity?: string;
  retailerState?: string;
  pricePerUnit?: number;
}

interface ConsumerOwnedBatch {
  id: string;
  cropType: string;
  variety?: string;
  cropImageUrl?: string;
  quantity?: number;
  quantityUnit?: string;
  qualityScore?: number;
  status?: string;
  storageType?: string;
  farmCity?: string;
  farmState?: string;
  pricePerUnit?: number;
}

function normalizeStatus(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

function isRetailerAvailable(status: unknown): boolean {
  const normalized = normalizeStatus(status);
  return (
    normalized === "available" ||
    normalized === "in stock" ||
    normalized === "low stock"
  );
}

function mapProduct(raw: any): ConsumerProduct | null {
  const id = String(raw?.id ?? raw?.batchId ?? raw?.batchCode ?? "").trim();
  if (!id) return null;

  return {
    id,
    cropType: String(raw?.cropType ?? raw?.name ?? "Product"),
    variety: raw?.variety ? String(raw.variety) : undefined,
    cropImageUrl: raw?.cropImageUrl ? String(raw.cropImageUrl) : undefined,
    quantity:
      typeof raw?.quantity === "number"
        ? raw.quantity
        : Number(raw?.quantity || 0) || undefined,
    quantityUnit: raw?.quantityUnit ? String(raw.quantityUnit) : undefined,
    qualityScore:
      typeof raw?.qualityScore === "number"
        ? raw.qualityScore
        : Number(raw?.qualityScore || 0) || undefined,
    status: raw?.status ? String(raw.status) : undefined,
    retailerName: String(
      raw?.retailerName ?? raw?.sellerName ?? raw?.shopOwnerName ?? "Retailer"
    ),
    retailerShopName: String(
      raw?.retailerShopName ?? raw?.storeName ?? raw?.shopName ?? "Retail Shop"
    ),
    retailerPhone: raw?.retailerPhone ?? raw?.storePhone,
    retailerEmail: raw?.retailerEmail ?? raw?.storeEmail,
    retailerAddress: raw?.retailerAddress ?? raw?.storeLocation,
    retailerCity: raw?.retailerCity ?? raw?.storeCity,
    retailerState: raw?.retailerState ?? raw?.storeState,
    pricePerUnit:
      typeof raw?.sellingPrice === "number"
        ? raw.sellingPrice
        : typeof raw?.pricePerUnit === "number"
        ? raw.pricePerUnit
        : undefined,
  };
}

function extractArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.products)) return payload.products;
  return [];
}

const PRODUCT_ENDPOINTS = [
  "/consumer/products/available",
  "/api/v1/consumer/products/available",
];

const MY_BATCH_ENDPOINTS = ["/consumer/products", "/api/v1/consumer/products"];

function mapOwnedBatch(raw: any): ConsumerOwnedBatch | null {
  const id = String(raw?.id ?? raw?.batchId ?? raw?.batchCode ?? "").trim();
  if (!id) return null;

  return {
    id,
    cropType: String(raw?.cropType ?? "Batch"),
    variety: raw?.variety ? String(raw.variety) : undefined,
    cropImageUrl: raw?.cropImageUrl ? String(raw.cropImageUrl) : undefined,
    quantity:
      typeof raw?.quantity === "number"
        ? raw.quantity
        : Number(raw?.quantity || 0) || undefined,
    quantityUnit: raw?.quantityUnit ? String(raw.quantityUnit) : undefined,
    qualityScore:
      typeof raw?.qualityScore === "number"
        ? raw.qualityScore
        : Number(raw?.qualityScore || 0) || undefined,
    status: raw?.status ? String(raw.status) : undefined,
    storageType: raw?.storageType ? String(raw.storageType) : undefined,
    farmCity: raw?.farmCity ? String(raw.farmCity) : undefined,
    farmState: raw?.farmState ? String(raw.farmState) : undefined,
    pricePerUnit:
      typeof raw?.pricePerUnit === "number"
        ? raw.pricePerUnit
        : Number(raw?.pricePerUnit || 0) || undefined,
  };
}

export default function ConsumerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ConsumerProduct[]>([]);
  const [myBatches, setMyBatches] = useState<ConsumerOwnedBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let loadedItems: ConsumerProduct[] | null = null;
        let ownedItems: ConsumerOwnedBatch[] = [];

        for (const endpoint of PRODUCT_ENDPOINTS) {
          try {
            const params = debouncedSearch ? { search: debouncedSearch } : {};
            const { data } = await apiClient.get(endpoint, { params });
            const mapped = extractArray(data)
              .map(mapProduct)
              .filter((item): item is ConsumerProduct => item !== null)
              .filter((item) => isRetailerAvailable(item.status));

            if (mapped.length > 0 || data?.success) {
              loadedItems = mapped;
              break;
            }
          } catch {
            // Try next endpoint variant.
          }
        }

        for (const endpoint of MY_BATCH_ENDPOINTS) {
          try {
            const { data } = await apiClient.get(endpoint);
            const mappedOwned = extractArray(data)
              .map(mapOwnedBatch)
              .filter((item): item is ConsumerOwnedBatch => item !== null);

            ownedItems = mappedOwned;
            if (data?.success) {
              break;
            }
          } catch {
            // Try next endpoint variant.
          }
        }

        if (!isActive) return;
        setProducts(loadedItems ?? []);
        setMyBatches(ownedItems);
      } catch (err: any) {
        if (!isActive) return;
        setError(err?.message || "Failed to fetch available products.");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch]);

  const availableCount = products.length;
  const ownedCount = myBatches.length;

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const searchable = [
        product.id,
        product.cropType,
        product.variety,
        product.retailerName,
        product.retailerShopName,
        product.retailerCity,
        product.retailerState,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [products, searchQuery]);

  const title = useMemo(() => {
    if (!user?.fullName) return "Consumer Dashboard";
    const [firstName] = user.fullName.split(" ");
    return `${firstName}'s Consumer Dashboard`;
  }, [user?.fullName]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>FarmChainX</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            Browse retailer-available products, then open live traceability for
            any product.
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.counterCard}>
            <span className={styles.counterLabel}>Available Products</span>
            <strong className={styles.counterValue}>{availableCount}</strong>
          </div>
          <div className={styles.counterCard}>
            <span className={styles.counterLabel}>Your Batches</span>
            <strong className={styles.counterValue}>{ownedCount}</strong>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {!loading && !error && (
        <section className={styles.sectionWrap}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>YOUR BATCHES</h2>
            <span className={styles.sectionMeta}>{ownedCount} total</span>
          </div>

          {myBatches.length === 0 ? (
            <div className={styles.emptyCard}>
              <h2>No owned batches found</h2>
              <p>
                This section shows all batches where ownerId matches your
                consumer account.
              </p>
            </div>
          ) : (
            <section className={styles.grid}>
              {myBatches.map((batch) => {
                const location = [batch.farmCity, batch.farmState]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article key={batch.id} className={styles.card}>
                    {batch.cropImageUrl ? (
                      <img
                        src={batch.cropImageUrl}
                        alt={`${batch.cropType} batch`}
                        className={styles.productImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.imageFallback}>
                        No image available
                      </div>
                    )}

                    <div className={styles.cardTop}>
                      <div>
                        <span className={styles.batchCode}>{batch.id}</span>
                        <h2 className={styles.cropName}>
                          {batch.cropType}
                          {batch.variety ? ` · ${batch.variety}` : ""}
                        </h2>
                      </div>
                      {batch.status && (
                        <span className={styles.statusPill}>
                          {batch.status}
                        </span>
                      )}
                    </div>

                    <div className={styles.metricsRow}>
                      <span>
                        Qty: {batch.quantity ?? "-"} {batch.quantityUnit ?? ""}
                      </span>
                      <span>Quality: {batch.qualityScore ?? "-"}/100</span>
                      <span>Storage: {batch.storageType ?? "-"}</span>
                      <span>
                        Price:{" "}
                        {batch.pricePerUnit ? `INR ${batch.pricePerUnit}` : "-"}
                      </span>
                    </div>

                    <div className={styles.retailerBox}>
                      <p className={styles.retailerHeading}>Farm origin</p>
                      <p>{location || "Location not provided"}</p>
                    </div>

                    <button
                      className={styles.traceBtn}
                      onClick={() => navigate(`/batch/${batch.id}`)}
                    >
                      Open QR Scanned Page
                    </button>
                  </article>
                );
              })}
            </section>
          )}
        </section>
      )}

      {loading && (
        <p className={styles.stateText}>Loading available products...</p>
      )}
      {!loading && error && <p className={styles.errorText}>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <div className={styles.emptyCard}>
          {debouncedSearch ? (
            <>
              <h2>No matching products found</h2>
              <p>Try a different keyword to find products faster.</p>
            </>
          ) : (
            <>
              <h2>No products are marked available yet</h2>
              <p>
                Once retailers mark inventory as available, products will appear
                here with shop details.
              </p>
            </>
          )}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className={styles.searchRow}>
            <input
              type="search"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by product, batch id, retailer, or location"
              aria-label="Search products"
            />
            <span className={styles.searchMeta}>
              Showing {filteredProducts.length} of {products.length}
            </span>
          </div>

          {filteredProducts.length === 0 && (
            <div className={styles.emptyCard}>
              <h2>No matching products found</h2>
              <p>Try a different keyword to find products faster.</p>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <section className={styles.grid}>
              {filteredProducts.map((product) => {
                const location = [
                  product.retailerAddress,
                  product.retailerCity,
                  product.retailerState,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article key={product.id} className={styles.card}>
                    {product.cropImageUrl ? (
                      <img
                        src={product.cropImageUrl}
                        alt={`${product.cropType} product`}
                        className={styles.productImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.imageFallback}>
                        No image available
                      </div>
                    )}

                    <div className={styles.cardTop}>
                      <div>
                        <span className={styles.batchCode}>{product.id}</span>
                        <h2 className={styles.cropName}>
                          {product.cropType}
                          {product.variety ? ` · ${product.variety}` : ""}
                        </h2>
                      </div>
                      {product.status && (
                        <span className={styles.statusPill}>
                          {product.status}
                        </span>
                      )}
                    </div>

                    <div className={styles.metricsRow}>
                      <span>
                        Qty: {product.quantity ?? "-"}{" "}
                        {product.quantityUnit ?? ""}
                      </span>
                      <span>Quality: {product.qualityScore ?? "-"}/100</span>
                      <span>
                        Price:{" "}
                        {product.pricePerUnit
                          ? `INR ${product.pricePerUnit}`
                          : "-"}
                      </span>
                    </div>

                    <div className={styles.retailerBox}>
                      <p className={styles.retailerHeading}>
                        Retailer shop details
                      </p>
                      <p>
                        <strong>{product.retailerShopName}</strong> (
                        {product.retailerName})
                      </p>
                      <p>{location || "Location not provided"}</p>
                      <p>
                        {product.retailerPhone || "No phone"}
                        {product.retailerEmail
                          ? ` · ${product.retailerEmail}`
                          : ""}
                      </p>
                    </div>

                    <button
                      className={styles.traceBtn}
                      onClick={() => navigate(`/batch/${product.id}`)}
                    >
                      Open QR Scanned Page
                    </button>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </div>
  );
}
