import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnimeProvider } from "./context/AnimeContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AnimeProvider>
      <App />
    </AnimeProvider>
  </StrictMode>
);