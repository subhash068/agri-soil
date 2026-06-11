import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { useAppStore, ROLES, Role } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Shield, Check, Eye, Trash2, CheckCircle2, UserCheck, Sliders, ToggleLeft, ToggleRight, Key } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — AgriSoil AI" }] }),
  component: SettingsPage,
});

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  "State Admin": [
    "Execute SMS broadcasting campaigns state-wide",
    "Modify soil nutrient thresholds globally",
    "Access all district comparative intelligence blueprints",
    "View APRTGS state telemetry metrics",
    "Schedule and confirm all RSK visit rosters"
  ],
  "District Officer": [
    "View all district comparative intelligence blueprints",
    "View APRTGS state telemetry metrics",
    "Initiate SMS campaigns restricted to own district",
    "Schedule and confirm own district RSK visit rosters"
  ],
  "Mandal Officer": [
    "View local mandal deficiency analytics",
    "Access own mandal RSK visit rosters",
    "Send local advisory triggers to farmers"
  ],
  "RSK Officer": [
    "Schedule and confirm local RSK visit rosters",
    "Distribute Soil Health Cards to farmers",
    "View local farmer soil index metrics"
  ],
  "APRTGS Monitoring": [
    "View APRTGS state telemetry metrics",
    "Read-only access to all dashboards"
  ],
  "Farmer": [
    "View personal soil digital twin",
    "View yield simulation forecast metrics"
  ]
};

function SettingsPage() {
  const { role, lang, theme, setRole, setLang, toggleTheme } = useAppStore();

  // Threshold sliders state
  const [nitrogenThresh, setNitrogenThresh] = useState<number>(280);
  const [phosphorusThresh, setPhosphorusThresh] = useState<number>(14);
  const [zincThresh, setZincThresh] = useState<number>(0.6);
  const [indexMode, setIndexMode] = useState<"standard" | "nutrient">("standard");

  // API gateway configs
  const [weatherApi, setWeatherApi] = useState<string>("https://api.open-meteo.com/v1");
  const [smsGateway, setSmsGateway] = useState<string>("https://api.apsg.gov.in/sms/v2");
  const [saveSuccess, setSaveSuccess] = useState<string>("");

  const handleSaveThresholds = () => {
    setSaveSuccess("System configurations updated and saved successfully!");
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<SettingsIcon className="h-5 w-5" />}
        title="Settings & System Configurations"
        description="Manage role-based authority profiles, language options, chemical threshold tolerances, and system API endpoints."
        actions={<Pill tone="info">System Panel</Pill>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Role & Permissions Console */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Role Authorization Matrix" subtitle="Switch active persona profile to view dashboard accessibility mapping">
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-24 ${
                      role === r
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                        : "border-border/60 hover:bg-muted/10 bg-background/30"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <Shield className={`h-4 w-4 ${role === r ? "text-primary" : "text-muted-foreground"}`} />
                      {role === r && <span className="bg-primary/20 text-primary text-[8px] uppercase font-bold px-1.5 py-0.5 rounded">Active</span>}
                    </div>
                    <span className="text-xs font-bold text-foreground mt-2">{r}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-border/40 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span>Authorized Operations: {role}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ROLE_PERMISSIONS[role]?.map((perm, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-muted-foreground bg-background/50 border border-border/40 p-2.5 rounded-lg">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{perm}</span>
                    </div>
                  )) || <span className="text-xs text-muted-foreground">No permissions specified.</span>}
                </div>
              </div>
            </div>
          </Panel>

          {/* Threshold Configurations */}
          <Panel title="Soil Quality Deficiency Thresholds" subtitle="Calibrate classification limits for critical alerts (e.g. soil cards & dashboards)">
            <div className="p-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <Label htmlFor="nitrogen-slider">Nitrogen Deficiency (N)</Label>
                    <span className="font-bold text-primary font-mono">{nitrogenThresh} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    id="nitrogen-slider"
                    min="150"
                    max="350"
                    step="5"
                    value={nitrogenThresh}
                    onChange={(e) => setNitrogenThresh(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-muted-foreground">Deficient level boundaries (Standard: 280 kg/ha)</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <Label htmlFor="phosphorus-slider">Phosphorus Deficiency (P)</Label>
                    <span className="font-bold text-primary font-mono">{phosphorusThresh} ppm</span>
                  </div>
                  <input
                    type="range"
                    id="phosphorus-slider"
                    min="5"
                    max="25"
                    step="1"
                    value={phosphorusThresh}
                    onChange={(e) => setPhosphorusThresh(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-muted-foreground">Deficient level boundaries (Standard: 14 ppm)</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <Label htmlFor="zinc-slider">Zinc Deficiency (Zn)</Label>
                    <span className="font-bold text-primary font-mono">{zincThresh} ppm</span>
                  </div>
                  <input
                    type="range"
                    id="zinc-slider"
                    min="0.2"
                    max="1.5"
                    step="0.05"
                    value={zincThresh}
                    onChange={(e) => setZincThresh(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-muted-foreground">Deficient level boundaries (Standard: 0.6 ppm)</p>
                </div>
              </div>

              {saveSuccess && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 flex gap-2 items-center text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-border/40 pt-4">
                <span className="text-[10px] text-muted-foreground leading-normal">
                  Altering limits immediately affects soil health card deficiency statuses and map metric boundaries.
                </span>
                <Button onClick={handleSaveThresholds} className="text-xs font-bold px-4">
                  Save Threshold Profiles
                </Button>
              </div>
            </div>
          </Panel>
        </div>

        {/* Preferences & Developer API Config */}
        <div className="lg:col-span-1 space-y-6">
          <Panel title="System Preferences" subtitle="Interface language, layout, and calculations">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Bilingual Localization</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setLang("en")}
                    className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                      lang === "en" ? "border-primary bg-primary/10 text-primary" : "border-border/60 hover:bg-muted/10 bg-transparent text-muted-foreground"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang("te")}
                    className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                      lang === "te" ? "border-primary bg-primary/10 text-primary" : "border-border/60 hover:bg-muted/10 bg-transparent text-muted-foreground"
                    }`}
                  >
                    తెలుగు
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-3">
                <span className="text-xs font-bold text-muted-foreground">Appearance Profile</span>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1 rounded text-xs font-bold border border-border/60 capitalize hover:bg-muted/10 bg-transparent text-foreground"
                >
                  {theme} Mode
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-3">
                <span className="text-xs font-bold text-muted-foreground">SHI Calculation Formula</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIndexMode("standard")}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                      indexMode === "standard" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-transparent text-muted-foreground"
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setIndexMode("nutrient")}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                      indexMode === "nutrient" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-transparent text-muted-foreground"
                    }`}
                  >
                    Nutrient-Heavy
                  </button>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="System API Gateway Integration" subtitle="Mock external endpoints connecting subsystems">
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="weather-endpoint">Weather Forecast API</Label>
                <Input
                  id="weather-endpoint"
                  value={weatherApi}
                  onChange={(e) => setWeatherApi(e.target.value)}
                  className="bg-background/50 border-border/60 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sms-endpoint">SMS Broadcast Gateway</Label>
                <Input
                  id="sms-endpoint"
                  value={smsGateway}
                  onChange={(e) => setSmsGateway(e.target.value)}
                  className="bg-background/50 border-border/60 text-xs"
                />
              </div>

              <div className="border-t border-border/40 pt-3 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1"><Key className="h-3 w-3 text-primary" /> Active API Keys</span>
                  <span className="text-emerald-400 font-bold">Connected</span>
                </div>
                <div className="bg-background/50 border border-border/40 rounded p-2 text-[10px] font-mono text-muted-foreground overflow-x-auto">
                  AP_SOIL_INTELLIGENCE_KEY=••••••••••••••••3a9c
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
