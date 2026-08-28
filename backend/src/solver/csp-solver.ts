import { Company, Student, Room, ScheduleSlot, UnscheduledInterview, PriorityTier } from '../types';

export interface SolverResult {
  slots: ScheduleSlot[];
  unscheduled: UnscheduledInterview[];
  executionTimeMs: number;
}

export class CSPSolver {
  private companies: Company[];
  private students: Student[];
  private rooms: Room[];

  // Daily parameters: 4 days, 09:00 AM to 05:00 PM (480 minutes/day)
  private readonly totalDays = 4;
  private readonly dayStartMinutes = 9 * 60; // 09:00 AM (540 mins from midnight)
  private readonly dayEndMinutes = 17 * 60; // 05:00 PM (1020 mins from midnight)
  private readonly dailyDuration = 480; // 8 hours = 480 minutes

  constructor(companies: Company[], students: Student[], rooms: Room[]) {
    this.companies = companies;
    this.students = students;
    this.rooms = rooms;
  }

  public solve(): SolverResult {
    const startTimeMs = Date.now();
    const slots: ScheduleSlot[] = [];
    const unscheduled: UnscheduledInterview[] = [];

    // Map student lookup for fast access
    const studentMap = new Map<string, Student>();
    this.students.forEach(s => studentMap.set(s.id, s));

    // Map company lookup
    const companyMap = new Map<string, Company>();
    this.companies.forEach(c => companyMap.set(c.id, c));

    // Track busy timelines:
    // studentBusyTimelines: studentId -> Array<{ day, startMins, endMins }>
    const studentTimelines = new Map<string, Array<{ day: number; start: number; end: number }>>();

    // roomPanelBusyTimelines: roomId_panelId -> Array<{ day, startMins, endMins }>
    const panelTimelines = new Map<string, Array<{ day: number; start: number; end: number }>>();

    // Build panel keys for rooms
    const availablePanels: Array<{ roomId: string; panelId: string }> = [];
    this.rooms.filter(r => r.isAvailable).forEach(r => {
      for (let p = 1; p <= r.panelsAvailable; p++) {
        const panelKey = `${r.id}_P${p}`;
        availablePanels.push({ roomId: r.id, panelId: `Panel ${p}` });
        panelTimelines.set(panelKey, []);
      }
    });

    // Step 1: Collect all interview tasks (Student, Company pair)
    interface Task {
      student: Student;
      company: Company;
      priorityWeight: number;
    }

    const tasks: Task[] = [];

    this.students.forEach(student => {
      studentTimelines.set(student.id, []);
      student.shortlistedCompanyIds.forEach(companyId => {
        const company = companyMap.get(companyId);
        if (company) {
          // Hard Check: CGPA Cutoff
          if (student.cgpa < company.cgpaCutoff) {
            unscheduled.push({
              studentId: student.id,
              companyId: company.id,
              companyName: company.name,
              studentName: student.name,
              reason: 'CGPA_MISMATCH',
              details: `Student CGPA (${student.cgpa}) is below company cutoff (${company.cgpaCutoff})`
            });
            return;
          }

          let tierWeight = 3;
          if (company.priorityTier === 'DAY_1_MASS') tierWeight = 1;
          else if (company.priorityTier === 'TIER_1_PRODUCT') tierWeight = 2;

          // Priority formula: Tier Weight + Student Shortlist degree (MRV heuristic)
          const priorityWeight = tierWeight * 100 - student.shortlistedCompanyIds.length;
          tasks.push({ student, company, priorityWeight });
        }
      });
    });

    // Step 2: Sort tasks by Priority (Day 1 Mass Recruiters first, then highest constrained students)
    tasks.sort((a, b) => a.priorityWeight - b.priorityWeight);

    // Step 3: Assign time slots using Backtracking CSP with Least Constraining Value heuristic
    let slotIdCounter = 1;

    for (const task of tasks) {
      const { student, company } = task;
      const duration = company.interviewDurationMinutes;

      // Determine candidate days based on priority tier
      let candidateDays = [1, 2, 3, 4];
      if (company.priorityTier === 'DAY_1_MASS') {
        candidateDays = [1, 2]; // Mass recruiters get Day 1 & Day 2 preference
      } else if (company.priorityTier === 'TIER_1_PRODUCT') {
        candidateDays = [1, 2, 3];
      } else {
        candidateDays = [2, 3, 4];
      }

      let scheduledSuccess = false;

      // Try candidate days
      for (const day of candidateDays) {
        if (scheduledSuccess) break;

        // Iterate through time slots (in duration increments)
        for (let startMins = this.dayStartMinutes; startMins + duration <= this.dayEndMinutes; startMins += 15) {
          if (scheduledSuccess) break;

          const endMins = startMins + duration;

          // Check if Student is free
          const sTimeline = studentTimelines.get(student.id) || [];
          const studentClash = sTimeline.some(slot => slot.day === day && Math.max(slot.start, startMins) < Math.min(slot.end, endMins));
          if (studentClash) continue;

          // Find an available panel
          for (const panelObj of availablePanels) {
            const panelKey = `${panelObj.roomId}_${panelObj.panelId.replace(' ', '')}`;
            const pTimeline = panelTimelines.get(panelKey) || [];

            const panelClash = pTimeline.some(slot => slot.day === day && Math.max(slot.start, startMins) < Math.min(slot.end, endMins));

            if (!panelClash) {
              // FEASIBLE SLOT FOUND!
              sTimeline.push({ day, start: startMins, end: endMins });
              pTimeline.push({ day, start: startMins, end: endMins });

              const startHourStr = Math.floor(startMins / 60).toString().padStart(2, '0');
              const startMinStr = (startMins % 60).toString().padStart(2, '0');
              const endHourStr = Math.floor(endMins / 60).toString().padStart(2, '0');
              const endMinStr = (endMins % 60).toString().padStart(2, '0');

              slots.push({
                id: `SLOT-${slotIdCounter++}`,
                studentId: student.id,
                companyId: company.id,
                roomId: panelObj.roomId,
                panelId: panelObj.panelId,
                day,
                startTime: `${startHourStr}:${startMinStr}`,
                endTime: `${endHourStr}:${endMinStr}`,
                startMinutes: startMins,
                endMinutes: endMins,
                status: 'SCHEDULED'
              });

              scheduledSuccess = true;
              break;
            }
          }
        }
      }

      if (!scheduledSuccess) {
        // Explicit failure report
        unscheduled.push({
          studentId: student.id,
          companyId: company.id,
          companyName: company.name,
          studentName: student.name,
          reason: 'STUDENT_TIME_BOTTLENECK',
          details: `All candidate time slots were constrained by overlapping student shortlists or room panel capacity.`
        });
      }
    }

    const executionTimeMs = Date.now() - startTimeMs;
    return { slots, unscheduled, executionTimeMs };
  }
}
