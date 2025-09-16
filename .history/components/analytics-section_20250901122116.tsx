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
        </div>
      </div>
  {/* Charts only, no table or filters */}
    </div>
  );
}

export default AnalyticsSection;
