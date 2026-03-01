import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle } from "lucide-react";
import { CenterProvider, useCenterContext } from "@/contexts/center-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AppointmentsPage from "@/pages/appointments";
import PatientsPage from "@/pages/patients";
import InventoryPage from "@/pages/inventory";
import ShipmentsPage from "@/pages/shipments";
import QrScanPage from "@/pages/qr-scan";
import ProfilePage from "@/pages/profile";
import AnalyticsPage from "@/pages/analytics";
import CustomerAppPage from "@/pages/customer-app";

function DoctorRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/patients" component={PatientsPage} />
      <Route path="/inventory" component={InventoryPage} />
      <Route path="/shipments" component={ShipmentsPage} />
      <Route path="/qr-scan" component={QrScanPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "15rem",
  "--sidebar-width-icon": "3rem",
};

function DoctorDashboard() {
  const { selectedDoctor, selectedCenter } = useCenterContext();

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 px-4 py-2.5 border-b shrink-0 bg-background">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-semibold" data-testid="text-header-center">{selectedCenter.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-[10px] hidden sm:flex">
                <Shield className="w-3 h-3" />
                ABHA
              </Badge>
              <Badge variant="secondary" className="gap-1 text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 no-default-active-elevate hidden sm:flex">
                <CheckCircle className="w-3 h-3" />
                Aadhaar Verified
              </Badge>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold" data-testid="avatar-doctor">
                  {selectedDoctor.initials}
                </div>
                <span className="text-xs font-medium hidden md:block" data-testid="text-doctor-header">{selectedDoctor.name}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30">
            <DoctorRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  const [location] = useLocation();
  const isCitizenPortal = location === "/citizen";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CenterProvider>
          {isCitizenPortal ? (
            <div className="h-screen w-full bg-background">
              <CustomerAppPage />
            </div>
          ) : (
            <DoctorDashboard />
          )}
        </CenterProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
