import { useEffect, useState } from "react";

import {
  Boxes,
  FileText,
  UserRound,
  Download,
  Eye,
  RefreshCw,
  CalendarDays,
  Search,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EstructuraPanel from "../components/EstructuraPanel";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import { generarFacturaPDF } from "../utils/generarFacturaPDF";

const API_URL = import.meta.env.VITE_API_URL;

function ContenedorGestion({ mostrarEstructura, esEmpleado, children }) {
  if (!mostrarEstructura) {
    return children;
  }

  return (
    <EstructuraPanel
      rol={esEmpleado ? "empleado" : "administrador"}
      titulo={esEmpleado ? "Empleado" : "Administrador"}
    >
      {children}
    </EstructuraPanel>
  );
}

export default function GestionComercial({ mostrarEstructura = true }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, usuario } = useAuth();

  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [descargandoFactura, setDescargandoFactura] = useState(null);
  const [ventaDetalle, setVentaDetalle] = useState(null);

  // ============================================================
  // FECHA DEL REPORTE
  // ============================================================

  const obtenerFechaLocal = () => {
    const fecha = new Date();

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
  };

  const [fechaReporte, setFechaReporte] = useState(
    obtenerFechaLocal()
  );

  const [mostrarTodas, setMostrarTodas] = useState(false);

  // ============================================================
  // CONSULTA DE FACTURAS
  // ============================================================

  const [busquedaFactura, setBusquedaFactura] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [fechaFactura, setFechaFactura] = useState("");

  // ============================================================
  // SABER EN QUÉ SECCIÓN ESTAMOS
  // ============================================================

  const esEmpleado =
    location.pathname.startsWith("/empleado");

  const esAdministrador =
    location.pathname.startsWith("/admin");

  const modulo =
    location.pathname.split("/").pop();

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
      console.error(
        "Error cargando información:",
        errorCarga
      );

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
    if (
      venta.cliente &&
      typeof venta.cliente === "object"
    ) {
      return (
        venta.cliente.nombre ||
        `${venta.cliente.nombres || ""} ${
          venta.cliente.apellidos || ""
        }`.trim() ||
        venta.cliente.email ||
        "Cliente"
      );
    }

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
  // FORMATO DE DINERO
  // ============================================================

  const formatearPrecio = (valor) => {
    return `$${Number(
      valor || 0
    ).toLocaleString("es-CO")}`;
  };

  const obtenerNombreDetalle = (detalle) => {
    const producto = detalle?.producto;

    if (producto && typeof producto === "object") {
      return (
        producto.nombre ||
        producto.nombre_producto ||
        detalle?.producto_nombre ||
        "Producto"
      );
    }

    return (
      producto ||
      detalle?.producto_nombre ||
      detalle?.nombre_producto ||
      "Producto"
    );
  };

  const obtenerCategoriaDetalle = (detalle) => {
    if (detalle?.categoria) {
      return detalle.categoria;
    }

    if (detalle?.producto && typeof detalle.producto === "object") {
      return detalle.producto.categoria || "";
    }

    return "";
  };

  const obtenerDescripcionDetalle = (detalle) => {
    if (detalle?.descripcion) {
      return detalle.descripcion;
    }

    if (detalle?.producto && typeof detalle.producto === "object") {
      return detalle.producto.descripcion || "";
    }

    return "";
  };

  // ============================================================
  // OBTENER FECHA YYYY-MM-DD
  // ============================================================

  const obtenerFechaComparacion = (venta) => {
    if (!venta.fecha) {
      return "";
    }

    const fecha = String(venta.fecha);

    const coincidencia = fecha.match(
      /^(\d{4}-\d{2}-\d{2})/
    );

    if (coincidencia) {
      return coincidencia[1];
    }

    const fechaConvertida = new Date(fecha);

    if (
      Number.isNaN(
        fechaConvertida.getTime()
      )
    ) {
      return "";
    }

    const año =
      fechaConvertida.getFullYear();

    const mes = String(
      fechaConvertida.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
      fechaConvertida.getDate()
    ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
  };

  // ============================================================
  // VENTAS DEL REPORTE
  // ============================================================

  const ventasDelDia = mostrarTodas
    ? datos
    : datos.filter(
        (venta) =>
          obtenerFechaComparacion(venta) ===
          fechaReporte
      );

  // ============================================================
  // CONSULTA DE FACTURAS
  // ============================================================

  const ventasFiltradas =
    ventasDelDia.filter((venta) => {
      const numeroFactura =
        obtenerNumeroFactura(venta)
          .toLowerCase();

      const cliente =
        obtenerCliente(venta)
          .toLowerCase();

      const textoFactura =
        busquedaFactura
          .trim()
          .toLowerCase();

      const textoCliente =
        busquedaCliente
          .trim()
          .toLowerCase();

      const coincideFactura =
        !textoFactura ||
        numeroFactura.includes(
          textoFactura
        );

      const coincideCliente =
        !textoCliente ||
        cliente.includes(
          textoCliente
        );

      const coincideFecha =
        !fechaFactura ||
        obtenerFechaComparacion(
          venta
        ) === fechaFactura;

      return (
        coincideFactura &&
        coincideCliente &&
        coincideFecha
      );
    });

  // ============================================================
  // TOTALES DEL REPORTE
  // ============================================================

  const totalVentasReporte =
    ventasFiltradas.length;

  const totalVendidoReporte =
    ventasFiltradas.reduce(
      (total, venta) =>
        total + obtenerTotal(venta),
      0
    );

  const totalProductosReporte =
    ventasFiltradas.reduce(
      (total, venta) => {
        const detalles =
          venta.detalles || [];

        return (
          total +
          detalles.reduce(
            (cantidad, detalle) =>
              cantidad +
              Number(
                detalle.cantidad || 0
              ),
            0
          )
        );
      },
      0
    );

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

    setVentaDetalle(venta);
  };

  // ============================================================
  // DESCARGAR FACTURA PDF DIRECTAMENTE
  // ============================================================

  const descargarPDF = async (venta) => {
    const id = obtenerIdVenta(venta);

    if (!id) {
      setError(
        "No se encontró el identificador de esta venta."
      );
      return;
    }

    if (!token) {
      setError(
        "No hay una sesión activa."
      );
      return;
    }

    if (descargandoFactura === id) {
      return;
    }

    try {
      setError("");
      setDescargandoFactura(id);

      console.log(
        "Obteniendo factura para descargar:",
        id
      );

      const respuesta = await fetch(
        `${API_URL}/ventas/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const resultado =
        await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detail ||
            "No se pudo obtener la información de la factura."
        );
      }

      console.log(
        "Factura obtenida:",
        resultado
      );

      generarFacturaPDF(resultado);

      console.log(
        "PDF de factura generado correctamente."
      );
    } catch (errorPDF) {
      console.error(
        "Error descargando factura PDF:",
        errorPDF
      );

      setError(
        errorPDF.message ||
          "No se pudo descargar la factura en PDF."
      );
    } finally {
      setDescargandoFactura(null);
    }
  };

  // ============================================================
  // DESCARGAR REPORTE PDF
  // ============================================================

  const descargarReporteDiarioPDF =
    async () => {
      if (ventasFiltradas.length === 0) {
        setError(
          mostrarTodas
            ? "No hay ventas registradas para generar el reporte."
            : "No hay ventas en la fecha seleccionada."
        );

        return;
      }

      const doc = new jsPDF();

      // ========================================================
      // LOGO
      // ========================================================

      let logo = null;

      try {
        logo = await new Promise(
          (resolve, reject) => {
            const img = new Image();

            img.onload = () =>
              resolve(img);

            img.onerror = reject;

            img.src = "/img/logo.png";
          }
        );
      } catch (errorLogo) {
        console.warn(
          "No se pudo cargar el logo:",
          errorLogo
        );
      }

      // ========================================================
      // FECHA DEL REPORTE
      // ========================================================

      let fechaFormateada = "";

      if (mostrarTodas) {
        fechaFormateada =
          "Todas las fechas";
      } else {
        const fechaSeleccionada =
          new Date(
            `${fechaReporte}T12:00:00`
          );

        fechaFormateada =
          fechaSeleccionada.toLocaleDateString(
            "es-CO",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }
          );
      }

      // ========================================================
      // FECHA DE GENERACIÓN
      // ========================================================

      const fechaGeneracion =
        new Date().toLocaleString(
          "es-CO",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        );

      // ========================================================
      // ENCABEZADO
      // ========================================================

      doc.setFillColor(
        74,
        5,
        5
      );

      doc.rect(
        0,
        0,
        210,
        40,
        "F"
      );

      if (logo) {
        doc.addImage(
          logo,
          "PNG",
          12,
          7,
          26,
          26
        );
      }

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFontSize(21);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "MUGI STORE",
        45,
        17
      );

      doc.setFontSize(10);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        mostrarTodas
          ? "REPORTE GENERAL DE VENTAS"
          : "REPORTE DIARIO DE VENTAS",
        45,
        25
      );

      doc.setTextColor(
        212,
        175,
        55
      );

      doc.setFontSize(8);

      doc.text(
        "Sistema de gestión comercial",
        45,
        32
      );

      doc.setDrawColor(
        212,
        175,
        55
      );

      doc.setLineWidth(1);

      doc.line(
        12,
        37,
        198,
        37
      );

      // ========================================================
      // INFORMACIÓN
      // ========================================================

      doc.setTextColor(
        61,
        23,
        23
      );

      doc.setFontSize(10);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Información del reporte",
        14,
        51
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Fecha del reporte: ${fechaFormateada}`,
        14,
        59
      );

      doc.text(
        `Fecha de generación: ${fechaGeneracion}`,
        14,
        66
      );

      // ========================================================
      // RESUMEN
      // ========================================================

      doc.setFillColor(
        248,
        243,
        234
      );

      doc.roundedRect(
        14,
        73,
        56,
        25,
        3,
        3,
        "F"
      );

      doc.roundedRect(
        77,
        73,
        56,
        25,
        3,
        3,
        "F"
      );

      doc.roundedRect(
        140,
        73,
        56,
        25,
        3,
        3,
        "F"
      );

      doc.setTextColor(
        118,
        94,
        82
      );

      doc.setFontSize(8);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "VENTAS",
        18,
        81
      );

      doc.text(
        "PRODUCTOS",
        81,
        81
      );

      doc.text(
        "TOTAL VENDIDO",
        144,
        81
      );

      doc.setTextColor(
        127,
        3,
        3
      );

      doc.setFontSize(13);

      doc.text(
        String(totalVentasReporte),
        18,
        91
      );

      doc.text(
        String(totalProductosReporte),
        81,
        91
      );

      doc.setFontSize(11);

      doc.text(
        formatearPrecio(
          totalVendidoReporte
        ),
        144,
        91
      );

      // ========================================================
      // FILAS
      // ========================================================

      const filas = [];

      ventasFiltradas.forEach(
        (venta) => {
          const detalles =
            venta.detalles || [];

          if (detalles.length === 0) {
            filas.push([
              obtenerNumeroFactura(
                venta
              ),
              obtenerCliente(
                venta
              ),
              "Sin productos",
              "-",
              "-",
              formatearPrecio(
                obtenerTotal(venta)
              ),
              venta.estado ||
                "Sin estado",
            ]);

            return;
          }

          detalles.forEach(
            (detalle) => {
              filas.push([
                obtenerNumeroFactura(
                  venta
                ),
                obtenerCliente(
                  venta
                ),
                detalle.producto ||
                  "Producto",
                detalle.cantidad || 0,
                formatearPrecio(
                  detalle.precio_unitario
                ),
                formatearPrecio(
                  detalle.subtotal
                ),
                venta.estado ||
                  "Sin estado",
              ]);
            }
          );
        }
      );

      // ========================================================
      // TABLA
      // ========================================================

      autoTable(doc, {
        startY: 106,

        head: [
          [
            "N° Venta",
            "Cliente",
            "Producto",
            "Cantidad",
            "Valor",
            "Total",
            "Estado",
          ],
        ],

        body: filas,

        theme: "grid",

        styles: {
          fontSize: 7.5,
          cellPadding: 3,
          textColor: [
            61,
            23,
            23,
          ],
          valign: "middle",
        },

        headStyles: {
          fillColor: [
            127,
            3,
            3,
          ],
          textColor: [
            255,
            255,
            255,
          ],
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
        },

        alternateRowStyles: {
          fillColor: [
            248,
            243,
            234,
          ],
        },

        columnStyles: {
          0: {
            cellWidth: 28,
          },

          1: {
            cellWidth: 31,
          },

          2: {
            cellWidth: 36,
          },

          3: {
            halign: "center",
            cellWidth: 17,
          },

          4: {
            halign: "right",
            cellWidth: 24,
          },

          5: {
            halign: "right",
            cellWidth: 25,
          },

          6: {
            cellWidth: 25,
          },
        },

        margin: {
          left: 14,
          right: 14,
        },

        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            doc.setFillColor(
              74,
              5,
              5
            );

            doc.rect(
              0,
              0,
              210,
              15,
              "F"
            );

            doc.setTextColor(
              255,
              255,
              255
            );

            doc.setFontSize(8);

            doc.setFont(
              "helvetica",
              "bold"
            );

            doc.text(
              "MUGI STORE · Reporte de ventas",
              14,
              10
            );
          }

          doc.setTextColor(
            118,
            94,
            82
          );

          doc.setFontSize(8);

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.text(
            `Página ${data.pageNumber}`,
            180,
            290
          );
        },
      });

      // ========================================================
      // TOTALES FINALES
      // ========================================================

      let posicionFinal =
        doc.lastAutoTable?.finalY ||
        106;

      if (posicionFinal > 245) {
        doc.addPage();
        posicionFinal = 25;
      }

      const inicioTotales =
        posicionFinal + 15;

      doc.setDrawColor(
        212,
        175,
        55
      );

      doc.setLineWidth(0.8);

      doc.line(
        14,
        inicioTotales - 5,
        196,
        inicioTotales - 5
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(10);

      doc.setTextColor(
        127,
        3,
        3
      );

      doc.text(
        `Total de ventas: ${totalVentasReporte}`,
        14,
        inicioTotales + 3
      );

      doc.text(
        `Total de productos: ${totalProductosReporte}`,
        14,
        inicioTotales + 11
      );

      doc.text(
        `Total vendido: ${formatearPrecio(
          totalVendidoReporte
        )}`,
        14,
        inicioTotales + 19
      );

      // ========================================================
      // PIE
      // ========================================================

      const paginas =
        doc.getNumberOfPages();

      for (
        let pagina = 1;
        pagina <= paginas;
        pagina++
      ) {
        doc.setPage(pagina);

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(8);

        doc.setTextColor(
          118,
          94,
          82
        );

        doc.text(
          "MUGI STORE · Reporte generado por el sistema",
          14,
          285
        );

        doc.text(
          `Página ${pagina} de ${paginas}`,
          165,
          285
        );
      }

      // ========================================================
      // DESCARGAR
      // ========================================================

      const nombreArchivo =
        mostrarTodas
          ? "Reporte_General_MUGI.pdf"
          : `Reporte_Diario_MUGI_${fechaReporte}.pdf`;

      doc.save(nombreArchivo);
    };

  // ============================================================
  // DESCARGAR REPORTE EXCEL
  // ============================================================

  const descargarReporteExcel = () => {
    if (ventasFiltradas.length === 0) {
      setError(
        mostrarTodas
          ? "No hay ventas registradas para generar el archivo Excel."
          : "No hay ventas en la fecha seleccionada."
      );

      return;
    }

    const filas = [];

    ventasFiltradas.forEach(
      (venta) => {
        const detalles =
          venta.detalles || [];

        if (detalles.length === 0) {
          filas.push({
            "N° Venta":
              obtenerNumeroFactura(
                venta
              ),

            Fecha:
              obtenerFecha(venta),

            Cliente:
              obtenerCliente(venta),

            Producto:
              "Sin productos",

            Cantidad: 0,

            "Precio unitario": 0,

            Subtotal: 0,

            "Total venta":
              obtenerTotal(venta),

            Estado:
              venta.estado ||
              "Sin estado",
          });

          return;
        }

        detalles.forEach(
          (detalle) => {
            filas.push({
              "N° Venta":
                obtenerNumeroFactura(
                  venta
                ),

              Fecha:
                obtenerFecha(venta),

              Cliente:
                obtenerCliente(
                  venta
                ),

              Producto:
                detalle.producto ||
                "Producto",

              Cantidad:
                Number(
                  detalle.cantidad ||
                    0
                ),

              "Precio unitario":
                Number(
                  detalle.precio_unitario ||
                    0
                ),

              Subtotal:
                Number(
                  detalle.subtotal ||
                    0
                ),

              "Total venta":
                obtenerTotal(venta),

              Estado:
                venta.estado ||
                "Sin estado",
            });
          }
        );
      }
    );

    const hoja =
      XLSX.utils.json_to_sheet(
        filas
      );

    hoja["!cols"] = [
      { wch: 24 },
      { wch: 22 },
      { wch: 28 },
      { wch: 30 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];

    const libro =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      libro,
      hoja,
      "Reporte de ventas"
    );

    const nombreArchivo =
      mostrarTodas
        ? "Reporte_General_MUGI.xlsx"
        : `Reporte_Diario_MUGI_${fechaReporte}.xlsx`;

    XLSX.writeFile(
      libro,
      nombreArchivo
    );
  };

  // ============================================================
  // LIMPIAR FILTROS
  // ============================================================

  const limpiarFiltros = () => {
    setBusquedaFactura("");
    setBusquedaCliente("");
    setFechaFactura("");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <ContenedorGestion
      mostrarEstructura={mostrarEstructura}
      esEmpleado={esEmpleado}
    >
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
            onClick={() =>
              navigate("/perfil")
            }
            className="flex items-center gap-2 rounded-2xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-3 text-sm font-semibold text-[#7F0303] transition hover:bg-white"
          >
            <UserRound size={17} />
            Editar perfil
          </button>
        </div>

        {/* ======================================================
            NAVEGACIÓN
        ====================================================== */}

        {mostrarEstructura && (
        <div className="mb-6 flex flex-wrap gap-2">

          {esAdministrador && (
            <>
              <button
                type="button"
                onClick={() =>
                  navigate("/admin")
                }
                className="rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-semibold text-[#765E52] transition hover:bg-white"
              >
                Resumen
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/usuarios"
                  )
                }
                className="rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-semibold text-[#765E52] transition hover:bg-white"
              >
                Cuentas
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/productos"
                  )
                }
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
                onClick={() =>
                  navigate("/empleado")
                }
                className="rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-semibold text-[#765E52] transition hover:bg-white"
              >
                Operación
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/empleado/productos"
                  )
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
        )}

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

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={
                  descargarReporteDiarioPDF
                }
                className="flex h-[42px] items-center gap-2 rounded-xl bg-[#7F0303] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#5F0202]"
              >
                <Download size={16} />

                {mostrarTodas
                  ? "Reporte general PDF"
                  : "Reporte diario PDF"}
              </button>

              <button
                type="button"
                onClick={
                  descargarReporteExcel
                }
                className="flex h-[42px] items-center gap-2 rounded-xl bg-[#2F6B3C] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#24552F]"
              >
                <Download size={16} />
                Excel
              </button>

              <button
                type="button"
                onClick={cargarDatos}
                disabled={cargando}
                className="flex h-[42px] items-center gap-2 rounded-xl border border-[#D8BA98] bg-white px-4 text-sm font-semibold text-[#7F0303] transition hover:bg-[#FFF9F0] disabled:opacity-50"
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
          </div>

          {/* ====================================================
              SELECTOR DE FECHA
          ==================================================== */}

          <div className="border-b border-[#D8BA98]/60 bg-[#FFF9F0] p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <CalendarDays
                    size={18}
                    className="text-[#7F0303]"
                  />

                  <h3 className="font-serif text-lg font-bold text-[#7F0303]">
                    Reporte de ventas
                  </h3>

                </div>

                <p className="text-sm text-[#765E52]">
                  Selecciona una fecha para consultar las ventas de ese día o visualiza todas las ventas.
                </p>

              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">

                <div>

                  <label
                    htmlFor="fechaReporte"
                    className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#765E52]"
                  >
                    Fecha
                  </label>

                  <input
                    id="fechaReporte"
                    type="date"
                    value={fechaReporte}
                    disabled={mostrarTodas}
                    onChange={(e) => {
                      setFechaReporte(
                        e.target.value
                      );

                      setMostrarTodas(
                        false
                      );
                    }}
                    className="h-[42px] rounded-xl border border-[#D8BA98] bg-white px-4 text-sm font-semibold text-[#3D1717] outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#7F0303]/10 disabled:cursor-not-allowed disabled:bg-[#EFE8DF] disabled:opacity-70"
                  />

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarTodas(true)
                  }
                  className={`flex h-[42px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
                    mostrarTodas
                      ? "bg-[#D4AF37] text-[#4A0505]"
                      : "border border-[#D8BA98] bg-white text-[#7F0303] hover:bg-[#FFF9F0]"
                  }`}
                >
                  <FileText size={16} />
                  Ver todas
                </button>

                <button
                  type="button"
                  onClick={
                    descargarReporteDiarioPDF
                  }
                  className="flex h-[42px] items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 text-sm font-bold text-[#4A0505] transition hover:bg-[#C49F2E]"
                >
                  <Download size={16} />

                  {mostrarTodas
                    ? "Descargar todas"
                    : "Descargar reporte"}
                </button>

                <button
                  type="button"
                  onClick={
                    descargarReporteExcel
                  }
                  className="flex h-[42px] items-center justify-center gap-2 rounded-xl border border-[#2F6B3C] bg-white px-4 text-sm font-bold text-[#2F6B3C] transition hover:bg-[#F0F8F2]"
                >
                  <Download size={16} />
                  Excel
                </button>

              </div>

            </div>

            <div className="mt-4">

              {mostrarTodas ? (
                <div className="rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-4 py-3 text-sm font-semibold text-[#7F0303]">
                  Mostrando todas las ventas registradas, sin importar la fecha.
                </div>
              ) : (
                <div className="rounded-xl border border-[#D8BA98] bg-white px-4 py-3 text-sm font-semibold text-[#765E52]">
                  Mostrando ventas del{" "}
                  {new Date(
                    `${fechaReporte}T12:00:00`
                  ).toLocaleDateString(
                    "es-CO",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                  .
                </div>
              )}

            </div>

            {/* RESUMEN */}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl border border-[#D8BA98] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                  {mostrarTodas
                    ? "Total de ventas"
                    : "Ventas del día"}
                </p>

                <p className="mt-1 text-2xl font-bold text-[#7F0303]">
                  {totalVentasReporte}
                </p>
              </div>

              <div className="rounded-2xl border border-[#D8BA98] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                  Productos vendidos
                </p>

                <p className="mt-1 text-2xl font-bold text-[#7F0303]">
                  {totalProductosReporte}
                </p>
              </div>

              <div className="rounded-2xl border border-[#D8BA98] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                  Total vendido
                </p>

                <p className="mt-1 text-2xl font-bold text-[#7F0303]">
                  {formatearPrecio(
                    totalVendidoReporte
                  )}
                </p>
              </div>

            </div>

          </div>

          {/* ====================================================
              CONSULTA DE FACTURAS
          ==================================================== */}

          <div className="border-b border-[#D8BA98]/60 bg-white p-6">

            <div className="mb-4 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7F0303]/10 text-[#7F0303]">
                <Search size={18} />
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#7F0303]">
                  Consultar facturas
                </h3>

                <p className="text-sm text-[#765E52]">
                  Busca facturas por número, cliente o fecha.
                </p>
              </div>

            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <div>

                <label
                  htmlFor="busquedaFactura"
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#765E52]"
                >
                  Número de factura
                </label>

                <div className="relative">

                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#927E70]"
                  />

                  <input
                    id="busquedaFactura"
                    type="text"
                    value={busquedaFactura}
                    onChange={(e) =>
                      setBusquedaFactura(
                        e.target.value
                      )
                    }
                    placeholder="Ej: FAC-20260918..."
                    className="h-[42px] w-full rounded-xl border border-[#D8BA98] bg-[#F8F3EA] pl-9 pr-4 text-sm text-[#3D1717] outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#7F0303]/10"
                  />

                </div>

              </div>

              <div>

                <label
                  htmlFor="busquedaCliente"
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#765E52]"
                >
                  Cliente
                </label>

                <div className="relative">

                  <UserRound
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#927E70]"
                  />

                  <input
                    id="busquedaCliente"
                    type="text"
                    value={busquedaCliente}
                    onChange={(e) =>
                      setBusquedaCliente(
                        e.target.value
                      )
                    }
                    placeholder="Nombre o correo"
                    className="h-[42px] w-full rounded-xl border border-[#D8BA98] bg-[#F8F3EA] pl-9 pr-4 text-sm text-[#3D1717] outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#7F0303]/10"
                  />

                </div>

              </div>

              <div>

                <label
                  htmlFor="fechaFactura"
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#765E52]"
                >
                  Fecha de factura
                </label>

                <div className="relative">

                  <CalendarDays
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#927E70]"
                  />

                  <input
                    id="fechaFactura"
                    type="date"
                    value={fechaFactura}
                    onChange={(e) =>
                      setFechaFactura(
                        e.target.value
                      )
                    }
                    className="h-[42px] w-full rounded-xl border border-[#D8BA98] bg-[#F8F3EA] pl-9 pr-4 text-sm font-semibold text-[#3D1717] outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#7F0303]/10"
                  />

                </div>

              </div>

            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

              <p className="text-sm font-semibold text-[#765E52]">
                {ventasFiltradas.length}{" "}
                {ventasFiltradas.length === 1
                  ? "factura encontrada"
                  : "facturas encontradas"}
                .
              </p>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2 text-sm font-bold text-[#7F0303] transition hover:bg-[#FFF9F0]"
              >
                Limpiar filtros
              </button>

            </div>

          </div>

          {/* ====================================================
              CARGANDO / RESULTADOS
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
          ) : ventasFiltradas.length === 0 ? (
            <div className="p-12 text-center">

              {busquedaFactura ||
              busquedaCliente ||
              fechaFactura ? (
                <Search
                  size={42}
                  className="mx-auto mb-4 text-[#D8BA98]"
                />
              ) : (
                <CalendarDays
                  size={42}
                  className="mx-auto mb-4 text-[#D8BA98]"
                />
              )}

              <h3 className="font-serif text-xl font-bold text-[#7F0303]">
                {busquedaFactura ||
                busquedaCliente ||
                fechaFactura
                  ? "No se encontraron facturas"
                  : "No hay ventas en esta fecha"}
              </h3>

              <p className="mt-2 text-sm text-[#765E52]">
                {busquedaFactura ||
                busquedaCliente ||
                fechaFactura
                  ? "No existen facturas que coincidan con los criterios de búsqueda."
                  : `No se encontraron ventas registradas para ${new Date(
                      `${fechaReporte}T12:00:00`
                    ).toLocaleDateString(
                      "es-CO",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}.`}
              </p>

              {busquedaFactura ||
              busquedaCliente ||
              fechaFactura ? (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="mt-5 rounded-xl bg-[#7F0303] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#5F0202]"
                >
                  Limpiar filtros
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setMostrarTodas(true)
                  }
                  className="mt-5 rounded-xl bg-[#7F0303] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#5F0202]"
                >
                  Ver todas las ventas
                </button>
              )}

            </div>
          ) : (
            <div className="divide-y divide-[#D8BA98]/50">

              {ventasFiltradas.map(
                (venta, indice) => {
                  const idVenta =
                    obtenerIdVenta(
                      venta
                    );

                  const total =
                    obtenerTotal(
                      venta
                    );

                  const cliente =
                    obtenerCliente(
                      venta
                    );

                  const fecha =
                    obtenerFecha(
                      venta
                    );

                  const numeroFactura =
                    obtenerNumeroFactura(
                      venta
                    );

                  const estaDescargando =
                    descargandoFactura ===
                    idVenta;

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
                            <FileText
                              size={20}
                            />
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
                              {formatearPrecio(
                                total
                              )}
                            </p>

                          </div>

                          {/* VER FACTURA */}

                          <button
                            type="button"
                            onClick={() =>
                              verFactura(
                                venta
                              )
                            }
                            className="flex h-[42px] w-40 items-center justify-center gap-2 rounded-xl border border-[#7F0303] bg-white px-4 text-xs font-bold text-[#7F0303] transition hover:bg-[#7F0303] hover:text-white"
                          >
                            <Eye
                              size={16}
                            />
                            Ver factura
                          </button>

                          {/* DESCARGAR FACTURA PDF */}

                          <button
                            type="button"
                            onClick={() =>
                              descargarPDF(
                                venta
                              )
                            }
                            disabled={
                              estaDescargando
                            }
                            className="flex h-[42px] w-40 items-center justify-center gap-2 rounded-xl bg-[#7F0303] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#5F0202] disabled:cursor-not-allowed disabled:opacity-60"
                          >

                            {estaDescargando ? (
                              <>
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                                Generando...
                              </>
                            ) : (
                              <>
                                <Download
                                  size={16}
                                />
                                Descargar PDF
                              </>
                            )}

                          </button>

                        </div>

                      </div>

                      {/* INFORMACIÓN EXTRA */}

                      <div className="mt-4 flex flex-wrap gap-2">

                        <span className="rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-bold text-[#7F0303]">
                          {venta.estado ||
                            "Venta registrada"}
                        </span>

                        {idVenta && (
                          <span className="rounded-full bg-[#EFE8DF] px-3 py-1 text-xs font-semibold text-[#765E52]">
                            ID: {idVenta}
                          </span>
                        )}

                        <span className="rounded-full bg-[#EFE8DF] px-3 py-1 text-xs font-semibold text-[#765E52]">
                          Productos:{" "}
                          {(venta.detalles ||
                            []
                          ).reduce(
                            (
                              cantidad,
                              detalle
                            ) =>
                              cantidad +
                              Number(
                                detalle.cantidad ||
                                  0
                              ),
                            0
                          )}
                        </span>

                      </div>

                      {/* DETALLES */}

                      {venta.detalles &&
                        venta.detalles.length >
                          0 && (
                          <div className="mt-4 rounded-2xl border border-[#D8BA98] bg-white p-4">

                            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#927E70]">
                              Productos de la venta
                            </p>

                            <div className="space-y-2">

                              {venta.detalles.map(
                                (
                                  detalle,
                                  detalleIndex
                                ) => (
                                  <div
                                    key={
                                      detalleIndex
                                    }
                                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFE8DF] pb-2 last:border-0 last:pb-0"
                                  >

                                    <div>

                                      <p className="text-sm font-semibold text-[#3D1717]">
                                        {detalle.producto ||
                                          "Producto"}
                                      </p>

                                      <p className="text-xs text-[#927E70]">
                                        Cantidad:{" "}
                                        {
                                          detalle.cantidad
                                        }
                                        {" · "}
                                        Valor unitario:{" "}
                                        {formatearPrecio(
                                          detalle.precio_unitario
                                        )}
                                      </p>

                                    </div>

                                    <p className="text-sm font-bold text-[#7F0303]">
                                      {formatearPrecio(
                                        detalle.subtotal
                                      )}
                                    </p>

                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>

      {ventaDetalle && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#160B0C]/70 p-4 backdrop-blur-sm"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setVentaDetalle(null);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#D4AF37]/40 bg-[#F8F3EA] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#D8BA98] px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#927E70]">MUGI STORE · Factura</p>
                <h2 className="mt-1 font-serif text-3xl font-bold text-[#7F0303]">
                  {obtenerNumeroFactura(ventaDetalle)}
                </h2>
                <p className="mt-1 text-sm text-[#927E70]">Detalle de la venta registrada</p>
              </div>
              <button
                type="button"
                onClick={() => setVentaDetalle(null)}
                aria-label="Cerrar factura"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8BA98] text-[#7F0303] transition hover:bg-[#EFE8DF]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-[#D8BA98] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">Cliente</p>
                  <p className="mt-1 font-semibold text-[#2C1B1B]">{obtenerCliente(ventaDetalle)}</p>
                </div>
                <div className="rounded-xl border border-[#D8BA98] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">Fecha</p>
                  <p className="mt-1 font-semibold text-[#2C1B1B]">{obtenerFecha(ventaDetalle)}</p>
                </div>
                <div className="rounded-xl border border-[#D8BA98] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">Estado</p>
                  <p className="mt-1 font-semibold text-[#40552B]">{ventaDetalle.estado || "Venta registrada"}</p>
                </div>
                <div className="rounded-xl border border-[#D8BA98] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">Unidades</p>
                  <p className="mt-1 font-semibold text-[#2C1B1B]">
                    {(ventaDetalle.detalles || []).reduce((cantidad, detalleVenta) => cantidad + Number(detalleVenta.cantidad || 0), 0)}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-serif text-xl font-bold text-[#7F0303]">Productos</h3>
                  <span className="text-sm font-semibold text-[#927E70]">
                    {(ventaDetalle.detalles || []).reduce((cantidad, detalleVenta) => cantidad + Number(detalleVenta.cantidad || 0), 0)} unidades
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#D8BA98] bg-white">
                  {(ventaDetalle.detalles || []).length === 0 ? (
                    <p className="p-5 text-sm text-[#927E70]">No hay productos detallados en esta venta.</p>
                  ) : (
                    <div className="divide-y divide-[#EFE8DF]">
                      {ventaDetalle.detalles.map((detalleVenta, detalleIndex) => (
                        <div key={detalleIndex} className="space-y-3 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-[#2C1B1B]">
                                {obtenerNombreDetalle(detalleVenta)}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#765E52]">
                                <span className="rounded-full bg-[#EFE8DF] px-3 py-1">
                                  Cantidad: {detalleVenta.cantidad || 0}
                                </span>
                                <span className="rounded-full bg-[#EFE8DF] px-3 py-1">
                                  Unitario: {formatearPrecio(detalleVenta.precio_unitario)}
                                </span>
                                {obtenerCategoriaDetalle(detalleVenta) && (
                                  <span className="rounded-full bg-[#D4AF37]/20 px-3 py-1 text-[#7F0303]">
                                    {obtenerCategoriaDetalle(detalleVenta)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="font-bold text-[#7F0303]">
                              {formatearPrecio(detalleVenta.subtotal)}
                            </p>
                          </div>

                          {obtenerDescripcionDetalle(detalleVenta) && (
                            <p className="rounded-xl bg-[#FFF9F0] p-3 text-sm leading-relaxed text-[#765E52]">
                              {obtenerDescripcionDetalle(detalleVenta)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t-2 border-[#7F0303] pt-4">
                <span className="text-lg font-bold text-[#2C1B1B]">Total de la factura</span>
                <span className="text-2xl font-bold text-[#7F0303]">{formatearPrecio(obtenerTotal(ventaDetalle))}</span>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#D8BA98] px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => setVentaDetalle(null)}
                className="flex w-full items-center justify-center rounded-xl border border-[#D8BA98] px-5 py-3 text-sm font-bold text-[#7F0303] transition hover:bg-[#EFE8DF] sm:w-44"
              >
                Cerrar detalle
              </button>
              <button
                type="button"
                onClick={() => descargarPDF(ventaDetalle)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5F0202] sm:w-44"
              >
                <Download size={16} />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </ContenedorGestion>
  );
}