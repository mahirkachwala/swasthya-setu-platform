import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarCheck,
  UserCheck,
  Syringe,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { DashboardStats, Alert } from "@shared/schema";

function AlertCard({ alert }: { alert: Alert }) {
  const colorMap = {
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
      text: "text-red-800 dark:text-red-200",
    },
    yellow: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800",
      icon: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      text: "text-amber-800 dark:text-amber-200",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
      text: "text-emerald-800 dark:text-emerald-200",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
      text: "text-blue-800 dark:text-blue-200",
    },
  };

  const colors = colorMap[alert.severity];
  const iconMap = {
    low_stock: AlertTriangle,
    in_transit: Truck,
    arrived: CheckCircle,
    capacity: Activity,
  };
  const Icon = iconMap[alert.type];

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${colors.bg} ${colors.border}`}
      data-testid={`alert-${alert.type}-${alert.id}`}
    >
      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        <div className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
        <Icon className={`w-4 h-4 ${colors.icon}`} />
      </div>
      <p className={`text-xs font-medium leading-snug ${colors.text}`}>{alert.message}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: stats, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/CEN-001"],
    refetchInterval: 5000,
  });

  if (isLoading || !stats) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            <span className="text-sm">Failed to load analytics data. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-analytics-title">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats.center.name} &middot; {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Shield className="w-3 h-3" />
            ABHA Enabled
          </Badge>
          <Badge variant="secondary" className="gap-1 text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 no-default-active-elevate">
            <CheckCircle className="w-3 h-3" />
            Aadhaar Verified Center
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground">Today</span>
            </div>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold">{stats.checkedInPatients}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Checked In</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Syringe className="w-4 h-4 text-emerald-500" />
              <div className="flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-600">+12%</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.vaccinatedCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Vaccinated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stats.totalStock}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-2xl font-bold">{stats.incomingShipments}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Incoming</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Alert System</h2>
            <Badge variant="outline" className="text-[10px] gap-1">
              <Activity className="w-3 h-3" />
              Live
            </Badge>
          </div>
          {stats.alerts.length > 0 ? (
            <div className="space-y-2">
              {stats.alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                <span className="text-sm">All systems normal. No alerts.</span>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Capacity</h2>
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Today's Usage</span>
                <span className="text-xs font-bold">{stats.capacityUsed}%</span>
              </div>
              <Progress value={stats.capacityUsed} className="h-2.5" data-testid="progress-capacity" />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="text-center p-2.5 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold">{stats.todayAppointments}</div>
                  <div className="text-[10px] text-muted-foreground">Booked</div>
                </div>
                <div className="text-center p-2.5 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold">{stats.totalSlots - stats.todayAppointments}</div>
                  <div className="text-[10px] text-muted-foreground">Available</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-sm font-semibold">Quick Actions</h2>
          <Card>
            <CardContent className="pt-4 space-y-1.5">
              <Button variant="outline" className="w-full justify-between h-9 text-xs" asChild data-testid="button-quick-queue">
                <Link href="/">
                  <span className="flex items-center gap-2">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Manage Queue
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between h-9 text-xs" asChild data-testid="button-quick-inventory">
                <Link href="/inventory">
                  <span className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    Check Inventory
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between h-9 text-xs" asChild data-testid="button-quick-shipments">
                <Link href="/shipments">
                  <span className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5" />
                    Track Shipments
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <h2 className="text-sm font-semibold">Vaccine Stock</h2>
          <div className="space-y-2">
            {stats.center.vaccinesAvailable && Object.entries(stats.center.vaccinesAvailable).map(([vaccine, qty]) => (
              <Card key={vaccine}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium">{vaccine}</span>
                    {(qty as number) < 20 ? (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Low</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">OK</Badge>
                    )}
                  </div>
                  <div className="text-lg font-bold">{qty as number} <span className="text-xs font-normal text-muted-foreground">doses</span></div>
                  <Progress value={Math.min(((qty as number) / 200) * 100, 100)} className="h-1.5 mt-1.5" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
