import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import QuienesSomos from "./pages/QuienesSomos";
import Contacto from "./pages/Contacto";
import Login from "./pages/login";

import Admin from "./pages/Admin";
import Empleado from "./pages/Empleado";
import EmpleadoProductos from "./pages/EmpleadoProductos";
import Cliente from "./pages/Cliente";

import Perfil from "./pages/Perfil";
import GestionComercial from "./pages/GestionComercial";
import Factura from "./pages/Factura";

import WhatsAppButton from "./components/WhatsAppButton";
import RutaProtegida from "./components/RutaProtegida";

import RestablecerContrasena from "./pages/RestablecerContrasena";
import ClienteVentas from "./pages/ClienteVentas";

function App() {
  const location = useLocation();

  // ============================================================
  // OCULTAR HEADER Y FOOTER EN PANELES
  // ============================================================

  const ocultarLayout =
    location.pathname === "/login" ||
    location.pathname === "/perfil" ||
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
              
              SOLO ADMINISTRADOR
              GestionComercial se reutiliza para las ventas.
          ==================================================== */}

          <Route
            path="/admin/ventas"
            element={
              <RutaProtegida rolesPermitidos={[1]}>
                <GestionComercial />
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
              
              SOLO EMPLEADO
              Utiliza el mismo GestionComercial que Admin.
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
              FACTURA
              
              Se mantiene disponible para los tres roles porque
              puede formar parte del flujo de compra/facturación.
              
              Después de revisar Factura.jsx podemos restringirla
              si realmente corresponde.
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
              
              IMPORTANTE:
              NO existe /cliente/ventas.
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
    SOLO CLIENTE
    Muestra únicamente las ventas del cliente autenticado.
==================================================== */}

            <Route
              path="/cliente/ventas"
              element={
                <RutaProtegida rolPermitido={2}>
                  <ClienteVentas />
                </RutaProtegida>
              }
            />

        </Routes>
      </main>

      {/* FOOTER PÚBLICO */}
      {!ocultarLayout && <Footer />}

      {/* WHATSAPP */}
      <WhatsAppButton />

    </div>
  );
}

export default App;