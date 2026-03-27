import axios from "axios";
import { Device, VerifyType } from "@prisma/client";
import { DeviceAdapter, UnifiedAttendanceLog } from "./types";
export class AnvizService implements DeviceAdapter {
  async testConnection(device: Device) { return { ok: true, message: `Anviz adapter ready for ${device.name}.` }; }
  async pullLogs(device: Device): Promise<UnifiedAttendanceLog[]> {
    if (!device.baseUrl || !device.apiKey) return [];
    const res = await axios.get(`${device.baseUrl}/attendance-records`, { headers: { Authorization: `Bearer ${device.apiKey}` } });
    return (res.data?.items || []).map((item: any) => ({ deviceUserId: item.employeeNo || item.workNo || null, logTime: new Date(item.checkTime || item.time), verifyType: (item.verifyType || "FINGERPRINT") as VerifyType, source: "DEVICE", direction: item.direction || null, rawData: item }));
  }
}
