import { useState } from "react";
import { useVersions, api } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard, ActionButton } from "../components/ui";
import { Download, RefreshCw } from "lucide-react";

export default function Versions() {
  const queryClient = useQueryClient();
  const { data: versions, isLoading, error } = useVersions();
  const [installing, setInstalling] = useState<string | null>(null);

  async function handleInstall(type: string, version: string) {
    const versionId = type === "paper" ? `paper-${version}` : version;
    setInstalling(versionId);
    try {
      const result = await api.post<{ success: boolean; jarPath: string }>(
        "/api/versions/install",
        { type, version }
      );
      alert(`Installed! Jar saved to: ${result.jarPath}`);
    } catch (err: any) {
      alert(err.message || "Installation failed. See backend logs for details.");
    } finally {
      setInstalling(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <p className="text-danger">Failed to load versions: {(error as Error).message}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Version & Core Management</h1>
          <p className="text-sm text-muted mt-1">
            Install and manage Minecraft server software
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["versions"] })}
          className="p-2 rounded-lg bg-card border border-cardBorder hover:bg-cardBorder/50 text-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {versions &&
          versions.map((v: any) => {
            const versionId = `${v.type}-${v.version}`;
            const isInstalling = installing === versionId;
            return (
              <GlassCard key={versionId} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{v.type.toUpperCase()}</h3>
                    <p className="text-sm text-muted">{v.version}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      v.releaseType === "release"
                        ? "bg-success/20 text-success"
                        : v.releaseType === "snapshot"
                          ? "bg-warning/20 text-warning"
                          : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {v.releaseType}
                  </span>
                </div>
                <ActionButton
                  onClick={() => handleInstall(v.type, v.version)}
                  icon={isInstalling ? RefreshCw : Download}
                  variant="primary"
                  disabled={!!installing}
                >
                  {isInstalling ? "Installing..." : "Install"}
                </ActionButton>
              </GlassCard>
            );
          })}
      </div>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">About Server Versions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: "Vanilla", desc: "Official Mojang builds" },
            { name: "Paper", desc: "High-performance fork" },
            { name: "Spigot", desc: "Optimized vanilla experience" },
            { name: "Purpur", desc: "Feature-rich Paper fork" },
            { name: "Forge", desc: "Legacy modded environment" },
            { name: "NeoForge", desc: "Modern modded environment" },
            { name: "Fabric", desc: "Lightweight modded" },
            { name: "Quilt", desc: "Modular Fabric alternative" },
            { name: "Bedrock", desc: "Pocket Edition support" },
          ].map((v) => (
            <div key={v.name} className="p-3 bg-cardBorder/30 rounded-lg text-center">
              <div className="font-medium text-foreground">{v.name}</div>
              <p className="text-xs text-muted mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-4">
          Full support for all server types listed above. Vanilla and Paper are auto-downloadable.
          Other types may require manual JAR placement.
        </p>
      </GlassCard>
    </div>
  );
}
