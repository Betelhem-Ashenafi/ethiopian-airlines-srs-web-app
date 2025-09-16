"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, LineChart, Line } from "recharts"
import type { Report } from "@/lib/data"
import ListChecks from "@/components/ListChecks"
import ReportsTable from "@/components/reports-table"
import { useAuth } from "@/components/auth-provider"
import { fetchStatusDropdown, fetchDepartmentsDropdown, fetchSeveritiesDropdown } from "@/lib/dropdowns"
// Accept reports as a prop for live data
// If not provided, fallback to static
type AnalyticsSectionProps = {
  reports?: Report[];
};
function AnalyticsSection({ reports: externalReports }: AnalyticsSectionProps) {
  // Department dropdown state
  const [departmentOptions, setDepartmentOptions] = useState<{ id: string; name: string }[]>([]);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  useEffect(() => {
    setDepartmentLoading(true);
    fetchDepartmentsDropdown()
      .then(setDepartmentOptions)
      .catch(e => setDepartmentError(e.message))
      .finally(() => setDepartmentLoading(false));
  }, []);

  // Status dropdown state
  const [statusOptions, setStatusOptions] = useState<{ id: string; name: string }[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  useEffect(() => {
    setStatusLoading(true);
    fetchStatusDropdown()
      .then(setStatusOptions)
      .catch(e => setStatusError(e.message))
      .finally(() => setStatusLoading(false));
  }, []);

  // Severity dropdown state
  const [severityOptions, setSeverityOptions] = useState<{ id: string; name: string }[]>([]);
  const [severityLoading, setSeverityLoading] = useState(true);
  const [severityError, setSeverityError] = useState<string | null>(null);
  useEffect(() => {
    setSeverityLoading(true);
    fetchSeveritiesDropdown()
      .then(setSeverityOptions)
      .catch(e => setSeverityError(e.message))
      .finally(() => setSeverityLoading(false));
  }, []);
  const [timeframe, setTimeframe] = useState("all") // all, last_7_days, last_30_days, last_90_days
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [chartType, setChartType] = useState("bar") // bar, pie, line
  // Filter logic
  const filteredReports = (externalReports || []).filter(r =>
    (severityFilter === "all" || r.aiSeverity === severityFilter) &&
    (statusFilter === "all" || r.status === statusFilter) &&
    (departmentFilter === "all" || r.aiDepartment === departmentFilter)
  );
  // Chart type state only
  const [chartType, setChartType] = useState("bar") // bar, pie, line

  // Use all reports for charts
  const filteredReports = externalReports || [];

  // --- Data for Charts (simplified for demo, in real app use charting library) ---
  // Use departmentName for chart grouping and display
  const reportsByDepartment = filteredReports.reduce(
    (acc, report) => {
      const dept = report.departmentName || report.aiDepartment || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const reportsBySeverity = filteredReports.reduce(
    (acc, report) => {
      acc[report.aiSeverity] = (acc[report.aiSeverity] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Use statusName for chart grouping and display
  const reportsByStatus = filteredReports.reduce(
    (acc, report) => {
      const status = report.statusName || report.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

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

  // Use backend department options for dropdown
  const allDepartments = departmentOptions.map((d) => d.name)

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

  // Brand colors from CSS variables
  const etGreen = 'hsl(var(--et-green))';
  const etGold = 'hsl(var(--et-gold))';
  const etRed = 'hsl(var(--et-red))';

  // Layout: two charts per row

  return (
    <div>
      <div className="grid gap-6">
        <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
        <div className="flex flex-wrap gap-4 items-center">
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
          {/* Department Dropdown with loading/error */}
          {departmentLoading ? (
            <span className="text-xs text-gray-400">Loading departments...</span>
          ) : departmentError ? (
            <span className="text-xs text-red-500">{departmentError}</span>
          ) : (
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Status Dropdown with loading/error */}
          {statusLoading ? (
            <span className="text-xs text-gray-400">Loading statuses...</span>
          ) : statusError ? (
            <span className="text-xs text-red-500">{statusError}</span>
          ) : (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.id} value={status.name}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Severity Dropdown with loading/error */}
          {severityLoading ? (
            <span className="text-xs text-gray-400">Loading severities...</span>
          ) : severityError ? (
            <span className="text-xs text-red-500">{severityError}</span>
          ) : severityOptions.length === 0 ? (
            <span className="text-xs text-gray-400">No severities found.</span>
          ) : (
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {severityOptions.map((sev) => (
                  <SelectItem key={sev.name} value={sev.name}>
                    {sev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filtered Reports Table</CardTitle>
          <CardDescription>Reports matching selected filters.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsTable reports={filteredReports} />
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsSection;
