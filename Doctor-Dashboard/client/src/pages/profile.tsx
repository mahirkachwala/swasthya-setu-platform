import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Shield,
  CheckCircle,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  Settings,
  Bell,
  Lock,
  FileText,
  HelpCircle,
  ChevronRight,
  Fingerprint,
  Stethoscope,
  Edit,
  Camera,
  Calendar,
  Clock,
  Languages,
  Moon,
  Sun,
  Smartphone,
  Key,
  UserCog,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCenterContext } from "@/contexts/center-context";

function SettingsItem({
  icon: Icon,
  title,
  subtitle,
  action,
  onClick,
  iconColor,
}: {
  icon: typeof Settings;
  title: string;
  subtitle?: string;
  action?: string;
  onClick?: () => void;
  iconColor?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors"
      onClick={onClick}
      data-testid={`settings-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${iconColor || "bg-muted"}`}>
        <Icon className={`w-4 h-4 ${iconColor ? "text-white" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">{title}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action ? (
        <Badge variant="secondary" className="text-[10px] shrink-0">{action}</Badge>
      ) : (
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { selectedDoctor, setSelectedDoctor, selectedCenter, setSelectedCenter, doctors: DOCTORS, centers: CENTERS } = useCenterContext();
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const [showCenterDialog, setShowCenterDialog] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const [editName, setEditName] = useState(selectedDoctor.name);
  const [editSpecialty, setEditSpecialty] = useState(selectedDoctor.specialty);
  const [editPhone, setEditPhone] = useState("+91 98765 43210");
  const [editEmail, setEditEmail] = useState("dr.rajesh@phcandheri.gov.in");
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const [scheduleStart, setScheduleStart] = useState("09:00");
  const [scheduleEnd, setScheduleEnd] = useState("17:00");
  const [scheduleSlotDuration, setScheduleSlotDuration] = useState("15");
  const [scheduleMaxPatients, setScheduleMaxPatients] = useState("50");

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-profile-title">My Account</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Profile, center & preferences</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">{selectedDoctor.initials}</span>
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
                onClick={() => setShowEditProfile(true)}
                data-testid="button-edit-avatar"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold" data-testid="text-doctor-name">{selectedDoctor.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedDoctor.specialty} &middot; {selectedCenter.name}</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => setShowEditProfile(true)} data-testid="button-edit-profile">
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge variant="default" className="gap-1 text-[10px]">
                  <Shield className="w-2.5 h-2.5" />
                  ABHA Verified
                </Badge>
                <Badge variant="secondary" className="gap-1 text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 no-default-active-elevate">
                  <Fingerprint className="w-2.5 h-2.5" />
                  Aadhaar Verified
                </Badge>
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <Stethoscope className="w-2.5 h-2.5" />
                  {selectedDoctor.id}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setShowDoctorDialog(true)} data-testid="card-switch-doctor">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <UserCog className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">Switch Doctor</p>
                <p className="text-[10px] text-muted-foreground truncate">{selectedDoctor.name}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setShowCenterDialog(true)} data-testid="card-switch-center">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">Switch PHC / Center</p>
                <p className="text-[10px] text-muted-foreground truncate">{selectedCenter.name}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">ABHA & Aadhaar</span>
        </div>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ABHA Number</span>
              <p className="text-xs font-mono font-medium" data-testid="text-abha-number">91-4532-7890-1234</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ABHA Address</span>
              <p className="text-xs font-mono font-medium" data-testid="text-abha-address">dr.rajesh@abdm</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Aadhaar Status</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400" data-testid="text-aadhaar-status">Verified (XXXX-XXXX-5678)</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">KYC Status</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400" data-testid="text-kyc-status">Complete</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">ABDM Integration</h3>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs">Consent Manager</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 no-default-active-elevate">
                <CheckCircle className="w-2.5 h-2.5" /> Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs">Health Records</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 no-default-active-elevate">
                <CheckCircle className="w-2.5 h-2.5" /> Linked
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Current Center</span>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary" onClick={() => setShowCenterDialog(true)} data-testid="button-change-center">
            Change
          </Button>
        </div>
        <CardContent className="pt-4 space-y-2.5">
          <div className="flex items-center gap-3">
            <Building className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs font-medium" data-testid="text-center-name">{selectedCenter.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedCenter.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-xs">{selectedCenter.address}</p>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-xs">{selectedCenter.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-xs">{selectedCenter.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-xs">Registration: {selectedCenter.reg}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="px-4 py-3 border-b">
          <span className="text-sm font-semibold">Preferences</span>
        </div>
        <CardContent className="pt-2 space-y-0">
          <SettingsItem icon={Bell} title="Notifications" subtitle="Push, SMS & email alerts" action="On" iconColor="bg-amber-500" />
          <SettingsItem icon={Clock} title="Schedule & Slots" subtitle={`${scheduleStart} - ${scheduleEnd}, ${scheduleSlotDuration} min slots`} onClick={() => setShowScheduleDialog(true)} iconColor="bg-blue-500" />
          <SettingsItem icon={Languages} title="Language" subtitle={selectedLanguage} onClick={() => setShowLanguageDialog(true)} iconColor="bg-green-600" />
          <SettingsItem icon={Smartphone} title="App Theme" subtitle="System default" iconColor="bg-slate-600" />
        </CardContent>
      </Card>

      <Card>
        <div className="px-4 py-3 border-b">
          <span className="text-sm font-semibold">Security & Account</span>
        </div>
        <CardContent className="pt-2 space-y-0">
          <SettingsItem icon={Lock} title="Change Password" iconColor="bg-red-500" />
          <SettingsItem icon={Key} title="Two-Factor Authentication" action="Enabled" iconColor="bg-purple-500" />
          <SettingsItem icon={Shield} title="ABHA Settings" subtitle="Manage ABDM consent & linking" iconColor="bg-primary" />
          <SettingsItem icon={Fingerprint} title="Biometric Login" action="Off" iconColor="bg-teal-600" />
        </CardContent>
      </Card>

      <Card>
        <div className="px-4 py-3 border-b">
          <span className="text-sm font-semibold">Support</span>
        </div>
        <CardContent className="pt-2 space-y-0">
          <SettingsItem icon={HelpCircle} title="Help & Support" subtitle="FAQs, contact helpdesk" />
          <SettingsItem icon={FileText} title="Terms of Service" />
          <SettingsItem icon={FileText} title="Privacy Policy" />
          <SettingsItem icon={Globe} title="About Swasthya Setu" subtitle="v2.0.0" />
        </CardContent>
      </Card>

      <div className="text-center py-2 space-y-2">
        <p className="text-[10px] text-muted-foreground">Swasthya Setu v2.0.0 &middot; ABDM / NHA Compliant</p>
        <Button variant="outline" size="sm" className="text-destructive text-xs" data-testid="button-logout">
          Logout
        </Button>
      </div>

      <Dialog open={showDoctorDialog} onOpenChange={setShowDoctorDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Switch Doctor Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {DOCTORS.map((doc) => (
              <button
                key={doc.id}
                className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedDoctor.id === doc.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => {
                  setSelectedDoctor(doc);
                  setEditName(doc.name);
                  setEditSpecialty(doc.specialty);
                  setShowDoctorDialog(false);
                  toast({ title: "Doctor Switched", description: `Now logged in as ${doc.name}` });
                }}
                data-testid={`button-doctor-${doc.id}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{doc.initials}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-[11px] text-muted-foreground">{doc.specialty} &middot; {doc.id}</p>
                </div>
                {selectedDoctor.id === doc.id && (
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCenterDialog} onOpenChange={setShowCenterDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Switch PHC / Center</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {CENTERS.map((center) => (
              <button
                key={center.id}
                className={`flex items-start gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedCenter.id === center.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => {
                  setSelectedCenter(center);
                  setShowCenterDialog(false);
                  toast({ title: "Center Switched", description: `Now operating at ${center.name}` });
                }}
                data-testid={`button-center-${center.id}`}
              >
                <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Building className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{center.name}</p>
                  <p className="text-[11px] text-muted-foreground">{center.type}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{center.address}</p>
                </div>
                {selectedCenter.id === center.id && (
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-1" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{selectedDoctor.initials}</span>
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm" data-testid="button-upload-photo">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} data-testid="input-edit-name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Specialty</Label>
              <Select value={editSpecialty} onValueChange={setEditSpecialty}>
                <SelectTrigger data-testid="select-edit-specialty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Physician">General Physician</SelectItem>
                  <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                  <SelectItem value="Immunologist">Immunologist</SelectItem>
                  <SelectItem value="Community Medicine">Community Medicine</SelectItem>
                  <SelectItem value="Public Health">Public Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} data-testid="input-edit-phone" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} data-testid="input-edit-email" />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setShowEditProfile(false);
                toast({ title: "Profile Updated", description: "Your profile has been saved." });
              }}
              data-testid="button-save-profile"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-base">Select Language</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 pt-2">
            {["English", "हिन्दी (Hindi)", "मराठी (Marathi)", "தமிழ் (Tamil)", "తెలుగు (Telugu)", "বাংলা (Bengali)", "ಕನ್ನಡ (Kannada)"].map((lang) => (
              <button
                key={lang}
                className={`flex items-center justify-between w-full p-2.5 rounded-lg text-left transition-colors ${
                  selectedLanguage === lang ? "bg-primary/5 border border-primary" : "hover:bg-muted/50 border border-transparent"
                }`}
                onClick={() => {
                  setSelectedLanguage(lang);
                  setShowLanguageDialog(false);
                  toast({ title: "Language Updated", description: `Language set to ${lang}` });
                }}
                data-testid={`button-lang-${lang.split(" ")[0].toLowerCase()}`}
              >
                <span className="text-xs font-medium">{lang}</span>
                {selectedLanguage === lang && <CheckCircle className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Schedule & Slot Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Time</Label>
                <Input type="time" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} data-testid="input-schedule-start" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Time</Label>
                <Input type="time" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} data-testid="input-schedule-end" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Slot Duration (minutes)</Label>
              <Select value={scheduleSlotDuration} onValueChange={setScheduleSlotDuration}>
                <SelectTrigger data-testid="select-slot-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max Patients Per Day</Label>
              <Input type="number" value={scheduleMaxPatients} onChange={(e) => setScheduleMaxPatients(e.target.value)} data-testid="input-max-patients" />
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              Working days: Mon - Sat (editable in full version)
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setShowScheduleDialog(false);
                toast({ title: "Schedule Updated", description: "Your slot settings have been saved." });
              }}
              data-testid="button-save-schedule"
            >
              Save Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
