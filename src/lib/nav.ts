import {
  LayoutDashboard,
  Map,
  Layers,
  Mountain,
  HeartPulse,
  Brain,
  FlaskConical,
  AlertTriangle,
  Sprout,
  Target,
  CalendarRange,
  Droplets,
  CloudSun,
  Beaker,
  Coins,
  TrendingUp,
  Boxes,
  MessageSquareHeart,
  Send,
  Building2,
  ShieldCheck,
  MapPinned,
  Bot,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "./store";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: Role[]; // if omitted, visible to all
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Soil Intelligence",
    items: [
      { label: "Soil Intelligence Maps", to: "/soil-maps", icon: Map },
      { label: "Parcel Intelligence", to: "/parcel-intelligence", icon: Layers },
      { label: "Soil Type Intelligence", to: "/soil-type", icon: Mountain },
      { label: "Unified Soil Health Index", to: "/soil-health-index", icon: HeartPulse },
    ],
  },
  {
    title: "Nutrient AI",
    items: [
      { label: "Nutrient Prediction Center", to: "/nutrient-prediction", icon: Brain },
      { label: "Nutrient Availability Engine", to: "/nutrient-availability", icon: FlaskConical },
      { label: "Deficiency Severity Analytics", to: "/deficiency-analytics", icon: AlertTriangle },
    ],
  },
  {
    title: "Crop Intelligence",
    items: [
      { label: "Crop Suitability Engine", to: "/crop-suitability", icon: Target },
      { label: "Seasonal Intelligence", to: "/seasonal-intelligence", icon: CalendarRange },
      { label: "Crop Intelligence", to: "/crop-intelligence", icon: Sprout },
    ],
  },
  {
    title: "Environment",
    items: [
      { label: "Groundwater Intelligence", to: "/groundwater", icon: Droplets },
      { label: "Weather Intelligence", to: "/weather", icon: CloudSun },
    ],
  },
  {
    title: "Advisory & Economics",
    items: [
      { label: "Fertilizer Recommendation", to: "/fertilizer", icon: Beaker },
      { label: "Fertilizer Economics", to: "/fertilizer-economics", icon: Coins },
      { label: "Yield Impact Simulator", to: "/yield-simulator", icon: TrendingUp },
      { label: "Soil Digital Twin", to: "/digital-twin", icon: Boxes },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Farmer Advisory Center", to: "/farmer-advisory", icon: MessageSquareHeart },
      { label: "SMS Advisory Center", to: "/sms-advisory", icon: Send },
    ],
  },
  {
    title: "Government",
    items: [
      { label: "RSK Dashboard", to: "/rsk-dashboard", icon: Building2, roles: ["RSK Officer", "Mandal Officer", "District Officer", "State Admin", "APRTGS Monitoring"] },
      { label: "APRTGS Dashboard", to: "/aprtgs-dashboard", icon: ShieldCheck, roles: ["State Admin", "APRTGS Monitoring", "District Officer"] },
      { label: "District Intelligence", to: "/district-intelligence", icon: MapPinned },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "AI Copilot", to: "/ai-copilot", icon: Bot },
      { label: "Reports", to: "/reports", icon: FileText },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];
