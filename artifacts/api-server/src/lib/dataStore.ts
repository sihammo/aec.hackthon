import { WILAYA_DATA, type WilayaData } from "./gamData";
import { db, portfolioTable } from "@workspace/db";
import { eq } from "drizzle-orm";

let memoryData: WilayaData[] = [...WILAYA_DATA];

export async function getData(): Promise<WilayaData[]> {
  try {
    // If we have a DB connection, try to fetch from it
    if (process.env.DATABASE_URL) {
      const results = await db.query.portfolioTable.findMany();
      if (results.length > 0) {
        return results.map(r => ({
          code: r.wilayaCode,
          name: r.wilayaName,
          contracts: r.contracts,
          capitalAssure: r.capitalAssure,
          primesCollectees: r.primesCollectees,
          seismicZone: "0", // Default if missing, but we should handle this better
          lat: 0,
          lng: 0,
          ...WILAYA_DATA.find(w => w.code === r.wilayaCode) // Merge with coordinates/zone mapping
        }));
      }
    }
  } catch (err) {
    console.error("Database fetch failed, falling back to memory:", err);
  }
  return memoryData;
}

export async function setData(data: WilayaData[]): Promise<void> {
  memoryData = data;
  
  try {
    if (process.env.DATABASE_URL) {
      // Clear old data and insert new
      await db.delete(portfolioTable);
      
      const insertData = data.map(w => ({
        wilayaCode: w.code,
        wilayaName: w.name,
        contracts: w.contracts,
        capitalAssure: w.capitalAssure,
        primesCollectees: w.primesCollectees,
        category: "Bien Immobilier", // Could be dynamic later
      }));
      
      if (insertData.length > 0) {
        await db.insert(portfolioTable).values(insertData);
      }
    }
  } catch (err) {
    console.error("Database save failed:", err);
  }
}

export async function resetData(): Promise<void> {
  memoryData = [...WILAYA_DATA];
  try {
    if (process.env.DATABASE_URL) {
      await db.delete(portfolioTable);
    }
  } catch (err) {
    console.error("Database reset failed:", err);
  }
}

export async function getDataStatus() {
  const data = await getData();
  return { 
    isCustomData: data.length !== WILAYA_DATA.length || data[0].contracts !== WILAYA_DATA[0].contracts, 
    wilayas: data.length 
  };
}
