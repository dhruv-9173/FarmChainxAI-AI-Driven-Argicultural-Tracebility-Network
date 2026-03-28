# FarmChainxAI — Frontend (React + TypeScript + Vite)

This folder contains the **FarmChainxAI frontend** built with **React (v19)**, **TypeScript**, and **Vite**.  
It provides the UI for role-based supply-chain workflows (farmer / distributor / retailer / admin), authentication flows, and a **public traceability page** that can be opened directly from a QR code.

---

## Tech Stack

- **React 19 + TypeScript**
- **Vite** (dev server + build)
- **React Router DOM** (routing)
- **Axios** (API requests)
- **Context API** (Auth & Profile state)

---

## Project Location

Frontend root:

- `code/frontend/farmchainxAI`

---

## Getting Started

### 1) Prerequisites
- **Node.js** (recommended: latest LTS)
- **npm** (comes with Node)

### 2) Install dependencies
From the frontend folder:

```bash
cd code/frontend/farmchainxAI
npm install
```

### 3) Configure environment variables
This project uses an API client layer (`src/api/apiClient.ts`) and feature APIs under `src/api/*`.  
You will typically need to provide the backend base URL (and any auth-related config, depending on your backend setup).

Create a `.env` file in the frontend root:

```bash
# inside code/frontend/farmchainxAI/.env

# Example (adjust to your backend)
VITE_API_BASE_URL=http://localhost:5000
```

> Note: Vite only exposes variables prefixed with `VITE_` to the browser.

### 4) Run the development server
```bash
npm run dev
```

Vite will print the local URL (commonly `http://localhost:5173`).

### 5) Production build
```bash
npm run build
```

### 6) Preview production build locally
```bash
npm run preview
```

---

## Available Scripts

From `package.json`:

- `npm run dev` — start dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview production build

---

## Routing Overview

Routing is configured in:

- `src/App.tsx`
- `src/routes/AppRoutes.tsx`

### Public route (no auth required)
A public traceability route is exposed for scanning QR codes:

- `GET /batch/:batchId`

This renders:

- `src/features/qr/QRScannedPageNew`

This route is intentionally **outside** of auth providers so consumers can view batch traceability data without logging in.

### Authenticated app routes
All other routes (`/*`) are wrapped with:

- `AuthProvider` (`src/contexts/AuthContext.tsx`)
- `ProfileProvider` (`src/contexts/ProfileContext.tsx`)

These providers handle login state and profile/session data for the rest of the app.

---

## Folder Structure

High-level structure (key folders):

```text
code/frontend/farmchainxAI
├─ public/
│  └─ photo-1511735643442-503bb3bd348a.avif
├─ src/
│  ├─ api/                 # Axios client + backend API wrappers
│  ├─ components/          # Shared UI components
│  ├─ contexts/            # React Context providers (auth/profile)
│  ├─ features/            # Feature modules by domain/role
│  ├─ hooks/               # Reusable hooks (login/register/transfer/otp/etc.)
│  ├��� routes/              # App routing definition
│  ├─ types/               # TypeScript types per domain
│  ├─ utils/               # Helpers (including validation)
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ index.html
├─ vite.config.ts
├─ tsconfig*.json
└─ package.json
```

---

## API Layer

API logic is organized under `src/api/`:

- `apiClient.ts` — central Axios client, base URL setup, and request/response behavior
- `authApi.ts` — authentication endpoints (login/register/OTP/forgot-password depending on implementation)
- `blockchainApi.ts` — blockchain / traceability endpoints
- `transferApi.ts` — transfer / supply-chain handoff operations
- `consumerApi.ts` — consumer-facing traceability APIs
- `browseApi.ts` — browsing/listing APIs
- `analyticsApi.ts` — analytics / dashboard APIs
- `notificationApi.ts` — notifications APIs
- `qualityCheckApi.ts` — quality check APIs
- `retailerApi.ts` — retailer specific APIs

> Tip: if the backend URL changes per environment (dev/stage/prod), prefer setting it via `VITE_API_BASE_URL`.

---

## State Management

This project uses React Context:

- `AuthContext` (`src/contexts/AuthContext.tsx`)
  - Stores and exposes authentication state & actions
  - Commonly consumed via the `useAuth` hook

- `ProfileContext` (`src/contexts/ProfileContext.tsx`)
  - Stores and exposes user profile-related state

Custom hooks live under:

- `src/hooks/`
  - Examples: `useLogin`, `useRegister`, `useForgotPassword`, `useVerifyOtp`, `useTransfer`, `useNotifications`, etc.

---

## Features

Feature modules are grouped by business domain / role under `src/features/`, such as:

- `features/auth/` — login/register/otp flows (UI pages/components)
- `features/farmer/` — farmer workflow
- `features/distributor/` — distributor workflow
- `features/retailer/` — retailer workflow
- `features/admin/` — admin dashboard/workflow
- `features/transfer/` — asset/batch transfer flow
- `features/qr/` — QR scan and batch traceability UI

---

## Types

Domain types are kept under `src/types/`, for example:

- `auth.types.ts`
- `blockchain.types.ts`
- `dashboard.types.ts`
- `distributor.types.ts`
- `notification.types.ts`
- `transfer.types.ts`

Keeping types centralized makes API and UI code more consistent and safer.

---

## Linting

Run ESLint:

```bash
npm run lint
```

---

## Troubleshooting

### Blank page / routing not working in production
If deploying behind a static host, ensure it supports SPA routing (serving `index.html` for unknown routes) so routes like `/batch/:batchId` work.

### API calls failing (CORS / network)
- Confirm `VITE_API_BASE_URL` points to the correct backend URL.
- Ensure the backend enables CORS for the frontend origin.

### Node/Vite issues
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## Contributing (Frontend)

Suggested workflow:
1. Create a new branch
2. Make changes in `src/`
3. Run:
   ```bash
   npm run lint
   npm run build
   ```
4. Open a PR with screenshots (if UI changes)

---

## License
See the repository root for licensing information.
