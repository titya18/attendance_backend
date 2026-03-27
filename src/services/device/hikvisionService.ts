import axios from "axios";
import { Device, VerifyType } from "@prisma/client";
import { DeviceAdapter, UnifiedAttendanceLog } from "./types";
export class HikvisionService implements DeviceAdapter {
  async testConnection(device: Device) { return { ok: true, message: `Hikvision adapter ready for ${device.name}.` }; }
  async pullLogs(device: Device): Promise<UnifiedAttendanceLog[]> {
    if (!device.baseUrl) return [];
    const res = await axios.get(`${device.baseUrl}/attendance/logs`, { auth: device.username ? { username: device.username, password: device.password || "" } : undefined });
    return (res.data?.list || []).map((item: any) => ({ deviceUserId: item.employeeNo || item.deviceUserId || null, logTime: new Date(item.time), verifyType: (item.verifyType || "FACE") as VerifyType, source: "DEVICE", direction: item.direction || null, rawData: item }));
  }
}
