# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## GAM Seismic Risk Dashboard

A full-stack risk intelligence platform for GAM insurance company to manage seismic risk exposure across Algeria.

### Artifact: `gam-risk-dashboard` (React+Vite, previewPath: `/`)

**Pages:**
- `/` — Risk Intelligence Dashboard (KPIs, charts, hotspots)
- `/map` — Interactive Leaflet map of Algeria with risk markers per wilaya
- `/portfolio` — Portfolio analysis by zone, category, wilaya table
- `/risk` — Risk scores matrix (sortable, searchable) for all 48 wilayas
- `/simulation` — Earthquake scenario simulation (magnitude slider, scenario select)
- `/recommendations` — Strategic recommendations grouped by priority

**Key Features:**
- RPA99 seismic zone classification (Zone 0 to Zone III)
- Risk Score computation per wilaya (base score from seismic zone + concentration bonus)
- Risk Levels: High (≥60), Medium (30-59), Low (<30)
- Earthquake simulation model: magnitude + scenario → estimated loss for GAM (30% retention)
- 6 strategic recommendations with priority (Critical/High/Medium) and type icons
- CSV export per chart, PDF export, dark mode toggle, auto-refresh

### Artifact: `api-server` (Express 5, previewPath: `/api`)

**Endpoints:**
- `GET /api/portfolio/summary` — Total KPIs
- `GET /api/portfolio/by-wilaya` — Per wilaya breakdown
- `GET /api/portfolio/by-category` — By property type
- `GET /api/portfolio/by-zone` — By RPA99 seismic zone
- `GET /api/risk/scores` — Risk scores for all wilayas
- `GET /api/risk/hotspots` — Top 8 high-risk hotspots
- `GET /api/risk/map-data` — Map coordinates + risk data
- `POST /api/simulation/run` — Run earthquake scenario simulation
- `GET /api/recommendations` — Strategic recommendations

**Data:** Hardcoded dataset for 48 Algerian wilayas with capital assuré, contracts, seismic zones, coordinates.
