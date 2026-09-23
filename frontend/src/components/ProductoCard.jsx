// ============================================================
// TARJETA DE PRODUCTO
// ============================================================

import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ProductoCard({
  id,
  imagen,
  titulo,
  descripcion,
  precio,
  stock,
}) {
  const {
    agregarAlCarrito,
    aumentarCantidad,
    disminuirCantidad,
    carrito,
  } = useCarrito();

  const { autenticado } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // INFORMACIÓN DEL PRODUCTO
  // ==========================================================

  const productoEnCarrito = carrito.find(
    (producto) => producto.id === id
  );

  const cantidadEnCarrito =
    Number(productoEnCarrito?.cantidad) || 0;

  const stockDisponible = Number(stock) || 0;
  const precioNumerico = Number(precio) || 0;

  const sinStock = stockDisponible <= 0;

  const stockAgotadoEnCarrito =
    cantidadEnCarrito >= stockDisponible;

  const unidadesRestantes = Math.max(
    stockDisponible - cantidadEnCarrito,
    0
  );

  const subtotal =
    precioNumerico * cantidadEnCarrito;

  const precioFormateado = `$${precioNumerico.toLocaleString(
    "es-CO"
  )}`;

  const subtotalFormateado = `$${subtotal.toLocaleString(
    "es-CO"
  )}`;

  // ==========================================================
  // AGREGAR AL CARRITO
  // ==========================================================

  const manejarAgregarCarrito = () => {
    if (sinStock) {
      alert("Este producto no tiene stock disponible.");
      return;
    }

    // --------------------------------------------------------
    // USUARIO NO AUTENTICADO
    // --------------------------------------------------------

    if (!autenticado) {
      const productoPendiente = {
        id,
        nombre: titulo,
        descripcion,
        precio: precioNumerico,
        imagen,
        stock: stockDisponible,
        cantidad: 1,
      };

      localStorage.setItem(
        "productoPendienteMugi",
        JSON.stringify(productoPendiente)
      );

      navigate("/login");
      return;
    }

    // --------------------------------------------------------
    // STOCK COMPLETO
    // --------------------------------------------------------

    if (stockAgotadoEnCarrito) {
      alert(
        "Ya tienes todas las unidades disponibles en el carrito."
      );
      return;
    }

    // --------------------------------------------------------
    // AGREGAR PRODUCTO
    // --------------------------------------------------------

    agregarAlCarrito({
      id,
      nombre: titulo,
      descripcion,
      precio: precioNumerico,
      imagen,
      stock: stockDisponible,
    });
  };

  // ==========================================================
  // AUMENTAR CANTIDAD
  // ==========================================================

  const manejarAumentar = () => {
    if (sinStock) {
      return;
    }

    // --------------------------------------------------------
    // SI NO ESTÁ AUTENTICADO
    // --------------------------------------------------------

    if (!autenticado) {
      manejarAgregarCarrito();
      return;
    }

    // --------------------------------------------------------
    // SI ESTÁ EN 0, LO AGREGAMOS
    // --------------------------------------------------------

    if (cantidadEnCarrito === 0) {
      agregarAlCarrito({
        id,
        nombre: titulo,
        descripcion,
        precio: precioNumerico,
        imagen,
        stock: stockDisponible,
      });
      return;
    }

    // --------------------------------------------------------
    // SI YA ESTÁ EN EL CARRITO, AUMENTAMOS
    // --------------------------------------------------------

    if (stockAgotadoEnCarrito) {
      return;
    }

    aumentarCantidad(id);
  };

  // ==========================================================
  // DISMINUIR CANTIDAD
  // ==========================================================

  const manejarDisminuir = () => {
    if (!autenticado) {
      return;
    }

    if (cantidadEnCarrito <= 0) {
      return;
    }

    disminuirCantidad(id);
  };

  // ==========================================================
  // TEXTO DEL ESTADO
  // ==========================================================

  const textoBoton =
    sinStock
      ? "Sin stock"
      : cantidadEnCarrito > 0
        ? "Producto en el carrito"
        : "Agregar al carrito";

  // ==========================================================
  // PORCENTAJE DEL STOCK
  // ==========================================================

  const porcentajeStock =
    stockDisponible > 0
      ? Math.min(
          (cantidadEnCarrito / stockDisponible) * 100,
          100
        )
      : 0;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[32px]
        border
        border-[#D8BA98]
        bg-[#F8F3EA]
        shadow-sm
        dark:border-[#6B4540]
        dark:bg-[#241415]
        dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)]
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
        dark:hover:border-[#D4AF37]/40
      "
    >
      {/* ======================================================
          IMAGEN
          ====================================================== */}

      <div
        className="
          relative
          h-64
          w-full
          overflow-hidden
          bg-[#EDE3D5]
          dark:bg-[#1C1011]
        "
      >
        <img
          src={imagen}
          alt={titulo}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />

        {/* ETIQUETA DE STOCK */}

        <div
          className="
            absolute
            right-4
            top-4
            rounded-full
            bg-[#F8F3EA]/95
            px-3
            py-1.5
            text-xs
            font-bold
            shadow-md
            backdrop-blur-sm
            dark:bg-[#241415]/95
          "
        >
          {sinStock ? (
            <span className="text-[#7F0303] dark:text-[#F28B82]">
              Agotado
            </span>
          ) : stockAgotadoEnCarrito ? (
            <span className="text-[#7F0303] dark:text-[#D4AF37]">
              Stock máximo
            </span>
          ) : (
            <span className="text-[#0F414A] dark:text-[#E3D7D2]">
              {stockDisponible} disponibles
            </span>
          )}
        </div>

        {/* CANTIDAD EN EL CARRITO */}

        {cantidadEnCarrito > 0 && (
          <div
            className="
              absolute
              left-4
              top-4
              flex
              items-center
              gap-1.5
              rounded-full
              bg-[#7F0303]
              px-3
              py-1.5
              text-xs
              font-bold
              text-white
              shadow-md
            "
          >
            🛒 {cantidadEnCarrito}
          </div>
        )}
      </div>

      {/* ======================================================
          INFORMACIÓN
          ====================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-7
          transition-colors
          duration-300
        "
      >
        {/* CATEGORÍA */}

        <span
          className="
            text-xs
            font-semibold
            uppercase
            tracking-widest
            text-[#D4AF37]
          "
        >
          MUGI. COLLECTION
        </span>

        {/* NOMBRE */}

        <h3
          className="
            mt-2
            min-h-[58px]
            text-2xl
            font-bold
            leading-tight
            text-[#7F0303]
            dark:text-[#F8F3EA]
          "
        >
          {titulo}
        </h3>

        {/* DESCRIPCIÓN */}

        <p
          className="
            mt-3
            min-h-[72px]
            text-sm
            leading-6
            text-[#0F414A]
            dark:text-[#E3D7D2]
          "
        >
          {descripcion}
        </p>

        {/* ====================================================
            INFORMACIÓN DE STOCK
            ==================================================== */}

        <div className="mt-4">
          {sinStock ? (
            <p
              className="
                text-sm
                font-semibold
                text-[#7F0303]
                dark:text-[#F28B82]
              "
            >
              Producto agotado
            </p>
          ) : (
            <>
              <div
                className="
                  flex
                  items-center
                  justify-between
                  text-sm
                "
              >
                <span
                  className="
                    font-medium
                    text-[#0F414A]
                    dark:text-[#E3D7D2]
                  "
                >
                  {cantidadEnCarrito > 0
                    ? "En tu carrito"
                    : "Stock disponible"}
                </span>

                <span
                  className="
                    font-bold
                    text-[#7F0303]
                    dark:text-[#D4AF37]
                  "
                >
                  {cantidadEnCarrito} / {stockDisponible}
                </span>
              </div>

              {/* BARRA DE STOCK */}

              <div
                className="
                  mt-2
                  h-1.5
                  overflow-hidden
                  rounded-full
                  bg-[#D8BA98]/40
                  dark:bg-[#6B4540]
                "
              >
                <div
                  className="
                    h-full
                    rounded-full
                    bg-[#D4AF37]
                    transition-all
                    duration-300
                  "
                  style={{
                    width: `${porcentajeStock}%`,
                  }}
                />
              </div>

              {/* UNIDADES RESTANTES */}

              <p
                className="
                  mt-2
                  text-xs
                  text-[#765E52]
                  dark:text-[#BFAFAA]
                "
              >
                {cantidadEnCarrito > 0
                  ? stockAgotadoEnCarrito
                    ? "Has agregado todo el stock disponible"
                    : `Quedan ${unidadesRestantes} ${
                        unidadesRestantes === 1
                          ? "unidad disponible"
                          : "unidades disponibles"
                      }`
                  : `${stockDisponible} ${
                      stockDisponible === 1
                        ? "unidad disponible"
                        : "unidades disponibles"
                    }`}
              </p>
            </>
          )}
        </div>

        {/* ====================================================
            PRECIO Y CANTIDAD
            ==================================================== */}

        <div className="mt-auto pt-6">
          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            {/* PRECIO */}

            <div>
              <span
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wider
                  text-[#927E70]
                  dark:text-[#BFAFAA]
                "
              >
                Precio
              </span>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-[#B89563]
                  dark:text-[#D4AF37]
                "
              >
                {precioFormateado}
              </p>
            </div>

            {/* ==================================================
                CONTROL DE CANTIDAD
                ================================================== */}

            <div
              className="
                flex
                items-center
                overflow-hidden
                rounded-full
                border
                border-[#D8BA98]
                bg-white
                dark:border-[#6B4540]
                dark:bg-[#1C1011]
              "
            >
              {/* DISMINUIR */}

              <button
                type="button"
                onClick={manejarDisminuir}
                disabled={
                  sinStock ||
                  !autenticado ||
                  cantidadEnCarrito <= 0
                }
                aria-label={`Disminuir cantidad de ${titulo}`}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  text-lg
                  font-bold
                  text-[#7F0303]
                  transition-all
                  hover:bg-[#7F0303]
                  hover:text-white
                  dark:text-[#D4AF37]
                  dark:hover:bg-[#D4AF37]
                  dark:hover:text-[#160B0C]
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                  disabled:hover:bg-transparent
                  disabled:hover:text-[#7F0303]
                "
              >
                −
              </button>

              {/* CANTIDAD */}

              <span
                className="
                  flex
                  h-9
                  min-w-9
                  items-center
                  justify-center
                  border-x
                  border-[#D8BA98]
                  px-2
                  text-sm
                  font-bold
                  text-[#3D1717]
                  dark:border-[#6B4540]
                  dark:text-[#F8F3EA]
                "
              >
                {cantidadEnCarrito}
              </span>

              {/* AUMENTAR */}

              <button
                type="button"
                onClick={manejarAumentar}
                disabled={
                  sinStock ||
                  stockAgotadoEnCarrito
                }
                aria-label={`Aumentar cantidad de ${titulo}`}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  text-lg
                  font-bold
                  text-[#7F0303]
                  transition-all
                  hover:bg-[#7F0303]
                  hover:text-white
                  dark:text-[#D4AF37]
                  dark:hover:bg-[#D4AF37]
                  dark:hover:text-[#160B0C]
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                  disabled:hover:bg-transparent
                  disabled:hover:text-[#7F0303]
                "
              >
                +
              </button>
            </div>
          </div>

          {/* ==================================================
              SUBTOTAL
              ================================================== */}

          {cantidadEnCarrito > 0 ? (
            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-[#D4AF37]/30
                bg-[#D4AF37]/10
                px-4
                py-3
                dark:bg-[#D4AF37]/5
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-[#765E52]
                    dark:text-[#BFAFAA]
                  "
                >
                  Subtotal
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-[#927E70]
                    dark:text-[#BFAFAA]
                  "
                >
                  {cantidadEnCarrito} × {precioFormateado}
                </p>
              </div>

              <span
                className="
                  text-lg
                  font-bold
                  text-[#7F0303]
                  dark:text-[#D4AF37]
                "
              >
                {subtotalFormateado}
              </span>
            </div>
          ) : (
            /* ==================================================
               MENSAJE CUANDO ESTÁ EN CERO
               ================================================== */

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-[#D8BA98]/60
                bg-[#EDE3D5]/50
                px-4
                py-3
                text-center
                dark:border-[#6B4540]
                dark:bg-[#1C1011]
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-[#765E52]
                  dark:text-[#BFAFAA]
                "
              >
                Selecciona la cantidad que deseas
              </p>
            </div>
          )}

          {/* ==================================================
              BOTÓN PRINCIPAL
              ================================================== */}

          <button
            type="button"
            onClick={manejarAgregarCarrito}
            disabled={
              sinStock ||
              stockAgotadoEnCarrito
            }
            className="
              mt-4
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#7F0303]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-[#D4AF37]
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:hover:translate-y-0
              disabled:hover:bg-[#7F0303]
              dark:bg-[#8F1D24]
              dark:hover:bg-[#D4AF37]
              dark:hover:text-[#160B0C]
            "
          >
            {textoBoton}

            {!sinStock &&
              cantidadEnCarrito === 0 && (
                <span className="text-base">
                  🛒
                </span>
              )}
          </button>

          {/* ==================================================
              ESTADO EN CARRITO
              ================================================== */}

          {cantidadEnCarrito > 0 && (
            <p
              className="
                mt-3
                text-center
                text-xs
                font-semibold
                text-[#7F0303]
                dark:text-[#D4AF37]
              "
            >
              ✓ Producto agregado correctamente
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductoCard;