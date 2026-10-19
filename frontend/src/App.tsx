import { Outlet } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { ConsoleProvider } from "./lib/consoleProvider.tsx";

export function RootLayout() {
  return (
    <ConsoleProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </ConsoleProvider>
  );
}
