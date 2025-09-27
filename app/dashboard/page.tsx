"use client"

import Link from "next/link"

import { useSearchParams } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import SidebarNav from "@/components/sidebar-nav"
import ReportsTable from "@/components/reports-table"
import AnalyticsSection from "@/components/analytics-section"
import UserManagementSection from "@/components/user-management-section"
import SettingsSection from "@/components/settings-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListChecks, Users } from "lucide-react"
import { fetchReports } from "@/lib/reports"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import type { Report } from "@/lib/data"

function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [errorReports, setErrorReports] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const currentTab = searchParams?.get("tab") ?? "dashboard"

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await fetchReports();
        setReports(data);
      } catch (err: any) {
        setErrorReports(err.message);
      } finally {
        setLoadingReports(false);
      }
    }
    loadReports();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  let content;
  switch (currentTab) {
    case "reports":
      content = <ReportsTable reports={reports} />;
      break;
    case "analytics":
  content = <AnalyticsSection reports={reports} />;
      break;
    case "users": {
  const normalizedRole = (user?.role || "").toLowerCase().replace(" ", "");
      const isSysAdmin = normalizedRole === "systemadmin" || normalizedRole === "sysadmin";
      if (!isSysAdmin) {
        content = (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-muted-foreground">
            <Users className="h-12 w-12 mb-4" />
            <p className="text-lg">Access Denied</p>
            <p className="text-sm">You do not have permission to view this section.</p>
          </div>
        );
      } else {
        content = <UserManagementSection />;
      }
      break;
    }
    case "settings":
      content = <SettingsSection />;
      break;
    case "dashboard":
    default: {
      // Simple overview dashboard
      const isDepartmentAdmin = user?.role === "Department Admin";
      const userDepartment = user?.department;
      const norm = (s: string | undefined) => (s || "").trim().toLowerCase();
      const dashboardReports: Report[] =
        isDepartmentAdmin && userDepartment
          ? reports.filter((r: Report) =>
              norm(r.departmentName) === norm(userDepartment) ||
              norm(r.aiDepartment) === norm(userDepartment)
            )
          : reports;
      const dashboardTotalReports = dashboardReports.length;
      const dashboardResolvedReports = dashboardReports.filter((r: Report) => r.status === "Resolved").length;
      const dashboardInProgressReports = dashboardReports.filter((r: Report) => r.status === "In Progress").length;
      const dashboardCriticalReports = dashboardReports.filter((r: Report) => r.aiSeverity === "Critical").length;
      content = (
        <div className="grid gap-6">
          <h2 className="text-2xl font-bold">
            Overview {isDepartmentAdmin && userDepartment ? `for ${userDepartment}` : ""}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <ListChecks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardTotalReports}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <ListChecks className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardCriticalReports}</div>
                <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardInProgressReports}</div>
                <p className="text-xs text-muted-foreground">Total reports in progress</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                Recent Reports {isDepartmentAdmin && userDepartment ? `for ${userDepartment}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* ReportsTable now only shows last 7 days in dashboard */}
              <ReportsTable reports={dashboardReports} last7DaysOnly />
            </CardContent>
          </Card>
        </div>
      );
      break;
    }
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden md:block">
        <SidebarNav />
      </div>
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{content}</main>
      </div>
    </div>
  )
}

export default DashboardPage;
