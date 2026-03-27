import { Device } from "@prisma/client";
import { DeviceAdapter } from "./types";
import { ZktecoService } from "./zktecoService";
import { HikvisionService } from "./hikvisionService";
import { AnvizService } from "./anvizService";
import { SupremaService } from "./supremaService";
import { MockDeviceService } from "./mockDeviceService";
export const getDeviceAdapter = (device: Device): DeviceAdapter => {
  switch (device.vendor) {
    case "ZKTECO": return new ZktecoService();
    case "HIKVISION": return new HikvisionService();
    case "ANVIZ": return new AnvizService();
    case "SUPREMA": return new SupremaService();
    default: return new MockDeviceService();
  }
};
