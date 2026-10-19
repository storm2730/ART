import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveBaseDir = (): string => {
  const envDir = process.env.ART_BASE_DIR;
  if (envDir) return path.resolve(envDir);
  return path.resolve(__dirname, "..", "..", "minecraft");
};

export const BASE_DIR = resolveBaseDir();
export const SERVER_DIR = path.join(BASE_DIR, "server");
export const LOG_FILE = path.join(SERVER_DIR, "logs", "latest.log");

export interface ServerConfig {
  name: string;
  port: number;
  maxPlayers: number;
  motd: string;
  gamemode: string;
  difficulty: string;
  pvp: boolean;
  whitelist: boolean;
  viewDistance: number;
  ramMin: string;
  ramMax: string;
}

export const DEFAULT_CONFIG: ServerConfig = {
  name: "ART Minecraft Server",
  port: 25565,
  maxPlayers: 20,
  motd: "ART - Minecraft Server Manager",
  gamemode: "survival",
  difficulty: "normal",
  pvp: true,
  whitelist: false,
  viewDistance: 10,
  ramMin: "1G",
  ramMax: "5G",
};

export const JAVA_XSS = "-Xms1G";
export const JAVA_XMX = "-Xmx5G";
export const MAX_CRASH_STRIKES = 3;
export const AUTO_RESTART_DELAY = 10000;
