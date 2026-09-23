import {
  Boxes,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  UserRound,
  Users,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function EstructuraPanel({
  children,
  rol,
  titulo,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, cerrarSesion } = useAuth();

  const [menuAbierto, setMenuAbierto] = useState(false);

  // ============================================================
  // ENLACES DEL MENÚ SEGÚN EL ROL
  // ============================================================

  const enlaces = {
    administrador: [
      ["/admin", "Resumen", LayoutDashboard],
      ["/admin/usuarios", "Cuentas", Users],
      ["/admin/productos", "Productos", Boxes],
      ["/admin/ventas", "Ventas", FileText],
      ["/admin/pqr", "PQR", MessageCircle],
    ],

  empleado: [
  ["/empleado", "Dashboard", LayoutDashboard],
  ["/empleado/productos", "Productos", Boxes],
  ["/empleado/ventas", "Ventas", FileText],
  ["/empleado-compras", "Compras", ShoppingBag],
  ["/empleado/pqr", "PQR", MessageCircle],
],

    cliente: [
      ["/cliente", "Mi espacio", LayoutDashboard],
      ["/productos", "Catálogo", Boxes],
      ["/cliente/ventas", "Ventas", FileText],
      ["/cliente/pqr", "PQR", MessageCircle],
    ],
  };

  // ============================================================
  // NAVEGAR A UNA OPCIÓN DEL MENÚ
  // Cada opción lleva a una página independiente.
  // ============================================================

  const navegar = (ruta) => {
    navigate(ruta);
  };

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================

  const salir = () => {
    cerrarSesion();

    navigate("/login", {
      replace: true,
    });
  };

  // ============================================================
  // NAVEGACIÓN MÓVIL
  // ============================================================

  const navegarMovil = (ruta) => {
    navigate(ruta);
    setMenuAbierto(false);
  };

  return (
    <section className="min-h-screen bg-[#EFE8DF]">
      <div className="flex min-h-screen w-full">

        {/* ======================================================
            MENÚ DESKTOP
        ====================================================== */}

        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#4A0505] text-[#F8F3EA] lg:flex">

          {/* ====================================================
              LOGO
          ==================================================== */}

          <div className="flex shrink-0 flex-col items-center border-b border-white/10 px-5 py-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
              <img
                src="/img/logo.png"
                alt="MUGI STORE"
                className="h-full w-full object-contain"
              />
            </div>

            <p className="mt-3 font-serif text-xl font-bold tracking-wide">
              MUGI
            </p>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Panel {rol}
            </p>
          </div>

          {/* ====================================================
              NAVEGACIÓN
          ==================================================== */}

          <nav className="flex-1 px-4 py-5">
            <div className="space-y-2">

              {enlaces[rol]?.map(
                ([ruta, texto, Icono]) => {
                  const activo = location.pathname === ruta;

                  return (
                    <button
                      key={`${ruta}-${texto}`}
                      type="button"
                      onClick={() => navegar(ruta)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        activo
                          ? "bg-[#D4AF37] text-[#4A0505]"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icono size={18} />
                      {texto}
                    </button>
                  );
                }
              )}

              {/* ==================================================
                  IR A INICIO
              ================================================== */}

              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <Home size={18} />
                Ir a inicio
              </button>

              {/* ==================================================
                  EDITAR PERFIL
              ================================================== */}

              <button
                type="button"
                onClick={() => navigate("/perfil")}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  location.pathname === "/perfil"
                    ? "bg-[#D4AF37] text-[#4A0505]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <UserRound size={18} />
                Editar perfil
              </button>

            </div>
          </nav>

          {/* ====================================================
              USUARIO
          ==================================================== */}

          <div className="shrink-0 border-t border-white/10 p-4">
            <div className="rounded-2xl border border-[#D4AF37]/20 p-4">

              <p className="truncate text-sm font-semibold">
                {usuario?.nombres || titulo}
              </p>

              <p className="mt-1 text-xs capitalize text-white/50">
                {rol}
              </p>

              {/* CERRAR SESIÓN */}

              <button
                type="button"
                onClick={salir}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>

            </div>
          </div>
        </aside>

        {/* ======================================================
            CONTENIDO PRINCIPAL
        ====================================================== */}

        <div className="min-w-0 flex-1">

          {/* ====================================================
              MENÚ MÓVIL
          ==================================================== */}

          <div className="sticky top-0 z-40 mb-4 border-b border-[#D8BA98] bg-[#F8F3EA]/95 p-3 shadow-sm backdrop-blur lg:hidden sm:mb-5 sm:p-4">

            {/* CABECERA */}

            <div className="flex items-center justify-between gap-3">

              {/* LOGO */}

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
                  <img
                    src="/img/logo.png"
                    alt="MUGI STORE"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="font-serif text-lg font-bold text-[#7F0303]">
                    MUGI
                  </p>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#927E70]">
                    Panel {rol}
                  </p>
                </div>

              </div>

              {/* BOTONES */}

              <div className="flex items-center gap-2">

                {/* INICIO */}

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  aria-label="Ir a inicio"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8BA98] text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  <Home size={19} />
                </button>

                {/* MENÚ */}

                <button
                  type="button"
                  onClick={() =>
                    setMenuAbierto(
                      (abierto) => !abierto
                    )
                  }
                  aria-label={
                    menuAbierto
                      ? "Cerrar menú"
                      : "Abrir menú"
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7F0303] text-white"
                >
                  {menuAbierto ? (
                    <X size={21} />
                  ) : (
                    <Menu size={21} />
                  )}
                </button>

              </div>
            </div>

            {/* ==================================================
                OPCIONES MÓVILES
            ================================================== */}

            {menuAbierto && (
              <nav className="mt-4 grid gap-2 border-t border-[#D8BA98]/60 pt-4">

                {enlaces[rol]?.map(
                  ([ruta, texto, Icono]) => (
                    <button
                      key={`${ruta}-${texto}`}
                      type="button"
                      onClick={() =>
                        navegarMovil(ruta)
                      }
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                        location.pathname === ruta
                          ? "border-[#D4AF37] bg-[#D4AF37] text-[#3D1717]"
                          : "border-[#D8BA98] text-[#7F0303] hover:border-[#D4AF37]"
                      }`}
                    >
                      <Icono size={17} />
                      {texto}
                    </button>
                  )
                )}

                {/* EDITAR PERFIL */}

                <button
                  type="button"
                  onClick={() =>
                    navegarMovil("/perfil")
                  }
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                    location.pathname === "/perfil"
                      ? "border-[#D4AF37] bg-[#D4AF37] text-[#3D1717]"
                      : "border-[#D8BA98] text-[#7F0303]"
                  }`}
                >
                  <UserRound size={17} />
                  Editar perfil
                </button>

                {/* VOLVER AL INICIO */}

                <button
                  type="button"
                  onClick={() =>
                    navegarMovil("/")
                  }
                  className="flex items-center gap-3 rounded-xl bg-[#7F0303] px-3 py-2.5 text-left text-sm font-semibold text-white"
                >
                  <Home size={17} />
                  Volver al inicio
                </button>

                {/* CERRAR SESIÓN */}

                <button
                  type="button"
                  onClick={salir}
                  className="flex items-center gap-3 rounded-xl border border-[#7F0303] px-3 py-2.5 text-left text-sm font-semibold text-[#7F0303]"
                >
                  <LogOut size={17} />
                  Cerrar sesión
                </button>

              </nav>
            )}

          </div>

          {/* ====================================================
              CONTENIDO DE CADA PÁGINA
              Cada página controla su propio scroll.
          ==================================================== */}

          <div className="min-w-0">
            {children}
          </div>

        </div>
      </div>
    </section>
  );
}