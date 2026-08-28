import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { ScheduleRepository } from './store/repository';
import { DisruptionEvent } from './types';

const app = express();
app.use(cors());
app.use(express.json());

const repository = ScheduleRepository.getInstance();

// -------------------------------------------------------------
// RESTful API Endpoints
// -------------------------------------------------------------

// 1. Get Schedule State
app.get('/api/schedule', (req, res) => {
  const day = req.query.day ? parseInt(req.query.day as string, 10) : undefined;
  const companyId = req.query.companyId as string;
  const studentId = req.query.studentId as string;
  const roomId = req.query.roomId as string;

  let slots = repository.getSlots();

  if (day) slots = slots.filter(s => s.day === day);
  if (companyId) slots = slots.filter(s => s.companyId === companyId);
  if (studentId) slots = slots.filter(s => s.studentId === studentId);
  if (roomId) slots = slots.filter(s => s.roomId === roomId);

  res.json({
    slots,
    totalCount: slots.length
  });
});

// 2. Get Metadata (Companies, Students, Rooms)
app.get('/api/metadata', (req, res) => {
  res.json({
    companies: repository.getCompanies(),
    students: repository.getStudents(),
    rooms: repository.getRooms()
  });
});

// 3. Get Live Metrics
app.get('/api/metrics', (req, res) => {
  res.json(repository.getMetrics());
});

// 4. Get Unscheduled Interviews Diagnostics
app.get('/api/unscheduled', (req, res) => {
  res.json({
    unscheduled: repository.getUnscheduled(),
    count: repository.getUnscheduled().length
  });
});

// 5. Trigger Replan Under Disruption
app.post('/api/replan', (req, res) => {
  const { type, targetId, params } = req.body;

  if (!type || !targetId) {
    return res.status(400).json({ error: 'Missing required disruption parameters: type, targetId' });
  }

  const disruption: DisruptionEvent = {
    id: `DISRUPT-${Date.now()}`,
    type,
    timestamp: new Date().toISOString(),
    targetId,
    params: params || {}
  };

  const diff = repository.executeReplan(disruption);
  res.json({
    success: true,
    diff,
    updatedMetrics: repository.getMetrics()
  });
});

// 6. Get Replan Diff History
app.get('/api/diff-history', (req, res) => {
  res.json(repository.getReplanDiffHistory());
});

// 7. Get System Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json(repository.getAuditLogs());
});

// 8. Reset / Reseed System
app.post('/api/seed/reset', (req, res) => {
  const seed = req.body.seed ? parseInt(req.body.seed, 10) : 42;
  repository.initialize(seed);
  res.json({
    message: 'System reset and re-scheduled successfully',
    metrics: repository.getMetrics()
  });
});

// -------------------------------------------------------------
// GraphQL API Endpoint
// -------------------------------------------------------------

const gqlSchema = buildSchema(`
  type ScheduleSlot {
    id: String!
    studentId: String!
    companyId: String!
    roomId: String!
    panelId: String!
    day: Int!
    startTime: String!
    endTime: String!
    status: String!
  }

  type ScheduleMetrics {
    scheduledPercentage: Float!
    studentClashCount: Int!
    studentClashPercentage: Float!
    roomUtilizationPercentage: Float!
    averageWaitTimeMinutes: Float!
    replanChurnPercentage: Float!
    isFeasible: Boolean!
    unscheduledCount: Int!
  }

  type Query {
    studentSchedule(studentId: String!): [ScheduleSlot]
    companySchedule(companyId: String!): [ScheduleSlot]
    roomSchedule(roomId: String!, day: Int): [ScheduleSlot]
    metrics: ScheduleMetrics
  }
`);

const gqlRoot = {
  studentSchedule: ({ studentId }: { studentId: string }) => {
    return repository.getSlots().filter(s => s.studentId === studentId);
  },
  companySchedule: ({ companyId }: { companyId: string }) => {
    return repository.getSlots().filter(s => s.companyId === companyId);
  },
  roomSchedule: ({ roomId, day }: { roomId: string; day?: number }) => {
    return repository.getSlots().filter(s => s.roomId === roomId && (!day || s.day === day));
  },
  metrics: () => {
    return repository.getMetrics();
  }
};

app.use('/graphql', graphqlHTTP({
  schema: gqlSchema,
  rootValue: gqlRoot,
  graphiql: true
}));

export default app;
