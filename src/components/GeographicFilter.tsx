import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";

export function GeographicFilter() {
  const { district, mandal, village, setDistrict, setMandal, setVillage } = useAppStore();

  const { data: districts = [] } = useQuery({
    queryKey: ["districts"],
    queryFn: () => fetch("http://localhost:8000/districts").then(res => res.json())
  });

  const { data: mandals = [] } = useQuery({
    queryKey: ["mandals", district],
    queryFn: () => fetch(`http://localhost:8000/mandals?district=${district}`).then(res => res.json()),
    enabled: !!district && district !== "All Districts"
  });

  const { data: villages = [] } = useQuery({
    queryKey: ["villages", district, mandal],
    queryFn: () => fetch(`http://localhost:8000/villages?district=${district}&mandal=${mandal}`).then(res => res.json()),
    enabled: !!district && !!mandal && mandal !== "All Mandals"
  });

  return (
    <div className="flex gap-2 text-xs">
      <select 
        value={district || "All Districts"} 
        onChange={e => {
          setDistrict(e.target.value === "All Districts" ? "" : e.target.value);
        }}
        className="bg-card text-foreground border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
      >
        <option value="All Districts">All Districts</option>
        {districts.map((d: string) => <option key={d} value={d}>{d}</option>)}
      </select>

      <select 
        value={mandal || "All Mandals"} 
        onChange={e => {
          setMandal(e.target.value === "All Mandals" ? "" : e.target.value);
        }}
        className="bg-card text-foreground border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
        disabled={!district || district === "All Districts"}
      >
        <option value="All Mandals">All Mandals</option>
        {mandals.map((m: string) => <option key={m} value={m}>{m}</option>)}
      </select>

      <select 
        value={village || "All Villages"} 
        onChange={e => {
          setVillage(e.target.value === "All Villages" ? "" : e.target.value);
        }}
        className="bg-card text-foreground border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
        disabled={!mandal || mandal === "All Mandals"}
      >
        <option value="All Villages">All Villages</option>
        {villages.map((v: string) => <option key={v} value={v}>{v}</option>)}
      </select>
    </div>
  );
}
