import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "Administrator" },
    update: {},
    create: { name: "Administrator", description: "Full system access" },
  });

  const permissionCodes = [
    ["EMPLOYEE_VIEW", "View Employees"],
    ["EMPLOYEE_CREATE", "Create Employees"],
    ["EMPLOYEE_EDIT", "Edit Employees"],
    ["EMPLOYEE_DELETE", "Delete Employees"],
    ["DEPARTMENT_VIEW", "View Departments"],
    ["DEPARTMENT_CREATE", "Create Departments"],
    ["DEPARTMENT_EDIT", "Edit Departments"],
    ["DEPARTMENT_DELETE", "Delete Departments"],
    ["SHIFT_VIEW", "View Shifts"],
    ["SHIFT_CREATE", "Create Shifts"],
    ["SHIFT_EDIT", "Edit Shifts"],
    ["SHIFT_DELETE", "Delete Shifts"],
    ["DEVICE_VIEW", "View Devices"],
    ["DEVICE_CREATE", "Create Devices"],
    ["DEVICE_EDIT", "Edit Devices"],
    ["DEVICE_DELETE", "Delete Devices"],
    ["DEVICE_SYNC", "Sync Devices"],
    ["REPORT_VIEW", "View Reports"],
    ["REPORT_EXPORT", "Export Reports"],
  ] as const;

  for (const [code, name] of permissionCodes) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, name },
    });

    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }

  await prisma.user.updateMany({ where: { username: "admin" }, data: { roleId: adminRole.id } });

  const hr = await prisma.department.upsert({
    where: { name: "HR" },
    update: {},
    create: { name: "HR", description: "Human Resources" },
  });
  const it = await prisma.department.upsert({
    where: { name: "IT" },
    update: {},
    create: { name: "IT", description: "Information Technology" },
  });
  const shiftA = await prisma.shift.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Morning Shift", startTime: "08:00", endTime: "17:00", lateAfterMin: 15, earlyOutMin: 15 },
  });

  await prisma.employee.upsert({
    where: { employeeCode: "EMP001" },
    update: {},
    create: {
      employeeCode: "EMP001",
      firstName: "John",
      lastName: "Doe",
      gender: "Male",
      phone: "012345678",
      email: "john@example.com",
      deviceUserId: "1001",
      departmentId: hr.id,
      shiftId: shiftA.id,
      status: "ACTIVE",
    },
  });

  await prisma.employee.upsert({
    where: { employeeCode: "EMP002" },
    update: {},
    create: {
      employeeCode: "EMP002",
      firstName: "Jane",
      lastName: "Smith",
      gender: "Female",
      phone: "098765432",
      email: "jane@example.com",
      deviceUserId: "1002",
      departmentId: it.id,
      shiftId: shiftA.id,
      status: "ACTIVE",
    },
  });

  await prisma.device.create({
    data: {
      name: "Mock Device 1",
      vendor: "MOCK",
      ipAddress: "192.168.1.201",
      port: 4370,
      deviceType: "Attendance Terminal",
      location: "Front Office",
      isActive: true,
    },
  }).catch(() => null);

  console.log("Seed completed");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());
