import { useRef, useState, useMemo, useEffect } from "react";
import { useConsole } from "../lib/consoleProvider.tsx";
import { useServerStatus, api } from "../lib/api";
import { GlassCard, ActionButton } from "../components/ui";
import { Send, Trash2, Search } from "lucide-react";

export default function Console() {
  const { messages, sendCommand, isConnected, clearMessages } = useConsole();
  const { data: status } = useServerStatus();
  const logEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [commandInput, setCommandInput] = useState("");

  const logLines = useMemo(() => {
    if (!messages) return [];
    const lines: string[] = [];
    for (const msg of messages) {
      if (msg.type === "log") {
        lines.push(msg.payload as string);
      } else if (msg.type === "status") {
        lines.push(`[STATUS] Server is now: ${(msg.payload as any)?.status}`);
      } else if (msg.type === "command_ack") {
        lines.push(`[SENT] ${(msg.payload as string)}`);
      } else if (msg.type === "command_error") {
        lines.push(`[ERROR] ${(msg.payload as string)}`);
      }
    }
    return lines;
  }, [messages]);

  const filteredLines = useMemo(() => {
    if (!searchTerm) return logLines;
    return logLines.filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [logLines, searchTerm]);

  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLines, autoScroll]);

  async function handleSendCommand() {
    if (!commandInput.trim()) return;
    try {
      await api.post("/api/server/command", { command: commandInput });
      sendCommand(commandInput);
      setCommandInput("");
    } catch (err: any) {
      alert(err.message || "Failed to send command");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && commandInput.trim()) {
      handleSendCommand();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Server Console</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-success" : "bg-danger"}`} />
          <span className="text-sm text-muted">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-10 pr-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              autoScroll
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted hover:text-foreground hover:bg-cardBorder/50 border border-cardBorder"
            }`}
          >
            {autoScroll ? "Auto-scroll: ON" : "Auto-scroll: OFF"}
          </button>
          <button
            onClick={clearMessages}
            className="p-2 rounded-lg bg-card border border-cardBorder hover:bg-cardBorder/50 text-muted hover:text-foreground transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-background border border-cardBorder rounded-lg p-3 h-[500px] overflow-y-auto font-mono text-xs">
          {filteredLines.length > 0 ? (
            filteredLines.map((line, i) => {
              const isError = line.includes("[ERROR]") || line.includes("ERROR");
              const isWarn = line.includes("WARN");
              const isCommand = line.includes("[SENT]");
              const isStatus = line.includes("[STATUS]");
              return (
                <div
                  key={i}
                  className={`mb-0.5 ${
                    isError
                      ? "text-danger"
                      : isWarn
                        ? "text-warning"
                        : isCommand
                          ? "text-secondary"
                          : isStatus
                            ? "text-primary"
                            : "text-muted-foreground"
                  }`}
                >
                  <span className="text-muted/50 mr-2">[{i + 1}]</span>
                  {line}
                </div>
              );
            })
          ) : (
            <p className="text-muted text-center py-8">
              {searchTerm ? "No matching log entries" : "No log output yet..."}
            </p>
          )}
          <div ref={logEndRef} />
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter command (e.g., /op player, save-all, whitelist on)"
            className="flex-1 px-3 py-2 text-sm bg-card border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={status?.status !== "online"}
          />
          <ActionButton
            onClick={handleSendCommand}
            icon={Send}
            variant="primary"
            disabled={status?.status !== "online" || !commandInput.trim() || !isConnected}
          >
            Send
          </ActionButton>
        </div>
      </GlassCard>
    </div>
  );
}
