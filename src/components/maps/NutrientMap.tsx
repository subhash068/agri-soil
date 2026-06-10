import React, { useState, useEffect, useRef } from "react";
import { DISTRICTS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from "react-leaflet";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";

// Interactive Leaflet map of Andhra Pradesh coastal districts using actual boundaries from PostgreSQL.
export function NutrientMap({
  metricKey = "soilHealth",
  invert = false,
  height = 420,
  unit = "",
  showParcels = false,
}: {
  metricKey?: string;
  invert?: boolean;
  height?: number;
  unit?: string;
  showParcels?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [districtGeoData, setDistrictGeoData] = useState<any>(null);
  const [mandalGeoData, setMandalGeoData] = useState<any>(null);
  const [villageGeoData, setVillageGeoData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<Record<string, any>>({});
  const [parcelsData, setParcelsData] = useState<any[]>([]);
  
  const geoJsonRef = useRef<L.GeoJSON>(null);
  const mandalGeoJsonRef = useRef<L.GeoJSON>(null);
  const mapRef = useRef<L.Map>(null);

  const selected = useAppStore((s) => s.district);
  const setDistrict = useAppStore((s) => s.setDistrict);
  const selectedMandal = useAppStore((s) => s.mandal);
  const setMandal = useAppStore((s) => s.setMandal);

  useEffect(() => {
    setMounted(true);
    // Fetch District boundaries from PostgreSQL Backend
    fetch("http://localhost:8000/boundaries/districts")
      .then((res) => res.json())
      .then((data) => setDistrictGeoData(data));
      
    // Fetch real analytics data
    fetch("http://localhost:8000/map/metrics")
      .then((res) => res.json())
      .then((data) => setMetricsData(data));
  }, []);

  // Drill-down: Fetch Mandal boundaries when a specific district is selected
  useEffect(() => {
    if (selected && selected !== "All Districts") {
      // For the API we need to match the name. 
      const apiName = selected === "Anantapur" ? "Ananthapuram" : selected;
      fetch(`http://localhost:8000/boundaries/mandals?district=${encodeURIComponent(apiName)}`)
        .then((res) => res.json())
        .then((data) => setMandalGeoData(data));
    } else {
      setMandalGeoData(null);
    }
  }, [selected]);

  // Drill-down: Fetch Village boundaries when a specific mandal is selected
  useEffect(() => {
    if (selected && selected !== "All Districts" && selectedMandal && selectedMandal !== "All Mandals") {
      const apiDistrict = selected === "Anantapur" ? "Ananthapuram" : selected;
      fetch(`http://localhost:8000/boundaries/villages?district=${encodeURIComponent(apiDistrict)}&mandal=${encodeURIComponent(selectedMandal)}`)
        .then((res) => res.json())
        .then((data) => setVillageGeoData(data));
    } else {
      setVillageGeoData(null);
    }
  }, [selected, selectedMandal]);

  // Fetch Parcels to plot as points
  useEffect(() => {
    if (showParcels && selected && selected !== "All Districts") {
      const apiDistrict = selected === "Anantapur" ? "Ananthapuram" : selected;
      let url = `http://localhost:8000/parcels?district=${encodeURIComponent(apiDistrict)}`;
      if (selectedMandal && selectedMandal !== "All Mandals") {
        url += `&mandal=${encodeURIComponent(selectedMandal)}`;
      }
      fetch(url)
        .then((res) => res.json())
        .then((data) => setParcelsData(data));
    } else {
      setParcelsData([]);
    }
  }, [selected, selectedMandal, showParcels]);

  // Extract all values for the current metric to determine min/max for color scale
  const values = Object.values(metricsData).map((d) => d[metricKey] as number).filter(v => v !== undefined);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 100;

  const colorFor = (v: number) => {
    if (v === undefined || v === null) return "#333";
    let t = (v - min) / (max - min || 1);
    if (invert) t = 1 - t;
    if (t > 0.66) return "#16a34a"; // green
    if (t > 0.33) return "#d97706"; // amber
    return "#dc2626"; // red
  };

  // Update styles dynamically for Districts
  useEffect(() => {
    if (geoJsonRef.current && districtGeoData && Object.keys(metricsData).length > 0) {
      geoJsonRef.current.eachLayer((layer: any) => {
        const name = layer.feature.properties.NAME;
        const normalizedName = name === "Ananthapuram" ? "Anantapur" : name;
        const d = metricsData[normalizedName];

        if (d && d[metricKey] !== undefined) {
          const v = d[metricKey] as number;
          const isSel = normalizedName === selected;
          // If a specific district is selected, make it transparent to see mandals, fade out others
          const opacity = isSel ? 0.1 : (selected ? 0.8 : 0.6);
          layer.setStyle({
            fillColor: isSel ? "transparent" : colorFor(v),
            fillOpacity: opacity,
            color: isSel ? "#0ea5e9" : "#444",
            weight: isSel ? 3 : 1,
          });
          if (!isSel && selected) {
             layer.setStyle({ fillOpacity: 0.2 }); // Fade unselected instead of darkening
          }
        }
      });
    }
  }, [selected, metricKey, districtGeoData, metricsData]);

  if (!mounted) {
    return <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ height, background: "#0a0a0a" }} />;
  }

  const onEachDistrictFeature = (feature: any, layer: any) => {
    const name = feature.properties.NAME;
    const normalizedName = name === "Ananthapuram" ? "Anantapur" : name;
    const d = metricsData[normalizedName];

    if (d && d[metricKey] !== undefined) {
      const v = d[metricKey] as number;
      const displayVal = Number.isInteger(v) ? v : v.toFixed(2);
      layer.bindTooltip(
        `
        <div class="bg-card text-foreground px-2 py-1 rounded shadow-md border border-border">
          <span class="font-semibold text-sm">${normalizedName} District</span><br />
          Value: <span class="font-bold">${displayVal}${unit}</span>
        </div>
        `,
        { sticky: true, className: "!bg-transparent !border-none !p-0 !shadow-none" }
      );

      layer.on({
        mouseover: (e: any) => {
          const isSel = normalizedName === useAppStore.getState().district;
          if (isSel) return; // Don't obscure mandals when hovering over selected district
          const l = e.target;
          l.setStyle({ fillOpacity: 0.9, color: "#fff", weight: 2 });
          l.bringToFront();
        },
        mouseout: (e: any) => {
          const isSel = normalizedName === useAppStore.getState().district;
          const hasSel = !!useAppStore.getState().district;
          const l = e.target;
          const opacity = isSel ? 0.1 : (hasSel ? 0.8 : 0.6);
          l.setStyle({
            fillColor: isSel ? "transparent" : colorFor(v),
            fillOpacity: opacity,
            color: isSel ? "#0ea5e9" : "#444",
            weight: isSel ? 3 : 1,
          });
          if (isSel) {
            l.bringToBack();
          }
        },
        click: (e: any) => {
          // If already selected, deselect to zoom out
          if (useAppStore.getState().district === normalizedName) {
            setDistrict("");
            if (mapRef.current) mapRef.current.setView([15.9129, 79.74], 6.5);
          } else {
            setDistrict(normalizedName);
            if (mapRef.current) mapRef.current.fitBounds(e.target.getBounds(), { padding: [20, 20], maxZoom: 8 });
          }
        },
      });
    } else {
      // Districts not in DB
      layer.setStyle({ fillColor: "transparent", fillOpacity: 0, color: "#ffffff", weight: 1.5, dashArray: "3 3" });
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
        const isSel = useAppStore.getState().mandal === name;
        if (isSel) return; // Don't obscure villages when hovering over selected mandal
        const l = e.target;
        l.setStyle({ fillOpacity: 0.3, weight: 2.5 });
        l.bringToFront();
      },
      mouseout: (e: any) => {
        const isSel = useAppStore.getState().mandal === name;
        const l = e.target;
        l.setStyle({ fillOpacity: isSel ? 0.0 : 0.1, weight: 1.5 });
        if (isSel) l.bringToBack();
      },
      click: (e: any) => {
        // Stop propagation so we don't accidentally trigger the district click
        e.originalEvent.stopPropagation();
        if (useAppStore.getState().mandal === name) {
          setMandal("All Mandals");
        } else {
          setMandal(name);
          if (mapRef.current) mapRef.current.fitBounds(e.target.getBounds(), { padding: [10, 10], maxZoom: 12 });
        }
      }
    });
  };

  const onEachVillageFeature = (feature: any, layer: any) => {
    const props = feature.properties;
    const name = props.vilname11 || props.vilnam_soi || props.village_name || props.VILLAGE || props.NAME || "Unknown Village";
    
    layer.setStyle({
      fillColor: "#0ea5e9",
      fillOpacity: 0.15,
      color: "#38bdf8",
      weight: 1.5,
      dashArray: "2 4"
    });

    layer.bindTooltip(
      `
      <div class="bg-card text-foreground px-2 py-1 rounded shadow-md border border-border">
        <span class="font-semibold text-sm">${name} Village</span>
      </div>
      `,
      { sticky: true, className: "!bg-transparent !border-none !p-0 !shadow-none" }
    );

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.35, weight: 2.5 });
        l.bringToFront();
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.15, weight: 1.5 });
      },
      click: (e: any) => {
        e.originalEvent.stopPropagation();
        if (useAppStore.getState().village === name) {
          useAppStore.getState().setVillage("All Villages");
        } else {
          useAppStore.getState().setVillage(name);
          if (mapRef.current) mapRef.current.fitBounds(e.target.getBounds(), { padding: [10, 10], maxZoom: 14 });
        }
      }
    });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ height }}>
      <MapContainer
        center={[15.9129, 79.74]}
        zoom={6.5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
        className="z-0"
        ref={mapRef}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />
        {/* Adds Labels over the Satellite Imagery */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        {districtGeoData && Object.keys(metricsData).length > 0 && (
          <GeoJSON
            key={`${metricKey}-${Object.keys(metricsData).length}`}
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

        {/* Village Boundaries Drill-Down */}
        {villageGeoData && selectedMandal && selectedMandal !== "All Mandals" && (
          <GeoJSON
            key={`${selected}-${selectedMandal}`} // Re-mount when mandal changes
            data={villageGeoData}
            onEachFeature={onEachVillageFeature}
          />
        )}

        {/* Parcel Points */}
        {showParcels && parcelsData && parcelsData.map((parcel: any) => (
          <CircleMarker
            key={parcel.id}
            center={[parcel.lat, parcel.lng]}
            radius={5}
            pathOptions={{
              color: "#ffffff",
              weight: 1,
              fillColor: colorFor(parcel.health),
              fillOpacity: 0.8
            }}
          >
            <Popup className="custom-popup">
              <div className="bg-card text-foreground rounded shadow-md text-xs p-1">
                <p className="font-bold text-sm border-b border-border/50 pb-1 mb-1">{parcel.id}</p>
                <p><span className="text-muted-foreground font-semibold">Farmer:</span> {parcel.farmer}</p>
                <p><span className="text-muted-foreground font-semibold">Crop:</span> {parcel.crop}</p>
                <p><span className="text-muted-foreground font-semibold">Area:</span> {parcel.acreage} Acres</p>
                <p><span className="text-muted-foreground font-semibold">Health:</span> {parcel.health}% ({parcel.risk})</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
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

      {/* District Detail Sidebar Popup */}
      {selected && metricsData[selected] && (
        <div className="absolute right-0 top-0 z-[500] h-full w-64 bg-card/95 backdrop-blur-md border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            <div>
              <h3 className="font-bold text-sm text-foreground">{selected}</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">District Profile</p>
            </div>
            <button 
              onClick={() => {
                useAppStore.getState().setDistrict("");
                if (mapRef.current) mapRef.current.setView([15.9129, 79.74], 6.5);
              }}
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs custom-scrollbar">
            {Object.entries(metricsData[selected]).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center border-b border-border/40 pb-2">
                <span className="text-muted-foreground font-medium">{key}</span>
                <span className="font-bold text-foreground bg-background px-1.5 py-0.5 rounded border border-border/50">
                  {typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(2) : val as any}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
