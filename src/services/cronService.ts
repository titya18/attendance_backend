import cron from "node-cron";
import { prisma } from "../config/prisma";
import { syncDeviceLogs } from "./deviceSyncService";

export const startCronJobs = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("Running device sync cron...");
    const devices = await prisma.device.findMany({ where: { isActive: true }, select: { id: true } });
    for (const device of devices) {
      try { await syncDeviceLogs(device.id); }
      catch (error) { console.error(`Failed to sync device ${device.id}`, error); }
    }
  });
};
