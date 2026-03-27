import { prisma } from "../config/prisma";
import { getDeviceAdapter } from "./device/deviceFactory";

export const syncDeviceLogs = async (deviceId: number) => {
  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new Error("Device not found");
  const logs = await getDeviceAdapter(device).pullLogs(device);
  let count = 0;
  for (const log of logs) {
    const exists = await prisma.attendanceLog.findFirst({ where: { deviceId: device.id, deviceUserId: log.deviceUserId || undefined, logTime: log.logTime, verifyType: log.verifyType } });
    if (exists) continue;
    const employee = log.deviceUserId ? await prisma.employee.findFirst({ where: { OR: [{ deviceUserId: log.deviceUserId }, { employeeCode: log.deviceUserId }] } }) : null;
    await prisma.attendanceLog.create({ data: { employeeId: employee?.id || null, deviceId: device.id, deviceUserId: log.deviceUserId || null, logTime: log.logTime, verifyType: log.verifyType, source: log.source, direction: log.direction || null, rawData: log.rawData } });
    count += 1;
  }
  await prisma.device.update({ where: { id: device.id }, data: { lastSyncAt: new Date() } });
  return { count };
};
