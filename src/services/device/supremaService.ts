import axios from "axios";
import { Device, VerifyType } from "@prisma/client";
import { DeviceAdapter, UnifiedAttendanceLog } from "./types";
export class SupremaService implements DeviceAdapter {
  async testConnection(device: Device) { return { ok: true, message: `Suprema adapter ready for ${device.name}.` }; }
  async pullLogs(device: Device): Promise<UnifiedAttendanceLog[]> {
    if (!device.baseUrl) return [];
    const res = await axios.get(`${device.baseUrl}/events`, { auth: device.username ? { username: device.username, password: device.password || "" } : undefined, headers: { "x-api-key": device.apiKey || "" } });
    return (res.data?.records || []).map((item: any) => ({ deviceUserId: item.user_id || item.card_id || null, logTime: new Date(item.datetime || item.timestamp), verifyType: (item.verifyType || "FINGERPRINT") as VerifyType, source: "DEVICE", direction: item.direction || null, rawData: item }));
  }
}
