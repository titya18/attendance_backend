import { Device, LogSource, VerifyType } from "@prisma/client";

export type UnifiedAttendanceLog = {
  deviceUserId?: string | null;
  employeeCode?: string | null;
  logTime: Date;
  verifyType: VerifyType;
  source: LogSource;
  direction?: string | null;
  rawData?: any;
};

export interface DeviceAdapter {
  testConnection(device: Device): Promise<{ ok: boolean; message: string }>;
  pullLogs(device: Device, from?: Date, to?: Date): Promise<UnifiedAttendanceLog[]>;
}
