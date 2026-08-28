# Architecture Overview: The Placement Week Scheduler

## System Architecture

The Placement Week Scheduler is a distributed, high-performance interview scheduling and real-time replan system designed for high-stress placement drives (35 companies, 800 students, 20 interview rooms across 4 days).

```
 +-----------------------------------------------------------------------+
 |                     Coordinator Dashboard (React 18 + MUI)           |
 |  - Schedule Matrix & Visual Gantt Chart  - Real-Time Conflict Alerts  |
 |  - Side-by-Side Replan Diff Viewer       - Role Views (Coord/HR/Stu)  |
 +-----------------------------------+-----------------------------------+
                                     |
                         REST / GraphQL / WebSockets
                                     |
 +-----------------------------------v-----------------------------------+
 |                        NestJS Backend Core Engine                     |
 |  +--------------------+  +----------------------+  +---------------+  |
 |  | Dataset Generator  |  | Backtracking CSP     |  | Bounded Churn |  |
 |  | (Realistic Seed)   |  | Solver (Heuristics)  |  | Replan Engine |  |
 |  +--------------------+  +----------------------+  +---------------+  |
 +------------------+------------------------------------+---------------+
                    |                                    |
          +---------v----------+              +----------v----------+
          |  PostgreSQL DB     |              |    MongoDB DB       |
          |  (Relational Data: |              |    (Event Audit     |
          |   Students, Rooms, |              |     Logs, Replan    |
          |   Schedules)       |              |     Diff History)   |
          +--------------------+              +---------------------+
```

---

## 1. Data Schemas & Models

### Relational Schema (PostgreSQL / SQLite)

#### `companies`
- `id` (PK, String): Unique identifier (e.g. `COMP-DAY1-1`)
- `name` (String): Company display name (e.g. `Amazon SDE-1`)
- `priority_tier` (Enum): `DAY_1_MASS`, `TIER_1_PRODUCT`, `TIER_2_REGULAR`
- `cgpa_cutoff` (Float): Minimum required CGPA (e.g. `8.2`)
- `interview_duration` (Int): Minutes per slot (`30`, `45`, `60`)
- `panels_count` (Int): Number of parallel interview panels

#### `students`
- `id` (PK, String): Student Roll No (e.g. `STU-1045`)
- `name` (String): Candidate name
- `branch` (Enum): `CSE`, `ECE`, `EEE`, `MECH`, `CIVIL`
- `cgpa` (Float): Academic CGPA (e.g. `8.75`)
- `shortlisted_company_ids` (JSON Array): List of companies shortlisting student

#### `rooms`
- `id` (PK, String): Room identifier (e.g. `ROOM-101`)
- `building` (String): Campus block (e.g. `Block-A`)
- `panels_available` (Int): Number of active panels hosted
- `is_available` (Boolean): Operational status

#### `schedules`
- `id` (PK, String): Slot ID (e.g. `SLOT-1042`)
- `student_id` (FK): Student reference
- `company_id` (FK): Company reference
- `room_id` (FK): Room reference
- `panel_id` (String): Panel tag (e.g. `Panel 1`)
- `day` (Int): Day 1, 2, 3, or 4
- `start_time` (String): Format `"09:00"`
- `end_time` (String): Format `"09:45"`
- `status` (Enum): `SCHEDULED`, `RESCHEDULED`, `CANCELED`

### Document Store (MongoDB Event Logs)

#### `replan_diffs`
- `disruption_id` (String)
- `disruption_type` (Enum): `COMPANY_DELAY`, `PANEL_DROP`, `STUDENT_WITHDRAWAL`, `ROOM_UNAVAILABLE`
- `timestamp` (ISO String)
- `summary` (Object): `{ movedAppointmentsCount, canceledCount, churnPercentage }`
- `changes` (Array of Objects): Detailed Before vs After mapping
- `notifications` (Array of Objects): Targeted notification logs

---

## 2. CSP Solver Algorithm & Heuristics

The CSP engine formulates placement scheduling as a Constraint Satisfaction Problem:

1. **Hard Constraints (Strict Enforced)**:
   - **Student Uniqueness**: $\forall s_i, s_j \in \text{Slots}, \text{Student}(s_i) = \text{Student}(s_j) \implies \text{Overlap}(s_i, s_j) = 0$.
   - **Room/Panel Capacity**: $\forall s_i, s_j \in \text{Slots}, \text{Panel}(s_i) = \text{Panel}(s_j) \implies \text{Overlap}(s_i, s_j) = 0$.
   - **Academic Cutoff**: $\text{CGPA}(\text{Student}(s)) \ge \text{Cutoff}(\text{Company}(s))$.
2. **Variable Ordering**:
   - Priority Tier Ordering (Day-1 Mass recruiters scheduled first on Days 1-2).
   - Minimum Remaining Values (MRV): Students shortlisted by many companies scheduled earlier to prevent schedule bottlenecks.
3. **Value Ordering**:
   - Least Constraining Value (LCV): Select time slots that minimize consecutive student wait time buffer windows.

---

## 3. Minimal Churn Replan Algorithm

During live campus disruptions:
- Cost function $C = \text{MovedSlots} + 10 \times \text{CanceledSlots}$.
- Bounded Churn Cap: Replan engine enforces $\text{ChurnRate} \le 10\%$.
- Generates JSON patch diff isolating moved vs kept appointments.
