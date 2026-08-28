# Setup & Deployment Guide: The Placement Week Scheduler

## 1. Local Development Setup

### Prerequisites
- Node.js v18+ or v24+
- npm v9+

### Quick Start (Local Standalone Mode)

1. **Backend Engine**:
   ```bash
   cd backend
   npm install --legacy-peer-deps
   npm test              # Runs automated CSP & Replan test suite
   npm start             # Starts Express REST & GraphQL server on http://localhost:4000
   ```

2. **Frontend Dashboard**:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev           # Starts Vite dev server on http://localhost:3000
   ```

---

## 2. Containerized Deployment with Docker Compose

Run full stack (Frontend, Backend REST & GraphQL, Prometheus, Grafana) with a single command:

```bash
cd deploy
docker-compose up --build -d
```

### Access Services:
- **Coordinator Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000/api/schedule`
- **GraphQL Console**: `http://localhost:4000/graphql`
- **Prometheus Monitoring**: `http://localhost:9090`
- **Grafana Metrics Dashboard**: `http://localhost:3001` (Credentials: `admin`/`admin`)

---

## 3. Kubernetes (K8s) Cluster Deployment

Deploy scalable microservices to Kubernetes:

```bash
kubectl apply -f deploy/k8s/deployment.yaml
kubectl apply -f deploy/k8s/service.yaml
kubectl apply -f deploy/k8s/hpa.yaml
```

Check cluster status:
```bash
kubectl get pods -n placement-scheduler
kubectl get svc -n placement-scheduler
```
