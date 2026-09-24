import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";

const API_URL = import.meta.env.VITE_API_URL;

function Ruleta() {
  const navigate = useNavigate();
  const { autenticado } = useAuth();
  const { agregarAlCarrito } = useCarrito();
  const [productos, setProductos] = useState([]);
  const [indice, setIndice] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // OBTENER RUTA DE LA IMAGEN
  // ============================================================

  const obtenerRutaImagen = (imagen) => {
    if (!imagen) {
      return "";
    }

    // Si ya es una URL completa
    if (
      imagen.startsWith("http://") ||
      imagen.startsWith("https://")
    ) {
      return imagen;
    }

    // Si ya viene como ruta
    if (imagen.startsWith("/")) {
      return imagen;
    }

    // Si solamente viene el nombre del archivo
    return `/img/${imagen}`;
  };

  // ============================================================
  // OBTENER PRODUCTOS DESDE LA API
  // ============================================================

  const obtenerProductos = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(`${API_URL}/productos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const datos = await respuesta.json();

      console.log("=================================");
      console.log("RESPUESTA DE PRODUCTOS - RULETA");
      console.log("=================================");
      console.log(datos);

      if (!respuesta.ok) {
        throw new Error(
          datos.message || "No se pudieron obtener los productos."
        );
      }

      // La API puede devolver:
      // [...]
      // o { productos: [...] }
      // o { data: [...] }

      const listaProductos = Array.isArray(datos)
        ? datos
        : datos.productos || datos.data || [];

      console.log("Productos de la ruleta:", listaProductos);

      setProductos(listaProductos);
      setIndice(0);
    } catch (error) {
      console.error("Error al obtener productos:", error);

      setError(
        error.message || "No se pudieron cargar los productos."
      );

      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  // ============================================================
  // CARGAR PRODUCTOS AL ENTRAR
  // ============================================================

  useEffect(() => {
    obtenerProductos();
  }, []);

  // ============================================================
  // SIGUIENTE PRODUCTO
  // ============================================================

  const siguiente = () => {
    if (productos.length === 0) {
      return;
    }

    setIndice((prev) => (prev + 1) % productos.length);
  };

  // ============================================================
  // PRODUCTO ANTERIOR
  // ============================================================

  const anterior = () => {
    if (productos.length === 0) {
      return;
    }

    setIndice(
      (prev) => (prev - 1 + productos.length) % productos.length
    );
  };

  const comprar = () => {
    const producto = {
      id: actual.id || actual._id,
      nombre: actual.nombre || actual.titulo || actual.name || "Producto MUGI",
      descripcion: actual.descripcion || actual.description || "",
      precio: Number(actual.precio ?? actual.price ?? 0),
      imagen: obtenerRutaImagen(
        actual.imagen ||
          actual.imagen_url ||
          actual.image ||
          actual.imageUrl ||
          actual.foto ||
          ""
      ),
      stock: Number(actual.stock ?? actual.cantidad ?? 0),
    };

    if (producto.stock <= 0) {
      alert("Este producto no tiene stock disponible.");
      return;
    }

    if (!autenticado) {
      localStorage.setItem(
        "productoPendienteMugi",
        JSON.stringify({ ...producto, cantidad: 1 })
      );
      navigate("/login");
      return;
    }

    agregarAlCarrito(producto);
  };

  // ============================================================
  // CAMBIO AUTOMÁTICO
  // ============================================================

  useEffect(() => {
    if (productos.length <= 1) {
      return;
    }

    const intervalo = setInterval(() => {
      setIndice((prev) => (prev + 1) % productos.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [productos.length]);

  // ============================================================
  // CARGANDO
  // ============================================================

  if (cargando) {
    return (
      <section className="h-full w-full">
        <div className="flex h-[520px] items-center justify-center rounded-[40px] bg-[#7F0303] text-white shadow-[0_25px_70px_rgba(80,40,20,0.18)]">
          <p className="font-serif text-xl">
            Cargando productos...
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // ERROR / SIN PRODUCTOS
  // ============================================================

  if (error || productos.length === 0) {
    return (
      <section className="h-full w-full">
        <div className="flex h-[520px] items-center justify-center rounded-[40px] bg-[#7F0303] px-6 text-center text-white shadow-[0_25px_70px_rgba(80,40,20,0.18)]">
          <div>
            <p className="font-serif text-2xl">
              No hay productos disponibles
            </p>

            <p className="mt-3 text-sm text-white/70">
              {error || "La API no devolvió productos."}
            </p>

            <button
              type="button"
              onClick={obtenerProductos}
              className="mt-5 rounded-full border border-[#D4AF37] bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-[#7F0303] transition-all duration-300 hover:-translate-y-1 hover:bg-[#F8F3EA] hover:shadow-lg"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  const actual = productos[indice];

  // ============================================================
  // IMAGEN
  // ============================================================

  const imagen = obtenerRutaImagen(
    actual.imagen ||
      actual.imagen_url ||
      actual.image ||
      actual.imageUrl ||
      actual.foto ||
      ""
  );

  // ============================================================
  // DATOS DEL PRODUCTO
  // ============================================================

  const titulo =
    actual.nombre ||
    actual.titulo ||
    actual.name ||
    "Producto MUGI";

  const descripcion =
    actual.descripcion ||
    actual.description ||
    "Producto inspirado en el universo de One Piece.";

  const precio =
    actual.precio ??
    actual.price ??
    0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section className="h-full w-full">
      <div
        className="
          relative
          h-[520px]
          overflow-hidden
          rounded-[40px]
          bg-[#7F0303]
          shadow-[0_25px_70px_rgba(80,40,20,0.18)]
        "
      >
        {/* =====================================================
            IMAGEN
        ===================================================== */}

        {imagen ? (
          <img
            key={imagen}
            src={imagen}
            alt={titulo}
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              transition-all
              duration-700
            "
            onError={(e) => {
              console.error(
                "No se pudo cargar la imagen:",
                imagen
              );

              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#52070A]">
            <span className="font-serif text-xl text-[#D4AF37]">
              MUGI STORE
            </span>
          </div>
        )}

        {/* =====================================================
            DEGRADADO PRINCIPAL
        ===================================================== */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-[#3D0101]
            via-[#7F0303]/20
            to-transparent
          "
        />

        {/* =====================================================
            DEGRADADO LATERAL
        ===================================================== */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#3D0101]/45
            via-transparent
            to-transparent
          "
        />

        {/* =====================================================
            MARCO DORADO
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-4
            rounded-[32px]
            border
            border-[#D4AF37]/35
          "
        />

        {/* =====================================================
            CABECERA
        ===================================================== */}

        <div
          className="
            absolute
            left-7
            right-7
            top-7
            z-10
            flex
            items-center
            justify-between
          "
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#D4AF37]" />

            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.35em]
                text-[#F8F3EA]
              "
            >
              Colección MUGI.
            </span>
          </div>

          <span
            className="
              font-serif
              text-sm
              italic
              text-[#D4AF37]
            "
          >
            {String(indice + 1).padStart(2, "0")}
          </span>
        </div>

        {/* =====================================================
            INFORMACIÓN
        ===================================================== */}

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            z-10
            p-7
            pb-12
            md:p-9
            md:pb-12
          "
        >
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.35em]
              text-[#D4AF37]
            "
          >
            Producto destacado
          </p>

          <h2
            className="
              mt-3
              max-w-sm
              font-serif
              text-3xl
              font-bold
              leading-tight
              text-white
              md:text-4xl
            "
          >
            {titulo}
          </h2>

          <p
            className="
              mt-3
              max-w-sm
              text-sm
              leading-relaxed
              text-white/75
            "
          >
            {descripcion}
          </p>

          {/* =================================================
              PRECIO + BOTÓN
          ================================================= */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <span
              className="
                font-serif
                text-xl
                font-semibold
                text-[#D4AF37]
              "
            >
              ${Number(precio).toLocaleString("es-CO")}
            </span>

            <button
              type="button"
              onClick={comprar}
              className="
                rounded-full
                border
                border-[#D4AF37]
                bg-[#D4AF37]
                px-5
                py-2.5
                text-xs
                font-semibold
                text-[#7F0303]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#F8F3EA]
                hover:bg-[#F8F3EA]
                hover:shadow-lg
              "
            >
              Comprar
            </button>
          </div>
        </div>

        {/* =====================================================
            FLECHA ANTERIOR
        ===================================================== */}

        <button
          onClick={anterior}
          type="button"
          aria-label="Producto anterior"
          className="
            absolute
            left-5
            top-1/2
            z-20
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-black/20
            text-lg
            text-white
            backdrop-blur-md
            transition-all
            duration-300
            hover:border-[#D4AF37]
            hover:bg-[#D4AF37]
            hover:text-[#7F0303]
          "
        >
          ←
        </button>

        {/* =====================================================
            FLECHA SIGUIENTE
        ===================================================== */}

        <button
          onClick={siguiente}
          type="button"
          aria-label="Producto siguiente"
          className="
            absolute
            right-5
            top-1/2
            z-20
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-black/20
            text-lg
            text-white
            backdrop-blur-md
            transition-all
            duration-300
            hover:border-[#D4AF37]
            hover:bg-[#D4AF37]
            hover:text-[#7F0303]
          "
        >
          →
        </button>

        {/* =====================================================
            INDICADORES
        ===================================================== */}

        <div
          className="
            absolute
            bottom-5
            left-0
            right-0
            z-20
            flex
            items-center
            justify-center
            gap-2
          "
        >
          {productos.map((producto, i) => (
            <button
              key={producto._id || producto.id || i}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ir al producto ${i + 1}`}
              className={`
                h-1
                rounded-full
                transition-all
                duration-300
                ${
                  i === indice
                    ? "w-8 bg-[#D4AF37]"
                    : "w-2 bg-[#F8F3EA]/50 hover:bg-[#D4AF37]"
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Ruleta;
