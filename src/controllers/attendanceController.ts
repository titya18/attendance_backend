import { Request, Response } from "express";
import dayjs from "dayjs";
import { prisma } from "../config/prisma";
import { processAttendanceForDate } from "../services/attendanceService";

export const getAttendanceLogs = async (_req: Request, res: Response) => {
  try { return res.json(await prisma.attendanceLog.findMany({ include: { employee: true, device: true }, orderBy: { logTime: "desc" } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to fetch attendance logs" }); }
};
export const getDailyAttendance = async (req: Request, res: Response) => {
  try {
    const date = String(req.query.date || dayjs().format("YYYY-MM-DD"));
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();
    return res.json(await prisma.attendanceRecord.findMany({ where: { attendanceDate: { gte: start, lte: end } }, include: { employee: true }, orderBy: { employeeId: "asc" } }));
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to fetch daily attendance" }); }
};
export const processDailyAttendance = async (req: Request, res: Response) => {
  try { await processAttendanceForDate(req.body.date); return res.json({ message: "Attendance processed successfully" }); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to process attendance" }); }
};
export const mockSyncLogs = async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({ where: { status: "ACTIVE" } });
    const device = await prisma.device.findFirst();
    for (const employee of employees) {
      const inTime = new Date(); inTime.setHours(8, Math.floor(Math.random() * 20), 0, 0);
      const outTime = new Date(); outTime.setHours(17, Math.floor(Math.random() * 20), 0, 0);
      await prisma.attendanceLog.createMany({ data: [
        { employeeId: employee.id, deviceId: device?.id, deviceUserId: employee.deviceUserId, logTime: inTime, verifyType: "FINGERPRINT", source: "MOCK", direction: "IN", rawData: { mock: true } },
        { employeeId: employee.id, deviceId: device?.id, deviceUserId: employee.deviceUserId, logTime: outTime, verifyType: "FINGERPRINT", source: "MOCK", direction: "OUT", rawData: { mock: true } },
      ] });
    }
    return res.json({ message: "Mock logs synced successfully" });
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to sync mock logs" }); }
};
