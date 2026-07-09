# OmniShield 🛡️
### Full-Stack Fraud Fingerprinting & Cash Routing Network Sandbox

[![Stack - Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-blue?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Stack - FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Stack - XGBoost](https://img.shields.io/badge/ML%20Engine-XGBoost-F57C00?style=flat-square&logo=xgboost)](https://xgboost.ai/)
[![Database - SQLite / PostgreSQL](https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL-4479A1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

**OmniShield** is a state-of-the-art enterprise fraud mitigation and cash routing sandbox built for banking anomaly detection. It enables risk investigators to ingest multi-channel transaction telemetry, evaluate emulated device farm threat patterns, map relationships using high-fidelity 2D force-directed graphs, and compile AI-driven compliance reports (FinCEN SAR filing standard) on demand.

---

## 🏗️ Architecture & Data Ingestion Flow

![Architecture Diagram](<Architecture diagram.png>)

---

## 🚀 Core Platform Features

### 1. Multi-Feed Ingest Infrastructure
* **Real-time Ingestion Pipeline**: Receives hardware profiles, network locations, and login velocities alongside money transfer streams.
* **Cyber complaint CSV Upload**: Support for standard local cyber crime registries (CSV) to retroactively match transaction logs and map suspected targets.
* **Cross-Channel Exception Engine**: Tracks background changes (e.g. rapid password failures, geolocation hops).

### 2. Behavioral Threat Profiler (`detector.py`)
* **IP Ingress Velocity Rules**: Detects if multiple unique account IDs execute money transfers from the exact same IP address or hardware fingerprint within a 5-minute window.
* **Retroactive Contagion Flagging**: Once a threat is validated, the system cascades the risk state to prior clean transfers within the time window.
* **Emulator Bot Check**: Identifies "Time-to-Transfer" (latency between login and transaction trigger). Latencies under `2.0 seconds` trigger automated emulator flags.

### 3. Interactive Network Investigation Sandbox
* **2D Canvas Graph Visualization**: An interactive, responsive canvas rendering accounts (nodes) and transfer directions (directional link paths).
* **Node Color Key**:
  * <span style="color:#0d9488">●</span> **Teal**: Normal active accounts.
  * <span style="color:#ef4444">●</span> **Red**: Suspected automated Device Farm accounts / Cyber complaints.
  * <span style="color:#3b82f6">●</span> **Blue**: Currently selected investigator focus target.
* **Quick Target Lock**: Interactive dropdown controls in the side panel to instantly select nodes without clicking.

### 4. Generative AI Compliance Compiler (SAR)
* Automatically extracts full relational database context (risk scores, complaints, velocities, and flows).
* Leverages **LangChain** to compile a professional, multi-paragraph **Suspicious Activity Report (SAR)** conforming to FinCEN compliance filing standards.
* Embedded template fallback ensures full operational continuity if remote LLM models are offline.

### 5. Explainable AI (XAI) Mule Classifier
* **High-Dimensional Inference**: Trained on a dataset with over 3,900 features predicting mule activities (ground truth labeled in `F3924`).
* **Explainable AI (XAI) Dashboard**: Deconstructs predictive weights to plot the top 10 most influential features contributing to a specific prediction.
* **Dynamic Dataset Testing**: Instantly loads real random test vectors from the training set via the `/api/ml-sample` endpoint to test classifier performance.

---

## 💻 Running the Application

### Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### Method 1: Serverless Full-Stack (Easier to deploy)
This unified approach runs the backend as serverless functions alongside the Next.js frontend. It uses a lightweight ONNX runtime for machine learning, completely avoiding heavy dependencies like XGBoost or Pandas to stay within AWS Lambda limits. This method is optimized for seamless deployment on **Vercel** or **Netlify**.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend and serverless Python dependencies:
   ```bash
   npm install
   pip install -r requirements.txt
   ```
3. Launch the unified development server:
   * **For Vercel**: run `vercel dev`
   * **For Netlify**: run `netlify dev`
   
   *Open **`http://localhost:3000`** in your browser. API requests are automatically routed to the serverless Python endpoints.*

### Method 2: Dedicated Backend Service (Better ML capabilities)
This approach runs the FastAPI backend as a standalone local service utilizing the full XGBoost and Scikit-Learn data science pipeline.

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Initialize virtual environment and activate:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS/Linux**:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```
   *The Swagger interactive documentation will be hosted at `http://localhost:8000/docs`.*

#### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```
4. Open **`http://localhost:3000`** in your browser.

---

## 🧠 Model Training Workflow

The XGBoost model binary is trained and deployed locally using standard pipelines.

1. Train the classifier using local dataset resources:
   ```bash
   python backend/train_model.py --data DataSet.csv --output backend/app/mule_model.pkl
   ```
2. The FastAPI backend automatically reads `mule_model.pkl` on startup.

---

## 🧪 Simulation and Seeding

To quickly populate the database with complex multi-channel scenarios (velocity flags, emulator triggers, government tickets, and alerts):

* Click the **"Re-seed DB"** button in the header navigation of the landing dashboard page (`http://localhost:3000`).
* Navigate to the **ML Analysis** or **Graph Workspace** tabs in the sidebar to test predictions and visualize relationship graphs.
