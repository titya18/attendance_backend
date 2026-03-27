import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET as string) as any;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
