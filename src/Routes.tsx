import { Route, Routes } from "react-router-dom"
import { App } from "./App"
import { EventsPage } from "./pages/EventsPage"
import { AthletesPage } from "./pages/AthletesPage"
import { RankingsPage } from "./pages/RankingsPage"
import { JudgesPage } from "./pages/JudgesPage"
import { FederationPage } from "./pages/FederationPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { HomePage } from "./pages/HomePage"
import { AuthPage } from "./pages/AuthPage"
import { PanelPage } from "./pages/PanelPage"
import { ComingSoon } from "./components/ComingSoon"
import { RequireRole } from "./components/RequireRole"
import type { AccountRole } from "./types/authentication.models"

const PANEL_ROLES: readonly AccountRole[] = ["JUDGE", "ADMIN"]
const ADMIN_ONLY: readonly AccountRole[] = ["ADMIN"]

export const FDFFRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route path="eventos" element={<EventsPage />} />
        <Route path="atletas" element={<AthletesPage />} />
        <Route path="rankings" element={<RankingsPage />} />
        <Route path="jueces" element={<JudgesPage />} />
        <Route path="federacion" element={<FederationPage />} />
        <Route path="panel" element={<RequireRole roles={PANEL_ROLES} />}>
          <Route index element={<PanelPage />} />
          <Route path="competencias" element={<ComingSoon title="Competencias" />} />
          <Route path="categorias" element={<ComingSoon title="Categorías" />} />
          <Route
            path="jueces"
            element={
              <RequireRole roles={ADMIN_ONLY}>
                <ComingSoon title="Cuentas de jueces" />
              </RequireRole>
            }
          />
        </Route>
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
