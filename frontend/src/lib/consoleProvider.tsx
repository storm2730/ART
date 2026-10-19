import { useEffect, useState, useRef, createContext, useContext, type ReactNode } from "react";
import { QueryClientProvider, queryClient } from "./queryClient";
import type { ConsoleMessage } from "./api";

interface WsContextValue {
  messages: ConsoleMessage[];
  sendCommand: (cmd: string) => void;
  isConnected: boolean;
  clearMessages: () => void;
}

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000/ws/console";

const WsContext = createContext<WsContextValue>({
  messages: [],
  sendCommand: () => {},
  isConnected: false,
  clearMessages: () => {},
});

export function useConsole() {
  return useContext(WsContext);
}

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: ConsoleMessage = JSON.parse(event.data);
        setMessages((prev) => {
          const next = [...prev, msg];
          return next.length > 1000 ? next.slice(next.length - 1000) : next;
        });
      } catch {
        setMessages((prev) => [...prev, { type: "log", payload: event.data }]);
      }
    };

    return () => ws.close();
  }, []);

  const sendCommand = (cmd: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "command", payload: cmd }));
    }
  };

  const clearMessages = () => setMessages([]);

  return (
    <QueryClientProvider client={queryClient}>
      <WsContext.Provider value={{ messages, sendCommand, isConnected, clearMessages }}>
        {children}
      </WsContext.Provider>
    </QueryClientProvider>
  );
}
