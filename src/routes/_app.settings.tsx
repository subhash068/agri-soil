import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { useAppStore, ROLES } from "@/lib/store";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — AgriSoil AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { role, lang, theme, setRole, setLang, toggleTheme } = useAppStore();
  return (
    <div className="space-y-6">
      <PageHeader icon={<SettingsIcon className="h-5 w-5" />} title="Settings"
        description="Role permissions, language and appearance preferences" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Role & Permissions" subtitle="Demo role switcher">
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`rounded-md border px-3 py-1.5 text-sm font-medium ${role === r ? "border-primary bg-primary text-primary-foreground" : "border-input hover:bg-muted"}`}>{r}</button>
            ))}
          </div>
        </Panel>
        <Panel title="Preferences">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Language</span>
              <div className="flex gap-2">
                <button onClick={() => setLang("en")} className={`rounded-md border px-3 py-1 text-sm ${lang === "en" ? "border-primary bg-primary/10 text-primary" : "border-input"}`}>English</button>
                <button onClick={() => setLang("te")} className={`rounded-md border px-3 py-1 text-sm ${lang === "te" ? "border-primary bg-primary/10 text-primary" : "border-input"}`}>తెలుగు</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <button onClick={toggleTheme} className="rounded-md border border-input px-3 py-1 text-sm capitalize hover:bg-muted">{theme}</button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
