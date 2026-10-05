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
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
