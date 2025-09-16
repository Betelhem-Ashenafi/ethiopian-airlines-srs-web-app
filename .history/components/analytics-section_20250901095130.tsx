"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, LineChart, Line } from "recharts"
import type { Report } from "@/lib/data"
import ListChecks from "@/components/ListChecks" // Declare the ListChecks variable
import { useAuth } from "@/components/auth-provider"
import { fetchStatusDropdown } from "@/lib/dropdowns"
// Accept reports as a prop for live data
// If not provided, fallback to static
type AnalyticsSectionProps = {
  reports?: Report[];
};
// ...existing code...

// ...existing code...
function AnalyticsSectionInner({ reports: externalReports }: AnalyticsSectionProps) {
  // Status options state for dropdowns and chart labels
  const [statusOptions, setStatusOptions] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    fetchStatusDropdown().then(setStatusOptions);
  }, []);
  const { user } = useAuth() // Get the current user
  const [timeframe, setTimeframe] = useState("all") // all, last_7_days, last_30_days, last_90_days
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [chartType, setChartType] = useState("bar") // bar, pie, line

  // Determine if the current user is a Department Admin and get their department
  const isDepartmentAdmin = user?.role === "Department Admin"
  const userDepartment = user?.department

    const getFilteredReports = () => {
      let filtered = externalReports || []

    // Apply timeframe filter (simplified for demo)
    const now = new Date()
    if (timeframe === "last_7_days") {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
      filtered = filtered.filter((r) => new Date(r.timestamp) >= sevenDaysAgo)
    } else if (timeframe === "last_30_days") {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
      filtered = filtered.filter((r) => new Date(r.timestamp) >= thirtyDaysAgo)
    } else if (timeframe === "last_90_days") {
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90))
      filtered = filtered.filter((r) => new Date(r.timestamp) >= ninetyDaysAgo)
    }

    // Apply department filter based on user role
    if (isDepartmentAdmin && userDepartment) {
      filtered = filtered.filter((r) => r.aiDepartment === userDepartment)
    } else if (departmentFilter !== "all") {
      filtered = filtered.filter((r) => r.aiDepartment === departmentFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }
    return filtered
  }

  const filteredReports = getFilteredReports()

  // --- Data for Charts (simplified for demo, in real app use charting library) ---
  const reportsByDepartment = filteredReports.reduce(
    (acc, report) => {
      acc[report.aiDepartment] = (acc[report.aiDepartment] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const reportsBySeverity = filteredReports.reduce(
    (acc, report) => {
      acc[report.aiSeverity] = (acc[report.aiSeverity] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const reportsByStatus = filteredReports.reduce(
    (acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Map status keys to backend names for chart labels
  const statusNameMap = statusOptions.reduce<Record<string, string>>((acc: Record<string, string>, s: { id: string; name: string }) => {
    acc[s.id] = s.name;
    acc[s.name] = s.name; // support both id and name as key
    return acc;
  }, {});

  const totalReports = filteredReports.length
  const resolvedReports = reportsByStatus["Resolved"] || 0
  const inProgressReports = reportsByStatus["In Progress"] || 0
  const submittedReports = reportsByStatus["Submitted"] || 0

  const allDepartments = Array.from(new Set((externalReports || []).map((r) => r.aiDepartment)))

  const handleExport = (type: "excel" | "pdf") => {
    alert(`Exporting ${type} for current filters... (This is a placeholder action)`)
    // In a real app, trigger backend export
  }


  // Helper to render chart by type
  function renderChart(type: string, data: any[], dataKey: string, labelKey: string, color: string) {
    if (type === "bar") {
      return (
        <BarChart width={400} height={300} data={data}>
          <XAxis dataKey={labelKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      );
    }
    if (type === "pie") {
      return (
        <PieChart width={400} height={300}>
          <Pie data={data} dataKey={dataKey} nameKey={labelKey} cx="50%" cy="50%" outerRadius={100} fill={color} label />
          <Tooltip />
          <Legend />
        </PieChart>
      );
    }
    if (type === "line") {
      return (
        <LineChart width={400} height={300} data={data}>
          <XAxis dataKey={labelKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={color} />
        </LineChart>
      );
    }
    return null;
  }

  // Prepare chart data
  const statusChartData = Object.entries(reportsByStatus).map(([status, count]) => ({ status: statusNameMap[status] || status, count }));
  const departmentChartData = Object.entries(reportsByDepartment).map(([department, count]) => ({ department, count }));
  const severityChartData = Object.entries(reportsBySeverity).map(([severity, count]) => ({ severity, count }));

  // Layout: two charts per row
  return (
    <div>
      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <div className="flex flex-wrap gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
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
                    {allDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
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
            <Button onClick={() => handleExport("excel")} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button onClick={() => handleExport("pdf")} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Reports by Status</CardTitle>
            <CardDescription>Breakdown of issues by status.</CardDescription>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              renderChart(chartType, statusChartData, "count", "status", "#8884d8")
            ) : (
              <div className="text-center text-muted-foreground">No data for this filter.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports by Department</CardTitle>
            <CardDescription>Distribution of issues across departments.</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentChartData.length > 0 ? (
              renderChart(chartType, departmentChartData, "count", "department", "#82ca9d")
            ) : (
              <div className="text-center text-muted-foreground">No data for this filter.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports by Severity</CardTitle>
            <CardDescription>Breakdown of issues by severity level.</CardDescription>
          </CardHeader>
          <CardContent>
            {severityChartData.length > 0 ? (
              renderChart(chartType, severityChartData, "count", "severity", "#ffb347")
            ) : (
              <div className="text-center text-muted-foreground">No data for this filter.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const AnalyticsSection = (props: AnalyticsSectionProps) => (
  <AnalyticsSectionInner {...props} />
);
export default AnalyticsSection;
