import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-agri.jpg";
import {
  STATE_KPIS,
  ANNOUNCEMENTS,
  HOTSPOTS,
  ADVISORIES,
  districtRanking,
  SEVERITY_COLOR,
  Severity,
} from "@/lib/mock-data";
import {
  Sprout,
  ArrowRight,
  Satellite,
  Users,
  MapPinned,
  HeartPulse,
  AlertTriangle,
  Beaker,
  IndianRupee,
  TrendingUp,
  Megaphone,
  CloudRain,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriSoil AI — Soil Nutrient Mapping & Advisory | Govt. of Andhra Pradesh" },
      {
        name: "description",
        content:
          "AI-enabled parcel-level soil nutrient mapping, confidence-scored soil maps, crop-specific fertilizer advisories and government decision-support for the Agriculture Department, Govt. of Andhra Pradesh.",
      },
      { property: "og:title", content: "AgriSoil AI — National Soil Intelligence Mission" },
      { property: "og:description", content: "AI-powered precision agriculture & GIS soil intelligence for Andhra Pradesh." },
    ],
  }),
  component: Home,
});

const fmt = (n: number) => n.toLocaleString("en-IN");

function Home() {
  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: () => fetch("/api/landing/stats").then(res => res.json()),
  });

  const { data: dynamicSchemes } = useQuery({
    queryKey: ["schemes"],
    queryFn: () => fetch("/api/schemes").then(res => res.json()),
  });

  const { data: dynamicHotspots } = useQuery({
    queryKey: ["hotspots"],
    queryFn: () => fetch("/api/landing/hotspots").then(res => res.json()),
  });

  // Combine dynamic backend data with some mock data so it doesn't look empty
  const formattedDynamicSchemes = (dynamicSchemes || []).map((s: any) => ({
    ...s,
    level: s.tag === "ALERT" ? "critical" : s.tag === "ADVISORY" ? "warning" : "info",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  }));
  const schemesList = formattedDynamicSchemes.length > 0 ? formattedDynamicSchemes : ANNOUNCEMENTS;

  const hotspotsList = dynamicHotspots && dynamicHotspots.length > 0 ? dynamicHotspots : HOTSPOTS;

  const kpis = [
    { label: "Farmers Covered", value: fmt(stats?.farmers_covered || STATE_KPIS.farmers), icon: Users },
    { label: "Parcels Monitored", value: fmt(stats?.parcels_monitored || STATE_KPIS.parcels), icon: MapPinned },
    { label: "Avg. Soil Health", value: `${stats?.avg_soil_health || STATE_KPIS.soilHealth}/100`, icon: HeartPulse },
    { label: "Deficient Parcels", value: fmt(stats?.deficient_parcels || STATE_KPIS.deficientParcels), icon: AlertTriangle },
    { label: "Recommendations", value: stats?.recommendations ? `${(stats.recommendations / 100000).toFixed(1)}L` : `${(STATE_KPIS.recommendations / 100000).toFixed(1)}L`, icon: Beaker },
    { label: "Farmer Savings", value: `₹${stats?.farmer_savings_cr || STATE_KPIS.savings}Cr`, icon: IndianRupee },
    { label: "Yield Improvement", value: `+${stats?.yield_improvement_percent || STATE_KPIS.yieldGain}%`, icon: TrendingUp },
  ];
  const ranking = districtRanking();

  return (
    <div className="min-h-screen bg-background">
      {/* Gov top bar */}
      <div className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px]">
          <span>భారత ప్రభుత్వం · Agriculture Department, Government of Andhra Pradesh</span>
          <span className="hidden sm:block">APRTGS · National Soil Intelligence Mission</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">AgriSoil AI</p>
            <p className="text-[10px] text-muted-foreground">Soil Nutrient Mapping & Advisory System</p>
          </div>
          <Link
            to="/dashboard"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Enter Platform <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Satellite view of Andhra Pradesh farmland with soil health heatmap" className="h-[460px] w-full object-cover sm:h-[540px]" width={1600} height={900} />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/70 to-transparent" />
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl text-sidebar-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sidebar-primary/20 px-3 py-1 text-xs font-semibold text-sidebar-primary">
                <Satellite className="h-3.5 w-3.5" /> Live satellite monitoring · Sentinel-2 · Planet
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                AI-Enabled Soil Nutrient Mapping & Advisory
              </h1>
              <p className="mt-4 max-w-xl text-sm text-sidebar-foreground/85 sm:text-base">
                Parcel-level soil intelligence, confidence-scored nutrient prediction, crop-specific fertilizer
                recommendations and groundwater-aware advisories — powering precision agriculture across Andhra Pradesh.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-sidebar-primary px-5 py-2.5 text-sm font-semibold text-sidebar-primary-foreground hover:opacity-90">
                  Open Command Center <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/soil-maps" className="inline-flex items-center gap-2 rounded-md border border-sidebar-foreground/30 px-5 py-2.5 text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-foreground/10">
                  Explore Soil Maps
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-surface p-3.5"
            >
              <k.icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-lg font-bold tabular-nums">{k.value}</p>
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Content grid */}
      <section className="mx-auto mt-10 grid max-w-7xl gap-5 px-4 pb-16 lg:grid-cols-3">
        {/* Announcements */}
        <div className="card-surface lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Government Announcements & Advisories</h2>
          </div>
          <ul className="divide-y divide-border">
            {schemesList.map((a: any) => (
              <li key={a.id || a.title} className="flex items-start gap-3 px-5 py-3">
                <span
                  className="mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    background:
                      a.level === "critical"
                        ? "var(--color-destructive)"
                        : a.level === "warning"
                          ? "var(--color-warning)"
                          : "var(--color-info)",
                    color: "white",
                  }}
                >
                  {a.tag}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
              </li>
            ))}
            {schemesList.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-muted-foreground">
                No active announcements right now.
              </li>
            )}
          </ul>
        </div>

        {/* Soil health alerts / hotspots */}
        <div className="card-surface">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-semibold">Nutrient Hotspots</h2>
          </div>
          <ul className="divide-y divide-border">
            {hotspotsList.map((h: any) => (
              <li key={h.district + h.nutrient} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{h.district}</p>
                  <p className="text-xs text-muted-foreground">{h.nutrient} · {fmt(h.parcels)} parcels</p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: SEVERITY_COLOR[h.severity as Severity] }}>
                  {h.severity}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* District rankings */}
        <div className="card-surface lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <MapPinned className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">District Soil Health Rankings</h2>
          </div>
          <div className="p-5">
            <div className="space-y-2.5">
              {ranking.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                  <span className="w-28 text-sm font-medium">{d.name}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${d.soilHealth}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold tabular-nums">{d.soilHealth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest advisories + weather */}
        <div className="card-surface">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <CloudRain className="h-4 w-4 text-info" />
            <h2 className="text-sm font-semibold">Latest Advisories</h2>
          </div>
          <ul className="divide-y divide-border">
            {ADVISORIES.map((a) => (
              <li key={a.farmer} className="px-5 py-2.5">
                <p className="text-sm font-medium">{a.action}</p>
                <p className="text-xs text-muted-foreground">{a.farmer} · {a.village} · {a.crop}</p>
              </li>
            ))}
          </ul>
          <Link to="/farmer-advisory" className="flex items-center justify-center gap-1 border-t border-border py-2.5 text-xs font-semibold text-primary hover:bg-muted">
            View Advisory Center <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground">
          © 2026 Agriculture Department, Government of Andhra Pradesh · AgriSoil AI — National Soil Intelligence Mission · APRTGS Monitoring
        </div>
      </footer>
    </div>
  );
}
