import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";

export function GeographicFilter() {
  const { district, mandal, village, setDistrict, setMandal, setVillage } = useAppStore();

  const { data: districts = [] } = useQuery({
    queryKey: ["districts"],
    queryFn: () => fetch("/api/districts").then(res => res.json())
  });

  const { data: mandals = [] } = useQuery({
    queryKey: ["mandals", district],
    queryFn: () => fetch(`/api/mandals?district=${district}`).then(res => res.json()),
    enabled: !!district && district !== "All Districts"
  });

  const { data: villages = [] } = useQuery({
    queryKey: ["villages", district, mandal],
    queryFn: () => fetch(`/api/villages?district=${district}&mandal=${mandal}`).then(res => res.json()),
    enabled: !!district && !!mandal && mandal !== "All Mandals"
  });

  return (
    <div className="flex gap-2 text-[14px]">
      <select 
        value={district || "All Districts"} 
        onChange={e => {
          setDistrict(e.target.value === "All Districts" ? "" : e.target.value);
        }}
        className={`rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer ${district && district !== "All Districts" ? "bg-primary/10 border border-primary/30 text-primary font-medium" : "bg-card text-foreground border border-border"}`}
      >
        <option value="All Districts" className="bg-card text-foreground">All Districts</option>
        {districts.map((d: string) => <option key={d} value={d} className="bg-card text-foreground">{d}</option>)}
      </select>

      <select 
        value={mandal || "All Mandals"} 
        onChange={e => {
          setMandal(e.target.value === "All Mandals" ? "" : e.target.value);
        }}
        className={`rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${mandal && mandal !== "All Mandals" ? "bg-primary/10 border border-primary/30 text-primary font-medium" : "bg-card text-foreground border border-border"}`}
        disabled={!district || district === "All Districts"}
      >
        <option value="All Mandals" className="bg-card text-foreground">All Mandals</option>
        {mandals.map((m: string) => <option key={m} value={m} className="bg-card text-foreground">{m}</option>)}
      </select>

      <select 
        value={village || "All Villages"} 
        onChange={e => {
          setVillage(e.target.value === "All Villages" ? "" : e.target.value);
        }}
        className={`rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${village && village !== "All Villages" ? "bg-primary/10 border border-primary/30 text-primary font-medium" : "bg-card text-foreground border border-border"}`}
        disabled={!mandal || mandal === "All Mandals"}
      >
        <option value="All Villages" className="bg-card text-foreground">All Villages</option>
        {villages.map((v: string) => <option key={v} value={v} className="bg-card text-foreground">{v}</option>)}
      </select>
    </div>
  );
}
