export interface WilayaData {
  code: string;
  name: string;
  lat: number;
  lng: number;
  seismicZone: string;
  contracts: number;
  capitalAssure: number;
  primesCollectees: number;
}

export const WILAYA_COORDS: Record<string, { name: string; lat: number; lng: number }> = {
  '1': { 'name': 'Adrar', 'lat': 27.8, 'lng': -0.2 },
  '2': { 'name': 'Chlef', 'lat': 36.2, 'lng': 1.3 },
  '3': { 'name': 'Laghouat', 'lat': 33.8, 'lng': 2.9 },
  '4': { 'name': 'Oum El Bouaghi', 'lat': 35.9, 'lng': 7.1 },
  '5': { 'name': 'Batna', 'lat': 35.6, 'lng': 6.2 },
  '6': { 'name': 'Bejaia', 'lat': 36.7, 'lng': 5.1 },
  '7': { 'name': 'Biskra', 'lat': 34.8, 'lng': 5.7 },
  '8': { 'name': 'Bechar', 'lat': 31.6, 'lng': -2.2 },
  '9': { 'name': 'Blida', 'lat': 36.5, 'lng': 2.8 },
  '10': { 'name': 'Bouira', 'lat': 36.4, 'lng': 3.9 },
  '11': { 'name': 'Tamanrasset', 'lat': 22.8, 'lng': 5.5 },
  '12': { 'name': 'Tebessa', 'lat': 35.4, 'lng': 8.1 },
  '13': { 'name': 'Tlemcen', 'lat': 34.9, 'lng': -1.3 },
  '14': { 'name': 'Tiaret', 'lat': 35.4, 'lng': 1.3 },
  '15': { 'name': 'Tizi Ouzou', 'lat': 36.7, 'lng': 4.1 },
  '16': { 'name': 'Algiers', 'lat': 36.8, 'lng': 3.0 },
  '17': { 'name': 'Djelfa', 'lat': 34.7, 'lng': 3.3 },
  '18': { 'name': 'Jijel', 'lat': 36.8, 'lng': 5.8 },
  '19': { 'name': 'Setif', 'lat': 36.2, 'lng': 5.4 },
  '20': { 'name': 'Saida', 'lat': 34.8, 'lng': 0.2 },
  '21': { 'name': 'Skikda', 'lat': 36.9, 'lng': 6.9 },
  '22': { 'name': 'Sidi Bel Abbes', 'lat': 35.2, 'lng': -0.6 },
  '23': { 'name': 'Annaba', 'lat': 36.9, 'lng': 7.8 },
  '24': { 'name': 'Guelma', 'lat': 36.5, 'lng': 7.5 },
  '25': { 'name': 'Constantine', 'lat': 36.4, 'lng': 6.6 },
  '26': { 'name': 'Medea', 'lat': 36.3, 'lng': 2.8 },
  '27': { 'name': 'Mostaganem', 'lat': 35.9, 'lng': 0.1 },
  '28': { 'name': "M'Sila", 'lat': 35.7, 'lng': 4.5 },
  '29': { 'name': 'Mascara', 'lat': 35.4, 'lng': 0.1 },
  '30': { 'name': 'Ouargla', 'lat': 32.0, 'lng': 5.4 },
  '31': { 'name': 'Oran', 'lat': 35.7, 'lng': -0.6 },
  '32': { 'name': 'El Bayadh', 'lat': 33.7, 'lng': 1.0 },
  '33': { 'name': 'Illizi', 'lat': 26.5, 'lng': 8.5 },
  '34': { 'name': 'Bordj Bou Arreridj', 'lat': 36.1, 'lng': 4.8 },
  '35': { 'name': 'Boumerdes', 'lat': 36.8, 'lng': 3.5 },
  '36': { 'name': 'El Tarf', 'lat': 36.8, 'lng': 8.3 },
  '37': { 'name': 'Tindouf', 'lat': 27.7, 'lng': -8.1 },
  '38': { 'name': 'Tissemsilt', 'lat': 35.6, 'lng': 1.8 },
  '39': { 'name': 'El Oued', 'lat': 33.4, 'lng': 7.0 },
  '40': { 'name': 'Khenchela', 'lat': 35.4, 'lng': 7.1 },
  '41': { 'name': 'Souk Ahras', 'lat': 36.3, 'lng': 7.9 },
  '42': { 'name': 'Tipaza', 'lat': 36.6, 'lng': 2.4 },
  '43': { 'name': 'Mila', 'lat': 36.5, 'lng': 6.3 },
  '44': { 'name': 'Ain Defla', 'lat': 36.3, 'lng': 2.2 },
  '45': { 'name': 'Naama', 'lat': 33.3, 'lng': -0.3 },
  '46': { 'name': 'Ain Temouchent', 'lat': 35.3, 'lng': -1.1 },
  '47': { 'name': 'Ghardaia', 'lat': 32.5, 'lng': 3.7 },
  '48': { 'name': 'Relizane', 'lat': 35.7, 'lng': 0.5 },
};

export const SEISMIC_ZONES: Record<string, string> = {
  '16': 'III', '9': 'III', '35': 'III', '31': 'IIb', '15': 'IIb',
  '6': 'IIb', '23': 'IIb', '26': 'IIb', '2': 'IIb', '10': 'IIb',
  '42': 'IIb', '21': 'IIb', '18': 'IIb', '27': 'IIb', '44': 'IIb',
  '46': 'IIb', '48': 'IIb', '25': 'IIa', '19': 'IIa', '13': 'IIa',
  '5': 'IIa', '22': 'IIa', '14': 'IIa', '24': 'IIa', '29': 'IIa',
  '34': 'IIa', '41': 'IIa', '43': 'IIa', '4': 'I', '12': 'I',
  '17': 'I', '20': 'I', '28': 'I', '38': 'I', '40': 'I', '47': 'I',
  '1': '0', '3': '0', '7': '0', '8': '0', '11': '0', '30': '0',
  '32': '0', '33': '0', '36': '0', '37': '0', '39': '0', '45': '0'
};

export const WILAYA_DATA: WilayaData[] = Object.keys(WILAYA_COORDS).map(code => ({
  code,
  name: WILAYA_COORDS[code].name,
  lat: WILAYA_COORDS[code].lat,
  lng: WILAYA_COORDS[code].lng,
  seismicZone: SEISMIC_ZONES[code] || '0',
  contracts: 0,
  capitalAssure: 0,
  primesCollectees: 0
}));

export function computeRiskScore(wilaya: WilayaData, allWilayas: WilayaData[]): number {
  const zoneWeights: Record<string, number> = { 'III': 50, 'IIb': 35, 'IIa': 25, 'I': 10, '0': 0 };
  const baseScore = zoneWeights[wilaya.seismicZone] || 0;
  
  const totalCapital = allWilayas.reduce((s, w) => s + w.capitalAssure, 0);
  const concentration = totalCapital > 0 ? (wilaya.capitalAssure / totalCapital) * 100 : 0;
  
  const finalScore = Math.min(100, baseScore + (concentration * 3));
  return finalScore;
}

export function getRiskLevel(score: number): string {
  if (score >= 60) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}
