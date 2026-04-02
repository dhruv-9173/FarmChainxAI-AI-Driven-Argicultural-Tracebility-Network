import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import AppRoutes from "./routes/AppRoutes";
import QRScannedPageNew from "./features/qr/QRScannedPageNew";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public QR traceability page — no auth context required */}

      <Route path="/batch/:batchId/*" element={<QRScannedPageNew />} />

      {/* All authenticated routes wrapped with AuthProvider */}
      <Route
        path="/*"
        element={
          <AuthProvider>
            <ProfileProvider>
              <AppRoutes />
            </ProfileProvider>
          </AuthProvider>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
