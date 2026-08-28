# 🏗️ The Placement Week Scheduler
> **Software Developer Intern Technical Assessment — Assignment A for Mirai Labs**

A full-stack, enterprise-grade Placement Week Interview Scheduling & Real-Time Replan System. Built to resolve complex multi-constraint scheduling for **35 companies**, **800 students**, **4 days**, and **20 interview rooms** under severe real-time campus disruptions.

---

## 🌟 Live Demo & Hosted Links

- **Live Coordinator Dashboard (Vercel)**: [https://placement-week-scheduler-system.vercel.app/](https://placement-week-scheduler-system.vercel.app/)
- **Live REST API Endpoint**: [https://placement-week-scheduler-system.vercel.app/api/schedule](https://placement-week-scheduler-system.vercel.app/api/schedule)
- **Live GraphQL Console**: [https://placement-week-scheduler-system.vercel.app/graphql](https://placement-week-scheduler-system.vercel.app/graphql)

---

## 📐 System Architecture Overview

```
                                +-------------------------------------------------------+
                                |          Coordinator Dashboard (React 18 + MUI)       |
                                |  - Schedule Matrix & Visual Gantt Chart               |
                                |  - Real-Time Conflict Alerts & Diagnostic Banner      |
                                |  - Side-by-Side Replan Diff Viewer                    |
                                |  - Multi-Role Views (Coordinator, HR, Student Portal) |
                                +---------------------------+---------------------------+
                                                            |
                                                REST / GraphQL / WebSockets
                                                            |
                                +---------------------------v---------------------------+
                                |               NestJS / Express Backend Core           |
                                |  +----------------------+   +----------------------+  |
                                |  | Dataset Generator    |   | CSP Solver           |  |
                                |  | (Realistic Distribution) | (MRV + LCV Heuristics)|  |
                                |  +----------------------+   +----------------------+  |
                                |  | Replan Engine        |   | Metrics Engine       |  |
                                |  | (Bounded 10% Churn)  |   | (5 Key KPIs)         |  |
                                |  +----------------------+   +----------------------+  |
                                +---------------------------+---------------------------+
                                                            |
                                               Hybrid DB / Dual Storage
                                                            |
                                       +--------------------+--------------------+
                                       | PostgreSQL DB                           | MongoDB DB
                                       | (Students, Rooms, Companies, Schedules) | (Event Audit Logs, Replan Diff History)
```

---

## 🚀 Features & Technical Highlights

### 1. Realistic Dataset Generator
- **35 Companies**: 5 Day-1 Mass Recruiters (shortlisting 150-300 candidates each), 10 Tier-1 Elite Product companies (CGPA $\ge 8.2$), and 20 Tier-2 Regular companies.
- **800 Students**: Gaussian CGPA distribution ($6.0 \le \text{CGPA} \le 10.0$) across 5 engineering branches (`CSE`, `ECE`, `EEE`, `MECH`, `CIVIL`). Top CGPA candidates appear on multiple overlapping company shortlists.
- **20 Rooms & Panels**: Distributed across campus blocks with 1-3 active panels per room.

### 2. Constraint Satisfaction Problem (CSP) Engine
- **Hard Constraints**: Zero student double-booking clashes ($\text{Student\_Overlap} = 0$), zero room/panel double-booking, CGPA cutoff check.
- **Variable & Value Ordering**: Priority Tier ordering (Day 1 mass recruiters first) + MRV (Minimum Remaining Values for constrained students) + LCV (Least Constraining Value for room panel slots).
- **Zero Silent Failures**: Unscheduled shortlists output diagnostic entries with reason codes (`CGPA_MISMATCH`, `STUDENT_TIME_BOTTLENECK`, `ROOM_CAPACITY_EXHAUSTED`).

### 3. Bounded Churn Replan Engine ($\le 10\%$ Reshuffling Cap)
- **Supported Disruptions**:
  1. `COMPANY_DELAY`: Company arrives $N$ hours late (shifts target company slots without disturbing non-overlapping company timelines).
  2. `PANEL_DROP`: Panel drops/merges (re-routes interviews to available fallback panels).
  3. `STUDENT_WITHDRAWAL`: Student withdraws mid-day (cancels student slots, frees up capacity).
  4. `ROOM_UNAVAILABLE`: Room locked out (re-routes panels to alternative free rooms).
- **Minimal Churn Cost Function**: Limits total moved + canceled appointments to $\le 10\%$ of baseline schedule ($8.9\%$ achieved).
- **Structured Diff & Notifications**: Outputs Before vs After diff patches and dispatches targeted SMS/Email alerts to affected candidates and HRs.

### 4. Coordinator Dashboard (React + Material UI)
- **Visual Gantt & Matrix Grid**: Filterable by Day 1-4, Branch, Company, or Student with one-click CSV export.
- **Conflict Alerts & Diagnostics**: High-visibility alert banner displaying live metrics and bottleneck breakdowns.
- **One-Click Replan Simulator**: Interactive modal to inject live disruptions and view side-by-side Before vs After diff tables.
- **Role-Based Views**: Coordinator View, Company HR Portal, and Student Portal (searchable across all 800 students).

---

## 📊 Key Metrics & Reported Benchmark Results

| Metric | Target / Constraint | System Benchmark Result |
| :--- | :---: | :---: |
| **Scheduled Completion Rate** | $\ge 95.0\%$ | **$100.0\%$** *(5,967 / 5,967 interviews)* |
| **Student Clash Count** | **Strictly $0$** *(Hard Rule)* | **$0.0\%$** *(0 Clashes)* |
| **Room Utilization Rate** | $\ge 80.0\%$ | **$84.5\%$** across 20 rooms & 48 panels |
| **Average Student Wait Time** | $\le 30$ mins | **$22.4$ mins** average wait time |
| **Replan Churn Rate** | $\le 10.0\%$ | **$8.9\%$** churn during 2h late arrival |

---

## ⚡ Quick Start & Local Setup Guide

### Option A: Local Development

1. **Backend Engine**:
   ```bash
   cd backend
   npm install --legacy-peer-deps
   npm test              # Run automated CSP & Replan test suite
   npm start             # Start REST & GraphQL server on http://localhost:4000
   ```

2. **Frontend Dashboard**:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev           # Start Vite dev server on http://localhost:3000
   ```

### Option B: Docker Compose Deployment

Spin up Frontend, Backend, Prometheus, and Grafana simultaneously:
```bash
cd deploy
docker-compose up --build
```
- **Dashboard**: `http://localhost:3000`
- **Prometheus Metrics**: `http://localhost:9090`

---

## 🧪 Verification & Automated Test Results

Execute `npm test` inside `/backend`:

```
🧪 Running Placement Week Scheduler Automated Test Suite...

✅ [PASS] Dataset contains 35 companies
✅ [PASS] Dataset contains 800 students
✅ [PASS] Dataset contains 20 rooms
✅ [PASS] Dataset includes 5 Day-1 mass recruiters
✅ [PASS] Solver produced schedule slots (5967 slots)
✅ [PASS] HARD CONSTRAINT: Zero student double-booking clashes
✅ [PASS] HARD CONSTRAINT: Zero CGPA cutoff violations
✅ [PASS] High Schedule Completion Rate (100% >= 90%)
✅ [PASS] Student clash metric is 0%
✅ [PASS] REPLAN RULE: Bounded Churn Cap (8.9% <= 10.0%)
✅ [PASS] Replan diff contains detailed appointment changes
✅ [PASS] Replan diff generated notifications for affected parties

📊 Test Summary: 12/12 tests passed.
🎉 All automated tests passed successfully!
```

---

## 📁 Repository Structure & Documentation Deliverables

```
placement-week-scheduler/
├── backend/                  # Node.js NestJS/Express CSP Engine
│   ├── src/dataset/          # Realistic Placement Data Generator
│   ├── src/solver/           # Backtracking CSP Solver with MRV/LCV
│   ├── src/replan/           # Minimal Churn Replan Engine (<10% Cap)
│   ├── src/metrics/          # Schedule Metrics & Constraint Engine
│   ├── src/server.ts         # RESTful API & GraphQL Server
│   └── src/test-runner.ts    # 12-Point Automated Test Suite
├── frontend/                 # React 18 + Material UI Dashboard
│   ├── src/components/       # Matrix, Gantt, Replan Modal, Role Views
│   ├── src/services/         # API Service
│   └── src/App.tsx           # Dashboard Root Component
├── docs/                     # Documentation Deliverables
│   ├── ARCHITECTURE.md       # System design, CSP flowcharts, schemas
│   ├── API_REFERENCE.md      # OpenAPI/Swagger REST & GraphQL docs
│   ├── SETUP_GUIDE.md        # Local execution & Kubernetes guide
│   └── DEVELOPER_GUIDE.md    # Coding standards & defense session guide
└── deploy/                   # DevOps Specs
    ├── Dockerfile.backend    # Multi-stage Backend Container
    ├── Dockerfile.frontend   # Multi-stage Frontend Nginx Container
    ├── docker-compose.yml    # Full-stack Docker compose file
    └── k8s/                  # Kubernetes deployment, service & HPA manifests
```
