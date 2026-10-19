import { useState } from "react";
import { api, useWorlds, useBackups } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard, ActionButton } from "../components/ui";
import { Download, Upload, Trash2, HardDrive, RefreshCw } from "lucide-react";

export default function Worlds() {
  const queryClient = useQueryClient();
  const { data: worlds, isLoading, refetch } = useWorlds();
  const { data: backups } = useBackups();
  const [deletingWorld, setDeletingWorld] = useState<string | null>(null);

  async function handleBackup(worldName: string) {
    try {
      const result = await api.post<{ success: boolean; backupPath: string }>(
        "/api/worlds/backup",
        { worldName }
      );
      alert(`World backup created: ${result.backupPath}`);
      queryClient.invalidateQueries({ queryKey: ["backups"] });
    } catch (err: any) {
      alert(err.message || "Backup failed");
    }
  }

  async function handleDelete(worldName: string) {
    if (!confirm(`Delete world "${worldName}"? This cannot be undone!`)) return;
    setDeletingWorld(worldName);
    try {
      await api.post("/api/worlds/delete", { worldName });
      refetch();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingWorld(null);
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
          <h1 className="text-2xl font-bold text-foreground">World Management</h1>
          <p className="text-sm text-muted mt-1">Manage server worlds, dimensions, and backups</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg bg-card border border-cardBorder hover:bg-cardBorder/50 text-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <h2 className="text-lg font-semibold text-foreground">Worlds</h2>
      {worlds && worlds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {worlds.map((world: any) => (
            <GlassCard key={world.name} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-foreground text-lg">{world.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-cardBorder/50 text-secondary">
                  {world.name.includes("nether") ? "Nether" : world.name.includes("end") ? "The End" : "Overworld"}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Size:</span>
                  <span className="text-foreground">{formatBytes(world.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Seed:</span>
                  <span className="text-foreground font-mono text-xs">{world.seed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Modified:</span>
                  <span className="text-foreground">{formatDate(world.lastModified)}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <ActionButton
                  onClick={() => handleBackup(world.name)}
                  icon={Download}
                  variant="primary"
                  className="flex-1"
                >
                  Backup
                </ActionButton>
                <ActionButton
                  onClick={() => handleDelete(world.name)}
                  icon={deletingWorld === world.name ? RefreshCw : Trash2}
                  variant="danger"
                  disabled={!!deletingWorld}
                  className="flex-1"
                >
                  {deletingWorld === world.name ? "Deleting..." : "Delete"}
                </ActionButton>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <HardDrive className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No worlds found. Start the server to generate them.</p>
        </GlassCard>
      )}

      <h2 className="text-lg font-semibold text-foreground mt-8">Recent Backups</h2>
      {backups && backups.length > 0 ? (
        <div className="space-y-2">
          {backups.map((backup: any) => (
            <GlassCard key={backup.name} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-foreground">{backup.name}</span>
                  <span className="text-xs text-muted ml-2">
                    {formatBytes(backup.size)} · {formatDate(backup.modified)}
                  </span>
                </div>
                <ActionButton
                  onClick={async () => {
                    if (confirm(`Restore from backup "${backup.name}"? This will overwrite current server data.`)) {
                      try {
                        await api.post("/api/backups/restore", { backupName: backup.name });
                        alert("Restore complete! Restart the server for changes to take effect.");
                      } catch (err: any) {
                        alert(err.message || "Restore failed");
                      }
                    }
                  }}
                  icon={Upload}
                  variant="secondary"
                >
                  Restore
                </ActionButton>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-4">
          <p className="text-muted">No backups found. Create backups from the Backups page.</p>
        </GlassCard>
      )}
    </div>
  );
}
