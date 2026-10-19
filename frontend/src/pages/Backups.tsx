import { useState } from "react";
import { api, useBackups } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard, ActionButton } from "../components/ui";
import { Download, Upload, Trash2, RefreshCw, Calendar, ShieldCheck } from "lucide-react";

export default function Backups() {
  const queryClient = useQueryClient();
  const { data: backups, isLoading } = useBackups();
  const [runningBackup, setRunningBackup] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    intervalHours: 6,
    includeWorlds: true,
    includeConfigs: true,
    maxBackups: 10,
  });

  async function handleRunBackup() {
    setRunningBackup(true);
    try {
      const result = await api.post<{ success: boolean; backupPath: string }>("/api/backups/run", {});
      alert(`Backup created: ${result.backupPath}`);
      queryClient.invalidateQueries({ queryKey: ["backups"] });
    } catch (err: any) {
      alert(err.message || "Backup failed");
    } finally {
      setRunningBackup(false);
    }
  }

  async function handleRestore(backupName: string) {
    if (!confirm(`Restore from "${backupName}"? This will overwrite server data.`)) return;
    try {
      await api.post("/api/backups/restore", { backupName });
      alert("Restore complete! Restart server for changes to take effect.");
    } catch (err: any) {
      alert(err.message || "Restore failed");
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-foreground">Automated Backups</h1>
          <p className="text-sm text-muted mt-1">
            Schedule and manage server backups with automatic cleanup
          </p>
        </div>
        <ActionButton
          onClick={handleRunBackup}
          icon={runningBackup ? RefreshCw : Download}
          variant="primary"
          disabled={runningBackup}
        >
          {runningBackup ? "Backing up..." : "Run Backup Now"}
        </ActionButton>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Backup Scheduler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-4 h-4 rounded bg-card border-cardBorder text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Enable automatic backups</span>
              </label>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Backup interval (hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={config.intervalHours}
                onChange={(e) => setConfig({ ...config, intervalHours: parseInt(e.target.value) || 6 })}
                className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Max backups to keep</label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.maxBackups}
                onChange={(e) => setConfig({ ...config, maxBackups: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeWorlds}
                  onChange={(e) => setConfig({ ...config, includeWorlds: e.target.checked })}
                  className="w-4 h-4 rounded bg-card border-cardBorder text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Include worlds</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeConfigs}
                  onChange={(e) => setConfig({ ...config, includeConfigs: e.target.checked })}
                  className="w-4 h-4 h-4 rounded bg-card border-cardBorder text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Include configs</span>
              </label>
            </div>
            <ActionButton
              onClick={async () => {
                try {
                  await api.put("/api/backups/config", config);
                  alert("Backup configuration saved!");
                  queryClient.invalidateQueries({ queryKey: ["backups"] });
                } catch (err: any) {
                  alert(err.message || "Failed to save config");
                }
              }}
              icon={ShieldCheck}
              variant={config.enabled ? "primary" : "secondary"}
            >
              Save Configuration
            </ActionButton>
          </div>
        </div>
      </GlassCard>

      <h2 className="text-lg font-semibold text-foreground">Existing Backups</h2>
      {backups && backups.length > 0 ? (
        <div className="space-y-3">
          {backups.map((backup: any) => (
            <GlassCard key={backup.name} className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground">{backup.name}</span>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(backup.modified)}
                      </span>
                      <span>{formatBytes(backup.size)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ActionButton
                    onClick={() => handleRestore(backup.name)}
                    icon={Upload}
                    variant="secondary"
                    className="text-xs"
                  >
                    Restore
                  </ActionButton>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete backup "${backup.name}"?`)) {
                        try {
                          await api.delete(`/api/files/backups/full/${backup.name}`);
                          queryClient.invalidateQueries({ queryKey: ["backups"] });
                        } catch (err: any) {
                          alert(err.message || "Delete failed");
                        }
                      }
                    }}
                    className="p-1.5 rounded text-danger hover:bg-danger/10 transition-colors"
                    title="Delete backup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <Download className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No backups found. Click "Run Backup Now" to create one.</p>
        </GlassCard>
      )}
    </div>
  );
}
