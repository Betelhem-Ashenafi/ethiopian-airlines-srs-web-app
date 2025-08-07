"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { type Report, reports } from "@/lib/data"
import ReportDetailDialog from "./report-detail-dialog"
import { useAuth } from "@/components/auth-provider" // Import useAuth

export default function ReportsTable() {
  const { user } = useAuth() // Get the current user
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all") // This will be overridden for Department Admins
  const [severityFilter, setSeverityFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>(undefined)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Determine if the current user is a Department Admin and get their department
  const isDepartmentAdmin = user?.role === "Department Admin"
  const userDepartment = user?.department

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    const matchesSeverity = severityFilter === "all" || report.aiSeverity === severityFilter
    const matchesDate =
      !dateRange?.from ||
      !dateRange.to ||
      (new Date(report.timestamp) >= dateRange.from && new Date(report.timestamp) <= dateRange.to)

    // Apply department filter based on user role
    let matchesDepartment = true
    if (isDepartmentAdmin && userDepartment) {
      matchesDepartment = report.aiDepartment === userDepartment
    } else if (departmentFilter !== "all") {
      matchesDepartment = report.aiDepartment === departmentFilter
    }

    return matchesSearch && matchesStatus && matchesDepartment && matchesSeverity && matchesDate
  })

  const allDepartments = Array.from(new Set(reports.map((r) => r.aiDepartment)))
  const allSeverities = Array.from(new Set(reports.map((r) => r.aiSeverity)))

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={isDepartmentAdmin && userDepartment ? userDepartment : departmentFilter}
            onValueChange={setDepartmentFilter}
            disabled={isDepartmentAdmin && !!userDepartment} // Disable if Department Admin
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              {isDepartmentAdmin && userDepartment ? (
                <SelectItem value={userDepartment}>{userDepartment}</SelectItem>
              ) : (
                <>
                  <SelectItem value="all">All Departments</SelectItem>
                  {allDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {allSeverities.map((sev) => (
                <SelectItem key={sev} value={sev}>
                  {sev}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal bg-transparent">
                <Filter className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                  No reports found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === "Resolved"
                          ? "default"
                          : report.status === "In Progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.aiDepartment}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.aiSeverity === "Critical"
                          ? "destructive"
                          : report.aiSeverity === "Moderate"
                            ? "default"
                            : "outline"
                      }
                    >
                      {report.aiSeverity}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.selectedLocation}</TableCell>
                  <TableCell>{new Date(report.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{report.submittedBy}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewReport(report)}
                      aria-label="View report details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedReport && (
        <ReportDetailDialog
          report={selectedReport}
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
        />
      )}
    </div>
  )
}
