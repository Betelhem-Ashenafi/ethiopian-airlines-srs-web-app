"use client"

import Link from "next/link"

import { useSearchParams } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import SidebarNav from "@/components/sidebar-nav"
import ReportsTable from "@/components/reports-table"
import AnalyticsSection from "@/components/analytics-section"
import UserManagementSection from "@/components/user-management-section"
import SettingsSection from "@/components/settings-section" // Import the new SettingsSection
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListChecks, Users } from "lucide-react"
import { fetchReports } from "@/lib/reports"
import { useAuth } from "@/components/auth-provider"

  const { user, isAuthenticated, isLoading } = useAuth()
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [errorReports, setErrorReports] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "dashboard"

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

  const renderContent = () => {
    if (!user) return null;
    if (loadingReports) return <div>Loading reports...</div>;
    if (errorReports) return <div>Error loading reports: {errorReports}</div>;

    switch (currentTab) {
      case "reports":
        return <ReportsTable reports={reports} />;
      case "analytics":
        return <AnalyticsSection />;
      case "users": {
        const normalizedRole = (user.role || "").toLowerCase().replace(" ", "");
        const isSysAdmin = normalizedRole === "systemadmin" || normalizedRole === "sysadmin";
        if (!isSysAdmin) {
          return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-muted-foreground">
              <Users className="h-12 w-12 mb-4" />
              <p className="text-lg">Access Denied</p>
              <p className="text-sm">You do not have permission to view this section.</p>
            </div>
          );
        }
        return <UserManagementSection />;
      }
      case "settings":
        return <SettingsSection />;
      case "dashboard":
      default: {
        // Simple overview dashboard
        const isDepartmentAdmin = user.role === "Department Admin";
        const userDepartment = user.department;
        const dashboardReports =
          isDepartmentAdmin && userDepartment ? reports.filter((r) => r.aiDepartment === userDepartment) : reports;
        const dashboardTotalReports = dashboardReports.length;
        const dashboardResolvedReports = dashboardReports.filter((r) => r.status === "Resolved").length;
        const dashboardInProgressReports = dashboardReports.filter((r) => r.status === "In Progress").length;
        const dashboardCriticalReports = dashboardReports.filter((r) => r.aiSeverity === "Critical").length;
        return (
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
                <ReportsTable last7DaysOnly />
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-et-green md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-et-gold/50 px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-lg text-et-gold">Ethiopian Airlines</span>
            </Link>
          </div>
          <div className="flex-1">
            <SidebarNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
