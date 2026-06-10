import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role =
  | "Farmer"
  | "RSK Officer"
  | "Mandal Officer"
  | "District Officer"
  | "State Admin"
  | "APRTGS Monitoring";

export const ROLES: Role[] = [
  "Farmer",
  "RSK Officer",
  "Mandal Officer",
  "District Officer",
  "State Admin",
  "APRTGS Monitoring",
];

export type Lang = "en" | "te";

interface AppState {
  role: Role;
  district: string;
  mandal: string;
  village: string;
  lang: Lang;
  theme: "light" | "dark";
  searchedParcel: any | null;
  setRole: (r: Role) => void;
  setDistrict: (d: string) => void;
  setMandal: (m: string) => void;
  setVillage: (v: string) => void;
  setLang: (l: Lang) => void;
  toggleTheme: () => void;
  setSearchedParcel: (parcel: any | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "State Admin",
      district: "Guntur",
      mandal: "All Mandals",
      village: "All Villages",
      lang: "en",
      theme: "light",
      searchedParcel: null,
      setRole: (role) => set({ role }),
      setDistrict: (district) => set({ district, mandal: "All Mandals", village: "All Villages" }),
      setMandal: (mandal) => set({ mandal, village: "All Villages" }),
      setVillage: (village) => set({ village }),
      setSearchedParcel: (searchedParcel) => set({ searchedParcel }),
      setLang: (lang) => set({ lang }),
      toggleTheme: () =>
        set((s) => {
          const theme = s.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", theme === "dark");
          }
          return { theme };
        }),
    }),
    { name: "agrisoil-app" },
  ),
);
