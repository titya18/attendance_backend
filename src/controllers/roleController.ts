import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getRoles = async (_req: Request, res: Response) => {
  try { return res.json(await prisma.role.findMany({ include: { permissions: { include: { permission: true } } }, orderBy: { id: "asc" } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to fetch roles" }); }
};
export const getPermissions = async (_req: Request, res: Response) => {
  try { return res.json(await prisma.permission.findMany({ orderBy: { code: "asc" } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to fetch permissions" }); }
};
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissionIds = [] } = req.body;
    const item = await prisma.role.create({ data: { name, description: description || null, permissions: { create: permissionIds.map((permissionId: number) => ({ permissionId: Number(permissionId) })) } }, include: { permissions: { include: { permission: true } } } });
    return res.status(201).json(item);
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to create role" }); }
};
export const updateRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, permissionIds = [] } = req.body;
    await prisma.rolePermission.deleteMany({ where: { roleId: id } });
    const item = await prisma.role.update({ where: { id }, data: { name, description: description || null, permissions: { create: permissionIds.map((permissionId: number) => ({ permissionId: Number(permissionId) })) } }, include: { permissions: { include: { permission: true } } } });
    return res.json(item);
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to update role" }); }
};
export const deleteRole = async (req: Request, res: Response) => {
  try { await prisma.role.delete({ where: { id: Number(req.params.id) } }); return res.json({ message: "Deleted successfully" }); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to delete role" }); }
};
