import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  QrCode,
  CheckCircle,
  AlertCircle,
  Shield,
  Package,
  Scan,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ScanResult {
  ok: boolean;
  shipmentId: string;
  batchNo: string;
  message: string;
}

export default function QrScanPage() {
  const { toast } = useToast();
  const [qrPayload, setQrPayload] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  const scan = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/qr/scan", { qrPayload });
      return res.json() as Promise<ScanResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: data.ok ? "Scan Accepted" : "Scan Failed",
        description: data.message,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const presetPayloads = [
    "SHIP-00045|BATCH-2026-009|sig-demo-001",
    "SHIP-00046|BATCH-2026-011|sig-demo-002",
    "SHIP-00047|BATCH-2026-012|sig-demo-003",
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-qr-title">QR Scan</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Scan vaccine vial QR codes for verification</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <QrCode className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Scan Vial QR Code</span>
        </div>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-center py-8 border-2 border-dashed border-muted rounded-lg">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-primary/10">
                <Scan className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">Camera scan not available in demo</p>
                <p className="text-[10px] text-muted-foreground">Use the text input below or select a preset</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">QR Payload</Label>
            <div className="flex gap-2">
              <Input
                placeholder="SHIP-00045|BATCH-2026-009|sig-demo"
                value={qrPayload}
                onChange={(e) => setQrPayload(e.target.value)}
                className="h-9 text-xs"
                data-testid="input-qr-payload"
              />
              <Button
                onClick={() => scan.mutate()}
                disabled={!qrPayload || scan.isPending}
                className="h-9"
                data-testid="button-scan"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5" />
                {scan.isPending ? "Scanning..." : "Scan"}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">Quick presets</Label>
            <div className="flex flex-wrap gap-1.5">
              {presetPayloads.map((payload) => (
                <Button
                  key={payload}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px]"
                  onClick={() => setQrPayload(payload)}
                  data-testid={`button-preset-${payload.split("|")[0]}`}
                >
                  {payload.split("|")[0]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card data-testid="card-scan-result">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            {result.ok ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-semibold">Scan Result</span>
          </div>
          <CardContent className="pt-4 space-y-3">
            <div className={`p-3 rounded-lg ${
              result.ok
                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
            }`}>
              <p className={`text-xs font-medium ${
                result.ok ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"
              }`}>
                {result.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground">Shipment ID</span>
                <p className="text-xs font-mono font-medium">{result.shipmentId}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground">Batch No</span>
                <p className="text-xs font-mono font-medium">{result.batchNo}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Shield className="w-2.5 h-2.5" />
                Blockchain: Pending
              </Badge>
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Package className="w-2.5 h-2.5" />
                Demo Mode
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
