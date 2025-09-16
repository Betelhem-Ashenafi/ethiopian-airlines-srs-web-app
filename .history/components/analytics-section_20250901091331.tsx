"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, LineChart, Line } from "recharts"
import type { Report } from "@/lib/data"
import ListChecks from "@/components/ListChecks" // Declare the ListChecks variable
// import the correct hook or context from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"

// Accept reports as a prop for live data
// If not provided, fallback to static
type AnalyticsSectionProps = {
  reports?: Report[];
};

// ...existing code...
function AnalyticsSectionInner({ reports: externalReports }: AnalyticsSectionProps) {
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

  const totalReports = filteredReports.length
  const resolvedReports = reportsByStatus["Resolved"] || 0
  const inProgressReports = reportsByStatus["In Progress"] || 0
  const submittedReports = reportsByStatus["Submitted"] || 0

  const allDepartments = Array.from(new Set((externalReports || []).map((r) => r.aiDepartment)))

  const handleExport = (type: "excel" | "pdf") => {
    alert(`Exporting ${type} for current filters... (This is a placeholder action)`)
    // In a real app, trigger backend export
  }

  return (
    <div>
      <div className="mb-4 p-2 bg-yellow-100 text-yellow-900 rounded">
        <strong>Debug:</strong> Current user role: <code>{user?.role}</code><br />
        <strong>User object:</strong> <code>{JSON.stringify(user)}</code>
      </div>
      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {user?.role === "System Admin" && (
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
        )}
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

      <div className="grid grid-cols-1 gap-4">
        {/* Chart rendering for System Admin only */}
        {user?.role === "System Admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Chart</CardTitle>
              <CardDescription>Select chart type above</CardDescription>
            </CardHeader>
            <CardContent>
              {chartType === "bar" && (
                <div style={{ width: "100%", height: 300 }}>
                  <BarChart width={400} height={300} data={Object.entries(reportsBySeverity).map(([severity, count]) => ({ severity, count }))}>
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </div>
              )}
              {chartType === "pie" && (
                <div style={{ width: "100%", height: 300 }}>
                  <PieChart width={400} height={300}>
                    <Pie data={Object.entries(reportsBySeverity).map(([severity, count]) => ({ severity, count }))} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={100} fill="#82ca9d" label />
                    <Tooltip />
                  </PieChart>
                </div>
              )}
              {chartType === "line" && (
                <div style={{ width: "100%", height: 300 }}>
                  <LineChart width={400} height={300} data={Object.entries(reportsBySeverity).map(([severity, count]) => ({ severity, count }))}>
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                  </LineChart>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Only show Reports by Department for System Admin */}
        {user?.role === "System Admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Reports by Department</CardTitle>
              <CardDescription>Distribution of issues across departments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted rounded-md text-muted-foreground">
                {Object.keys(reportsByDepartment).length > 0 ? (
                  <div className="text-center">
                    <p>Placeholder for a Bar Chart or Pie Chart showing:</p>
                    <ul className="list-disc list-inside mt-2">
                      {Object.entries(reportsByDepartment).map(([dept, count]) => (
                        <li key={dept}>
                          {dept}: {count}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  "No data for this filter."
                )}
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Reports by Severity</CardTitle>
            <CardDescription>Breakdown of issues by their severity level.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted rounded-md text-muted-foreground">
              {Object.keys(reportsBySeverity).length > 0 ? (
                <div className="text-center">
                  <p>Placeholder for a Bar Chart or Pie Chart showing:</p>
                  <ul className="list-disc list-inside mt-2">
                    {Object.entries(reportsBySeverity).map(([sev, count]) => (
                      <li key={sev}>
                        {sev}: {count}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                "No data for this filter."
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resolution Status Over Time</CardTitle>
          <CardDescription>Trend of submitted, in-progress, and resolved reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center bg-muted rounded-md text-muted-foreground">
            Placeholder for a Line Chart showing trends of Submitted, In Progress, and Resolved reports over time.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const AnalyticsSection = (props: AnalyticsSectionProps) => {
  return <AnalyticsSectionInner {...props} />
};

export default AnalyticsSection;
