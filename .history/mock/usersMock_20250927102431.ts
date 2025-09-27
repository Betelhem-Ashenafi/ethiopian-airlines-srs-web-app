// mock/usersMock.ts

import { type User } from "@/lib/data";

export const usersMock: User[] = [
  {
    id: "1",
    employeeID: "EMP001",
    fullName: "John Doe",
    email: "john.doe@example.com",
    role: "System Admin",
    status: "Active",
    department: "IT",
    departmentId: "1",
  },
  {
    id: "2",
    employeeID: "EMP002",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Employee",
    status: "Inactive",
    department: "HR",
    departmentId: "2",
  },
];
