// mock/reportsMock.ts
import { type Report } from "@/lib/data";

export const reportsMock: Report[] = [
  {
    id: "r1",
    title: "Network Outage",
    description: "Internet is down in the main office.",
    imageUrl: "",
    gpsCoordinates: "9.03, 38.74",
    selectedLocation: "Main Office",
    timestamp: new Date().toISOString(),
    submittedBy: "EMP001",
    submittedByName: "John Doe",
    deviceInfo: "PC-001",
    aiDepartment: "IT",
    departmentName: "IT",
    aiSeverity: "High",
    severityName: "High",
    status: "Open",
    statusName: "Open",
    statusId: "1",
    severityId: "3",
    departmentId: "1",
    syncStatus: "Pending",
    locationName: "Main Office",
    assignedTo: "EMP003",
    comments: [
      { author: "EMP003", timestamp: new Date().toISOString(), text: "We are investigating." }
    ]
  },
  {
    id: "r2",
    title: "Printer Issue",
    description: "Printer not working in HR department.",
    imageUrl: "",
    gpsCoordinates: "9.04, 38.75",
    selectedLocation: "HR Department",
    timestamp: new Date().toISOString(),
    submittedBy: "EMP002",
    submittedByName: "Jane Smith",
    deviceInfo: "PC-002",
    aiDepartment: "HR",
    departmentName: "HR",
    aiSeverity: "Low",
    severityName: "Low",
    status: "In Progress",
    statusName: "In Progress",
    statusId: "2",
    severityId: "1",
    departmentId: "2",
    syncStatus: "Synced",
    locationName: "HR Department",
    assignedTo: "EMP003",
    comments: []
  }
];
