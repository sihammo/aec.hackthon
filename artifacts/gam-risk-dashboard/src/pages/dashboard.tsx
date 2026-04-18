import { useGetPortfolioSummary, useGetPortfolioByCategory, useGetRiskHotspots } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DashboardControls } from "@/components/controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCapital, formatPercent, CHART_COLORS, CHART_COLOR_LIST } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { Download, ArrowUpIcon, ArrowDownIcon, Upload } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { exportToExcel } from "@/lib/export";

const DATA_SOURCES = ["GAM Core System", "RPA99 Model"];

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
      <div style={{ marginBottom: "6px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
        {payload.length === 1 && payload[0].color && payload[0].color !== "#ffffff" && (
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: payload[0].color, flexShrink: 0 }} />
        )}
        {label}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
          {payload.length > 1 && entry.color && entry.color !== "#ffffff" && (
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          )}
          <span style={{ color: "#444" }}>{entry.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload || payload.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", fontSize: "13px" }}>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const summaryQuery = useGetPortfolioSummary();
  const categoryQuery = useGetPortfolioByCategory();
  const hotspotsQuery = useGetRiskHotspots();

  const loading = summaryQuery.isLoading || summaryQuery.isFetching || 
                  categoryQuery.isLoading || categoryQuery.isFetching ||
                  hotspotsQuery.isLoading || hotspotsQuery.isFetching;

  const summary = summaryQuery.data;
  const categories = Array.isArray(categoryQuery.data) ? categoryQuery.data : [];
  const hotspots = Array.isArray(hotspotsQuery.data) ? hotspotsQuery.data : [];

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const lastRefreshed = summaryQuery.dataUpdatedAt
    ? (() => {
        const d = new Date(summaryQuery.dataUpdatedAt);
        const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
        const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `${time} on ${date}`;
      })()
    : null;

  // Fake historic data for area chart
  const historicExposure = [
    { month: "Jan", exposure: 1200000000000 },
    { month: "Feb", exposure: 1250000000000 },
    { month: "Mar", exposure: 1240000000000 },
    { month: "Apr", exposure: 1280000000000 },
    { month: "May", exposure: 1320000000000 },
    { month: "Jun", exposure: 1350000000000 },
    { month: "Jul", exposure: 1390000000000 },
    { month: "Aug", exposure: (summary?.totalCapitalAssure || 1400000000000) * 0.98 },
    { month: "Sep", exposure: (summary?.totalCapitalAssure || 1400000000000) * 0.99 },
    { month: "Oct", exposure: summary?.totalCapitalAssure || 1400000000000 },
  ];

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="pt-2">
          <h1 className="font-bold text-[32px]">Risk Intelligence Dashboard</h1>
          <p className="text-muted-foreground mt-1.5 text-[14px]">Executive overview of seismic portfolio exposure</p>
          
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[12px] text-muted-foreground shrink-0">Data Sources:</span>
            {DATA_SOURCES.map((source) => (
              <span
                key={source}
                className="text-[12px] font-bold rounded px-2 py-0.5 truncate print:!bg-[rgb(229,231,235)] print:!text-[rgb(75,85,99)]"
                title={source}
                style={{
                  maxWidth: "20ch",
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgb(229, 231, 235)",
                  color: isDark ? "#c8c9cc" : "rgb(75, 85, 99)",
                }}
              >
                {source}
              </span>
            ))}
          </div>

          {lastRefreshed && <p className="text-[12px] text-muted-foreground mt-3">Last refresh: {lastRefreshed}</p>}
        </div>
        
        <DashboardControls loading={loading} onRefresh={handleRefresh} />
      </div>

      {!loading && (!summary || summary.totalCapitalAssure === 0) ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Awaiting Risk Portfolio Data</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            The Risk Insight Engine is currently in its standby state. Please upload your Excel or CSV portfolio to trigger the deep-risk analysis and generate reports.
          </p>
          <button 
            onClick={() => window.location.href = "/import"}
            className="px-10 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            Go to Import Page
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
                ) : summary ? (
                  <>
                    <p className="text-sm text-muted-foreground">Total Portfolio Exposure</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.blue }}>{formatCapital(summary.totalCapitalAssure)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[12px] text-muted-foreground">
                      <span className="text-muted-foreground">Insured Capital</span>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 border-l-4 border-emerald-500">
                {loading ? (
                  <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
                ) : summary ? (
                  <>
                    <p className="text-sm text-muted-foreground">Total Profits (Premiums)</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-500">{formatCapital(summary.totalProfits || 0)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[12px] text-muted-foreground">
                      <ArrowUpIcon className="w-3 h-3 text-emerald-500" /> Positive inflow
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 border-l-4 border-red-500">
                {loading ? (
                  <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
                ) : summary ? (
                  <>
                    <p className="text-sm text-muted-foreground">Total Technical Losses</p>
                    <p className="text-2xl font-bold mt-1 text-red-500">{formatCapital(summary.totalLosses || 0)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[12px] text-muted-foreground">
                      <ArrowDownIcon className="w-3 h-3 text-red-500" /> Claims & negative balance
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
                ) : summary ? (
                  <>
                    <p className="text-sm text-muted-foreground">Risk Concentration</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.amber }}>{formatPercent(summary.pctHighRisk)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[12px] text-muted-foreground">
                      In High Risk Zones (III)
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Exposure Distribution (by Category)</CardTitle>
                {!loading && categories.length > 0 && (
                  <button 
                    onClick={() => exportToExcel(categories, "exposure-category", "Categories")}
                    className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" 
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="w-full h-[300px]" /> : (
                  <ResponsiveContainer width="100%" height={300} debounce={0}>
                    <PieChart>
                      <Pie data={categories} dataKey="capitalAssure" nameKey="category" cx="50%" cy="45%" outerRadius={100} innerRadius={60} cornerRadius={4} paddingAngle={2} isAnimationActive={false} stroke="none">
                        {categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLOR_LIST[index % CHART_COLOR_LIST.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                      <Legend content={<CustomLegend />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-base">Top Risk Hotspots</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2 mt-4">
                    <Skeleton className="h-10 w-full" />
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : hotspots.length > 0 ? (
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-2 font-medium text-muted-foreground">Wilaya</th>
                          <th className="pb-2 font-medium text-muted-foreground text-right">Exposure</th>
                          <th className="pb-2 font-medium text-muted-foreground text-right">Risk Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hotspots.map((spot, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                            <td className="py-3 font-medium">{spot.wilayaName}</td>
                            <td className="py-3 text-right font-mono text-xs">{formatCapital(spot.capitalAssure)}</td>
                            <td className="py-3 text-right">
                              <span className="font-bold text-red-500">{spot.riskScore.toFixed(1)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">Analysis pending...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </Layout>
  );
}
