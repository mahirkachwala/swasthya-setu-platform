import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  CalendarCheck,
  MapPin,
  CheckCircle,
  ArrowLeft,
  LogOut,
  History,
  XCircle,
  Syringe,
  Clock,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Center } from "@shared/schema";

type AppScreen = "auth" | "home" | "book" | "success";

interface CustomerUser {
  id: string;
  name: string;
  aadhaarId: string;
}

interface BookingResult {
  appointmentId: string;
  centerName: string;
  centerId: string;
  slot: string;
  vaccineType: string;
  dose: number;
  status: string;
}

function BookingStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string; icon: typeof Clock }> = {
    BOOKED: { className: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800", label: "Booked", icon: Clock },
    CHECKED_IN: { className: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800", label: "Checked In", icon: CheckCircle },
    VACCINATED: { className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", label: "Vaccinated", icon: Syringe },
    CANCELLED: { className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800", label: "Cancelled", icon: XCircle },
    DISPOSED: { className: "bg-gray-50 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800", label: "Disposed", icon: XCircle },
  };
  const c = config[status] || config.BOOKED;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border no-default-active-elevate ${c.className}`} data-testid={`badge-status-${status.toLowerCase()}`}>
      <Icon className="w-2.5 h-2.5" />
      {c.label}
    </span>
  );
}

export default function CustomerAppPage() {
  const { toast } = useToast();
  const [screen, setScreen] = useState<AppScreen>("auth");
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const [loginAadhaar, setLoginAadhaar] = useState("123456789012");
  const [loginPassword, setLoginPassword] = useState("pass123");
  const [regName, setRegName] = useState("");
  const [regAadhaar, setRegAadhaar] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("09:00");
  const [bookVaccine, setBookVaccine] = useState("Covishield");
  const [bookDose, setBookDose] = useState("1");

  const { data: centersData } = useQuery<{ centers: Center[] }>({
    queryKey: ["/api/centers"],
    enabled: screen === "home" || screen === "book",
  });

  const { data: liveBookings } = useQuery<BookingResult[]>({
    queryKey: ["/api/customer/bookings", user?.aadhaarId],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/customer/bookings/${user.aadhaarId}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: !!user && (screen === "home" || screen === "success"),
    refetchInterval: 3000,
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/customer/login", { aadhaarId: loginAadhaar, password: loginPassword });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setUser(data.user);
        setScreen("home");
      }
    },
    onError: (err: Error) => {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/customer/register", {
        aadhaarId: regAadhaar, name: regName, phone: regPhone, password: regPassword,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setUser(data.user);
        setScreen("home");
        toast({ title: "Registered", description: "Account created successfully" });
      }
    },
    onError: (err: Error) => {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCenter || !user) return;
      const slotTime = `${bookDate}T${bookTime}:00+05:30`;
      const res = await apiRequest("POST", "/api/customer/book", {
        aadhaarId: user.aadhaarId,
        patientName: user.name,
        phone: "",
        centerId: selectedCenter.centerId,
        slotTime,
        vaccineType: bookVaccine,
        dose: parseInt(bookDose),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data?.success) {
        setBookingResult(data.appointment);
        setScreen("success");
        queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string).startsWith("/api/appointments") });
        queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string).startsWith("/api/dashboard") });
        queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string).startsWith("/api/patients") });
        queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string).startsWith("/api/centers") });
        queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string).startsWith("/api/customer/bookings") });
        toast({ title: "Booked!", description: "Your appointment has been confirmed." });
      }
    },
    onError: (err: Error) => {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    },
  });

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

  const activeBookings = (liveBookings || []).filter(b => b.status === "BOOKED" || b.status === "CHECKED_IN");
  const disposedBookings = (liveBookings || []).filter(b => b.status === "VACCINATED" || b.status === "CANCELLED" || b.status === "DISPOSED");

  if (screen === "auth") {
    return (
      <div className="min-h-full flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold" data-testid="text-citizen-title">Swasthya Setu</h1>
            <p className="text-xs text-muted-foreground">Citizen Vaccination Portal</p>
          </div>

          <Card>
            <CardContent className="pt-5 space-y-4">
              {!isRegister ? (
                <>
                  <h2 className="text-sm font-semibold text-center">Sign In</h2>
                  <div className="space-y-2">
                    <Label className="text-xs">Aadhaar Number</Label>
                    <Input
                      value={loginAadhaar}
                      onChange={(e) => setLoginAadhaar(e.target.value)}
                      placeholder="12-digit Aadhaar"
                      maxLength={12}
                      data-testid="input-customer-aadhaar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Password</Label>
                    <Input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      data-testid="input-customer-password"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => loginMutation.mutate()}
                    disabled={loginMutation.isPending}
                    data-testid="button-customer-login"
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    New user?{" "}
                    <button className="text-primary font-medium underline" onClick={() => setIsRegister(true)} data-testid="button-toggle-register">
                      Register here
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-sm font-semibold text-center">Create Account</h2>
                  <div className="space-y-2">
                    <Label className="text-xs">Full Name</Label>
                    <Input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Your full name" data-testid="input-reg-name" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Aadhaar Number</Label>
                    <Input value={regAadhaar} onChange={(e) => setRegAadhaar(e.target.value)} placeholder="12-digit Aadhaar" maxLength={12} data-testid="input-reg-aadhaar" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Phone</Label>
                    <Input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+91..." data-testid="input-reg-phone" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Password</Label>
                    <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Create password" data-testid="input-reg-password" />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => registerMutation.mutate()}
                    disabled={registerMutation.isPending || !regName || !regAadhaar || !regPassword}
                    data-testid="button-customer-register"
                  >
                    {registerMutation.isPending ? "Creating..." : "Create Account"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Already registered?{" "}
                    <button className="text-primary font-medium underline" onClick={() => setIsRegister(false)} data-testid="button-toggle-login">
                      Sign in
                    </button>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <p className="text-[10px] text-center text-muted-foreground">
            Powered by Swasthya Setu &middot; ABHA / ABDM Integrated
          </p>
        </div>
      </div>
    );
  }

  if (screen === "home") {
    return (
      <div className="min-h-full bg-gradient-to-b from-primary/5 to-background">
        <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold" data-testid="text-customer-greeting">Hello, {user?.name}!</h1>
              <p className="text-xs text-muted-foreground">Book your vaccination appointment</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Shield className="w-3 h-3" />
                ABHA
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => { setUser(null); setScreen("auth"); }}
                data-testid="button-citizen-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-5 pb-5">
              <h2 className="text-sm font-semibold mb-1">Available Centers</h2>
              <p className="text-xs text-muted-foreground mb-3">Select a center to book your vaccination slot</p>
              <div className="grid grid-cols-1 gap-2">
                {centersData?.centers.map((center) => (
                  <button
                    key={center.centerId}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-background text-left hover:border-primary/50 transition-colors"
                    onClick={() => { setSelectedCenter(center); setScreen("book"); }}
                    data-testid={`button-center-${center.centerId}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{center.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{center.address}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">{center.openSlots} slots</Badge>
                        {Object.keys(center.vaccinesAvailable).map(v => (
                          <Badge key={v} variant="secondary" className="text-[10px] py-0 px-1.5">{v}</Badge>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {activeBookings.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <CalendarCheck className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Active Appointments</span>
                <Badge variant="secondary" className="text-[10px] ml-auto">{activeBookings.length}</Badge>
              </div>
              <CardContent className="pt-3 space-y-2">
                {activeBookings.map((b) => (
                  <div key={b.appointmentId} className="flex items-center justify-between p-3 rounded-lg border bg-background" data-testid={`booking-active-${b.appointmentId}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{b.centerName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(b.slot).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} &middot; {b.vaccineType} &middot; Dose {b.dose}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{b.appointmentId}</p>
                      </div>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {disposedBookings.length > 0 && (
            <Card className="opacity-60">
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground">Past Appointments</span>
                <Badge variant="secondary" className="text-[10px] ml-auto">{disposedBookings.length}</Badge>
              </div>
              <CardContent className="pt-3 space-y-2">
                {disposedBookings.map((b) => (
                  <div
                    key={b.appointmentId}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      b.status === "CANCELLED" ? "bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/50" : b.status === "DISPOSED" ? "bg-gray-50/50 dark:bg-gray-900/10 border-gray-200/50 dark:border-gray-800/50 opacity-50" : "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/50"
                    }`}
                    data-testid={`booking-disposed-${b.appointmentId}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        b.status === "CANCELLED" ? "bg-red-100 dark:bg-red-900/30" : b.status === "DISPOSED" ? "bg-gray-100 dark:bg-gray-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"
                      }`}>
                        {b.status === "VACCINATED" ? (
                          <Syringe className="w-4 h-4 text-emerald-600" />
                        ) : b.status === "DISPOSED" ? (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium line-through decoration-1">{b.centerName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(b.slot).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} &middot; {b.vaccineType} &middot; Dose {b.dose}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{b.appointmentId}</p>
                      </div>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(liveBookings || []).length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-8 pb-8 text-center">
                <CalendarCheck className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">No appointments yet</p>
                <p className="text-xs text-muted-foreground mt-1">Select a center above to book your first slot</p>
              </CardContent>
            </Card>
          )}

          <p className="text-[10px] text-center text-muted-foreground pt-2">
            Powered by Swasthya Setu &middot; ABHA / ABDM Integrated
          </p>
        </div>
      </div>
    );
  }

  if (screen === "book" && selectedCenter) {
    return (
      <div className="min-h-full bg-gradient-to-b from-primary/5 to-background">
        <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setScreen("home")} data-testid="button-back-centers">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Book Appointment</h1>
              <p className="text-xs text-muted-foreground">{selectedCenter.name}</p>
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{selectedCenter.name}</p>
                <p className="text-[11px] text-muted-foreground">{selectedCenter.address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Preferred Date</Label>
                <Input
                  type="date"
                  min={today}
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  data-testid="input-book-date"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Preferred Time</Label>
                <Select value={bookTime} onValueChange={setBookTime}>
                  <SelectTrigger data-testid="select-book-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Vaccine Type</Label>
                <Select value={bookVaccine} onValueChange={setBookVaccine}>
                  <SelectTrigger data-testid="select-book-vaccine">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(selectedCenter.vaccinesAvailable).map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Dose Number</Label>
                <Select value={bookDose} onValueChange={setBookDose}>
                  <SelectTrigger data-testid="select-book-dose">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Dose 1</SelectItem>
                    <SelectItem value="2">Dose 2</SelectItem>
                    <SelectItem value="3">Booster</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Booking Summary</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Center</span>
                    <span className="font-medium text-foreground">{selectedCenter.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vaccine</span>
                    <span className="font-medium text-foreground">{bookVaccine}</span>
                  </div>
                  {bookDate && (
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="font-medium text-foreground">{new Date(bookDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => bookMutation.mutate()}
                disabled={bookMutation.isPending || !bookDate}
                data-testid="button-confirm-booking"
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (screen === "success" && bookingResult) {
    return (
      <div className="min-h-full bg-gradient-to-b from-primary/5 to-background">
        <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 pt-12">
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold" data-testid="text-booking-success">Appointment Booked!</h2>
                <p className="text-xs text-muted-foreground mt-1">Your appointment has been confirmed and sent to {bookingResult.centerName}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Appointment ID</span>
                  <span className="font-mono font-medium" data-testid="text-apt-id">{bookingResult.appointmentId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Center</span>
                  <span className="font-medium">{bookingResult.centerName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">{new Date(bookingResult.slot).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Vaccine</span>
                  <span className="font-medium">{bookingResult.vaccineType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Dose</span>
                  <span className="font-medium">Dose {bookingResult.dose}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-muted-foreground">Status</span>
                  <BookingStatusBadge status={bookingResult.status} />
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-400">
                <p className="font-medium">Your booking is now visible to the doctor at {bookingResult.centerName}</p>
                <p className="mt-1 text-blue-600/70 dark:text-blue-400/70">Status updates (check-in, vaccination) will appear in real-time on your home screen</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={() => { setScreen("home"); setBookingResult(null); setBookDate(""); }} data-testid="button-book-another">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
