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
import type { Report } from "../lib/data"
import { fetchReports } from "@/lib/reports"
import { fetchStatusDropdown, fetchDepartmentsDropdown, fetchSeveritiesDropdown } from "@/lib/dropdowns"
// import { fetchStatusDropdown, fetchDepartmentsDropdown } from "@/lib/dropdowns"
// import { fetchSeveritiesDropdown } from "@/lib/dropdowns"
// import { fetchSeveritiesDropdown } from "@/lib/dropdowns" (removed)
import ReportDetailDialog from "./report-detail-dialog"
import { useAuth } from "@/components/auth-provider" // Import useAuth
import { useSearchParams } from "next/navigation"

import React from "react"

type ReportsTableProps = {
  reports?: Report[];
  last7DaysOnly?: boolean;
};

const ReportsTable: React.FC<ReportsTableProps> = ({ reports: externalReports, last7DaysOnly = false }) => {
  const { user } = useAuth() // Get the current user
  const [reports, setReports] = useState<Report[]>(externalReports || [])
  const [loading, setLoading] = useState(!externalReports)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState("all") // This will be overridden for Department Admins
  const [severityFilter, setSeverityFilter] = useState("all")
  // Hardcoded dropdown options
  const [statusOptions, setStatusOptions] = useState<{id: string, name: string}[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{id: string, name: string}[]>([]);
  const [severities, setSeverities] = useState<{id: string, name: string}[]>([]);
    // Removed duplicate state declarations for filters and options
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>(undefined)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const searchParams = useSearchParams()
  const reportId = searchParams?.get("id")

  // Determine if the current user is a Department Admin and get their department
  const isDepartmentAdmin = user?.role === "Department Admin"
  const userDepartment = user?.department

  useEffect(() => {
    if (externalReports) {
      setReports(externalReports);
      setLoading(false);
      return;
    }

    let mounted = true;
    async function getReports() {
      setLoading(true);
      try {
        // If user is Department Admin, pass their department to the API (backend should enforce authorization)
        const dept = isDepartmentAdmin ? userDepartment : undefined
        const data = await fetchReports(dept as any)
        if (!mounted) return
        setReports(data);
      } catch (err: any) {
        if (!mounted) return
        setError(err.message)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    getReports();
    return () => { mounted = false }
  }, [externalReports, isDepartmentAdmin, userDepartment])

  // Dev-only debugging: print sample mapped report and dropdown values to confirm ID shapes
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!reports || reports.length === 0) return;
    console.debug('ReportsTable debug sample report:', reports[0]);
    console.debug('Status options:', statusOptions.slice(0, 10));
    console.debug('Department options:', departmentOptions.slice(0, 10));
    console.debug('Severity options:', severities.slice(0, 10));
  }, [reports, statusOptions, departmentOptions, severities]);

  // Load severities for dropdown from backend (id/name pairs)
  useEffect(() => {
    let mounted = true;
    async function loadSeverities() {
      try {
        const list = await fetchSeveritiesDropdown();
        if (mounted && list && list.length) setSeverities(list);
      } catch (e) {
        // keep empty list on error
        console.debug("Failed to load severities", e);
      }
    }
    loadSeverities();
    return () => { mounted = false }
  }, [])

  // Load statuses and departments for dropdowns
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const statuses = await fetchStatusDropdown();
        if (mounted && statuses && statuses.length) setStatusOptions(statuses);
      } catch (e) {
        console.debug('Failed to load statuses', e);
      }
      try {
        const depts = await fetchDepartmentsDropdown();
        if (mounted && depts && depts.length) setDepartmentOptions(depts);
      } catch (e) {
        console.debug('Failed to load departments', e);
      }
    }
    load();
    return () => { mounted = false }
  }, [])

  // last7DaysOnly is now a prop

  // If last7DaysOnly, filter reports to last 7 days
  let reportsToShow = reports;
  if (last7DaysOnly) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    reportsToShow = reports.filter((report) => {
      if (!report.timestamp) return false;
      return new Date(report.timestamp) >= sevenDaysAgo;
    });
  }

  // Build quick lookup maps from dropdowns so we can accept either id or name as the selected value
  const statusMap = Object.fromEntries(statusOptions.map(s => [s.id, s.name]));
  const departmentMap = Object.fromEntries(departmentOptions.map(d => [d.id, d.name]));
  const severityMap = Object.fromEntries(severities.map(s => [s.id, s.name]));

  const filteredReports = reportsToShow.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
    // Use statusId for filtering
  // statusFilter holds the status ID; compare against report.statusId when available
  // Resolve selected filter to a human-readable name when possible (map id->name)
  const selectedStatusName = statusMap[statusFilter] ?? statusFilter
  const selectedSeverityName = severityMap[severityFilter] ?? severityFilter
  const selectedDepartmentName = departmentMap[departmentFilter] ?? departmentFilter

  const matchesStatus =
    statusFilter === "all" ||
    String((report as any).statusId) === String(statusFilter) ||
    report.status === statusFilter ||
    report.statusName === selectedStatusName ||
    report.status === selectedStatusName

  // severityFilter may be an ID or a name; accept both
  const matchesSeverity =
    severityFilter === "all" ||
    String((report as any).severityId) === String(severityFilter) ||
    report.aiSeverity === severityFilter ||
    report.severityName === selectedSeverityName ||
    report.aiSeverity === selectedSeverityName
    const matchesDate =
      !dateRange?.from ||
      !dateRange.to ||
      (new Date(report.timestamp) >= dateRange.from && new Date(report.timestamp) <= dateRange.to)

    // Department filter (Department Admin locked to their department)
    let matchesDepartment = true
    if (isDepartmentAdmin && userDepartment) {
      matchesDepartment =
        report.aiDepartment === userDepartment ||
        report.departmentName === userDepartment ||
        String((report as any).departmentId) === String(userDepartment)
    } else if (departmentFilter !== "all") {
      const resolvedDeptName = departmentMap[departmentFilter]
      const matchesResolvedName = resolvedDeptName ? (report.aiDepartment === resolvedDeptName || report.departmentName === resolvedDeptName) : false
      matchesDepartment =
        String((report as any).departmentId) === String(departmentFilter) ||
        report.aiDepartment === departmentFilter ||
        report.departmentName === departmentFilter ||
        matchesResolvedName
    }

    return matchesSearch && matchesStatus && matchesDepartment && matchesSeverity && matchesDate
  })

  const allDepartments = departmentOptions.map((d) => d)
  // Severities now come from API

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setIsDetailDialogOpen(true)
  }

  const handleReportUpdated = (changes: Partial<Report> & { id: string }) => {
    setReports(prev => prev.map(r => r.id === changes.id ? { ...r, ...changes } as Report : r));
    if (selectedReport && selectedReport.id === changes.id) {
      setSelectedReport(prev => prev ? { ...prev, ...changes } as Report : prev);
    }
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
              {statusOptions.map((status) => (
                <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={isDepartmentAdmin && userDepartment ? userDepartment : departmentFilter}
            onValueChange={setDepartmentFilter}
            disabled={isDepartmentAdmin && !!userDepartment}
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
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
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
              {severities.map((sev) => (
                <SelectItem key={sev.id} value={sev.id}>{sev.name}</SelectItem>
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
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No reports found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
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
            onUpdate={handleReportUpdated}
        />
      )}
    </div>
  )
}

export default ReportsTable;
