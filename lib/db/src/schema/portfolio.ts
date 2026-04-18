import { pgTable, text, doublePrecision, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const portfolioTable = pgTable("portfolio", {
  id: uuid("id").primaryKey().defaultRandom(),
  wilayaCode: text("wilaya_code").notNull(),
  wilayaName: text("wilaya_name").notNull(),
  contracts: integer("contracts").notNull().default(0),
  capitalAssure: doublePrecision("capital_assure").notNull().default(0),
  primesCollectees: doublePrecision("primes_collectees").notNull().default(0),
  category: text("category").default("Bien Immobilier"),
  importedAt: timestamp("imported_at").defaultNow(),
});

export const insertPortfolioSchema = createInsertSchema(portfolioTable);
export const selectPortfolioSchema = createSelectSchema(portfolioTable);

export type PortfolioItem = z.infer<typeof selectPortfolioSchema>;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioSchema>;
