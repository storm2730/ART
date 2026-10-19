import { useState } from "react";
import { api, useQuery } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard, ActionButton } from "../components/ui";
import { Search, Download, Trash2, RefreshCw } from "lucide-react";

interface ModSearchResult {
  id: string;
  title: string;
  description: string;
  downloads: number;
  icon: string | null;
  projectType: string;
  source: string;
  slug: string;
}

const PROJECT_TYPES: { value: string; label: string; icon: any }[] = [
  { value: "mod", label: "Mods", icon: Download },
  { value: "modpack", label: "Modpacks", icon: Download },
  { value: "resourcepack", label: "Resource Packs", icon: Download },
  { value: "shader", label: "Shaders", icon: Download },
];

export default function Mods() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("technology");
  const [searchResults, setSearchResults] = useState<ModSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedType, setSelectedType] = useState("mod");

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await api.get<ModSearchResult[]>(
        `/api/mods/search?query=${encodeURIComponent(query)}`
      );
      setSearchResults(results);
    } catch (err: any) {
      alert(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function handleInstall(mod: ModSearchResult) {
    try {
      const files = await api.get<any[]>(`/api/mods/files/${mod.id}`);
      const fileId = files[0]?.id || files[0]?.project_id;
      await api.post("/api/mods/install", {
        projectId: mod.id,
        versionId: fileId,
        projectType: mod.projectType,
        source: mod.source,
      });
      alert(`Installed ${mod.title}!`);
      queryClient.invalidateQueries({ queryKey: ["mods", mod.projectType] });
    } catch (err: any) {
      alert(err.message || "Installation failed");
    }
  }

  async function handleUninstall(type: string, fileName: string) {
    if (!confirm(`Uninstall ${fileName}?`)) return;
    try {
      await api.delete("/api/mods/uninstall", { projectType: type, fileName });
      queryClient.invalidateQueries({ queryKey: ["mods", type] });
    } catch (err: any) {
      alert(err.message || "Uninstall failed");
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Modrinth & CurseForge Integration</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("search");
            }}
            className={`px-3 py-1 rounded text-sm font-medium ${
              activeTab === "search"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted hover:text-foreground border border-cardBorder"
            }`}
          >
            Search & Install
          </button>
          <button
            onClick={() => setActiveTab("installed")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              activeTab === "installed"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted hover:text-foreground border border-cardBorder"
            }`}
          >
            Installed
          </button>
        </div>
      </div>

      {activeTab === "search" && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search mods, modpacks, resource packs, shaders..."
                className="w-full pl-10 pr-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ActionButton onClick={handleSearch} icon={searching ? RefreshCw : Search} variant="primary">
              {searching ? "Searching..." : "Search"}
            </ActionButton>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((mod) => (
                <GlassCard key={`${mod.source}-${mod.id}`} className="p-4">
                  <div className="flex items-start gap-3">
                    {mod.icon ? (
                      <img src={mod.icon} alt={mod.title} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-cardBorder flex-shrink-0 flex items-center justify-center">
                        <Download className="w-6 h-6 text-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{mod.title}</h3>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{mod.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted">{mod.downloads.toLocaleString()} downloads</span>
                        <span className="text-xs px-1.5 py-0.25 rounded bg-cardBorder/50 text-secondary">
                          {mod.source}
                        </span>
                        <span className="text-xs px-1.5 py-0.25 rounded bg-cardBorder/50 text-primary">
                          {mod.projectType}
                        </span>
                      </div>
                      <ActionButton
                        onClick={() => handleInstall(mod)}
                        icon={Download}
                        variant="primary"
                        className="mt-3 w-full"
                      >
                        Install
                      </ActionButton>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            !searching && (
              <GlassCard className="p-8 text-center">
                <Search className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-muted">Search for mods, modpacks, resource packs, and shaders above.</p>
                <p className="text-xs text-muted mt-1">Results appear here.</p>
              </GlassCard>
            )
          )}
        </>
      )}

      {activeTab === "installed" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Installed Mods & Packs</h2>
          {PROJECT_TYPES.map((type) => (
            <InstalledModsList key={type.value} type={type.value} label={type.label} onUninstall={handleUninstall} />
          ))}
        </div>
      )}
    </div>
  );
}

function InstalledModsList({
  type,
  label,
  onUninstall,
}: {
  type: string;
  label: string;
  onUninstall: (type: string, fileName: string) => void;
}) {
   const { data: mods, isLoading } = useQuery({
    queryKey: ["mods", type],
    queryFn: () => api.get<any[]>(`/api/mods/installed?type=${type}`),
    refetchInterval: 30000,
  });

  if (isLoading) return null;

  return (
    <GlassCard className="p-4">
      <h3 className="font-medium text-foreground mb-2">{label}</h3>
      {mods && mods.length > 0 ? (
        <div className="space-y-2">
          {mods.map((mod) => (
            <div key={mod.name} className="flex justify-between items-center p-2 bg-cardBorder/30 rounded-lg">
              <div>
                <span className="text-sm text-foreground">{mod.name}</span>
                <span className="text-xs text-muted ml-2">v{mod.version} · {(mod.size / 1024).toFixed(0)} KB</span>
              </div>
              <button
                onClick={() => onUninstall(type, mod.name)}
                className="p-1 rounded text-danger hover:bg-danger/10 transition-colors"
                title={`Uninstall ${mod.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No installed {label.toLowerCase()}.</p>
      )}
    </GlassCard>
  );
}
