import { useServerHealth, useServerStatus, api } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard, StatusBadge, RAMGauge, CPUGauge, ActionButton } from "../components/ui";
import { Play, Pause, RotateCcw, Power, RefreshCw, Users } from "lucide-react";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: health, isLoading: healthLoading } = useServerHealth();
  const { data: status } = useServerStatus();

  const isRunning = status?.isRunning ?? false;
  const serverStatus = status?.status ?? "offline";

  async function handleStart() {
    try {
      await api.post("/api/server/start", {});
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["status"] }), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to start server");
    }
  }

  async function handleStop() {
    try {
      await api.post("/api/server/stop", { force: false });
      queryClient.invalidateQueries({ queryKey: ["status"] });
    } catch (err: any) {
      alert(err.message || "Failed to stop server");
    }
  }

  async function handleRestart() {
    try {
      await api.post("/api/server/stop", { force: false });
      await new Promise((r) => setTimeout(r, 5000));
      await api.post("/api/server/start", {});
      queryClient.invalidateQueries({ queryKey: ["status"] });
    } catch (err: any) {
      alert(err.message || "Failed to restart server");
    }
  }

  async function handleForceKill() {
    if (!confirm("Force kill the server? This will terminate immediately without saving.")) return;
    try {
      await api.post("/api/server/stop", { force: true });
      queryClient.invalidateQueries({ queryKey: ["status"] });
    } catch (err: any) {
      alert(err.message || "Failed to force kill");
    }
  }

  function formatUptime(ms: number): string {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  }

  function formatDisk(bytes: number): string {
    const gb = bytes / (1024 ** 3);
    return `${gb.toFixed(1)} GB`;
  }

  if (healthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Real-time server health and management</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["health"] })}
            className="p-2 rounded-lg bg-card border border-cardBorder hover:bg-cardBorder/50 text-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {serverStatus === "crashed" && (
            <span className="text-xs text-danger font-medium">Crash count: {(status?.crashCount ?? 0)} / 3</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">Server Status</h3>
          </div>
          <StatusBadge status={serverStatus} />
          <p className="text-xs text-muted mt-2">
            {health ? `Uptime: ${formatUptime(health.uptime)}` : "—"}
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">CPU Usage</h3>
          </div>
          {health ? <CPUGauge cpu={health.cpu} /> : <p className="text-muted">—</p>}
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">RAM / 5GB Limit</h3>
          </div>
          {health ? <RAMGauge used={health.ramUsed} max={health.ramMax} /> : <p className="text-muted">—</p>}
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">Disk Space</h3>
          </div>
          {health ? (
            <>
              <p className="text-lg font-bold text-foreground">{formatDisk(health.diskUsed)}</p>
              <p className="text-xs text-muted mt-1">Used / {formatDisk(health.diskTotal)} total</p>
            </>
          ) : (
            <p className="text-muted">—</p>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <ActionButton
            onClick={handleStart}
            icon={Play}
            variant="primary"
            disabled={isRunning && serverStatus !== "crashed"}
          >
            Start
          </ActionButton>
          <ActionButton
            onClick={handleStop}
            icon={Pause}
            variant="warning"
            disabled={!isRunning || serverStatus === "crashed"}
          >
            Stop
          </ActionButton>
          <ActionButton
            onClick={handleRestart}
            icon={RotateCcw}
            variant="secondary"
            disabled={serverStatus === "crashed"}
          >
            Restart
          </ActionButton>
          <ActionButton
            onClick={handleForceKill}
            icon={Power}
            variant="danger"
            disabled={!isRunning}
          >
            Force Kill
          </ActionButton>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">Players Online</h2>
        {health && health.playerCount > 0 ? (
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{health.playerCount}</span>
            <span className="text-sm text-muted">
              / {health.players.map((p) => p).join(", ")}
            </span>
          </div>
        ) : (
          <p className="text-muted">No players online</p>
        )}
      </GlassCard>
    </div>
  );
}
