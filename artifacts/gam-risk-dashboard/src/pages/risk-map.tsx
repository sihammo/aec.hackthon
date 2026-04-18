import { useEffect, useState, useRef } from "react";
import { useGetRiskMapData } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DashboardControls } from "@/components/controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCapital, RISK_COLORS } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { ShieldAlert, TrendingUp, Info, Map as MapIcon, Layers } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Helper component to handle map focusing
function MapFocusHandler({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 7, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

export default function RiskMap() {
  const queryClient = useQueryClient();
  const mapQuery = useGetRiskMapData();
  const [mounted, setMounted] = useState(false);
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loading = mapQuery.isLoading || mapQuery.isFetching;
  const data = mapQuery.data || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const getMarkerColor = (level: string) => {
    if (level === "High") return "#ff4d4d";
    if (level === "Medium") return "#ffad33";
    return "#10b981";
  };

  const totalExposure = data.reduce((s, d) => s + d.capitalAssure, 0);
  const highRiskCount = data.filter(d => d.riskLevel === "High").length;

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-2 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">SIG Live</span>
            <h1 className="font-bold text-[32px]">Interactive Risk Map</h1>
          </div>
          <p className="text-muted-foreground text-[14px]">Geospatial distribution of seismic exposure across Algeria</p>
        </div>
        <DashboardControls loading={loading} onRefresh={handleRefresh} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-160px)] min-h-[600px]">
        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl group">
          {loading ? (
            <Skeleton className="w-full h-full" />
          ) : mounted ? (
            <>
              <MapContainer 
                center={[33.0, 3.0]} 
                zoom={5.5} 
                style={{ height: "100%", width: "100%", background: "#0a0c10" }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; CARTO'
                />
                <MapFocusHandler target={focusLocation} />
                {data.map((point) => (
                  <CircleMarker
                    key={point.wilayaCode}
                    center={[point.lat, point.lng]}
                    radius={Math.max(6, Math.min(30, point.totalContracts / 800))}
                    pathOptions={{
                      color: getMarkerColor(point.riskLevel),
                      fillColor: getMarkerColor(point.riskLevel),
                      fillOpacity: point.riskLevel === "High" ? 0.4 : 0.6,
                      weight: point.riskLevel === "High" ? 3 : 2,
                      className: point.riskLevel === "High" ? "pulsing-marker" : ""
                    }}
                  >
                    <Popup className="premium-popup">
                      <div className="p-1 min-w-[220px]">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-[14px] leading-tight">{point.wilayaName}<br/><span className="text-[10px] text-muted-foreground uppercase opacity-70">Code {point.wilayaCode}</span></h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-black border ${RISK_COLORS[point.riskLevel as keyof typeof RISK_COLORS]}`}>
                            {point.riskLevel}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3 pt-2 border-t border-border/10">
                          <div className="bg-muted/30 p-2 rounded-lg">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-tighter">Exposure</span>
                            <span className="font-mono text-sm">{formatCapital(point.capitalAssure)}</span>
                          </div>
                          <div className="bg-muted/30 p-2 rounded-lg">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-tighter">Seismic</span>
                            <span className="font-mono text-sm">Zone {point.seismicZone}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Reliability Score:</span>
                          <span className="font-bold" style={{ color: getMarkerColor(point.riskLevel) }}>
                            {point.riskScore.toFixed(1)}/100
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* Glassmorphism Controls Overlay */}
              <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                <div className="bg-background/40 backdrop-blur-xl border border-white/10 p-2 rounded-xl shadow-2xl transition-all hover:bg-background/60">
                   <div className="flex flex-col gap-1">
                      <button onClick={() => setFocusLocation([36.7528, 3.0422])} className="p-2 hover:bg-white/10 rounded-lg transition-colors title='Focus Algiers'" title="Focus Algiers">
                        <MapIcon className="w-5 h-5" />
                      </button>
                      <div className="w-full h-px bg-white/10" />
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Layers">
                        <Layers className="w-5 h-5" />
                      </button>
                   </div>
                </div>
              </div>

              {/* Bottom Quick Stats */}
              <div className="absolute bottom-6 left-6 z-[1000] flex items-center gap-4">
                <div className="bg-background/40 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                   <div className="p-2 bg-red-500/20 rounded-lg">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Hotspots</p>
                      <p className="text-xl font-black leading-none">{highRiskCount}</p>
                   </div>
                </div>
                <div className="bg-background/40 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Limit</p>
                      <p className="text-xl font-black leading-none">{formatCapital(totalExposure)}</p>
                   </div>
                </div>
              </div>
            </>
          ) : null}
          
          <style>{`
            .pulsing-marker {
              animation: pulse 2s infinite;
              filter: drop-shadow(0 0 10px rgba(255, 77, 77, 0.5));
            }
            @keyframes pulse {
              0% { fill-opacity: 0.4; stroke-width: 3; }
              50% { fill-opacity: 0.7; stroke-width: 5; }
              100% { fill-opacity: 0.4; stroke-width: 3; }
            }
            .leaflet-container { font-family: inherit; }
            .premium-popup .leaflet-popup-content-wrapper {
              background: rgba(15, 23, 42, 0.8) !important;
              backdrop-filter: blur(12px);
              color: white !important;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 16px;
              box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);
              padding: 4px;
            }
            .premium-popup .leaflet-popup-tip {
              background: rgba(15, 23, 42, 0.8) !important;
            }
            .leaflet-popup-content { margin: 12px; }
          `}</style>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1">
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Risk Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-4 text-sm">
                {[
                  { level: "High", color: "bg-red-500", desc: "Critical Exposure (Zone III)", val: "≥60" },
                  { level: "Medium", color: "bg-amber-500", desc: "Zone IIa/IIb Moderate", val: "30-59" },
                  { level: "Low", color: "bg-emerald-500", desc: "Safe Zone (I/0)", val: "<30" }
                ].map((item) => (
                  <div key={item.level} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                    <div className={`w-3 h-3 rounded-full ${item.color} mt-1 shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:scale-125 transition-transform`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="font-black text-xs uppercase tracking-wider">{item.level}</p>
                        <span className="text-[10px] font-mono opacity-50">{item.val}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
            <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Top Hotspots</CardTitle>
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {[...data].sort((a, b) => b.capitalAssure - a.capitalAssure).slice(0, 6).map(wilaya => (
                    <div 
                      key={wilaya.wilayaCode} 
                      onClick={() => setFocusLocation([wilaya.lat, wilaya.lng])}
                      className="flex justify-between items-center p-2 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer group"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-xs group-hover:text-primary transition-colors">{wilaya.wilayaName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Zone {wilaya.seismicZone} · {wilaya.totalContracts} Units</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold">{formatCapital(wilaya.capitalAssure)}</p>
                        <div className={`mt-1 h-1 w-full rounded-full bg-muted overflow-hidden`}>
                           <div className={`h-full ${wilaya.riskLevel === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${wilaya.riskScore}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

