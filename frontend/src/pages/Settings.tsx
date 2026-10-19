import { useState } from "react";
import { api, useServerConfig } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard, ActionButton } from "../components/ui";
import { Save, Moon, Server, Sliders, RefreshCw, Check } from "lucide-react";

interface ServerConfig {
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

const GAME_MODES = ["survival", "creative", "adventure", "hardcore", "spectator"];
const DIFFICULTIES = ["peaceful", "easy", "normal", "hard"];

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: configData, isLoading } = useServerConfig();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<Partial<ServerConfig>>({});

  const displayedConfig = { ...configData, ...config };

  const updateField = (key: keyof ServerConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/api/config", config);
      await queryClient.invalidateQueries({ queryKey: ["config"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setConfig({});
    } catch (err: any) {
      alert(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-2xl font-bold text-foreground">Server Settings</h1>
          <p className="text-sm text-muted mt-1">
            Configure server.properties and mod configuration files
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-success text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span>}
          <ActionButton onClick={handleSave} icon={Save} variant="primary" disabled={saving || Object.keys(config).length === 0}>
            {saving ? "Saving..." : "Save Changes"}
          </ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Server Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Server Name</label>
              <input
                type="text"
                value={displayedConfig.name ?? ""}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Message of the Day (MOTD)</label>
              <input
                type="text"
                value={displayedConfig.motd ?? ""}
                onChange={(e) => updateField("motd", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted mb-1">Port</label>
                <input
                  type="number"
                  value={displayedConfig.port ?? 25565}
                  onChange={(e) => updateField("port", parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Max Players</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={displayedConfig.maxPlayers ?? 20}
                  onChange={(e) => updateField("maxPlayers", parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Gameplay Settings
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted mb-1">Game Mode</label>
                <select
                  value={displayedConfig.gamemode ?? "survival"}
                  onChange={(e) => updateField("gamemode", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                >
                  {GAME_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Difficulty</label>
                <select
                  value={displayedConfig.difficulty ?? "normal"}
                  onChange={(e) => updateField("difficulty", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                >
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted mb-1">View Distance (chunks)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="3"
                    max="32"
                    value={displayedConfig.viewDistance ?? 10}
                    onChange={(e) => updateField("viewDistance", parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-foreground w-8 text-center">{displayedConfig.viewDistance ?? 10}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <span className="text-sm text-foreground">PvP Enabled</span>
                <button
                  onClick={() => updateField("pvp", !displayedConfig.pvp)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    displayedConfig.pvp ? "bg-primary" : "bg-cardBorder"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      displayedConfig.pvp ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-foreground">Whitelist</span>
                <button
                  onClick={() => updateField("whitelist", !displayedConfig.whitelist)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    displayedConfig.whitelist ? "bg-primary" : "bg-cardBorder"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      displayedConfig.whitelist ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            RAM Allocation Profile
          </h2>
          <div className="space-y-4">
            <div className="bg-cardBorder/30 rounded-lg p-4">
              <p className="text-sm text-muted mb-2">
                The server is configured with a strict 5GB RAM limit to ensure smooth
                performance with heavily modded instances.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-1">Initial RAM (Xms)</label>
                  <select
                    value={displayedConfig.ramMin ?? "1G"}
                    onChange={(e) => updateField("ramMin", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    <option value="512M">512M</option>
                    <option value="1G">1G</option>
                    <option value="2G">2G</option>
                    <option value="3G">3G</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Maximum RAM (Xmx)</label>
                  <select
                    value={displayedConfig.ramMax ?? "5G"}
                    onChange={(e) => updateField("ramMax", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    <option value="2G">2G</option>
                    <option value="3G">3G</option>
                    <option value="4G">4G</option>
                    <option value="5G" disabled>
                      5G (max)
                    </option>
                  </select>
                </div>
              </div>
              <div className="mt-3 h-2 bg-cardBorder rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/5 rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>0G</span>
                <span>2.5G</span>
                <span>5G (limit)</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
