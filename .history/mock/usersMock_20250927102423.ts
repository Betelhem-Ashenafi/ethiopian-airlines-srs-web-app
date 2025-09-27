// mock/usersMock.ts

import { type User } from "@/lib/data";

export const usersMock: User[] = [
  {
    id: 1,
    fullName: "John Doe",
    email: "john.doe@example.com",
    role: "System Admin",
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: "IT" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Employee",
    isActive: false,
    departmentId: 2,
    department: { id: 2, name: "HR" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
