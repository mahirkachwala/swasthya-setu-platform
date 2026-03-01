import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Truck,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { InventoryItem } from "@shared/schema";

export default function InventoryPage() {
  const { toast } = useToast();
  const [manufacturer, setManufacturer] = useState("");
  const [vaccineType, setVaccineType] = useState("");
  const [quantity, setQuantity] = useState("");

  const { data: inventory, isLoading, isError } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory?centerId=CEN-001"],
    refetchInterval: 5000,
  });

  const reorder = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/inventory/reorder", {
        centerId: "CEN-001",
        manufacturer,
        vaccineType,
        quantity: parseInt(quantity),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string).startsWith("/api/shipments") });
      queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string).startsWith("/api/dashboard") });
      queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string).startsWith("/api/inventory") });
      toast({
        title: "Reorder Placed",
        description: `Shipment ${data.shipmentId} created successfully.`,
      });
      setManufacturer("");
      setVaccineType("");
      setQuantity("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
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
            <span className="text-sm" data-testid="text-inventory-error">Failed to load inventory data. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalStock = inventory?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const lowStockItems = inventory?.filter(i => i.quantity < 20) || [];

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-inventory-title">Inventory</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Vaccine stock management for PHC Andheri</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">{totalStock}</div>
              <p className="text-[11px] text-muted-foreground">Total Doses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{inventory?.length || 0}</div>
              <p className="text-[11px] text-muted-foreground">Vaccine Types</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{lowStockItems.length}</div>
              <p className="text-[11px] text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Stock Details</span>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Vaccine</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Manufacturer</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Batch</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Qty</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Expiry</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory?.map((item) => (
                <TableRow key={item.id} data-testid={`row-inventory-${item.vaccineType}`}>
                  <TableCell className="text-sm font-medium">{item.vaccineType}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.manufacturer}</TableCell>
                  <TableCell className="font-mono text-[11px]">{item.batchNo}</TableCell>
                  <TableCell className="text-sm font-bold">{item.quantity}</TableCell>
                  <TableCell className="text-xs">{item.expiryDate}</TableCell>
                  <TableCell>
                    {item.quantity < 20 ? (
                      <Badge variant="destructive" className="gap-1 text-[10px]">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Low
                      </Badge>
                    ) : item.quantity < 50 ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 no-default-active-elevate">
                        <AlertTriangle className="w-2.5 h-2.5" /> Moderate
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 no-default-active-elevate">
                        <CheckCircle className="w-2.5 h-2.5" /> OK
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="w-20">
                    <Progress value={Math.min((item.quantity / 200) * 100, 100)} className="h-1.5" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Truck className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Reorder Stock</span>
        </div>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Manufacturer</Label>
              <Select value={manufacturer} onValueChange={setManufacturer}>
                <SelectTrigger data-testid="select-manufacturer" className="h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Serum Institute">Serum Institute</SelectItem>
                  <SelectItem value="Bharat Biotech">Bharat Biotech</SelectItem>
                  <SelectItem value="Dr. Reddy's">Dr. Reddy's</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Vaccine Type</Label>
              <Select value={vaccineType} onValueChange={setVaccineType}>
                <SelectTrigger data-testid="select-vaccine-type" className="h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Covishield">Covishield</SelectItem>
                  <SelectItem value="Covaxin">Covaxin</SelectItem>
                  <SelectItem value="Sputnik V">Sputnik V</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Quantity</Label>
              <Input
                type="number"
                placeholder="500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-9"
                data-testid="input-quantity"
              />
            </div>
            <Button
              onClick={() => reorder.mutate()}
              disabled={!manufacturer || !vaccineType || !quantity || reorder.isPending}
              className="h-9"
              data-testid="button-reorder"
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" />
              {reorder.isPending ? "Placing..." : "Place Reorder"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
