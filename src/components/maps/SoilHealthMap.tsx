import React, { useState, useEffect, useRef } from "react";
import { DISTRICTS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Download } from "lucide-react";
import rawCsvData from "@/data/District_and_State_Soil_Health_Summary_with_State.csv?raw";

// Interactive Leaflet map of Andhra Pradesh coastal districts using actual boundaries from PostgreSQL.

const ALIAS_MAP: Record<string, string> = {
  'kantamrajukonduru': 'kotamarajukondru'
};

const sanitize = (s: string) => {
  if (!s) return "";
  return s.toLowerCase()
    .replace(/\b(village|m corp|og|rural|urban|municipality|panchayat|mandal|district|corporation|town|city)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/ph/g, 'p');
};

const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: b.length + 1 }, () => new Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      if (a[i - 1] === b[j - 1]) matrix[j][i] = matrix[j - 1][i - 1];
      else matrix[j][i] = Math.min(matrix[j - 1][i - 1], matrix[j][i - 1], matrix[j - 1][i]) + 1;
    }
  }
  return matrix[b.length][a.length];
};

const getBestMatch = (searchKey: string, choices: string[]): string | null => {
  let sanitizedSearch = sanitize(searchKey);
  if (ALIAS_MAP[sanitizedSearch]) sanitizedSearch = ALIAS_MAP[sanitizedSearch];

  // 1. Exact match
  const exact = choices.find(c => sanitize(c) === sanitizedSearch || ALIAS_MAP[sanitize(c)] === sanitizedSearch);
  if (exact) return exact;

  // 2. Fuzzy match
  let bestMatch: string | null = null;
  let minDistance = Infinity;
  for (const choice of choices) {
    const dist = levenshtein(sanitizedSearch, sanitize(choice));
    const maxAllowedDist = Math.max(4, Math.floor(sanitizedSearch.length * 0.4));
    if (dist < minDistance && dist <= maxAllowedDist) {
      minDistance = dist;
      bestMatch = choice;
    }
  }
  return bestMatch;
};

export function SoilHealthMap({
  metricKey = "soilHealth",
  invert = false,
  height = 420,
  unit = "",
  showParcels = false,
  useCsvData = false,
}: {
  metricKey?: string;
  invert?: boolean;
  height?: number;
  unit?: string;
  showParcels?: boolean;
  useCsvData?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [districtGeoData, setDistrictGeoData] = useState<any>(null);
  const [mandalGeoData, setMandalGeoData] = useState<any>(null);
  const [villageGeoData, setVillageGeoData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<Record<string, any>>({});
  const [mandalMetricsData, setMandalMetricsData] = useState<Record<string, any>>({});
  const [villageMetricsData, setVillageMetricsData] = useState<Record<string, any>>({});
  const [parcelsData, setParcelsData] = useState<any[]>([]);
  
  const geoJsonRef = useRef<L.GeoJSON>(null);
  const mandalGeoJsonRef = useRef<L.GeoJSON>(null);
  const villageGeoJsonRef = useRef<L.GeoJSON>(null);
  const mapRef = useRef<L.Map>(null);

  const selected = useAppStore((s) => s.district);
  const setDistrict = useAppStore((s) => s.setDistrict);
  const selectedMandal = useAppStore((s) => s.mandal);
  const setMandal = useAppStore((s) => s.setMandal);
  const selectedVillage = useAppStore((s) => s.village);
  const setVillage = useAppStore((s) => s.setVillage);
  const searchedParcel = useAppStore((s) => s.searchedParcel);

  const targetIcon = L.divIcon({
    className: 'custom-target-icon',
    html: `<div class="relative flex h-6 w-6 items-center justify-center">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
             <span class="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-white shadow"></span>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  useEffect(() => {
    setMounted(true);
    // Fetch District boundaries from PostgreSQL Backend
    fetch("http://localhost:8000/boundaries/districts")
      .then((res) => res.json())
      .then((data) => setDistrictGeoData(data));
      
    if (useCsvData) {
      // Parse CSV data instead of fetching from API
      const lines = rawCsvData.trim().split('\n');
      const parsedData: Record<string, any> = {};
      let stateTotalData: any = null;
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length >= 6) {
          const districtName = row[1];
          if (districtName) {
            const rowData = {
              soilHealth: parseFloat(row[4]),
              "Soil Healthy %": parseFloat(row[4]),
              "Soil Unhealthy %": parseFloat(row[5]),
              "Total Parcels": parseInt(row[2], 10),
              "Avg Area (Acres)": parseFloat(row[3]),
              adoption: parseFloat(row[4]),
              deficiencyRate: parseFloat(row[5])
            };
            
            if (districtName === "ANDHRA PRADESH (STATE TOTAL)") {
              stateTotalData = rowData;
            } else {
              parsedData[districtName] = rowData;
            }
          }
        }
      }
      
      // The CSV is missing Nellore data, so we fallback to the state average
      if (!parsedData["Nellore"] && stateTotalData) {
        parsedData["Nellore"] = { ...stateTotalData };
      }
      
      setMetricsData(parsedData);
    } else {
      // Fetch real analytics data
      fetch("http://localhost:8000/map/metrics")
        .then((res) => res.json())
        .then((data) => setMetricsData(data));
    }
  }, [useCsvData]);

  // Drill-down: Fetch Mandal boundaries when a specific district is selected
  useEffect(() => {
    if (selected && selected !== "All Districts") {
      // For the API we need to match the name. 
      const apiName = selected === "Anantapur" ? "Ananthapuram" : selected;
      setMandalGeoData(null);
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
      setVillageGeoData(null);
      fetch(`http://localhost:8000/boundaries/villages?district=${encodeURIComponent(apiDistrict)}&mandal=${encodeURIComponent(selectedMandal)}`)
        .then((res) => res.json())
        .then((data) => setVillageGeoData(data));
        
      if (!useCsvData) {
        // Fetch ALL villages in the district to bypass Mandal-level mismatches between AP DB and GeoJSON boundaries
        fetch(`http://localhost:8000/map/metrics?level=village&district=${encodeURIComponent(apiDistrict)}`)
          .then((res) => res.json())
          .then((data) => setVillageMetricsData(data));
      }
    } else {
      setVillageGeoData(null);
      setVillageMetricsData({});
    }
  }, [selected, selectedMandal, useCsvData]);

  // Sync selected village name from GeoJSON to Database alias
  useEffect(() => {
    if (selectedVillage && selectedVillage !== "All Villages" && Object.keys(villageMetricsData).length > 0) {
      const bestName = getBestMatch(selectedVillage, Object.keys(villageMetricsData));
      if (bestName && bestName !== selectedVillage) {
        setVillage(bestName);
      }
    }
  }, [selectedVillage, villageMetricsData, setVillage]);

  // Sync selected mandal name from GeoJSON to Database alias
  useEffect(() => {
    if (selectedMandal && selectedMandal !== "All Mandals" && Object.keys(mandalMetricsData).length > 0) {
      const bestName = getBestMatch(selectedMandal, Object.keys(mandalMetricsData));
      if (bestName && bestName !== selectedMandal) {
        setMandal(bestName);
      }
    }
  }, [selectedMandal, mandalMetricsData, setMandal]);

  // Auto-zoom map when Village is selected from dropdown
  useEffect(() => {
    if (villageGeoJsonRef.current && selectedVillage && selectedVillage !== "All Villages") {
      let bestLayer: any = null;
      let minDistance = Infinity;
      
      villageGeoJsonRef.current.eachLayer((layer: any) => {
        const props = layer.feature?.properties;
        if (!props) return;
        const name = props.vilname11 || props.vilnam_soi || props.village_name || props.VILLAGE || props.NAME || "Unknown Village";
        
        let sanitizedSearch = sanitize(selectedVillage);
        if (ALIAS_MAP[sanitizedSearch]) sanitizedSearch = ALIAS_MAP[sanitizedSearch];
        let sanitizedName = sanitize(name);
        if (ALIAS_MAP[sanitizedName]) sanitizedName = ALIAS_MAP[sanitizedName];

        const dist = levenshtein(sanitizedSearch, sanitizedName);
        if (dist < minDistance) {
          minDistance = dist;
          bestLayer = layer;
        }
      });
      
      const maxAllowedDist = Math.max(4, Math.floor(sanitize(selectedVillage).length * 0.4));
      if (bestLayer && minDistance <= maxAllowedDist && mapRef.current) {
        setTimeout(() => {
          if (mapRef.current) mapRef.current.flyToBounds(bestLayer.getBounds(), { padding: [10, 10], duration: 1.5 });
        }, 100);
      }
    }
  }, [selectedVillage, villageGeoData]);

  // Auto-zoom map when Mandal is selected from dropdown
  useEffect(() => {
    if (mandalGeoJsonRef.current && selectedMandal && selectedMandal !== "All Mandals" && (!selectedVillage || selectedVillage === "All Villages")) {
      let bestLayer: any = null;
      let minDistance = Infinity;
      
      mandalGeoJsonRef.current.eachLayer((layer: any) => {
        const props = layer.feature?.properties;
        if (!props) return;
        const name = props.sdtname || props.NAME_3 || props.SUB_DIST || props.Mandal || props.mandal_name || props.mandal_nam || props.MANDAL || props.NAME || "Unknown Mandal";
        
        const dist = levenshtein(sanitize(selectedMandal), sanitize(name));
        if (dist < minDistance) {
          minDistance = dist;
          bestLayer = layer;
        }
      });
      
      const maxAllowedDist = Math.max(4, Math.floor(sanitize(selectedMandal).length * 0.4));
      if (bestLayer && minDistance <= maxAllowedDist && mapRef.current) {
        setTimeout(() => {
          if (mapRef.current) mapRef.current.flyToBounds(bestLayer.getBounds(), { padding: [10, 10], duration: 1.5 });
        }, 100);
      }
    }
  }, [selectedMandal, mandalGeoData, selectedVillage]);

  // Auto-zoom map to searched parcel
  useEffect(() => {
    if (searchedParcel && searchedParcel.lat && searchedParcel.lng && mapRef.current) {
      setTimeout(() => {
        if (mapRef.current) mapRef.current.flyTo([searchedParcel.lat, searchedParcel.lng], 16, { animate: true, duration: 1.5 });
      }, 500); // 500ms allows the village zoom effect to run first, so this flyTo overrides it and zooms tightly into the parcel.
    }
  }, [searchedParcel]);

  // Drill-down: Fetch Mandal metrics when a specific district is selected
  useEffect(() => {
    if (selected && selected !== "All Districts" && !useCsvData) {
      const apiDistrict = selected === "Anantapur" ? "Ananthapuram" : selected;
      fetch(`http://localhost:8000/map/metrics?level=mandal&district=${encodeURIComponent(apiDistrict)}`)
        .then((res) => res.json())
        .then((data) => setMandalMetricsData(data));
    } else {
      setMandalMetricsData({});
    }
  }, [selected, useCsvData]);

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
  const activeLegendData = 
    (selectedMandal && selectedMandal !== "All Mandals" && Object.keys(villageMetricsData).length > 0) ? villageMetricsData :
    (selected && selected !== "All Districts" && Object.keys(mandalMetricsData).length > 0) ? mandalMetricsData : 
    metricsData;
    
  const values = Object.values(activeLegendData).map((d: any) => d[metricKey] as number).filter(v => v !== undefined);
  let min = values.length > 0 ? Math.min(...values) : 0;
  let max = values.length > 0 ? Math.max(...values) : 100;

  if (min === max && values.length > 0) {
    min = Math.max(0, min - 1.5);
    max = max + 1.5;
  }

  const colorFor = (v: number) => {
    if (v === undefined || v === null) return "#333";
    
    let t = max === min ? 0.5 : (v - min) / (max - min);
    
    if (invert) t = 1 - t;
    if (t > 0.66) return "#16a34a"; // green
    if (t > 0.33) return "#d97706"; // amber
    return "#dc2626"; // red
  };

  // Update styles dynamically for Districts
  useEffect(() => {
    if (geoJsonRef.current && districtGeoData && Object.keys(metricsData).length > 0) {
      geoJsonRef.current.eachLayer((layer: any) => {
        const props = layer.feature.properties;
        const name = props.NAME || props.district_name || props.NEW_DIST || props.dtname || props.District || "Unknown";
        
        let normalizedName = name.replace(/ District/gi, "").replace(/ Dist\./gi, "").trim();
        if (normalizedName === "Ananthapuram") normalizedName = "Anantapur";
        if (normalizedName === "Sri Balaji") normalizedName = "Tirupati";
        if (normalizedName === "Y.S.R.") normalizedName = "YSR Kadapa";
        if (normalizedName === "Dr. B.R. Ambedkar Konaseema" || normalizedName === "KonaSeema") normalizedName = "Konaseema";
        if (normalizedName === "AlluriSitharama Raju") normalizedName = "Alluri Sitharama Raju";
        if (normalizedName === "Sri Satyasai") normalizedName = "Sri Sathya Sai";
        if (normalizedName === "Manyam") normalizedName = "Parvathipuram Manyam";
        if (normalizedName.toLowerCase() === "sri potti sriramulu nellore") normalizedName = "Nellore";
        
        const d = metricsData[normalizedName] || metricsData[name];

        if (d && d[metricKey] !== undefined) {
          const v = d[metricKey] as number;
          const isSel = normalizedName === selected;
          // If a specific district is selected, make it transparent to see mandals, fade out others
          const opacity = isSel ? 0.1 : (selected ? 0.8 : 0.6);
          layer.setStyle({
            fillColor: isSel ? "transparent" : colorFor(v),
            fillOpacity: opacity,
            color: isSel ? "#38bdf8" : "#ffffff", // changed from #444 to #ffffff for better visibility
            weight: isSel ? 3 : 1.5, // slightly thicker line for unselected districts
            dashArray: isSel ? "" : "3 3", // added subtle dash for unselected boundaries
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
    const props = feature.properties;
    const name = props.NAME || props.district_name || props.NEW_DIST || props.dtname || props.District || "Unknown";
    
    let normalizedName = name.replace(/ District/gi, "").replace(/ Dist\./gi, "").trim();
    if (normalizedName === "Ananthapuram") normalizedName = "Anantapur";
    if (normalizedName === "Sri Balaji") normalizedName = "Tirupati";
    if (normalizedName === "Y.S.R.") normalizedName = "YSR Kadapa";
    if (normalizedName === "Dr. B.R. Ambedkar Konaseema" || normalizedName === "KonaSeema") normalizedName = "Konaseema";
    if (normalizedName === "AlluriSitharama Raju") normalizedName = "Alluri Sitharama Raju";
    if (normalizedName === "Sri Satyasai") normalizedName = "Sri Sathya Sai";
    if (normalizedName === "Manyam") normalizedName = "Parvathipuram Manyam";
    if (normalizedName.toLowerCase() === "sri potti sriramulu nellore") normalizedName = "Nellore";
    
    const d = metricsData[normalizedName] || metricsData[name];

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
            ref={villageGeoJsonRef}
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
        {/* Searched Parcel Target Pin */}
        {searchedParcel && searchedParcel.lat && searchedParcel.lng && (
          <Marker position={[searchedParcel.lat, searchedParcel.lng]} icon={targetIcon}>
            <Popup className="custom-popup">
              <div className="bg-card text-foreground rounded shadow-md text-xs p-1">
                <p className="font-bold text-sm border-b border-border/50 pb-1 mb-1 text-primary">{searchedParcel.id}</p>
                <p><span className="text-muted-foreground font-semibold">Farmer:</span> {searchedParcel.farmer}</p>
                <p><span className="text-muted-foreground font-semibold">Crop:</span> {searchedParcel.crop}</p>
                <p><span className="text-muted-foreground font-semibold">Health Score:</span> {searchedParcel.health}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Dynamic Color Legend */}
      <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-1.5 rounded-lg bg-card/90 px-3 py-2.5 text-xs backdrop-blur border border-border shadow-lg text-foreground w-56">
        <div className="flex justify-between font-bold text-sm">
          <span className="truncate pr-2">{metricKey}</span>
          <span className="text-[10px] text-muted-foreground self-end pb-0.5">{invert ? "Lower is Better" : "Higher is Better"}</span>
        </div>
        <div 
          className="h-3 w-full rounded shadow-inner" 
          style={{
            background: invert 
              ? "linear-gradient(to right, hsl(120, 80%, 45%), hsl(60, 80%, 45%), hsl(0, 80%, 45%))"
              : "linear-gradient(to right, hsl(0, 80%, 45%), hsl(60, 80%, 45%), hsl(120, 80%, 45%))"
          }}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
          <span>{min.toFixed(1)}</span>
          <span>{((min + max) / 2).toFixed(1)}</span>
          <span>{max.toFixed(1)}</span>
        </div>
      </div>

      {/* Detail Sidebar Popup */}
      {selected && (
        (() => {
          const activeLevelName = 
            (selectedVillage && selectedVillage !== "All Villages") ? selectedVillage : 
            (selectedMandal && selectedMandal !== "All Mandals") ? selectedMandal : 
            selected;
            
          const activeLevelType = 
            (selectedVillage && selectedVillage !== "All Villages") ? "Village" : 
            (selectedMandal && selectedMandal !== "All Mandals") ? "Mandal" : 
            "District";
            
          const fallbackMetrics = {
            "Total Parcels": 0,
            soilHealth: 0,
            "Soil Healthy %": 0,
            "Soil Unhealthy %": 0,
            pH: 0,
            EC: 0,
            "Organic Carbon": 0,
            Nitrogen: 0,
            Phosphorus: 0,
            Potassium: 0,
            Iron: 0,
            Zinc: 0,
            Copper: 0,
            Boron: 0
          };

          const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/th/g, 't').replace(/dh/g, 'd').replace(/ph/g, 'p');
          
          const ALIAS_MAP: Record<string, string> = {
            'kantamrajukonduru': 'kotamarajukondru'
          };

          const activeMetricsData = 
            (selectedVillage && selectedVillage !== "All Villages") ? (villageMetricsData[selectedVillage] || fallbackMetrics) : 
            (selectedMandal && selectedMandal !== "All Mandals") ? (mandalMetricsData[selectedMandal] || fallbackMetrics) : 
            (metricsData[selected] || fallbackMetrics);
            
          if (!activeMetricsData) return null;

          const exportCSV = () => {
            const filteredEntries = Object.entries(activeMetricsData).filter(([key]) => !["soilHealth", "Avg Area (Acres)", "adoption", "deficiencyRate"].includes(key));
            const headers = filteredEntries.map(([k]) => `"${k}"`).join(",");
            const values = filteredEntries.map(([_, v]) => `"${typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(2) : v}"`).join(",");
            const csv = `${headers}\n${values}`;
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${activeLevelName.replace(/\s+/g, '_')}_${activeLevelType}_Profile.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };

          return (
            <div className="absolute right-0 top-0 z-[500] h-full w-64 bg-card/95 backdrop-blur-md border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{activeLevelName}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{activeLevelType} Profile</p>
                </div>
                <button 
                  onClick={() => {
                    if (selectedVillage && selectedVillage !== "All Villages") {
                      setVillage("All Villages");
                    } else if (selectedMandal && selectedMandal !== "All Mandals") {
                      setMandal("All Mandals");
                    } else {
                      setDistrict("");
                      if (mapRef.current) mapRef.current.setView([15.9129, 79.74], 6.5);
                    }
                  }}
                  className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs custom-scrollbar">
                {Object.entries(activeMetricsData)
                  .filter(([key]) => !["soilHealth", "Avg Area (Acres)", "adoption", "deficiencyRate"].includes(key))
                  .map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground font-medium">{key}</span>
                    <span className="font-bold text-foreground bg-background px-1.5 py-0.5 rounded border border-border/50">
                      {typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(2) : val as any}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border bg-muted/30">
                <button 
                  onClick={exportCSV}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md text-xs font-semibold transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
