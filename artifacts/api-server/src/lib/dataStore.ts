import { WILAYA_DATA, type WilayaData } from "./gamData";

let currentData: WilayaData[] = WILAYA_DATA.map(w => ({
  ...w,
  contracts: 0,
  capitalAssure: 0,
  primesCollectees: 0
}));
let isCustomData = false;
let importedAt: string | null = null;

export function getData(): WilayaData[] {
  return currentData;
}

export function setData(data: WilayaData[]): void {
  currentData = data;
  isCustomData = true;
  importedAt = new Date().toISOString();
}

export function resetData(): void {
  currentData = WILAYA_DATA.map(w => ({
    ...w,
    contracts: 0,
    capitalAssure: 0,
    primesCollectees: 0
  }));
  isCustomData = false;
  importedAt = null;
}

export function getDataStatus(): { isCustomData: boolean; importedAt: string | null; wilayas: number } {
  return { isCustomData, importedAt, wilayas: currentData.length };
}
