# NetSim Visual

Design, simulate, and understand network topologies — visually. NetSim Visual makes it easy to sketch networks, connect nodes, spin up traffic, and watch live metrics update in real time.

## TL;DR (Quick Start)

1. Install dependencies:
```bash
npm install
```
2. Start everything (frontend + backend):
```bash
npm run dev
```
3. Open the app at `http://localhost:3000` and start building a topology.

Backend runs at `http://localhost:3001` by default.

## Why you’ll like it

- 🎯 **No fuss modeling**: Add nodes and links with simple clicks and drags.
- 📈 **Metrics that matter**: Latency, throughput, jitter, and packet loss — live.
- 🔁 **Traffic flows**: Define and run flows to see how your network behaves.
- 💾 **Import/Export**: Save and share scenarios as JSON.
- 🌙 **Beautiful UI**: Thoughtful dark theme and smooth interactions.

## What you can do

- Add nodes, connect them, rename them, and move them around.
- Create traffic flows between nodes with bandwidth and duration.
- Start/stop simulation and watch live updates.
- Export your topology to JSON, or import an existing one.

Example topologies in the project root:
- `example-topology.json` — medium network with routers, switches, servers, firewall
- `example-topology-simple.json` — quick 3‑node triangle
- `example-topology-datacenter.json` — multi‑tier datacenter

## Tech

- **Frontend**: React 18, TypeScript, Vite
- **UI**: TailwindCSS, shadcn/ui
- **State**: Zustand
- **Visualization**: React Flow
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Backend**: Node.js, Express
- **Realtime**: Socket.io

## Run it locally

Prerequisite: Node.js 18+ and npm

Install and start (both servers):
```bash
npm install
npm run dev
```
This starts:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

Run them separately if you prefer:
```bash
# Frontend only
npm run dev:client

# Backend only
npm run dev:server
```

## Using the app

1. Click “Add Node”, then click on the canvas to place it.
2. Click “Add Link”, then click two nodes to connect them.
3. Rename nodes by clicking their labels (or via the edit icon).
4. Add flows in the left sidebar (source, destination, bandwidth, duration).
5. Press “Run” to simulate; watch metrics on the right. Press “Stop” anytime.
6. Use “Export” and “Import” to save and load JSON topologies.

## API + Realtime (for integrators)

Endpoints:
- `POST /api/run-simulation` — start
- `POST /api/stop-simulation` — stop
- `GET /api/get-metrics` — current metrics

WebSocket events:
- `metrics-update` — emitted every second while running
- `simulation-stopped` — emitted when a run stops

## Configuration

Create a `.env` file (example keys below). Do not commit real secrets.

Suggested keys:
- `VITE_API_BASE_URL` — frontend API base URL
- `PORT` — backend port (default 3001)

Environment files are git‑ignored. Commit only `.env.example` with placeholders.

## Security policy (no secrets in code)

- Never hardcode credentials, tokens, or fixed IPs.
- Use environment variables or a secret manager.
- Review diffs before committing; rotate any leaked keys immediately.

## Project structure

```
├── src/
│   ├── components/
│   │   ├── Canvas.tsx
│   │   ├── Node.tsx
│   │   ├── SidebarLeft.tsx
│   │   ├── SidebarRight.tsx
│   │   └── Toolbar.tsx
│   ├── store/
│   │   └── networkStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── cn.ts
│   ├── App.tsx
│   └── main.tsx
├── server/
│   └── index.ts
└── package.json
```

## Build for production

```bash
npm run build
```
Output goes to `dist/`.

## License

MIT
