import { Router } from "express";
import { SEISMIC_ZONES, computeRiskScore, getRiskLevel, WILAYA_DATA } from "../../lib/gamData";
import { getData, setData, resetData, getDataStatus } from "../../lib/dataStore";

const router: Router = Router();

const GAM_RETENTION = 0.30;

router.get("/portfolio/summary", async (_req, res): Promise<void> => {
  const wilayas = getData();
  const totalContracts = wilayas.reduce((s, w) => s + w.contracts, 0);
  const totalCapitalAssure = wilayas.reduce((s, w) => s + w.capitalAssure, 0);
  const totalPrimesCollectees = wilayas.reduce((s, w) => s + w.primesCollectees, 0);

  let contractsHighRisk = 0, contractsMediumRisk = 0, contractsLowRisk = 0;
  let exposureHighRisk = 0;

  wilayas.forEach(w => {
    const score = computeRiskScore(w, wilayas);
    const level = getRiskLevel(score);
    if (level === "High") {
      contractsHighRisk += w.contracts;
      exposureHighRisk += w.capitalAssure;
    } else if (level === "Medium") {
      contractsMediumRisk += w.contracts;
    } else {
      contractsLowRisk += w.contracts;
    }
  });

  res.json({
    totalContracts,
    totalCapitalAssure,
    totalPrimesCollectees,
    avgCapitalPerContract: totalContracts > 0 ? Math.round(totalCapitalAssure / totalContracts) : 0,
    contractsHighRisk,
    contractsMediumRisk,
    contractsLowRisk,
    exposureHighRisk,
    pctHighRisk: totalCapitalAssure > 0 ? Math.round((exposureHighRisk / totalCapitalAssure) * 100) : 0,
    gamRetentionShare: totalCapitalAssure * GAM_RETENTION,
  });
});

router.get("/portfolio/by-wilaya", async (_req, res): Promise<void> => {
  const wilayas = getData();
  const result = wilayas.map(w => {
    const score = computeRiskScore(w, wilayas);
    return {
      wilayaCode: w.code,
      wilayaName: w.name,
      seismicZone: w.seismicZone,
      totalContracts: w.contracts,
      capitalAssure: w.capitalAssure,
      primesCollectees: w.primesCollectees,
      riskScore: score,
      riskLevel: getRiskLevel(score),
      lat: w.lat,
      lng: w.lng,
    };
  }).sort((a, b) => b.capitalAssure - a.capitalAssure);

  res.json(result);
});

router.get("/portfolio/by-category", async (_req, res): Promise<void> => {
  const categories = [
    { category: "Bien Immobilier", pct: 0.55 },
    { category: "Installation Commerciale", pct: 0.28 },
    { category: "Installation Industrielle", pct: 0.17 },
  ];

  const wilayas = getData();
  const totalContracts = wilayas.reduce((s, w) => s + w.contracts, 0);
  const totalCapital = wilayas.reduce((s, w) => s + w.capitalAssure, 0);

  res.json(categories.map(c => ({
    category: c.category,
    totalContracts: Math.round(totalContracts * c.pct),
    capitalAssure: Math.round(totalCapital * c.pct),
    pct: Math.round(c.pct * 100),
  })));
});

router.get("/portfolio/by-zone", async (_req, res): Promise<void> => {
  const wilayas = getData();
  const zoneMap: Record<string, { contracts: number; capital: number }> = {};
  wilayas.forEach(w => {
    if (!zoneMap[w.seismicZone]) zoneMap[w.seismicZone] = { contracts: 0, capital: 0 };
    zoneMap[w.seismicZone].contracts += w.contracts;
    zoneMap[w.seismicZone].capital += w.capitalAssure;
  });

  const totalCapital = wilayas.reduce((s, w) => s + w.capitalAssure, 0);

  const result = Object.entries(zoneMap).map(([zone, data]) => ({
    zone,
    zoneName: SEISMIC_ZONES[zone]?.name ?? `Zone ${zone}`,
    totalContracts: data.contracts,
    capitalAssure: data.capital,
    pct: totalCapital > 0 ? Math.round((data.capital / totalCapital) * 100) : 0,
    riskMultiplier: SEISMIC_ZONES[zone]?.multiplier ?? 0,
  })).sort((a, b) => b.riskMultiplier - a.riskMultiplier);

  res.json(result);
});

router.get("/risk/scores", async (_req, res): Promise<void> => {
  const wilayas = getData();
  const totalCapital = wilayas.reduce((s, x) => s + x.capitalAssure, 0);
  const result = wilayas.map(w => {
    const score = computeRiskScore(w, wilayas);
    return {
      wilayaCode: w.code,
      wilayaName: w.name,
      seismicZone: w.seismicZone,
      riskScore: score,
      riskLevel: getRiskLevel(score),
      capitalAssure: w.capitalAssure,
      concentrationRisk: totalCapital > 0 ? Math.round((w.capitalAssure / totalCapital) * 100 * 10) / 10 : 0,
      vulnerabilityIndex: Math.round((SEISMIC_ZONES[w.seismicZone]?.multiplier ?? 0) * 100),
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  res.json(result);
});

router.get("/risk/hotspots", async (_req, res): Promise<void> => {
  const wilayas = getData();
  const withScores = wilayas.map(w => ({
    ...w,
    score: computeRiskScore(w, wilayas),
    riskLevel: getRiskLevel(computeRiskScore(w, wilayas)),
  }));

  const hotspots = withScores
    .filter(w => w.riskLevel === "High")
    .sort((a, b) => b.capitalAssure - a.capitalAssure)
    .slice(0, 8)
    .map(w => ({
      wilayaName: w.name,
      seismicZone: w.seismicZone,
      capitalAssure: w.capitalAssure,
      riskScore: w.score,
      reason: generateHotspotReason(w.name, w.seismicZone, w.capitalAssure),
    }));

  res.json(hotspots);
});

function generateHotspotReason(name: string, zone: string, capital: number): string {
  const reasons: Record<string, string> = {
    "Alger": "Capitale nationale avec forte concentration de contrats en Zone III - risque maximal",
    "Boumerdès": "Zone III - Épicentre du séisme de 2003 - vulnérabilité extrême",
    "Blida": "Zone III - Forte densité urbaine et industrielle - exposition critique",
    "Oran": "Grande métropole en Zone IIb - concentration élevée de risques commerciaux",
    "Constantine": "Pôle économique majeur en Zone IIa - concentration importante",
    "Sétif": "Zone IIa - Hub industriel avec forte exposition commerciale",
    "Tizi Ouzou": "Zone IIb - Zone montagneuse avec accès difficile post-sinistre",
    "Béjaïa": "Zone IIb - Port industriel stratégique - risques cumulés",
  };
  return reasons[name] ?? `Zone ${zone} - Capital assuré de ${(capital / 1e9).toFixed(1)} Mrds DZD`;
}

router.get("/risk/map-data", async (_req, res): Promise<void> => {
  const wilayas = getData();
  const result = wilayas.map(w => {
    const score = computeRiskScore(w, wilayas);
    return {
      wilayaCode: w.code,
      wilayaName: w.name,
      lat: w.lat,
      lng: w.lng,
      seismicZone: w.seismicZone,
      riskLevel: getRiskLevel(score),
      riskScore: score,
      capitalAssure: w.capitalAssure,
      totalContracts: w.contracts,
    };
  });
  res.json(result);
});

router.post("/simulation/run", async (req, res): Promise<void> => {
  const { wilayaCode, magnitude, scenario } = req.body;

  const wilaya = getData().find(w => w.code === wilayaCode);
  if (!wilaya) {
    res.status(404).json({ error: "Wilaya not found" });
    return;
  }

  const zone = SEISMIC_ZONES[wilaya.seismicZone];
  const baseLossRate = zone?.multiplier ?? 0;

  const magnitudeMultiplier = Math.pow(10, (magnitude - 5) * 0.3);
  const scenarioMultipliers: Record<string, number> = {
    "optimistic": 0.5,
    "moderate": 1.0,
    "pessimistic": 1.8,
    "catastrophic": 3.0,
  };

  const scenarioMult = scenarioMultipliers[scenario] ?? 1.0;
  const lossRate = Math.min(0.95, baseLossRate * magnitudeMultiplier * scenarioMult);
  const estimatedLoss = wilaya.capitalAssure * lossRate;
  const gamLoss = estimatedLoss * GAM_RETENTION;
  const affectedContracts = Math.round(wilaya.contracts * lossRate * 0.8);

  const categoryBreakdown = [
    { category: "Bien Immobilier", contracts: Math.round(affectedContracts * 0.55), exposure: wilaya.capitalAssure * 0.55, loss: estimatedLoss * 0.55 },
    { category: "Installation Commerciale", contracts: Math.round(affectedContracts * 0.28), exposure: wilaya.capitalAssure * 0.28, loss: estimatedLoss * 0.28 },
    { category: "Installation Industrielle", contracts: Math.round(affectedContracts * 0.17), exposure: wilaya.capitalAssure * 0.17, loss: estimatedLoss * 0.17 },
  ];

  let severity: string;
  if (lossRate >= 0.4) severity = "Catastrophique";
  else if (lossRate >= 0.2) severity = "Majeur";
  else if (lossRate >= 0.1) severity = "Modéré";
  else severity = "Mineur";

  res.json({
    wilayaName: wilaya.name,
    seismicZone: wilaya.seismicZone,
    magnitude,
    scenario,
    totalExposure: wilaya.capitalAssure,
    estimatedLoss,
    gamShare: GAM_RETENTION,
    gamLoss,
    affectedContracts,
    lossRatio: Math.round(lossRate * 100),
    severity,
    breakdown: categoryBreakdown,
  });
});

router.get("/recommendations", async (_req, res): Promise<void> => {
  const wilayas = getData();
  const totalCapital = wilayas.reduce((s, w) => s + w.capitalAssure, 0);
  
  const byZone: Record<string, number> = {};
  wilayas.forEach(w => {
    byZone[w.seismicZone] = (byZone[w.seismicZone] || 0) + w.capitalAssure;
  });

  const zone3Pct = totalCapital > 0 ? (byZone["III"] || 0) / totalCapital : 0;
  const highRiskWilayas = wilayas
    .map(w => ({ name: w.name, score: computeRiskScore(w, wilayas), exposure: w.capitalAssure }))
    .filter(w => w.score >= 60)
    .sort((a, b) => b.exposure - a.exposure);

  const safeZonePct = totalCapital > 0 ? ((byZone["0"] || 0) + (byZone["I"] || 0)) / totalCapital : 0;

  const recommendations = [];

  // 1. Critical: Over-concentration in Zone III
  if (zone3Pct > 0.35) {
    recommendations.push({
      id: 1,
      type: "reduction",
      priority: "Critical",
      title: "Réduction drastique en Zone III",
      description: `L'exposition en Zone III représente ${(zone3Pct * 100).toFixed(1)}% du portefeuille. Cette concentration dépasse le seuil de sécurité de 35%.`,
      impact: "Protection contre les sinistres catastrophiques majeurs.",
      affectedWilayas: wilayas.filter(w => w.seismicZone === "III").map(w => w.name),
    });
  }

  // 2. High: Specific Hotspot
  if (highRiskWilayas.length > 0) {
    const top = highRiskWilayas[0];
    recommendations.push({
      id: 2,
      type: "reinsurance",
      priority: "High",
      title: `Protection ponctuelle: ${top.name}`,
      description: `${top.name} présente le score de risque le plus élevé (${top.score}/100) avec une exposition de ${(top.exposure / 1e9).toFixed(1)} Mrds DZD.`,
      impact: "Limitation de la perte maximale possible (PML).",
      affectedWilayas: [top.name],
    });
  }

  // 3. High: Diversification Opportunity
  if (safeZonePct < 0.20) {
    recommendations.push({
      id: 3,
      type: "increase",
      priority: "High",
      title: "Accélérer la croissance en Zones 0 et I",
      description: "Moins de 20% de votre capital assuré est situé dans des zones à risque négligeable ou faible. Le portefeuille est déséquilibré vers le nord s'intéressant.",
      impact: "Équilibrage statistique du risque global (Mutualisation).",
      affectedWilayas: wilayas.filter(w => w.seismicZone === "0" || w.seismicZone === "I").slice(0, 6).map(w => w.name),
    });
  }

  // 4. Medium: Pricing adjustment
  const lowPremiumWilayas = wilayas.filter(w => w.capitalAssure > 0 && w.primesCollectees / w.capitalAssure < 0.003 && (w.seismicZone === "III" || w.seismicZone === "IIb"));
  if (lowPremiumWilayas.length > 0) {
    recommendations.push({
      id: 4,
      type: "pricing",
      priority: "Medium",
      title: "Révision des taux techniques",
      description: `${lowPremiumWilayas.length} wilayas en zone à risque élevé ont des ratios primes/capital inférieurs à 0.3%.`,
      impact: "Amélioration de la rentabilité technique par rapport au coût du risque.",
      affectedWilayas: lowPremiumWilayas.map(w => w.name).slice(0, 5),
    });
  }

  // 5. General: Monitoring
  recommendations.push({
    id: 5,
    type: "monitoring",
    priority: "Medium",
    title: "Audit de conformité RPA99",
    description: "Mettre en œuvre un contrôle systématique des certificats de conformité parasismique pour tout nouveau contrat > 500M DZD.",
    impact: "Réduction de la vulnérabilité intrinsèque du parc assuré.",
    affectedWilayas: ["Toutes les zones IIa, IIb, III"],
  });

  res.json(recommendations);
});

router.get("/portfolio/import-status", async (_req, res): Promise<void> => {
  res.json(getDataStatus());
});

router.get("/portfolio/template", async (_req, res): Promise<void> => {
  const headers = "wilaya,contracts,capitalAssure,primesCollectees";
  const rows = WILAYA_DATA.map(w =>
    `${w.name},${w.contracts},${w.capitalAssure},${w.primesCollectees}`
  ).join("\n");
  const csv = `${headers}\n${rows}`;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=gam_portfolio_template.csv");
  res.send(csv);
});

router.post("/portfolio/import", async (req, res): Promise<void> => {
  const { rows } = req.body as { rows: { wilaya: string; contracts: number; capitalAssure: number; primesCollectees: number }[] };

  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ error: "rows array is required and must not be empty" });
    return;
  }

  const errors: string[] = [];
  const merged = WILAYA_DATA.map(w => {
    const row = rows.find(r => r.wilaya.trim().toLowerCase() === w.name.toLowerCase());
    if (!row) return w;
    if (typeof row.contracts !== "number" || row.contracts < 0) {
      errors.push(`${w.name}: contracts invalide`);
      return w;
    }
    if (typeof row.capitalAssure !== "number" || row.capitalAssure < 0) {
      errors.push(`${w.name}: capitalAssure invalide`);
      return w;
    }
    return {
      ...w,
      contracts: Math.round(row.contracts),
      capitalAssure: row.capitalAssure,
      primesCollectees: typeof row.primesCollectees === "number" && row.primesCollectees >= 0
        ? row.primesCollectees
        : row.capitalAssure * 0.003,
    };
  });

  if (errors.length > rows.length / 2) {
    res.status(400).json({ error: "Trop d'erreurs dans le fichier", details: errors });
    return;
  }

  setData(merged);
  const status = getDataStatus();
  res.json({ success: true, wilayas: status.wilayas, importedAt: status.importedAt, warnings: errors });
});

router.post("/portfolio/reset", async (_req, res): Promise<void> => {
  resetData();
  res.json({ success: true, message: "Données réinitialisées aux valeurs par défaut" });
});

export default router;
