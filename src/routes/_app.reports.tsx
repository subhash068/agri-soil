import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, FileSpreadsheet, FileType, Download, Calendar, Settings, CheckCircle2, ChevronRight, Clock, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — AgriSoil AI" }] }),
  component: Reports,
});

const REPORT_TYPES = [
  { id: "soil_health", name: "Farmer Soil Health Cards Summary", desc: "Detailed chemistry profiles, indices, and targeted fertilizer recommendations." },
  { id: "hotspots", name: "Mandal Deficiency & Hotspot Audit", desc: "Aggregated nutrient deficiency analysis and priority mapping per RSK." },
  { id: "weather_water", name: "Groundwater & Weather Trend Ledger", desc: "Historical weather indexes coupled with groundwater table status." },
  { id: "rsk_visits", name: "RSK Field Activity & Visit Logs", desc: "Audit log of scheduled farmer visits and advice adherence rates." }
];

const INITIAL_EXPORTS = [
  { id: "rep_102", name: "Anantapur Groundnut Soil Report", type: "Farmer Soil Health Cards Summary", format: "PDF", size: "3.2 MB", date: "June 10, 2026", status: "Ready" },
  { id: "rep_101", name: "Guntur Cotton Zinc Audit", type: "Mandal Deficiency & Hotspot Audit", format: "Excel", size: "840 KB", date: "June 08, 2026", status: "Ready" },
  { id: "rep_100", name: "NTR Paddy Water Stress Ledger", type: "Groundwater & Weather Trend Ledger", format: "CSV", size: "1.4 MB", date: "June 05, 2026", status: "Ready" }
];

function Reports() {
  const [reportType, setReportType] = useState<string>("soil_health");
  const [district, setDistrict] = useState<string>("anantapur");
  const [format, setFormat] = useState<string>("pdf");
  const [dateRange, setDateRange] = useState<string>("30_days");
  
  const [exportsList, setExportsList] = useState(INITIAL_EXPORTS);
  const [selectedExportId, setSelectedExportId] = useState<string>("rep_102");

  // Export progress animation states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string>("");

  const activeExport = exportsList.find((e) => e.id === selectedExportId) || exportsList[0];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setProgress(0);
    setSuccessMsg("");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const reportMetadata = REPORT_TYPES.find((r) => r.id === reportType);
            const selectedDist = district === "all" ? "All Districts" : district.charAt(0).toUpperCase() + district.slice(1);
            const formatLabel = format.toUpperCase();
            
            const newExport = {
              id: `rep_${Date.now().toString().slice(-3)}`,
              name: `${selectedDist} ${reportMetadata?.name.split(" ").slice(-3).join(" ")}`,
              type: reportMetadata?.name || "Soil Health Cards Summary",
              format: formatLabel,
              size: format === "pdf" ? "2.8 MB" : format === "excel" ? "620 KB" : "1.1 MB",
              date: "Just now",
              status: "Ready"
            };

            setExportsList([newExport, ...exportsList]);
            setSelectedExportId(newExport.id);
            setIsGenerating(false);
            setSuccessMsg("Report compiled and downloaded successfully!");
            setTimeout(() => setSuccessMsg(""), 5000);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDeleteExport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = exportsList.filter((item) => item.id !== id);
    setExportsList(updated);
    if (selectedExportId === id && updated.length > 0) {
      setSelectedExportId(updated[0].id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title="Reports & Document Hub"
        description="Configure parameters to export local agricultural profiles, indices, and action plans."
        actions={<Pill tone="info">Document Center</Pill>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Report Configuration Console */}
        <div className="lg:col-span-1 space-y-6">
          <Panel title="Report Configuration Console" subtitle="Define export parameters and filters">
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="report-type-select">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type-select" className="bg-background/50 border-border/60">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                  {REPORT_TYPES.find((r) => r.id === reportType)?.desc}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district-select">Geographic Scope</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger id="district-select" className="bg-background/50 border-border/60">
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="anantapur">Anantapur</SelectItem>
                    <SelectItem value="guntur">Guntur</SelectItem>
                    <SelectItem value="ntr">NTR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="format-select">Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger id="format-select" className="bg-background/50 border-border/60">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF (Printable)</SelectItem>
                      <SelectItem value="excel">Excel Sheet</SelectItem>
                      <SelectItem value="csv">Raw CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="range-select">Time Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger id="range-select" className="bg-background/50 border-border/60">
                      <SelectValue placeholder="Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30_days">Past 30 Days</SelectItem>
                      <SelectItem value="quarter">Past Quarter</SelectItem>
                      <SelectItem value="year">Past Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2 py-2 animate-in fade-in duration-200">
                  <div className="flex justify-between text-xs font-semibold text-primary">
                    <span>Compiling dataset and layout...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 flex gap-2 items-center text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{successMsg}</span>
                </div>
              )}

              <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full text-xs font-bold gap-2">
                <Download className="h-4 w-4" />
                {isGenerating ? "Exporting Document..." : "Generate and Download Report"}
              </Button>
            </div>
          </Panel>
        </div>

        {/* Right Side: Document Preview and Export Audit trail */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Report Outline / Mock Preview */}
            <Panel title="Document Structure Preview" subtitle={`Live outline: ${activeExport.name}`}>
              <div className="p-5 space-y-4">
                <div className="border border-border/60 bg-background/50 rounded-lg p-4 space-y-3">
                  <div className="border-b border-border/40 pb-2 flex justify-between items-center">
                    <h4 className="text-xs font-bold text-foreground">{activeExport.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">{activeExport.format}</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Report Classification:</span>
                      <span className="font-semibold">{activeExport.type}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Generated Date:</span>
                      <span className="font-semibold">{activeExport.date}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Target Size:</span>
                      <span className="font-semibold">{activeExport.size}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Encryption Status:</span>
                      <span className="font-semibold text-success">AES-256 Secured</span>
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-2.5 space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Estimated Sections Included</p>
                    <ul className="text-[11px] list-disc list-inside text-muted-foreground space-y-1">
                      <li>Executive regional soil summary tables.</li>
                      <li>Critical NPK & micronutrient deficiency logs.</li>
                      <li>RSK officer implementation checklists.</li>
                    </ul>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-xs font-bold gap-2">
                  <Download className="h-3.5 w-3.5" /> Download Document ({activeExport.size})
                </Button>
              </div>
            </Panel>

            <Panel title="Recent Exports Hub" subtitle="Audit log of historically generated reports">
              <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                {exportsList.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No reports exported yet.</p>
                ) : (
                  exportsList.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setSelectedExportId(e.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                        selectedExportId === e.id ? "border-primary bg-primary/5 text-primary" : "border-border/60 hover:bg-muted/10"
                      }`}
                    >
                      <div className="flex gap-2.5 items-start">
                        {e.format === "PDF" ? (
                          <FileType className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        ) : e.format === "Excel" ? (
                          <FileSpreadsheet className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <FileText className="h-5 w-5 text-info shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-foreground leading-tight">{e.name}</p>
                          <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{e.type}</p>
                          <div className="flex gap-2 items-center text-[9px] text-muted-foreground mt-1 font-semibold">
                            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {e.date}</span>
                            <span>•</span>
                            <span>{e.size}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(evt) => handleDeleteExport(e.id, evt)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
