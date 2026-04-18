export interface WilayaData {
  code: number;
  name: string;
  seismicZone: string;
  lat: number;
  lng: number;
  contracts: number;
  capitalAssure: number;
  primesCollectees: number;
}

export const SEISMIC_ZONES: Record<string, { name: string; multiplier: number; color: string; baseScore: number }> = {
  "0": { name: "Zone 0 - Négligeable", multiplier: 0.0, color: "#22c55e", baseScore: 0 },
  "I": { name: "Zone I - Faible", multiplier: 0.15, color: "#84cc16", baseScore: 15 },
  "IIa": { name: "Zone IIa - Modérée", multiplier: 0.25, color: "#eab308", baseScore: 30 },
  "IIb": { name: "Zone IIb - Élevée", multiplier: 0.35, color: "#f97316", baseScore: 50 },
  "III": { name: "Zone III - Très élevée", multiplier: 0.50, color: "#ef4444", baseScore: 70 },
};

export const WILAYA_DATA: WilayaData[] = [
  { code: 1, name: "Adrar", seismicZone: "0", lat: 27.87, lng: -0.29, contracts: 48, capitalAssure: 1_200_000_000, primesCollectees: 3_600_000 },
  { code: 2, name: "Chlef", seismicZone: "IIb", lat: 36.16, lng: 1.33, contracts: 312, capitalAssure: 18_500_000_000, primesCollectees: 55_500_000 },
  { code: 3, name: "Laghouat", seismicZone: "I", lat: 33.80, lng: 2.86, contracts: 87, capitalAssure: 3_200_000_000, primesCollectees: 9_600_000 },
  { code: 4, name: "Oum El Bouaghi", seismicZone: "I", lat: 35.87, lng: 7.11, contracts: 124, capitalAssure: 5_400_000_000, primesCollectees: 16_200_000 },
  { code: 5, name: "Batna", seismicZone: "IIa", lat: 35.56, lng: 6.17, contracts: 287, capitalAssure: 14_200_000_000, primesCollectees: 42_600_000 },
  { code: 6, name: "Béjaïa", seismicZone: "IIb", lat: 36.75, lng: 5.06, contracts: 341, capitalAssure: 22_800_000_000, primesCollectees: 68_400_000 },
  { code: 7, name: "Biskra", seismicZone: "I", lat: 34.85, lng: 5.73, contracts: 156, capitalAssure: 6_800_000_000, primesCollectees: 20_400_000 },
  { code: 8, name: "Béchar", seismicZone: "0", lat: 31.62, lng: -2.21, contracts: 61, capitalAssure: 1_800_000_000, primesCollectees: 5_400_000 },
  { code: 9, name: "Blida", seismicZone: "III", lat: 36.47, lng: 2.83, contracts: 578, capitalAssure: 48_600_000_000, primesCollectees: 145_800_000 },
  { code: 10, name: "Bouira", seismicZone: "IIb", lat: 36.37, lng: 3.90, contracts: 289, capitalAssure: 17_400_000_000, primesCollectees: 52_200_000 },
  { code: 11, name: "Tamanrasset", seismicZone: "0", lat: 22.79, lng: 5.52, contracts: 29, capitalAssure: 720_000_000, primesCollectees: 2_160_000 },
  { code: 12, name: "Tébessa", seismicZone: "I", lat: 35.40, lng: 8.12, contracts: 198, capitalAssure: 8_200_000_000, primesCollectees: 24_600_000 },
  { code: 13, name: "Tlemcen", seismicZone: "IIa", lat: 34.88, lng: -1.31, contracts: 324, capitalAssure: 19_600_000_000, primesCollectees: 58_800_000 },
  { code: 14, name: "Tiaret", seismicZone: "IIa", lat: 35.37, lng: 1.32, contracts: 245, capitalAssure: 12_800_000_000, primesCollectees: 38_400_000 },
  { code: 15, name: "Tizi Ouzou", seismicZone: "IIb", lat: 36.71, lng: 4.05, contracts: 456, capitalAssure: 32_400_000_000, primesCollectees: 97_200_000 },
  { code: 16, name: "Alger", seismicZone: "III", lat: 36.74, lng: 3.06, contracts: 1245, capitalAssure: 128_500_000_000, primesCollectees: 385_500_000 },
  { code: 17, name: "Djelfa", seismicZone: "I", lat: 34.68, lng: 3.26, contracts: 134, capitalAssure: 5_600_000_000, primesCollectees: 16_800_000 },
  { code: 18, name: "Jijel", seismicZone: "IIb", lat: 36.82, lng: 5.77, contracts: 187, capitalAssure: 9_800_000_000, primesCollectees: 29_400_000 },
  { code: 19, name: "Sétif", seismicZone: "IIa", lat: 36.19, lng: 5.41, contracts: 489, capitalAssure: 34_200_000_000, primesCollectees: 102_600_000 },
  { code: 20, name: "Saïda", seismicZone: "IIa", lat: 34.83, lng: 0.15, contracts: 112, capitalAssure: 4_800_000_000, primesCollectees: 14_400_000 },
  { code: 21, name: "Skikda", seismicZone: "IIb", lat: 36.88, lng: 6.90, contracts: 276, capitalAssure: 16_200_000_000, primesCollectees: 48_600_000 },
  { code: 22, name: "Sidi Bel Abbès", seismicZone: "IIa", lat: 35.19, lng: -0.64, contracts: 287, capitalAssure: 15_600_000_000, primesCollectees: 46_800_000 },
  { code: 23, name: "Annaba", seismicZone: "IIb", lat: 36.90, lng: 7.76, contracts: 342, capitalAssure: 21_800_000_000, primesCollectees: 65_400_000 },
  { code: 24, name: "Guelma", seismicZone: "IIa", lat: 36.46, lng: 7.43, contracts: 189, capitalAssure: 9_200_000_000, primesCollectees: 27_600_000 },
  { code: 25, name: "Constantine", seismicZone: "IIa", lat: 36.37, lng: 6.61, contracts: 634, capitalAssure: 52_400_000_000, primesCollectees: 157_200_000 },
  { code: 26, name: "Médéa", seismicZone: "IIb", lat: 36.27, lng: 2.75, contracts: 312, capitalAssure: 19_800_000_000, primesCollectees: 59_400_000 },
  { code: 27, name: "Mostaganem", seismicZone: "IIb", lat: 35.93, lng: 0.09, contracts: 198, capitalAssure: 10_400_000_000, primesCollectees: 31_200_000 },
  { code: 28, name: "M'Sila", seismicZone: "I", lat: 35.71, lng: 4.54, contracts: 176, capitalAssure: 7_200_000_000, primesCollectees: 21_600_000 },
  { code: 29, name: "Mascara", seismicZone: "IIa", lat: 35.40, lng: 0.14, contracts: 212, capitalAssure: 11_200_000_000, primesCollectees: 33_600_000 },
  { code: 30, name: "Ouargla", seismicZone: "0", lat: 31.95, lng: 5.33, contracts: 89, capitalAssure: 4_200_000_000, primesCollectees: 12_600_000 },
  { code: 31, name: "Oran", seismicZone: "IIb", lat: 35.69, lng: -0.63, contracts: 712, capitalAssure: 68_400_000_000, primesCollectees: 205_200_000 },
  { code: 32, name: "El Bayadh", seismicZone: "I", lat: 33.68, lng: 1.02, contracts: 54, capitalAssure: 2_100_000_000, primesCollectees: 6_300_000 },
  { code: 33, name: "Illizi", seismicZone: "0", lat: 26.48, lng: 8.47, contracts: 18, capitalAssure: 480_000_000, primesCollectees: 1_440_000 },
  { code: 34, name: "Bordj Bou Arreridj", seismicZone: "IIa", lat: 36.07, lng: 4.76, contracts: 187, capitalAssure: 9_600_000_000, primesCollectees: 28_800_000 },
  { code: 35, name: "Boumerdès", seismicZone: "III", lat: 36.76, lng: 3.48, contracts: 423, capitalAssure: 38_200_000_000, primesCollectees: 114_600_000 },
  { code: 36, name: "El Tarf", seismicZone: "IIa", lat: 36.77, lng: 8.31, contracts: 124, capitalAssure: 5_800_000_000, primesCollectees: 17_400_000 },
  { code: 37, name: "Tindouf", seismicZone: "0", lat: 27.67, lng: -8.14, contracts: 12, capitalAssure: 320_000_000, primesCollectees: 960_000 },
  { code: 38, name: "Tissemsilt", seismicZone: "IIa", lat: 35.61, lng: 1.81, contracts: 98, capitalAssure: 4_200_000_000, primesCollectees: 12_600_000 },
  { code: 39, name: "El Oued", seismicZone: "0", lat: 33.37, lng: 6.87, contracts: 76, capitalAssure: 3_100_000_000, primesCollectees: 9_300_000 },
  { code: 40, name: "Khenchela", seismicZone: "I", lat: 35.43, lng: 7.14, contracts: 112, capitalAssure: 4_600_000_000, primesCollectees: 13_800_000 },
  { code: 41, name: "Souk Ahras", seismicZone: "IIa", lat: 36.29, lng: 7.95, contracts: 143, capitalAssure: 6_800_000_000, primesCollectees: 20_400_000 },
  { code: 42, name: "Tipaza", seismicZone: "IIb", lat: 36.59, lng: 2.45, contracts: 287, capitalAssure: 18_600_000_000, primesCollectees: 55_800_000 },
  { code: 43, name: "Mila", seismicZone: "IIa", lat: 36.45, lng: 6.26, contracts: 165, capitalAssure: 8_200_000_000, primesCollectees: 24_600_000 },
  { code: 44, name: "Aïn Defla", seismicZone: "IIb", lat: 36.26, lng: 1.96, contracts: 198, capitalAssure: 10_800_000_000, primesCollectees: 32_400_000 },
  { code: 45, name: "Naâma", seismicZone: "I", lat: 33.27, lng: -0.31, contracts: 54, capitalAssure: 2_200_000_000, primesCollectees: 6_600_000 },
  { code: 46, name: "Aïn Témouchent", seismicZone: "IIb", lat: 35.30, lng: -1.14, contracts: 187, capitalAssure: 9_400_000_000, primesCollectees: 28_200_000 },
  { code: 47, name: "Ghardaïa", seismicZone: "0", lat: 32.49, lng: 3.67, contracts: 98, capitalAssure: 4_800_000_000, primesCollectees: 14_400_000 },
  { code: 48, name: "Relizane", seismicZone: "IIb", lat: 35.73, lng: 0.56, contracts: 198, capitalAssure: 10_200_000_000, primesCollectees: 30_600_000 },
];

export function computeRiskScore(w: WilayaData, dataset?: WilayaData[]): number {
  const zone = SEISMIC_ZONES[w.seismicZone];
  const baseScore = zone ? zone.baseScore : 0;
  const data = dataset ?? WILAYA_DATA;
  const totalCapital = data.reduce((s, x) => s + x.capitalAssure, 0);
  const concentrationFactor = totalCapital > 0 ? w.capitalAssure / totalCapital : 0;
  const concentrationBonus = Math.min(concentrationFactor * 300, 30);
  return Math.min(100, Math.round(baseScore + concentrationBonus));
}

export function getRiskLevel(score: number): string {
  if (score >= 60) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

export function getCategory(type: string): string {
  const categories = ["Bien Immobilier", "Installation Commerciale", "Installation Industrielle"];
  return categories[Math.abs(type.charCodeAt(0)) % 3];
}
