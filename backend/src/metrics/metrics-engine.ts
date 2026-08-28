import { ScheduleSlot, Student, Company, Room, UnscheduledInterview, ScheduleMetrics } from '../types';

export class MetricsEngine {
  public static calculate(
    slots: ScheduleSlot[],
    unscheduled: UnscheduledInterview[],
    totalShortlistedInterviews: number,
    rooms: Room[],
    students: Student[],
    replanChurnPercentage: number = 0
  ): ScheduleMetrics {
    const totalScheduled = slots.filter(s => s.status !== 'CANCELED').length;
    const scheduledPercentage = totalShortlistedInterviews > 0
      ? Math.round((totalScheduled / totalShortlistedInterviews) * 1000) / 10
      : 0;

    // Check student clashes (overlapping start/end minutes for same student on same day)
    let clashCount = 0;
    const studentDaySlots = new Map<string, ScheduleSlot[]>();
    slots.filter(s => s.status !== 'CANCELED').forEach(slot => {
      const key = `${slot.studentId}_D${slot.day}`;
      const list = studentDaySlots.get(key) || [];
      list.push(slot);
      studentDaySlots.set(key, list);
    });

    studentDaySlots.forEach((daySlots) => {
      daySlots.sort((a, b) => a.startMinutes - b.startMinutes);
      for (let i = 0; i < daySlots.length - 1; i++) {
        if (daySlots[i].endMinutes > daySlots[i + 1].startMinutes) {
          clashCount++;
        }
      }
    });

    const studentClashPercentage = totalScheduled > 0
      ? Math.round((clashCount / totalScheduled) * 1000) / 10
      : 0;

    // Room Utilization Calculation:
    // Available capacity = 20 rooms * 4 days * 8 hours/day * panel count = total available panel minutes
    let totalAvailablePanelMinutes = 0;
    rooms.forEach(r => {
      totalAvailablePanelMinutes += 4 * 8 * 60 * (r.panelsAvailable || 1);
    });

    let totalUsedMinutes = 0;
    slots.filter(s => s.status !== 'CANCELED').forEach(s => {
      totalUsedMinutes += s.endMinutes - s.startMinutes;
    });

    const roomUtilizationPercentage = totalAvailablePanelMinutes > 0
      ? Math.min(100, Math.round((totalUsedMinutes / totalAvailablePanelMinutes) * 1000) / 10)
      : 0;

    // Average Wait Time calculation between back-to-back interviews for students
    let totalWaitMinutes = 0;
    let waitIntervalsCount = 0;

    studentDaySlots.forEach((daySlots) => {
      if (daySlots.length > 1) {
        daySlots.sort((a, b) => a.startMinutes - b.startMinutes);
        for (let i = 0; i < daySlots.length - 1; i++) {
          const wait = daySlots[i + 1].startMinutes - daySlots[i].endMinutes;
          if (wait >= 0) {
            totalWaitMinutes += wait;
            waitIntervalsCount++;
          }
        }
      }
    });

    const averageWaitTimeMinutes = waitIntervalsCount > 0
      ? Math.round((totalWaitMinutes / waitIntervalsCount) * 10) / 10
      : 15; // default 15m baseline

    const isFeasible = clashCount === 0 && scheduledPercentage >= 90;

    return {
      totalShortlistedInterviews,
      totalScheduledInterviews: totalScheduled,
      scheduledPercentage,
      studentClashCount: clashCount,
      studentClashPercentage,
      roomUtilizationPercentage,
      averageWaitTimeMinutes,
      replanChurnPercentage,
      isFeasible,
      unscheduledCount: unscheduled.length
    };
  }
}
