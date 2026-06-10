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
import { Link } from "@tanstack/react-router";

export function TopNavbar({ onMenu }: { onMenu: () => void }) {
  const { district, mandal, lang, theme, role, setDistrict, setMandal, setLang, toggleTheme, setRole } =
    useAppStore();
  const mandals = ["All Mandals", ...(MANDALS[district] ?? [])];

  return (
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

        <button className="relative rounded-md p-2 hover:bg-muted">
          <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

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
              <DropdownMenuItem key={r} onClick={() => setRole(r as Role)}>
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
  );
}
