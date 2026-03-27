import { Request, Response } from "express";
import dayjs from "dayjs";
import { prisma } from "../config/prisma";

export const getDashboardSummary = async (_req: Request, res: Response) => {
  try {
    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();
    const monthStart = dayjs().startOf("month").toDate();
    const monthEnd = dayjs().endOf("month").toDate();
    const totalEmployees = await prisma.employee.count();
    const totalDevices = await prisma.device.count();
    const todayLogs = await prisma.attendanceLog.count({ where: { logTime: { gte: todayStart, lte: todayEnd } } });
    const todayPresent = await prisma.attendanceRecord.count({ where: { attendanceDate: { gte: todayStart, lte: todayEnd }, status: { in: ["PRESENT", "LATE"] } } });
    const monthly = await prisma.attendanceRecord.findMany({ where: { attendanceDate: { gte: monthStart, lte: monthEnd } }, select: { attendanceDate: true, status: true }, orderBy: { attendanceDate: "asc" } });
    const grouped: Record<string, { present: number; late: number; absent: number }> = {};
    monthly.forEach((item) => { const date = dayjs(item.attendanceDate).format("YYYY-MM-DD"); if (!grouped[date]) grouped[date] = { present: 0, late: 0, absent: 0 }; if (item.status === "PRESENT") grouped[date].present += 1; else if (item.status === "LATE") grouped[date].late += 1; else if (item.status === "ABSENT") grouped[date].absent += 1; });
    return res.json({ totalEmployees, totalDevices, todayLogs, todayPresent, chart: Object.entries(grouped).map(([date, values]) => ({ date, ...values })) });
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to fetch dashboard summary" }); }
};
