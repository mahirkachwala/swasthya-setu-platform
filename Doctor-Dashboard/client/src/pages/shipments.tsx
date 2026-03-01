import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  Play,
  Package,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Shipment } from "@shared/schema";

function ShipmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    CREATED: { label: "Created", className: "bg-muted text-muted-foreground border-border" },
    IN_TRANSIT: { label: "In Transit", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
    ARRIVED: { label: "Arrived", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" },
  };
  const config = map[status] || map.CREATED;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border no-default-active-elevate ${config.className}`}>
      {status === "IN_TRANSIT" && <Truck className="w-2.5 h-2.5" />}
      {status === "ARRIVED" && <CheckCircle className="w-2.5 h-2.5" />}
      {status === "CREATED" && <Clock className="w-2.5 h-2.5" />}
      {config.label}
    </span>
  );
}

function ShipmentTracker({ shipment }: { shipment: Shipment }) {
  const totalCheckpoints = shipment.checkpoints.length;
  const reachedCount = shipment.checkpoints.filter(c => c.reached).length;
  const progressPercent = totalCheckpoints > 0 ? (reachedCount / totalCheckpoints) * 100 : 0;

  return (
    <Card data-testid={`card-shipment-tracker-${shipment.shipmentId}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{shipment.shipmentId}</span>
        </div>
        <ShipmentStatusBadge status={shipment.status} />
      </div>
      <CardContent className="pt-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          {shipment.vaccineType} &middot; {shipment.quantity} doses &middot; {shipment.manufacturer}
        </p>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted" />
          <div
            className="absolute left-3 top-0 w-0.5 bg-primary transition-all duration-500"
            style={{ height: `${progressPercent}%` }}
          />
          <div className="space-y-4">
            {shipment.checkpoints.map((cp, idx) => (
              <div key={idx} className="flex items-start gap-3 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  cp.reached
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {cp.reached ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-medium ${cp.reached ? "" : "text-muted-foreground"}`}>
                      {cp.name}
                    </span>
                    {cp.reached && cp.reachedAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(cp.reachedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {cp.lat.toFixed(4)}, {cp.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t">
          <MapPin className="w-3 h-3" />
          <span>Current: {shipment.currentCheckpoint}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ShipmentsPage() {
  const { toast } = useToast();
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);

  const { data: shipments, isLoading, isError } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments?centerId=CEN-001"],
    refetchInterval: 2000,
  });

  const startSim = useMutation({
    mutationFn: async (shipmentId: string) => {
      await apiRequest("POST", `/api/sim/start?shipmentId=${shipmentId}`);
    },
    onSuccess: (_, shipmentId) => {
      toast({ title: "Simulation Started", description: `Tracking ${shipmentId} in real-time` });
      setSelectedShipment(shipmentId);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            <span className="text-sm" data-testid="text-shipments-error">Failed to load shipment data. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inTransit = shipments?.filter(s => s.status === "IN_TRANSIT") || [];
  const arrived = shipments?.filter(s => s.status === "ARRIVED") || [];
  const created = shipments?.filter(s => s.status === "CREATED") || [];

  const selected = shipments?.find(s => s.shipmentId === selectedShipment) || inTransit[0] || shipments?.[0];

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-shipments-title">Shipments</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time vaccine shipment tracking</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{inTransit.length}</div>
              <p className="text-[11px] text-muted-foreground">In Transit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{arrived.length}</div>
              <p className="text-[11px] text-muted-foreground">Arrived</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{created.length}</div>
              <p className="text-[11px] text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Truck className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">All Shipments</span>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">ID</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Vaccine</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Qty</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments?.map((ship) => (
                  <TableRow
                    key={ship.id}
                    className={`cursor-pointer ${selected?.shipmentId === ship.shipmentId ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedShipment(ship.shipmentId)}
                    data-testid={`row-shipment-${ship.shipmentId}`}
                  >
                    <TableCell className="font-mono text-[11px]">{ship.shipmentId}</TableCell>
                    <TableCell className="text-xs">{ship.vaccineType}</TableCell>
                    <TableCell className="text-xs font-medium">{ship.quantity}</TableCell>
                    <TableCell>
                      <ShipmentStatusBadge status={ship.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {ship.status === "CREATED" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            startSim.mutate(ship.shipmentId);
                          }}
                          disabled={startSim.isPending}
                          data-testid={`button-start-sim-${ship.shipmentId}`}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}
                      {ship.status === "IN_TRANSIT" && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse no-default-active-elevate">
                          <Activity className="w-2.5 h-2.5" />
                          Live
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selected && <ShipmentTracker shipment={selected} />}
      </div>
    </div>
  );
}
