import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { ShieldAlert, PlusCircle } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("SCHEME");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newScheme: any) => {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScheme),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      setTitle("");
      setDesc("");
      alert("Announcement published successfully!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return;
    mutation.mutate({ title, desc, tag });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8 px-4">
      <PageHeader
        icon={<ShieldAlert className="h-5 w-5" />}
        title="Admin Control Center"
        description="Publish announcements, schemes, and alerts to the main portal."
      />

      <Panel title="Create New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Announcement Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="SCHEME">Scheme</option>
              <option value="ADVISORY">Advisory</option>
              <option value="ALERT">Alert</option>
              <option value="UPDATE">System Update</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Subsidy extended for Kharif 2026"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Provide more details about this announcement..."
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            {mutation.isPending ? "Publishing..." : "Publish to Portal"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
