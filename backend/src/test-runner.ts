import { DatasetGenerator } from './dataset/generator';
import { CSPSolver } from './solver/csp-solver';
import { ReplanEngine } from './replan/replan-engine';
import { MetricsEngine } from './metrics/metrics-engine';
import { DisruptionEvent } from './types';

function runTests() {
  console.log('🧪 Running Placement Week Scheduler Automated Test Suite...\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalCount++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? `: ${detail}` : ''}`);
    }
  }

  // Test 1: Dataset Generation
  const dataset = DatasetGenerator.generate(42);
  assert(dataset.companies.length === 35, 'Dataset contains 35 companies');
  assert(dataset.students.length === 800, 'Dataset contains 800 students');
  assert(dataset.rooms.length === 20, 'Dataset contains 20 rooms');

  const day1Recruiters = dataset.companies.filter(c => c.priorityTier === 'DAY_1_MASS');
  assert(day1Recruiters.length === 5, 'Dataset includes 5 Day-1 mass recruiters');

  // Test 2: CSP Solver Hard & Soft Constraints
  const solver = new CSPSolver(dataset.companies, dataset.students, dataset.rooms);
  const solution = solver.solve();

  assert(solution.slots.length > 0, `Solver produced schedule slots (${solution.slots.length} slots)`);

  // Hard Constraint: Zero Student Double Booking
  const studentDaySlots = new Map<string, typeof solution.slots>();
  solution.slots.forEach(slot => {
    const key = `${slot.studentId}_D${slot.day}`;
    const list = studentDaySlots.get(key) || [];
    list.push(slot);
    studentDaySlots.set(key, list);
  });

  let studentDoubleBooked = false;
  studentDaySlots.forEach(slots => {
    slots.sort((a, b) => a.startMinutes - b.startMinutes);
    for (let i = 0; i < slots.length - 1; i++) {
      if (slots[i].endMinutes > slots[i + 1].startMinutes) {
        studentDoubleBooked = true;
      }
    }
  });

  assert(!studentDoubleBooked, 'HARD CONSTRAINT: Zero student double-booking clashes');

  // Hard Constraint: CGPA Cutoff
  const companyMap = new Map(dataset.companies.map(c => [c.id, c]));
  const studentMap = new Map(dataset.students.map(s => [s.id, s]));

  let cgpaViolation = false;
  solution.slots.forEach(slot => {
    const student = studentMap.get(slot.studentId);
    const company = companyMap.get(slot.companyId);
    if (student && company && student.cgpa < company.cgpaCutoff) {
      cgpaViolation = true;
    }
  });

  assert(!cgpaViolation, 'HARD CONSTRAINT: Zero CGPA cutoff violations');

  // Test 3: Metrics Calculation
  let totalShortlist = 0;
  dataset.students.forEach(s => totalShortlist += s.shortlistedCompanyIds.length);
  const metrics = MetricsEngine.calculate(solution.slots, solution.unscheduled, totalShortlist, dataset.rooms, dataset.students);

  assert(metrics.scheduledPercentage >= 90.0, `High Schedule Completion Rate (${metrics.scheduledPercentage}% >= 90%)`);
  assert(metrics.studentClashPercentage === 0.0, 'Student clash metric is 0%');

  // Test 4: Replan Engine Under Disruption (Minimal Churn Test)
  const replanEngine = new ReplanEngine(solution.slots, dataset.companies, dataset.students, dataset.rooms);

  const delayDisruption: DisruptionEvent = {
    id: 'TEST-DISRUPT-1',
    type: 'COMPANY_DELAY',
    timestamp: new Date().toISOString(),
    targetId: 'COMP-DAY1-1',
    params: { delayHours: 2, affectedDay: 1 }
  };

  const replanResult = replanEngine.executeReplan(delayDisruption);
  assert(replanResult.diff.summary.churnPercentage <= 10.0, `REPLAN RULE: Bounded Churn Cap (${replanResult.diff.summary.churnPercentage}% <= 10.0%)`);
  assert(replanResult.diff.changes.length > 0, 'Replan diff contains detailed appointment changes');
  assert(replanResult.diff.notifications.length > 0, 'Replan diff generated notifications for affected parties');

  console.log(`\n📊 Test Summary: ${passedCount}/${totalCount} tests passed.`);
  if (passedCount === totalCount) {
    console.log('🎉 All automated tests passed successfully!\n');
  } else {
    process.exit(1);
  }
}

runTests();
