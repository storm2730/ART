import { BrowserRouter, Routes, Route } from "react-router";
import { RootLayout } from "./App";
import Dashboard from "./pages/Dashboard";
import Versions from "./pages/Versions";
import Mods from "./pages/Mods";
import Console from "./pages/Console";
import Worlds from "./pages/Worlds";
import Players from "./pages/Players";
import Backups from "./pages/Backups";
import Settings from "./pages/Settings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="versions" element={<Versions />} />
          <Route path="mods" element={<Mods />} />
          <Route path="console" element={<Console />} />
          <Route path="worlds" element={<Worlds />} />
          <Route path="players" element={<Players />} />
          <Route path="backups" element={<Backups />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
