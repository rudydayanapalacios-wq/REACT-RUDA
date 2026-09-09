import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Package,
  ShoppingBag,
  Eye,
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
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import EstructuraPanel from "../components/EstructuraPanel";
import { useNavigate } from "react-router-dom";

function Empleado() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [cargandoVentas, setCargandoVentas] = useState(true);

  const [actualizando, setActualizando] = useState(false);

  const API = "http://127.0.0.1:8000";

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
  // FUNCIONES
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

    if (ruta.startsWith("/")) return ruta;

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

  const obtenerTotalVenta = (venta) => {
    return Number(
      venta?.total ??
        venta?.total_venta ??
        venta?.monto_total ??
        0
    );
  };

  const obtenerClienteVenta = (venta) => {
    return (
      venta?.cliente ??
      venta?.usuario ??
      venta?.nombre_cliente ??
      venta?.cliente_nombre ??
      venta?.email ??
      "Cliente"
    );
  };

  const obtenerFechaVenta = (venta) => {
    const fecha =
      venta?.fecha ??
      venta?.fecha_venta ??
      venta?.created_at ??
      venta?.createdAt;

    if (!fecha) return "Fecha no disponible";

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
  // IMPRIMIR FACTURA
  // ============================================================

  const imprimirFactura = (venta) => {
    const idVenta = obtenerIdVenta(venta);
    const cliente = obtenerClienteVenta(venta);
    const fecha = obtenerFechaVenta(venta);
    const total = obtenerTotalVenta(venta);
    const detalles = obtenerDetallesVenta(venta);

    const filas =
      Array.isArray(detalles) && detalles.length > 0
        ? detalles
            .map((detalle) => {
              const nombreProducto =
                detalle?.producto?.nombre ??
                detalle?.producto_nombre ??
                detalle?.nombre ??
                "Producto";

              const cantidad = Number(
                detalle?.cantidad ??
                  detalle?.cantidad_producto ??
                  1
              );

              const precio = Number(
                detalle?.precio ??
                  detalle?.precio_unitario ??
                  detalle?.producto?.precio ??
                  0
              );

              const subtotal = cantidad * precio;

              return `
                <tr>
                  <td>${nombreProducto}</td>
                  <td>${cantidad}</td>
                  <td>$${precio.toLocaleString("es-CO")}</td>
                  <td>$${subtotal.toLocaleString("es-CO")}</td>
                </tr>
              `;
            })
            .join("")
        : `
            <tr>
              <td colspan="4">No hay detalle disponible</td>
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
          <title>Factura #${idVenta} - MUGI STORE</title>

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

            .total {
              margin-top: 25px;
              display: flex;
              justify-content: flex-end;
            }

            .total-box {
              min-width: 250px;
              padding: 18px;
              border: 2px solid #D4AF37;
              border-radius: 10px;
            }

            .total-box span {
              font-size: 14px;
              color: #777;
            }

            .total-box strong {
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
                <p><strong>#${idVenta}</strong></p>
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

            <div class="total">
              <div class="total-box">
                <span>Total de la venta</span>
                <strong>
                  $${total.toLocaleString("es-CO")}
                </strong>
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
  // PRODUCTOS FILTRADOS
  // ============================================================

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return productos;

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
  // ESTADÍSTICAS
  // ============================================================

  const productosDisponibles = productos.filter(
    (producto) => obtenerStock(producto) > 0
  ).length;

  const productosStockBajo = productos.filter(
    (producto) => {
      const stock = obtenerStock(producto);

      return stock > 0 && stock <= 5;
    }
  ).length;

  const productosAgotados = productos.filter(
    (producto) => obtenerStock(producto) <= 0
  ).length;

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
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2.5 text-sm font-semibold text-[#7F0303] shadow-sm transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 dark:bg-[#241415] dark:text-[#D4AF37]"
          >
            <Home size={17} />

            Ir a inicio
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
                  onClick={() => navigate("/perfil")}
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

                <div className="mt-4 flex items-center justify-between border-t border-[#D8BA98]/50 pt-3 dark:border-[#D4AF37]/10">

                  <span className="text-xs text-[#927E70]">
                    Estado
                  </span>

                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">

                    <CircleCheck size={15} />

                    En línea

                  </span>

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
            CONTENIDO
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 md:px-8">

          <div className="grid gap-6 2xl:grid-cols-[1.55fr_0.85fr] 2xl:gap-8">

            {/* ==================================================
                CATÁLOGO
            ================================================== */}

            <div className="overflow-hidden rounded-[32px] border border-[#D8BA98] bg-[#F8F3EA] shadow-sm dark:border-[#D4AF37]/15 dark:bg-[#241415]">

              <div className="border-b border-[#D8BA98]/60 p-6 dark:border-[#D4AF37]/10 md:p-7">

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

                  <div className="rounded-full bg-[#EFE8DF] px-4 py-2 text-xs font-semibold text-[#765E52] dark:bg-[#160B0C] dark:text-[#C8B9B5]">

                    {productosFiltrados.length} resultado
                    {productosFiltrados.length !== 1
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
                      setBusqueda(e.target.value)
                    }
                    placeholder="Buscar por nombre, categoría o descripción..."
                    className="w-full rounded-2xl border border-[#D8BA98] bg-white/70 py-3.5 pl-11 pr-4 text-xs text-[#3A2925] outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 dark:border-[#D4AF37]/15 dark:bg-[#160B0C]/50 dark:text-[#F8F3EA] dark:placeholder:text-[#927E70] sm:text-sm"
                  />

                </div>

              </div>

              <div className="p-5 md:p-7">

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

                ) : productosFiltrados.length === 0 ? (

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

                  <div className="grid gap-4 sm:grid-cols-2">

                    {productosFiltrados
                      .slice(0, 4)
                      .map((producto, index) => {

                        const stock =
                          obtenerStock(producto);

                        const estado =
                          obtenerEstadoStock(stock);

                        return (

                          <article
                            key={
                              producto.id ||
                              producto._id ||
                              index
                            }
                            className="group relative overflow-hidden rounded-[25px] border border-[#D8BA98]/70 bg-white/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-lg dark:border-[#D4AF37]/10 dark:bg-[#160B0C]/30"
                          >

                            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#7F0303] via-[#D4AF37] to-[#0F414A] opacity-70" />

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
                                  {stock} unidades
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
                      })}

                  </div>

                )}

                {productosFiltrados.length > 4 && (

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/empleado/productos")
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D4AF37] py-3 text-sm font-bold text-[#7F0303] transition hover:bg-[#D4AF37] hover:text-white dark:text-[#D4AF37]"
                  >

                    Ver catálogo completo (
                    {productosFiltrados.length}
                    )

                    <ArrowUpRight size={16} />

                  </button>

                )}

              </div>

            </div>

            {/* ==================================================
                VENTAS
            ================================================== */}

            <aside className="overflow-hidden rounded-[32px] border border-[#D8BA98] bg-[#F8F3EA] shadow-sm dark:border-[#D4AF37]/15 dark:bg-[#241415]">

              <div className="border-b border-[#D8BA98]/60 p-6 dark:border-[#D4AF37]/10">

                <div className="flex items-start justify-between gap-4">

                  <div>

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

              </div>

              <div className="p-5">

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

                ) : (

                  <div className="space-y-3">

                    {ventas
                      .slice(0, 6)
                      .map((venta, index) => {

                        const idVenta =
                          obtenerIdVenta(
                            venta,
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

                              <p className="truncate text-sm font-bold text-[#7F0303] dark:text-[#F8F3EA]">

                                Venta #{idVenta}

                              </p>

                              <div className="mt-1 flex flex-col">

                                <span className="truncate text-xs text-[#927E70]">

                                  {obtenerClienteVenta(
                                    venta
                                  )}

                                </span>

                                <span className="mt-1 text-xs font-semibold text-[#D4AF37]">

                                  {formatearPrecio(
                                    total
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
                      })}

                  </div>

                )}

                {ventas.length > 6 && (

                  <p className="mt-5 text-center text-xs text-[#927E70]">
                    Mostrando las 6 ventas más recientes.
                  </p>

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
              setProductoSeleccionado(null)
            }
          >

            <div
              className="my-auto w-full max-w-lg overflow-hidden rounded-[30px] bg-[#F8F3EA] shadow-2xl dark:bg-[#241415]"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="h-2 bg-gradient-to-r from-[#7F0303] via-[#D4AF37] to-[#0F414A]" />

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
                      setProductoSeleccionado(null)
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
                    setProductoSeleccionado(null)
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
              className="my-auto w-full max-w-lg overflow-hidden rounded-[30px] bg-[#F8F3EA] shadow-2xl dark:bg-[#241415]"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="h-2 bg-gradient-to-r from-[#7F0303] via-[#D4AF37] to-[#0F414A]" />

              <div className="p-6 sm:p-8">

                <div className="flex items-start justify-between gap-5">

                  <div>

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
                      setVentaSeleccionada(null)
                    }
                    className="rounded-full p-2 text-[#7F0303] transition hover:bg-[#D4AF37] hover:text-white dark:text-[#F8F3EA]"
                  >
                    <X size={20} />
                  </button>

                </div>

                <div className="mt-7 space-y-4">

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

                    <p className="mt-2 font-semibold text-[#7F0303] dark:text-[#F8F3EA]">

                      {obtenerFechaVenta(
                        ventaSeleccionada
                      )}

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
                          (detalle, index) => {

                            const nombreProducto =
                              detalle?.producto?.nombre ??
                              detalle?.producto_nombre ??
                              detalle?.nombre ??
                              "Producto";

                            const cantidad =
                              Number(
                                detalle?.cantidad ??
                                  detalle?.cantidad_producto ??
                                  1
                              );

                            return (

                              <div
                                key={index}
                                className="flex items-center justify-between gap-3 rounded-xl bg-[#EFE8DF] px-3 py-2 dark:bg-[#160B0C]"
                              >

                                <span className="truncate text-sm text-[#765E52] dark:text-[#C8B9B5]">
                                  {nombreProducto}
                                </span>

                                <span className="shrink-0 text-sm font-bold text-[#7F0303] dark:text-[#D4AF37]">
                                  x{cantidad}
                                </span>

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

                <div className="mt-7 grid gap-3 sm:grid-cols-2">

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
                      setVentaSeleccionada(null)
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
