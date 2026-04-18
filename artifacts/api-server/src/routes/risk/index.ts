import { Router, type IRouter } from "express";
import { WILAYA_DATA, SEISMIC_ZONES, computeRiskScore, getRiskLevel } from "../../lib/gamData";

const router: IRouter = Router();

const GAM_RETENTION = 0.30;

router.get("/portfolio/summary", async (_req, res): Promise<void> => {
  const wilayas = WILAYA_DATA;
  const totalContracts = wilayas.reduce((s, w) => s + w.contracts, 0);
  const totalCapitalAssure = wilayas.reduce((s, w) => s + w.capitalAssure, 0);
  const totalPrimesCollectees = wilayas.reduce((s, w) => s + w.primesCollectees, 0);

  let contractsHighRisk = 0, contractsMediumRisk = 0, contractsLowRisk = 0;
  let exposureHighRisk = 0;

  wilayas.forEach(w => {
    const score = computeRiskScore(w);
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
    avgCapitalPerContract: Math.round(totalCapitalAssure / totalContracts),
    contractsHighRisk,
    contractsMediumRisk,
    contractsLowRisk,
    exposureHighRisk,
    pctHighRisk: Math.round((exposureHighRisk / totalCapitalAssure) * 100),
    gamRetentionShare: totalCapitalAssure * GAM_RETENTION,
  });
});

router.get("/portfolio/by-wilaya", async (_req, res): Promise<void> => {
  const result = WILAYA_DATA.map(w => {
    const score = computeRiskScore(w);
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

  const totalContracts = WILAYA_DATA.reduce((s, w) => s + w.contracts, 0);
  const totalCapital = WILAYA_DATA.reduce((s, w) => s + w.capitalAssure, 0);

  res.json(categories.map(c => ({
    category: c.category,
    totalContracts: Math.round(totalContracts * c.pct),
    capitalAssure: Math.round(totalCapital * c.pct),
    pct: Math.round(c.pct * 100),
  })));
});

router.get("/portfolio/by-zone", async (_req, res): Promise<void> => {
  const zoneMap: Record<string, { contracts: number; capital: number }> = {};
  WILAYA_DATA.forEach(w => {
    if (!zoneMap[w.seismicZone]) zoneMap[w.seismicZone] = { contracts: 0, capital: 0 };
    zoneMap[w.seismicZone].contracts += w.contracts;
    zoneMap[w.seismicZone].capital += w.capitalAssure;
  });

  const totalCapital = WILAYA_DATA.reduce((s, w) => s + w.capitalAssure, 0);

  const result = Object.entries(zoneMap).map(([zone, data]) => ({
    zone,
    zoneName: SEISMIC_ZONES[zone]?.name ?? `Zone ${zone}`,
    totalContracts: data.contracts,
    capitalAssure: data.capital,
    pct: Math.round((data.capital / totalCapital) * 100),
    riskMultiplier: SEISMIC_ZONES[zone]?.multiplier ?? 0,
  })).sort((a, b) => b.riskMultiplier - a.riskMultiplier);

  res.json(result);
});

router.get("/risk/scores", async (_req, res): Promise<void> => {
  const result = WILAYA_DATA.map(w => {
    const score = computeRiskScore(w);
    const totalCapital = WILAYA_DATA.reduce((s, x) => s + x.capitalAssure, 0);
    return {
      wilayaCode: w.code,
      wilayaName: w.name,
      seismicZone: w.seismicZone,
      riskScore: score,
      riskLevel: getRiskLevel(score),
      capitalAssure: w.capitalAssure,
      concentrationRisk: Math.round((w.capitalAssure / totalCapital) * 100 * 10) / 10,
      vulnerabilityIndex: Math.round(SEISMIC_ZONES[w.seismicZone]?.multiplier * 100 ?? 0),
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  res.json(result);
});

router.get("/risk/hotspots", async (_req, res): Promise<void> => {
  const withScores = WILAYA_DATA.map(w => ({
    ...w,
    score: computeRiskScore(w),
    riskLevel: getRiskLevel(computeRiskScore(w)),
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
  const result = WILAYA_DATA.map(w => {
    const score = computeRiskScore(w);
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

  const wilaya = WILAYA_DATA.find(w => w.code === wilayaCode);
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
  const recommendations = [
    {
      id: 1,
      type: "reduction",
      priority: "Critical",
      title: "Réduire l'exposition en Zone III",
      description: "La concentration à Alger, Blida et Boumerdès représente plus de 45% du capital assuré en zones à risque maximal. Il est impératif de plafonner la souscription dans ces wilayas.",
      impact: "Réduction potentielle de 35% de la perte maximale possible",
      affectedWilayas: ["Alger", "Blida", "Boumerdès"],
    },
    {
      id: 2,
      type: "increase",
      priority: "High",
      title: "Développer le portefeuille dans les zones sûres",
      description: "Les wilayas du Sud (Adrar, Tamanrasset, Béchar, Ghardaïa, Illizi) en Zone 0 sont sous-représentées. Renforcer la présence commerciale dans ces régions permettrait d'équilibrer le portefeuille.",
      impact: "Diversification géographique et amélioration du ratio de risque",
      affectedWilayas: ["Adrar", "Tamanrasset", "Béchar", "Ghardaïa", "Illizi", "Tindouf"],
    },
    {
      id: 3,
      type: "pricing",
      priority: "High",
      title: "Réévaluation de la tarification en Zone IIb et III",
      description: "Les primes actuelles ne reflètent pas adéquatement le risque réel pour les wilayas de Zone IIb (Oran, Tizi Ouzou, Béjaïa) et Zone III. Une majoration de prime de 20-40% est recommandée.",
      impact: "Amélioration de la rentabilité technique et couverture du risque résiduel",
      affectedWilayas: ["Oran", "Tizi Ouzou", "Béjaïa", "Annaba", "Skikda", "Tipaza"],
    },
    {
      id: 4,
      type: "reinsurance",
      priority: "High",
      title: "Renforcer la protection par réassurance",
      description: "Le capital exposé en Zone III dépasse largement la capacité de rétention de 30% de GAM. Un traité de réassurance catastrophe (Cat XL) est indispensable pour les zones à risque élevé.",
      impact: "Protection du bilan GAM contre les sinistres majeurs",
      affectedWilayas: ["Alger", "Blida", "Boumerdès"],
    },
    {
      id: 5,
      type: "monitoring",
      priority: "Medium",
      title: "Plafonnement des cumuls par zone RPA99",
      description: "Mettre en place des limites automatiques de souscription par zone RPA99. Arrêter toute nouvelle souscription en Zone III au-delà du seuil de rétention actuel.",
      impact: "Prévention de la sur-concentration future",
      affectedWilayas: ["Toutes les wilayas Zone III et IIb"],
    },
    {
      id: 6,
      type: "prevention",
      priority: "Medium",
      title: "Audit de vulnérabilité des constructions",
      description: "Conditionner la souscription en zones sismiques actives à un diagnostic technique préalable des bâtiments selon les normes RPA99. Exclure les constructions non conformes.",
      impact: "Réduction de la vulnérabilité intrinsèque du portefeuille",
      affectedWilayas: ["Zones IIb et III"],
    },
  ];

  res.json(recommendations);
});

export default router;
