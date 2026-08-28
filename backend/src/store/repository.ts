import {
  Company,
  Student,
  Room,
  ScheduleSlot,
  UnscheduledInterview,
  DisruptionEvent,
  ReplanDiff,
  ScheduleMetrics,
  AuditLog
} from '../types';
import { DatasetGenerator } from '../dataset/generator';
import { CSPSolver } from '../solver/csp-solver';
import { ReplanEngine } from '../replan/replan-engine';
import { MetricsEngine } from '../metrics/metrics-engine';

export class ScheduleRepository {
  private static instance: ScheduleRepository;

  private companies: Company[] = [];
  private students: Student[] = [];
  private rooms: Room[] = [];
  private currentSlots: ScheduleSlot[] = [];
  private unscheduledInterviews: UnscheduledInterview[] = [];
  private disruptionHistory: DisruptionEvent[] = [];
  private replanDiffHistory: ReplanDiff[] = [];
  private auditLogs: AuditLog[] = [];
  private latestMetrics!: ScheduleMetrics;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): ScheduleRepository {
    if (!ScheduleRepository.instance) {
      ScheduleRepository.instance = new ScheduleRepository();
    }
    return ScheduleRepository.instance;
  }

  public initialize(seed: number = 42) {
    const dataset = DatasetGenerator.generate(seed);
    this.companies = dataset.companies;
    this.students = dataset.students;
    this.rooms = dataset.rooms;

    const solver = new CSPSolver(this.companies, this.students, this.rooms);
    const result = solver.solve();

    this.currentSlots = result.slots;
    this.unscheduledInterviews = result.unscheduled;

    let totalShortlist = 0;
    this.students.forEach(s => {
      totalShortlist += s.shortlistedCompanyIds.length;
    });

    this.latestMetrics = MetricsEngine.calculate(
      this.currentSlots,
      this.unscheduledInterviews,
      totalShortlist,
      this.rooms,
      this.students,
      0
    );

    this.logAudit('SYSTEM_INITIALIZATION', 'SYSTEM', {
      totalCompanies: this.companies.length,
      totalStudents: this.students.length,
      totalRooms: this.rooms.length,
      totalScheduledSlots: this.currentSlots.length
    });
  }

  public getCompanies(): Company[] {
    return this.companies;
  }

  public getStudents(): Student[] {
    return this.students;
  }

  public getRooms(): Room[] {
    return this.rooms;
  }

  public getSlots(): ScheduleSlot[] {
    return this.currentSlots;
  }

  public getUnscheduled(): UnscheduledInterview[] {
    return this.unscheduledInterviews;
  }

  public getMetrics(): ScheduleMetrics {
    return this.latestMetrics;
  }

  public getReplanDiffHistory(): ReplanDiff[] {
    return this.replanDiffHistory;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public executeReplan(disruption: DisruptionEvent): ReplanDiff {
    this.disruptionHistory.push(disruption);

    const replanEngine = new ReplanEngine(
      this.currentSlots,
      this.companies,
      this.students,
      this.rooms
    );

    const { newSlots, diff } = replanEngine.executeReplan(disruption);
    this.currentSlots = newSlots;
    this.replanDiffHistory.push(diff);

    let totalShortlist = 0;
    this.students.forEach(s => {
      totalShortlist += s.shortlistedCompanyIds.length;
    });

    this.latestMetrics = MetricsEngine.calculate(
      this.currentSlots,
      this.unscheduledInterviews,
      totalShortlist,
      this.rooms,
      this.students,
      diff.summary.churnPercentage
    );

    this.logAudit('REPLAN_EXECUTED', 'COORDINATOR', {
      disruptionType: disruption.type,
      churnPercentage: diff.summary.churnPercentage,
      movedCount: diff.summary.movedAppointmentsCount
    });

    return diff;
  }

  public logAudit(action: string, performedBy: string, details: any) {
    this.auditLogs.push({
      id: `AUDIT-${this.auditLogs.length + 1}`,
      timestamp: new Date().toISOString(),
      action,
      performedBy,
      details
    });
  }
}
