import { useState, useEffect, useRef } from "react";
import { RefreshCw, ChevronDown, Check, Sun, Moon, Printer } from "lucide-react";

const INTERVAL_OPTIONS = [
  { label: "Every 30s", ms: 30 * 1000 },
  { label: "Every 1m", ms: 60 * 1000 },
  { label: "Every 5m", ms: 5 * 60 * 1000 },
];

export function DashboardControls({ 
  loading, 
  onRefresh, 
}: { 
  loading: boolean; 
  onRefresh: () => void;
  lastRefreshed?: string | null;
}) {
  const [isDark, setIsDark] = useState(true); // Default dark
  const [isSpinning, setIsSpinning] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedIntervalMs, setSelectedIntervalMs] = useState(INTERVAL_OPTIONS[2].ms);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Force dark mode on mount
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    if (loading) {
      setIsSpinning(true);
      return undefined;
    } else {
      const t = setTimeout(() => setIsSpinning(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      onRefresh();
    }, selectedIntervalMs);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedIntervalMs, onRefresh]);

  const btnStyle = {
    backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
    color: isDark ? "#c8c9cc" : "#4b5563",
  };

  return (
    <div className="flex items-center gap-3 pt-2 print:hidden">
      {/* Split Refresh */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center rounded-[6px] overflow-hidden h-[26px] text-[12px]" style={btnStyle}>
          <button 
            onClick={onRefresh} 
            disabled={loading} 
            className="flex items-center gap-1 px-2 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="w-px h-4 shrink-0" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
          <button 
            onClick={() => setDropdownOpen((o) => !o)} 
            className="flex items-center justify-center px-1.5 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {dropdownOpen && (
          <div 
            className="absolute top-full right-0 mt-1 w-48 rounded-md border shadow-md bg-popover text-popover-foreground z-50 p-1"
          >
            <div className="px-2 py-1.5 flex items-center justify-between border-b mb-1">
              <span className="text-xs font-medium">Auto-refresh</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <div className="w-7 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex flex-col">
              {INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.ms}
                  onClick={() => {
                    setSelectedIntervalMs(opt.ms);
                    setAutoRefresh(true);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-muted rounded-sm text-left"
                >
                  <span className={!autoRefresh || selectedIntervalMs !== opt.ms ? "text-muted-foreground" : ""}>
                    {opt.label}
                  </span>
                  {autoRefresh && selectedIntervalMs === opt.ms && <Check className="w-3 h-3 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => window.print()}
        disabled={loading}
        className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors disabled:opacity-50"
        style={btnStyle}
        aria-label="Export as PDF"
      >
        <Printer className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setIsDark((d) => !d)}
        className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors"
        style={btnStyle}
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
