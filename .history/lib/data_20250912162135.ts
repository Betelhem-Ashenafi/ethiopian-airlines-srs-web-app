import type { LucideIcon } from "lucide-react"
import { Home, ListChecks, BarChart, Users, Settings } from "lucide-react"

import type { LucideIcon } from "lucide-react"
import { Home, ListChecks, BarChart, Users, Settings } from "lucide-react"

export type Comment = { author: string; timestamp: string; text: string }

export type Report = {
  id: string
  title: string
  description: string
  imageUrl?: string
  gpsCoordinates?: string
  selectedLocation?: string
  timestamp: string
  submittedBy: string
  submittedByName?: string
  deviceInfo?: string
  // Name fields provided by backend projections
  departmentName?: string
  severityName?: string
  statusName?: string
  locationName?: string
  // Optional raw IDs
  statusId?: string
  severityId?: string
  departmentId?: string
  syncStatus?: string
  assignedTo?: string
  comments?: Comment[]
}

export type User = {
  id: string
  employeeID?: string
  fullName: string
  email?: string
  role: "System Admin" | "Department Admin" | "Employee"
  status?: "Active" | "Inactive"
  password?: string
  department?: string
}

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  roles?: User["role"][]
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Reports", href: "/dashboard?tab=reports", icon: ListChecks, roles: ["System Admin", "Department Admin"] },
  { title: "Analytics", href: "/dashboard?tab=analytics", icon: BarChart, roles: ["System Admin", "Department Admin"] },
  { title: "User Management", href: "/dashboard?tab=users", icon: Users, roles: ["System Admin"] },
  { title: "Settings", href: "/dashboard?tab=settings", icon: Settings },
]

export const sampleReports: Report[] = [
  {
    id: "48217128-d567-4fe0-9926-cb9812494b94",
    title: "fire",
    description: "the office it burns",
    imageUrl: "http://svdcbas02:8212//images/dea8e270-1725-4498-b872-0881bd117e44.jpg",
    gpsCoordinates: "90,180",
    selectedLocation: "Terminal A",
    timestamp: "2025-09-05T10:55:18.3430291",
    submittedBy: "u200",
    submittedByName: "Tewahido Haimanot",
    departmentName: "Safety",
    severityName: "Critical",
    statusName: "In Progress",
    locationName: "Terminal A",
    syncStatus: "Synced",
    comments: [],
  },
  {
    id: "b75ba377-e6a5-44d4-bc77-e4ebc0e189135",
    title: "Broken Streetlight",
    description: "The streetlight on Main St. near the park is not functioning.",
    imageUrl: "http://svdcbas02:8212//images/16b3674c-e072-462f-b657-933ebc2765b5.jpg",
    gpsCoordinates: "90,180",
    selectedLocation: "Headquarters",
    timestamp: "2025-09-05T10:23:42.3509582",
    submittedBy: "u201",
    submittedByName: "Lemma Dagne",
    departmentName: "Safety",
    severityName: "High",
    statusName: "Reopened",
    locationName: "Headquarters",
    syncStatus: "Synced",
    comments: [],
  },
]

export const users: User[] = [
  { id: 'u200', fullName: 'Tewahido Haimanot', role: 'Employee' },
  { id: 'u201', fullName: 'Lemma Dagne', role: 'Employee' },
]
    selectedLocation: "Test Location",
    timestamp: "2025-08-10T10:00:00Z",
    submittedBy: "Test User",
    aiDepartment: "Facility Maintenance",
    aiSeverity: "Moderate",
    status: "In Progress",
    comments: [],
  },
  {
    id: "ET-2025-08-04-TEST3",
    title: "Test Report 8 Days Ago",
    description: "This report is for testing dashboard filtering (8 days ago, should NOT show in dashboard).",
    imageUrl: "/placeholder.svg?height=300&width=500",
    gpsCoordinates: "9.0120, 38.7720",
    selectedLocation: "Test Location",
    timestamp: "2025-08-04T12:00:00Z",
    submittedBy: "Test User",
    aiDepartment: "Electrical Maintenance",
    aiSeverity: "High",
    status: "Resolved",
    comments: [],
  },
  {
    id: "ET-2025-07-23-TEST4",
    title: "Test Report 20 Days Ago",
    description: "This report is for testing dashboard filtering (20 days ago, should NOT show in dashboard).",
    imageUrl: "/placeholder.svg?height=300&width=500",
    gpsCoordinates: "9.0130, 38.7730",
    selectedLocation: "Test Location",
    timestamp: "2025-07-23T09:00:00Z",
    submittedBy: "Test User",
    aiDepartment: "IT Support",
    aiSeverity: "Critical",
    status: "Open",
    comments: [],
  },
  {
    id: "ET-2025-07-17-001",
    title: "Large Crack Near Gate 12",
    description:
      "Observed a significant crack in the floor, approximately 1 meter long and 2 cm wide, directly in the path of passenger flow at Gate 12. Potential tripping hazard.",
    imageUrl: "/placeholder.svg?height=300&width=500",
    gpsCoordinates: "9.0054, 38.7636",
    selectedLocation: "Bole International Airport - Terminal 2, Gate 12",
    timestamp: "2025-07-17T10:30:00Z",
    submittedBy: "Selam (EMP-001)",
    aiDepartment: "Facility Maintenance",
    aiSeverity: "Critical",
    status: "In Progress",
    assignedTo: "Maintenance Team Alpha",
    comments: [
      {
        author: "Ato Kebede",
        timestamp: "2025-07-17T11:00:00Z",
        text: "Team Alpha: Please prioritize this. Requires immediate attention due to safety risk. Confirm if specialized equipment is needed.",
      },
    ],
  },
  {
    id: "ET-2025-07-17-002",
    title: "Damaged Runway Light - Section 3B",
    description:
      "Runway lighting system damaged in section 3B. Light fixture broken, wiring exposed. Potential hazard for night operations.",
    imageUrl: "/placeholder.svg?height=300&width=500",
    gpsCoordinates: "9.0010, 38.7500",
    selectedLocation: "Bole International Airport - Runway 07R",
    timestamp: "2025-07-17T09:15:00Z",
    submittedBy: "Dawit (EMP-002)",
    aiDepartment: "Electrical Maintenance",
    aiSeverity: "Critical",
    status: "Open",
    comments: [],
  },
  {
    id: "ET-2025-07-16-003",
    title: "Printer Malfunction in HR",
    description: 'The printer in the HR department (HP LaserJet 400) is not printing. Displays "Error 59.F0".',
    imageUrl: "/placeholder.svg?height=300&width=500",
    gpsCoordinates: "9.0060, 38.7650",
    selectedLocation: "Head Office - HR Department",
    timestamp: "2025-07-16T14:00:00Z",
    submittedBy: "Aster (EMP-003)",
    aiDepartment: "IT Support", // Overridden from original AI tag
    aiSeverity: "Moderate",
    status: "Resolved",
    assignedTo: "IT Team Beta",
    comments: [
      {
        author: "Wondwosen",
        timestamp: "2025-07-16T14:30:00Z",
        text: "AI misclassified this as Facility. Re-routed to IT. Contact HR for specific printer model and error codes.",
      },
      {
        author: "IT Team Beta",
        timestamp: "2025-07-16T16:00:00Z",
        text: "Replaced fuser assembly. Printer is now operational.",
      },
    ],
  },
  // ...existing reports...
{
  id: "ET-2025-07-18-006",
  title: "Loose Handrail in Stairwell",
  description: "Handrail in the main stairwell is loose and could cause accidents if not fixed soon.",
  imageUrl: "/placeholder.svg?height=300&width=500",
  gpsCoordinates: "9.0080, 38.7660",
  selectedLocation: "Head Office - Main Stairwell",
  timestamp: "2025-07-18T09:00:00Z",
  submittedBy: "Birhanu (EMP-006)",
  aiDepartment: "Facility Maintenance",
  aiSeverity: "High", // <-- This makes "High" show up in the dropdown!
  status: "Open",
  assignedTo: "Maintenance Team Gamma",
  comments: [
    {
      author: "Maintenance Team Gamma",
      timestamp: "2025-07-18T10:00:00Z",
      text: "Scheduled for repair this afternoon.",
    },
  ],
},
// ...existing reports...
  {
    id: "ET-2025-07-15-004",
    title: "Leaking Faucet - Staff Restroom",
    description:
      "Faucet in the male staff restroom on the 3rd floor is constantly dripping. Wasting water and causing a slippery floor.",
    imageUrl: "/placeholder.svg?height=300&width=500",
    gpsCoordinates: "9.0070, 38.7640",
    selectedLocation: "Head Office - 3rd Floor",
    timestamp: "2025-07-15T08:45:00Z",
    submittedBy: "Kebede (EMP-004)",
    aiDepartment: "Plumbing",
    aiSeverity: "Low",
    status: "Resolved",
    assignedTo: "Plumbing Team",
    comments: [
      {
        author: "Plumbing Team",
        timestamp: "2025-07-15T10:00:00Z",
        text: "Replaced washer. Faucet no longer leaking.",
      },
    ],
  },
  {
    id: "ET-2025-07-14-005",
    title: "Broken Chair in Waiting Area",
    description: "One of the chairs in the domestic departures waiting area has a broken leg. Unsafe for passengers.",
    imageUrl: "/placeholder.svg?height=300&width=500",
    gpsCoordinates: "9.0050, 38.7620",
    selectedLocation: "Bole International Airport - Domestic Departures",
    timestamp: "2025-07-14T11:20:00Z",
    submittedBy: "Tigist (EMP-005)",
    aiDepartment: "Facility Maintenance",
    aiSeverity: "Moderate",
    status: "In Progress",
    assignedTo: "Maintenance Team Beta",
    comments: [],
  },
]

export const users: User[] = [
  {
    id: "usr-001",
  employeeID: "EMP-001",
    fullName: "Selam Tesfaye",
    email: "selam.t@ethiopian.com",
    role: "Employee",
    status: "Active",
    password: "password123", // For demo purposes
  },
  {
    id: "usr-002",
  employeeID: "EMP-002",
    fullName: "Dawit Abebe",
    email: "dawit.a@ethiopian.com",
    role: "Employee",
    status: "Active",
    password: "password123", // For demo purposes
  },
  {
    id: "usr-003",
  employeeID: "EMP-003",
    fullName: "Aster Lemma",
    email: "aster.l@ethiopian.com",
    role: "Department Admin",
    status: "Active",
    password: "password123", // For demo purposes
    department: "IT Support", // Aster is an IT Admin
  },
  {
    id: "usr-004",
  employeeID: "EMP-004",
    fullName: "Ato Kebede",
    email: "kebede.m@ethiopian.com",
    role: "Department Admin",
    status: "Active",
    password: "password123", // For demo purposes
    department: "Facility Maintenance", // Ato Kebede is Facility Maintenance Admin
  },
  {
    id: "usr-005",
  employeeID: "EMP-005",
    fullName: "Wondwosen Getachew",
    email: "wondwosen.g@ethiopian.com",
    role: "Department Admin",
    status: "Active",
    password: "password123", // For demo purposes
    department: "Electrical Maintenance", // Wondwosen is Electrical Maintenance Admin
  },
  {
    id: "usr-006",
  employeeID: "EMP-006",
    fullName: "Ato Tesfaye",
    email: "tesfaye.s@ethiopian.com",
    role: "System Admin",
    status: "Active",
    password: "adminpassword", // For demo purposes
  },
  {
    id: "usr-007",
  employeeID: "EMP-007",
    fullName: "Ms. Almaz",
    email: "almaz.e@ethiopian.com",
    role: "System Admin",
    status: "Active",
    password: "adminpassword", // For demo purposes
  },
  {
    id: "usr-008",
  employeeID: "EMP-008",
    fullName: "Former Employee",
    email: "former.e@ethiopian.com",
    role: "Employee",
    status: "Inactive",
    password: "password123", // For demo purposes
  },
]
