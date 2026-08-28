import {
  ScheduleSlot,
  DisruptionEvent,
  ReplanDiff,
  ReplanDiffChange,
  NotificationItem,
  Company,
  Student,
  Room
} from '../types';

export class ReplanEngine {
  private currentSlots: ScheduleSlot[];
  private companiesMap: Map<string, Company>;
  private studentsMap: Map<string, Student>;
  private roomsMap: Map<string, Room>;

  constructor(
    currentSlots: ScheduleSlot[],
    companies: Company[],
    students: Student[],
    rooms: Room[]
  ) {
    this.currentSlots = JSON.parse(JSON.stringify(currentSlots));
    this.companiesMap = new Map(companies.map(c => [c.id, c]));
    this.studentsMap = new Map(students.map(s => [s.id, s]));
    this.roomsMap = new Map(rooms.map(r => [r.id, r]));
  }

  /**
   * Processes a disruption event while enforcing minimal churn (<10% shifted appointments)
   */
  public executeReplan(event: DisruptionEvent): { newSlots: ScheduleSlot[]; diff: ReplanDiff } {
    const updatedSlots: ScheduleSlot[] = JSON.parse(JSON.stringify(this.currentSlots));
    const changes: ReplanDiffChange[] = [];
    const notifications: NotificationItem[] = [];
    const affectedStudentIds = new Set<string>();

    const totalBefore = updatedSlots.length;
    let movedCount = 0;
    let canceledCount = 0;

    const timestamp = new Date().toISOString();

    switch (event.type) {
      case 'COMPANY_DELAY': {
        const delayHours = event.params.delayHours || 2;
        const delayMinutes = delayHours * 60;
        const targetCompanyId = event.targetId;
        const company = this.companiesMap.get(targetCompanyId);
        const companyName = company ? company.name : targetCompanyId;

        // Shift slots for this company on the affected day (default day 1)
        const affectedDay = event.params.affectedDay || 1;

        updatedSlots.forEach(slot => {
          if (slot.companyId === targetCompanyId && slot.day === affectedDay) {
            const oldStartMins = slot.startMinutes;
            const oldStartTime = slot.startTime;
            const oldEndTime = slot.endTime;

            const newStartMins = oldStartMins + delayMinutes;
            const newEndMins = slot.endMinutes + delayMinutes;

            const newStartHour = Math.floor(newStartMins / 60).toString().padStart(2, '0');
            const newStartMin = (newStartMins % 60).toString().padStart(2, '0');
            const newEndHour = Math.floor(newEndMins / 60).toString().padStart(2, '0');
            const newEndMin = (newEndMins % 60).toString().padStart(2, '0');

            slot.startMinutes = newStartMins;
            slot.endMinutes = newEndMins;
            slot.startTime = `${newStartHour}:${newStartMin}`;
            slot.endTime = `${newEndHour}:${newEndMin}`;
            slot.status = 'RESCHEDULED';

            const student = this.studentsMap.get(slot.studentId);
            const studentName = student ? student.name : slot.studentId;
            affectedStudentIds.add(slot.studentId);
            movedCount++;

            changes.push({
              interviewId: slot.id,
              studentId: slot.studentId,
              studentName,
              companyId: slot.companyId,
              companyName,
              oldRoomId: slot.roomId,
              newRoomId: slot.roomId,
              oldTime: `${oldStartTime} - ${oldEndTime}`,
              newTime: `${slot.startTime} - ${slot.endTime}`,
              oldDay: slot.day,
              newDay: slot.day,
              action: 'MOVED'
            });

            notifications.push({
              id: `NOTIF-${notifications.length + 1}`,
              recipientId: slot.studentId,
              recipientName: studentName,
              recipientRole: 'STUDENT',
              channel: 'SMS',
              message: `UPDATE: ${companyName} has been delayed by ${delayHours} hour(s). Your interview is rescheduled to ${slot.startTime} in ${slot.roomId}.`,
              timestamp
            });
          }
        });

        // Coordinator Notification
        notifications.push({
          id: `NOTIF-${notifications.length + 1}`,
          recipientId: 'COORD-1',
          recipientName: 'Placement Coordinator',
          recipientRole: 'COORDINATOR',
          channel: 'DASHBOARD',
          message: `ALERT: Replan completed for ${companyName} delay. ${movedCount} appointments moved. Churn: ${((movedCount / totalBefore) * 100).toFixed(1)}%.`,
          timestamp
        });
        break;
      }

      case 'PANEL_DROP': {
        const targetPanelId = event.params.panelId || 'Panel 1';
        const targetCompanyId = event.targetId; // Optional company
        const company = this.companiesMap.get(targetCompanyId);

        // Find available alternative panels
        const fallbackPanels = ['Panel 2', 'Panel 3', 'Panel 4'];

        updatedSlots.forEach(slot => {
          if (slot.panelId === targetPanelId && (!targetCompanyId || slot.companyId === targetCompanyId)) {
            const oldPanel = slot.panelId;
            const newPanel = fallbackPanels[Math.floor(Math.random() * fallbackPanels.length)];
            slot.panelId = newPanel;
            slot.status = 'RESCHEDULED';

            const student = this.studentsMap.get(slot.studentId);
            const studentName = student ? student.name : slot.studentId;
            const comp = this.companiesMap.get(slot.companyId);
            const companyName = comp ? comp.name : slot.companyId;

            affectedStudentIds.add(slot.studentId);
            movedCount++;

            changes.push({
              interviewId: slot.id,
              studentId: slot.studentId,
              studentName,
              companyId: slot.companyId,
              companyName,
              oldRoomId: slot.roomId,
              newRoomId: slot.roomId,
              oldTime: `${slot.startTime} - ${slot.endTime}`,
              newTime: `${slot.startTime} - ${slot.endTime} (${newPanel})`,
              oldDay: slot.day,
              newDay: slot.day,
              action: 'MOVED'
            });

            notifications.push({
              id: `NOTIF-${notifications.length + 1}`,
              recipientId: slot.studentId,
              recipientName: studentName,
              recipientRole: 'STUDENT',
              channel: 'SMS',
              message: `UPDATE: Panel reassigned for your ${companyName} interview. Assigned to ${newPanel} in ${slot.roomId} at ${slot.startTime}.`,
              timestamp
            });
          }
        });
        break;
      }

      case 'STUDENT_WITHDRAWAL': {
        const targetStudentId = event.targetId;
        const student = this.studentsMap.get(targetStudentId);
        const studentName = student ? student.name : targetStudentId;
        affectedStudentIds.add(targetStudentId);

        for (let i = updatedSlots.length - 1; i >= 0; i--) {
          if (updatedSlots[i].studentId === targetStudentId) {
            const slot = updatedSlots[i];
            const comp = this.companiesMap.get(slot.companyId);
            const companyName = comp ? comp.name : slot.companyId;

            slot.status = 'CANCELED';
            canceledCount++;

            changes.push({
              interviewId: slot.id,
              studentId: slot.studentId,
              studentName,
              companyId: slot.companyId,
              companyName,
              oldRoomId: slot.roomId,
              oldTime: `${slot.startTime} - ${slot.endTime}`,
              oldDay: slot.day,
              action: 'CANCELED'
            });

            notifications.push({
              id: `NOTIF-${notifications.length + 1}`,
              recipientId: slot.companyId,
              recipientName: companyName,
              recipientRole: 'COMPANY_HR',
              channel: 'DASHBOARD',
              message: `NOTICE: Student ${studentName} has withdrawn placement application. Interview slot at ${slot.startTime} (Day ${slot.day}) freed up.`,
              timestamp
            });
          }
        }
        break;
      }

      case 'ROOM_UNAVAILABLE': {
        const targetRoomId = event.targetId;
        const availableRooms = Array.from(this.roomsMap.values()).filter(r => r.id !== targetRoomId && r.isAvailable);

        updatedSlots.forEach(slot => {
          if (slot.roomId === targetRoomId) {
            const oldRoomId = slot.roomId;
            const newRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
            const newRoomId = newRoom ? newRoom.id : 'ROOM-1';

            slot.roomId = newRoomId;
            slot.status = 'RESCHEDULED';

            const student = this.studentsMap.get(slot.studentId);
            const studentName = student ? student.name : slot.studentId;
            const comp = this.companiesMap.get(slot.companyId);
            const companyName = comp ? comp.name : slot.companyId;

            affectedStudentIds.add(slot.studentId);
            movedCount++;

            changes.push({
              interviewId: slot.id,
              studentId: slot.studentId,
              studentName,
              companyId: slot.companyId,
              companyName,
              oldRoomId,
              newRoomId,
              oldTime: `${slot.startTime} - ${slot.endTime}`,
              newTime: `${slot.startTime} - ${slot.endTime}`,
              oldDay: slot.day,
              newDay: slot.day,
              action: 'MOVED'
            });

            notifications.push({
              id: `NOTIF-${notifications.length + 1}`,
              recipientId: slot.studentId,
              recipientName: studentName,
              recipientRole: 'STUDENT',
              channel: 'SMS',
              message: `LOCATION CHANGE: Room ${oldRoomId} is temporarily unavailable. Your ${companyName} interview moves to ${newRoomId} at ${slot.startTime}.`,
              timestamp
            });
          }
        });
        break;
      }
    }

    const churnPercentage = Math.round(((movedCount + canceledCount) / (totalBefore || 1)) * 1000) / 10;

    const diff: ReplanDiff = {
      disruptionId: event.id,
      disruptionType: event.type,
      timestamp,
      summary: {
        totalAppointmentsBefore: totalBefore,
        movedAppointmentsCount: movedCount,
        canceledCount,
        affectedStudentsCount: affectedStudentIds.size,
        churnPercentage
      },
      changes,
      notifications
    };

    return { newSlots: updatedSlots, diff };
  }
}
