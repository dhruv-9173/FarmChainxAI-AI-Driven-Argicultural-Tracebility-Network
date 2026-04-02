import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import VerifyOtpPage from "../features/auth/VerifyOtpPage";
import FarmerDashboard from "../features/farmer/FarmerDashboard";
import FarmerProfilePage from "../features/farmer/profile/FarmerProfilePage";
import FarmerBrowsePage from "../features/farmer/browse/FarmerBrowsePage";
import DistributorDashboard from "../features/distributor/DistributorDashboard";
import DistributorProfilePage from "../features/distributor/profile/DistributorProfilePage";
import DistributorBrowsePage from "../features/distributor/browse/DistributorBrowsePage";
import RetailerDashboard from "../features/retailer/RetailerDashboard";
import RetailerAnalyticsPage from "../features/retailer/analytics/RetailerAnalyticsPage";
import RetailerBrowsePage from "../features/retailer/browse/RetailerBrowsePage";
import RetailerProfilePage from "../features/retailer/profile/RetailerProfilePage";
import SuppliersDirectoryPage from "../features/retailer/suppliers/SuppliersDirectoryPage";
import ConsumerDashboard from "../features/consumer/ConsumerDashboard";
import QRScannedPageNew from "../features/qr/QRScannedPageNew";

import ProtectedRoute from "../components/common/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

const ROLE_DASHBOARD = {
  FARMER: "/farmer/dashboard",
  DISTRIBUTOR: "/distributor/dashboard",
  RETAILER: "/retailer/dashboard",
  CONSUMER: "/consumer/dashboard",
  ADMIN: "/admin/analytics",
} as const;

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const roleDashboardPath =
    isAuthenticated && user
      ? ROLE_DASHBOARD[user.role] ?? "/dashboard"
      : "/login";
  const defaultPath = roleDashboardPath;

  return (
    <Routes>
      {/* Public QR routes (must never require authentication) */}
      <Route path="/batch" element={<QRScannedPageNew />} />
      <Route path="/batch/:batchId" element={<QRScannedPageNew />} />
      <Route path="/batch/:batchId/*" element={<QRScannedPageNew />} />

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-registration-otp" element={<VerifyOtpPage />} />

      {/* Farmer routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navigate to={roleDashboardPath} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedRoute>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/profile"
        element={
          <ProtectedRoute>
            <FarmerProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/browse"
        element={
          <ProtectedRoute>
            <FarmerBrowsePage />
          </ProtectedRoute>
        }
      />

      {/* Distributor routes */}
      <Route
        path="/distributor/dashboard"
        element={
          <ProtectedRoute>
            <DistributorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/profile"
        element={
          <ProtectedRoute>
            <DistributorProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/farmers"
        element={
          <ProtectedRoute>
            <DistributorBrowsePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/browse"
        element={
          <ProtectedRoute>
            <DistributorBrowsePage />
          </ProtectedRoute>
        }
      />

      {/* Retailer routes */}
      <Route
        path="/retailer/dashboard"
        element={
          <ProtectedRoute>
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/analytics"
        element={
          <ProtectedRoute>
            <RetailerAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/browse"
        element={
          <ProtectedRoute>
            <RetailerBrowsePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/profile"
        element={
          <ProtectedRoute>
            <RetailerProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/suppliers"
        element={
          <ProtectedRoute>
            <SuppliersDirectoryPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}

      {/* Consumer routes */}
      <Route
        path="/consumer/dashboard"
        element={
          <ProtectedRoute>
            <ConsumerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
