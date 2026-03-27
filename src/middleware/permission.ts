import { NextFunction, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "./auth";

export const requirePermission = (permissionCode: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { roleRef: { include: { permissions: { include: { permission: true } } } } },
      });
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "ADMIN") return next();
      const codes = (user.roleRef?.permissions || []).map((x) => x.permission.code);
      if (!codes.includes(permissionCode)) return res.status(403).json({ message: "Forbidden" });
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Permission check failed" });
    }
  };
};
