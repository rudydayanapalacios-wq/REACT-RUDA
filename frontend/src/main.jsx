// ============================================================
// ARCHIVO PRINCIPAL DE REACT
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CarritoProvider } from "./context/CarritoContext.jsx";

import "./index.css";

// ============================================================
// RENDERIZAR APLICACIÓN
// ============================================================

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);