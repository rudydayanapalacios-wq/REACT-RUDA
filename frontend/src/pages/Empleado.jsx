import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Package,
  ShoppingBag,
  Eye,
  BarChart3,
  TrendingUp,
  RefreshCw,
  X,
  ChevronRight,
  Boxes,
  Clock3,
  CircleCheck,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  Home,
  UserRound,
  Printer,
  Download,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useAuth } from "../context/AuthContext";
import EstructuraPanel from "../components/EstructuraPanel";
import { useNavigate } from "react-router-dom";

function Empleado() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroValorMin, setFiltroValorMin] = useState("");
  const [filtroValorMax, setFiltroValorMax] = useState("");

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [cargandoVentas, setCargandoVentas] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [periodoGrafico, setPeriodoGrafico] = useState("dia");

  const [paginaPqr, setPaginaPqr] = useState(1);
  const elementosPorPaginaPqr = 5;

  // ============================================================
  // CONFIGURACIÓN
  // ============================================================

  const API = import.meta.env.VITE_API_URL;

  const PRODUCTOS_POR_PAGINA = 4;
  const VENTAS_POR_PAGINA = 6;

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  const [paginaProductos, setPaginaProductos] = useState(1);
  const [paginaVentas, setPaginaVentas] = useState(1);

  // ============================================================
  // CARGAR PRODUCTOS
  // ============================================================

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);

      const respuesta = await fetch(`${API}/productos`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail ||
            datos.message ||
            "Error al obtener productos"
        );
      }

      setProductos(
        Array.isArray(datos)
          ? datos
          : datos.productos || datos.data || []
      );
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProductos([]);
    } finally {
      setCargandoProductos(false);
    }
  };

  // ============================================================
  // CARGAR VENTAS
  // ============================================================

  const cargarVentas = async () => {
    try {
      setCargandoVentas(true);

      const respuesta = await fetch(`${API}/ventas/`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail ||
            datos.message ||
            "Error al obtener ventas"
        );
      }

      setVentas(
        Array.isArray(datos)
          ? datos
          : datos.ventas || datos.data || []
      );
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      setVentas([]);
    } finally {
      setCargandoVentas(false);
    }
  };

  // ============================================================
  // CARGAR INFORMACIÓN
  // ============================================================

  useEffect(() => {
    if (!token) return;

    cargarProductos();
    cargarVentas();
  }, [token]);

  // ============================================================
  // ACTUALIZAR TODO
  // ============================================================

  const actualizarTodo = async () => {
    setActualizando(true);

    await Promise.all([
      cargarProductos(),
      cargarVentas(),
    ]);

    setActualizando(false);
  };

  // ============================================================
  // DATOS DEL USUARIO
  // ============================================================

  const nombre =
    usuario?.nombres ||
    usuario?.nombre ||
    "Empleado";

  // ============================================================
  // FUNCIONES DE PRODUCTOS
  // ============================================================

  const obtenerStock = (producto) => {
    return Number(
      producto?.stock ??
        producto?.cantidad ??
        0
    );
  };

  const formatearPrecio = (precio) => {
    if (
      precio === undefined ||
      precio === null ||
      precio === ""
    ) {
      return "—";
    }

    return `$${Number(precio).toLocaleString("es-CO")}`;
  };

  const obtenerRutaImagen = (imagen) => {
    if (!imagen) return null;

    const ruta = String(imagen)
      .trim()
      .replace(/\\/g, "/");

    if (
      /^https?:\/\//i.test(ruta) ||
      ruta.startsWith("data:")
    ) {
      return ruta;
    }

    if (ruta.startsWith("/")) {
      return ruta;
    }

    return ruta.startsWith("img/")
      ? `/${ruta}`
      : `/img/${ruta}`;
  };

  const obtenerEstadoStock = (stock) => {
    if (stock <= 0) {
      return {
        texto: "Agotado",
        clase:
          "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
      };
    }

    if (stock <= 5) {
      return {
        texto: "Stock bajo",
        clase:
          "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
      };
    }

    return {
      texto: "Disponible",
      clase:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    };
  };



const indiceInicioPqr =
  (paginaPqr - 1) * elementosPorPaginaPqr;

const pqrPaginadas = pqr.slice(
  indiceInicioPqr,
  indiceInicioPqr + elementosPorPaginaPqr
);

const totalPaginasPqr = Math.ceil(
  pqr.length / elementosPorPaginaPqr
);



  // ============================================================
  // DATOS DE VENTAS
  // ============================================================

  const obtenerIdVenta = (venta, index = 0) => {
    return (
      venta?.id ??
      venta?._id ??
      venta?.venta_id ??
      index + 1
    );
  };

  const obtenerNumeroFactura = (venta) => {
    return (
      venta?.numero_factura ??
      venta?.numeroFactura ??
      `FAC-${obtenerIdVenta(venta)}`
    );
  };

  const obtenerTotalVenta = (venta) => {
    return Number(
      venta?.total ??
        venta?.total_venta ??
        venta?.monto_total ??
        0
    );
  };

  const obtenerClienteVenta = (venta) => {
    const cliente =
      venta?.cliente ??
      venta?.usuario ??
      venta?.nombre_cliente ??
      venta?.cliente_nombre ??
      venta?.email;

    if (
      typeof cliente === "object" &&
      cliente !== null
    ) {
      return (
        cliente?.nombre ||
        cliente?.nombres ||
        cliente?.email ||
        "Cliente"
      );
    }

    return cliente || "Cliente";
  };

  const obtenerFechaVenta = (venta) => {
    const fecha =
      venta?.fecha ??
      venta?.fecha_venta ??
      venta?.created_at ??
      venta?.createdAt;

    if (!fecha) {
      return "Fecha no disponible";
    }

    try {
      return new Date(fecha).toLocaleString("es-CO");
    } catch {
      return String(fecha);
    }
  };

  const obtenerDetallesVenta = (venta) => {
    return (
      venta?.detalles ??
      venta?.detalle ??
      venta?.items ??
      venta?.productos ??
      []
    );
  };

  // ============================================================
  // OBTENER NOMBRE DE PRODUCTO DE UNA VENTA
  // ============================================================

  const obtenerNombreProductoVenta = (detalle) => {
    const producto = detalle?.producto;

    if (typeof producto === "string") {
      return producto;
    }

    return (
      producto?.nombre ??
      detalle?.producto_nombre ??
      detalle?.nombre ??
      "Producto"
    );
  };


  

  // ============================================================
  // VENTAS FILTRADAS
  // ============================================================

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      const cliente = String(
        obtenerClienteVenta(venta)
      ).toLowerCase();

      const coincideCliente =
        !filtroCliente ||
        cliente.includes(
          filtroCliente.toLowerCase().trim()
        );

      let fechaVenta = "";

      if (venta?.fecha) {
        const fecha = new Date(venta.fecha);

        if (!Number.isNaN(fecha.getTime())) {
          fechaVenta =
            `${fecha.getFullYear()}-` +
            `${String(
              fecha.getMonth() + 1
            ).padStart(2, "0")}-` +
            `${String(
              fecha.getDate()
            ).padStart(2, "0")}`;
        }
      }

      const coincideFecha =
        !filtroFecha ||
        fechaVenta === filtroFecha;

      const detalles = obtenerDetallesVenta(venta);

      const coincideProducto =
        !filtroProducto ||
        detalles.some((detalle) => {
          const nombreProducto =
            obtenerNombreProductoVenta(detalle);

          return String(nombreProducto)
            .toLowerCase()
            .includes(
              filtroProducto.toLowerCase().trim()
            );
        });

      const estado = String(
        venta?.estado ?? ""
      ).toLowerCase();

      const coincideEstado =
        !filtroEstado ||
        estado === filtroEstado.toLowerCase();

      const total = obtenerTotalVenta(venta);

      const coincideValorMin =
        filtroValorMin === "" ||
        total >= Number(filtroValorMin);

      const coincideValorMax =
        filtroValorMax === "" ||
        total <= Number(filtroValorMax);

      return (
        coincideCliente &&
        coincideFecha &&
        coincideProducto &&
        coincideEstado &&
        coincideValorMin &&
        coincideValorMax
      );
    });
  }, [
    ventas,
    filtroCliente,
    filtroFecha,
    filtroProducto,
    filtroEstado,
    filtroValorMin,
    filtroValorMax,
  ]);

  // ============================================================
  // PRODUCTOS FILTRADOS
  // ============================================================

  const productosFiltrados = useMemo(() => {
    const texto = busqueda
      .toLowerCase()
      .trim();

    if (!texto) {
      return productos;
    }

    return productos.filter((producto) => {
      return (
        String(producto.nombre || "")
          .toLowerCase()
          .includes(texto) ||
        String(producto.categoria || "")
          .toLowerCase()
          .includes(texto) ||
        String(producto.descripcion || "")
          .toLowerCase()
          .includes(texto)
      );
    });
  }, [productos, busqueda]);

  // ============================================================
  // PAGINACIÓN DE PRODUCTOS
  // ============================================================

  const totalPaginasProductos = Math.max(
    1,
    Math.ceil(
      productosFiltrados.length /
        PRODUCTOS_POR_PAGINA
    )
  );

  const indiceInicioProductos =
    (paginaProductos - 1) *
    PRODUCTOS_POR_PAGINA;

  const indiceFinProductos =
    indiceInicioProductos +
    PRODUCTOS_POR_PAGINA;

  const productosPaginados =
    productosFiltrados.slice(
      indiceInicioProductos,
      indiceFinProductos
    );

  // ============================================================
  // PAGINACIÓN DE VENTAS
  // ============================================================

  const totalPaginasVentas = Math.max(
    1,
    Math.ceil(
      ventasFiltradas.length /
        VENTAS_POR_PAGINA
    )
  );

  const indiceInicioVentas =
    (paginaVentas - 1) *
    VENTAS_POR_PAGINA;

  const indiceFinVentas =
    indiceInicioVentas +
    VENTAS_POR_PAGINA;

  const ventasPaginadas =
    ventasFiltradas.slice(
      indiceInicioVentas,
      indiceFinVentas
    );

  // ============================================================
  // REINICIAR PAGINACIÓN
  // ============================================================

  useEffect(() => {
    setPaginaVentas(1);
  }, [
    filtroCliente,
    filtroFecha,
    filtroProducto,
    filtroEstado,
    filtroValorMin,
    filtroValorMax,
  ]);

  useEffect(() => {
    setPaginaProductos(1);
  }, [busqueda]);

  // ============================================================
  // EVITAR PÁGINAS INEXISTENTES
  // ============================================================

  useEffect(() => {
    if (
      paginaVentas > totalPaginasVentas
    ) {
      setPaginaVentas(
        totalPaginasVentas
      );
    }
  }, [
    paginaVentas,
    totalPaginasVentas,
  ]);

  useEffect(() => {
    if (
      paginaProductos >
      totalPaginasProductos
    ) {
      setPaginaProductos(
        totalPaginasProductos
      );
    }
  }, [
    paginaProductos,
    totalPaginasProductos,
  ]);

  // ============================================================
  // LIMPIAR FILTROS
  // ============================================================

  const limpiarFiltros = () => {
    setFiltroCliente("");
    setFiltroFecha("");
    setFiltroProducto("");
    setFiltroEstado("");
    setFiltroValorMin("");
    setFiltroValorMax("");
    setPaginaVentas(1);
  };

  const hayFiltros =
    filtroCliente ||
    filtroFecha ||
    filtroProducto ||
    filtroEstado ||
    filtroValorMin ||
    filtroValorMax;

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  const Paginacion = ({
    paginaActual,
    totalPaginas,
    onCambiarPagina,
  }) => {
    if (totalPaginas <= 1) {
      return null;
    }

    let inicio = Math.max(
      1,
      paginaActual - 2
    );

    let fin = Math.min(
      totalPaginas,
      inicio + 4
    );

    if (fin - inicio < 4) {
      inicio = Math.max(
        1,
        fin - 4
      );
    }

    const paginas = [];

    for (
      let pagina = inicio;
      pagina <= fin;
      pagina++
    ) {
      paginas.push(pagina);
    }

    return (
      <div className="mt-6 border-t border-[#D8BA98]/50 pt-5 dark:border-[#D4AF37]/10">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-center text-xs text-[#927E70] sm:text-left">
            Página{" "}
            <strong className="text-[#7F0303] dark:text-[#D4AF37]">
              {paginaActual}
            </strong>{" "}
            de{" "}
            <strong className="text-[#7F0303] dark:text-[#D4AF37]">
              {totalPaginas}
            </strong>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">

            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() =>
                onCambiarPagina(
                  paginaActual - 1
                )
              }
              className="rounded-xl border border-[#D8BA98] px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#D4AF37]/20 dark:text-[#D4AF37]"
            >
              ←
              <span className="hidden sm:inline">
                {" "}Anterior
              </span>
            </button>

            {inicio > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onCambiarPagina(1)
                  }
                  className="min-w-9 rounded-xl border border-[#D8BA98] px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 dark:border-[#D4AF37]/20 dark:text-[#D4AF37]"
                >
                  1
                </button>

                {inicio > 2 && (
                  <span className="px-1 text-[#927E70]">
                    ...
                  </span>
                )}
              </>
            )}

            {paginas.map((pagina) => (
              <button
                key={pagina}
                type="button"
                onClick={() =>
                  onCambiarPagina(pagina)
                }
                className={`min-w-9 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  pagina === paginaActual
                    ? "bg-[#7F0303] text-white shadow-md dark:bg-[#D4AF37] dark:text-[#160B0C]"
                    : "border border-[#D8BA98] text-[#7F0303] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 dark:border-[#D4AF37]/20 dark:text-[#D4AF37]"
                }`}
              >
                {pagina}
              </button>
            ))}

            {fin < totalPaginas && (
              <>
                {fin <
                  totalPaginas - 1 && (
                  <span className="px-1 text-[#927E70]">
                    ...
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    onCambiarPagina(
                      totalPaginas
                    )
                  }
                  className="min-w-9 rounded-xl border border-[#D8BA98] px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 dark:border-[#D4AF37]/20 dark:text-[#D4AF37]"
                >
                  {totalPaginas}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={
                paginaActual ===
                totalPaginas
              }
              onClick={() =>
                onCambiarPagina(
                  paginaActual + 1
                )
              }
              className="rounded-xl border border-[#D8BA98] px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#D4AF37]/20 dark:text-[#D4AF37]"
            >
              <span className="hidden sm:inline">
                Siguiente{" "}
              </span>
              →
            </button>

          </div>

        </div>
      </div>
    );
  };

  // ============================================================
  // IMPRIMIR FACTURA
  // ============================================================

  const imprimirFactura = (venta) => {
    const numeroFactura =
      obtenerNumeroFactura(venta);

    const cliente =
      obtenerClienteVenta(venta);

    const fecha =
      obtenerFechaVenta(venta);

    const total =
      obtenerTotalVenta(venta);

    const detalles =
      obtenerDetallesVenta(venta);

    const subtotal = Number(
      venta?.subtotal ?? total
    );

    const descuento = Number(
      venta?.descuento ?? 0
    );

    const impuesto = Number(
      venta?.impuesto ?? 0
    );

    const filas =
      Array.isArray(detalles) &&
      detalles.length > 0
        ? detalles
            .map((detalle) => {
              const nombreProducto =
                obtenerNombreProductoVenta(
                  detalle
                );

              const cantidad = Number(
                detalle?.cantidad ??
                  detalle?.cantidad_producto ??
                  1
              );

              const precio = Number(
                detalle?.precio_unitario ??
                  detalle?.precio ??
                  detalle?.producto?.precio ??
                  0
              );

              const subtotalDetalle =
                detalle?.subtotal !==
                  undefined &&
                detalle?.subtotal !==
                  null
                  ? Number(
                      detalle.subtotal
                    )
                  : cantidad * precio;

              return `
                <tr>
                  <td>${nombreProducto}</td>
                  <td>${cantidad}</td>
                  <td>$${precio.toLocaleString("es-CO")}</td>
                  <td>$${subtotalDetalle.toLocaleString("es-CO")}</td>
                </tr>
              `;
            })
            .join("")
        : `
            <tr>
              <td colspan="4">
                No hay detalle disponible
              </td>
            </tr>
          `;

    const ventana = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!ventana) {
      alert(
        "El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para continuar."
      );
      return;
    }

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>
            Factura ${numeroFactura} - MUGI STORE
          </title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, sans-serif;
              color: #2d2522;
              background: white;
            }

            .factura {
              max-width: 850px;
              margin: 0 auto;
            }

            .cabecera {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #7F0303;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }

            .marca h1 {
              margin: 0;
              color: #7F0303;
              font-size: 30px;
            }

            .marca p {
              margin: 5px 0 0;
              color: #777;
            }

            .factura-info {
              text-align: right;
            }

            .factura-info h2 {
              margin: 0;
              color: #7F0303;
            }

            .info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 25px;
            }

            .info-box {
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 10px;
            }

            .info-box strong {
              display: block;
              margin-bottom: 6px;
              color: #7F0303;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th {
              background: #7F0303;
              color: white;
              padding: 12px;
              text-align: left;
            }

            td {
              border-bottom: 1px solid #ddd;
              padding: 12px;
            }

            .resumen {
              margin-top: 25px;
              display: flex;
              justify-content: flex-end;
            }

            .resumen-box {
              min-width: 280px;
              padding: 18px;
              border: 2px solid #D4AF37;
              border-radius: 10px;
            }

            .fila-total {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              color: #666;
            }

            .total-final {
              margin-top: 12px;
              padding-top: 12px;
              border-top: 1px solid #ddd;
            }

            .total-final span {
              font-size: 14px;
              color: #777;
            }

            .total-final strong {
              display: block;
              margin-top: 5px;
              font-size: 25px;
              color: #7F0303;
            }

            .pie {
              margin-top: 50px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #777;
              font-size: 12px;
            }

            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>

        <body>
          <div class="factura">

            <div class="cabecera">
              <div class="marca">
                <h1>MUGI STORE</h1>
                <p>Comprobante de venta</p>
              </div>

              <div class="factura-info">
                <h2>FACTURA</h2>
                <p>
                  <strong>
                    ${numeroFactura}
                  </strong>
                </p>
              </div>
            </div>

            <div class="info">

              <div class="info-box">
                <strong>Cliente</strong>
                ${cliente}
              </div>

              <div class="info-box">
                <strong>Fecha</strong>
                ${fecha}
              </div>

            </div>

            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                ${filas}
              </tbody>
            </table>

            <div class="resumen">
              <div class="resumen-box">

                <div class="fila-total">
                  <span>Subtotal</span>
                  <span>
                    $${subtotal.toLocaleString("es-CO")}
                  </span>
                </div>

                <div class="fila-total">
                  <span>Descuento</span>
                  <span>
                    $${descuento.toLocaleString("es-CO")}
                  </span>
                </div>

                <div class="fila-total">
                  <span>Impuesto</span>
                  <span>
                    $${impuesto.toLocaleString("es-CO")}
                  </span>
                </div>

                <div class="total-final">
                  <span>Total de la venta</span>

                  <strong>
                    $${total.toLocaleString("es-CO")}
                  </strong>
                </div>

              </div>
            </div>

            <div class="pie">
              Gracias por comprar en MUGI STORE.
            </div>

          </div>
        </body>
      </html>
    `);

    ventana.document.close();
    ventana.focus();

    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 300);
  };

  // ============================================================
  // DESCARGAR FACTURA EN PDF
  // ============================================================

  const descargarFacturaPDF = (venta) => {
    try {
      const doc = new jsPDF();

      const numeroFactura =
        obtenerNumeroFactura(venta);

      const cliente =
        obtenerClienteVenta(venta);

      const fecha =
        obtenerFechaVenta(venta);

      const total =
        obtenerTotalVenta(venta);

      const subtotal = Number(
        venta?.subtotal ?? total
      );

      const descuento = Number(
        venta?.descuento ?? 0
      );

      const impuesto = Number(
        venta?.impuesto ?? 0
      );

      const estado =
        venta?.estado ?? "Sin estado";

      const detalles =
        obtenerDetallesVenta(venta);

      // --------------------------------------------------------
      // ENCABEZADO
      // --------------------------------------------------------

      doc.setTextColor(127, 3, 3);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(
        "MUGI STORE",
        20,
        25
      );

      doc.setFontSize(11);
      doc.setTextColor(90, 70, 60);
      doc.setFont("helvetica", "normal");

      doc.text(
        "Comprobante de venta",
        20,
        32
      );

      doc.setTextColor(127, 3, 3);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);

      doc.text(
        "FACTURA",
        145,
        24
      );

      doc.setFontSize(10);
      doc.setTextColor(60, 50, 45);

      doc.text(
        String(numeroFactura),
        145,
        31
      );

      doc.setDrawColor(127, 3, 3);
      doc.setLineWidth(1);

      doc.line(
        20,
        39,
        190,
        39
      );

      // --------------------------------------------------------
      // INFORMACIÓN
      // --------------------------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(127, 3, 3);

      doc.text(
        "Cliente:",
        20,
        52
      );

      doc.text(
        "Fecha:",
        20,
        62
      );

      doc.text(
        "Estado:",
        110,
        52
      );

      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 50, 45);

      doc.text(
        String(cliente),
        45,
        52
      );

      doc.text(
        String(fecha),
        45,
        62
      );

      doc.text(
        String(estado),
        135,
        52
      );

      // --------------------------------------------------------
      // PRODUCTOS
      // --------------------------------------------------------

      const filas =
        detalles.length > 0
          ? detalles.map((detalle) => {
              const nombreProducto =
                obtenerNombreProductoVenta(
                  detalle
                );

              const cantidad = Number(
                detalle?.cantidad ??
                  detalle?.cantidad_producto ??
                  1
              );

              const precio = Number(
                detalle?.precio_unitario ??
                  detalle?.precio ??
                  detalle?.producto?.precio ??
                  0
              );

              const subtotalDetalle =
                detalle?.subtotal !==
                  undefined &&
                detalle?.subtotal !==
                  null
                  ? Number(
                      detalle.subtotal
                    )
                  : cantidad * precio;

              return [
                String(nombreProducto),
                String(cantidad),
                `$${precio.toLocaleString(
                  "es-CO"
                )}`,
                `$${subtotalDetalle.toLocaleString(
                  "es-CO"
                )}`,
              ];
            })
          : [
              [
                "No hay detalle disponible",
                "-",
                "-",
                "-",
              ],
            ];

      autoTable(doc, {
        startY: 72,

        head: [
          [
            "Producto",
            "Cantidad",
            "Precio unitario",
            "Subtotal",
          ],
        ],

        body: filas,

        theme: "grid",

        headStyles: {
          fillColor: [127, 3, 3],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },

        bodyStyles: {
          textColor: [60, 50, 45],
        },

        alternateRowStyles: {
          fillColor: [248, 243, 234],
        },

        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
      });

      // --------------------------------------------------------
      // TOTALES
      // --------------------------------------------------------

      const posicionFinal =
        doc.lastAutoTable.finalY + 15;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);
      doc.setTextColor(90, 70, 60);

      doc.text(
        `Subtotal: $${subtotal.toLocaleString(
          "es-CO"
        )}`,
        125,
        posicionFinal
      );

      doc.text(
        `Descuento: $${descuento.toLocaleString(
          "es-CO"
        )}`,
        125,
        posicionFinal + 8
      );

      doc.text(
        `Impuesto: $${impuesto.toLocaleString(
          "es-CO"
        )}`,
        125,
        posicionFinal + 16
      );

      doc.setDrawColor(
        212,
        175,
        55
      );

      doc.setLineWidth(0.8);

      doc.line(
        120,
        posicionFinal + 21,
        190,
        posicionFinal + 21
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(14);
      doc.setTextColor(
        127,
        3,
        3
      );

      doc.text(
        `TOTAL: $${total.toLocaleString(
          "es-CO"
        )}`,
        120,
        posicionFinal + 31
      );

      // --------------------------------------------------------
      // PIE
      // --------------------------------------------------------

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(9);
      doc.setTextColor(
        120,
        110,
        105
      );

      doc.text(
        "Gracias por comprar en MUGI STORE.",
        105,
        posicionFinal + 50,
        {
          align: "center",
        }
      );

      doc.text(
        "Comprobante generado desde el sistema MUGI STORE.",
        105,
        posicionFinal + 57,
        {
          align: "center",
        }
      );

      // --------------------------------------------------------
      // DESCARGAR
      // --------------------------------------------------------

      doc.save(
        `${numeroFactura}.pdf`
      );
    } catch (error) {
      console.error(
        "Error al generar PDF:",
        error
      );

      alert(
        "No se pudo generar el PDF de la factura."
      );
    }
  };

  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const productosDisponibles =
    productos.filter(
      (producto) =>
        obtenerStock(producto) > 0
    ).length;

  const productosStockBajo =
    productos.filter((producto) => {
      const stock =
        obtenerStock(producto);

      return (
        stock > 0 &&
        stock <= 5
      );
    }).length;

  const productosAgotados =
    productos.filter(
      (producto) =>
        obtenerStock(producto) <= 0
    ).length;

    


      // ======================================================
  // DASHBOARD DE VENTAS - EST11
  // ======================================================

  const obtenerFechaRealVenta = (venta) => {
    const fecha =
      venta?.fecha ??
      venta?.fecha_venta ??
      venta?.created_at ??
      venta?.createdAt;

    if (!fecha) return null;

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return null;
    }

    return fechaConvertida;
  };

  const ventasDashboard = useMemo(() => {
    const ahora = new Date();

    if (periodoGrafico === "dia") {
      const datos = [];

      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(ahora);
        fecha.setHours(0, 0, 0, 0);
        fecha.setDate(fecha.getDate() - i);

        const siguiente = new Date(fecha);
        siguiente.setDate(siguiente.getDate() + 1);

        const ventasDelDia = ventas.filter((venta) => {
          const fechaVenta = obtenerFechaRealVenta(venta);

          return (
            fechaVenta &&
            fechaVenta >= fecha &&
            fechaVenta < siguiente
          );
        });

        datos.push({
          etiqueta: fecha.toLocaleDateString("es-CO", {
            weekday: "short",
            day: "numeric",
          }),
          ventas: ventasDelDia.length,
          ingresos: ventasDelDia.reduce(
            (total, venta) =>
              total + obtenerTotalVenta(venta),
            0
          ),
        });
      }

      return datos;
    }

    if (periodoGrafico === "semana") {
      const datos = [];

      for (let i = 6; i >= 0; i--) {
        const fin = new Date(ahora);
        fin.setHours(23, 59, 59, 999);
        fin.setDate(
          fin.getDate() - i * 7
        );

        const inicio = new Date(fin);
        inicio.setHours(0, 0, 0, 0);
        inicio.setDate(
          inicio.getDate() - 6
        );

        const ventasDeLaSemana = ventas.filter(
          (venta) => {
            const fechaVenta =
              obtenerFechaRealVenta(venta);

            return (
              fechaVenta &&
              fechaVenta >= inicio &&
              fechaVenta <= fin
            );
          }
        );

        datos.push({
          etiqueta: `Sem ${7 - i}`,
          ventas:
            ventasDeLaSemana.length,
          ingresos:
            ventasDeLaSemana.reduce(
              (total, venta) =>
                total +
                obtenerTotalVenta(venta),
              0
            ),
        });
      }

      return datos;
    }

    const datos = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora);
      fecha.setDate(1);
      fecha.setMonth(
        fecha.getMonth() - i
      );

      const mes = fecha.getMonth();
      const año = fecha.getFullYear();

      const ventasDelMes = ventas.filter(
        (venta) => {
          const fechaVenta =
            obtenerFechaRealVenta(venta);

          return (
            fechaVenta &&
            fechaVenta.getMonth() === mes &&
            fechaVenta.getFullYear() === año
          );
        }
      );

      datos.push({
        etiqueta: fecha.toLocaleDateString(
          "es-CO",
          {
            month: "short",
          }
        ),
        ventas: ventasDelMes.length,
        ingresos:
          ventasDelMes.reduce(
            (total, venta) =>
              total + obtenerTotalVenta(venta),
            0
          ),
      });
    }

    return datos;
  }, [ventas, periodoGrafico]);

  const totalVentasDashboard =
    ventasDashboard.reduce(
      (total, dato) =>
        total + dato.ventas,
      0
    );

  const ingresosDashboard =
    ventasDashboard.reduce(
      (total, dato) =>
        total + dato.ingresos,
      0
    );

  const ticketPromedio =
    totalVentasDashboard > 0
      ? ingresosDashboard /
        totalVentasDashboard
      : 0;

  const maxVentasGrafico = Math.max(
    ...ventasDashboard.map(
      (dato) => dato.ventas
    ),
    1
  );

  const maxIngresosGrafico = Math.max(
    ...ventasDashboard.map(
      (dato) => dato.ingresos
    ),
    1
  );

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <EstructuraPanel
      rol="empleado"
      titulo="Empleado"
    >
      <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#EFE8DF] text-[#3A2925] dark:bg-[#120909] dark:text-[#F8F3EA]">

        {/* ======================================================
            BOTÓN INICIO
        ====================================================== */}

        <div className="mx-auto flex max-w-7xl justify-end px-4 pt-4 sm:px-6 md:px-8">

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="flex items-center gap-2 rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2.5 text-sm font-semibold text-[#7F0303] shadow-sm transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 dark:bg-[#241415] dark:text-[#D4AF37]"
          >
            <Home size={17} />
            <span>
              Ir a inicio
            </span>
          </button>

        </div>

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden border-b border-[#D8BA98]/50 bg-[#F8F3EA] dark:border-[#D4AF37]/10 dark:bg-[#1B1010]">

          <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#7F0303]/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 md:px-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7F0303] text-white shadow-lg">
                  <Compass size={22} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                    MUGI STORE
                  </p>

                  <p className="text-xs text-[#927E70] dark:text-[#BFAFAC]">
                    Centro de operaciones
                  </p>

                </div>

              </div>

              <div className="grid w-full gap-2 sm:flex sm:w-auto">

                <button
                  type="button"
                  onClick={actualizarTodo}
                  disabled={actualizando}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#D8BA98] bg-white/60 px-5 py-3 text-sm font-bold text-[#7F0303] transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#D4AF37]/20 dark:bg-[#241415] dark:text-[#D4AF37] sm:w-auto"
                >
                  <RefreshCw
                    size={17}
                    className={
                      actualizando
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {actualizando
                    ? "Actualizando..."
                    : "Actualizar"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/perfil"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#D8BA98] bg-white/60 px-5 py-3 text-sm font-bold text-[#7F0303] transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white dark:border-[#D4AF37]/20 dark:bg-[#241415] dark:text-[#D4AF37] sm:w-auto"
                >
                  <UserRound size={17} />
                  Perfil
                </button>

              </div>

            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-xs font-semibold text-[#92701A] dark:text-[#D4AF37]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Sesión activa
                </div>

                <h1 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight text-[#7F0303] dark:text-[#F8F3EA] sm:text-4xl">
                  Centro de mando

                  <span className="block text-[#D4AF37]">
                    de la tripulación.
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#765E52] dark:text-[#C8B9B5]">
                  Bienvenido,{" "}
                  <strong className="text-[#7F0303] dark:text-[#D4AF37]">
                    {nombre}
                  </strong>
                  . Consulta el catálogo y revisa las ventas registradas en MUGI STORE.
                </p>

              </div>

              <div className="rounded-[28px] border border-[#D8BA98] bg-[#EFE8DF] p-4 shadow-sm dark:border-[#D4AF37]/15 dark:bg-[#241415]">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7F0303] text-xl font-bold text-white shadow-md">
                    {nombre
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs uppercase tracking-wider text-[#927E70]">
                      Tripulación
                    </p>

                    <p className="mt-1 truncate font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                      {nombre}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#D4AF37]">
                      Empleado
                    </p>

                  </div>

                </div>




              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            ESTADÍSTICAS
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-5 md:px-8">

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="group rounded-[26px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-[#D4AF37]/15 dark:bg-[#241415]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                    Catálogo
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                    {productos.length}
                  </p>

                  <p className="mt-1 text-xs text-[#927E70]">
                    productos registrados
                  </p>

                </div>

                <div className="rounded-2xl bg-[#7F0303]/10 p-3 dark:bg-[#D4AF37]/10">

                  <Boxes
                    size={23}
                    className="text-[#7F0303] dark:text-[#D4AF37]"
                  />

                </div>

              </div>

            </div>

            <div className="group rounded-[26px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-[#D4AF37]/15 dark:bg-[#241415]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                    Disponibles
                  </p>

                  <p className="mt-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {productosDisponibles}
                  </p>

                  <p className="mt-1 text-xs text-[#927E70]">
                    con existencia
                  </p>

                </div>

                <div className="rounded-2xl bg-emerald-500/10 p-3">

                  <Package
                    size={23}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                </div>

              </div>

            </div>

            <div className="group rounded-[26px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-[#D4AF37]/15 dark:bg-[#241415]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                    Atención
                  </p>

                  <p className="mt-3 text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {productosStockBajo}
                  </p>

                  <p className="mt-1 text-xs text-[#927E70]">
                    productos con stock bajo
                  </p>

                </div>

                <div className="rounded-2xl bg-amber-500/10 p-3">

                  <AlertTriangle
                    size={23}
                    className="text-amber-600 dark:text-amber-400"
                  />

                </div>

              </div>

            </div>

            <div className="group rounded-[26px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-[#D4AF37]/15 dark:bg-[#241415]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                    Ventas
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                    {ventas.length}
                  </p>

                  <p className="mt-1 text-xs text-[#927E70]">
                    ventas registradas
                  </p>

                </div>

                <div className="rounded-2xl bg-[#7F0303]/10 p-3 dark:bg-[#D4AF37]/10">

                  <ShoppingBag
                    size={23}
                    className="text-[#7F0303] dark:text-[#D4AF37]"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================================
            DASHBOARD DE VENTAS - EST11
        ====================================================== */}
        <section className="mt-8">
          <div className="overflow-hidden rounded-[30px] border border-[#D8BA98]/70 bg-white/45 p-5 shadow-sm backdrop-blur-sm dark:border-[#D4AF37]/10 dark:bg-[#160B0C]/40 sm:p-7">

            {/* ENCABEZADO */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
                    <BarChart3
                      size={21}
                      className="text-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                      Est11 · Dashboard
                    </p>

                    <h2 className="mt-1 font-serif text-2xl font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                      Análisis de ventas
                    </h2>
                  </div>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#927E70]">
                  Consulta el comportamiento de las ventas
                  y los ingresos registrados en MUGI STORE
                  según el período seleccionado.
                </p>
              </div>

              {/* SELECTOR DE PERÍODO */}
              <div className="flex rounded-2xl border border-[#D8BA98]/70 bg-[#EFE8DF] p-1 dark:border-[#D4AF37]/10 dark:bg-[#160B0C]">
                {[
                  {
                    valor: "dia",
                    texto: "Día",
                  },
                  {
                    valor: "semana",
                    texto: "Semana",
                  },
                  {
                    valor: "mes",
                    texto: "Mes",
                  },
                ].map((opcion) => (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() =>
                      setPeriodoGrafico(
                        opcion.valor
                      )
                    }
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                      periodoGrafico ===
                      opcion.valor
                        ? "bg-[#7F0303] text-white shadow-md dark:bg-[#D4AF37] dark:text-[#160B0C]"
                        : "text-[#7F0303] hover:bg-[#D4AF37]/10 dark:text-[#D4AF37]"
                    }`}
                  >
                    {opcion.texto}
                  </button>
                ))}
              </div>
            </div>

            {/* INDICADORES */}
            <div className="mt-7 grid gap-4 md:grid-cols-3">

              {/* TOTAL VENTAS */}
              <div className="rounded-2xl border border-[#D8BA98]/60 bg-white/60 p-5 dark:border-[#D4AF37]/10 dark:bg-[#160B0C]/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                    Ventas
                  </p>

                  <ShoppingBag
                    size={18}
                    className="text-[#D4AF37]"
                  />
                </div>

                <p className="mt-3 text-3xl font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                  {totalVentasDashboard}
                </p>

                <p className="mt-1 text-xs text-[#927E70]">
                  operaciones en el período
                </p>
              </div>

              {/* INGRESOS */}
              <div className="rounded-2xl border border-[#D8BA98]/60 bg-white/60 p-5 dark:border-[#D4AF37]/10 dark:bg-[#160B0C]/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                    Ingresos
                  </p>

                  <TrendingUp
                    size={18}
                    className="text-[#D4AF37]"
                  />
                </div>

                <p className="mt-3 text-2xl font-bold text-[#7F0303] dark:text-[#D4AF37]">
                  {formatearPrecio(
                    ingresosDashboard
                  )}
                </p>

                <p className="mt-1 text-xs text-[#927E70]">
                  ingresos acumulados
                </p>
              </div>

              {/* TICKET PROMEDIO */}
              <div className="rounded-2xl border border-[#D8BA98]/60 bg-white/60 p-5 dark:border-[#D4AF37]/10 dark:bg-[#160B0C]/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                    Ticket promedio
                  </p>

                  <BarChart3
                    size={18}
                    className="text-[#D4AF37]"
                  />
                </div>

                <p className="mt-3 text-2xl font-bold text-[#7F0303] dark:text-[#D4AF37]">
                  {formatearPrecio(
                    ticketPromedio
                  )}
                </p>

                <p className="mt-1 text-xs text-[#927E70]">
                  promedio por venta
                </p>
              </div>
            </div>

            {/* GRÁFICOS */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              {/* GRÁFICO DE BARRAS */}
              <div className="rounded-2xl border border-[#D8BA98]/60 bg-white/60 p-5 dark:border-[#D4AF37]/10 dark:bg-[#160B0C]/50">
                <div className="mb-6">
                  <h3 className="font-serif text-lg font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                    Cantidad de ventas
                  </h3>

                  <p className="mt-1 text-xs text-[#927E70]">
                    Número de operaciones por período
                  </p>
                </div>

                <div className="flex h-64 items-end gap-2 overflow-x-auto px-2">
                  {ventasDashboard.map(
                    (dato, index) => {
                      const altura =
                        dato.ventas > 0
                          ? Math.max(
                              12,
                              (dato.ventas /
                                maxVentasGrafico) *
                                100
                            )
                          : 4;

                      return (
                        <div
                          key={`${dato.etiqueta}-${index}`}
                          className="flex h-full min-w-[42px] flex-1 flex-col items-center justify-end gap-2"
                        >
                          <span className="text-[10px] font-bold text-[#7F0303] dark:text-[#D4AF37]">
                            {dato.ventas}
                          </span>

                          <div className="flex h-48 w-full items-end justify-center">
                            <div
                              className="w-full max-w-[34px] rounded-t-xl bg-[#7F0303] transition-all duration-500 dark:bg-[#D4AF37]"
                              style={{
                                height: `${altura}%`,
                              }}
                              title={`${dato.ventas} ventas`}
                            />
                          </div>

                          <span className="whitespace-nowrap text-[10px] text-[#927E70]">
                            {dato.etiqueta}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* GRÁFICO DE LÍNEA */}
              <div className="rounded-2xl border border-[#D8BA98]/60 bg-white/60 p-5 dark:border-[#D4AF37]/10 dark:bg-[#160B0C]/50">
                <div className="mb-6">
                  <h3 className="font-serif text-lg font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                    Evolución de ingresos
                  </h3>

                  <p className="mt-1 text-xs text-[#927E70]">
                    Comportamiento de los ingresos
                  </p>
                </div>

                <div className="relative h-64 overflow-hidden rounded-xl bg-[#EFE8DF]/60 p-3 dark:bg-[#120909]/50">

                  {/* LÍNEAS DE REFERENCIA */}
                  <div className="pointer-events-none absolute inset-x-3 top-8 border-t border-[#D8BA98]/30" />
                  <div className="pointer-events-none absolute inset-x-3 top-1/2 border-t border-[#D8BA98]/30" />
                  <div className="pointer-events-none absolute inset-x-3 bottom-8 border-t border-[#D8BA98]/30" />

                  <svg
                    viewBox="0 0 700 230"
                    preserveAspectRatio="none"
                    className="h-full w-full"
                  >
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#7F0303] dark:text-[#D4AF37]"
                      points={ventasDashboard
                        .map((dato, index) => {
                          const x =
                            ventasDashboard.length ===
                            1
                              ? 350
                              : (index /
                                  (ventasDashboard.length -
                                    1)) *
                                680 +
                                10;

                          const y =
                            210 -
                            (dato.ingresos /
                              maxIngresosGrafico) *
                              180;

                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />

                    {ventasDashboard.map(
                      (dato, index) => {
                        const x =
                          ventasDashboard.length ===
                          1
                            ? 350
                            : (index /
                                (ventasDashboard.length -
                                  1)) *
                              680 +
                              10;

                        const y =
                          210 -
                          (dato.ingresos /
                            maxIngresosGrafico) *
                            180;

                        return (
                          <circle
                            key={`${dato.etiqueta}-punto-${index}`}
                            cx={x}
                            cy={y}
                            r="5"
                            fill="currentColor"
                            className="text-[#D4AF37] dark:text-[#F8F3EA]"
                          />
                        );
                      }
                    )}
                  </svg>

                  {/* ETIQUETAS */}
                  <div className="absolute inset-x-3 bottom-1 flex justify-between gap-2">
                    {ventasDashboard.map(
                      (dato, index) => (
                        <span
                          key={`${dato.etiqueta}-label-${index}`}
                          className="truncate text-[9px] text-[#927E70]"
                        >
                          {dato.etiqueta}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* RESUMEN */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#7F0303]/5 px-4 py-3 dark:bg-[#D4AF37]/5">
                  <span className="text-xs text-[#927E70]">
                    Ingresos del período
                  </span>

                  <span className="text-sm font-bold text-[#7F0303] dark:text-[#D4AF37]">
                    {formatearPrecio(
                      ingresosDashboard
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            CONTENIDO
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 md:px-8">

          <div className="grid gap-6 xl:grid-cols-2 2xl:gap-8">

            {/* ==================================================
                CATÁLOGO
            ================================================== */}

            <div className="overflow-hidden rounded-[32px] border border-[#D8BA98] bg-[#F8F3EA] shadow-sm dark:border-[#D4AF37]/15 dark:bg-[#241415]">

              <div className="border-b border-[#D8BA98]/60 p-5 dark:border-[#D4AF37]/10 sm:p-6 md:p-7">

                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                  <div>

                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                      Inventario
                    </span>

                    <h2 className="mt-2 font-serif text-2xl font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                      Explorar productos
                    </h2>

                    <p className="mt-1 text-sm text-[#927E70] dark:text-[#BFAFAC]">
                      Consulta rápida del catálogo disponible.
                    </p>

                  </div>

                  <div className="w-fit rounded-full bg-[#EFE8DF] px-4 py-2 text-xs font-semibold text-[#765E52] dark:bg-[#160B0C] dark:text-[#C8B9B5]">

                    {productosFiltrados.length}{" "}
                    resultado
                    {productosFiltrados.length !==
                    1
                      ? "s"
                      : ""}

                  </div>

                </div>

                <div className="relative mt-6">

                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#927E70]"
                  />

                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) =>
                      setBusqueda(
                        e.target.value
                      )
                    }
                    placeholder="Buscar por nombre, categoría o descripción..."
                    className="w-full rounded-2xl border border-[#D8BA98] bg-white/70 py-3.5 pl-11 pr-4 text-xs text-[#3A2925] outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 dark:border-[#D4AF37]/15 dark:bg-[#160B0C]/50 dark:text-[#F8F3EA] dark:placeholder:text-[#927E70] sm:text-sm"
                  />

                </div>

              </div>

              <div className="p-4 sm:p-5 md:p-7">

                {cargandoProductos ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                    <RefreshCw
                      size={32}
                      className="animate-spin text-[#D4AF37]"
                    />

                    <p className="mt-4 text-sm text-[#927E70]">
                      Navegando por el catálogo...
                    </p>

                  </div>
                ) : productosFiltrados.length ===
                  0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#7F0303]/10 dark:bg-[#D4AF37]/10">

                      <Package
                        size={30}
                        className="text-[#7F0303] dark:text-[#D4AF37]"
                      />

                    </div>

                    <h3 className="mt-5 font-serif text-xl font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                      No encontramos nada
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-[#927E70]">
                      Intenta buscar con otro nombre, categoría o descripción.
                    </p>

                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">

                      {productosPaginados.map(
                        (
                          producto,
                          index
                        ) => {

                          const stock =
                            obtenerStock(
                              producto
                            );

                          const estado =
                            obtenerEstadoStock(
                              stock
                            );

                          return (
                            <article
                              key={
                                producto.id ||
                                producto._id ||
                                index
                              }
                              className="group relative overflow-hidden rounded-[25px] border border-[#D8BA98]/70 bg-white/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-lg dark:border-[#D4AF37]/10 dark:bg-[#160B0C]/30"
                            >

                              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#7F0303] via-[#D4AF37] to-[#7F0303] opacity-70" />

                              <div className="flex items-start justify-between gap-4">

                                <div className="flex min-w-0 items-center gap-3">

                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7F0303]/10 dark:bg-[#D4AF37]/10">

                                    <Package
                                      size={21}
                                      className="text-[#7F0303] dark:text-[#D4AF37]"
                                    />

                                  </div>

                                  <div className="min-w-0">

                                    <h3 className="truncate font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                                      {producto.nombre ||
                                        "Producto"}
                                    </h3>

                                    <p className="mt-1 truncate text-xs text-[#927E70]">
                                      {producto.categoria ||
                                        "Sin categoría"}
                                    </p>

                                  </div>

                                </div>

                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${estado.clase}`}
                                >
                                  {estado.texto}
                                </span>

                              </div>

                              <div className="mt-5 flex items-end justify-between gap-3">

                                <div>

                                  <p className="text-xs text-[#927E70]">
                                    Precio
                                  </p>

                                  <p className="mt-1 text-lg font-bold text-[#7F0303] dark:text-[#D4AF37]">
                                    {formatearPrecio(
                                      producto.precio
                                    )}
                                  </p>

                                </div>

                                <div className="text-right">

                                  <p className="text-xs text-[#927E70]">
                                    Existencia
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-[#3A2925] dark:text-[#F8F3EA]">
                                    {stock}{" "}
                                    unidades
                                  </p>

                                </div>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setProductoSeleccionado(
                                    producto
                                  )
                                }
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D8BA98] py-2.5 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white dark:border-[#D4AF37]/15 dark:text-[#D4AF37] dark:hover:text-[#160B0C]"
                              >
                                <Eye size={15} />
                                Consultar producto
                                <ArrowUpRight size={14} />
                              </button>

                            </article>
                          );
                        }
                      )}

                    </div>

                    <Paginacion
                      paginaActual={
                        paginaProductos
                      }
                      totalPaginas={
                        totalPaginasProductos
                      }
                      onCambiarPagina={
                        setPaginaProductos
                      }
                    />

                  </>
                )}

              </div>

            </div>

            {/* ==================================================
                VENTAS
            ================================================== */}

            <aside className="overflow-hidden rounded-[32px] border border-[#D8BA98] bg-[#F8F3EA] shadow-sm dark:border-[#D4AF37]/15 dark:bg-[#241415]">

              <div className="border-b border-[#D8BA98]/60 p-5 dark:border-[#D4AF37]/10 sm:p-6">

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                      Bitácora
                    </span>

                    <h2 className="mt-2 font-serif text-2xl font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                      Ventas
                    </h2>

                    <p className="mt-1 text-sm text-[#927E70] dark:text-[#BFAFAC]">
                      Ventas registradas en MUGI STORE.
                    </p>

                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7F0303]/10 dark:bg-[#D4AF37]/10">

                    <Clock3
                      size={21}
                      className="text-[#7F0303] dark:text-[#D4AF37]"
                    />

                  </div>

                </div>

                {/* ==================================================
                    FILTROS
                ================================================== */}

                <div className="mt-6 space-y-3">

                  <div className="relative">

                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#927E70]"
                    />

                    <input
                      type="text"
                      value={filtroCliente}
                      onChange={(e) =>
                        setFiltroCliente(
                          e.target.value
                        )
                      }
                      placeholder="Filtrar por cliente..."
                      className="w-full rounded-xl border border-[#D8BA98] bg-white/60 py-2.5 pl-9 pr-3 text-xs text-[#3A2925] outline-none transition focus:border-[#D4AF37] dark:border-[#D4AF37]/15 dark:bg-[#160B0C]/40 dark:text-[#F8F3EA]"
                    />

                  </div>

                  <input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) =>
                      setFiltroFecha(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white/60 px-3 py-2.5 text-xs text-[#3A2925] outline-none transition focus:border-[#D4AF37] dark:border-[#D4AF37]/15 dark:bg-[#160B0C]/40 dark:text-[#F8F3EA]"
                  />

                  <input
                    type="text"
                    value={filtroProducto}
                    onChange={(e) =>
                      setFiltroProducto(
                        e.target.value
                      )
                    }
                    placeholder="Filtrar por producto..."
                    className="w-full rounded-xl border border-[#D8BA98] bg-white/60 px-3 py-2.5 text-xs text-[#3A2925] outline-none transition focus:border-[#D4AF37] dark:border-[#D4AF37]/15 dark:bg-[#160B0C]/40 dark:text-[#F8F3EA]"
                  />

                  <select
                    value={filtroEstado}
                    onChange={(e) =>
                      setFiltroEstado(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white/60 px-3 py-2.5 text-xs text-[#3A2925] outline-none transition focus:border-[#D4AF37] dark:border-[#D4AF37]/15 dark:bg-[#160B0C]/40 dark:text-[#F8F3EA]"
                  >
                    <option value="">
                      Todos los estados
                    </option>

                    <option value="confirmada">
                      Confirmada
                    </option>

                    <option value="pendiente">
                      Pendiente
                    </option>

                    <option value="cancelada">
                      Cancelada
                    </option>
                  </select>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                    <input
                      type="number"
                      min="0"
                      value={filtroValorMin}
                      onChange={(e) =>
                        setFiltroValorMin(
                          e.target.value
                        )
                      }
                      placeholder="Valor mínimo"
                      className="w-full rounded-xl border border-[#D8BA98] bg-white/60 px-3 py-2.5 text-xs text-[#3A2925] outline-none transition focus:border-[#D4AF37] dark:border-[#D4AF37]/15 dark:bg-[#160B0C]/40 dark:text-[#F8F3EA]"
                    />

                    <input
                      type="number"
                      min="0"
                      value={filtroValorMax}
                      onChange={(e) =>
                        setFiltroValorMax(
                          e.target.value
                        )
                      }
                      placeholder="Valor máximo"
                      className="w-full rounded-xl border border-[#D8BA98] bg-white/60 px-3 py-2.5 text-xs text-[#3A2925] outline-none transition focus:border-[#D4AF37] dark:border-[#D4AF37]/15 dark:bg-[#160B0C]/40 dark:text-[#F8F3EA]"
                    />

                  </div>

                  {hayFiltros && (
                    <button
                      type="button"
                      onClick={
                        limpiarFiltros
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8BA98] px-3 py-2.5 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white dark:border-[#D4AF37]/15 dark:text-[#D4AF37]"
                    >
                      <X size={14} />
                      Limpiar filtros
                    </button>
                  )}

                  <div className="flex items-center justify-between pt-1">

                    <span className="text-xs text-[#927E70]">
                      Resultados
                    </span>

                    <span className="rounded-full bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold text-[#92701A] dark:text-[#D4AF37]">
                      {ventasFiltradas.length}
                    </span>

                  </div>

                </div>

              </div>

              <div className="p-4 sm:p-5">

                {cargandoVentas ? (
                  <div className="py-16 text-center">

                    <RefreshCw
                      size={30}
                      className="mx-auto animate-spin text-[#D4AF37]"
                    />

                    <p className="mt-4 text-sm text-[#927E70]">
                      Consultando ventas...
                    </p>

                  </div>
                ) : ventas.length === 0 ? (
                  <div className="py-16 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10">

                      <ShoppingBag
                        size={27}
                        className="text-[#D4AF37]"
                      />

                    </div>

                    <p className="mt-4 font-semibold text-[#7F0303] dark:text-[#F8F3EA]">
                      No hay ventas
                    </p>

                    <p className="mt-1 text-xs text-[#927E70]">
                      Aún no existen ventas registradas.
                    </p>

                  </div>
                ) : ventasFiltradas.length ===
                  0 ? (
                  <div className="py-16 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10">

                      <Search
                        size={27}
                        className="text-[#D4AF37]"
                      />

                    </div>

                    <p className="mt-4 font-semibold text-[#7F0303] dark:text-[#F8F3EA]">
                      No hay coincidencias
                    </p>

                    <p className="mt-1 text-xs text-[#927E70]">
                      No encontramos ventas con los filtros seleccionados.
                    </p>

                    <button
                      type="button"
                      onClick={
                        limpiarFiltros
                      }
                      className="mt-5 rounded-full border border-[#D8BA98] px-4 py-2 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white dark:border-[#D4AF37]/20 dark:text-[#D4AF37]"
                    >
                      Limpiar filtros
                    </button>

                  </div>
                ) : (
                  <>
                    <div className="space-y-3">

                      {ventasPaginadas.map(
                        (
                          venta,
                          index
                        ) => {

                          const idVenta =
                            obtenerIdVenta(
                              venta,
                              indiceInicioVentas +
                                index
                            );

                          const total =
                            obtenerTotalVenta(
                              venta
                            );

                          return (
                            <button
                              key={idVenta}
                              type="button"
                              onClick={() =>
                                setVentaSeleccionada(
                                  venta
                                )
                              }
                              className="group flex w-full items-center gap-3 rounded-2xl border border-[#D8BA98]/70 bg-white/40 p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/50 hover:bg-white/70 hover:shadow-md dark:border-[#D4AF37]/10 dark:bg-[#160B0C]/30 dark:hover:bg-[#160B0C]/60"
                            >

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10">

                                <ShoppingBag
                                  size={18}
                                  className="text-[#D4AF37]"
                                />

                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">

                                  <p className="truncate text-sm font-bold text-[#7F0303] dark:text-[#F8F3EA]">
                                    Venta #
                                    {idVenta}
                                  </p>

                                  <span className="shrink-0 text-xs font-bold text-[#7F0303] dark:text-[#D4AF37]">
                                    {formatearPrecio(
                                      total
                                    )}
                                  </span>

                                </div>

                                <div className="mt-1 flex min-w-0 flex-col">

                                  <span className="truncate text-xs text-[#927E70]">
                                    {obtenerClienteVenta(
                                      venta
                                    )}
                                  </span>

                                  <span className="mt-1 text-[10px] text-[#927E70]">
                                    {obtenerFechaVenta(
                                      venta
                                    )}
                                  </span>

                                </div>

                              </div>

                              <ChevronRight
                                size={18}
                                className="shrink-0 text-[#927E70] transition group-hover:translate-x-1 group-hover:text-[#D4AF37]"
                              />

                            </button>
                          );
                        }
                      )}

                    </div>

                    <Paginacion
                      paginaActual={
                        paginaVentas
                      }
                      totalPaginas={
                        totalPaginasVentas
                      }
                      onCambiarPagina={
                        setPaginaVentas
                      }
                    />

                  </>
                )}

              </div>

            </aside>

          </div>

        </section>

        {/* ======================================================
            MODAL PRODUCTO
        ====================================================== */}

        {productoSeleccionado && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6"
            onClick={() =>
              setProductoSeleccionado(
                null
              )
            }
          >

            <div
              className="my-auto w-full max-w-lg overflow-hidden rounded-[30px] bg-[#F8F3EA] shadow-2xl dark:bg-[#241415]"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="h-2 bg-gradient-to-r from-[#7F0303] via-[#D4AF37] to-[#7F0303]" />

              <div className="p-6 sm:p-8">

                <div className="flex items-start justify-between gap-5">

                  <div className="min-w-0">

                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                      Ficha del producto
                    </span>

                    <h2 className="mt-2 break-words font-serif text-2xl font-bold text-[#7F0303] dark:text-[#F8F3EA] sm:text-3xl">
                      {productoSeleccionado.nombre ||
                        "Producto"}
                    </h2>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setProductoSeleccionado(
                        null
                      )
                    }
                    className="shrink-0 rounded-full p-2 text-[#7F0303] transition hover:bg-[#D4AF37] hover:text-white dark:text-[#F8F3EA]"
                  >
                    <X size={20} />
                  </button>

                </div>

                <div className="mt-7 space-y-4">

                  <div className="overflow-hidden rounded-2xl bg-white/60 dark:bg-[#160B0C]/50">

                    {obtenerRutaImagen(
                      productoSeleccionado.imagen
                    ) ? (
                      <img
                        src={obtenerRutaImagen(
                          productoSeleccionado.imagen
                        )}
                        alt={
                          productoSeleccionado.nombre ||
                          "Producto"
                        }
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-[#7F0303]/5 text-sm text-[#927E70] dark:bg-[#D4AF37]/5">
                        Imagen no disponible
                      </div>
                    )}

                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                      <p className="text-xs text-[#927E70]">
                        Referencia
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[#7F0303] dark:text-[#F8F3EA]">
                        #
                        {productoSeleccionado.id ||
                          productoSeleccionado._id ||
                          "N/D"}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                      <p className="text-xs text-[#927E70]">
                        Estado
                      </p>

                      <p
                        className={`mt-2 text-sm font-semibold ${
                          productoSeleccionado.estado ===
                          false
                            ? "text-red-700 dark:text-red-300"
                            : "text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {productoSeleccionado.estado ===
                        false
                          ? "Inactivo"
                          : "Activo"}
                      </p>

                    </div>

                  </div>

                  <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                    <p className="text-xs font-semibold uppercase tracking-wider text-[#927E70]">
                      Descripción
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#765E52] dark:text-[#C8B9B5]">
                      {productoSeleccionado.descripcion ||
                        "Sin descripción disponible."}
                    </p>

                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                      <p className="text-xs text-[#927E70]">
                        Precio
                      </p>

                      <p className="mt-2 text-lg font-bold text-[#7F0303] dark:text-[#D4AF37]">
                        {formatearPrecio(
                          productoSeleccionado.precio
                        )}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                      <p className="text-xs text-[#927E70]">
                        Stock
                      </p>

                      <p className="mt-2 text-lg font-bold text-[#7F0303] dark:text-[#D4AF37]">
                        {obtenerStock(
                          productoSeleccionado
                        )}{" "}
                        unidades
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setProductoSeleccionado(
                      null
                    )
                  }
                  className="mt-7 w-full rounded-full bg-[#7F0303] py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#D4AF37] dark:bg-[#8F1D24] dark:hover:bg-[#D4AF37] dark:hover:text-[#160B0C]"
                >
                  Cerrar ficha
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================
            MODAL VENTA
        ====================================================== */}

        {ventaSeleccionada && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6"
            onClick={() =>
              setVentaSeleccionada(null)
            }
          >

            <div
              className="my-auto w-full max-w-2xl overflow-hidden rounded-[30px] bg-[#F8F3EA] shadow-2xl dark:bg-[#241415]"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="h-2 bg-gradient-to-r from-[#7F0303] via-[#D4AF37] to-[#7F0303]" />

              <div className="p-5 sm:p-6 md:p-8">

                <div className="flex items-start justify-between gap-5">

                  <div className="min-w-0">

                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                      Comprobante de venta
                    </span>

                    <h2 className="mt-2 font-serif text-2xl font-bold text-[#7F0303] dark:text-[#F8F3EA] sm:text-3xl">
                      Venta #
                      {obtenerIdVenta(
                        ventaSeleccionada
                      )}
                    </h2>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setVentaSeleccionada(
                        null
                      )
                    }
                    className="shrink-0 rounded-full p-2 text-[#7F0303] transition hover:bg-[#D4AF37] hover:text-white dark:text-[#F8F3EA]"
                  >
                    <X size={20} />
                  </button>

                </div>

                <div className="mt-7 space-y-4">

                  <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                    <p className="text-xs text-[#927E70]">
                      Número de factura
                    </p>

                    <p className="mt-2 break-words font-semibold text-[#7F0303] dark:text-[#F8F3EA]">
                      {obtenerNumeroFactura(
                        ventaSeleccionada
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                    <p className="text-xs text-[#927E70]">
                      Cliente
                    </p>

                    <p className="mt-2 break-words font-semibold text-[#7F0303] dark:text-[#F8F3EA]">
                      {obtenerClienteVenta(
                        ventaSeleccionada
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                    <p className="text-xs text-[#927E70]">
                      Fecha
                    </p>

                    <p className="mt-2 break-words font-semibold text-[#7F0303] dark:text-[#F8F3EA]">
                      {obtenerFechaVenta(
                        ventaSeleccionada
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                    <p className="text-xs text-[#927E70]">
                      Estado
                    </p>

                    <p className="mt-2 font-semibold capitalize text-[#7F0303] dark:text-[#D4AF37]">
                      {ventaSeleccionada.estado ||
                        "Sin estado"}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                    <p className="text-xs text-[#927E70]">
                      Total
                    </p>

                    <p className="mt-2 text-xl font-bold text-[#7F0303] dark:text-[#D4AF37]">
                      {formatearPrecio(
                        obtenerTotalVenta(
                          ventaSeleccionada
                        )
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white/60 p-4 dark:bg-[#160B0C]/50">

                    <p className="text-xs font-semibold uppercase tracking-wider text-[#927E70]">
                      Productos
                    </p>

                    <div className="mt-3 space-y-2">

                      {obtenerDetallesVenta(
                        ventaSeleccionada
                      ).length > 0 ? (
                        obtenerDetallesVenta(
                          ventaSeleccionada
                        ).map(
                          (
                            detalle,
                            index
                          ) => {

                            const nombreProducto =
                              obtenerNombreProductoVenta(
                                detalle
                              );

                            const cantidad =
                              Number(
                                detalle?.cantidad ??
                                  detalle?.cantidad_producto ??
                                  1
                              );

                            const precio =
                              Number(
                                detalle?.precio_unitario ??
                                  detalle?.precio ??
                                  detalle?.producto?.precio ??
                                  0
                              );

                            const subtotalDetalle =
                              detalle?.subtotal !==
                                undefined &&
                              detalle?.subtotal !==
                                null
                                ? Number(
                                    detalle.subtotal
                                  )
                                : cantidad *
                                  precio;

                            return (
                              <div
                                key={index}
                                className="rounded-xl bg-[#EFE8DF] px-3 py-3 dark:bg-[#160B0C]"
                              >

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                  <span className="break-words text-sm font-semibold text-[#765E52] dark:text-[#C8B9B5]">
                                    {nombreProducto}
                                  </span>

                                  <span className="shrink-0 text-sm font-bold text-[#7F0303] dark:text-[#D4AF37]">
                                    x
                                    {cantidad}
                                  </span>

                                </div>

                                <div className="mt-2 flex items-center justify-between text-xs">

                                  <span className="text-[#927E70]">
                                    Precio unitario
                                  </span>

                                  <span className="font-semibold text-[#765E52] dark:text-[#C8B9B5]">
                                    {formatearPrecio(
                                      precio
                                    )}
                                  </span>

                                </div>

                                <div className="mt-1 flex items-center justify-between text-xs">

                                  <span className="text-[#927E70]">
                                    Subtotal
                                  </span>

                                  <span className="font-bold text-[#7F0303] dark:text-[#D4AF37]">
                                    {formatearPrecio(
                                      subtotalDetalle
                                    )}
                                  </span>

                                </div>

                              </div>
                            );
                          }
                        )
                      ) : (
                        <p className="text-sm text-[#927E70]">
                          No hay detalle disponible.
                        </p>
                      )}

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    BOTONES DE FACTURA
                ================================================== */}

                <div className="mt-7 grid gap-3 sm:grid-cols-3">

                  <button
                    type="button"
                    onClick={() =>
                      descargarFacturaPDF(
                        ventaSeleccionada
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-full border border-[#D4AF37] bg-[#D4AF37] py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#7F0303]"
                  >
                    <Download size={17} />
                    Descargar PDF
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      imprimirFactura(
                        ventaSeleccionada
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-full bg-[#7F0303] py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#D4AF37] dark:bg-[#8F1D24] dark:hover:bg-[#D4AF37] dark:hover:text-[#160B0C]"
                  >
                    <Printer size={17} />
                    Imprimir factura
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setVentaSeleccionada(
                        null
                      )
                    }
                    className="rounded-full border border-[#D8BA98] py-3.5 text-sm font-bold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white dark:border-[#D4AF37]/20 dark:text-[#D4AF37]"
                  >
                    Cerrar
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>
    </EstructuraPanel>
  );
}

export default Empleado;