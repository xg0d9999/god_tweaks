import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { GameSelectorStandaloneView } from "./components/ui/GameSelectorStandaloneView";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./index.css";
import { initAntiDevtools } from "./utils/antiDevtools";

initAntiDevtools();

function isGameSelectorWindow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const internals = (window as unknown as { __TAURI_INTERNALS__?: { metadata?: { currentWindow?: { label?: string } } } })?.__TAURI_INTERNALS__;
    if (internals?.metadata?.currentWindow?.label === "game-selector") {
      return true;
    }
  } catch {}
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("window") === "game-selector") return true;
  } catch {}
  return false;
}

const isSelector = isGameSelectorWindow();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isSelector ? <GameSelectorStandaloneView /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
