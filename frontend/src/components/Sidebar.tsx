import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Package,
  Terminal,
  Globe,
  Settings,
  Server,
  Shield,
  Moon,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/" },
  { name: "Versions", icon: Package, to: "/versions" },
  { name: "Mods & Marketplace", icon: Package, to: "/mods" },
  { name: "Console", icon: Terminal, to: "/console" },
  { name: "Worlds", icon: Globe, to: "/worlds" },
  { name: "Players", icon: Shield, to: "/players" },
  { name: "Backups", icon: Server, to: "/backups" },
  { name: "Settings", icon: Settings, to: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-card border-r border-cardBorder flex flex-col overflow-y-auto backdrop-blur-xs">
      <div className="p-4 border-b border-cardBorder">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Server className="w-6 h-6" />
          <span>ART</span>
        </h1>
        <p className="text-xs text-muted mt-1">Minecraft Server Manager</p>
      </div>

      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted hover:text-foreground hover:bg-cardBorder/50"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-cardBorder">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Moon className="w-3 h-3" />
          Dark Mode
        </div>
      </div>
    </aside>
  );
}
