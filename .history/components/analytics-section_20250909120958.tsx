"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, FileDown, FileSpreadsheet } from "lucide-react"
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
  const reports = externalReports || [];

  // Chart data prep
  const reportsByDepartment = reports.reduce(
    (acc, report) => {
      const dept = report.departmentName || report.aiDepartment || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const reportsBySeverity = reports.reduce(
    (acc, report) => {
      acc[report.aiSeverity] = (acc[report.aiSeverity] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  const reportsByStatus = reports.reduce(
    (acc, report) => {
      const status = report.statusName || report.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Chart rendering helper
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

  // Chart data arrays
  const statusChartData = Object.entries(reportsByStatus).map(([status, count]) => ({ status, count }));
  const departmentChartData = Object.entries(reportsByDepartment).map(([department, count]) => ({ department, count }));
  const severityChartData = Object.entries(reportsBySeverity).map(([severity, count]) => ({ severity, count }));

  // Brand colors
  const etGreen = 'hsl(var(--et-green))';
  const etGold = 'hsl(var(--et-gold))';
  const etRed = 'hsl(var(--et-red))';

  async function handleExport(type: 'pdf' | 'excel') {
    try {
      const endpoint = type === 'pdf' ? '/api/reports/export/pdf' : '/api/reports/export/excel';
      const res = await fetch(endpoint, { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toISOString().replace(/[:.]/g,'-');
      a.download = `reports-${ts}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to export reports');
    }
  }
  // Charts only UI
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
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => handleExport('pdf')} className="flex items-center gap-2" title="Export PDF">
              <FileDown className="w-4 h-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')} className="flex items-center gap-2" title="Export Excel">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className="font-semibold mb-2">Reports by Department</h3>
            {renderChart(chartType, departmentChartData, "count", "department", etGreen)}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Reports by Severity</h3>
            {renderChart(chartType, severityChartData, "count", "severity", etRed)}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Reports by Status</h3>
            {renderChart(chartType, statusChartData, "count", "status", etGold)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsSection;
