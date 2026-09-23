import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Eye,
  FileText,
  Package,
  RefreshCw,
} from "lucide-react";

import EstructuraPanel from "../components/EstructuraPanel";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function EmpleadoCompras() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarVentas = async () => {
    if (!token) {
      setVentas([]);
      setCargando(false);
      setError("No hay una sesión activa.");
      return;
    }

    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(`${API_URL}/ventas/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const datos = await respuesta.json();

      console.log("COMPRAS DEL EMPLEADO:", datos);

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudieron cargar tus compras."
        );
      }

      setVentas(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error("Error cargando compras:", error);

      setVentas([]);
      setError(
        error.message || "No se pudieron cargar tus compras."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, [token]);

  const obtenerIdVenta = (venta) => {
    return venta?.id || venta?.venta_id || venta?._id;
  };

  const obtenerNumeroFactura = (venta) => {
    return (
      venta?.numero_factura ||
      venta?.numeroFactura ||
      `COMPRA-${obtenerIdVenta(venta)}`
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

  const formatearPrecio = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-CO")}`;
  };

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

  const verFactura = (venta) => {
    const ventaId = obtenerIdVenta(venta);

    if (!ventaId) {
      alert("No se encontró el identificador de la compra.");
      return;
    }

    navigate(`/factura/${ventaId}`);
  };

  return (
    <EstructuraPanel rol="empleado" titulo="Empleado">
      <section className="min-h-screen bg-[#EFE8DF] px-4 py-8 sm:px-6 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">

          {/* CABECERA */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Historial
              </p>

              <h1 className="font-serif text-4xl font-bold text-[#7F0303]">
                Mis compras
              </h1>

              <p className="mt-2 text-sm text-[#927E70]">
                Aquí puedes consultar las compras realizadas con tu cuenta.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/empleado")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2.5 text-sm font-semibold text-[#7F0303] shadow-sm transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <ArrowLeft size={17} />
              Volver al panel
            </button>
          </div>

          {/* CONTENEDOR PRINCIPAL */}
          <div className="overflow-hidden rounded-[2.5rem] border border-[#D4AF37]/25 bg-[#F8F3EA] shadow-md">

            {/* ENCABEZADO */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#D8BA98]/50 px-7 py-6 sm:flex-row sm:items-center md:px-9">
              <div>
                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7F0303] text-white">
                    <FileText size={23} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#927E70]">
                      Compras realizadas
                    </p>

                    <h2 className="font-serif text-2xl font-bold text-[#7F0303]">
                      Historial de compras
                    </h2>
                  </div>

                </div>
              </div>

              <button
                type="button"
                onClick={cargarVentas}
                disabled={cargando}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8BA98] bg-white px-4 py-2.5 text-sm font-semibold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={cargando ? "animate-spin" : ""}
                />
                Actualizar
              </button>
            </div>

            <div className="p-7 md:p-9">

              {/* CARGANDO */}
              {cargando && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7F0303] text-white">
                    <RefreshCw size={28} className="animate-spin" />
                  </div>

                  <h3 className="mt-5 font-serif text-2xl font-bold text-[#7F0303]">
                    Cargando tus compras...
                  </h3>

                  <p className="mt-2 text-sm text-[#927E70]">
                    Estamos consultando tu historial de compras.
                  </p>
                </div>
              )}

              {/* ERROR */}
              {!cargando && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                  <FileText
                    size={38}
                    className="mx-auto mb-4 text-red-700"
                  />

                  <h3 className="font-serif text-2xl font-bold text-red-800">
                    No se pudieron cargar tus compras
                  </h3>

                  <p className="mt-2 text-sm text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={cargarVentas}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5F0202]"
                  >
                    <RefreshCw size={16} />
                    Intentar nuevamente
                  </button>
                </div>
              )}

              {/* SIN COMPRAS */}
              {!cargando &&
                !error &&
                ventas.length === 0 && (
                  <div className="rounded-2xl border border-[#D8BA98] bg-white/50 p-10 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7F0303] text-white">
                      <Package size={28} />
                    </div>

                    <h3 className="mt-5 font-serif text-2xl font-bold text-[#7F0303]">
                      No tienes compras todavía
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#927E70]">
                      Cuando realices una compra, aparecerá
                      automáticamente en este historial.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/productos")}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#5F0202]"
                    >
                      <Package size={17} />
                      Ver productos
                    </button>
                  </div>
                )}

              {/* LISTA DE COMPRAS */}
              {!cargando &&
                !error &&
                ventas.length > 0 && (
                  <div className="space-y-4">

                    {ventas.map((venta) => {
                      const ventaId = obtenerIdVenta(venta);
                      const numeroFactura =
                        obtenerNumeroFactura(venta);
                      const fecha = obtenerFecha(venta);

                      const subtotal = Number(
                        venta?.subtotal ?? 0
                      );

                      const descuento = Number(
                        venta?.descuento ?? 0
                      );

                      const impuesto = Number(
                        venta?.impuesto ?? 0
                      );

                      const total = Number(
                        venta?.total ?? 0
                      );

                      return (
                        <div
                          key={ventaId}
                          className="rounded-2xl border border-[#D8BA98] bg-white/60 p-5 transition-all duration-300 hover:border-[#D4AF37] hover:bg-white/80 hover:shadow-md"
                        >
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                            {/* INFORMACIÓN */}
                            <div className="min-w-0">

                              <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7F0303] text-white">
                                  <FileText size={20} />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#927E70]">
                                    Número de factura
                                  </p>

                                  <p className="truncate font-mono text-base font-bold text-[#7F0303]">
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

                            {/* RESUMEN */}
                            <div className="flex flex-col gap-4 border-t border-[#D8BA98]/50 pt-4 sm:flex-row sm:items-end sm:justify-between lg:border-t-0 lg:pt-0">

                              <div className="lg:text-right">
                                <div className="space-y-1">

                                  <div className="flex items-center justify-between gap-6 text-sm">
                                    <span className="text-[#927E70]">
                                      Subtotal
                                    </span>

                                    <span className="font-semibold text-[#765E52]">
                                      {formatearPrecio(subtotal)}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-6 text-sm">
                                    <span className="text-[#927E70]">
                                      Descuento
                                    </span>

                                    <span className="font-semibold text-[#765E52]">
                                      {formatearPrecio(descuento)}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-6 text-sm">
                                    <span className="text-[#927E70]">
                                      Impuesto
                                    </span>

                                    <span className="font-semibold text-[#765E52]">
                                      {formatearPrecio(impuesto)}
                                    </span>
                                  </div>

                                  <div className="mt-2 border-t border-[#D8BA98]/50 pt-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#927E70]">
                                      Total
                                    </p>

                                    <p className="font-serif text-2xl font-bold text-[#7F0303]">
                                      {formatearPrecio(total)}
                                    </p>
                                  </div>

                                </div>
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
        </div>
      </section>
    </EstructuraPanel>
  );
}