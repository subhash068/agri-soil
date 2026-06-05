import { Link, useRouterState } from "@tanstack/react-router";
import { NAV } from "@/lib/nav";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Sprout, X } from "lucide-react";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const role = useAppStore((s) => s.role);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Sprout className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">AgriSoil AI</p>
          <p className="text-[10px] text-sidebar-foreground/60">Govt. of Andhra Pradesh</p>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="ml-auto rounded p-1 hover:bg-sidebar-accent lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {NAV.map((group) => {
          const items = group.items.filter((i) => !i.roles || i.roles.includes(role));
          if (!items.length) return null;
          return (
            <div key={group.title}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-3 text-[10px] text-sidebar-foreground/50">
        APRTGS · Soil Intelligence Mission · v4.2
      </div>
    </div>
  );
}
