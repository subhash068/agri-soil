import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Bot, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/ai-copilot")({
  head: () => ({ meta: [{ title: "AI Copilot — AgriSoil AI" }] }),
  component: Copilot,
});

const SUGGESTIONS = [
  "Why is my soil unhealthy?",
  "Why is zinc low?",
  "Which fertilizer should I apply?",
  "How can I improve organic carbon?",
];

const ANSWERS: Record<string, string> = {
  "Why is my soil unhealthy?":
    "Your USHI is 61/100 (Moderate). The biggest drags are organic carbon (0.48%, low) and micronutrients — zinc is critical at 0.42 ppm. pH is slightly alkaline (7.4), reducing P & Zn availability. Improving organic matter and correcting zinc will lift your score most.",
  "Why is zinc low?":
    "Zinc reads 0.42 ppm vs an optimal 0.6–1.2 ppm. Alkaline pH (7.4) fixes zinc into unavailable forms, and high phosphorus uptake competes with zinc absorption. Foliar zinc sulphate bypasses soil fixation.",
  "Which fertilizer should I apply?":
    "For Cotton (Kharif) on your parcel: Zinc Sulphate 25 kg/ha basal, Urea 110 kg/ha in 3 splits, DAP 60 kg/ha basal, Borax 8 kg/ha foliar at flowering. Total ≈ ₹7,060/ha, expected +9.4% yield.",
  "How can I improve organic carbon?":
    "Apply 5 t/ha farmyard manure or compost, incorporate crop residue, grow a legume in rotation (e.g., red gram), and use green manure (sunhemp). Expect OC to rise from 0.48% toward 0.75% over 2–3 seasons.",
};

function Copilot() {
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Namaste! I'm your AgriSoil AI Copilot. Ask me about your soil health, nutrient deficiencies or fertilizer plan." },
  ]);
  const [input, setInput] = useState("");

  const ask = (q: string) => {
    if (!q.trim()) return;
    const answer = ANSWERS[q] ?? "Based on your parcel data, focus on correcting zinc and organic carbon first — these limit your yield most. Ask me 'Which fertilizer should I apply?' for a costed plan.";
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "ai", text: answer }]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={<Bot className="h-5 w-5" />} title="AI Copilot"
        description="Explainable soil & nutrient intelligence assistant" actions={<Pill tone="success">● Online</Pill>} />
      <div className="card-surface flex h-[60vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="flex items-center gap-1 rounded-full border border-input px-2.5 py-1 text-xs hover:bg-muted">
                <Sparkles className="h-3 w-3 text-primary" /> {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(input)}
              placeholder="Ask about your soil…" className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
            <button onClick={() => ask(input)} className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
