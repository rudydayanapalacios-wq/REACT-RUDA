import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================================
// CARGAR IMAGEN
// ============================================================

const cargarImagen = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(
      new Error(`No se pudo cargar la imagen: ${src}`)
    );

    img.src = src;
  });
};

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
    (typeof cliente === "object" ? cliente?.email : "") ||
    ""
  );
};

const obtenerDocumentoCliente = (venta) => {
  const cliente = venta?.cliente;

  if (!cliente || typeof cliente !== "object") {
    return "";
  }

  if (
    cliente.tipo_documento &&
    cliente.numero_documento
  ) {
    return `${cliente.tipo_documento}: ${cliente.numero_documento}`;
  }

  return cliente.numero_documento || "";
};

const obtenerTelefonoCliente = (venta) => {
  const cliente = venta?.cliente;

  if (!cliente || typeof cliente !== "object") {
    return "";
  }

  return cliente.telefono || "";
};

const obtenerDireccionCliente = (venta) => {
  const cliente = venta?.cliente;

  if (!cliente || typeof cliente !== "object") {
    return "";
  }

  return cliente.direccion || "";
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
  return `$${Number(valor || 0).toLocaleString("es-CO")}`;
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

export async function generarFacturaPDF(venta) {
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

    const documentoCliente =
      obtenerDocumentoCliente(venta);

    const telefonoCliente =
      obtenerTelefonoCliente(venta);

    const direccionCliente =
      obtenerDireccionCliente(venta);

    // ========================================================
    // CARGAR LOGO
    // ========================================================

    let logo = null;

    try {
      logo = await cargarImagen("/img/logo.png");
    } catch (errorLogo) {
      console.warn(
        "No se pudo cargar el logo de MUGI:",
        errorLogo
      );
    }

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
    // COLORES MUGI
    // ========================================================

    const VINO = [127, 3, 3];
    const VINO_OSCURO = [74, 5, 5];
    const DORADO = [212, 175, 55];
    const CREMA = [248, 243, 234];
    const BEIGE = [239, 232, 223];
    const TEXTO = [61, 23, 23];
    const GRIS = [118, 94, 82];

    // ========================================================
    // ENCABEZADO
    // ========================================================

    doc.setFillColor(...VINO_OSCURO);

    doc.rect(
      0,
      0,
      anchoPagina,
      48,
      "F"
    );

    // Línea dorada inferior

    doc.setFillColor(...DORADO);

    doc.rect(
      0,
      46,
      anchoPagina,
      2,
      "F"
    );

    // ========================================================
    // LOGO
    // ========================================================

    if (logo) {
      doc.addImage(
        logo,
        "PNG",
        18,
        8,
        27,
        27
      );
    }

    // ========================================================
    // NOMBRE DE LA TIENDA
    // ========================================================

    doc.setTextColor(255, 255, 255);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(22);

    doc.text(
      "MUGI STORE",
      52,
      20
    );

    doc.setTextColor(...DORADO);

    doc.setFontSize(9);

    doc.text(
      "JOYERÍA Y ACCESORIOS",
      52,
      28
    );

    doc.setTextColor(255, 255, 255);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      "Comprobante oficial de compra",
      52,
      35
    );

    // ========================================================
    // FACTURA
    // ========================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.text(
      "FACTURA",
      anchoPagina - 20,
      15,
      {
        align: "right",
      }
    );

    doc.setTextColor(...DORADO);

    doc.setFontSize(13);

    doc.text(
      String(numeroFactura),
      anchoPagina - 20,
      24,
      {
        align: "right",
      }
    );

    doc.setTextColor(255, 255, 255);

    doc.setFontSize(8);

    doc.text(
      "ESTADO: REGISTRADA",
      anchoPagina - 20,
      33,
      {
        align: "right",
      }
    );

    // ========================================================
    // INFORMACIÓN DEL CLIENTE
    // ========================================================

    let posicionCliente = 62;

    doc.setTextColor(...TEXTO);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      "INFORMACIÓN DEL CLIENTE",
      20,
      posicionCliente
    );

    // Línea decorativa

    doc.setDrawColor(...DORADO);

    doc.setLineWidth(0.6);

    doc.line(
      20,
      posicionCliente + 3,
      75,
      posicionCliente + 3
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    let yCliente =
      posicionCliente + 13;

    doc.text(
      `Cliente: ${String(nombreCliente)}`,
      20,
      yCliente
    );

    if (documentoCliente) {
      yCliente += 6;

      doc.text(
        `Documento: ${documentoCliente}`,
        20,
        yCliente
      );
    }

    if (emailCliente) {
      yCliente += 6;

      doc.text(
        `Correo: ${String(emailCliente)}`,
        20,
        yCliente
      );
    }

    if (telefonoCliente) {
      yCliente += 6;

      doc.text(
        `Teléfono: ${telefonoCliente}`,
        20,
        yCliente
      );
    }

    if (direccionCliente) {
      yCliente += 6;

      doc.text(
        `Dirección: ${direccionCliente}`,
        20,
        yCliente
      );
    }

    // ========================================================
    // INFORMACIÓN DE LA VENTA
    // ========================================================

    const xVenta =
      anchoPagina - 75;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.text(
      "DATOS DE LA COMPRA",
      xVenta,
      posicionCliente
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      `Fecha: ${formatearFecha(fecha)}`,
      xVenta,
      posicionCliente + 13
    );

    const hora =
      formatearHora(fecha);

    if (hora) {
      doc.text(
        `Hora: ${hora}`,
        xVenta,
        posicionCliente + 20
      );
    }

    doc.text(
      "Método: Compra registrada",
      xVenta,
      posicionCliente + 27
    );

    // ========================================================
    // TABLA DE PRODUCTOS
    // ========================================================

    const filas = detalles.map(
      (detalle, index) => {
        const nombreProducto =
          obtenerNombreProducto(
            detalle,
            index
          );

        const cantidad =
          obtenerCantidad(detalle);

        const precio =
          obtenerPrecio(detalle);

        const subtotal =
          obtenerSubtotal(detalle);

        return [
          String(nombreProducto),
          String(cantidad),
          formatearPrecio(precio),
          formatearPrecio(subtotal),
        ];
      }
    );

    const inicioTabla =
      Math.max(yCliente + 15, 105);

    autoTable(doc, {
      startY: inicioTabla,

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

      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 4,
        lineColor: [220, 210, 200],
        lineWidth: 0.3,
      },

      headStyles: {
        fillColor: VINO,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },

      bodyStyles: {
        textColor: TEXTO,
        valign: "middle",
      },

      alternateRowStyles: {
        fillColor: CREMA,
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
          cellWidth: 38,
        },

        3: {
          halign: "right",
          cellWidth: 38,
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
      doc.lastAutoTable?.finalY || 120;

    let posicionFinal =
      posicionTabla + 15;

    // ========================================================
    // NUEVA PÁGINA SI ES NECESARIO
    // ========================================================

    if (
      posicionFinal >
      altoPagina - 65
    ) {
      doc.addPage();

      posicionFinal = 30;
    }

    // ========================================================
    // RESUMEN DE PAGO
    // ========================================================

    const subtotalVenta = detalles.reduce(
      (acumulado, detalle) =>
        acumulado +
        obtenerSubtotal(detalle),
      0
    );

    const descuento =
      Number(venta?.descuento || 0);

    const impuesto =
      Number(venta?.impuesto || 0);

    // ========================================================
    // ESTADO
    // ========================================================

    doc.setTextColor(...TEXTO);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "ESTADO DE LA COMPRA",
      20,
      posicionFinal + 8
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setTextColor(80, 110, 70);

    doc.setFontSize(9);

    doc.text(
      "Compra registrada correctamente",
      20,
      posicionFinal + 16
    );

    // ========================================================
    // CAJA DE TOTALES
    // ========================================================

    const cajaX =
      anchoPagina - 85;

    const cajaY =
      posicionFinal;

    doc.setFillColor(...BEIGE);

    doc.roundedRect(
      cajaX,
      cajaY,
      65,
      43,
      3,
      3,
      "F"
    );

    doc.setTextColor(...GRIS);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      "Subtotal",
      cajaX + 8,
      cajaY + 9
    );

    doc.text(
      formatearPrecio(subtotalVenta),
      cajaX + 57,
      cajaY + 9,
      {
        align: "right",
      }
    );

    doc.text(
      "Descuento",
      cajaX + 8,
      cajaY + 17
    );

    doc.text(
      formatearPrecio(descuento),
      cajaX + 57,
      cajaY + 17,
      {
        align: "right",
      }
    );

    doc.text(
      "Impuestos",
      cajaX + 8,
      cajaY + 25
    );

    doc.text(
      formatearPrecio(impuesto),
      cajaX + 57,
      cajaY + 25,
      {
        align: "right",
      }
    );

    doc.setDrawColor(
      200,
      190,
      180
    );

    doc.line(
      cajaX + 8,
      cajaY + 29,
      cajaX + 57,
      cajaY + 29
    );

    doc.setTextColor(...VINO);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(12);

    doc.text(
      "TOTAL",
      cajaX + 8,
      cajaY + 38
    );

    doc.text(
      formatearPrecio(total),
      cajaX + 57,
      cajaY + 38,
      {
        align: "right",
      }
    );

    // ========================================================
    // PIE DE PÁGINA
    // ========================================================

    doc.setDrawColor(...DORADO);

    doc.setLineWidth(0.5);

    doc.line(
      20,
      altoPagina - 31,
      anchoPagina - 20,
      altoPagina - 31
    );

    doc.setTextColor(...GRIS);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.text(
      "MUGI STORE",
      anchoPagina / 2,
      altoPagina - 22,
      {
        align: "center",
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      "Gracias por comprar con nosotros.",
      anchoPagina / 2,
      altoPagina - 16,
      {
        align: "center",
      }
    );

    doc.setFontSize(7);

    doc.text(
      "Comprobante generado por el sistema MUGI STORE",
      anchoPagina / 2,
      altoPagina - 10,
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

    doc.save(nombreArchivo);

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