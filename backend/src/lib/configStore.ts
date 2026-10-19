import type { ServerConfig } from "../config.js";
import { DEFAULT_CONFIG, SERVER_DIR } from "../config.js";
import fs from "node:fs/promises";
import path from "node:path";

const CONFIG_FILE = path.join(SERVER_DIR, "server.properties");

const PROPERTIES_MAP: Record<keyof ServerConfig, string> = {
  name: "server-name",
  maxPlayers: "max-players",
  motd: "motd",
  gamemode: "gamemode",
  difficulty: "difficulty",
  pvp: "pvp",
  whitelist: "white-list",
  viewDistance: "view-distance",
  port: "server-port",
  ramMin: "ram-min",
  ramMax: "ram-max",
};

export async function ensureServerDir(): Promise<void> {
  await fs.mkdir(SERVER_DIR, { recursive: true });
  await fs.mkdir(path.join(SERVER_DIR, "logs"), { recursive: true });
  await fs.mkdir(path.join(SERVER_DIR, "mods"), { recursive: true });
  await fs.mkdir(path.join(SERVER_DIR, "resourcepacks"), { recursive: true });
  await fs.mkdir(path.join(SERVER_DIR, "shaderpacks"), { recursive: true });
  await fs.mkdir(path.join(SERVER_DIR, "worlds"), { recursive: true });
  await fs.mkdir(path.join(SERVER_DIR, "backups"), { recursive: true });
}

export async function loadConfig(): Promise<ServerConfig> {
  await ensureServerDir();
  try {
    const content = await fs.readFile(CONFIG_FILE, "utf-8");
    const config = { ...DEFAULT_CONFIG };
    for (const line of content.split("\n")) {
      const idx = line.indexOf("=");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      for (const [configKey, propKey] of Object.entries(PROPERTIES_MAP)) {
        if (propKey === key) {
          const typedKey = configKey as keyof ServerConfig;
          if (typedKey === "pvp" || typedKey === "whitelist") {
            config[typedKey] = value.toLowerCase() === "true";
          } else if (typedKey === "port" || typedKey === "maxPlayers" || typedKey === "viewDistance") {
            config[typedKey] = parseInt(value, 10) as never;
          } else {
            config[typedKey] = value as never;
          }
        }
      }
    }
    return config;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: ServerConfig): Promise<void> {
  await ensureServerDir();
  const lines: string[] = [];
  for (const [configKey, propKey] of Object.entries(PROPERTIES_MAP)) {
    const typedKey = configKey as keyof ServerConfig;
    let value = String(config[typedKey]);
    if (typedKey === "pvp" || typedKey === "whitelist") {
      value = String(config[typedKey]).toLowerCase();
    }
    lines.push(`${propKey}=${value}`);
  }
  await fs.writeFile(CONFIG_FILE, lines.join("\n") + "\n", "utf-8");
}
