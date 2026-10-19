import { GlassCard } from "../components/ui";
import { Ban, LogOut, Crown, RefreshCw, Users } from "lucide-react";

interface Player {
  name: string;
  id: string;
  displayName: string;
  ping: number;
  pingStart: number;
  level: number;
  gameMode: string;
  location: { x: number; y: number; z: number };
  connectedSince: number;
  isOp: boolean;
  isWhitelisted: boolean;
  isBanned: boolean;
}

const mockPlayers: Player[] = [
  {
    name: "Notch",
    id: "069a72d4-c44e-4f5b-a5ac-1234567890ab",
    displayName: "Notch",
    ping: 5,
    pingStart: 3,
    level: 42,
    gameMode: "Creative",
    location: { x: 100.5, y: 64, z: 200.3 },
    connectedSince: Date.now() - 3600000,
    isOp: true,
    isWhitelisted: true,
    isBanned: false,
  },
  {
    name: "jeb_",
    id: "713647a0-3112-4dc3-9999-abcdef123456",
    displayName: "jeb_",
    ping: 42,
    pingStart: 38,
    level: 18,
    gameMode: "Survival",
    location: { x: -150.2, y: 72, z: 45.7 },
    connectedSince: Date.now() - 1800000,
    isOp: false,
    isWhitelisted: false,
    isBanned: false,
  },
];

export default function Players() {
  const players = mockPlayers;

  async function handleBan(playerName: string) {
    if (!confirm(`Ban player "${playerName}"?`)) return;
    alert(`Player ${playerName} has been banned.`);
  }

  async function handleKick(playerName: string) {
    if (!confirm(`Kick player "${playerName}"?`)) return;
    alert(`Player ${playerName} has been kicked.`);
  }

  async function handleOp(player: Player) {
    alert(`${player.isOp ? "De-op" : "Op"}: ${player.name}`);
  }

  function formatTime(ms: number): string {
    const m = Math.floor(ms / 60000);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Player Management</h1>
          <p className="text-sm text-muted mt-1">
            {players.length} player{players.length !== 1 ? "s" : ""} connected
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg bg-card border border-cardBorder hover:bg-cardBorder/50 text-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {players.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cardBorder">
                <th className="text-left py-2 text-muted font-medium">Player</th>
                <th className="text-left py-2 text-muted font-medium">Status</th>
                <th className="text-left py-2 text-muted font-medium">Game Mode</th>
                <th className="text-left py-2 text-muted font-medium">Level</th>
                <th className="text-left py-2 text-muted font-medium">Ping</th>
                <th className="text-left py-2 text-muted font-medium">Location</th>
                <th className="text-right py-2 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-cardBorder/30 hover:bg-cardBorder/20">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {player.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{player.displayName}</span>
                        {player.isOp && <Crown className="w-3 h-3 text-warning inline-block ml-1" />}
                      </div>
                    </div>
                  </td>
                  <td className="py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-success/20 text-success">
                      <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                      Online
                    </span>
                    <span className="text-xs text-muted ml-2">({formatTime(Date.now() - player.connectedSince)})</span>
                  </td>
                  <td className="py-2 text-muted">{player.gameMode}</td>
                  <td className="py-2 text-foreground">{player.level}</td>
                  <td className="py-2 text-foreground">{player.ping} ms</td>
                  <td className="py-2 text-muted font-mono text-xs">
                    {Math.round(player.location.x)}, {Math.round(player.location.y)}, {Math.round(player.location.z)}
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleOp(player)}
                        className="p-1 rounded text-warning hover:bg-warning/10 transition-colors"
                        title={player.isOp ? "De-op" : "Op"}
                      >
                        <Crown className={`w-4 h-4 ${player.isOp ? "fill-warning/50 text-warning" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleKick(player.name)}
                        className="p-1 rounded text-secondary hover:bg-secondary/10 transition-colors"
                        title="Kick"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBan(player.name)}
                        className="p-1 rounded text-danger hover:bg-danger/10 transition-colors"
                        title="Ban"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <Users className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No players currently connected.</p>
        </GlassCard>
      )}
    </div>
  );
}
