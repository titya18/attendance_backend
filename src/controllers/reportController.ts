import { Request, Response } from "express";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { prisma } from "../config/prisma";

const getDateRange = (from?: string, to?: string) => ({
  start: from ? dayjs(from).startOf("day").toDate() : dayjs().startOf("month").toDate(),
  end: to ? dayjs(to).endOf("day").toDate() : dayjs().endOf("month").toDate(),
});

export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const { start, end } = getDateRange(req.query.from as string | undefined, req.query.to as string | undefined);
    const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const items = await prisma.attendanceRecord.findMany({ where: { attendanceDate: { gte: start, lte: end }, ...(employeeId ? { employeeId } : {}) }, include: { employee: { include: { department: true, shift: true } } }, orderBy: [{ attendanceDate: "asc" }, { employeeId: "asc" }] });
    const rows = items.map((item) => ({ id: item.id, date: dayjs(item.attendanceDate).format("YYYY-MM-DD"), employeeCode: item.employee.employeeCode, employeeName: `${item.employee.firstName} ${item.employee.lastName}`, department: item.employee.department?.name || "-", shift: item.employee.shift?.name || "-", checkIn: item.checkIn ? dayjs(item.checkIn).format("HH:mm:ss") : "-", checkOut: item.checkOut ? dayjs(item.checkOut).format("HH:mm:ss") : "-", lateMinutes: item.lateMinutes, workedMinutes: item.workedMinutes, status: item.status, remark: item.remark || "" }));
    const summary = { totalRecords: rows.length, totalPresent: rows.filter((x) => x.status === "PRESENT").length, totalLate: rows.filter((x) => x.status === "LATE").length, totalAbsent: rows.filter((x) => x.status === "ABSENT").length };
    return res.json({ rows, summary });
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to fetch attendance report" }); }
};

export const exportAttendanceExcel = async (req: Request, res: Response) => {
  try {
    const { start, end } = getDateRange(req.query.from as string | undefined, req.query.to as string | undefined);
    const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const items = await prisma.attendanceRecord.findMany({ where: { attendanceDate: { gte: start, lte: end }, ...(employeeId ? { employeeId } : {}) }, include: { employee: { include: { department: true, shift: true } } }, orderBy: [{ attendanceDate: "asc" }, { employeeId: "asc" }] });
    const workbook = new ExcelJS.Workbook(); const sheet = workbook.addWorksheet("Attendance Report");
    sheet.columns = [{ header: "Date", key: "date", width: 14 }, { header: "Code", key: "employeeCode", width: 16 }, { header: "Employee Name", key: "employeeName", width: 24 }, { header: "Department", key: "department", width: 18 }, { header: "Shift", key: "shift", width: 18 }, { header: "Check In", key: "checkIn", width: 14 }, { header: "Check Out", key: "checkOut", width: 14 }, { header: "Late Min", key: "lateMinutes", width: 12 }, { header: "Worked Min", key: "workedMinutes", width: 12 }, { header: "Status", key: "status", width: 14 }, { header: "Remark", key: "remark", width: 20 }];
    items.forEach((item) => sheet.addRow({ date: dayjs(item.attendanceDate).format("YYYY-MM-DD"), employeeCode: item.employee.employeeCode, employeeName: `${item.employee.firstName} ${item.employee.lastName}`, department: item.employee.department?.name || "-", shift: item.employee.shift?.name || "-", checkIn: item.checkIn ? dayjs(item.checkIn).format("HH:mm:ss") : "-", checkOut: item.checkOut ? dayjs(item.checkOut).format("HH:mm:ss") : "-", lateMinutes: item.lateMinutes, workedMinutes: item.workedMinutes, status: item.status, remark: item.remark || "" }));
    sheet.getRow(1).font = { bold: true };
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=attendance-report-${dayjs().format("YYYYMMDD-HHmmss")}.xlsx`);
    await workbook.xlsx.write(res); res.end();
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to export excel report" }); }
};

export const exportAttendancePdf = async (req: Request, res: Response) => {
  try {
    const { start, end } = getDateRange(req.query.from as string | undefined, req.query.to as string | undefined);
    const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const items = await prisma.attendanceRecord.findMany({ where: { attendanceDate: { gte: start, lte: end }, ...(employeeId ? { employeeId } : {}) }, include: { employee: true }, orderBy: [{ attendanceDate: "asc" }, { employeeId: "asc" }] });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=attendance-report-${dayjs().format("YYYYMMDD-HHmmss")}.pdf`);
    const doc = new PDFDocument({ margin: 30, size: "A4" }); doc.pipe(res);
    doc.fontSize(16).text("Attendance Report", { align: "center" }).moveDown();
    doc.fontSize(10).text(`From: ${dayjs(start).format("YYYY-MM-DD")}`).text(`To: ${dayjs(end).format("YYYY-MM-DD")}`).moveDown();
    items.forEach((item, index) => { doc.fontSize(10).text(`${index + 1}. ${dayjs(item.attendanceDate).format("YYYY-MM-DD")} | ${item.employee.employeeCode} | ${item.employee.firstName} ${item.employee.lastName} | In: ${item.checkIn ? dayjs(item.checkIn).format("HH:mm:ss") : "-"} | Out: ${item.checkOut ? dayjs(item.checkOut).format("HH:mm:ss") : "-"} | Late: ${item.lateMinutes} | Worked: ${item.workedMinutes} | ${item.status}`); doc.moveDown(0.4); });
    doc.end();
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to export pdf report" }); }
};
