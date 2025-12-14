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
        <div className="grid gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-et-green to-et-green-dark bg-clip-text text-transparent">
              Overview {isDepartmentAdmin && userDepartment ? `for ${userDepartment}` : ""}
            </h2>
            <p className="text-muted-foreground">Welcome back! Here's your dashboard summary.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-l-et-green">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Reports</CardTitle>
                <div className="p-2 bg-et-green/10 rounded-lg">
                  <ListChecks className="h-5 w-5 text-et-green" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-et-green mb-1">{dashboardTotalReports}</div>
                <p className="text-xs text-muted-foreground">All time reports</p>
              </CardContent>
            </Card>
            <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Critical Issues</CardTitle>
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <ListChecks className="h-5 w-5 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500 mb-1">{dashboardCriticalReports}</div>
                <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
              </CardContent>
            </Card>
            <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-l-et-gold">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">In Progress</CardTitle>
                <div className="p-2 bg-et-gold/10 rounded-lg">
                  <Users className="h-5 w-5 text-et-gold" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-et-gold mb-1">{dashboardInProgressReports}</div>
                <p className="text-xs text-muted-foreground">Total reports in progress</p>
              </CardContent>
            </Card>
          </div>
          <Card className="border-t-4 border-t-et-gold">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
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
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="hidden md:block">
        <SidebarNav />
      </div>
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-8 animate-fade-in">{content}</main>
      </div>
    </div>
  )
}

export default DashboardPage;
