import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCapital(value: number): string {
  if (!value) return "0.0 Mrds DZD";
  const inMilliards = value / 1000000000;
  return `${inMilliards.toFixed(1)} Mrds DZD`;
}

export function formatPercent(value: number): string {
  if (value === undefined || value === null) return "0.0%";
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  amber: "#f59e0b",
  pink: "#ec4899",
};

export const CHART_COLOR_LIST = [
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.amber,
  CHART_COLORS.red,
  CHART_COLORS.green,
];

export const RISK_COLORS = {
  High: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50",
  Medium: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50",
  Low: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50",
};
