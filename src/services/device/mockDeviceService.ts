import { Device } from "@prisma/client";
import { DeviceAdapter, UnifiedAttendanceLog } from "./types";
export class MockDeviceService implements DeviceAdapter {
  async testConnection(device: Device) { return { ok: true, message: `Mock adapter connected to ${device.name}.` }; }
  async pullLogs(_device: Device): Promise<UnifiedAttendanceLog[]> { return []; }
}
