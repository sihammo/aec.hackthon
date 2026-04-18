import { useState } from "react";
import { useGetRiskScores } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DashboardControls } from "@/components/controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCapital, RISK_COLORS } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { exportToExcel } from "@/lib/export";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RiskScores() {
  const queryClient = useQueryClient();
  const riskQuery = useGetRiskScores();

  const [sorting, setSorting] = useState<SortingState>([{ id: "riskScore", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const loading = riskQuery.isLoading || riskQuery.isFetching;
  const riskScores = riskQuery.data || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const isDark = document.documentElement.classList.contains("dark");

  const table = useReactTable({
    data: riskScores,
    columns: [
      { accessorKey: "wilayaCode", header: "Code" },
      { accessorKey: "wilayaName", header: "Wilaya Name" },
      { 
        accessorKey: "seismicZone", 
        header: "Zone",
        cell: ({ row }) => <span className="font-mono bg-muted px-2 py-0.5 rounded">{row.original.seismicZone}</span>
      },
      { 
        accessorKey: "capitalAssure", 
        header: () => <div className="text-right">Exposure (Capital)</div>,
        cell: ({ row }) => <div className="text-right font-mono font-medium">{formatCapital(row.original.capitalAssure)}</div>
      },
      { 
        accessorKey: "concentrationRisk", 
        header: () => <div className="text-right">Concentration</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <span className="font-mono">{row.original.concentrationRisk.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs ml-1">/100</span>
          </div>
        )
      },
      { 
        accessorKey: "vulnerabilityIndex", 
        header: () => <div className="text-right">Vulnerability</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <span className="font-mono">{row.original.vulnerabilityIndex.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs ml-1">/100</span>
          </div>
        )
      },
      { 
        accessorKey: "riskScore", 
        header: () => <div className="text-right">Total Risk Score</div>,
        cell: ({ row }) => (
          <div className="text-right font-bold text-[15px]" style={{ color: row.original.riskScore >= 60 ? "#ef4444" : row.original.riskScore >= 30 ? "#f59e0b" : "#22c55e" }}>
            {row.original.riskScore.toFixed(1)}
          </div>
        )
      },
      { 
        accessorKey: "riskLevel", 
        header: "Risk Level",
        cell: ({ row }) => (
          <span className={`text-xs px-2 py-1 rounded font-medium border ${RISK_COLORS[row.original.riskLevel as keyof typeof RISK_COLORS]}`}>
            {row.original.riskLevel}
          </span>
        )
      },
    ],
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="pt-2">
          <h1 className="font-bold text-[32px]">Risk Scores</h1>
          <p className="text-muted-foreground mt-1.5 text-[14px]">Comprehensive seismic risk scoring matrix for all wilayas</p>
        </div>
        <DashboardControls loading={loading} onRefresh={handleRefresh} />
      </div>

      <Card>
        <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Wilaya Risk Matrix</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search wilayas..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 w-[250px] h-9 text-sm"
              />
            </div>
            {!loading && riskScores.length > 0 && (
              <button 
                onClick={() => exportToExcel(riskScores, "risk-scores", "Risk Scores")}
                className="print:hidden flex items-center justify-center w-[36px] h-9 rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors" 
                aria-label="Export table data as Excel"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(15)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="rounded-md border mt-4 border-border/50 bg-card overflow-hidden">
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
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="border-border/50 hover:bg-muted/40">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-2.5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No wilayas found matching "{globalFilter}".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
