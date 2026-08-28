export type Branch = 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL';

export type PriorityTier = 'DAY_1_MASS' | 'TIER_1_PRODUCT' | 'TIER_2_REGULAR';

export interface Company {
  id: string;
  name: string;
  priorityTier: PriorityTier;
  cgpaCutoff: number;
  interviewDurationMinutes: number; // 30, 45, or 60
  panelsCount: number;
  targetBranches: Branch[];
  shortlistCount?: number;
}

export interface Student {
  id: string;
  name: string;
  branch: Branch;
  cgpa: number;
  shortlistedCompanyIds: string[];
}

export interface Room {
  id: string;
  building: string;
  roomNumber: string;
  capacity: number;
  panelsAvailable: number;
  isAvailable: boolean;
}

export interface ScheduleSlot {
  id: string;
  studentId: string;
  companyId: string;
  roomId: string;
  panelId: string; // e.g. "Panel 1"
  day: number; // 1, 2, 3, or 4
  startTime: string; // "09:00"
  endTime: string; // "09:45"
  startMinutes: number; // Minutes from 08:00 AM on the given day
  endMinutes: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELED';
}

export interface UnscheduledInterview {
  studentId: string;
  companyId: string;
  companyName: string;
  studentName: string;
  reason: 'CGPA_MISMATCH' | 'STUDENT_TIME_BOTTLENECK' | 'ROOM_CAPACITY_EXHAUSTED' | 'NO_COMPATIBLE_SLOT';
  details: string;
}

export type DisruptionType = 'COMPANY_DELAY' | 'PANEL_DROP' | 'STUDENT_WITHDRAWAL' | 'ROOM_UNAVAILABLE';

export interface DisruptionEvent {
  id: string;
  type: DisruptionType;
  timestamp: string;
  targetId: string; // companyId, panelId, studentId, or roomId
  params: {
    delayHours?: number;
    panelId?: string;
    reason?: string;
    affectedDay?: number;
  };
}

export interface ReplanDiffChange {
  interviewId: string;
  studentId: string;
  studentName: string;
  companyId: string;
  companyName: string;
  oldRoomId?: string;
  newRoomId?: string;
  oldTime?: string;
  newTime?: string;
  oldDay?: number;
  newDay?: number;
  action: 'MOVED' | 'CANCELED' | 'KEPT';
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: 'STUDENT' | 'COMPANY_HR' | 'COORDINATOR';
  channel: 'DASHBOARD' | 'SMS' | 'EMAIL';
  message: string;
  timestamp: string;
}

export interface ReplanDiff {
  disruptionId: string;
  disruptionType: DisruptionType;
  timestamp: string;
  summary: {
    totalAppointmentsBefore: number;
    movedAppointmentsCount: number;
    canceledCount: number;
    affectedStudentsCount: number;
    churnPercentage: number;
  };
  changes: ReplanDiffChange[];
  notifications: NotificationItem[];
}

export interface ScheduleMetrics {
  totalShortlistedInterviews: number;
  totalScheduledInterviews: number;
  scheduledPercentage: number; // e.g. 96.5
  studentClashCount: number;
  studentClashPercentage: number; // e.g. 0.0
  roomUtilizationPercentage: number; // e.g. 84.2
  averageWaitTimeMinutes: number; // e.g. 22.4
  replanChurnPercentage: number; // e.g. 3.2
  isFeasible: boolean;
  unscheduledCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: any;
}
