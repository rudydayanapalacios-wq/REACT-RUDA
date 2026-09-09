import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EstructuraPanel from "../components/EstructuraPanel";
import {
  Package,
  Headphones,
  User,
  ArrowRight,
  Home,
  Mail,
  Sparkles,
  ReceiptText,
  CalendarDays,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:8000";

function Cliente() {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  const [ventas, setVentas] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(true);
  const [errorVentas, setErrorVentas] = useState("");

  const nombre = usuario?.nombres || usuario?.nombre || "Cliente";
  const apellido = usuario?.apellidos || "";
  const correo = usuario?.email || "No disponible";

  // ============================================================
  // CARGAR MIS COMPRAS
  // ============================================================

  useEffect(() => {
    const cargarVentas = async () => {
      if (!token) {
        setVentas([]);
        setCargandoVentas(false);
        setErrorVentas("No hay una sesión activa.");
        return;
      }

      try {
        setCargandoVentas(true);
        setErrorVentas("");

        const respuesta = await fetch(`${API_URL}/ventas/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const datos = await respuesta.json();

        console.log("MIS VENTAS:", datos);

        if (!respuesta.ok) {
          throw new Error(
            datos.detail || "No se pudieron cargar tus compras."
          );
        }

        setVentas(Array.isArray(datos) ? datos : []);
      } catch (error) {
        console.error("Error cargando mis compras:", error);
        setVentas([]);
        setErrorVentas(
          error.message || "No se pudieron cargar tus compras."
        );
      } finally {
        setCargandoVentas(false);
      }
    };

    cargarVentas();
  }, [token]);

  // ============================================================
  // FORMATEAR PRECIO
  // ============================================================

  const formatearPrecio = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-CO")}`;
  };

  // ============================================================
  // FORMATEAR FECHA
  // ============================================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Fecha no disponible";
    }

    try {
      return new Date(fecha).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  // ============================================================
  // OBTENER DATOS DE LA VENTA
  // ============================================================

  const obtenerIdVenta = (venta) => {
    return venta?.id || venta?.venta_id || venta?._id;
  };

  const obtenerNumeroFactura = (venta) => {
    return (
      venta?.numero_factura ||
      venta?.numeroFactura ||
      `VENTA-${obtenerIdVenta(venta)}`
    );
  };

  const obtenerFecha = (venta) => {
    return (
      venta?.fecha ||
      venta?.fecha_venta ||
      venta?.created_at ||
      venta?.createdAt
    );
  };

  const obtenerTotal = (venta) => {
    return (
      venta?.total ??
      venta?.total_venta ??
      venta?.monto_total ??
      venta?.total_factura ??
      0
    );
  };

  // ============================================================
  // VER FACTURA
  // ============================================================

  const verFactura = (venta) => {
    const ventaId = obtenerIdVenta(venta);

    if (!ventaId) {
      alert("No se encontró el identificador de la venta.");
      return;
    }

    navigate(`/factura/${ventaId}`);
  };

  // ============================================================
  // RECARGAR COMPRAS
  // ============================================================

  const recargarVentas = async () => {
    if (!token) {
      return;
    }

    try {
      setCargandoVentas(true);
      setErrorVentas("");

      const respuesta = await fetch(`${API_URL}/ventas/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudieron cargar tus compras."
        );
      }

      setVentas(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error("Error recargando compras:", error);
      setErrorVentas(
        error.message || "No se pudieron cargar tus compras."
      );
    } finally {
      setCargandoVentas(false);
    }
  };

  return (
    <EstructuraPanel rol="cliente" titulo="Cliente">
      <section className="min-h-screen bg-[#EFE8DF] px-4 py-8 sm:px-6 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">

          {/* ============================================================
              INICIO
          ============================================================ */}

          <div className="mb-4 flex justify-end">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2.5 text-sm font-semibold text-[#7F0303] shadow-sm transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <Home size={17} />
              Ir a inicio
            </Link>
          </div>

          {/* ============================================================
              HERO
          ============================================================ */}

          <div className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-[#7F0303] shadow-xl">

            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-[#D4AF37]/10" />

            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full border-[35px] border-white/5" />

            <div className="relative flex flex-col justify-between gap-8 p-7 sm:p-9 md:flex-row md:items-center md:p-12">

              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/5 px-4 py-2">
                  <Sparkles size={14} className="text-[#D4AF37]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                    MUGI STORE
                  </span>
                </div>

                <h1 className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
                  Hola, {nombre}
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                  Bienvenido a tu espacio personal. Explora nuestra colección,
                  descubre nuevos productos y disfruta tu experiencia en MUGI STORE.
                </p>
              </div>

              <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-full border-4 border-[#D4AF37]/30 bg-[#F8F3EA] text-[#7F0303] shadow-lg md:self-center">
                <User size={38} strokeWidth={1.8} />
              </div>

            </div>
          </div>

          {/* ============================================================
              ACCIONES
          ============================================================ */}

          <div className="mb-8">

            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Explora MUGI
              </p>

              <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <h2 className="font-serif text-3xl font-bold text-[#7F0303]">
                  ¿Qué deseas hacer?
                </h2>

                <p className="text-sm text-[#927E70]">
                  Accesos rápidos
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* COMPRAR */}

              <Link
                to="/productos"
                className="group relative overflow-hidden rounded-[2rem] border border-[#D4AF37]/25 bg-[#F8F3EA] p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#D4AF37]/5 transition-transform duration-500 group-hover:scale-150" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7F0303] text-white shadow-md">
                      <Package size={26} />
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/30 text-[#D4AF37] transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-white">
                      <ArrowRight size={18} />
                    </div>

                  </div>

                  <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Catálogo
                  </p>

                  <h3 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">
                    Comprar productos
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#765E52]">
                    Descubre nuestra colección y encuentra los productos
                    disponibles para ti.
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#7F0303]">
                    Explorar catálogo

                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>

                </div>
              </Link>

              {/* CONTACTO */}

              <Link
                to="/contacto"
                className="group relative overflow-hidden rounded-[2rem] border border-[#D4AF37]/25 bg-[#F8F3EA] p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#7F0303]/5 transition-transform duration-500 group-hover:scale-150" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37] text-white shadow-md">
                      <Headphones size={26} />
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/30 text-[#D4AF37] transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-white">
                      <ArrowRight size={18} />
                    </div>

                  </div>

                  <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Atención
                  </p>

                  <h3 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">
                    ¿Necesitas ayuda?
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#765E52]">
                    Encuentra nuestros canales de atención y comunícate con
                    MUGI STORE.
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#7F0303]">
                    Ir a contacto

                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>

                </div>
              </Link>

            </div>
          </div>

          {/* ============================================================
              MIS COMPRAS
          ============================================================ */}

          <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-[#D4AF37]/25 bg-[#F8F3EA] shadow-md">

            <div className="border-b border-[#D8BA98]/50 px-7 py-6 md:px-9">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                    Historial
                  </p>

                  <h2 className="mt-1 font-serif text-3xl font-bold text-[#7F0303]">
                    Mis compras
                  </h2>

                  <p className="mt-1 text-sm text-[#927E70]">
                    Consulta las compras realizadas con tu cuenta.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={recargarVentas}
                  disabled={cargandoVentas}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8BA98] bg-white px-4 py-2.5 text-sm font-semibold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={cargandoVentas ? "animate-spin" : ""}
                  />
                  Actualizar
                </button>

              </div>
            </div>

            <div className="p-7 md:p-9">

              {/* CARGANDO */}

              {cargandoVentas && (
                <div className="flex flex-col items-center justify-center py-12 text-center">

                  <ReceiptText
                    size={38}
                    className="mb-4 text-[#7F0303]"
                  />

                  <p className="font-serif text-xl font-bold text-[#7F0303]">
                    Cargando tus compras...
                  </p>

                  <p className="mt-2 text-sm text-[#927E70]">
                    Estamos consultando tu historial.
                  </p>

                </div>
              )}

              {/* ERROR */}

              {!cargandoVentas && errorVentas && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

                  <ReceiptText
                    size={34}
                    className="mx-auto mb-3 text-red-700"
                  />

                  <p className="font-semibold text-red-800">
                    No se pudieron cargar tus compras
                  </p>

                  <p className="mt-2 text-sm text-red-700">
                    {errorVentas}
                  </p>

                  <button
                    type="button"
                    onClick={recargarVentas}
                    className="mt-4 rounded-xl bg-[#7F0303] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#5F0202]"
                  >
                    Intentar nuevamente
                  </button>

                </div>
              )}

              {/* SIN COMPRAS */}

              {!cargandoVentas &&
                !errorVentas &&
                ventas.length === 0 && (
                  <div className="rounded-2xl border border-[#D8BA98] bg-white/50 p-10 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7F0303] text-white">
                      <Package size={28} />
                    </div>

                    <h3 className="mt-5 font-serif text-2xl font-bold text-[#7F0303]">
                      Todavía no tienes compras
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#927E70]">
                      Cuando realices una compra en MUGI STORE,
                      aparecerá aquí tu historial de compras.
                    </p>

                    <Link
                      to="/productos"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#5F0202]"
                    >
                      <Package size={17} />
                      Comprar productos
                    </Link>

                  </div>
                )}

              {/* LISTADO DE COMPRAS */}

              {!cargandoVentas &&
                !errorVentas &&
                ventas.length > 0 && (
                  <div className="space-y-4">

                    {ventas.map((venta) => {
                      const ventaId = obtenerIdVenta(venta);
                      const numeroFactura = obtenerNumeroFactura(venta);
                      const fecha = obtenerFecha(venta);
                      const total = obtenerTotal(venta);

                      return (
                        <div
                          key={ventaId}
                          className="rounded-2xl border border-[#D8BA98] bg-white/60 p-5 transition-all duration-300 hover:border-[#D4AF37] hover:bg-white/80 hover:shadow-md"
                        >

                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                            {/* INFORMACIÓN */}

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7F0303] text-white">
                                  <ReceiptText size={19} />
                                </div>

                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#927E70]">
                                    Factura
                                  </p>

                                  <p className="font-mono text-base font-bold text-[#7F0303]">
                                    {numeroFactura}
                                  </p>
                                </div>

                              </div>

                              <div className="mt-4 flex flex-col gap-2 text-sm text-[#765E52] sm:flex-row sm:flex-wrap sm:gap-x-6">

                                <span className="inline-flex items-center gap-2">
                                  <CalendarDays size={15} />
                                  {formatearFecha(fecha)}
                                </span>

                                <span>
                                  Estado:{" "}
                                  <strong className="text-[#7F0303]">
                                    {venta.estado || "Registrada"}
                                  </strong>
                                </span>

                              </div>

                            </div>

                            {/* TOTAL Y BOTÓN */}

                            <div className="flex flex-col gap-3 border-t border-[#D8BA98]/50 pt-4 sm:flex-row sm:items-center sm:justify-between lg:border-t-0 lg:pt-0">

                              <div className="lg:text-right">

                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#927E70]">
                                  Total
                                </p>

                                <p className="font-serif text-2xl font-bold text-[#7F0303]">
                                  {formatearPrecio(total)}
                                </p>

                              </div>

                              <button
                                type="button"
                                onClick={() => verFactura(venta)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#5F0202]"
                              >
                                <Eye size={17} />
                                Ver factura
                              </button>

                            </div>

                          </div>

                        </div>
                      );
                    })}

                  </div>
                )}

            </div>
          </div>

          {/* ============================================================
              CUENTA
          ============================================================ */}

          <div className="overflow-hidden rounded-[2.5rem] border border-[#D4AF37]/25 bg-[#F8F3EA] shadow-md">

            <div className="border-b border-[#D8BA98]/50 px-7 py-6 md:px-9">

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Perfil
              </p>

              <div className="mt-1 flex items-center gap-3">
                <h2 className="font-serif text-3xl font-bold text-[#7F0303]">
                  Mi cuenta
                </h2>
              </div>

              <p className="mt-1 text-sm text-[#927E70]">
                Información de tu cuenta actual.
              </p>

            </div>

            <div className="p-7 md:p-9">

              <div className="grid gap-4 md:grid-cols-2">

                {/* NOMBRE */}

                <div className="group rounded-2xl border border-[#D8BA98] bg-white/50 p-5 transition-colors hover:bg-white/80">

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7F0303] text-white shadow-sm">
                      <User size={19} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#927E70]">
                        Nombre completo
                      </p>

                      <p className="mt-1 truncate font-semibold text-[#7F0303]">
                        {nombre} {apellido}
                      </p>

                    </div>

                  </div>

                </div>

                {/* CORREO */}

                <div className="group rounded-2xl border border-[#D8BA98] bg-white/50 p-5 transition-colors hover:bg-white/80">

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-white shadow-sm">
                      <Mail size={19} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#927E70]">
                        Correo electrónico
                      </p>

                      <p className="mt-1 truncate font-semibold text-[#7F0303]">
                        {correo}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>
    </EstructuraPanel>
  );
}

export default Cliente;
