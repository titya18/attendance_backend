import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getEmployees = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.employee.findMany({ include: { department: true, shift: true }, orderBy: { id: "desc" } });
    return res.json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch employees" });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const item = await prisma.employee.findUnique({ where: { id: Number(req.params.id) }, include: { department: true, shift: true } });
    if (!item) return res.status(404).json({ message: "Employee not found" });
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch employee" });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const item = await prisma.employee.create({
      data: {
        employeeCode: body.employeeCode,
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender || null,
        phone: body.phone || null,
        email: body.email || null,
        photo,
        deviceUserId: body.deviceUserId || null,
        faceDescriptor: body.faceDescriptor || null,
        departmentId: body.departmentId ? Number(body.departmentId) : null,
        shiftId: body.shiftId ? Number(body.shiftId) : null,
        status: body.status || "ACTIVE",
      },
      include: { department: true, shift: true },
    });
    return res.status(201).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create employee" });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const body = req.body;
    const uploadedPhoto = req.file ? `/uploads/${req.file.filename}` : undefined;

    const current = await prisma.employee.findUnique({ where: { id } });

    if (!current) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const item = await prisma.employee.update({
      where: { id },
      data: {
        employeeCode: body.employeeCode ?? current.employeeCode,
        firstName: body.firstName ?? current.firstName,
        lastName: body.lastName ?? current.lastName,
        gender: body.gender ?? current.gender,
        phone: body.phone ?? current.phone,
        email: body.email ?? current.email,
        photo: uploadedPhoto ?? current.photo,
        deviceUserId: body.deviceUserId ?? current.deviceUserId,
        faceDescriptor: body.faceDescriptor ?? current.faceDescriptor,
        departmentId:
          body.departmentId !== undefined
            ? body.departmentId
              ? Number(body.departmentId)
              : null
            : current.departmentId,
        shiftId:
          body.shiftId !== undefined
            ? body.shiftId
              ? Number(body.shiftId)
              : null
            : current.shiftId,
        status: body.status ?? current.status,
      },
      include: {
        department: true,
        shift: true,
      },
    });

    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update employee" });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    await prisma.employee.delete({ where: { id: Number(req.params.id) } });
    return res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete employee" });
  }
};
