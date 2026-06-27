import { useAppStore, ROLES, type Role } from "@/lib/store";
import { DISTRICTS, MANDALS } from "@/lib/mock-data";
import {
  Search,
  Bell,
  Bot,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  Globe,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";

export function TopNavbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const { district, mandal, lang, theme, role, setDistrict, setMandal, setLang, toggleTheme, setRole } =
    useAppStore();
  const mandals = ["All Mandals", ...(MANDALS[district] ?? [])];

  const { data: alerts } = useQuery({
    queryKey: ["alerts-list"],
    queryFn: () => fetch("/api/alerts").then(res => res.json())
  });

  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set());
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("readAlerts");
    if (saved) {
      try {
        setReadAlerts(new Set(JSON.parse(saved)));
      } catch (e) {}
    }
  }, []);

  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert);
    const newRead = new Set(readAlerts);
    newRead.add(alert.id);
    setReadAlerts(newRead);
    localStorage.setItem("readAlerts", JSON.stringify(Array.from(newRead)));
  };

  const unreadCount = alerts ? alerts.filter((a: any) => !readAlerts.has(a.id)).length : 0;

  return (
    <>
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/85 px-3 backdrop-blur sm:px-4">
      <button onClick={onMenu} className="rounded-md p-2 hover:bg-muted lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search parcels, farmers, villages, advisories…"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">

        <Link
          to="/ai-copilot"
          className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Bot className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Copilot</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-md p-2 hover:bg-muted outline-none">
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Active Stress Alerts</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-normal text-muted-foreground">{unreadCount} new</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(!alerts || alerts.length === 0) ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No active stress alerts reported.
              </div>
            ) : (
              [...alerts].reverse().slice(0, 5).map((alert: any) => {
                const isRead = readAlerts.has(alert.id);
                return (
                  <DropdownMenuItem 
                    key={alert.id} 
                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${isRead ? "opacity-60" : "bg-primary/5"}`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex w-full items-center justify-between gap-1 text-[11px] font-bold">
                      <span className={
                        alert.type === "Remediation" || alert.severity === "Critical"
                          ? "text-destructive"
                          : "text-warning"
                      }>
                        [{alert.type || "Alert"}] {alert.district || "Statewide"}
                      </span>
                      <span className="text-[9px] font-normal text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-[11px] text-foreground/90 font-medium line-clamp-2">
                      {alert.action}
                    </p>
                  </DropdownMenuItem>
                );
              })
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="w-full text-center text-xs font-semibold text-primary block" asChild>
              <Link to="/alerts-history">View All History</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button onClick={() => setLang(lang === "en" ? "te" : "en")} className="flex items-center gap-1 rounded-md p-2 text-xs font-semibold hover:bg-muted">
          <Globe className="h-[18px] w-[18px]" />
          {lang === "en" ? "EN" : "తె"}
        </button>

        <button onClick={toggleTheme} className="rounded-md p-2 hover:bg-muted">
          {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </button>

        {/* Role / profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-input py-1 pl-1 pr-2 hover:bg-muted">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {role.slice(0, 1)}
            </span>
            <span className="hidden text-left leading-tight xl:block">
              <span className="block text-xs font-semibold">{role}</span>
              <span className="block text-[10px] text-muted-foreground">Signed in</span>
            </span>
            <ChevronDown className="hidden h-3 w-3 opacity-60 xl:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Switch role (demo)</DropdownMenuLabel>
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => {
                  setRole(r as Role);
                  
                  // Map role to default dashboard
                  let targetPath = "/dashboard";
                  switch(r) {
                    case "Farmer":
                      targetPath = "/farmer-advisory";
                      break;
                    case "RSK Officer":
                    case "Mandal Officer":
                      targetPath = "/rsk-dashboard";
                      break;
                    case "District Officer":
                      targetPath = "/district-intelligence";
                      break;
                    case "State Admin":
                    case "APRTGS Monitoring":
                      targetPath = "/dashboard";
                      break;
                  }
                  
                  router.navigate({ to: targetPath });
                }}
              >
                {r}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Alert Details
          </DialogTitle>
          <DialogDescription>
            Detailed view of the selected system alert.
          </DialogDescription>
        </DialogHeader>
        {selectedAlert && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground text-xs uppercase">Type</p>
                <p className="font-medium">{selectedAlert.type}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground text-xs uppercase">Date</p>
                <p className="font-medium">{selectedAlert.time}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground text-xs uppercase">Location</p>
                <p className="font-medium">{selectedAlert.district || "Statewide"}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground text-xs uppercase">Severity</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                  selectedAlert.severity === "Critical" || selectedAlert.type === "Remediation"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-warning/10 text-warning"
                }`}>
                  {selectedAlert.severity || "Warning"}
                </span>
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md border border-border/50">
              <p className="font-semibold text-muted-foreground text-xs uppercase mb-1">Action / Details</p>
              <p className="text-sm leading-relaxed">{selectedAlert.action}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
