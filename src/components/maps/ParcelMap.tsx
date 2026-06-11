import React, { useState, useEffect, useRef } from "react";
import { DISTRICTS } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";

// Helper to mathematically generate a scale-accurate polygon bounding a point based on acreage
const generatePlotPolygon = (lat: number, lng: number, acreage: number, seedStr: string): [number, number][] => {
  // 1 acre = ~4046.86 square meters
  const areaSqMeters = acreage * 4046.86;
  const sideMeters = Math.sqrt(areaSqMeters);
  
  // 1 degree lat is roughly 111,320 meters
  const latOffset = (sideMeters / 2) / 111320;
  // 1 degree lng scales with cos(lat)
  const lngOffset = (sideMeters / 2) / (111320 * Math.cos(lat * (Math.PI / 180)));
  
  // Create a deterministic aspect ratio to make plots look like real varying fields
  const seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const aspect = 0.5 + ((seed % 100) / 100); // Between 0.5 and 1.5
  
  const hLat = latOffset * aspect;
  const hLng = lngOffset / aspect;
  
  return [
    [lat - hLat, lng - hLng],
    [lat + hLat, lng - hLng],
    [lat + hLat, lng + hLng],
    [lat - hLat, lng + hLng]
  ];
};

// Interactive Leaflet map of Andhra Pradesh coastal districts using actual boundaries from PostgreSQL.
export function ParcelMap({
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
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  // Fetch AI Crop Prediction based on selected parcel's soil chemistry
  const { data: cropPrediction, isLoading: isPredicting } = useQuery({
    queryKey: ["parcel-crop-prediction", selectedParcel?.id],
    queryFn: () => {
      if (!selectedParcel || !selectedParcel.analytics) return null;
      
      const payload = {
        n: selectedParcel.analytics.Nitrogen,
        p: selectedParcel.analytics.Phosphorus,
        k: selectedParcel.analytics.Potassium,
        ph: selectedParcel.analytics.pH,
        temperature: 28, // generic default for NTR
        humidity: 80,
        rainfall: 105
      };
      
      return fetch("http://localhost:8000/recommend/crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(r => r.json());
    },
    enabled: !!selectedParcel,
  });

  // Fetch AI Fertilizer Recommendation based on current crop and soil health
  const { data: fertPrediction, isLoading: isFertPredicting } = useQuery({
    queryKey: ["parcel-fert-prediction", selectedParcel?.id],
    queryFn: () => {
      if (!selectedParcel || !selectedParcel.analytics) return null;
      
      const payload = {
        crop: selectedParcel.crop,
        soil_health: `N:${selectedParcel.analytics.Nitrogen}, P:${selectedParcel.analytics.Phosphorus}, K:${selectedParcel.analytics.Potassium}, pH:${selectedParcel.analytics.pH}`,
        satellite_unified_health_index_pct: selectedParcel.health
      };
      
      return fetch("http://localhost:8000/recommend/fertilizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(r => r.json());
    },
    enabled: !!selectedParcel,
  });
  
  const geoJsonRef = useRef<L.GeoJSON>(null);
  const mandalGeoJsonRef = useRef<L.GeoJSON>(null);
  const mapRef = useRef<L.Map>(null);

  const selected = useAppStore((s) => s.district);
  const setDistrict = useAppStore((s) => s.setDistrict);
  const selectedMandal = useAppStore((s) => s.mandal);
  const setMandal = useAppStore((s) => s.setMandal);
  const selectedVillage = useAppStore((s) => s.village);

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
      if (selectedVillage && selectedVillage !== "All Villages") {
        url += `&village=${encodeURIComponent(selectedVillage)}`;
      }
      fetch(url)
        .then((res) => res.json())
        .then((data) => setParcelsData(data));
    } else {
      setParcelsData([]);
    }
  }, [selected, selectedMandal, selectedVillage, showParcels]);

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
        let normalizedName = name === "Ananthapuram" ? "Anantapur" : name;
        if (normalizedName === "NTR District") normalizedName = "NTR";
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

  // Automated Zoom effect when store selections change
  useEffect(() => {
    if (!mapRef.current) return;
    
    // 1. Zoom to Village
    if (selectedVillage && selectedVillage !== "All Villages" && villageGeoData) {
      const feature = villageGeoData.features?.find((f: any) => {
        const props = f.properties;
        const name = props.vilname11 || props.vilnam_soi || props.village_name || props.VILLAGE || props.NAME;
        return name === selectedVillage;
      });
      if (feature) {
        const bounds = L.geoJSON(feature).getBounds();
        if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [10, 10], maxZoom: 14 });
      }
      return;
    }
    
    // 2. Zoom to Mandal
    if (selectedMandal && selectedMandal !== "All Mandals" && mandalGeoData) {
      const feature = mandalGeoData.features?.find((f: any) => {
        const props = f.properties;
        const name = props.sdtname || props.NAME_3 || props.SUB_DIST || props.Mandal;
        return name === selectedMandal;
      });
      if (feature) {
        const bounds = L.geoJSON(feature).getBounds();
        if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [10, 10], maxZoom: 12 });
      }
      return;
    }
    
    // 3. Zoom to District
    if (selected && selected !== "All Districts" && districtGeoData) {
      const feature = districtGeoData.features?.find((f: any) => {
        const name = f.properties.NAME;
        let nName = name === "Ananthapuram" ? "Anantapur" : name;
        if (nName === "NTR District") nName = "NTR";
        return nName === selected;
      });
      if (feature) {
        const bounds = L.geoJSON(feature).getBounds();
        if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [20, 20], maxZoom: 8 });
      }
      return;
    }
    
    // 4. Reset Zoom (State-wide)
    if (!selected || selected === "All Districts") {
      mapRef.current.setView([15.9129, 79.74], 6.5);
    }
  }, [selected, selectedMandal, selectedVillage, districtGeoData, mandalGeoData, villageGeoData]);

  let targetLevel = "district";
  let targetName = selected;
  if (selectedVillage && selectedVillage !== "All Villages") {
    targetLevel = "village";
    targetName = selectedVillage;
  } else if (selectedMandal && selectedMandal !== "All Mandals") {
    targetLevel = "mandal";
    targetName = selectedMandal;
  }

  const [targetMetrics, setTargetMetrics] = useState<any>(null);

  useEffect(() => {
    if (!targetName || targetName === "All Districts") {
      setTargetMetrics(null);
      return;
    }
    
    let url = `http://localhost:8000/map/metrics?level=${targetLevel}`;
    if (selected && selected !== "All Districts") url += `&district=${encodeURIComponent(selected === "Anantapur" ? "Ananthapuram" : selected)}`;
    if (selectedMandal && selectedMandal !== "All Mandals") url += `&mandal=${encodeURIComponent(selectedMandal)}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const key = Object.keys(data).find(k => k.toLowerCase() === targetName.toLowerCase()) || targetName;
        setTargetMetrics(data[key]);
      })
      .catch(err => console.error(err));
  }, [targetLevel, targetName, selected, selectedMandal]);

  if (!mounted) {
    return <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ height, background: "#0a0a0a" }} />;
  }

  const onEachDistrictFeature = (feature: any, layer: any) => {
    const name = feature.properties.NAME;
    let normalizedName = name === "Ananthapuram" ? "Anantapur" : name;
    if (normalizedName === "NTR District") normalizedName = "NTR";
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
    const name = props.sdtname || props.NAME_3 || props.SUB_DIST || props.Mandal || "Unknown Mandal";
    
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

        {/* Parcel Polygons */}
        {showParcels && parcelsData && parcelsData.map((parcel: any) => (
          <Polygon
            key={parcel.id}
            positions={generatePlotPolygon(parcel.lat, parcel.lng, parcel.acreage, parcel.id)}
            pane="markerPane"
            pathOptions={{
              color: selectedParcel?.id === parcel.id ? "#FFD700" : "#ffffff",
              weight: selectedParcel?.id === parcel.id ? 2 : 1,
              fillColor: colorFor(parcel.health),
              fillOpacity: selectedParcel?.id === parcel.id ? 1 : 0.8
            }}
            eventHandlers={{
              click: () => setSelectedParcel(parcel)
            }}
          />
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

      {/* Detail Sidebar Popup */}
      {targetName && targetName !== "All Districts" && targetMetrics && (
        <div className="absolute right-0 top-0 z-[500] h-full w-64 bg-card/95 backdrop-blur-md border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            <div>
              <h3 className="font-bold text-sm text-foreground">{targetName}</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{targetLevel} Profile</p>
            </div>
            <button 
              onClick={() => {
                if (targetLevel === "village") {
                  useAppStore.getState().setVillage("All Villages");
                } else if (targetLevel === "mandal") {
                  useAppStore.getState().setMandal("All Mandals");
                } else {
                  useAppStore.getState().setDistrict("");
                  if (mapRef.current) mapRef.current.setView([15.9129, 79.74], 6.5);
                }
              }}
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs custom-scrollbar">
            {Object.entries(targetMetrics).filter(([key]) => !key.endsWith('_stats')).map(([key, val]) => (
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
      {/* Parcel Details Sidebar */}
      {selectedParcel && (
        <div className="absolute right-0 top-0 z-[510] h-full w-72 bg-card/95 backdrop-blur-md border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div>
              <h3 className="font-bold text-lg text-foreground">{selectedParcel.id}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Parcel Profile</p>
            </div>
            <button 
              onClick={() => setSelectedParcel(null)}
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/40">
                <span className="text-sm text-muted-foreground font-medium">Farmer</span>
                <span className="text-sm font-semibold">{selectedParcel.farmer}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/40">
                <span className="text-sm text-muted-foreground font-medium">Village</span>
                <span className="text-sm font-semibold">{selectedParcel.village}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/40">
                <span className="text-sm text-muted-foreground font-medium">Crop</span>
                <span className="text-sm font-semibold">{selectedParcel.crop}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/40">
                <span className="text-sm text-muted-foreground font-medium">Area</span>
                <span className="text-sm font-semibold">{selectedParcel.acreage} Acres</span>
              </div>
              {selectedParcel.analytics?.Irrigation_Type && (
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/40">
                  <span className="text-sm text-muted-foreground font-medium">Irrigation</span>
                  <span className="text-sm font-semibold">{selectedParcel.analytics.Irrigation_Type}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/40">
                <span className="text-sm text-muted-foreground font-medium">Health Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorFor(selectedParcel.health) }} />
                  <span className="text-sm font-semibold">{selectedParcel.health}% ({selectedParcel.risk})</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-bold text-foreground mb-3">Vegetation Indices</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 rounded bg-muted/30 border border-border/50">
                  <span className="text-xs text-muted-foreground font-medium mb-1">NDVI</span>
                  <span className="font-semibold text-sm">{selectedParcel.ndvi?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded bg-muted/30 border border-border/50">
                  <span className="text-xs text-muted-foreground font-medium mb-1">EVI</span>
                  <span className="font-semibold text-sm">{selectedParcel.evi?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded bg-muted/30 border border-border/50">
                  <span className="text-xs text-muted-foreground font-medium mb-1">NDRE</span>
                  <span className="font-semibold text-sm">{selectedParcel.ndre?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-bold text-foreground mb-3">Soil Chemistry</h4>
              {selectedParcel.analytics ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col p-2.5 rounded bg-muted/20 border border-border/50">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Nitrogen (N)</span>
                    <span className="font-semibold text-sm">{selectedParcel.analytics.Nitrogen} <span className="text-xs font-normal text-muted-foreground">kg/ha</span></span>
                  </div>
                  <div className="flex flex-col p-2.5 rounded bg-muted/20 border border-border/50">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Phosphorus (P)</span>
                    <span className="font-semibold text-sm">{selectedParcel.analytics.Phosphorus} <span className="text-xs font-normal text-muted-foreground">kg/ha</span></span>
                  </div>
                  <div className="flex flex-col p-2.5 rounded bg-muted/20 border border-border/50">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Potassium (K)</span>
                    <span className="font-semibold text-sm">{selectedParcel.analytics.Potassium} <span className="text-xs font-normal text-muted-foreground">kg/ha</span></span>
                  </div>
                  <div className="flex flex-col p-2.5 rounded bg-muted/20 border border-border/50">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">pH Level</span>
                    <span className="font-semibold text-sm">{selectedParcel.analytics.pH}</span>
                  </div>
                  <div className="flex flex-col p-2.5 rounded bg-muted/20 border border-border/50">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Org. Carbon</span>
                    <span className="font-semibold text-sm">{selectedParcel.analytics.Organic_Carbon}%</span>
                  </div>
                  <div className="flex flex-col p-2.5 rounded bg-muted/20 border border-border/50">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Soil Type</span>
                    <span className="font-semibold text-sm">{selectedParcel.analytics.Soil_Type}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Detailed soil chemistry not available.</p>
              )}
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-bold text-foreground mb-3">AI Crop Prediction</h4>
              {isPredicting ? (
                <div className="p-4 rounded-md border border-border/50 bg-muted/20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-xs font-medium text-muted-foreground">Analyzing soil chemistry...</span>
                </div>
              ) : cropPrediction ? (
                (() => {
                  const conf = cropPrediction.confidence;
                  const tone = conf >= 75 ? "success" : conf >= 40 ? "warning" : "destructive";
                  
                  const themeClasses = {
                    success: { bg: "bg-success/10", border: "border-success/30", text: "text-success-foreground", badge: "bg-success/20" },
                    warning: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning-foreground", badge: "bg-warning/20" },
                    destructive: { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive-foreground", badge: "bg-destructive/20" }
                  }[tone];

                  return (
                    <div className={`p-3 rounded-md border flex flex-col gap-2 ${themeClasses.border} ${themeClasses.bg}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${themeClasses.text}`}>
                          {conf < 40 ? "Low Confidence" : "Recommended Crop"}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${themeClasses.text} ${themeClasses.badge}`}>
                          {conf}% Match
                        </span>
                      </div>
                      <span className="text-lg font-black text-foreground capitalize">{cropPrediction.recommended_crop}</span>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        Prediction based on field's exact Nitrogen ({selectedParcel.analytics.Nitrogen}), Phosphorus ({selectedParcel.analytics.Phosphorus}), Potassium ({selectedParcel.analytics.Potassium}), and pH ({selectedParcel.analytics.pH}) levels.
                      </p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-xs text-muted-foreground">No prediction data available.</p>
              )}
            </div>

            <div className="pt-4 border-t border-border/50 pb-6">
              <h4 className="text-sm font-bold text-foreground mb-3">AI Fertilizer Prescription</h4>
              {isFertPredicting ? (
                <div className="p-4 rounded-md border border-border/50 bg-muted/20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-xs font-medium text-muted-foreground">Generating prescription...</span>
                </div>
              ) : fertPrediction ? (
                <div className="p-3 rounded-md border border-primary/30 bg-primary/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Current Crop: {selectedParcel.crop}</span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{fertPrediction.confidence}% Conf.</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-foreground">Apply {fertPrediction.fertilizer_name}</span>
                      <span className="text-xs font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">{fertPrediction.dosage_kg_per_acre} kg/acre</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      <strong>Method:</strong> {fertPrediction.application_method} during {fertPrediction.timing} stage.
                    </span>
                    <div className="mt-2 p-2 bg-background/50 border border-border/50 rounded text-[10px] leading-relaxed text-muted-foreground italic">
                      "Because {fertPrediction.reason.toLowerCase()}."
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No prescription available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
