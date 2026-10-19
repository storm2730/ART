# ART - Minecraft Server Management Dashboard

## Overview

ART is a modern, full-stack Minecraft server management dashboard that provides:
- Real-time server health monitoring (CPU, RAM with 5GB limit, disk, players)
- Version & core management (Vanilla, Paper, Purpur, Forge, NeoForge, Fabric, Quilt, Bedrock)
- Modrinth & CurseForge integration for mod/modpack/resource pack/shader browsing
- Interactive console with WebSocket streaming, command input, auto-scroll and search
- World management (backup, restore, delete, seed viewer)
- Player management table (ban, kick, op, de-op)
- Automated backup scheduler with timestamped archives
- Crash detection & auto-restart with 3-strike safeguard
- GUI-based server configuration (server.properties, etc.)

## Architecture

```
ART/
├── backend/              # Express + WebSocket backend (TypeScript)
│   ├── src/
│   │   ├── config.ts          # Configuration constants (5GB RAM limits)
│   │   ├── index.ts           # Entry point (Express + HTTP server + WS)
│   │   ├── routes/
│   │   │   └── api.ts          # REST API routes
│   │   ├── websocket/
│   │   │   └── console.ts      # WebSocket console streaming
│   │   ├── minecraft/
│   │   │   ├── ServerManager.ts       # Process management, health, crash detection
│   │   │   ├── installer.ts            # Version download/installation
│   │   │   ├── fileManager.ts          # File read/write/list operations
│   │   │   ├── modManager.ts           # Modrinth/CurseForge integration
│   │   │   ├── worldManager.ts         # World management, ZIP backup/restore
│   │   │   └── backupScheduler.ts      # Automated backup scheduler
│   │   └── lib/
│   │       └── configStore.ts          # server.properties read/write
│   ├── package.json
│   ├── tsconfig.json
│   └── eslint.config.mjs
├── frontend/              # React + Vite dashboard (TypeScript)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts                  # API client + React Query hooks
│   │   │   ├── queryClient.ts          # TanStack Query client
│   │   │   └── consoleProvider.tsx     # WebSocket context provider
│   │   ├── components/
│   │   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   │   └── ui.tsx                  # GlassCard, StatusBadge, gauges, ActionButton
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx           # Health metrics, quick actions
│   │   │   ├── Versions.tsx           # Version installer
│   │   │   ├── Mods.tsx               # Modrinth/CurseForge marketplace
│   │   │   ├── Console.tsx            # Real-time console
│   │   │   ├── Worlds.tsx             # World management
│   │   │   ├── Players.tsx            # Player management table
│   │   │   ├── Backups.tsx            # Backup scheduler & management
│   │   │   └── Settings.tsx           # Server configuration forms
│   │   ├── App.tsx                    # Root layout
│   │   ├── AppRoutes.tsx              # React Router routes
│   │   ├── main.tsx                   # App entry point
│   │   └── index.css                  # Tailwind + glassmorphism styles
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── vite.config.ts
│   └── tailwind.config.cjs
├── minecraft/             # Server files (auto-created on first run)
└── .gitignore
```

## Prerequisites

- **Node.js** >= 20 (tested with v24)
- **npm** >= 10
- **Java** JDK 17+ (for running the Minecraft server; Java 8+ works for older versions)
- **Python 3** (optional, not required)

## Installation

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment (optional)

Copy the example environment file for the backend:

```bash
cd backend
cp .env.example .env
```

Edit `.env` to configure:
- `PORT` - Backend API port (default: 4000)
- `ART_BASE_DIR` - Root directory for server files (default: `./minecraft`)
- `CURSEFORGE_API_KEY` - Optional: CurseForge API key for extended mod search

### 3. Run the application

Start the backend first:

```bash
cd backend
npm run dev
```

Then start the frontend:

```bash
cd frontend
npm run dev
```

Access the dashboard at `http://localhost:3000`.

## One-Command Run

```bash
# Terminal 1 - Backend
cd ART/backend && npm run dev

# Terminal 2 - Frontend
cd ART/frontend && npm run dev
```

## Build for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npx serve dist
```

## Key Features Detail

### RAM Allocation
The server is configured with a strict 5GB RAM limit using JVM flags:
- `-Xms1G` (initial heap size: 1GB)
- `-Xmx5G` (maximum heap size: 5GB)

This is enforced in `ServerManager.ts` and cannot be exceeded.

### Crash Detection & Auto-Restart
- The server watcher detects unexpected exits (non-zero exit codes)
- Crash reports are saved to `logs/crash-report-{timestamp}.txt`
- Auto-restart is attempted up to 3 times (configurable via `MAX_CRASH_STRIKES`)
- After 3 strikes, auto-restart is disabled

### Backup Schedule
- Default: every 6 hours
- Backups are stored in `minecraft/server/backups/full/`
- Old backups are automatically cleaned up (configurable max count, default: 10)
- Each backup includes worlds, configs, mods, and server JARs

### WebSocket Console
- Real-time log streaming via `ws://localhost:4000/ws/console`
- Send commands like `/op`, `/whitelist`, `/save-all` directly
- Auto-scroll toggle and text search/filter

### Mod Integration
- Search via Modrinth and CurseForge APIs
- One-click install to correct directories (`mods/`, `resourcepacks/`, `shaderpacks/`)
- Uninstall individual mods

## Troubleshooting

**Server JAR not found**: Install a version first via the Versions page.

**WebSocket connection failed**: Ensure the backend is running on port 4000.

**CurseForge search not working**: Add a CurseForge API key to `.env` as `CURSEFORGE_API_KEY`.
