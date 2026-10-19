import express from "express";
import cors from "cors";
import http from "node:http";
import dotenv from "dotenv";
import apiRouter from "./routes/api.js";
import { consoleWS } from "./websocket/console.js";
import { serverManager } from "./minecraft/ServerManager.js";
import { worldManager } from "./minecraft/worldManager.js";
import { backupScheduler } from "./minecraft/backupScheduler.js";
import { ensureServerDir } from "./lib/configStore.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.get("/", (req, res) => {
  res.json({ name: "ART Backend", version: "1.0.0", status: "running" });
});

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const server = http.createServer(app);

consoleWS.setup(server);

serverManager.setLogHandler((line: string) => {
  console.log(`[SERVER] ${line}`);
});

backupScheduler.setServerManager(serverManager);
backupScheduler.setWorldManager(worldManager);
backupScheduler.setLogHandler((msg) => console.log(`[BACKUP] ${msg}`));
if (backupScheduler.getConfig().enabled) {
  backupScheduler.start();
}

server.listen(PORT, async () => {
  await ensureServerDir();
  console.log(`ART Backend listening on http://localhost:${PORT}`);
  console.log(`WebSocket console at ws://localhost:${PORT}/ws/console`);
  console.log(`API at http://localhost:${PORT}/api`);
  console.log(`RAM limit: -Xms1G -Xmx5G (5GB hard ceiling)`);
});

export default app;
