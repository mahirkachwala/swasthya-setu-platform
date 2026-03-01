import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  QrCode,
  User,
  Shield,
  Activity,
  Heart,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Queue", url: "/", icon: LayoutDashboard },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Shipments", url: "/shipments", icon: Truck },
  { title: "QR Scan", url: "/qr-scan", icon: QrCode },
  { title: "Analytics", url: "/analytics", icon: Activity },
];

const bottomNav = [
  { title: "My Account", url: "/profile", icon: User },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer" data-testid="link-logo">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Heart className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">Swasthya Setu</span>
              <span className="text-[10px] text-muted-foreground leading-none">Doctor Dashboard</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const isExactActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isExactActive || (item.url === "/" && location === "/")}
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold h-10"
                    >
                      <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                        <item.icon className="w-[18px] h-[18px]" />
                        <span className="text-[13px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-2 pb-3 border-t border-sidebar-border pt-2">
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                data-active={location === item.url}
                className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary h-10"
              >
                <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                  <item.icon className="w-[18px] h-[18px]" />
                  <span className="text-[13px]">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Link href="/profile">
          <div className="flex items-center gap-2 px-3 py-2 mt-1 rounded-lg bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors" data-testid="link-doctor-card">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              RS
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold truncate">Dr. Rajesh Sharma</span>
              <span className="text-[10px] text-muted-foreground truncate">PHC Andheri &middot; CEN-001</span>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
