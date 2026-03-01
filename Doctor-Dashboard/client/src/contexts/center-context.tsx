import { createContext, useContext, useState, type ReactNode } from "react";

const DOCTORS = [
  { id: "DOC-001", name: "Dr. Rajesh Sharma", specialty: "General Physician", initials: "RS" },
  { id: "DOC-002", name: "Dr. Priya Mehta", specialty: "Pediatrician", initials: "PM" },
  { id: "DOC-003", name: "Dr. Anand Kulkarni", specialty: "Immunologist", initials: "AK" },
  { id: "DOC-004", name: "Dr. Suman Gupta", specialty: "Community Medicine", initials: "SG" },
];

const CENTERS = [
  { id: "CEN-001", name: "PHC Andheri", type: "Primary Health Center", address: "SV Road, Andheri West, Mumbai 400058", phone: "+91 98765 43210", email: "admin@phcandheri.gov.in", reg: "MH/2020/14523" },
  { id: "CEN-002", name: "PHC Bandra", type: "Primary Health Center", address: "Hill Road, Bandra West, Mumbai 400050", phone: "+91 98765 43220", email: "admin@phcbandra.gov.in", reg: "MH/2020/14580" },
  { id: "CEN-003", name: "CHC Dadar", type: "Community Health Center", address: "Tilak Bridge, Dadar East, Mumbai 400014", phone: "+91 98765 43230", email: "admin@chcdadar.gov.in", reg: "MH/2020/15010" },
  { id: "CEN-004", name: "UHC Kurla", type: "Urban Health Center", address: "LBS Marg, Kurla West, Mumbai 400070", phone: "+91 98765 43240", email: "admin@uhckurla.gov.in", reg: "MH/2021/16200" },
];

export type Doctor = typeof DOCTORS[number];
export type CenterInfo = typeof CENTERS[number];

interface CenterContextType {
  selectedDoctor: Doctor;
  setSelectedDoctor: (doctor: Doctor) => void;
  selectedCenter: CenterInfo;
  setSelectedCenter: (center: CenterInfo) => void;
  doctors: Doctor[];
  centers: CenterInfo[];
}

const CenterContext = createContext<CenterContextType | null>(null);

export function CenterProvider({ children }: { children: ReactNode }) {
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0]);
  const [selectedCenter, setSelectedCenter] = useState(CENTERS[0]);

  return (
    <CenterContext.Provider value={{
      selectedDoctor,
      setSelectedDoctor,
      selectedCenter,
      setSelectedCenter,
      doctors: DOCTORS,
      centers: CENTERS,
    }}>
      {children}
    </CenterContext.Provider>
  );
}

export function useCenterContext() {
  const ctx = useContext(CenterContext);
  if (!ctx) throw new Error("useCenterContext must be used within CenterProvider");
  return ctx;
}
