# Trip It!

**AI-powered city trip planner for Germany & Austria.**

Plan a day in any major DE/AT city with smart filters (budget, ISIC student
discount, D-Ticket, free-only, rainy-day mode), step-goal-aware transport
suggestions, live weather, and an AI-generated itinerary served by a FastAPI
backend.

🌐 **Live demo:** https://trip-it.lovable.app

---

## Features

- 🗺️ Interactive Leaflet map with curated POIs across DE & AT cities
- 🎯 Smart filters: budget slider, free-only, D-Ticket, ISIC discount, rainy mode
- 🚶 Step goal + walking-aware transport recommendations
  (Walk / Tram / U-Bahn / S-Bahn / Taxi based on segment distance)
- 🎨 Trip interests (Culture, Nature) with pace control (Relaxed → Fast)
- 📅 Combined Date + Time picker for arrival / departure with auto-duration
- ☁️ Live weather integration (auto-toggles rainy-day filter)
- 🤖 AI-generated itinerary via external FastAPI backend
- 💶 Live cost, distance, and step totals

## Tech Stack

- **Frontend:** React 18, Vite 5, TypeScript 5, Tailwind CSS v3
- **UI:** shadcn/ui, Radix UI, Framer Motion, lucide-react
- **Map:** Leaflet + react-leaflet
- **State / data:** React Context, TanStack Query
- **Backend (managed):** Lovable Cloud (Supabase) — auth, database, storage
- **AI itinerary backend:** External FastAPI service (Python) using Google ADK + Tensorix LLM

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or bun / pnpm)

### Install & run

```bash
git clone <your-repo-url>
cd <your-repo>
npm install
npm run dev
```

The app will be available at **http://localhost:8080**.

## Backend Setup (FastAPI itinerary service)

The "Trip It!" button POSTs to an external FastAPI server that calls an LLM
to build the itinerary. By default the frontend expects it at
`http://localhost:8000`.

### Run the Python backend

```bash
# In your FastAPI project folder
pip install fastapi uvicorn google-adk litellm pydantic
export TENSORIX_API_KEY="sk-..."   # your provider key
uvicorn main:app --reload --port 8000
```

The endpoint used by the frontend is:

```
POST http://localhost:8000/api/generate-itinerary
```

To point at a different host/port, edit `API_BASE` in
[`src/lib/api.ts`](src/lib/api.ts).

## Project Structure

```
src/
├── components/        # UI: sidebar, map, timeline, overlays
│   ├── sidebar/       # Dates, interests, weather, cost cards
│   └── ui/            # shadcn primitives
├── context/           # PlannerContext — global trip state
├── data/              # Static city + POI dataset
├── hooks/             # useWeather, etc.
├── lib/               # api.ts (FastAPI client), planner.ts (geo + transport)
├── pages/             # Index, NotFound
└── integrations/
    └── supabase/      # Auto-generated client + types (do not edit)
```

## Available Scripts

| Command           | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start dev server on port 8080      |
| `npm run build`   | Production build to `dist/`        |
| `npm run preview` | Preview the production build       |
| `npm test`        | Run vitest unit tests              |

## Environment Variables

`.env` is **auto-managed by Lovable Cloud** and contains:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Do not edit it manually. The Tensorix / LLM API key lives only on the
FastAPI server, never in the frontend.

## Deployment

- **Lovable:** open the project in Lovable and click **Publish**.
- **Self-host:** run `npm run build` and deploy the `dist/` folder to any
  static host (Vercel, Netlify, Cloudflare Pages, S3, nginx, …). Make sure
  the FastAPI backend is reachable from the deployed frontend (update
  `API_BASE` accordingly and enable CORS on the server).

## Contributing

Issues and pull requests are welcome. For larger changes, please open an
issue first to discuss what you'd like to change.

## License

MIT — see [LICENSE](LICENSE) if present, otherwise feel free to add one.