import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  AlertCircle,
  Shield,
  Users,
  Search,
  Syringe,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { useCenterContext } from "@/contexts/center-context";
import type { Patient } from "@shared/schema";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedCenter } = useCenterContext();

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients", selectedCenter.id],
    queryFn: async () => {
      const res = await fetch(`/api/patients?centerId=${selectedCenter.id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const filtered = (patients || []).filter(p =>
    !searchTerm ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.aadhaarId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const verifiedCount = filtered.filter(p => p.aadhaarVerified).length;
  const abhaCount = filtered.filter(p => p.abhaStatus === "verified").length;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-patients-title">Patients</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            View and manage your patient list
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1.5 self-start sm:self-auto" data-testid="badge-patients-center">
          <Building2 className="w-3.5 h-3.5 text-primary" />
          {selectedCenter.name}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">{filtered.length}</div>
              <p className="text-[11px] text-muted-foreground">Total Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{verifiedCount}</div>
              <p className="text-[11px] text-muted-foreground">Aadhaar Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">{abhaCount}</div>
              <p className="text-[11px] text-muted-foreground">ABHA Linked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Syringe className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{filtered.filter(p => p.vaccinesTaken.length > 0).length}</div>
              <p className="text-[11px] text-muted-foreground">Vaccinated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Patient List</span>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name or Aadhaar..."
              className="pl-8 h-8 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-patients"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-12">Seq</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Patient Details</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Contact</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">ABHA ID</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Aadhaar</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Vaccines</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((patient, idx) => (
                  <TableRow key={patient.aadhaarId} data-testid={`row-patient-${patient.aadhaarId}`}>
                    <TableCell className="text-xs text-muted-foreground font-mono">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
                          {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{patient.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{patient.aadhaarId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{patient.phone}</TableCell>
                    <TableCell>
                      {patient.abhaStatus === "verified" ? (
                        <div className="flex items-center gap-1">
                          <Syringe className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Linked</span>
                        </div>
                      ) : patient.abhaStatus === "pending" ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400">Pending</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not registered</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.aadhaarVerified ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 no-default-active-elevate">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 no-default-active-elevate">
                          <AlertCircle className="w-2.5 h-2.5" /> Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {patient.vaccinesTaken.map(v => (
                          <Badge key={v} variant="outline" className="text-[10px] px-1.5 py-0">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{patient.totalVisits}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No patients found for {selectedCenter.name}</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
