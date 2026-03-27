import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { getDeviceAdapter } from "../services/device/deviceFactory";
import { syncDeviceLogs } from "../services/deviceSyncService";

export const getDevices = async (_req: Request, res: Response) => {
  try { return res.json(await prisma.device.findMany({ orderBy: { id: "desc" } })); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to fetch devices" }); }
};
export const createDevice = async (req: Request, res: Response) => {
  try {
    const b = req.body;
    const item = await prisma.device.create({ data: { name: b.name, vendor: b.vendor || "MOCK", ipAddress: b.ipAddress || null, port: b.port ? Number(b.port) : null, serialNumber: b.serialNumber || null, deviceType: b.deviceType, location: b.location || null, username: b.username || null, password: b.password || null, apiKey: b.apiKey || null, apiSecret: b.apiSecret || null, baseUrl: b.baseUrl || null, siteCode: b.siteCode || null, isActive: b.isActive === true || b.isActive === "true" } });
    return res.status(201).json(item);
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to create device" }); }
};
export const updateDevice = async (req: Request, res: Response) => {
  try {
    const b = req.body;
    const item = await prisma.device.update({ where: { id: Number(req.params.id) }, data: { name: b.name, vendor: b.vendor, ipAddress: b.ipAddress || null, port: b.port ? Number(b.port) : null, serialNumber: b.serialNumber || null, deviceType: b.deviceType, location: b.location || null, username: b.username || null, password: b.password || null, apiKey: b.apiKey || null, apiSecret: b.apiSecret || null, baseUrl: b.baseUrl || null, siteCode: b.siteCode || null, isActive: b.isActive === true || b.isActive === "true" } });
    return res.json(item);
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to update device" }); }
};
export const deleteDevice = async (req: Request, res: Response) => {
  try { await prisma.device.delete({ where: { id: Number(req.params.id) } }); return res.json({ message: "Deleted successfully" }); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to delete device" }); }
};
export const testDeviceConnection = async (req: Request, res: Response) => {
  try {
    const device = await prisma.device.findUnique({ where: { id: Number(req.params.id) } });
    if (!device) return res.status(404).json({ message: "Device not found" });
    return res.json(await getDeviceAdapter(device).testConnection(device));
  } catch (error) { console.error(error); return res.status(500).json({ message: "Failed to test device connection" }); }
};
export const syncDevice = async (req: Request, res: Response) => {
  try { return res.json({ message: "Device synced successfully", ...(await syncDeviceLogs(Number(req.params.id))) }); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Failed to sync device" }); }
};
