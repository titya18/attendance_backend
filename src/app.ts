import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import router from "./routes";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "public/uploads")));
app.use("/api", router);
app.get("/", (_req, res) => res.json({ message: "Attendance API is running" }));
export default app;
