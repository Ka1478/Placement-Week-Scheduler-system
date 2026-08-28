export type Branch = 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL';
export type PriorityTier = 'DAY_1_MASS' | 'TIER_1_PRODUCT' | 'TIER_2_REGULAR';

export interface Company {
  id: string;
  name: string;
  priorityTier: PriorityTier;
  cgpaCutoff: number;
  interviewDurationMinutes: number;
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
  panelId: string;
  day: number;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELED';
}

export interface UnscheduledInterview {
  studentId: string;
  companyId: string;
  companyName: string;
  studentName: string;
  reason: string;
  details: string;
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
  disruptionType: string;
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
  scheduledPercentage: number;
  studentClashCount: number;
  studentClashPercentage: number;
  roomUtilizationPercentage: number;
  averageWaitTimeMinutes: number;
  replanChurnPercentage: number;
  isFeasible: boolean;
  unscheduledCount: number;
}
