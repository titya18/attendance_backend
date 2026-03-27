import jwt from "jsonwebtoken";
export const signJwt = (payload: object) => jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });
