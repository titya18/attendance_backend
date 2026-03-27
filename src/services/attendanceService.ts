import dayjs from "dayjs";
import { AttendanceStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

export const processAttendanceForDate = async (date: string) => {
  const start = dayjs(date).startOf("day").toDate();
  const end = dayjs(date).endOf("day").toDate();
  const employees = await prisma.employee.findMany({ where: { status: "ACTIVE" }, include: { shift: true } });
  for (const employee of employees) {
    const logs = await prisma.attendanceLog.findMany({ where: { employeeId: employee.id, logTime: { gte: start, lte: end } }, orderBy: { logTime: "asc" } });
    const firstLog = logs[0]?.logTime ?? null;
    const lastLog = logs.length > 1 ? logs[logs.length - 1].logTime : null;
    let lateMinutes = 0;
    let workedMinutes = 0;
    let status: AttendanceStatus = "ABSENT";
    if (firstLog) {
      status = "PRESENT";
      if (lastLog) workedMinutes = dayjs(lastLog).diff(dayjs(firstLog), "minute");
      if (employee.shift) {
        const diff = dayjs(firstLog).diff(dayjs(`${date} ${employee.shift.startTime}`), "minute");
        if (diff > (employee.shift.lateAfterMin ?? 0)) { lateMinutes = diff; status = "LATE"; }
      }
    }
    await prisma.attendanceRecord.upsert({
      where: { employeeId_attendanceDate: { employeeId: employee.id, attendanceDate: start } },
      update: { checkIn: firstLog, checkOut: lastLog, lateMinutes, workedMinutes, status },
      create: { employeeId: employee.id, attendanceDate: start, checkIn: firstLog, checkOut: lastLog, lateMinutes, workedMinutes, status },
    });
  }
};
