import "./App.css";
import { Header } from "./components/Header";
import { PasswordChangeGate } from "./components/PasswordChangeGate";
import { Outlet } from "react-router-dom";

export function App() {
  return (
    <>
      <Header />
      <main>
        <PasswordChangeGate>
          <Outlet />
        </PasswordChangeGate>
      </main>
    </>
  );
}
