import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  import.meta.env.PROD ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  ),
);
