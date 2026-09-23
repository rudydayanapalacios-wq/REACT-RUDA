import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import QuienesSomos from "./pages/QuienesSomos";
import Contacto from "./pages/Contacto";
import Login from "./pages/login";
import Chatbot from "./components/Chatbot";


import Admin from "./pages/Admin";
import Empleado from "./pages/Empleado";
import EmpleadoProductos from "./pages/EmpleadoProductos";
import EmpleadoPQR from "./pages/EmpleadoPQR";

import Cliente from "./pages/Cliente";
import ClienteVentas from "./pages/ClienteVentas";
import ClientePQR from "./pages/ClientePQR";

import Perfil from "./pages/Perfil";
import GestionComercial from "./pages/GestionComercial";
import Factura from "./pages/Factura";

import WhatsAppButton from "./components/WhatsAppButton";
import RutaProtegida from "./components/RutaProtegida";
import RestablecerContrasena from "./pages/RestablecerContrasena";


function App() {
  const location = useLocation();

  // ============================================================
  // OCULTAR HEADER Y FOOTER EN PANELES
  // ============================================================

  const ocultarLayout =
    location.pathname === "/login" ||
    location.pathname === "/perfil" ||
    location.pathname === "/restablecer-contrasena" ||
    location.pathname === "/recuperar-contrasena" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/cliente") ||
    location.pathname.startsWith("/empleado");

  const ocultarBotones =
    location.pathname === "/login" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/cliente") ||
    location.pathname.startsWith("/empleado");

  return (
    <div className="min-h-screen bg-[#EFE8DF]">

      {/* HEADER PÚBLICO */}
      {!ocultarLayout && <Header />}

      <main className="min-h-screen">

        <Routes>

          {/* ====================================================
              PÁGINAS PÚBLICAS
          ==================================================== */}

          <Route
            path="/"
            element={<Inicio />}
          />

          <Route
            path="/productos"
            element={<Productos />}
          />

          <Route
            path="/quienes-somos"
            element={<QuienesSomos />}
          />

          <Route
            path="/contacto"
            element={<Contacto />}
          />


          {/* ====================================================
              LOGIN
          ==================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ====================================================
              RECUPERACIÓN DE CONTRASEÑA
          ==================================================== */}

          <Route
            path="/restablecer-contrasena"
            element={<RestablecerContrasena />}
          />


          {/* ====================================================
              PERFIL

              Roles:
              1 = Administrador
              2 = Cliente
              3 = Empleado
          ==================================================== */}

          <Route
            path="/perfil"
            element={
              <RutaProtegida rolesPermitidos={[1, 2, 3]}>
                <Perfil />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              PANEL ADMINISTRADOR
          ==================================================== */}

          <Route
            path="/admin"
            element={
              <RutaProtegida rolPermitido={1}>
                <Admin />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              ADMINISTRADOR - USUARIOS
          ==================================================== */}

          <Route
            path="/admin/usuarios"
            element={
              <RutaProtegida rolPermitido={1}>
                <Admin />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              ADMINISTRADOR - PRODUCTOS
          ==================================================== */}

          <Route
            path="/admin/productos"
            element={
              <RutaProtegida rolPermitido={1}>
                <Admin />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              ADMINISTRADOR - VENTAS
          ==================================================== */}

          <Route
            path="/admin/ventas"
            element={
              <RutaProtegida rolPermitido={1}>
                <Admin />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              ADMINISTRADOR - PQR

              El administrador puede:
              - Consultar PQR
              - Ver datos del cliente
              - Responder PQR
              - Cambiar estado
          ==================================================== */}

          <Route
            path="/admin/pqr"
            element={
              <RutaProtegida rolPermitido={1}>
                <EmpleadoPQR />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              EMPLEADO
          ==================================================== */}

          <Route
            path="/empleado"
            element={
              <RutaProtegida rolPermitido={3}>
                <Empleado />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              EMPLEADO - PRODUCTOS
          ==================================================== */}

          <Route
            path="/empleado/productos"
            element={
              <RutaProtegida rolPermitido={3}>
                <EmpleadoProductos />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              EMPLEADO - VENTAS
          ==================================================== */}

          <Route
            path="/empleado/ventas"
            element={
              <RutaProtegida rolesPermitidos={[3]}>
                <GestionComercial />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              EMPLEADO - PQR

              Puede consultar y responder PQR.
          ==================================================== */}

          <Route
            path="/empleado/pqr"
            element={
              <RutaProtegida rolPermitido={3}>
                <EmpleadoPQR />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              FACTURA

              Disponible para los tres roles
          ==================================================== */}

          <Route
            path="/factura/:ventaId"
            element={
              <RutaProtegida rolesPermitidos={[1, 2, 3]}>
                <Factura />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              PANEL CLIENTE
          ==================================================== */}

          <Route
            path="/cliente"
            element={
              <RutaProtegida rolPermitido={2}>
                <Cliente />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              CLIENTE - VENTAS

              Muestra únicamente las ventas del cliente
              autenticado.
          ==================================================== */}

          <Route
            path="/cliente/ventas"
            element={
              <RutaProtegida rolPermitido={2}>
                <ClienteVentas />
              </RutaProtegida>
            }
          />


          {/* ====================================================
              CLIENTE - PQR

              El cliente puede crear y consultar
              únicamente sus propias PQR.
          ==================================================== */}

          <Route
            path="/cliente/pqr"
            element={
              <RutaProtegida rolPermitido={2}>
                <ClientePQR />
              </RutaProtegida>
            }
          />

        </Routes>

      </main>

      {/* FOOTER PÚBLICO */}
      {!ocultarLayout && <Footer />}

      {/* WHATSAPP */}
      {/* WHATSAPP Y CHATBOT */}
      {!ocultarBotones && <WhatsAppButton />}
      {!ocultarBotones && <Chatbot />}

    </div>
  );
}

export default App;