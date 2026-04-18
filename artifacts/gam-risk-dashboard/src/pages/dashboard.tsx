import { useGetPortfolioSummary, useGetPortfolioByCategory, useGetRiskHotspots } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DashboardControls } from "@/components/controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCapital, formatPercent, CHART_COLORS, CHART_COLOR_LIST } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { Download, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

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
  const categories = categoryQuery.data || [];
  const hotspots = hotspotsQuery.data || [];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
            ) : summary ? (
              <>
                <p className="text-sm text-muted-foreground">Total Exposure</p>
                <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.blue }}>{formatCapital(summary.totalCapitalAssure)}</p>
                <div className="flex items-center gap-1 mt-1 text-[12px] text-muted-foreground">
                  <ArrowUpIcon className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">1.2%</span> vs last month
                </div>
              </>
            ) : <p className="text-2xl font-bold mt-1">--</p>}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
            ) : summary ? (
              <>
                <p className="text-sm text-muted-foreground">High Risk Exposure</p>
                <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.red }}>{formatCapital(summary.exposureHighRisk)}</p>
                <div className="flex items-center gap-1 mt-1 text-[12px] text-muted-foreground">
                  <span className="font-semibold">{formatPercent(summary.pctHighRisk)}</span> of portfolio
                </div>
              </>
            ) : <p className="text-2xl font-bold mt-1">--</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
            ) : summary ? (
              <>
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.blue }}>{new Intl.NumberFormat().format(summary.totalContracts)}</p>
                <div className="flex items-center gap-1 mt-1 text-[12px] text-muted-foreground">
                  <ArrowUpIcon className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">3.4%</span> vs last month
                </div>
              </>
            ) : <p className="text-2xl font-bold mt-1">--</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
            ) : summary ? (
              <>
                <p className="text-sm text-muted-foreground">GAM Retention Share</p>
                <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.amber }}>{formatCapital(summary.gamRetentionShare)}</p>
                <div className="flex items-center gap-1 mt-1 text-[12px] text-muted-foreground">
                  Target: 30%
                </div>
              </>
            ) : <p className="text-2xl font-bold mt-1">--</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Exposure Growth (YTD)</CardTitle>
            {!loading && historicExposure.length > 0 && (
              <CSVLink data={historicExposure} filename="exposure-growth.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}>
                <Download className="w-3.5 h-3.5" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <AreaChart data={historicExposure}>
                  <defs>
                    <linearGradient id="gradientExposure" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.blue} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <YAxis tickFormatter={(val) => `${(val / 1000000000).toFixed(0)}`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                  <Area type="linear" dataKey="exposure" name="Exposure (Mrds DZD)" fill="url(#gradientExposure)" stroke={CHART_COLORS.blue} fillOpacity={1} strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Exposure by Category</CardTitle>
            {!loading && categories.length > 0 && (
              <CSVLink data={categories} filename="exposure-category.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}>
                <Download className="w-3.5 h-3.5" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <PieChart>
                  <Pie data={categories} dataKey="capitalAssure" nameKey="category" cx="50%" cy="45%" outerRadius={100} innerRadius={60} cornerRadius={2} paddingAngle={2} isAnimationActive={false} stroke="none">
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
      </div>

      <Card>
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Top Risk Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : hotspots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Wilaya</th>
                    <th className="pb-2 font-medium text-muted-foreground">Seismic Zone</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Exposure</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Risk Score</th>
                    <th className="pb-2 font-medium text-muted-foreground">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspots.map((spot, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-medium">{spot.wilayaName}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-600 dark:text-red-400">
                          {spot.seismicZone}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono">{formatCapital(spot.capitalAssure)}</td>
                      <td className="py-3 text-right">
                        <span className="font-bold text-red-600 dark:text-red-400">{spot.riskScore.toFixed(1)}</span>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">{spot.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No hotspots found</div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
