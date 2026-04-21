import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./shared/theme/globals.css";
import "./shared/i18n/index";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
