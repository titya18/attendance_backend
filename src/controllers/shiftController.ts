import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getShifts = async (_req: Request, res: Response) => {
  try { return res.json(await prisma.shift.findMany({ orderBy: { id: "desc" } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to fetch shifts" }); }
};
export const createShift = async (req: Request, res: Response) => {
  try { return res.status(201).json(await prisma.shift.create({ data: { name: req.body.name, startTime: req.body.startTime, endTime: req.body.endTime, lateAfterMin: Number(req.body.lateAfterMin || 0), earlyOutMin: Number(req.body.earlyOutMin || 0) } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to create shift" }); }
};
export const updateShift = async (req: Request, res: Response) => {
  try { return res.json(await prisma.shift.update({ where: { id: Number(req.params.id) }, data: { name: req.body.name, startTime: req.body.startTime, endTime: req.body.endTime, lateAfterMin: Number(req.body.lateAfterMin || 0), earlyOutMin: Number(req.body.earlyOutMin || 0) } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to update shift" }); }
};
export const deleteShift = async (req: Request, res: Response) => {
  try { await prisma.shift.delete({ where: { id: Number(req.params.id) } }); return res.json({ message: "Deleted successfully" }); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to delete shift" }); }
};
