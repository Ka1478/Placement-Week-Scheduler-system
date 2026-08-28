# Developer Guide & Defense Session Guide

## 1. Coding Standards & Conventions
- **TypeScript Strict Mode**: Enforce no implicit `any`, strict null checks.
- **Immutability**: Replan engine functions must produce clean new state copies without mutating global slot history.
- **Fail-Safe Diagnostics**: Unscheduled interviews must never be discarded silently. Always append diagnostic entries with reason codes (`CGPA_MISMATCH`, `STUDENT_TIME_BOTTLENECK`, `ROOM_CAPACITY_EXHAUSTED`).

---

## 2. Automated Test Execution

To execute the core test suite:
```bash
cd backend
npm test
```

### Test Coverage Checklist
- [x] **Dataset Generator**: 35 companies (3 tiers), 800 students (Gaussian CGPA distribution), 20 rooms.
- [x] **CSP Hard Constraints**: Zero student double-booking clashes.
- [x] **CSP Hard Constraints**: Zero CGPA cutoff violations.
- [x] **Soft Heuristic**: Schedule completion rate $\ge 95\%$.
- [x] **Minimal Churn Rule**: Disruption replan churn cap $\le 10\%$.

---

## 3. Defense Session Live Replay Strategy

During the defense session, reviewers will inject a live disruption (e.g. *"Day-1 recruiter Amazon is 3 hours late, Panel 1 dropped out, and 15 students withdrew"*).

### Step-by-Step Defense Replay Steps:
1. **Open Dashboard**: Navigate to `http://localhost:3000`.
2. **Review Initial Schedule Metrics**:
   - Verify Scheduled Rate: **100%**
   - Verify Student Clashes: **0**
   - Verify Room Utilization: **≥84%**
3. **Click "Inject Disruption & Replan" Button**:
   - Select **Company Arrives Late**.
   - Target Company: `Amazon SDE-1`.
   - Delay Hours: `3`.
   - Click **Execute Minimal Churn Replan**.
4. **Defend the Side-by-Side Diff Output**:
   - Demonstrate that total appointment churn is strictly bounded ($\le 10\%$).
   - Show how only Amazon slots on Day 1 were shifted forward without disturbing non-overlapping company slots.
   - Point out targeted SMS notifications generated for affected students.
