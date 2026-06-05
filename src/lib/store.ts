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
  lang: Lang;
  theme: "light" | "dark";
  setRole: (r: Role) => void;
  setDistrict: (d: string) => void;
  setMandal: (m: string) => void;
  setLang: (l: Lang) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "State Admin",
      district: "Guntur",
      mandal: "All Mandals",
      lang: "en",
      theme: "light",
      setRole: (role) => set({ role }),
      setDistrict: (district) => set({ district, mandal: "All Mandals" }),
      setMandal: (mandal) => set({ mandal }),
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
