import { useEffect, useState } from "react";
import { useGetRiskMapData } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DashboardControls } from "@/components/controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCapital, RISK_COLORS } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function RiskMap() {
  const queryClient = useQueryClient();
  const mapQuery = useGetRiskMapData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loading = mapQuery.isLoading || mapQuery.isFetching;
  const data = mapQuery.data || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const getMarkerColor = (level: string) => {
    if (level === "High") return "#ef4444";
    if (level === "Medium") return "#f59e0b";
    return "#22c55e";
  };

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="pt-2">
          <h1 className="font-bold text-[32px]">Interactive Risk Map</h1>
          <p className="text-muted-foreground mt-1.5 text-[14px]">Geospatial distribution of seismic exposure across Algeria</p>
        </div>
        <DashboardControls loading={loading} onRefresh={handleRefresh} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)] min-h-[600px]">
        <Card className="lg:col-span-3 flex flex-col">
          <CardContent className="p-0 flex-1 relative overflow-hidden rounded-lg">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : mounted ? (
              <MapContainer 
                center={[33.0, 3.0]} 
                zoom={5} 
                style={{ height: "100%", width: "100%", background: "#0f172a" }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {data.map((point) => (
                  <CircleMarker
                    key={point.wilayaCode}
                    center={[point.lat, point.lng]}
                    radius={Math.max(5, Math.min(25, point.totalContracts / 1000))}
                    pathOptions={{
                      color: getMarkerColor(point.riskLevel),
                      fillColor: getMarkerColor(point.riskLevel),
                      fillOpacity: 0.6,
                      weight: 2
                    }}
                  >
                    <Popup className="dark-popup">
                      <div className="p-1 min-w-[200px]">
                        <h3 className="font-bold text-base mb-1">{point.wilayaName} ({point.wilayaCode})</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium border ${RISK_COLORS[point.riskLevel as keyof typeof RISK_COLORS]}`}>
                            {point.riskLevel} Risk
                          </span>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                            Zone {point.seismicZone}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exposure:</span>
                            <span className="font-mono font-medium">{formatCapital(point.capitalAssure)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Contracts:</span>
                            <span className="font-mono font-medium">{point.totalContracts.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1.5 mt-1.5">
                            <span className="text-muted-foreground">Risk Score:</span>
                            <span className="font-bold" style={{ color: getMarkerColor(point.riskLevel) }}>
                              {point.riskScore.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            ) : null}
            
            {/* Custom CSS for leaflet popup in dark mode */}
            <style>{`
              .leaflet-popup-content-wrapper {
                background: hsl(var(--card));
                color: hsl(var(--card-foreground));
                border: 1px solid hsl(var(--border));
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.5);
              }
              .leaflet-popup-tip {
                background: hsl(var(--card));
                border-top: 1px solid hsl(var(--border));
                border-left: 1px solid hsl(var(--border));
              }
            `}</style>
          </CardContent>
        </Card>

        <div className="space-y-4 overflow-y-auto pr-1">
          <Card>
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500/60 border-2 border-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-red-500">High Risk (≥60)</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Zone III or high concentration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-500/60 border-2 border-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-amber-500">Medium Risk (30-59)</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Zone IIa/IIb with moderate exposure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500/60 border-2 border-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-green-500">Low Risk (&lt;30)</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Zone I or 0, minimal exposure</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Circle size indicates contract volume</p>
                  <div className="flex items-center gap-4 justify-center py-2">
                    <div className="w-2 h-2 rounded-full border-2 border-muted-foreground/50 bg-muted-foreground/20" />
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/50 bg-muted-foreground/20" />
                    <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/50 bg-muted-foreground/20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-base">Top Exposure Areas</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {[...data].sort((a, b) => b.capitalAssure - a.capitalAssure).slice(0, 5).map(wilaya => (
                    <div key={wilaya.wilayaCode} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{wilaya.wilayaName}</p>
                        <p className="text-xs text-muted-foreground">Zone {wilaya.seismicZone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono">{formatCapital(wilaya.capitalAssure)}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${RISK_COLORS[wilaya.riskLevel as keyof typeof RISK_COLORS]}`}>
                          {wilaya.riskLevel}
                        </span>
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
