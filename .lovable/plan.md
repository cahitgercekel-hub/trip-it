## Plan: Write README.md for GitHub

Replace the placeholder `README.md` with a complete project README documenting Trip It! — the AI-powered DE/AT city trip planner.

### Sections to include

1. **Title & Tagline** — "Trip It! — AI-powered city trip planner for Germany & Austria"
2. **Live Demo** — link to https://trip-it.lovable.app
3. **Features**
   - Interactive Leaflet map with POIs across DE/AT cities
   - Smart filters: budget, free-only, D-Ticket, ISIC student discount, rainy-day mode
   - Step goal & walking-aware transport recommendations (walk / U-Bahn / S-Bahn / Tram / taxi)
   - Trip interests (Culture, Nature) + pace control
   - Combined Date+Time picker for arrival / departure with auto duration
   - Live weather integration (auto-toggles rainy filter)
   - AI-generated itinerary via external FastAPI backend
   - Cost estimation, distance & step totals
4. **Tech Stack** — React 18, Vite, TypeScript, Tailwind, shadcn/ui, Radix, Leaflet, Framer Motion, TanStack Query, Lovable Cloud (Supabase)
5. **Getting Started**
   - Prerequisites (Node 18+, npm/bun)
   - `git clone`, `npm install`, `npm run dev` (port 8080)
6. **Backend Setup (FastAPI)** — itinerary generation
   - Frontend calls `http://localhost:8000/api/generate-itinerary` (see `src/lib/api.ts`)
   - Required env: `TENSORIX_API_KEY` on the Python server
   - Run with `uvicorn main:app --reload --port 8000`
   - Note: To change the URL, edit `API_BASE` in `src/lib/api.ts`
7. **Project Structure** — short tree of `src/` (components, context, lib, data, hooks, pages)
8. **Available Scripts** — `dev`, `build`, `preview`, `test` (vitest)
9. **Environment Variables** — auto-managed `.env` (Supabase URL/keys); do not edit
10. **Deployment** — via Lovable, or self-host the built `dist/` anywhere
11. **Contributing & License** — standard short blurbs (MIT placeholder)

### Files to change
- `README.md` — replace placeholder with full content above

No code, dependency, or config changes.
