import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  Syringe,
  Shield,
  UserCheck,
  AlertCircle,
  Search,
  Building2,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useCenterContext } from "@/contexts/center-context";
import type { Appointment } from "@shared/schema";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { className: string; label: string }> = {
    BOOKED: { className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800", label: "Booked" },
    CONFIRMED: { className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800", label: "Confirmed" },
    CHECKED_IN: { className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800", label: "Checked In" },
    IN_PROGRESS: { className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800", label: "In Progress" },
    VACCINATED: { className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800", label: "Vaccinated" },
    COMPLETED: { className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800", label: "Completed" },
    CANCELLED: { className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800", label: "Cancelled" },
    DISPOSED: { className: "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800", label: "Disposed" },
  };
  const config = map[status] || map.BOOKED;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border no-default-active-elevate ${config.className}`}>
      {config.label}
    </span>
  );
}

function PatientCard({ apt, onAction, isPending }: { apt: Appointment; onAction: (id: string, status: string) => void; isPending: boolean }) {
  const isFaded = apt.status === "DISPOSED" || apt.status === "COMPLETED" || apt.status === "CANCELLED";
  return (
    <div className={`flex items-center gap-4 px-4 py-3 border-b last:border-b-0 transition-colors ${isFaded ? "opacity-50 bg-muted/20" : "hover:bg-muted/30"}`} data-testid={`row-appointment-${apt.appointmentId}`}>
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
        {apt.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">{apt.patientName}</span>
          {apt.source === "customer" && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 border border-violet-200 dark:border-violet-800 font-medium no-default-active-elevate">CITIZEN</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{apt.phone}</span>
          <span className="text-[10px] text-muted-foreground">&middot;</span>
          <span className="text-xs text-muted-foreground">{apt.vaccineType}</span>
          {apt.dose && (
            <>
              <span className="text-[10px] text-muted-foreground">&middot;</span>
              <span className="text-xs text-muted-foreground">Dose {apt.dose}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {apt.aadhaarVerified ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 no-default-active-elevate flex items-center gap-0.5">
            <CheckCircle className="w-2.5 h-2.5" /> Aadhaar
          </span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 no-default-active-elevate flex items-center gap-0.5">
            <AlertCircle className="w-2.5 h-2.5" /> Pending
          </span>
        )}
        {apt.abhaStatus === "verified" && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/20 no-default-active-elevate flex items-center gap-0.5">
            <Shield className="w-2.5 h-2.5" /> ABHA
          </span>
        )}
      </div>
      <div className="text-xs text-muted-foreground w-14 text-right shrink-0">
        {new Date(apt.slotTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </div>
      <StatusBadge status={apt.status} />
      <div className="flex items-center gap-1 shrink-0">
        {(apt.status === "BOOKED" || apt.status === "CONFIRMED" || apt.status === "CHECKED_IN" || apt.status === "IN_PROGRESS") && (
          <Button
            size="sm"
            className="h-7 text-xs px-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onAction(apt.id, "VACCINATED")}
            disabled={isPending}
            data-testid={`button-complete-${apt.appointmentId}`}
          >
            <Syringe className="w-3 h-3 mr-1" />
            Complete
          </Button>
        )}
        {apt.status !== "CANCELLED" && apt.status !== "VACCINATED" && apt.status !== "DISPOSED" && apt.status !== "COMPLETED" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2 text-destructive hover:text-destructive"
            onClick={() => onAction(apt.id, "CANCELLED")}
            disabled={isPending}
            data-testid={`button-cancel-${apt.appointmentId}`}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        )}
        {(apt.status === "VACCINATED" || apt.status === "CANCELLED" || apt.status === "COMPLETED") && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2 text-muted-foreground"
            onClick={() => onAction(apt.id, "DISPOSED")}
            disabled={isPending}
            data-testid={`button-dispose-${apt.appointmentId}`}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Dispose
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const { selectedCenter } = useCenterContext();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const channel = supabase
      .channel("appointments-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          console.log("[Dashboard] Supabase real-time change detected, refreshing...");
          queryClient.invalidateQueries({ queryKey: ["all-appointments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mapRow = (a: any, source: string): Appointment => ({
    id: String(a.id || a._id),
    appointmentId: a.appointmentId || a.appointment_id || `APT-${String(a.id).slice(-6)}`,
    aadhaarId: a.aadhaarId || a.aadhaar_id || a.aadhaar || "XXXX-XXXX-0000",
    patientName: a.patientName || a.patient_name || a.name || "Unknown",
    phone: a.phone || "",
    centerId: a.centerId || a.center_id || "CEN-001",
    centerName: a.centerName || a.center_name || a.center || "Unknown Center",
    slotTime: a.slotTime || a.slot_time || (a.date ? `${a.date}T09:00:00+05:30` : new Date().toISOString()),
    vaccineType: a.vaccineType || a.vaccine_type || a.vaccine || "General",
    dose: a.dose || 1,
    aadhaarVerified: a.aadhaarVerified ?? a.aadhaar_verified ?? true,
    abhaStatus: a.abhaStatus || a.abha_status || "pending",
    status: a.status || "BOOKED",
    source: source,
    createdAt: a.createdAt || a.created_at || new Date().toISOString(),
  });

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["all-appointments", selectedCenter.id, selectedDate],
    queryFn: async () => {
      const results: Appointment[] = [];

      try {
        const localRes = await fetch(`/api/appointments?centerId=${selectedCenter.id}&date=${selectedDate}`);
        if (localRes.ok) {
          const localData = await localRes.json();
          const localList = Array.isArray(localData) ? localData : [];
          console.log("[Dashboard] Local DB appointments:", localList.length);
          localList.forEach((a: any) => results.push(mapRow(a, "local")));
        }
      } catch (e) {
        console.log("[Dashboard] Local DB fetch error:", e);
      }

      try {
        const { data: sbData, error: sbError } = await supabase
          .from("appointments")
          .select("*");
        console.log("[Dashboard] Supabase appointments:", sbData?.length, sbError);
        if (sbData && !sbError) {
          sbData.forEach((a: any) => results.push(mapRow(a, "supabase")));
        }
      } catch (e) {
        console.log("[Dashboard] Supabase fetch error:", e);
      }

      const seen = new Set<string>();
      return results.filter(a => {
        const key = a.appointmentId || a.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    refetchInterval: 3000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const apt = appointments?.find(a => a.id === id);

      if (apt?.source === "supabase") {
        const { error } = await supabase
          .from("appointments")
          .update({ status })
          .eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const res = await fetch(`/api/appointments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-appointments"] });
      toast({ title: "Status Updated", description: "Appointment status has been updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const all = appointments || [];
  const booked = all.filter(a => a.status === "BOOKED" || a.status === "CONFIRMED");
  const inProgress = all.filter(a => a.status === "IN_PROGRESS" || a.status === "CHECKED_IN");
  const vaccinated = all.filter(a => a.status === "VACCINATED" || a.status === "COMPLETED");
  const cancelled = all.filter(a => a.status === "CANCELLED");
  const disposed = all.filter(a => a.status === "DISPOSED");

  const tabData: Record<string, Appointment[]> = {
    booked,
    in_progress: inProgress,
    vaccinated,
    cancelled,
    disposed,
    all,
  };

  const filtered = (tabData[activeTab] || all).filter(apt =>
    !searchTerm || apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || apt.appointmentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayDate = new Date(selectedDate + "T00:00:00+05:30");
  const isToday = selectedDate === today;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-dashboard-title">Queue</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isToday ? "Today" : displayDate.toLocaleDateString("en-IN", { weekday: "short" })},{" "}
            {displayDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 text-xs w-36"
            data-testid="input-date-picker"
          />
          {!isToday && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => setSelectedDate(today)}
              data-testid="button-today"
            >
              Today
            </Button>
          )}
          <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1.5" data-testid="badge-center-filter">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            {selectedCenter.name}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-l-4 border-l-blue-500" data-testid="card-stat-booked">
          <CardContent className="pt-3 pb-3 px-4">
            <div className="text-2xl font-bold">{booked.length}</div>
            <p className="text-[11px] text-muted-foreground">Booked</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500" data-testid="card-stat-inprogress">
          <CardContent className="pt-3 pb-3 px-4">
            <div className="text-2xl font-bold">{inProgress.length}</div>
            <p className="text-[11px] text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500" data-testid="card-stat-vaccinated">
          <CardContent className="pt-3 pb-3 px-4">
            <div className="text-2xl font-bold">{vaccinated.length}</div>
            <p className="text-[11px] text-muted-foreground">Vaccinated</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500" data-testid="card-stat-cancelled">
          <CardContent className="pt-3 pb-3 px-4">
            <div className="text-2xl font-bold">{cancelled.length}</div>
            <p className="text-[11px] text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400" data-testid="card-stat-disposed">
          <CardContent className="pt-3 pb-3 px-4">
            <div className="text-2xl font-bold">{disposed.length}</div>
            <p className="text-[11px] text-muted-foreground">Disposed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="border-b px-4 pt-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <TabsList className="h-9 bg-transparent p-0 gap-0" data-testid="tabs-queue">
                <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs px-3 h-9">
                  All ({all.length})
                </TabsTrigger>
                <TabsTrigger value="booked" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs px-3 h-9">
                  Booked ({booked.length})
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs px-3 h-9">
                  In Progress ({inProgress.length})
                </TabsTrigger>
                <TabsTrigger value="vaccinated" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs px-3 h-9">
                  Vaccinated ({vaccinated.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs px-3 h-9">
                  Cancelled ({cancelled.length})
                </TabsTrigger>
                <TabsTrigger value="disposed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs px-3 h-9">
                  Disposed ({disposed.length})
                </TabsTrigger>
              </TabsList>
              <div className="relative w-56 mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  className="pl-8 h-8 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-queue"
                />
              </div>
            </div>
          </Tabs>
        </div>
        <div className="divide-y">
          {filtered.length > 0 ? (
            filtered.map((apt) => (
              <PatientCard
                key={apt.id}
                apt={apt}
                onAction={(id, status) => updateStatus.mutate({ id, status })}
                isPending={updateStatus.isPending}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Clock className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium" data-testid="text-empty-queue">No appointments for {selectedCenter.name}</p>
              <p className="text-xs mt-1">Appointments booked from the citizen portal for this center will appear here</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
