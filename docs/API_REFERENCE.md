# API Reference: The Placement Week Scheduler

## RESTful API Endpoints

### 1. `GET /api/schedule`
Retrieves master schedule slots with optional query filtering.

**Query Parameters**:
- `day` (optional, number): Filter by day (`1`, `2`, `3`, `4`)
- `companyId` (optional, string): Filter by company
- `studentId` (optional, string): Filter by student
- `roomId` (optional, string): Filter by room

**Response (200 OK)**:
```json
{
  "slots": [
    {
      "id": "SLOT-1",
      "studentId": "STU-1001",
      "companyId": "COMP-DAY1-1",
      "roomId": "ROOM-1",
      "panelId": "Panel 1",
      "day": 1,
      "startTime": "09:00",
      "endTime": "09:30",
      "status": "SCHEDULED"
    }
  ],
  "totalCount": 1
}
```

---

### 2. `GET /api/metrics`
Returns real-time schedule metrics and constraint feasibility KPIs.

**Response (200 OK)**:
```json
{
  "totalShortlistedInterviews": 5967,
  "totalScheduledInterviews": 5967,
  "scheduledPercentage": 100.0,
  "studentClashCount": 0,
  "studentClashPercentage": 0.0,
  "roomUtilizationPercentage": 84.5,
  "averageWaitTimeMinutes": 22.4,
  "replanChurnPercentage": 0.0,
  "isFeasible": true,
  "unscheduledCount": 0
}
```

---

### 3. `POST /api/replan`
Triggers real-time disruption handling and returns minimal churn diff.

**Request Body**:
```json
{
  "type": "COMPANY_DELAY",
  "targetId": "COMP-DAY1-1",
  "params": {
    "delayHours": 2,
    "affectedDay": 1
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "diff": {
    "disruptionId": "DISRUPT-1710000000",
    "disruptionType": "COMPANY_DELAY",
    "summary": {
      "totalAppointmentsBefore": 5967,
      "movedAppointmentsCount": 8,
      "canceledCount": 0,
      "churnPercentage": 0.1
    },
    "changes": [
      {
        "interviewId": "SLOT-1",
        "studentId": "STU-1001",
        "studentName": "Aarav Sharma",
        "companyName": "TCS Digital",
        "oldTime": "09:00 - 09:30",
        "newTime": "11:00 - 11:30",
        "action": "MOVED"
      }
    ],
    "notifications": [
      {
        "recipientId": "STU-1001",
        "recipientRole": "STUDENT",
        "channel": "SMS",
        "message": "UPDATE: TCS Digital delayed by 2 hours. Interview rescheduled to 11:00."
      }
    ]
  }
}
```

---

## GraphQL API Reference

Endpoint: `POST /graphql` (Or interactive GraphiQL console at `http://localhost:4000/graphql`)

### Example Queries

#### Query Student Personal Schedule
```graphql
query GetStudentSchedule {
  studentSchedule(studentId: "STU-1001") {
    id
    companyId
    roomId
    panelId
    day
    startTime
    endTime
    status
  }
}
```

#### Query System Metrics
```graphql
query GetMetrics {
  metrics {
    scheduledPercentage
    studentClashCount
    roomUtilizationPercentage
    averageWaitTimeMinutes
    isFeasible
  }
}
```
