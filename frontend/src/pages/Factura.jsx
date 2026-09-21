import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  Download,
  Printer,
  Store,
  UserRound,
  CalendarDays,
  ReceiptText,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generarFacturaPDF } from "../utils/generarFacturaPDF";

const API_URL = "http://127.0.0.1:8000";

export default function Factura() {
  const { ventaId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [factura, setFactura] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);

  const facturaRef = useRef(null);

  // =========================================================
  // CARGAR FACTURA
  // =========================================================

  useEffect(() => {
    const cargarFactura = async () => {
      if (!token) {
        setError("No hay una sesión activa.");
        setCargando(false);
        return;
      }

      if (!ventaId) {
        setError("No se encontró el identificador de la venta.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(
          `${API_URL}/ventas/${ventaId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const datos = await respuesta.json();

        console.log("FACTURA RECIBIDA:", datos);

        if (!respuesta.ok) {
          throw new Error(
            datos.detail || "No se pudo cargar la factura."
          );
        }

        setFactura(datos);
      } catch (errorCarga) {
        console.error(
          "Error cargando factura:",
          errorCarga
        );

        setError(
          errorCarga.message ||
            "No se pudo cargar la factura."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarFactura();
  }, [token, ventaId]);

  // =========================================================
  // FORMATEAR PRECIO
  // =========================================================

  const formatearPrecio = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-CO")}`;
  };

  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Fecha no disponible";
    }

    try {
      return new Date(fecha).toLocaleDateString(
        "es-CO",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    } catch {
      return "Fecha no disponible";
    }
  };

  // =========================================================
  // FORMATEAR HORA
  // =========================================================

  const formatearHora = (fecha) => {
    if (!fecha) {
      return "";
    }

    try {
      return new Date(fecha).toLocaleTimeString(
        "es-CO",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  // =========================================================
  // IMPRIMIR FACTURA
  // =========================================================

  const imprimirFactura = () => {
    console.log(
      "BOTÓN IMPRIMIR FACTURA PRESIONADO"
    );

    if (!factura) {
      alert(
        "La factura todavía no está cargada."
      );
      return;
    }

    window.print();
  };

  // =========================================================
  // DESCARGAR PDF
  // =========================================================

  const descargarPDF = () => {
    console.log(
      "BOTÓN DESCARGAR PDF PRESIONADO"
    );

    if (!factura) {
      alert(
        "La factura todavía no está cargada."
      );
      return;
    }

    if (descargando) {
      return;
    }

    try {
      setDescargando(true);

      console.log(
        "ENVIANDO FACTURA AL GENERADOR PDF:",
        factura
      );

      generarFacturaPDF(factura);

      console.log(
        "PDF GENERADO Y ENVIADO A DESCARGA"
      );
    } catch (errorPDF) {
      console.error(
        "ERROR AL DESCARGAR PDF:",
        errorPDF
      );

      alert(
        "No se pudo generar el PDF. Revisa la consola del navegador."
      );
    } finally {
      setTimeout(() => {
        setDescargando(false);
      }, 800);
    }
  };

  // =========================================================
  // CARGANDO
  // =========================================================

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EFE8DF]">
        <div className="rounded-3xl border border-[#D8BA98] bg-[#F8F3EA] px-10 py-8 text-center shadow-lg">
          <ReceiptText
            size={40}
            className="mx-auto mb-4 text-[#7F0303]"
          />

          <p className="font-serif text-xl font-bold text-[#7F0303]">
            Cargando factura...
          </p>

          <p className="mt-2 text-sm text-[#765E52]">
            Estamos preparando tu comprobante.
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EFE8DF] px-4">
        <div className="max-w-md rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
          <ReceiptText
            size={40}
            className="mx-auto mb-4 text-red-700"
          />

          <h1 className="font-serif text-2xl font-bold text-red-800">
            No se pudo cargar la factura
          </h1>

          <p className="mt-3 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={17} />
            Volver
          </button>
        </div>
      </main>
    );
  }

  // =========================================================
  // SI NO EXISTE FACTURA
  // =========================================================

  if (!factura) {
    return null;
  }

  // =========================================================
  // DATOS DE FACTURA
  // =========================================================

  const numeroFactura =
    factura.numero_factura ||
    factura.numeroFactura ||
    `VENTA-${ventaId}`;

  const fecha =
    factura.fecha ||
    factura.fecha_venta ||
    factura.created_at ||
    factura.createdAt;

  const detalles = Array.isArray(factura.detalles)
    ? factura.detalles
    : Array.isArray(factura.detalle)
      ? factura.detalle
      : Array.isArray(factura.items)
        ? factura.items
        : Array.isArray(factura.productos)
          ? factura.productos
          : [];

  // =========================================================
  // VALORES ECONÓMICOS
  // =========================================================

  const subtotal = Number(
    factura.subtotal ?? 0
  );

  const descuento = Number(
    factura.descuento ?? 0
  );

  const impuesto = Number(
    factura.impuesto ?? 0
  );

  const total = Number(
    factura.total ??
      factura.total_venta ??
      factura.monto_total ??
      factura.total_factura ??
      0
  );

  // =========================================================
  // DATOS DEL CLIENTE
  // =========================================================

  const cliente =
    factura.cliente || null;

  const nombreCliente =
    typeof cliente === "string"
      ? cliente
      : cliente?.nombre ||
        `${cliente?.nombres || ""} ${
          cliente?.apellidos || ""
        }`.trim() ||
        factura.nombre_cliente ||
        factura.cliente_nombre ||
        "Cliente MUGI";

  const emailCliente =
    typeof cliente === "object"
      ? cliente?.email || ""
      : factura.email ||
        factura.cliente_email ||
        "";

  const documentoCliente =
    typeof cliente === "object"
      ? cliente?.numero_documento || ""
      : "";

  const tipoDocumento =
    typeof cliente === "object"
      ? cliente?.tipo_documento || ""
      : "";

  const telefonoCliente =
    typeof cliente === "object"
      ? cliente?.telefono || ""
      : "";

  const direccionCliente =
    typeof cliente === "object"
      ? cliente?.direccion || ""
      : "";

  const estadoFactura =
    factura.estado || "confirmada";

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <main className="min-h-screen bg-[#EFE8DF] px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl">

        {/* ===================================================
            BOTONES
        =================================================== */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2.5 text-sm font-semibold text-[#7F0303] transition hover:bg-white"
          >
            <ArrowLeft size={17} />
            Volver
          </button>

          <div className="flex flex-wrap gap-2">

            {/* IMPRIMIR */}

            <button
              type="button"
              onClick={imprimirFactura}
              className="flex items-center gap-2 rounded-xl border border-[#7F0303] bg-white px-4 py-2.5 text-sm font-bold text-[#7F0303] transition hover:bg-[#7F0303] hover:text-white"
            >
              <Printer size={17} />
              Imprimir factura
            </button>

            {/* DESCARGAR PDF */}

            <button
              type="button"
              onClick={descargarPDF}
              disabled={descargando}
              className="flex items-center gap-2 rounded-xl bg-[#7F0303] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#5F0202] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={17} />

              {descargando
                ? "Generando PDF..."
                : "Descargar PDF"}
            </button>
          </div>
        </div>

        {/* ===================================================
            FACTURA
        =================================================== */}

        <article
          ref={facturaRef}
          className="
            overflow-hidden
            rounded-[2rem]
            border
            border-[#D8BA98]
            bg-[#F8F3EA]
            shadow-xl
            print:rounded-none
            print:border-0
            print:bg-white
            print:shadow-none
          "
        >

          {/* =================================================
              ENCABEZADO
          ================================================= */}

          <div className="bg-[#7F0303] px-8 py-8 text-white sm:px-10">
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">

              <div>
                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Store size={25} />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
                      MUGI
                    </p>

                    <h1 className="font-serif text-3xl font-bold">
                      MUGI STORE
                    </h1>
                  </div>
                </div>

                <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
                  Comprobante oficial de compra.
                  Gracias por confiar en MUGI STORE.
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                  Factura de venta
                </p>

                <p className="mt-2 font-mono text-xl font-bold text-[#D4AF37]">
                  {numeroFactura}
                </p>

                <div className="mt-3 flex items-center gap-2 text-sm text-white/80 sm:justify-end">
                  <CalendarDays size={15} />

                  <span>
                    {formatearFecha(fecha)}
                  </span>
                </div>

                {formatearHora(fecha) && (
                  <p className="mt-1 text-xs text-white/60">
                    {formatearHora(fecha)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              CLIENTE
          ================================================= */}

          <div className="grid gap-5 border-b border-[#D8BA98] p-8 sm:grid-cols-2 sm:px-10">

            {/* DATOS DEL CLIENTE */}

            <div className="rounded-2xl border border-[#D8BA98]/70 bg-white/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-[#7F0303]">
                <UserRound size={18} />

                <p className="text-xs font-bold uppercase tracking-wider">
                  Cliente
                </p>
              </div>

              <p className="font-semibold text-[#3D1717]">
                {nombreCliente}
              </p>

              {tipoDocumento && documentoCliente && (
                <div className="mt-2 flex items-center gap-2 text-sm text-[#765E52]">
                  <CreditCard size={14} />

                  <span>
                    {tipoDocumento}: {documentoCliente}
                  </span>
                </div>
              )}

              {emailCliente && (
                <p className="mt-2 break-all text-sm text-[#765E52]">
                  {emailCliente}
                </p>
              )}

              {telefonoCliente && (
                <div className="mt-2 flex items-center gap-2 text-sm text-[#765E52]">
                  <Phone size={14} />

                  <span>
                    {telefonoCliente}
                  </span>
                </div>
              )}

              {direccionCliente && (
                <div className="mt-2 flex items-start gap-2 text-sm text-[#765E52]">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {direccionCliente}
                  </span>
                </div>
              )}
            </div>

            {/* ESTADO */}

            <div className="rounded-2xl border border-[#D8BA98]/70 bg-white/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-[#7F0303]">
                <ReceiptText size={18} />

                <p className="text-xs font-bold uppercase tracking-wider">
                  Estado
                </p>
              </div>

              <span className="inline-flex rounded-full bg-[#D4AF37]/20 px-3 py-1.5 text-xs font-bold capitalize text-[#7F0303]">
                {estadoFactura}
              </span>

              <p className="mt-3 text-xs text-[#765E52]">
                Estado actual de la operación registrada.
              </p>
            </div>
          </div>

          {/* =================================================
              DETALLE
          ================================================= */}

          <div className="px-8 py-8 sm:px-10">

            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                Detalle
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">
                Productos adquiridos
              </h2>
            </div>

            <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-y border-[#D8BA98] py-3 text-[10px] font-bold uppercase tracking-wider text-[#927E70] sm:grid">
              <span>Producto</span>

              <span className="text-center">
                Cantidad
              </span>

              <span className="text-right">
                Precio
              </span>

              <span className="text-right">
                Subtotal
              </span>
            </div>

            <div className="divide-y divide-[#D8BA98]/50">

              {detalles.length > 0 ? (
                detalles.map((detalle, index) => {

                  const nombreProducto =
                    typeof detalle.producto === "object"
                      ? detalle.producto?.nombre
                      : detalle.producto ||
                        detalle.nombre ||
                        detalle.producto_nombre ||
                        `Producto ${index + 1}`;

                  const cantidad = Number(
                    detalle.cantidad ??
                      detalle.cantidad_producto ??
                      0
                  );

                  const precio = Number(
                    detalle.precio ??
                      detalle.precio_unitario ??
                      detalle.price ??
                      0
                  );

                  const subtotalDetalle = Number(
                    detalle.subtotal ??
                      detalle.total ??
                      precio * cantidad
                  );

                  return (
                    <div
                      key={
                        detalle.id ||
                        detalle.detalle_id ||
                        `${nombreProducto}-${index}`
                      }
                      className="grid gap-3 py-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4"
                    >

                      <div>
                        <p className="font-semibold text-[#3D1717]">
                          {nombreProducto}
                        </p>

                        <p className="mt-1 text-xs text-[#927E70] sm:hidden">
                          {cantidad} unidad
                          {cantidad !== 1
                            ? "es"
                            : ""}
                        </p>
                      </div>

                      <div className="text-sm text-[#765E52] sm:text-center">
                        <span className="sm:hidden">
                          Cantidad:{" "}
                        </span>

                        {cantidad}
                      </div>

                      <div className="text-sm text-[#765E52] sm:text-right">
                        <span className="sm:hidden">
                          Precio:{" "}
                        </span>

                        {formatearPrecio(precio)}
                      </div>

                      <div className="font-bold text-[#7F0303] sm:text-right">
                        <span className="mr-2 text-xs font-normal text-[#927E70] sm:hidden">
                          Subtotal:
                        </span>

                        {formatearPrecio(
                          subtotalDetalle
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-sm text-[#927E70]">
                  No hay productos registrados.
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              TOTALES
          ================================================= */}

          <div className="border-t border-[#D8BA98] bg-[#EFE8DF]/50 px-8 py-7 sm:px-10">
            <div className="ml-auto max-w-sm">

              {/* SUBTOTAL */}

              <div className="flex items-center justify-between border-b border-[#D8BA98]/70 pb-3 text-sm">
                <span className="text-[#765E52]">
                  Subtotal
                </span>

                <span className="font-semibold text-[#3D1717]">
                  {formatearPrecio(subtotal)}
                </span>
              </div>

              {/* DESCUENTO */}

              <div className="flex items-center justify-between border-b border-[#D8BA98]/70 py-3 text-sm">
                <span className="text-[#765E52]">
                  Descuento
                </span>

                <span className="font-semibold text-[#3D1717]">
                  {formatearPrecio(descuento)}
                </span>
              </div>

              {/* IMPUESTO */}

              <div className="flex items-center justify-between border-b border-[#D8BA98]/70 py-3 text-sm">
                <span className="text-[#765E52]">
                  Impuesto
                </span>

                <span className="font-semibold text-[#3D1717]">
                  {formatearPrecio(impuesto)}
                </span>
              </div>

              {/* TOTAL */}

              <div className="flex items-center justify-between pt-4">
                <span className="font-serif text-xl font-bold text-[#3D1717]">
                  Total
                </span>

                <span className="font-serif text-3xl font-bold text-[#7F0303]">
                  {formatearPrecio(total)}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              PIE
          ================================================= */}

          <footer className="border-t border-[#D8BA98] px-8 py-7 text-center sm:px-10">
            <p className="font-serif text-lg font-bold text-[#7F0303]">
              ¡Gracias por tu compra!
            </p>

            <p className="mt-2 text-xs leading-5 text-[#927E70]">
              Este documento corresponde al comprobante
              de la operación registrada en MUGI STORE.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">

              <span className="rounded-full bg-[#EFE8DF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#765E52]">
                MUGI STORE
              </span>

              <span className="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7F0303]">
                Comprobante de venta
              </span>

            </div>
          </footer>
        </article>

        <div className="mt-5 text-center print:hidden">
          <p className="text-xs text-[#927E70]">
            Puedes imprimir la factura o
            descargarla directamente en PDF.
          </p>
        </div>
      </div>
    </main>
  );
}
