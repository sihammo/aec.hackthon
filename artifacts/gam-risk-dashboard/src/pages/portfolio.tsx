import { useGetPortfolioByWilaya, useGetPortfolioByCategory, useGetPortfolioByZone } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DashboardControls } from "@/components/controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCapital, formatPercent, CHART_COLORS, CHART_COLOR_LIST, RISK_COLORS } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Portfolio() {
  const queryClient = useQueryClient();
  const wilayaQuery = useGetPortfolioByWilaya();
  const categoryQuery = useGetPortfolioByCategory();
  const zoneQuery = useGetPortfolioByZone();

  const [sorting, setSorting] = useState<SortingState>([{ id: "capitalAssure", desc: true }]);

  const loading = wilayaQuery.isLoading || wilayaQuery.isFetching || 
                  categoryQuery.isLoading || categoryQuery.isFetching ||
                  zoneQuery.isLoading || zoneQuery.isFetching;

  const wilayas = wilayaQuery.data || [];
  const categories = categoryQuery.data || [];
  const zones = zoneQuery.data || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  const table = useReactTable({
    data: wilayas,
    columns: [
      { accessorKey: "wilayaCode", header: "Code" },
      { accessorKey: "wilayaName", header: "Wilaya" },
      { 
        accessorKey: "seismicZone", 
        header: "Zone",
        cell: ({ row }) => <span className="font-mono bg-muted px-2 py-0.5 rounded">{row.original.seismicZone}</span>
      },
      { 
        accessorKey: "totalContracts", 
        header: () => <div className="text-right">Contracts</div>,
        cell: ({ row }) => <div className="text-right">{row.original.totalContracts.toLocaleString()}</div>
      },
      { 
        accessorKey: "capitalAssure", 
        header: () => <div className="text-right">Capital Assuré</div>,
        cell: ({ row }) => <div className="text-right font-mono text-primary font-medium">{formatCapital(row.original.capitalAssure)}</div>
      },
      { 
        accessorKey: "primesCollectees", 
        header: () => <div className="text-right">Primes</div>,
        cell: ({ row }) => <div className="text-right font-mono">{formatCapital(row.original.primesCollectees)}</div>
      },
      { 
        accessorKey: "riskLevel", 
        header: "Risk",
        cell: ({ row }) => (
          <span className={`text-xs px-2 py-1 rounded font-medium border ${RISK_COLORS[row.original.riskLevel as keyof typeof RISK_COLORS]}`}>
            {row.original.riskLevel}
          </span>
        )
      },
    ],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="pt-2">
          <h1 className="font-bold text-[32px]">Portfolio Analysis</h1>
          <p className="text-muted-foreground mt-1.5 text-[14px]">Detailed breakdown by region, category, and seismic zone</p>
        </div>
        <DashboardControls loading={loading} onRefresh={handleRefresh} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Exposure by RPA99 Seismic Zone</CardTitle>
            {!loading && zones.length > 0 && (
              <CSVLink data={zones} filename="portfolio-zone.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}>
                <Download className="w-3.5 h-3.5" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <BarChart data={zones} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(val) => `${(val / 1000000000).toFixed(0)}`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <YAxis dataKey="zoneName" type="category" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} width={100} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="capitalAssure" name="Exposure (Mrds DZD)" fill={CHART_COLORS.purple} fillOpacity={0.8} activeBar={{ fillOpacity: 1 }} radius={[0, 2, 2, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Contracts by Category</CardTitle>
            {!loading && categories.length > 0 && (
              <CSVLink data={categories} filename="portfolio-category.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}>
                <Download className="w-3.5 h-3.5" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <BarChart data={categories}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <YAxis tickFormatter={(val) => val.toLocaleString()} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="totalContracts" name="Contracts" fill={CHART_COLORS.blue} fillOpacity={0.8} activeBar={{ fillOpacity: 1 }} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Wilaya Breakdown</CardTitle>
          {!loading && wilayas.length > 0 && (
            <CSVLink data={wilayas} filename="portfolio-wilayas.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}>
              <Download className="w-3.5 h-3.5" />
            </CSVLink>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="rounded-md border mt-2 border-border/50 bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-border/50 hover:bg-transparent">
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id} 
                          onClick={header.column.getToggleSortingHandler()} 
                          className="cursor-pointer select-none text-muted-foreground whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1.5">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-border/50 hover:bg-muted/40">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
