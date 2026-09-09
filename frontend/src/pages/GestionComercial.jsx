import { useEffect, useState } from "react";

import {
  Boxes,
  FileText,
  UserRound,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:8000";

export default function GestionComercial() {
  const location = useLocation();
  const navigate = useNavigate();

  const { token, usuario } = useAuth();

  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // SABER EN QUÉ SECCIÓN ESTAMOS
  // ============================================================

  const esEmpleado = location.pathname.startsWith("/empleado");
  const esAdministrador = location.pathname.startsWith("/admin");

  const modulo = location.pathname.split("/").pop();

  const configuracion =
    {
      ventas: {
        titulo: "Ventas",
        etiqueta: esEmpleado
          ? "Operaciones de clientes"
          : "Operaciones de la tienda",
        icono: FileText,
        endpoint: "/ventas/",
      },
    }[modulo] || {
      titulo: "Comercial",
      etiqueta: "Gestión de tienda",
      icono: Boxes,
      endpoint: "/productos/",
    };

  const Icono = configuracion.icono;

  // ============================================================
  // CARGAR INFORMACIÓN
  // ============================================================

  const cargarDatos = async () => {
    if (!token) {
      setError("No hay una sesión activa.");
      setCargando(false);
      return;
    }

    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(
        `${API_URL}${configuracion.endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detail ||
            "No se pudo cargar la información."
        );
      }

      setDatos(
        Array.isArray(resultado)
          ? resultado
          : []
      );
    } catch (errorCarga) {
      console.error("Error cargando información:", errorCarga);

      setError(
        errorCarga.message ||
          "No se pudo cargar la información."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [configuracion.endpoint, token]);

  // ============================================================
  // OBTENER ID DE LA VENTA
  // ============================================================

  const obtenerIdVenta = (venta) => {
    return (
      venta.id ||
      venta.venta_id ||
      venta._id
    );
  };

  // ============================================================
  // OBTENER TOTAL
  // ============================================================

  const obtenerTotal = (venta) => {
    const total =
      venta.total ??
      venta.total_venta ??
      venta.monto_total ??
      0;

    return Number(total) || 0;
  };

  // ============================================================
  // OBTENER CLIENTE
  // ============================================================

  const obtenerCliente = (venta) => {
    return (
      venta.cliente ||
      venta.usuario ||
      venta.nombre_cliente ||
      venta.cliente_nombre ||
      venta.email ||
      "Cliente"
    );
  };

  // ============================================================
  // OBTENER FECHA
  // ============================================================

  const obtenerFecha = (venta) => {
    const fecha =
      venta.fecha ||
      venta.fecha_venta ||
      venta.created_at ||
      venta.createdAt;

    if (!fecha) {
      return "Fecha no disponible";
    }

    try {
      return new Date(fecha).toLocaleString(
        "es-CO",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return String(fecha);
    }
  };

  // ============================================================
  // NÚMERO DE FACTURA
  // ============================================================

  const obtenerNumeroFactura = (venta) => {
    return (
      venta.numero_factura ||
      venta.numeroFactura ||
      `VENTA-${obtenerIdVenta(venta)}`
    );
  };

  // ============================================================
  // VER FACTURA
  // ============================================================

  const verFactura = (venta) => {
    const id = obtenerIdVenta(venta);

    if (!id) {
      setError(
        "No se encontró el identificador de esta venta."
      );
      return;
    }

    navigate(`/factura/${id}`);
  };

  // ============================================================
  // DESCARGAR PDF
  //
  // La factura se abre en la página de factura.
  // Desde allí se puede generar/descargar el PDF.
  // ============================================================
const descargarPDF = (venta) => {
  const id = obtenerIdVenta(venta);

  if (!id) {
    setError("No se encontró el identificador de esta venta.");
    return;
  }

  navigate(`/factura/${id}`);
};

  // ============================================================
  // FORMATO DE DINERO
  // ============================================================

  const formatearPrecio = (valor) => {
    return `$${Number(valor || 0).toLocaleString(
      "es-CO"
    )}`;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-[#EFE8DF] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ======================================================
            ENCABEZADO
        ====================================================== */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              MUGI · Administración
            </p>

            <h1 className="mt-2 font-serif text-4xl font-bold text-[#7F0303]">
              {configuracion.titulo}
            </h1>

            <p className="mt-1 text-sm text-[#765E52]">
              {configuracion.etiqueta}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="flex items-center gap-2 rounded-2xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-3 text-sm font-semibold text-[#7F0303] transition hover:bg-white"
          >
            <UserRound size={17} />
            Editar perfil
          </button>
        </div>

        {/* ======================================================
            NAVEGACIÓN
        ====================================================== */}

        <div className="mb-6 flex flex-wrap gap-2">

          {esAdministrador && (
            <>
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-semibold text-[#765E52] transition hover:bg-white"
              >
                Resumen
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/usuarios")}
                className="rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-semibold text-[#765E52] transition hover:bg-white"
              >
                Cuentas
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/productos")}
                className="rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-semibold text-[#765E52] transition hover:bg-white"
              >
                Productos
              </button>
            </>
          )}

          {esEmpleado && (
            <>
              <button
                type="button"
                onClick={() => navigate("/empleado")}
                className="rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-semibold text-[#765E52] transition hover:bg-white"
              >
                Operación
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/empleado/productos")
                }
                className="rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-semibold text-[#765E52] transition hover:bg-white"
              >
                Productos
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() =>
              navigate(
                esEmpleado
                  ? "/empleado/ventas"
                  : "/admin/ventas"
              )
            }
            className="rounded-xl bg-[#7F0303] px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Ventas
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">

            <span>{error}</span>

            <button
              type="button"
              onClick={cargarDatos}
              className="flex items-center gap-2 rounded-xl bg-red-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-800"
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        )}

        {/* ======================================================
            TARJETA PRINCIPAL
        ====================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-[#D8BA98] bg-[#F8F3EA] shadow-lg">

          {/* CABECERA */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8BA98]/60 p-6">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7F0303] text-white">
                <Icono size={23} />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold text-[#7F0303]">
                  Registros de ventas
                </h2>

                <p className="text-sm text-[#765E52]">
                  Consulta las operaciones realizadas en MUGI STORE.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cargarDatos}
              disabled={cargando}
              className="flex items-center gap-2 rounded-xl border border-[#D8BA98] bg-white px-4 py-2 text-sm font-semibold text-[#7F0303] transition hover:bg-[#FFF9F0] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  cargando
                    ? "animate-spin"
                    : ""
                }
              />

              Actualizar
            </button>
          </div>

          {/* ====================================================
              CARGANDO
          ==================================================== */}

          {cargando ? (
            <div className="p-12 text-center">

              <RefreshCw
                size={30}
                className="mx-auto mb-4 animate-spin text-[#7F0303]"
              />

              <p className="text-sm font-semibold text-[#765E52]">
                Cargando ventas...
              </p>
            </div>

          ) : datos.length === 0 ? (

            /* ==================================================
               SIN VENTAS
            ================================================== */

            <div className="p-12 text-center">

              <FileText
                size={42}
                className="mx-auto mb-4 text-[#D8BA98]"
              />

              <h3 className="font-serif text-xl font-bold text-[#7F0303]">
                No hay ventas todavía
              </h3>

              <p className="mt-2 text-sm text-[#765E52]">
                Cuando se registre una compra aparecerá aquí.
              </p>
            </div>

          ) : (

            /* ==================================================
               LISTA DE VENTAS
            ================================================== */

            <div className="divide-y divide-[#D8BA98]/50">

              {datos.map((venta, indice) => {

                const idVenta =
                  obtenerIdVenta(venta);

                const total =
                  obtenerTotal(venta);

                const cliente =
                  obtenerCliente(venta);

                const fecha =
                  obtenerFecha(venta);

                const numeroFactura =
                  obtenerNumeroFactura(venta);

                return (
                  <div
                    key={
                      idVenta ||
                      `venta-${indice}`
                    }
                    className="p-6 transition hover:bg-[#FFF9F0]"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* INFORMACIÓN */}

                      <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7F0303]/10 text-[#7F0303]">
                          <FileText size={20} />
                        </div>

                        <div>

                          <p className="font-bold text-[#3D1717]">
                            {numeroFactura}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#765E52]">
                            {cliente}
                          </p>

                          <p className="mt-1 text-xs text-[#927E70]">
                            {fecha}
                          </p>

                        </div>
                      </div>

                      {/* TOTAL + ACCIONES */}

                      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">

                        <div className="mr-2">

                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#927E70]">
                            Total
                          </p>

                          <p className="text-xl font-bold text-[#7F0303]">
                            {formatearPrecio(total)}
                          </p>

                        </div>

                        {/* VER FACTURA */}

                        <button
                          type="button"
                          onClick={() =>
                            verFactura(venta)
                          }
                          className="flex items-center gap-2 rounded-xl border border-[#7F0303] bg-white px-4 py-2.5 text-xs font-bold text-[#7F0303] transition hover:bg-[#7F0303] hover:text-white"
                        >
                          <Eye size={16} />
                          Ver factura
                        </button>

                        {/* DESCARGAR PDF */}

                        <button
                          type="button"
                          onClick={() =>
                            descargarPDF(venta)
                          }
                          className="flex items-center gap-2 rounded-xl bg-[#7F0303] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#5F0202]"
                        >
                          <Download size={16} />
                          Descargar PDF
                        </button>

                      </div>
                    </div>

                    {/* INFORMACIÓN EXTRA */}

                    <div className="mt-4 flex flex-wrap gap-2">

                      <span className="rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-bold text-[#7F0303]">
                        Venta registrada
                      </span>

                      {idVenta && (
                        <span className="rounded-full bg-[#EFE8DF] px-3 py-1 text-xs font-semibold text-[#765E52]">
                          ID: {idVenta}
                        </span>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}