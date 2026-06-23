import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AnimeProvider } from "./context/AnimeContext";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AnimeProvider>
          <App />
        </AnimeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);