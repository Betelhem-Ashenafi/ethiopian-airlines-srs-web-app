"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { type Report } from "@/lib/data"
import { fetchReports } from "@/lib/reports"
// import { fetchSeveritiesDropdown } from "@/lib/dropdowns" (removed)
import ReportDetailDialog from "./report-detail-dialog"
import { useAuth } from "@/components/auth-provider" // Import useAuth
import { useSearchParams } from "next/navigation"

const ReportsTable = () => {
  const { user } = useAuth() // Get the current user
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all") // This will be overridden for Department Admins
  const [severityFilter, setSeverityFilter] = useState("all")
  // const [severities, setSeverities] = useState<{ id: string; name: string }[]>([]) (removed)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>(undefined)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const searchParams = useSearchParams()
  const reportId = searchParams.get("id")

  useEffect(() => {
    async function getReports() {
      try {
        const data = await fetchReports();
        setReports(data);
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    getReports();
  }, [])
  // Determine if the current user is a Department Admin and get their department
  const isDepartmentAdmin = user?.role === "Department Admin"
  const userDepartment = user?.department

  // Add a variable to control last 7 days filter (set to false by default)
  const last7DaysOnly = false;

  // If last7DaysOnly, filter reports to last 7 days
  let reportsToShow = reports;
  if (last7DaysOnly) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    reportsToShow = reports.filter((report) => new Date(report.timestamp) >= sevenDaysAgo);
  }

  const filteredReports = reportsToShow.filter((report) => {
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
  // Severities now come from API

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setIsDetailDialogOpen(true)
  }

  useEffect(() => {
    if (reportId) {
      const found = filteredReports.find((r) => r.id === reportId)
      if (found) {
        setSelectedReport(found)
        setIsDetailDialogOpen(true)
      }
    }
  }, [reportId, filteredReports])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

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
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Reject">Reject</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
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
          {/* Severity dropdown removed. You can add static values or use report data for filtering if needed. */}
          {/* Severity filter fully removed */}
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
              {/* Severity column removed */}
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
                    <Badge variant="outline">
                      {report.statusName}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.departmentName}</TableCell>
                  <TableCell>{report.severityName}</TableCell>
                  <TableCell>{new Date(report.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{report.submittedByName}</TableCell>
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

export default ReportsTable;
