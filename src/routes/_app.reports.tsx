import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { FileText, FileSpreadsheet, FileType, Download } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — AgriSoil AI" }] }),
  component: Reports,
});

const reports = ["Farmer Reports", "Village Reports", "Mandal Reports", "District Reports"];
const formats = [{ name: "PDF", icon: FileType }, { name: "Excel", icon: FileSpreadsheet }, { name: "CSV", icon: FileText }];

function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader icon={<FileText className="h-5 w-5" />} title="Reports"
        description="Generate farmer, village, mandal & district reports in PDF, Excel or CSV" />
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Panel key={r} title={r} bodyClassName="p-4">
            <div className="flex flex-wrap gap-2">
              {formats.map((f) => (
                <button key={f.name} className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm font-medium hover:bg-muted">
                  <f.icon className="h-4 w-4 text-primary" /> {f.name} <Download className="h-3.5 w-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
