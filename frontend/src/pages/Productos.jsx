import { useEffect, useState } from "react";
import ProductoCard from "../components/ProductoCard";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:8000";

function Productos() {
  const { token ,usuario} = useAuth();
  console.log("USUARIO ACTUAL:", usuario);

  const [filtro, setFiltro] = useState("Todos");
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const filtros = [
    "Todos",
    "Joyas",
    "Collares",
    "Pulseras",
    "Accesorios",
    "Novedades",
  ];

  // ============================================================
  // OBTENER RUTA DE LA IMAGEN
  // ============================================================

  const obtenerRutaImagen = (imagen) => {
    if (!imagen) {
      return null;
    }

    // Si la API ya devuelve una URL completa
    if (
      imagen.startsWith("http://") ||
      imagen.startsWith("https://")
    ) {
      return imagen;
    }

    // Si la API devuelve /img/archivo.jpg
    if (imagen.startsWith("/")) {
      return imagen;
    }

    // Si solamente devuelve el nombre del archivo
    return `/img/${imagen}`;
  };

  // ============================================================
  // CARGAR PRODUCTOS DESDE LA API
  // ============================================================

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(`${API_URL}/productos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const datos = await respuesta.json();

      console.log("=================================");
      console.log("RESPUESTA DE PRODUCTOS");
      console.log("=================================");
      console.log(datos);

      if (!respuesta.ok) {
        throw new Error(
          datos.message || "Error al obtener los productos."
        );
      }

      // ========================================================
      // LA API PUEDE DEVOLVER:
      // { productos: [...] }
      // o directamente [...]
      // ========================================================

      const productosRecibidos = Array.isArray(datos)
        ? datos
        : datos.productos || datos.data || [];

      console.log("Productos recibidos:", productosRecibidos);

      // ========================================================
      // MOSTRAR INFORMACIÓN IMPORTANTE EN CONSOLA
      // ========================================================

      console.log(
        "Productos e imágenes:",
        productosRecibidos.map((producto) => ({
          id: producto.id,
          nombre: producto.nombre,
          categoria: producto.categoria,
          precio: producto.precio,
          estado: producto.estado,
          imagen: producto.imagen,
          rutaImagen: obtenerRutaImagen(producto.imagen),
        }))
      );

      setProductos(productosRecibidos);
    } catch (error) {
      console.error(
        "Error cargando productos:",
        error
      );

      setError(
        error.message ||
          "No se pudieron cargar los productos."
      );

      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  // ============================================================
  // CARGAR AL ENTRAR A LA PÁGINA
  // ============================================================

  useEffect(() => {
    cargarProductos();
  }, [token]);

  // ============================================================
  // PRODUCTOS ACTIVOS
  // ============================================================

  const productosActivos = productos.filter(
    (producto) => {
      return (
        producto.estado === true ||
        producto.estado === 1 ||
        producto.estado === "1" ||
        producto.estado === "true" ||
        producto.estado === "activo" ||
        producto.estado === "Activo"
      );
    }
  );

  // ============================================================
  // FILTRAR PRODUCTOS
  // ============================================================

  const productosFiltrados =
    filtro === "Todos"
      ? productosActivos
      : productosActivos.filter(
          (producto) =>
            producto.categoria === filtro
        );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main
      className="
        min-h-screen
        bg-[#EFE8DF]
        px-6
        py-16
        text-[#52070A]
        transition-colors
        duration-300
        dark:bg-[#160B0C]
        dark:text-[#F8F3EA]
        md:px-10
      "
    >
      {/* ======================================================
          ENCABEZADO
      ====================================================== */}

      <section className="mx-auto max-w-6xl text-center">
        <span
          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.35em]
            text-[#D4AF37]
          "
        >
          Nuestra colección
        </span>

        <h1
          className="
            mt-4
            font-serif
            text-5xl
            font-bold
            text-[#7F0303]
            transition-colors
            duration-300
            dark:text-[#D4AF37]
            md:text-6xl
          "
        >
          Productos
        </h1>

        <p
          className="
            mx-auto
            mt-5
            max-w-2xl
            text-base
            leading-relaxed
            text-[#0F414A]
            transition-colors
            duration-300
            dark:text-[#E3D7D2]
            md:text-lg
          "
        >
          Descubre nuestra colección de joyas y accesorios
          inspirados en el universo de One Piece.
        </p>
      </section>

      {/* ======================================================
          BANNER
      ====================================================== */}

      <section className="mx-auto mt-12 max-w-4xl">
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-[#D4AF37]/40
            bg-[#F8F3EA]
            p-8
            text-center
            shadow-lg
            dark:bg-[#241415]
          "
        >
          <h2
            className="
              font-serif
              text-2xl
              font-bold
              text-[#7F0303]
              dark:text-[#D4AF37]
            "
          >
            ✦ Explora el Grand Line ✦
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-2xl
              leading-relaxed
              text-[#0F414A]
              dark:text-[#E3D7D2]
            "
          >
            Encuentra accesorios inspirados en tus
            personajes, símbolos y aventuras favoritas
            de One Piece.
          </p>
        </div>
      </section>

      {/* ======================================================
          FILTROS
      ====================================================== */}

      <section className="mx-auto mt-12 max-w-6xl">
        <div className="flex flex-wrap justify-center gap-3">
          {filtros.map((nombreFiltro) => (
            <button
              key={nombreFiltro}
              type="button"
              onClick={() =>
                setFiltro(nombreFiltro)
              }
              className={`
                rounded-full
                px-6
                py-2
                text-sm
                font-semibold
                transition-all
                duration-300

                ${
                  filtro === nombreFiltro
                    ? `
                      scale-105
                      bg-[#7F0303]
                      text-white
                      shadow-md
                      dark:bg-[#8F1D24]
                      dark:text-[#F8F3EA]
                    `
                    : `
                      border
                      border-[#D4AF37]
                      bg-[#F8F3EA]
                      text-[#7F0303]
                      hover:bg-[#D4AF37]
                      hover:text-white
                      dark:border-[#6B4540]
                      dark:bg-[#241415]
                      dark:text-[#F8F3EA]
                      dark:hover:bg-[#D4AF37]
                      dark:hover:text-[#160B0C]
                    `
                }
              `}
            >
              {nombreFiltro}
            </button>
          ))}
        </div>

        <p
          className="
            mt-6
            text-center
            text-sm
            text-[#0F414A]
            dark:text-[#E3D7D2]
          "
        >
          Mostrando{" "}
          <span className="font-bold">
            {productosFiltrados.length}
          </span>{" "}
          {productosFiltrados.length === 1
            ? "producto"
            : "productos"}{" "}
          en{" "}
          <span className="font-bold">
            {filtro}
          </span>
        </p>
      </section>

      {/* ======================================================
          PRODUCTOS
      ====================================================== */}

      <section className="mx-auto mt-14 max-w-6xl">
        {/* ====================================================
            CARGANDO
        ==================================================== */}

        {cargando ? (
          <div
            className="
              rounded-3xl
              bg-[#F8F3EA]
              px-6
              py-16
              text-center
              shadow-md
              dark:bg-[#241415]
            "
          >
            <p
              className="
                text-xl
                font-semibold
                text-[#7F0303]
                dark:text-[#D4AF37]
              "
            >
              Cargando productos...
            </p>
          </div>
        ) : error ? (
          /* ==================================================
             ERROR
          ================================================== */

          <div
            className="
              rounded-3xl
              bg-[#F8F3EA]
              px-6
              py-16
              text-center
              shadow-md
              dark:bg-[#241415]
            "
          >
            <p
              className="
                text-xl
                font-semibold
                text-[#7F0303]
              "
            >
              No se pudieron cargar los productos.
            </p>

            <p
              className="
                mt-3
                text-sm
                text-black
                dark:text-[#E3D7D2]
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={cargarProductos}
              className="
                mt-5
                rounded-full
                bg-[#7F0303]
                px-6
                py-2
                font-semibold
                text-white
                transition-all
                duration-300
                hover:bg-[#D4AF37]
              "
            >
              Intentar nuevamente
            </button>
          </div>
        ) : productosFiltrados.length > 0 ? (
          /* ==================================================
             MOSTRAR PRODUCTOS
          ================================================== */

          <div
            className="
              grid
              items-stretch
              gap-8
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            
         {productosFiltrados.map((producto) => (
  <ProductoCard
    key={producto.id}
    id={producto.id}
    imagen={obtenerRutaImagen(producto.imagen)}
    titulo={producto.nombre}
    descripcion={producto.descripcion || "Sin descripción"}
    precio={Number(producto.precio)}
    stock={Number(producto.stock) || 0}
  />
))}


          </div>
        ) : filtro === "Todos" ? (
          /* ==================================================
             NO HAY PRODUCTOS ACTIVOS
          ================================================== */

          <div
            className="
              rounded-3xl
              bg-[#F8F3EA]
              px-6
              py-16
              text-center
              shadow-md
              dark:bg-[#241415]
            "
          >
            <p
              className="
                text-xl
                font-semibold
                text-[#7F0303]
                dark:text-[#D4AF37]
              "
            >
              No hay productos disponibles.
            </p>

            <p
              className="
                mt-3
                text-sm
                text-black
                dark:text-[#E3D7D2]
              "
            >
              Los productos activos aparecerán aquí.
            </p>
          </div>
        ) : (
          /* ==================================================
             NO HAY PRODUCTOS EN CATEGORÍA
          ================================================== */

          <div
            className="
              rounded-3xl
              bg-[#F8F3EA]
              px-6
              py-16
              text-center
              shadow-md
              dark:bg-[#241415]
            "
          >
            <p
              className="
                text-xl
                font-semibold
                text-[#7F0303]
                dark:text-[#D4AF37]
              "
            >
              No encontramos productos en esta categoría.
            </p>

            <button
              type="button"
              onClick={() => setFiltro("Todos")}
              className="
                mt-5
                rounded-full
                bg-[#7F0303]
                px-6
                py-2
                font-semibold
                text-white
                transition-all
                duration-300
                hover:bg-[#D4AF37]
                dark:bg-[#8F1D24]
                dark:hover:bg-[#D4AF37]
                dark:hover:text-[#160B0C]
              "
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Productos;