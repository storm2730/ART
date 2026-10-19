import { useQuery } from "@tanstack/react-query";

export interface ServerHealth {
  status: "offline" | "starting" | "online" | "stopping" | "crashed" | "booting";
  cpu: number;
  ramUsed: number;
  ramMax: number;
  diskUsed: number;
  diskTotal: number;
  playerCount: number;
  players: string[];
  uptime: number;
  crashCount: number;
}

export interface ConsoleMessage {
  type: "status" | "log" | "command_ack" | "command_error" | "error";
  payload: string | object;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || res.statusText);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "DELETE", body: body ? JSON.stringify(body) : undefined }),
};

export function useServerHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => api.get<ServerHealth>("/api/health"),
    refetchInterval: 5000,
  });
}

export function useServerStatus() {
  return useQuery({
    queryKey: ["status"],
    queryFn: () => api.get<{ status: ServerHealth["status"]; crashCount: number; isRunning: boolean }>("/api/status"),
    refetchInterval: 5000,
  });
}

export function useServerConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => api.get<Record<string, unknown>>("/api/config"),
  });
}

export function useVersions() {
  return useQuery({
    queryKey: ["versions"],
    queryFn: () => api.get<any[]>("/api/versions"),
    staleTime: 60000,
  });
}

export function useInstalledMods(type: string = "mod") {
  return useQuery({
    queryKey: ["mods", type],
    queryFn: () => api.get<any[]>(`/api/mods/installed?type=${type}`),
    refetchInterval: 30000,
  });
}

export function useWorlds() {
  return useQuery({
    queryKey: ["worlds"],
    queryFn: () => api.get<any[]>("/api/worlds"),
  });
}

export function useBackups() {
  return useQuery({
    queryKey: ["backups"],
    queryFn: () => api.get<any[]>("/api/backups"),
    refetchInterval: 10000,
  });
}

export { useQuery };
