import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function EmpleadoProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);

  const obtenerRutaImagen = (imagen) => {
    if (!imagen) return null;

    const ruta = String(imagen).trim().replace(/\\/g, "/");

    if (/^(https?:)?\/\//i.test(ruta) || ruta.startsWith("data:")) {
      return ruta;
    }

    if (ruta.startsWith("/")) return ruta;

    return ruta.startsWith("img/") ? `/${ruta}` : `/img/${ruta}`;
  };

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No hay una sesión activa.");
          setCargando(false);
          return;
        }

        const respuesta = await fetch(`${API_URL}/productos`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const datos = await respuesta.json();

        console.log("Respuesta productos:", datos);

     if (!respuesta.ok) {
  setError(
    datos.detail || "No se pudieron cargar los productos."
  );
  setCargando(false);
  return;
}

setProductos(Array.isArray(datos) ? datos : []);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  return (
    <section className="min-h-screen bg-[#EFE8DF] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* VOLVER AL PANEL */}
        <Link
          to="/empleado"
          className="text-sm font-semibold text-[#7F0303] transition-colors hover:text-[#D4AF37]"
        >
          ← Volver al panel
        </Link>

        {/* ENCABEZADO */}
        <div className="mt-8">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            MUGI STORE
          </span>

          <h1 className="mt-3 font-serif text-4xl font-bold text-[#7F0303]">
            Consulta de Productos
          </h1>

          <p className="mt-3 text-[#765E52]">
            Consulta los productos disponibles en MUGI STORE.
          </p>
        </div>

        {/* CONTADOR */}
        {!cargando && !error && (
          <div className="mt-8">
            <h2 className="font-serif text-2xl font-bold text-[#7F0303]">
              Productos
            </h2>

            <p className="mt-1 text-sm text-[#765E52]">
              {productos.length} productos registrados
            </p>
          </div>
        )}

        {/* CARGANDO */}
        {cargando && (
          <div className="mt-8 rounded-3xl border border-[#D8BA98] bg-[#F8F3EA] p-8 text-center shadow-lg">
            <p className="text-[#765E52]">
              Cargando productos...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!cargando && error && (
          <div className="mt-8 rounded-3xl border border-red-300 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">
              {error}
            </p>
          </div>
        )}

        {/* SIN PRODUCTOS */}
        {!cargando && !error && productos.length === 0 && (
          <div className="mt-8 rounded-3xl border border-[#D8BA98] bg-[#F8F3EA] p-8 text-center shadow-lg">
            <p className="font-semibold text-[#7F0303]">
              No hay productos registrados.
            </p>
          </div>
        )}

        {/* LISTA DE PRODUCTOS */}
        {!cargando && !error && productos.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <article
                key={producto.id}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#D8BA98] bg-[#F8F3EA] shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >

                {/* IMAGEN */}
                <div className="relative h-56 overflow-hidden bg-[#E5D8C8]">
                  {obtenerRutaImagen(producto.imagen) ? (
                    <img
                      src={obtenerRutaImagen(producto.imagen)}
                      alt={producto.nombre}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#765E52]">
                      Imagen no disponible
                    </div>
                  )}

                  {/* ESTADO */}
                  <div className="absolute right-4 top-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        producto.estado
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {producto.estado ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                {/* INFORMACIÓN */}
                <div className="flex flex-1 flex-col p-6">

                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Producto #{producto.id}
                  </span>

                  <h3 className="mt-2 min-h-[64px] font-serif text-2xl font-bold leading-tight text-[#7F0303]">
                    {producto.nombre}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm text-[#765E52]">
                    {producto.descripcion || "Sin descripción."}
                  </p>

                  {/* PRECIO Y STOCK */}
                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-[#EFE8DF] p-3">
                      <p className="text-xs text-[#765E52]">
                        Precio
                      </p>

                      <p className="mt-1 font-bold text-[#7F0303]">
                        $
                        {Number(producto.precio).toLocaleString(
                          "es-CO"
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#EFE8DF] p-3">
                      <p className="text-xs text-[#765E52]">
                        Stock
                      </p>

                      <p className="mt-1 font-bold text-[#7F0303]">
                        {producto.stock}
                      </p>
                    </div>

                  </div>

                  {/* ESTADO INFERIOR */}
                  <div className="mt-5 border-t border-[#D8BA98] pt-4">
                    <p className="text-xs text-[#765E52]">
                      Estado del producto
                    </p>

                    <p
                      className={`mt-1 text-sm font-bold ${
                        producto.estado
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {producto.estado
                        ? "Producto disponible"
                        : "Producto inactivo"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProductoSeleccionado(producto)}
                    className="mt-auto w-full rounded-2xl bg-[#7F0303] py-3 text-sm font-bold text-white transition hover:bg-[#52070A]"
                  >
                    Ver detalles
                  </button>

                </div>
              </article>
            ))}
          </div>
        )}



      </div>

      {productoSeleccionado && (
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6" onClick={() => setProductoSeleccionado(null)}>
    <div className="my-auto w-full max-w-lg overflow-hidden rounded-[30px] bg-[#F8F3EA] shadow-2xl" onClick={(evento) => evento.stopPropagation()}>
      <div className="h-2 bg-gradient-to-r from-[#7F0303] via-[#D4AF37] to-[#0F414A]" />
      <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Ficha del producto</span>
          <h2 className="mt-2 break-words font-serif text-2xl font-bold text-[#7F0303] sm:text-3xl">
            {productoSeleccionado.nombre || "Producto"}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setProductoSeleccionado(null)}
          aria-label="Cerrar detalles"
          className="shrink-0 rounded-full p-2 text-[#7F0303] transition hover:bg-[#D4AF37] hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-7 space-y-4">
        <div className="overflow-hidden rounded-2xl bg-white/60">
          {obtenerRutaImagen(productoSeleccionado.imagen) ? (
            <img src={obtenerRutaImagen(productoSeleccionado.imagen)} alt={productoSeleccionado.nombre || "Producto"} className="h-56 w-full object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center bg-[#7F0303]/5 text-sm text-[#765E52]">Imagen no disponible</div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/60 p-4"><p className="text-xs text-[#927E70]">Referencia</p><p className="mt-2 text-sm font-semibold text-[#7F0303]">#{productoSeleccionado.id || "N/D"}</p></div>
          <div className="rounded-2xl bg-white/60 p-4"><p className="text-xs text-[#927E70]">Estado</p><p className={`mt-2 text-sm font-semibold ${productoSeleccionado.estado ? "text-emerald-700" : "text-red-700"}`}>{productoSeleccionado.estado ? "Activo" : "Inactivo"}</p></div>
        </div>
        <div className="rounded-2xl bg-white/60 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[#927E70]">Descripción</p><p className="mt-2 text-sm leading-6 text-[#765E52]">{productoSeleccionado.descripcion || "Sin descripción disponible."}</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/60 p-4"><p className="text-xs text-[#927E70]">Precio</p><p className="mt-2 text-lg font-bold text-[#7F0303]">${Number(productoSeleccionado.precio).toLocaleString("es-CO")}</p></div>
          <div className="rounded-2xl bg-white/60 p-4"><p className="text-xs text-[#927E70]">Stock</p><p className="mt-2 text-lg font-bold text-[#7F0303]">{productoSeleccionado.stock ?? 0} unidades</p></div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setProductoSeleccionado(null)}
        className="mt-7 w-full rounded-full bg-[#7F0303] py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#D4AF37] hover:text-[#160B0C]"
      >
        Cerrar ficha
      </button>
    </div>
    </div>
  </div>
)}
    </section>
  );
}

export default EmpleadoProductos;
