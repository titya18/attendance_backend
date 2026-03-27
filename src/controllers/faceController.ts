import { Request, Response } from "express";
import { prisma } from "../config/prisma";

const euclideanDistance = (a: number[], b: number[]) => {
  if (a.length !== b.length) return Number.MAX_SAFE_INTEGER;

  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
};

export const faceCheckIn = async (req: Request, res: Response) => {
  try {
    const { employeeId, descriptor } = req.body;

    const employee = await prisma.employee.findUnique({
      where: { id: Number(employeeId) },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (!employee.faceDescriptor) {
      return res.status(400).json({ message: "Employee face is not enrolled" });
    }

    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ message: "Face descriptor is required" });
    }

    const storedDescriptor = JSON.parse(employee.faceDescriptor) as number[];
    const distance = euclideanDistance(storedDescriptor, descriptor);
    const threshold = 0.6;

    if (distance > threshold) {
      return res.status(400).json({
        message: "Face not matched",
        distance,
      });
    }

    const log = await prisma.attendanceLog.create({
      data: {
        employeeId: employee.id,
        deviceUserId: employee.deviceUserId,
        logTime: new Date(),
        verifyType: "FACE",
        source: "FACE",
        direction: "IN",
        rawData: { descriptor, distance },
      },
    });

    return res.json({
      message: "Face attendance success",
      distance,
      log,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Face check-in failed" });
  }
};