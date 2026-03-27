import axios from "axios";
import { Device, VerifyType } from "@prisma/client";
import { DeviceAdapter, UnifiedAttendanceLog } from "./types";
export class ZktecoService implements DeviceAdapter {
  async testConnection(device: Device) { return { ok: true, message: `ZKTeco adapter ready for ${device.name}` }; }
  async pullLogs(device: Device): Promise<UnifiedAttendanceLog[]> {
    const cfg = (device.configJson ?? {}) as any;
    if (cfg.mode === "api" && device.baseUrl) {
      const res = await axios.get(`${device.baseUrl}/attendance/logs`, { headers: { Authorization: device.apiKey ? `Bearer ${device.apiKey}` : undefined } });
      return (res.data?.data || []).map((item: any) => ({ deviceUserId: item.deviceUserId || item.userId || null, logTime: new Date(item.logTime || item.timestamp), verifyType: (item.verifyType || "FINGERPRINT") as VerifyType, source: "DEVICE", direction: item.direction || null, rawData: item }));
    }
    return [];
  }
}
