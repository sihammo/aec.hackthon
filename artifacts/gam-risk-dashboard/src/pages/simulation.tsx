import { useState } from "react";
import { useGetPortfolioByWilaya, useRunSimulation } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DashboardControls } from "@/components/controls";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCapital, formatPercent, CHART_COLORS, CHART_COLOR_LIST } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { Download, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { SimulationResult } from "@workspace/api-client-react";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "6px",
        padding: "10px 14px",
        border: "1px solid #e0e0e0",
        color: "#1a1a1a",
        fontSize: "13px",
      }}
    >
      <div style={{ marginBottom: "6px", fontWeight: 500 }}>{label}</div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
          {entry.color && entry.color !== "#ffffff" && (
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          )}
          <span style={{ color: "#444" }}>{entry.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            {formatCapital(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Simulation() {
  const queryClient = useQueryClient();
  const wilayaQuery = useGetPortfolioByWilaya();
  const simulationMutation = useRunSimulation();

  const wilayas = wilayaQuery.data || [];
  
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [magnitude, setMagnitude] = useState<number[]>([6.5]);
  const [scenario, setScenario] = useState<string>("moderate");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const loading = wilayaQuery.isLoading || wilayaQuery.isFetching;
  const isSimulating = simulationMutation.isPending;

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const runSim = () => {
    if (!selectedWilaya) return;
    
    simulationMutation.mutate(
      { 
        data: {
          wilayaCode: parseInt(selectedWilaya),
          magnitude: magnitude[0],
          scenario: scenario
        }
      },
      {
        onSuccess: (data) => {
          setSimulationResult(data);
        }
      }
    );
  };

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  const getSeverityColor = (severity: string) => {
    if (severity === "Catastrophic") return "bg-red-500 text-white";
    if (severity === "Severe") return "bg-orange-500 text-white";
    if (severity === "Moderate") return "bg-amber-500 text-white";
    return "bg-green-500 text-white";
  };

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="pt-2">
          <h1 className="font-bold text-[32px]">Earthquake Scenario Simulation</h1>
          <p className="text-muted-foreground mt-1.5 text-[14px]">Project portfolio losses based on hypothetical seismic events</p>
        </div>
        <DashboardControls loading={loading} onRefresh={handleRefresh} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-4">
            <CardTitle>Simulation Parameters</CardTitle>
            <CardDescription>Configure scenario constraints to estimate probable maximum loss (PML).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Epicenter (Wilaya)</Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select epicentral wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayas.sort((a,b) => a.wilayaName.localeCompare(b.wilayaName)).map((w) => (
                      <SelectItem key={w.wilayaCode} value={w.wilayaCode.toString()}>
                        {w.wilayaName} (Zone {w.seismicZone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label className="text-sm font-medium">Moment Magnitude (Mw)</Label>
                <span className="font-mono text-sm font-bold text-primary">{magnitude[0].toFixed(1)}</span>
              </div>
              <Slider
                value={magnitude}
                onValueChange={setMagnitude}
                max={9.0}
                min={4.0}
                step={0.5}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>4.0 (Light)</span>
                <span>6.5 (Strong)</span>
                <span>9.0 (Great)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Damage Scenario</Label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optimistic">Optimistic (High structural resilience)</SelectItem>
                  <SelectItem value="moderate">Moderate (Expected baseline)</SelectItem>
                  <SelectItem value="pessimistic">Pessimistic (Older building stock fails)</SelectItem>
                  <SelectItem value="catastrophic">Catastrophic (Cascading failures)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={runSim} 
              disabled={!selectedWilaya || isSimulating || loading}
            >
              {isSimulating ? (
                <>Simulating...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" /> Run Simulation</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-6">
          {!simulationResult && !isSimulating && (
            <Card className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-muted/20 border-dashed">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Simulation Results</h3>
              <p className="text-muted-foreground max-w-md">
                Select a wilaya, configure the magnitude and scenario, then click Run Simulation to view estimated portfolio losses.
              </p>
            </Card>
          )}

          {isSimulating && (
            <Card className="flex-1 flex flex-col items-center justify-center p-12">
              <Skeleton className="w-full h-full min-h-[400px] rounded-lg" />
            </Card>
          )}

          {simulationResult && !isSimulating && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col justify-center h-full">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Est. Loss</p>
                    <p className="text-xl font-bold text-red-500">{formatCapital((simulationResult as any).totalEstimatedLoss)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      Portfolio-wide impact
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col justify-center h-full">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Direct physical damage</p>
                    <p className="text-xl font-bold" style={{ color: CHART_COLORS.blue }}>{formatCapital((simulationResult as any).totalDirectLoss)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      L = E x H x V
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col justify-center h-full">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Cascading (BI/Demand)</p>
                    <p className="text-xl font-bold" style={{ color: CHART_COLORS.amber }}>{formatCapital((simulationResult as any).totalCascadingLoss)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      +25% indirect impact
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col justify-center h-full">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">GAM Net Retention</p>
                    <p className="text-xl font-bold" style={{ color: CHART_COLORS.purple }}>{formatCapital((simulationResult as any).gamShare)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      30% of total risk
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex-1">
                  <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0 border-b">
                    <div>
                      <CardTitle className="text-base">Loss by Asset Category</CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        Impact distributed by portfolio structure
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={260} debounce={0}>
                      <BarChart data={simulationResult.breakdown} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                        <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: tickColor }} stroke={tickColor} width={120} />
                        <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
                        <Bar dataKey="loss" name="Estimated Loss" fill={CHART_COLORS.red} fillOpacity={0.8} activeBar={{ fillOpacity: 1 }} radius={[0, 2, 2, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="px-4 pt-4 pb-2">
                    <CardTitle className="text-base">Most Impacted Provinces</CardTitle>
                    <CardDescription className="text-xs">{(simulationResult as any).affectedWilayas} wilayas significantly affected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mt-2">
                      {(simulationResult as any).results?.slice(0, 5).map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-bold text-sm">{r.wilayaName}</p>
                            <p className="text-[10px] text-muted-foreground">{r.distance} KM from epicenter • Intensity: {r.hazardIntensity}%</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-bold text-red-500">{formatCapital(r.totalLoss)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
