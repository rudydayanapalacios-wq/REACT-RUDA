import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";

import loginIcon from "../assets/icons/login.png";
import ModoOscuro from "./ModoOscuro";
import CarritoMenu from "./CarritoMenu";

function Header() {
  const { usuario, autenticado, cerrarSesion } = useAuth();
  const { cantidadProductos, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuarioMenuAbierto, setUsuarioMenuAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [ocultarHeader, setOcultarHeader] = useState(false);

  useEffect(() => {
    let ultimaPosicion = window.scrollY;

    const manejarScroll = () => {
      const posicionActual = window.scrollY;

      if (posicionActual > ultimaPosicion && posicionActual > 80) {
        setOcultarHeader(true);
      } else {
        setOcultarHeader(false);
      }

      ultimaPosicion = posicionActual;
    };

    window.addEventListener("scroll", manejarScroll);

    return () => {
      window.removeEventListener("scroll", manejarScroll);
    };
  }, []);

  const cerrarTodosLosMenus = () => {
    setMenuAbierto(false);
    setUsuarioMenuAbierto(false);
  };

  const abrirCarrito = () => {
    setCarritoAbierto(true);
    cerrarTodosLosMenus();
  };

  const cerrarCarrito = () => {
    setCarritoAbierto(false);
  };

const manejarCerrarSesion = () => {
    // Vaciar el carrito
    vaciarCarrito();

    // Cerrar sesión
    cerrarSesion();

    // Cerrar menús
    cerrarTodosLosMenus();
    cerrarCarrito();

    // Volver al inicio
    navigate("/");
};


  const obtenerRutaPanel = () => {
    const rol = Number(usuario?.rol_id);

    if (rol === 1) return "/admin";
    if (rol === 2) return "/cliente";
    if (rol === 3) return "/empleado";

    return "/";
  };

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full border-b border-[#D8BA98]/60 bg-[#F8F3EA]/95 shadow-sm backdrop-blur-md transition-transform duration-300 dark:border-[#6B4540]/60 dark:bg-[#160B0C]/95 ${
          ocultarHeader ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">

          {/* ========================= */}
          {/* LOGO */}
          {/* ========================= */}

          <Link
            to="/"
            onClick={cerrarTodosLosMenus}
            className="flex items-center"
          >
            <img
              src="/img/logo.png"
              alt="MUGI STORE"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* ========================= */}
          {/* NAVEGACIÓN DESKTOP */}
          {/* ========================= */}

          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              to="/"
              className="text-sm font-semibold text-[#0F414A] transition-colors hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:text-[#D4AF37]"
            >
              Inicio
            </Link>

            <Link
              to="/productos"
              className="text-sm font-semibold text-[#0F414A] transition-colors hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:text-[#D4AF37]"
            >
              Productos
            </Link>

            <Link
              to="/quienes-somos"
              className="text-sm font-semibold text-[#0F414A] transition-colors hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:text-[#D4AF37]"
            >
              Quiénes Somos
            </Link>

            <Link
              to="/contacto"
              className="text-sm font-semibold text-[#0F414A] transition-colors hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:text-[#D4AF37]"
            >
              Contacto
            </Link>
          </nav>

          {/* ========================= */}
          {/* ACCIONES DESKTOP */}
          {/* ========================= */}

          <div className="hidden items-center gap-3 lg:flex">

            {/* CARRITO */}

            <button
              type="button"
              onClick={abrirCarrito}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#D8BA98] bg-[#F8F3EA] text-[#7F0303] transition-all hover:-translate-y-1 hover:border-[#D4AF37] hover:text-[#D4AF37] dark:border-[#6B4540] dark:bg-[#241415] dark:text-[#F8F3EA] dark:hover:border-[#D4AF37] dark:hover:text-[#D4AF37]"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={20} />

              {cantidadProductos > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7F0303] px-1 text-[10px] font-bold text-white dark:bg-[#D4AF37] dark:text-[#160B0C]">
                  {cantidadProductos > 99 ? "99+" : cantidadProductos}
                </span>
              )}
            </button>

            {/* ========================= */}
            {/* USUARIO */}
            {/* ========================= */}

            {autenticado ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setUsuarioMenuAbierto(!usuarioMenuAbierto)
                  }
                  className="flex items-center gap-2 rounded-full border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-semibold text-[#7F0303] transition-all hover:border-[#D4AF37] dark:border-[#6B4540] dark:bg-[#241415] dark:text-[#F8F3EA]"
                >
                  <span>
  Bienvenido,{" "}
  {usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : "Usuario"}
</span>

                  <ChevronDown
                    size={17}
                    className={`transition-transform ${
                      usuarioMenuAbierto ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {usuarioMenuAbierto && (
                  <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-[#D8BA98] bg-[#F8F3EA] shadow-xl dark:border-[#6B4540] dark:bg-[#241415]">

                    <div className="border-b border-[#D8BA98]/60 px-5 py-4 dark:border-[#6B4540]">
                      <p className="text-xs uppercase tracking-wider text-[#B89563] dark:text-[#D4AF37]">
                        Cuenta
                      </p>

                      <p className="mt-1 truncate font-semibold text-[#7F0303] dark:text-[#F8F3EA]">
                        {usuario?.nombre || "Usuario"}
                      </p>
                    </div>

                    <Link
                      to="/perfil"
                      onClick={cerrarTodosLosMenus}
                      className="block px-5 py-3 text-sm font-medium text-[#0F414A] transition-colors hover:bg-[#EFE5D7] hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022] dark:hover:text-[#D4AF37]"
                    >
                      Editar perfil
                    </Link>

                    <Link
                      to={obtenerRutaPanel()}
                      onClick={cerrarTodosLosMenus}
                      className="block px-5 py-3 text-sm font-medium text-[#0F414A] transition-colors hover:bg-[#EFE5D7] hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022] dark:hover:text-[#D4AF37]"
                    >
                      Ir al panel
                    </Link>

                    <button
                      type="button"
                      onClick={manejarCerrarSesion}
                      className="flex w-full items-center gap-2 border-t border-[#D8BA98]/60 px-5 py-3 text-left text-sm font-semibold text-[#7F0303] transition-colors hover:bg-[#FBE4DE] dark:border-[#6B4540] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022]"
                    >
                      <LogOut size={17} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full bg-[#7F0303] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-1 hover:bg-[#D4AF37] dark:bg-[#8F1D24] dark:hover:bg-[#D4AF37] dark:hover:text-[#160B0C]"
              >
                <img
                  src={loginIcon}
                  alt=""
                  className="h-5 w-5 object-contain"
                />
                Iniciar sesión
              </Link>
            )}

            <ModoOscuro />
          </div>

          {/* ========================= */}
          {/* BOTONES MOBILE */}
          {/* ========================= */}

          <div className="flex items-center gap-2 lg:hidden">

            {/* CARRITO MOBILE */}

            <button
              type="button"
              onClick={abrirCarrito}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#7F0303] transition-colors hover:bg-[#EFE5D7] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022]"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={21} />

              {cantidadProductos > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7F0303] px-1 text-[10px] font-bold text-white dark:bg-[#D4AF37] dark:text-[#160B0C]">
                  {cantidadProductos > 99 ? "99+" : cantidadProductos}
                </span>
              )}
            </button>

            {/* MODO OSCURO */}

            <ModoOscuro />

            {/* HAMBURGUESA */}

            <button
              type="button"
              onClick={() => {
                setMenuAbierto(!menuAbierto);
                setUsuarioMenuAbierto(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#7F0303] transition-colors hover:bg-[#EFE5D7] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022]"
              aria-label="Abrir menú"
            >
              {menuAbierto ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ========================= */}
        {/* MENÚ MOBILE */}
        {/* ========================= */}

        {menuAbierto && (
          <div className="border-t border-[#D8BA98]/60 bg-[#F8F3EA] px-5 py-5 dark:border-[#6B4540]/60 dark:bg-[#160B0C] lg:hidden">

            <nav className="flex flex-col gap-2">

              <Link
                to="/"
                onClick={cerrarTodosLosMenus}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#0F414A] hover:bg-[#EFE5D7] hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022] dark:hover:text-[#D4AF37]"
              >
                Inicio
              </Link>

              <Link
                to="/productos"
                onClick={cerrarTodosLosMenus}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#0F414A] hover:bg-[#EFE5D7] hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022] dark:hover:text-[#D4AF37]"
              >
                Productos
              </Link>

              <Link
                to="/quienes-somos"
                onClick={cerrarTodosLosMenus}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#0F414A] hover:bg-[#EFE5D7] hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022] dark:hover:text-[#D4AF37]"
              >
                Quiénes Somos
              </Link>

              <Link
                to="/contacto"
                onClick={cerrarTodosLosMenus}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#0F414A] hover:bg-[#EFE5D7] hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022] dark:hover:text-[#D4AF37]"
              >
                Contacto
              </Link>
            </nav>

            {/* ========================= */}
            {/* USUARIO MOBILE */}
            {/* ========================= */}

            {autenticado ? (
              <div className="mt-4 border-t border-[#D8BA98]/60 pt-4 dark:border-[#6B4540]">

                <div className="mb-3 px-4">
                  <p className="text-xs uppercase tracking-wider text-[#B89563] dark:text-[#D4AF37]">
                    Sesión iniciada
                  </p>

                  <p className="mt-1 font-semibold text-[#7F0303] dark:text-[#F8F3EA]">
                    Bienvenido, {usuario?.nombre || "Usuario"}
                  </p>
                </div>

                <Link
                  to="/perfil"
                  onClick={cerrarTodosLosMenus}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-[#0F414A] hover:bg-[#EFE5D7] hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022] dark:hover:text-[#D4AF37]"
                >
                  Editar perfil
                </Link>

                <Link
                  to={obtenerRutaPanel()}
                  onClick={cerrarTodosLosMenus}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-[#0F414A] hover:bg-[#EFE5D7] hover:text-[#7F0303] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022] dark:hover:text-[#D4AF37]"
                >
                  Ir al panel
                </Link>

                <button
                  type="button"
                  onClick={manejarCerrarSesion}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#7F0303] hover:bg-[#FBE4DE] dark:text-[#F8F3EA] dark:hover:bg-[#3A2022]"
                >
                  <LogOut size={17} />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="mt-4 border-t border-[#D8BA98]/60 pt-4 dark:border-[#6B4540]">
                <Link
                  to="/login"
                  onClick={cerrarTodosLosMenus}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#7F0303] px-5 py-3 text-sm font-semibold text-white dark:bg-[#8F1D24]"
                >
                  <img
                    src={loginIcon}
                    alt=""
                    className="h-5 w-5 object-contain"
                  />
                  Iniciar sesión
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ========================= */}
      {/* CARRITO */}
      {/* ========================= */}

      {carritoAbierto && (
        <CarritoMenu cerrarCarrito={cerrarCarrito} />
      )}
    </>
  );
}

export default Header;