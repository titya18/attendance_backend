import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { signJwt } from "../utils/jwt";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const matched = await bcrypt.compare(password, user.passwordHash);
    if (!matched) return res.status(400).json({ message: "Invalid credentials" });
    const token = signJwt({ id: user.id, username: user.username, role: user.role });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
};
