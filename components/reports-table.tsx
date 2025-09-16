"use client"

import { useEffect, useState } from "react";
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
import { fetchDepartmentsDropdown, fetchStatusDropdown, fetchSeveritiesDropdown } from "@/lib/dropdowns"
import ReportDetailDialog from "./report-detail-dialog"
import { useAuth } from "@/components/auth-provider"
import { useSearchParams } from "next/navigation"
import React from "react"

type ReportsTableProps = {
  reports?: Report[];
  last7DaysOnly?: boolean;
};

const ReportsTable: React.FC<ReportsTableProps> = ({ reports: externalReports, last7DaysOnly = false }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>(externalReports || [])
  const [loading, setLoading] = useState(!externalReports)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [departmentOptions, setDepartmentOptions] = useState<{id:string,name:string}[]>([]);
  const [statusOptions, setStatusOptions] = useState<{id:string,name:string}[]>([]);
  const [severities, setSeverities] = useState<{id:string,name:string}[]>([]);
  const [departmentMap, setDepartmentMap] = useState<Record<string,string>>({});
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>(undefined)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const searchParams = useSearchParams()
  const reportId = searchParams?.get("id")

  // Fetch dropdowns (depends on user so Dept Admin sees only their own department)
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    async function loadDropdowns() {
      try {
        console.log("[reports-table] loading dropdowns for user:", user);
        const [depts, statusesData, sevs] = await Promise.all([
          fetchDepartmentsDropdown(user ?? undefined),
          fetchStatusDropdown(),
          fetchSeveritiesDropdown()
        ]);

        if (!mounted) return;

        console.log("DEBUG departments", depts, "statuses", statusesData, "severities", sevs);
        setDepartmentOptions(depts || []);
        setStatusOptions(statusesData || []);
        setSeverities(sevs || []);

        const map = Object.fromEntries((depts || []).map(d => [String(d.id), d.name]));
        setDepartmentMap(map);

        // Dept Admin: set initial department filter (prefer id then normalized name)
        if (user?.role === "Department Admin") {
          const uid = String((user as any).departmentId ?? "");
          if (uid && map[uid]) {
            setDepartmentFilter(uid);
          } else if (user?.department) {
            const norm = (s?: string) => (s || "").trim().toLowerCase();
            const found = (depts || []).find(d => norm(d.name) === norm(user.department));
            if (found) setDepartmentFilter(String(found.id));
          }
        }
      } catch (err) {
        console.error("[reports-table] loadDropdowns error:", err);
        setDepartmentOptions([]);
        setStatusOptions([]);
        setSeverities([]);
      }
    }

    loadDropdowns();
    return () => { mounted = false; };
  }, [user]);

  // Fetch reports (depends on user)
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    async function loadReports() {
      try {
        const reportsData = await fetchReports(
          user && user.role === "Department Admin" ? user.departmentId : undefined
        );
        setReports(reportsData || []);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [user, externalReports]);

  // Lock department filter for Department Admins using their departmentId
  useEffect(() => {
    if (!user) return;
    if (user.role === "Department Admin" && user.departmentId) {
      setDepartmentFilter(String(user.departmentId));
    }
  }, [user]);

  const isDepartmentAdmin = user?.role === "Department Admin"

  let reportsToShow = reports;
  if (last7DaysOnly) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7* 24 * 60 * 60 * 1000);
    console.log("Filtering reports from:", sevenDaysAgo, "to now:", now);
    reportsToShow = reports.filter((report) => {
      if (!report.timestamp) return false;
      return new Date(report.timestamp) >= sevenDaysAgo;
    });
  }

  // Build quick lookup maps from dropdowns so we can accept either id or name as the selected value
  const statusMap = Object.fromEntries(statusOptions.map(s => [String(s.id), s.name]));
  const departmentMapLookup = Object.fromEntries(departmentOptions.map(d => [String(d.id), d.name]));
  const severityMap = Object.fromEntries(severities.map(s => [String(s.id), s.name]));

  const filteredReports = reportsToShow.filter((report) => {
    const matchesSearch =
      (report.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.submittedByName || '').toLowerCase().includes(searchTerm.toLowerCase())

    const selectedStatusName = statusMap[statusFilter] ?? statusFilter
    const selectedSeverityName = severityMap[severityFilter] ?? severityFilter

    const matchesStatus =
      statusFilter === "all" ||
      String((report as any).statusId) === String(statusFilter) ||
      report.statusName === selectedStatusName

    const matchesSeverity =
      severityFilter === "all" ||
      String((report as any).severityId) === String(severityFilter) ||
      report.severityName === selectedSeverityName

    const matchesDate =
      !dateRange?.from ||
      !dateRange.to ||
      (new Date(report.timestamp) >= dateRange.from && new Date(report.timestamp) <= dateRange.to)

    // Department filter (Department Admin locked to their departmentId)
    let matchesDepartment = true;
    if (user?.role === "Department Admin" && user.departmentId) {
      matchesDepartment =
        String(report.departmentId) === String(user.departmentId);
    } else if (departmentFilter !== "all") {
      matchesDepartment =
        String(report.departmentId) === String(departmentFilter);
    }

    return matchesSearch && matchesStatus && matchesDepartment && matchesSeverity && matchesDate
  })

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
                <SelectItem key={String(status.id)} value={String(status.id)}>{status.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={departmentFilter}
            onValueChange={setDepartmentFilter}
            disabled={isDepartmentAdmin}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentOptions.map((dept, i) => {
                const raw = dept.id ?? dept.name ?? `dept-${i}`;
                const value = String(raw).trim() || `dept-${i}`;
                const key = `${value}-${i}`;
                const label = dept.name || departmentMap[String(dept.id ?? value)] || `Department ${i + 1}`;
                return (
                  <SelectItem key={key} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {severities.map((sev) => (
                <SelectItem key={String(sev.id)} value={String(sev.id)}>{sev.name}</SelectItem>
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
                  <TableCell>
                    {report.departmentName}
                  </TableCell>
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
            )
            }
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