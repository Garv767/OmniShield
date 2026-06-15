# OmniShield Frontend Client Application 🛡️

This folder contains the Next.js frontend client application for **OmniShield** - a real-time anomaly detection and fraud investigation sandbox workspace.

---

## 🚀 Key Client Subsystems

1. **Dashboard (`src/app/page.tsx`)**
   * Displays aggregate operational statistics (Estimated Fraud Volume, Complaints, Alerts).
   * Renders real-time transaction ingestion telemetry feed with interactive inspection panels.
   * Includes custom canvas-based particle network animation (`FraudCanvas.tsx`) reflecting system throughput.

2. **Graph Workspace Sandbox (`src/app/network-investigation/page.tsx`)**
   * Employs interactive `react-force-graph-2d` visualization displaying cash-routing transactions.
   * Automatically isolates anomalies (Red) from normal active transactions (Teal).
   * Implements AI Auto-Report Compilers (FinCEN SAR standard drafts) and quick-select search capabilities.

3. **AI/ML Mule Classification (`src/app/ml-analysis/page.tsx`)**
   * Features Explainable AI (XAI) feature contribution charts.
   * Provides real-time mule classification confidence meters.
   * Leverages the FastAPI backend classifier models for test sample predictions.

4. **Transaction Simulator (`src/app/simulator/page.tsx`)**
   * Custom parameters injector to simulate transaction payloads, evaluating IP velocity limit rules and emulator flags.

5. **Blocklist registry (`src/app/blocklist/page.tsx`)**
   * Manage actively restricted IP addresses and device hardware fingerprints.

6. **Cyber Complaint Ingest (`src/app/tickets/page.tsx`)**
   * Ingest local cyber complaint registries via CSV files conforming to local standards.

---

## 🛠️ Tech Stack & Styling Guidelines

* **Framework**: Next.js 15 (App Router & Server Component architecture)
* **Styling**: Tailwind CSS & Vanilla CSS configurations in `src/app/globals.css`
* **Custom Color Palette**:
  * Light theme backgrounds with high-contrast slate colors (`bg-slate-50`, `bg-white`, borders `border-slate-200`)
  * Lime Green accents for highlights and action states (`#A0D585`, `#EEFABD`, `#C7EABB`, `#E8F5BD`)
  * Higher contrast icons and text headers for elegant visibility
* **Icons**: Lucide React
* **Force-Directed Graph**: `react-force-graph-2d`

---

## 💻 Getting Started

### 1. Install Packages
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```

The application will be served locally at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```
This builds and compiles optimized static pages, verifying TypeScript types and code lint standards.
