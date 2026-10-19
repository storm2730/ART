import { Router } from "express";
import { serverManager } from "../minecraft/ServerManager.js";
import { fileManager } from "../minecraft/fileManager.js";
import { modManager } from "../minecraft/modManager.js";
import { worldManager } from "../minecraft/worldManager.js";
import { backupScheduler } from "../minecraft/backupScheduler.js";
import {
  installVersion,
  fetchAvailableVersions,
  getModrinthProjectFiles,
  type VersionType,
} from "../minecraft/installer.js";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    const health = serverManager.getHealth();
    res.json({ ok: true, ...health });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/status", (req, res) => {
  res.json({
    status: serverManager.getStatus(),
    crashCount: serverManager.getCrashCount(),
    isRunning: serverManager.isRunning(),
  });
});

router.post("/server/start", (req, res) => {
  try {
    serverManager.start();
    res.json({ success: true, message: "Server starting" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post("/server/stop", (req, res) => {
  try {
    const force = req.body?.force === true;
    serverManager.stop(force);
    res.json({ success: true, message: force ? "Server force-killed" : "Server stopping" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post("/server/restart", (req, res) => {
  try {
    serverManager.restart();
    res.json({ success: true, message: "Server restarting" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post("/server/command", (req, res) => {
  try {
    const { command } = req.body;
    if (!command) throw new Error("Command is required");
    serverManager.sendCommand(command);
    res.json({ success: true, message: "Command sent" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    res.json(serverManager.getRecentLogs(limit));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/files", async (req, res) => {
  try {
    const dir = (req.query.dir as string) || "";
    const files = await fileManager.listFiles(dir);
    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/files/:path", async (req, res) => {
  try {
    const content = await fileManager.readFile(req.params.path);
    res.send(content);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/files/:path", async (req, res) => {
  try {
    await fileManager.writeFile(req.params.path, req.body.content);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/files/:path", async (req, res) => {
  try {
    await fileManager.deleteFile(req.params.path);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/config", async (req, res) => {
  try {
    const config = await fileManager.getConfig();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/config", async (req, res) => {
  try {
    const config = await fileManager.updateConfig(req.body);
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/versions", async (req, res) => {
  try {
    const versions = await fetchAvailableVersions();
    res.json(versions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/versions/install", async (req, res) => {
  try {
    const { type, version }: { type: VersionType; version: string } = req.body;
    if (!type || !version) throw new Error("Type and version are required");
    const jarPath = await installVersion(type, version);
    res.json({ success: true, jarPath });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/mods/search", async (req, res) => {
  try {
    const query = req.query.query as string;
    const source = (req.query.source as string) || "all";
    const results = await modManager.search(query, source as any);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/mods/installed", async (req, res) => {
  try {
    const projectType = (req.query.type as any) || "mod";
    const mods = await modManager.listInstalled(projectType);
    res.json(mods);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/mods/files/:projectId", async (req, res) => {
  try {
    const files = await getModrinthProjectFiles(req.params.projectId);
    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/mods/install", async (req, res) => {
  try {
    const { projectId, versionId, projectType, source } = req.body;
    const modPath = await modManager.installMod(projectId, versionId, projectType, source);
    res.json({ success: true, modPath });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/mods/uninstall", async (req, res) => {
  try {
    const { projectType, fileName } = req.body;
    await modManager.uninstallMod(projectType, fileName);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/worlds", async (req, res) => {
  try {
    const worlds = await worldManager.listWorlds();
    res.json(worlds);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/worlds/backup", async (req, res) => {
  try {
    const { worldName } = req.body;
    const backupPath = await worldManager.backupWorld(worldName);
    res.json({ success: true, backupPath });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/worlds/delete", async (req, res) => {
  try {
    const { worldName } = req.body;
    await worldManager.deleteWorld(worldName);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/backups", async (req, res) => {
  try {
    const backups = await backupScheduler.listBackups();
    res.json(backups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/backups/run", async (req, res) => {
  try {
    const backupPath = await backupScheduler.runBackup();
    res.json({ success: true, backupPath });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/backups/restore", async (req, res) => {
  try {
    const { backupName } = req.body;
    await backupScheduler.restoreBackup(backupName);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/backups/config", (req, res) => {
  res.json(backupScheduler.getConfig());
});

router.put("/backups/config", (req, res) => {
  res.json(backupScheduler.updateConfig(req.body));
});

router.get("/players", (req, res) => {
  res.json({
    players: [],
    count: 0,
  });
});

export default router;
