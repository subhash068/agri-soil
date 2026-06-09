import React, { useState, useEffect, useRef } from "react";
import { DISTRICTS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";

// Interactive Leaflet map of Andhra Pradesh coastal districts using actual boundaries from PostgreSQL.
export function APMap({
  metricKey = "soilHealth",
  invert = false,
  height = 420,
  unit = "",
}: {
  metricKey?: "soilHealth" | "deficiencyRate" | "adoption" | "groundwaterStress" | "yieldGain";
  invert?: boolean;
  height?: number;
  unit?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [districtGeoData, setDistrictGeoData] = useState<any>(null);
  const [mandalGeoData, setMandalGeoData] = useState<any>(null);
  
  const geoJsonRef = useRef<L.GeoJSON>(null);
  const mandalGeoJsonRef = useRef<L.GeoJSON>(null);
  const mapRef = useRef<L.Map>(null);

  const selected = useAppStore((s) => s.district);
  const setDistrict = useAppStore((s) => s.setDistrict);

  useEffect(() => {
    setMounted(true);
    // Fetch District boundaries from PostgreSQL Backend
    fetch("http://localhost:8000/boundaries/districts")
      .then((res) => res.json())
      .then((data) => setDistrictGeoData(data));
  }, []);

  // Drill-down: Fetch Mandal boundaries when a specific district is selected
  useEffect(() => {
    if (selected && selected !== "All Districts") {
      // For the API we need to match the name. 
      const apiName = selected === "Anantapur" ? "Ananthapuram" : selected;
      fetch(`http://localhost:8000/boundaries/mandals?district=%${apiName}%`)
        .then((res) => res.json())
        .then((data) => setMandalGeoData(data));
    } else {
      setMandalGeoData(null);
    }
  }, [selected]);

  const values = DISTRICTS.map((d) => d[metricKey] as number);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const colorFor = (v: number) => {
    let t = (v - min) / (max - min || 1);
    if (invert) t = 1 - t;
    if (t > 0.66) return "#16a34a"; // green
    if (t > 0.33) return "#d97706"; // amber
    return "#dc2626"; // red
  };

  // Update styles dynamically for Districts
  useEffect(() => {
    if (geoJsonRef.current && districtGeoData) {
      geoJsonRef.current.eachLayer((layer: any) => {
        const name = layer.feature.properties.NAME;
        const normalizedName = name === "Ananthapuram" ? "Anantapur" : name;
        const d = DISTRICTS.find((x) => x.name === normalizedName);

        if (d) {
          const v = d[metricKey] as number;
          const isSel = d.name === selected;
          // If a specific district is selected, fade out the others heavily
          const opacity = isSel ? 0.9 : (selected ? 0.15 : 0.6);
          layer.setStyle({
            fillColor: colorFor(v),
            fillOpacity: opacity,
            color: isSel ? "#ffffff" : "#444",
            weight: isSel ? 2 : 1,
          });
        }
      });
    }
  }, [selected, metricKey, districtGeoData]);

  if (!mounted) {
    return <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ height, background: "#0a0a0a" }} />;
  }

  const onEachDistrictFeature = (feature: any, layer: any) => {
    const name = feature.properties.NAME;
    const normalizedName = name === "Ananthapuram" ? "Anantapur" : name;
    const d = DISTRICTS.find((x) => x.name === normalizedName);

    if (d) {
      const v = d[metricKey] as number;
      layer.bindTooltip(
        `
        <div class="bg-card text-foreground px-2 py-1 rounded shadow-md border border-border">
          <span class="font-semibold text-sm">${d.name} District</span><br />
          Value: <span class="font-bold">${v}${unit}</span>
        </div>
        `,
        { sticky: true, className: "!bg-transparent !border-none !p-0 !shadow-none" }
      );

      layer.on({
        mouseover: (e: any) => {
          const l = e.target;
          l.setStyle({ fillOpacity: 0.9, color: "#fff", weight: 2 });
          l.bringToFront();
        },
        mouseout: (e: any) => {
          const isSel = d.name === useAppStore.getState().district;
          const hasSel = !!useAppStore.getState().district;
          const l = e.target;
          l.setStyle({
            fillOpacity: isSel ? 0.9 : (hasSel ? 0.15 : 0.6),
            color: isSel ? "#ffffff" : "#444",
            weight: isSel ? 2 : 1,
          });
        },
        click: (e: any) => {
          // If already selected, deselect to zoom out
          if (useAppStore.getState().district === d.name) {
            setDistrict("");
            if (mapRef.current) mapRef.current.setView([15.9129, 79.74], 6.5);
          } else {
            setDistrict(d.name);
            if (mapRef.current) mapRef.current.fitBounds(e.target.getBounds(), { padding: [20, 20], maxZoom: 8 });
          }
        },
      });
    } else {
      // Districts not in mock data
      layer.setStyle({ fillColor: "#111", fillOpacity: 0.5, color: "#333", weight: 1 });
      layer.bindTooltip(
        `<div class="bg-card text-muted-foreground px-2 py-1 rounded shadow-md border border-border">
          <span class="font-semibold text-sm">${name}</span><br /><span class="text-xs">No data</span>
        </div>`,
        { sticky: true, className: "!bg-transparent !border-none !p-0 !shadow-none" }
      );
    }
  };

  const onEachMandalFeature = (feature: any, layer: any) => {
    // Determine property keys dynamically based on what the GeoJSON uses
    const props = feature.properties;
    const name = props.SUB_DIST || props.NAME_3 || props.sdtname || props.Mandal || "Unknown Mandal";
    
    // For Mandals, we assign a white dash border to stand out against satellite imagery
    layer.setStyle({
      fillColor: "#ffffff",
      fillOpacity: 0.1,
      color: "#ffffff",
      weight: 1.5,
      dashArray: "4 4"
    });

    layer.bindTooltip(
      `
      <div class="bg-card text-foreground px-2 py-1 rounded shadow-md border border-border">
        <span class="font-semibold text-sm">${name} Mandal</span>
      </div>
      `,
      { sticky: true, className: "!bg-transparent !border-none !p-0 !shadow-none" }
    );

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.3, weight: 2.5 });
        l.bringToFront();
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.1, weight: 1.5 });
      }
    });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ height }}>
      <MapContainer
        center={[15.9129, 79.74]}
        zoom={6.5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
        className="z-0"
        ref={mapRef}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />

        {/* State / District Boundaries */}
        {districtGeoData && (
          <GeoJSON
            ref={geoJsonRef}
            data={districtGeoData}
            onEachFeature={onEachDistrictFeature}
          />
        )}
        
        {/* Mandal Boundaries Drill-Down */}
        {mandalGeoData && selected && (
          <GeoJSON
            key={selected} // Re-mount when district changes
            ref={mandalGeoJsonRef}
            data={mandalGeoData}
            onEachFeature={onEachMandalFeature}
          />
        )}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-md bg-card/80 px-2.5 py-1.5 text-[10px] backdrop-blur z-[400] text-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-destructive" /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Mid
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-success" /> High
        </span>
      </div>
    </div>
  );
}
