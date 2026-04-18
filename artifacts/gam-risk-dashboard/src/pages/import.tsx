import { useState, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Trash2,
  Info,
} from "lucide-react";
import { formatCapital } from "@/lib/utils";
import * as XLSX from "xlsx";

const API = "/api/";

interface ParsedRow {
  wilaya: string;
  contracts: number;
  capitalAssure: number;
  primesCollectees: number;
}

interface ImportStatus {
  isCustomData: boolean;
  importedAt: string | null;
  wilayas: number;
}

const WILAYA_NAMES = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arreridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued",
  "Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
  "Ghardaïa","Relizane",
];

export default function ImportData() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; warnings?: string[] } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API}portfolio/import-status`);
      const d = await r.json();
      setStatus(d);
    } catch {}
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleDownloadTemplate = () => {
    window.open(`${API}portfolio/template`, "_blank");
  };

  const parseFile = (file: File) => {
    setFileName(file.name);
    setParsedRows(null);
    setParseErrors([]);
    setImportResult(null);

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
          
          processData(jsonData);
        } catch (err: any) {
          setParseErrors([`Erreur Excel: ${err.message}`]);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data as Record<string, any>[]);
        },
        error: (err) => {
          setParseErrors([`Erreur CSV: ${err.message}`]);
        },
      });
    }
  };

  const processData = (data: Record<string, any>[]) => {
    const errors: string[] = [];
    const rows: ParsedRow[] = [];

    data.forEach((row, i) => {
      // Standardize field names (case insensitive and common variations)
      const wilaya = (row.wilaya ?? row.Wilaya ?? row.WILAYA ?? "").toString().trim();
      if (!wilaya) return;

      const cleanStringNum = (val: any) => {
        if (!val) return "0";
        return val.toString().replace(/\s/g, "").replace(/,/g, ".");
      };

      const contracts = parseFloat(cleanStringNum(row.contracts ?? row.Contracts ?? "0"));
      const capitalAssure = parseFloat(cleanStringNum(row.capitalAssure ?? row.CapitalAssure ?? row.CAPITAL_ASSURE ?? "0"));
      const primesCollectees = parseFloat(cleanStringNum(row.primesCollectees ?? row.PrimesCollectees ?? row.PRIME_NETTE ?? row.primes ?? "0"));

      if (isNaN(contracts)) { errors.push(`${wilaya}: "contracts" invalide`); return; }
      if (isNaN(capitalAssure)) { errors.push(`${wilaya}: "capitalAssure" invalide`); return; }

      rows.push({ 
        wilaya, 
        contracts, 
        capitalAssure, 
        primesCollectees: isNaN(primesCollectees) ? 0 : primesCollectees 
      });
    });

    setParseErrors(errors);
    setParsedRows(rows.length > 0 ? rows : null);
  };

  const handleFile = (file: File) => {
    const validTypes = [".csv", ".txt", ".xlsx", ".xls"];
    if (!validTypes.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setParseErrors(["Seuls les fichiers .csv, .xlsx et .xls sont supportés."]);
      return;
    }
    parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!parsedRows) return;
    setImporting(true);
    setImportResult(null);
    try {
      const r = await fetch(`${API}portfolio/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedRows }),
      });
      const d = await r.json();
      if (d.success) {
        setImportResult({
          success: true,
          message: `${d.wilayas} wilayas importées avec succès.`,
          warnings: d.warnings,
        });
        queryClient.invalidateQueries();
        fetchStatus();
      } else {
        setImportResult({ success: false, message: d.error ?? "Erreur lors de l'import" });
      }
    } catch (e) {
      setImportResult({ success: false, message: "Erreur réseau" });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = async () => {
    await fetch(`${API}portfolio/reset`, { method: "POST" });
    setParsedRows(null);
    setParseErrors([]);
    setFileName("");
    setImportResult(null);
    queryClient.invalidateQueries();
    fetchStatus();
  };

  const totalCapital = parsedRows?.reduce((s, r) => s + r.capitalAssure, 0) ?? 0;
  const totalContracts = parsedRows?.reduce((s, r) => s + r.contracts, 0) ?? 0;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Import Data</h1>
        <p className="text-muted-foreground mt-1">Upload your portfolio CSV to analyse your real data</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Upload Portfolio File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
                  dragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                {fileName ? (
                  <p className="font-medium text-foreground">{fileName}</p>
                ) : (
                  <>
                    <p className="font-medium text-foreground">Drag & drop your portfolio file here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-2">CSV or Excel (.xlsx, .xls) files supported</p>
              </div>

              {parseErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-1">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Errors found
                  </p>
                  {parseErrors.slice(0, 5).map((e, i) => (
                    <p key={i} className="text-xs text-destructive/80 ml-6">{e}</p>
                  ))}
                  {parseErrors.length > 5 && (
                    <p className="text-xs text-destructive/60 ml-6">...and {parseErrors.length - 5} more</p>
                  )}
                </div>
              )}

              {parsedRows && parsedRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {parsedRows.length} wilayas parsed
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {totalContracts.toLocaleString()} contracts · {formatCapital(totalCapital)} total capital
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>

                  <div className="max-h-52 overflow-y-auto rounded-lg border border-border/50">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">Wilaya</th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">Contracts</th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">Capital Assuré</th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">Primes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.map((r, i) => (
                          <tr key={i} className="border-t border-border/30 hover:bg-muted/20">
                            <td className="px-3 py-1.5 font-medium">{r.wilaya}</td>
                            <td className="px-3 py-1.5 text-right">{r.contracts.toLocaleString()}</td>
                            <td className="px-3 py-1.5 text-right">{formatCapital(r.capitalAssure)}</td>
                            <td className="px-3 py-1.5 text-right">{formatCapital(r.primesCollectees)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full"
                  >
                    {importing ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" /> Import & Analyse</>
                    )}
                  </Button>
                </div>
              )}

              {importResult && (
                <div className={`rounded-lg p-4 border ${importResult.success ? "bg-green-500/10 border-green-500/30" : "bg-destructive/10 border-destructive/30"}`}>
                  <p className={`text-sm font-medium flex items-center gap-2 ${importResult.success ? "text-green-500" : "text-destructive"}`}>
                    {importResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {importResult.message}
                  </p>
                  {importResult.warnings && importResult.warnings.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {importResult.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-muted-foreground ml-6">{w}</p>
                      ))}
                    </div>
                  )}
                  {importResult.success && (
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      Navigate to Dashboard, Risk Scores, or Simulation to see your updated analysis.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Current Data Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {status && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Source</span>
                    <Badge variant={status.isCustomData ? "default" : "secondary"}>
                      {status.isCustomData ? "Custom Import" : "Sample Data"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Wilayas</span>
                    <span className="text-sm font-medium">{status.wilayas}</span>
                  </div>
                  {status.importedAt && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-muted-foreground">Imported</span>
                      <span className="text-xs text-right text-muted-foreground">
                        {new Date(status.importedAt).toLocaleString("fr-DZ")}
                      </span>
                    </div>
                  )}
                  {status.isCustomData && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={handleReset}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Reset to Sample Data
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                CSV Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Download the template with all 48 wilayas pre-filled with sample data. Edit the numbers in Excel or any spreadsheet app, then save as CSV.
              </p>
              <div className="bg-muted/40 rounded-md p-3 font-mono text-xs text-muted-foreground">
                <p className="text-foreground font-semibold">Columns:</p>
                <p>• <span className="text-primary">wilaya</span> — wilaya name</p>
                <p>• <span className="text-primary">contracts</span> — nb. of contracts</p>
                <p>• <span className="text-primary">capitalAssure</span> — in DZD</p>
                <p>• <span className="text-primary">primesCollectees</span> — in DZD</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleDownloadTemplate}>
                <Download className="h-3.5 w-3.5 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Supported Wilaya Names</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">The wilaya column must match one of these names (case-insensitive):</p>
              <div className="max-h-48 overflow-y-auto">
                {WILAYA_NAMES.map((n) => (
                  <span key={n} className="inline-block text-xs bg-muted/50 rounded px-1.5 py-0.5 m-0.5">
                    {n}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
