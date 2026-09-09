import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================================
// NORMALIZADORES DE DATOS
// ============================================================

const obtenerNumeroFactura = (venta) => {
  return (
    venta?.numero_factura ||
    venta?.numeroFactura ||
    `VENTA-${venta?.id || venta?._id || venta?.venta_id || ""}`
  );
};

const obtenerFechaVenta = (venta) => {
  return (
    venta?.fecha ||
    venta?.fecha_venta ||
    venta?.created_at ||
    venta?.createdAt ||
    null
  );
};

const obtenerDetallesVenta = (venta) => {
  if (Array.isArray(venta?.detalles)) {
    return venta.detalles;
  }

  if (Array.isArray(venta?.detalle)) {
    return venta.detalle;
  }

  if (Array.isArray(venta?.items)) {
    return venta.items;
  }

  if (Array.isArray(venta?.productos)) {
    return venta.productos;
  }

  return [];
};

const obtenerTotalVenta = (venta) => {
  return Number(
    venta?.total ??
      venta?.total_venta ??
      venta?.monto_total ??
      venta?.total_factura ??
      0
  );
};

const obtenerClienteVenta = (venta) => {
  const cliente =
    venta?.cliente ||
    venta?.nombre_cliente ||
    venta?.cliente_nombre ||
    venta?.usuario ||
    null;

  if (typeof cliente === "string") {
    return cliente;
  }

  if (cliente && typeof cliente === "object") {
    return (
      cliente.nombre ||
      cliente.nombre_completo ||
      cliente.name ||
      cliente.email ||
      "Cliente MUGI"
    );
  }

  return "Cliente MUGI";
};

const obtenerEmailCliente = (venta) => {
  const cliente =
    venta?.cliente ||
    venta?.usuario ||
    null;

  return (
    venta?.email ||
    venta?.cliente_email ||
    (typeof cliente === "object"
      ? cliente?.email
      : "") ||
    ""
  );
};

const obtenerNombreProducto = (detalle, index) => {
  const producto = detalle?.producto;

  if (
    producto &&
    typeof producto === "object"
  ) {
    return (
      producto.nombre ||
      producto.nombre_producto ||
      producto.descripcion ||
      `Producto ${index + 1}`
    );
  }

  return (
    producto ||
    detalle?.nombre ||
    detalle?.nombre_producto ||
    detalle?.producto_nombre ||
    detalle?.descripcion ||
    `Producto ${index + 1}`
  );
};

const obtenerCantidad = (detalle) => {
  return Number(
    detalle?.cantidad ??
      detalle?.cantidad_producto ??
      detalle?.qty ??
      0
  );
};

const obtenerPrecio = (detalle) => {
  return Number(
    detalle?.precio ??
      detalle?.precio_unitario ??
      detalle?.precio_producto ??
      detalle?.price ??
      detalle?.valor_unitario ??
      0
  );
};

const obtenerSubtotal = (detalle) => {
  const subtotal =
    detalle?.subtotal ??
    detalle?.total ??
    detalle?.total_detalle;

  if (
    subtotal !== undefined &&
    subtotal !== null
  ) {
    return Number(subtotal) || 0;
  }

  return (
    obtenerPrecio(detalle) *
    obtenerCantidad(detalle)
  );
};

// ============================================================
// FORMATO
// ============================================================

const formatearPrecio = (valor) => {
  return `$${Number(valor || 0).toLocaleString(
    "es-CO"
  )}`;
};

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

// ============================================================
// GENERAR PDF
// ============================================================

export function generarFacturaPDF(venta) {
  console.log(
    "GENERANDO PDF DE LA VENTA:",
    venta
  );

  if (!venta) {
    console.error(
      "No se recibió la información de la venta."
    );

    alert(
      "No se encontró la información de la factura."
    );

    return;
  }

  try {
    const numeroFactura =
      obtenerNumeroFactura(venta);

    const fecha =
      obtenerFechaVenta(venta);

    const detalles =
      obtenerDetallesVenta(venta);

    const total =
      obtenerTotalVenta(venta);

    const nombreCliente =
      obtenerClienteVenta(venta);

    const emailCliente =
      obtenerEmailCliente(venta);

    // ========================================================
    // CREAR DOCUMENTO
    // ========================================================

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const anchoPagina =
      doc.internal.pageSize.getWidth();

    const altoPagina =
      doc.internal.pageSize.getHeight();

    // ========================================================
    // ENCABEZADO
    // ========================================================

    doc.setFillColor(
      127,
      3,
      3
    );

    doc.rect(
      0,
      0,
      anchoPagina,
      42,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(23);

    doc.text(
      "MUGI STORE",
      20,
      18
    );

    doc.setFontSize(9);

    doc.setTextColor(
      212,
      175,
      55
    );

    doc.text(
      "COMPROBANTE DE VENTA",
      20,
      26
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFontSize(9);

    doc.text(
      "FACTURA",
      anchoPagina - 20,
      14,
      {
        align: "right",
      }
    );

    doc.setFontSize(14);

    doc.text(
      String(numeroFactura),
      anchoPagina - 20,
      23,
      {
        align: "right",
      }
    );

    // ========================================================
    // INFORMACIÓN DEL CLIENTE
    // ========================================================

    doc.setTextColor(
      61,
      23,
      23
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      "INFORMACIÓN DEL CLIENTE",
      20,
      57
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.text(
      `Cliente: ${String(nombreCliente)}`,
      20,
      66
    );

    if (emailCliente) {
      doc.text(
        `Correo: ${String(emailCliente)}`,
        20,
        73
      );
    }

    doc.text(
      `Fecha: ${formatearFecha(fecha)}`,
      anchoPagina - 20,
      66,
      {
        align: "right",
      }
    );

    const hora =
      formatearHora(fecha);

    if (hora) {
      doc.text(
        `Hora: ${hora}`,
        anchoPagina - 20,
        73,
        {
          align: "right",
        }
      );
    }

    // ========================================================
    // TABLA
    // ========================================================

    const filas = detalles.map(
      (detalle, index) => {
        const nombreProducto =
          obtenerNombreProducto(
            detalle,
            index
          );

        const cantidad =
          obtenerCantidad(
            detalle
          );

        const precio =
          obtenerPrecio(
            detalle
          );

        const subtotal =
          obtenerSubtotal(
            detalle
          );

        return [
          String(nombreProducto),
          String(cantidad),
          formatearPrecio(precio),
          formatearPrecio(subtotal),
        ];
      }
    );

    autoTable(doc, {
      startY: 86,

      head: [
        [
          "Producto",
          "Cantidad",
          "Precio unitario",
          "Subtotal",
        ],
      ],

      body:
        filas.length > 0
          ? filas
          : [
              [
                "Sin productos",
                "-",
                "-",
                "-",
              ],
            ],

      theme: "grid",

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
      },

      bodyStyles: {
        textColor: [
          61,
          23,
          23,
        ],

        fontSize: 9,
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
          cellWidth: "auto",
        },

        1: {
          halign: "center",
          cellWidth: 25,
        },

        2: {
          halign: "right",
          cellWidth: 35,
        },

        3: {
          halign: "right",
          cellWidth: 35,
        },
      },

      margin: {
        left: 20,
        right: 20,
      },
    });

    // ========================================================
    // POSICIÓN DESPUÉS DE LA TABLA
    // ========================================================

    const posicionTabla =
      doc.lastAutoTable?.finalY ||
      100;

    let posicionFinal =
      posicionTabla + 15;

    // ========================================================
    // SI NO HAY ESPACIO, NUEVA PÁGINA
    // ========================================================

    if (
      posicionFinal >
      altoPagina - 55
    ) {
      doc.addPage();

      posicionFinal = 30;
    }

    // ========================================================
    // TOTAL
    // ========================================================

    doc.setFillColor(
      239,
      232,
      223
    );

    doc.roundedRect(
      anchoPagina - 85,
      posicionFinal,
      65,
      28,
      3,
      3,
      "F"
    );

    doc.setTextColor(
      118,
      94,
      82
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      "TOTAL",
      anchoPagina - 75,
      posicionFinal + 9
    );

    doc.setTextColor(
      127,
      3,
      3
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(17);

    doc.text(
      formatearPrecio(total),
      anchoPagina - 25,
      posicionFinal + 20,
      {
        align: "right",
      }
    );

    // ========================================================
    // ESTADO
    // ========================================================

    doc.setTextColor(
      61,
      23,
      23
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "Estado de la compra",
      20,
      posicionFinal + 10
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setTextColor(
      80,
      110,
      70
    );

    doc.text(
      "Compra registrada correctamente",
      20,
      posicionFinal + 18
    );

    // ========================================================
    // PIE DE PÁGINA
    // ========================================================

    doc.setDrawColor(
      216,
      186,
      152
    );

    doc.line(
      20,
      altoPagina - 30,
      anchoPagina - 20,
      altoPagina - 30
    );

    doc.setTextColor(
      118,
      94,
      82
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      "Gracias por comprar en MUGI STORE.",
      anchoPagina / 2,
      altoPagina - 21,
      {
        align: "center",
      }
    );

    doc.setFontSize(8);

    doc.text(
      "Comprobante generado por el sistema MUGI STORE",
      anchoPagina / 2,
      altoPagina - 14,
      {
        align: "center",
      }
    );

    // ========================================================
    // DESCARGAR
    // ========================================================

    const nombreArchivo =
      `Factura-${numeroFactura}.pdf`;

    console.log(
      "GUARDANDO PDF:",
      nombreArchivo
    );

    doc.save(
      nombreArchivo
    );

    console.log(
      "PDF GENERADO CORRECTAMENTE"
    );

  } catch (error) {
    console.error(
      "ERROR GENERANDO PDF:",
      error
    );

    alert(
      "No fue posible generar la factura PDF. Revisa la consola del navegador."
    );
  }
}
