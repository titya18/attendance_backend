import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getDepartments = async (_req: Request, res: Response) => {
  try { return res.json(await prisma.department.findMany({ orderBy: { id: "desc" } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to fetch departments" }); }
};
export const createDepartment = async (req: Request, res: Response) => {
  try { return res.status(201).json(await prisma.department.create({ data: { name: req.body.name, description: req.body.description || null } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to create department" }); }
};
export const updateDepartment = async (req: Request, res: Response) => {
  try { return res.json(await prisma.department.update({ where: { id: Number(req.params.id) }, data: { name: req.body.name, description: req.body.description || null } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to update department" }); }
};
export const deleteDepartment = async (req: Request, res: Response) => {
  try { await prisma.department.delete({ where: { id: Number(req.params.id) } }); return res.json({ message: "Deleted successfully" }); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to delete department" }); }
};
