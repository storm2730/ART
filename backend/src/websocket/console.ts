import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { serverManager } from "../minecraft/ServerManager.js";

interface ClientMessage {
  type: "command" | "subscribe_status" | "subscribe_logs";
  payload?: string;
}

interface StatusUpdate {
  type: "status";
  payload: { status: string; health: any };
}

interface LogUpdate {
  type: "log";
  payload: string;
}

export class ConsoleWebSocket {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  setup(server: Server): void {
    this.wss = new WebSocketServer({ server, path: "/ws/console" });

    this.wss.on("connection", (ws: WebSocket) => {
      this.clients.add(ws);

      ws.on("message", (data: Buffer | string) => {
        try {
          const msg: ClientMessage = JSON.parse(data.toString());
          this.handleMessage(ws, msg);
        } catch {
          ws.send(JSON.stringify({ type: "error", payload: "Invalid message format" }));
        }
      });

      ws.on("close", () => {
        this.clients.delete(ws);
      });

      ws.on("error", () => {
        this.clients.delete(ws);
      });
    });

    serverManager.setLogHandler((line: string) => {
      this.broadcast({ type: "log", payload: line });
    });

    serverManager.setStatusHandler((status: string) => {
      this.broadcast({
        type: "status",
        payload: { status, health: serverManager.getHealth() },
      });
    });
  }

  private handleMessage(ws: WebSocket, msg: ClientMessage): void {
    switch (msg.type) {
      case "command":
        try {
          serverManager.sendCommand(msg.payload || "");
          ws.send(JSON.stringify({ type: "command_ack", payload: msg.payload }));
        } catch (err: any) {
          ws.send(JSON.stringify({ type: "command_error", payload: err.message }));
        }
        break;
      case "subscribe_status":
        this.broadcast({
          type: "status",
          payload: { status: serverManager.getStatus(), health: serverManager.getHealth() },
        });
        break;
    }
  }

  private broadcast(data: StatusUpdate | LogUpdate): void {
    const json = JSON.stringify(data);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    }
  }
}

export const consoleWS = new ConsoleWebSocket();
