import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { MultiLine, Bars } from "@/components/charts/Charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CloudSun, Thermometer, Droplets, Wind, Sparkles, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/weather")({
  head: () => ({ meta: [{ title: "Weather Intelligence — AgriSoil AI" }] }),
  component: Weather,
});

interface ForecastDay {
  day: string;
  temp: string;
  humidity: string;
  wind: string;
  rain: string;
  condition: string;
}

interface DistrictWeather {
  temp: string;
  humidity: string;
  moisture: string;
  moistureDelta: number;
  rainfall: string;
  rainfallDelta: number;
  windSpeed: string;
  alert: string;
  alertType: "info" | "warning" | "success";
  forecast: ForecastDay[];
  weatherSeries: { month: string; temp: number; humidity: number; rainfall: number; moisture: number }[];
}

const DISTRICT_WEATHER_DATA: Record<string, DistrictWeather> = {
  NTR: {
    temp: "31°C",
    humidity: "72%",
    moisture: "44%",
    moistureDelta: 2.1,
    rainfall: "148 mm",
    rainfallDelta: 12.0,
    windSpeed: "12 km/h",
    alert: "Optimal soil moisture (44%) and forecasted light rain make this a great window for Nitrogen side-dressing (Urea splitting).",
    alertType: "success",
    forecast: [
      { day: "Mon", temp: "32°C", humidity: "65%", wind: "10 km/h", rain: "12 mm", condition: "Light Rain" },
      { day: "Tue", temp: "31°C", humidity: "70%", wind: "12 km/h", rain: "24 mm", condition: "Moderate Rain" },
      { day: "Wed", temp: "30°C", humidity: "78%", wind: "14 km/h", rain: "45 mm", condition: "Thundershowers" },
      { day: "Thu", temp: "31°C", humidity: "72%", wind: "11 km/h", rain: "8 mm", condition: "Light Showers" },
      { day: "Fri", temp: "32°C", humidity: "60%", wind: "9 km/h", rain: "0 mm", condition: "Clear Sky" },
    ],
    weatherSeries: [
      { month: "Jan", temp: 26, humidity: 55, rainfall: 5, moisture: 30 },
      { month: "Feb", temp: 28, humidity: 58, rainfall: 10, moisture: 28 },
      { month: "Mar", temp: 32, humidity: 60, rainfall: 15, moisture: 25 },
      { month: "Apr", temp: 35, humidity: 62, rainfall: 20, moisture: 22 },
      { month: "May", temp: 37, humidity: 65, rainfall: 45, moisture: 35 },
      { month: "Jun", temp: 34, humidity: 75, rainfall: 120, moisture: 48 },
      { month: "Jul", temp: 31, humidity: 82, rainfall: 220, moisture: 60 },
      { month: "Aug", temp: 30, humidity: 80, rainfall: 210, moisture: 58 },
      { month: "Sep", temp: 31, humidity: 78, rainfall: 160, moisture: 52 },
      { month: "Oct", temp: 31, humidity: 72, rainfall: 90, moisture: 45 },
      { month: "Nov", temp: 29, humidity: 65, rainfall: 35, moisture: 38 },
      { month: "Dec", temp: 27, humidity: 58, rainfall: 8, moisture: 32 },
    ],
  },
  Anantapur: {
    temp: "38°C",
    humidity: "35%",
    moisture: "22%",
    moistureDelta: -4.5,
    rainfall: "12 mm",
    rainfallDelta: -18.0,
    windSpeed: "22 km/h",
    alert: "High heat (38°C) and extreme dry soil moisture (22%). Delay fertilizer applications to avoid volatilization and crop burn. Irrigate immediately.",
    alertType: "warning",
    forecast: [
      { day: "Mon", temp: "38°C", humidity: "38%", wind: "22 km/h", rain: "0 mm", condition: "Dry / Sunny" },
      { day: "Tue", temp: "39°C", humidity: "35%", wind: "24 km/h", rain: "0 mm", condition: "Sunny" },
      { day: "Wed", temp: "40°C", humidity: "32%", wind: "20 km/h", rain: "0 mm", condition: "Extreme Heat" },
      { day: "Thu", temp: "39°C", humidity: "34%", wind: "18 km/h", rain: "0 mm", condition: "Sunny" },
      { day: "Fri", temp: "38°C", humidity: "40%", wind: "16 km/h", rain: "2 mm", condition: "Partly Cloudy" },
    ],
    weatherSeries: [
      { month: "Jan", temp: 28, humidity: 40, rainfall: 2, moisture: 20 },
      { month: "Feb", temp: 31, humidity: 42, rainfall: 4, moisture: 18 },
      { month: "Mar", temp: 35, humidity: 45, rainfall: 8, moisture: 16 },
      { month: "Apr", temp: 38, humidity: 42, rainfall: 10, moisture: 14 },
      { month: "May", temp: 41, humidity: 38, rainfall: 22, moisture: 15 },
      { month: "Jun", temp: 36, humidity: 50, rainfall: 50, moisture: 24 },
      { month: "Jul", temp: 33, humidity: 55, rainfall: 80, moisture: 28 },
      { month: "Aug", temp: 33, humidity: 58, rainfall: 95, moisture: 30 },
      { month: "Sep", temp: 32, humidity: 60, rainfall: 85, moisture: 29 },
      { month: "Oct", temp: 33, humidity: 52, rainfall: 45, moisture: 25 },
      { month: "Nov", temp: 31, humidity: 48, rainfall: 15, moisture: 22 },
      { month: "Dec", temp: 29, humidity: 42, rainfall: 3, moisture: 21 },
    ],
  },
};

function Weather() {
  const [district, setDistrict] = useState<string>("NTR");
  const [year, setYear] = useState<string>("2026");
  const [month, setMonth] = useState<string>("06");
  const [day, setDay] = useState<string>("All");

  const lat = district === "Anantapur" ? 14.6819 : 16.5062;
  const lng = district === "Anantapur" ? 77.6006 : 80.6480;

  const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
  const startDate = day === "All" ? `${year}-${month}-01` : `${year}-${month}-${day}`;
  const endDate = day === "All" ? `${year}-${month}-${daysInMonth}` : `${year}-${month}-${day}`;

  // Current simulation date is 2026-06-11
  const isHistorical = startDate < "2026-06-11";

  // Query live weather forecast or past weather archives
  const { data: weatherData } = useQuery({
    queryKey: ["weather-temporal-data", district, year, month, day],
    queryFn: async () => {
      if (isHistorical) {
        const response = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,relative_humidity_2m_max,rain_sum&timezone=auto`);
        if (!response.ok) throw new Error("Archive API error");
        const json = await response.json();
        return {
          type: "archive",
          daily: json.daily || {},
          source: `Archive (${year})`
        };
      } else {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,relative_humidity_2m_max,rain_sum&timezone=auto`);
        if (!response.ok) throw new Error("Forecast API error");
        const json = await response.json();
        return {
          type: "forecast",
          current: json.current || {},
          daily: json.daily || {},
          source: "Live Forecast"
        };
      }
    }
  });

  const spec = DISTRICT_WEATHER_DATA[district] || DISTRICT_WEATHER_DATA.NTR;

  // Derive metrics
  let tempVal = spec.temp;
  let humidityVal = spec.humidity;
  let windVal = spec.windSpeed;
  let rainfallVal = spec.rainfall;
  let moistureVal = spec.moisture;
  let sourceVal = "IMD Forecast";

  let weatherSeriesData = spec.weatherSeries;
  let forecastList: ForecastDay[] = spec.forecast;

  if (weatherData) {
    sourceVal = weatherData.source;
    if (weatherData.type === "archive") {
      const temps = weatherData.daily?.temperature_2m_max || [];
      const hums = weatherData.daily?.relative_humidity_2m_max || [];
      const rains = weatherData.daily?.rain_sum || [];
      const times = weatherData.daily?.time || [];

      if (temps.length > 0) {
        const avgTemp = Math.round(temps.reduce((a: number, b: number) => a + (b || 0), 0) / temps.length);
        const avgHum = Math.round(hums.reduce((a: number, b: number) => a + (b || 0), 0) / hums.length);
        const totalRain = Math.round(rains.reduce((a: number, b: number) => a + (b || 0), 0));

        tempVal = `${avgTemp}°C`;
        humidityVal = `${avgHum}%`;
        rainfallVal = `${totalRain} mm`;
        windVal = district === "Anantapur" ? "18 km/h" : "11 km/h";
        
        const avgRain = totalRain / temps.length;
        moistureVal = `${Math.min(95, Math.round(20 + avgRain * 3.5))}%`;

        if (day === "All") {
          weatherSeriesData = times.map((t: string, idx: number) => {
            const dayNum = t.split("-")[2];
            const rVal = rains[idx] != null ? Math.round(rains[idx]) : 0;
            return {
              month: `d${dayNum}`,
              temp: temps[idx] != null ? Math.round(temps[idx]) : 30,
              humidity: hums[idx] != null ? Math.round(hums[idx]) : 60,
              rainfall: rVal,
              moisture: Math.min(95, Math.round(20 + rVal * 2.5))
            };
          });
        } else {
          weatherSeriesData = [
            {
              month: `Day ${day}`,
              temp: temps[0] != null ? Math.round(temps[0]) : 30,
              humidity: hums[0] != null ? Math.round(hums[0]) : 60,
              rainfall: rains[0] != null ? Math.round(rains[0]) : 0,
              moisture: Math.min(95, Math.round(20 + (rains[0] || 0) * 2.5))
            }
          ];
        }
      }
    } else {
      const current = weatherData.current || {};
      tempVal = `${Math.round(current.temperature_2m || 31)}°C`;
      humidityVal = `${Math.round(current.relative_humidity_2m || 72)}%`;
      windVal = `${Math.round(current.wind_speed_10m || 12)} km/h`;
      
      const forecastTemps = weatherData.daily?.temperature_2m_max || [];
      const forecastHums = weatherData.daily?.relative_humidity_2m_max || [];
      const forecastRains = weatherData.daily?.rain_sum || [];
      const forecastTimes = weatherData.daily?.time || [];
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      forecastList = forecastTimes.slice(0, 5).map((t: string, idx: number) => ({
        day: days[idx] || "Day",
        temp: `${Math.round(forecastTemps[idx] || 30)}°C`,
        humidity: `${Math.round(forecastHums[idx] || 60)}%`,
        wind: district === "Anantapur" ? "22 km/h" : "12 km/h",
        rain: `${Math.round(forecastRains[idx] || 0)} mm`,
        condition: (forecastRains[idx] || 0) > 20 ? "Heavy Rain" : (forecastRains[idx] || 0) > 0 ? "Light Rain" : "Clear Sky"
      }));
    }
  }

  // Format alert box
  const getAlertBox = () => {
    if (district === "Anantapur") {
      return (
        <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-warning">Heat & Moisture Warning</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{spec.alert}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-emerald-400">Suitable Conditions</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{spec.alert}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CloudSun className="h-5 w-5" />}
        title="Weather Intelligence"
        description="Region-specific relative humidity, soil moisture indicators, temperatures, and micro-climate advisories."
        actions={<Pill tone="info">{sourceVal}</Pill>}
      />

      <Panel title="Historical Archive & Live Forecast Filter" subtitle="Specify Year, Month, and Day to explorer regional weather timelines">
        <div className="p-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="district-select">District Profile</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger id="district-select" className="bg-background/50 border-border/60">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NTR">NTR District</SelectItem>
                <SelectItem value="Anantapur">Anantapur District</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year-select">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year-select" className="bg-background/50 border-border/60">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026 (Current)</SelectItem>
                <SelectItem value="2025">2025 (Archive)</SelectItem>
                <SelectItem value="2024">2024 (Archive)</SelectItem>
                <SelectItem value="2023">2023 (Archive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="month-select">Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="month-select" className="bg-background/50 border-border/60">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">January (01)</SelectItem>
                <SelectItem value="02">February (02)</SelectItem>
                <SelectItem value="03">March (03)</SelectItem>
                <SelectItem value="04">April (04)</SelectItem>
                <SelectItem value="05">May (05)</SelectItem>
                <SelectItem value="06">June (06)</SelectItem>
                <SelectItem value="07">July (07)</SelectItem>
                <SelectItem value="08">August (08)</SelectItem>
                <SelectItem value="09">September (09)</SelectItem>
                <SelectItem value="10">October (10)</SelectItem>
                <SelectItem value="11">November (11)</SelectItem>
                <SelectItem value="12">December (12)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="day-select">Day Mode</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger id="day-select" className="bg-background/50 border-border/60">
                <SelectValue placeholder="Select Day Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Full Month Trend</SelectItem>
                {Array.from({ length: 31 }, (_, i) => {
                  const dayStr = String(i + 1).padStart(2, "0");
                  return <SelectItem key={dayStr} value={dayStr}>{dayStr}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 animate-in fade-in duration-300">
        <Kpi index={0} label="Temperature" value={tempVal} icon={Thermometer} tone={district === "Anantapur" ? "destructive" : "warning"} />
        <Kpi index={1} label="Humidity" value={humidityVal} icon={Droplets} tone="info" />
        <Kpi index={2} label="Soil Moisture" value={moistureVal} icon={Wind} tone={district === "Anantapur" ? "destructive" : "success"} delta={spec.moistureDelta} />
        <Kpi index={3} label="Rainfall" value={rainfallVal} icon={CloudSun} tone="info" delta={spec.rainfallDelta} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Panel title="Live Agro-Weather Alert" subtitle="Immediate field guidance">
            <div className="p-5">
              {getAlertBox()}
            </div>
          </Panel>

          <Panel title="5-Day Forecast Outlook" subtitle="Weather predictions for local crop planning">
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                      <th className="pb-2">Day</th>
                      <th className="pb-2">Temp</th>
                      <th className="pb-2">Wind</th>
                      <th className="pb-2">Rain</th>
                      <th className="pb-2 text-right">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-foreground/90 font-medium">
                    {forecastList.map((f) => (
                      <tr key={f.day} className="hover:bg-muted/10 transition-colors">
                        <td className="py-2.5 font-bold text-foreground">{f.day}</td>
                        <td className="py-2.5">{f.temp}</td>
                        <td className="py-2.5 text-muted-foreground">{f.wind}</td>
                        <td className="py-2.5 text-blue-400">{f.rain}</td>
                        <td className="py-2.5 text-right text-xs text-foreground/80">{f.condition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Temperature & Humidity" subtitle={day === "All" ? `${month}/${year} daily trend` : `Selected day trend`}>
              <div className="p-5">
                <MultiLine
                  data={weatherSeriesData}
                  keys={[
                    { key: "temp", color: "var(--color-chart-4)" },
                    { key: "humidity", color: "var(--color-chart-3)" },
                  ]}
                />
              </div>
            </Panel>
            <Panel title="Rainfall & Soil Moisture" subtitle={day === "All" ? `${month}/${year} daily trend` : `Selected day trend`}>
              <div className="p-5">
                <Bars
                  data={weatherSeriesData}
                  xKey="month"
                  keys={[
                    { key: "rainfall", color: "var(--color-chart-3)" },
                    { key: "moisture", color: "var(--color-chart-1)" },
                  ]}
                />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
