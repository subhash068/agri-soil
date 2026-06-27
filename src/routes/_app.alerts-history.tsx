import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { History, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/alerts-history")({
  head: () => ({ meta: [{ title: "Alerts History — AgriSoil AI" }] }),
  component: AlertsHistory,
});

function AlertsHistory() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts-list"],
    queryFn: () => fetch("/api/alerts").then(res => res.json())
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<History className="h-5 w-5" />}
        title="System Alerts History"
        description="Comprehensive audit log of all system alerts, SMS broadcasts, and remediation dispatches."
        actions={<Pill tone="info">{alerts?.length || 0} Total Records</Pill>}
      />

      <Panel title="Historical Audit Log" subtitle="Chronological timeline of system events">
        <div className="p-4 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading history records...</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                  <th className="pb-3 px-2">Date & Time</th>
                  <th className="pb-3 px-2">Type</th>
                  <th className="pb-3 px-2">Location</th>
                  <th className="pb-3 px-2">Severity</th>
                  <th className="pb-3 px-2 w-1/2">Details / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-foreground/90">
                {alerts && [...alerts].reverse().map((alert: any) => (
                  <tr key={alert.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-2 whitespace-nowrap text-[11px] text-muted-foreground font-medium">
                      {alert.time}
                    </td>
                    <td className="py-3 px-2 font-bold text-foreground">
                      {alert.type || "System Event"}
                    </td>
                    <td className="py-3 px-2 font-medium">
                      {alert.district || "Statewide"}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        alert.severity === "Critical" || alert.type === "Remediation"
                          ? "bg-destructive/10 text-destructive"
                          : alert.severity === "Severe"
                          ? "bg-orange-500/10 text-orange-500"
                          : "bg-warning/10 text-warning"
                      }`}>
                        {alert.severity || "Info"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <p className="line-clamp-2 text-foreground/80 leading-relaxed font-medium">
                        {alert.action}
                      </p>
                    </td>
                  </tr>
                ))}
                {(!alerts || alerts.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No historical alerts found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Panel>
    </div>
  );
}
