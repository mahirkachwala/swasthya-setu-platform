import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import type { Appointment, AppointmentStatus } from "@shared/schema";
import { useState } from "react";

interface StatsData {
  total: number;
  booked: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const config: Record<
    AppointmentStatus,
    { label: string; variant: "default" | "secondary" | "destructive" }
  > = {
    BOOKED: { label: "Booked", variant: "secondary" },
    CONFIRMED: { label: "Confirmed", variant: "default" },
    IN_PROGRESS: { label: "In Progress", variant: "default" },
    COMPLETED: { label: "Completed", variant: "secondary" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
  };

  const c = config[status];
  return (
    <Badge data-testid={`badge-status-${status}`} variant={c.variant}>
      {c.label}
    </Badge>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: AppointmentStatus;
    }) => {
      await apiRequest("PATCH", `/api/appointments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const formattedDate = new Date(appointment.date).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const createdTime = new Date(appointment.createdAt).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Card
      data-testid={`card-appointment-${appointment.id}`}
      className="transition-all duration-200"
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-base truncate">
                {appointment.name}
              </h3>
              <StatusBadge status={appointment.status} />
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span data-testid={`text-phone-${appointment.id}`}>
                  {appointment.phone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span
                  data-testid={`text-center-${appointment.id}`}
                  className="truncate"
                >
                  {appointment.center}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span data-testid={`text-date-${appointment.id}`}>
                  {formattedDate}
                </span>
                <span className="text-muted-foreground/60 mx-1">|</span>
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">{createdTime}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Select
              value={appointment.status}
              onValueChange={(val) =>
                updateMutation.mutate({
                  id: appointment.id,
                  status: val as AppointmentStatus,
                })
              }
              disabled={updateMutation.isPending}
            >
              <SelectTrigger
                data-testid={`select-status-${appointment.id}`}
                className="w-[150px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BOOKED">Booked</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Skeleton className="h-9 w-[150px]" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState<string>("ALL");

  const statsQuery = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    refetchInterval: 5000,
  });

  const appointmentsQuery = useQuery<{ appointments: Appointment[] }>({
    queryKey: ["/api/appointments"],
    refetchInterval: 5000,
  });

  const stats = statsQuery.data;
  const appointments = appointmentsQuery.data?.appointments ?? [];

  const filtered =
    filter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1
                  data-testid="text-app-title"
                  className="text-lg font-bold tracking-tight"
                >
                  Swasthya Setu
                </h1>
                <p className="text-xs text-muted-foreground">
                  Backend Admin Dashboard
                </p>
              </div>
            </div>
            <Button
              data-testid="button-refresh"
              variant="secondary"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ["/api/appointments"],
                });
                queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
        <section data-testid="section-stats">
          {statsQuery.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard
                title="Total"
                value={stats.total}
                icon={Activity}
                color="bg-primary"
              />
              <StatCard
                title="Booked"
                value={stats.booked}
                icon={Calendar}
                color="bg-blue-500 dark:bg-blue-600"
              />
              <StatCard
                title="Confirmed"
                value={stats.confirmed}
                icon={CheckCircle}
                color="bg-emerald-500 dark:bg-emerald-600"
              />
              <StatCard
                title="In Progress"
                value={stats.inProgress}
                icon={Loader2}
                color="bg-amber-500 dark:bg-amber-600"
              />
              <StatCard
                title="Completed"
                value={stats.completed}
                icon={CheckCircle}
                color="bg-violet-500 dark:bg-violet-600"
              />
              <StatCard
                title="Cancelled"
                value={stats.cancelled}
                icon={XCircle}
                color="bg-rose-500 dark:bg-rose-600"
              />
            </div>
          ) : null}
        </section>

        <section>
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold">Appointments</h2>
              <p className="text-sm text-muted-foreground">
                {filtered.length} appointment{filtered.length !== 1 ? "s" : ""}
                {filter !== "ALL" ? ` (${filter.toLowerCase().replace("_", " ")})` : ""}
              </p>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger
                data-testid="select-filter"
                className="w-[160px]"
              >
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="BOOKED">Booked</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {appointmentsQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <AppointmentSkeleton key={i} />
              ))
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No appointments found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {filter !== "ALL"
                      ? `No appointments with status "${filter.toLowerCase().replace("_", " ")}". Try a different filter.`
                      : "Appointments created from the customer app will appear here."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            )}
          </div>
        </section>

        <footer className="border-t pt-6 pb-8">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              API Endpoints
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">POST /api/appointments</Badge>
              <Badge variant="secondary">GET /api/appointments</Badge>
              <Badge variant="secondary">GET /api/appointments/:id</Badge>
              <Badge variant="secondary">PATCH /api/appointments/:id</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              CORS enabled for swasthya-setu-customer.replit.app and swasthya-setu-doctor.replit.app
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
