import { useState } from "react";

import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function CarritoMenu({ cerrarCarrito }) {
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    cantidadProductos,
    totalCarrito,
  } = useCarrito();

  const { token, autenticado } = useAuth();

  const [comprando, setComprando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [compraExitosa, setCompraExitosa] = useState(null);

  const formatearPrecio = (precio) => {
    return `$${Number(precio || 0).toLocaleString("es-CO")}`;
  };

  const realizarCompra = async () => {
    setMensajeError("");

    if (!autenticado || !token) {
      setMensajeError(
        "Debes iniciar sesión para realizar una compra."
      );
      return;
    }

    if (carrito.length === 0) {
      setMensajeError("Tu carrito está vacío.");
      return;
    }

    try {
      setComprando(true);

      const detalles = carrito.map((producto) => ({
        producto_id: Number(producto.id),
        cantidad: Number(producto.cantidad),
      }));

      const respuesta = await fetch(`${API_URL}/ventas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          detalles,
        }),
      });

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        let mensaje = "No se pudo completar la compra.";

        if (typeof datos?.detail === "string") {
          mensaje = datos.detail;
        } else if (Array.isArray(datos?.detail)) {
          mensaje = datos.detail
            .map((error) => error.msg)
            .join(", ");
        } else if (typeof datos?.message === "string") {
          mensaje = datos.message;
        }

        throw new Error(mensaje);
      }

      setCompraExitosa({
        numeroFactura:
          datos?.numero_factura || "Sin número",
        subtotal: Number(datos?.subtotal || 0),
        descuento: Number(datos?.descuento || 0),
        impuesto: Number(datos?.impuesto || 0),
        total: Number(
          datos?.total || totalCarrito
        ),
      });

      vaciarCarrito();
    } catch (error) {
      console.error(
        "Error realizando la compra:",
        error
      );

      setMensajeError(
        error.message ||
          "Ocurrió un error al procesar la compra."
      );
    } finally {
      setComprando(false);
    }
  };

  /* ============================================================
     COMPRA EXITOSA
  ============================================================ */

  if (compraExitosa) {
    return (
      <>
        {/* FONDO */}

        <button
          type="button"
          aria-label="Cerrar carrito"
          onClick={cerrarCarrito}
          className="
            fixed
            inset-0
            z-[60]
            cursor-default
            bg-black/40
            backdrop-blur-[2px]
          "
        />

        {/* MENÚ */}

        <aside
          className="
            fixed
            inset-y-0
            right-0
            z-[70]
            flex
            w-full
            max-w-md
            flex-col
            border-l
            border-[#D4AF37]/30
            bg-[#F8F3EA]
            shadow-2xl
            dark:bg-[#241415]
          "
        >
          {/* ENCABEZADO */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-[#D4AF37]/20
              px-6
              py-5
            "
          >
            <div className="flex items-center gap-3">
              <CheckCircle
                size={24}
                className="text-[#1F8A70] dark:text-[#D4AF37]"
              />

              <h2
                className="
                  text-xl
                  font-bold
                  text-[#7F0303]
                  dark:text-[#F8F3EA]
                "
              >
                Compra realizada
              </h2>
            </div>

            <button
              type="button"
              onClick={cerrarCarrito}
              aria-label="Cerrar carrito"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-[#7F0303]
                transition
                hover:bg-[#D4AF37]
                hover:text-white
                dark:text-[#F8F3EA]
                dark:hover:text-[#160B0C]
              "
            >
              <X size={22} />
            </button>
          </div>

          {/* CONTENIDO */}

          <div
            className="
              flex
              flex-1
              flex-col
              items-center
              justify-center
              px-8
              text-center
            "
          >
            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-[#1F8A70]/10
                dark:bg-[#D4AF37]/10
              "
            >
              <CheckCircle
                size={50}
                strokeWidth={1.5}
                className="text-[#1F8A70] dark:text-[#D4AF37]"
              />
            </div>

            <h3
              className="
                mt-6
                text-2xl
                font-bold
                text-[#7F0303]
                dark:text-[#F8F3EA]
              "
            >
              ¡Compra exitosa!
            </h3>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-[#927E70]
                dark:text-[#C8B9B5]
              "
            >
              Tu pedido fue registrado correctamente.
            </p>

            {/* FACTURA */}

            <div
              className="
                mt-6
                w-full
                rounded-2xl
                border
                border-[#D4AF37]/20
                bg-white/60
                p-5
                dark:bg-[#160B0C]/60
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#927E70]
                  dark:text-[#C8B9B5]
                "
              >
                Número de factura
              </p>

              <p
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-[#7F0303]
                  dark:text-[#D4AF37]
                "
              >
                {compraExitosa.numeroFactura}
              </p>

              <div className="mt-4 space-y-3 border-t border-[#D4AF37]/20 pt-4">
                <div className="flex items-center justify-between">
                  <span
                    className="
                      text-sm
                      font-medium
                      text-[#927E70]
                      dark:text-[#C8B9B5]
                    "
                  >
                    Subtotal
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-[#7F0303]
                      dark:text-[#F8F3EA]
                    "
                  >
                    {formatearPrecio(
                      compraExitosa.subtotal
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className="
                      text-sm
                      font-medium
                      text-[#927E70]
                      dark:text-[#C8B9B5]
                    "
                  >
                    Descuento
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-[#7F0303]
                      dark:text-[#F8F3EA]
                    "
                  >
                    {formatearPrecio(
                      compraExitosa.descuento
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className="
                      text-sm
                      font-medium
                      text-[#927E70]
                      dark:text-[#C8B9B5]
                    "
                  >
                    Impuesto
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-[#7F0303]
                      dark:text-[#F8F3EA]
                    "
                  >
                    {formatearPrecio(
                      compraExitosa.impuesto
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[#D4AF37]/20 pt-3">
                  <span
                    className="
                      text-sm
                      font-bold
                      text-[#927E70]
                      dark:text-[#C8B9B5]
                    "
                  >
                    Total pagado
                  </span>

                  <span
                    className="
                      text-xl
                      font-bold
                      text-[#7F0303]
                      dark:text-[#D4AF37]
                    "
                  >
                    {formatearPrecio(
                      compraExitosa.total
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={cerrarCarrito}
                className="
                  mt-7
                  w-full
                  rounded-full
                  bg-[#7F0303]
                  px-6
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#D4AF37]
                  hover:shadow-lg
                  dark:bg-[#8F1D24]
                  dark:hover:bg-[#D4AF37]
                  dark:hover:text-[#160B0C]
                "
              >
                Continuar comprando
              </button>
            </div>
          </div>
        </aside>
      </>
    );
  }

  /* ============================================================
     CARRITO VACÍO
  ============================================================ */

  if (carrito.length === 0) {
    return (
      <>
        <button
          type="button"
          aria-label="Cerrar carrito"
          onClick={cerrarCarrito}
          className="
            fixed
            inset-0
            z-[60]
            cursor-default
            bg-black/40
            backdrop-blur-[2px]
          "
        />

        <aside
          className="
            fixed
            inset-y-0
            right-0
            z-[70]
            flex
            w-full
            max-w-md
            flex-col
            border-l
            border-[#D4AF37]/30
            bg-[#F8F3EA]
            shadow-2xl
            dark:bg-[#241415]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-[#D4AF37]/20
              px-6
              py-5
            "
          >
            <div className="flex items-center gap-3">
              <ShoppingCart
                size={24}
                className="text-[#7F0303] dark:text-[#D4AF37]"
              />

              <h2
                className="
                  text-xl
                  font-bold
                  text-[#7F0303]
                  dark:text-[#F8F3EA]
                "
              >
                Tu carrito
              </h2>
            </div>

            <button
              type="button"
              onClick={cerrarCarrito}
              aria-label="Cerrar carrito"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-[#7F0303]
                transition
                hover:bg-[#D4AF37]
                hover:text-white
                dark:text-[#F8F3EA]
                dark:hover:text-[#160B0C]
              "
            >
              <X size={22} />
            </button>
          </div>

          <div
            className="
              flex
              flex-1
              flex-col
              items-center
              justify-center
              px-8
              text-center
            "
          >
            <ShoppingCart
              size={64}
              strokeWidth={1.3}
              className="text-[#B89563] dark:text-[#D4AF37]"
            />

            <h3
              className="
                mt-5
                text-xl
                font-bold
                text-[#7F0303]
                dark:text-[#F8F3EA]
              "
            >
              Tu carrito está vacío
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-[#927E70]
                dark:text-[#C8B9B5]
              "
            >
              Agrega productos desde nuestra colección para
              comenzar tu compra.
            </p>

            <button
              type="button"
              onClick={cerrarCarrito}
              className="
                mt-6
                rounded-full
                bg-[#7F0303]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#D4AF37]
                dark:bg-[#8F1D24]
                dark:hover:bg-[#D4AF37]
                dark:hover:text-[#160B0C]
              "
            >
              Ver productos
            </button>
          </div>
        </aside>
      </>
    );
  }

  /* ============================================================
     CARRITO CON PRODUCTOS
  ============================================================ */

  return (
    <>
      {/* FONDO */}

      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={cerrarCarrito}
        className="
          fixed
          inset-0
          z-[60]
          cursor-default
          bg-black/40
          backdrop-blur-[2px]
        "
      />

      {/* MENÚ */}

      <aside
        className="
          fixed
          inset-y-0
          right-0
          z-[70]
          flex
          w-full
          max-w-md
          flex-col
          border-l
          border-[#D4AF37]/30
          bg-[#F8F3EA]
          shadow-2xl
          dark:bg-[#241415]
        "
      >
        {/* ENCABEZADO */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-[#D4AF37]/20
            px-6
            py-5
          "
        >
          <div className="flex items-center gap-3">
            <ShoppingCart
              size={24}
              className="text-[#7F0303] dark:text-[#D4AF37]"
            />

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-[#7F0303]
                  dark:text-[#F8F3EA]
                "
              >
                Tu carrito
              </h2>

              <p
                className="
                  text-xs
                  text-[#927E70]
                  dark:text-[#C8B9B5]
                "
              >
                {cantidadProductos}{" "}
                {cantidadProductos === 1
                  ? "producto"
                  : "productos"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cerrarCarrito}
            aria-label="Cerrar carrito"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-[#7F0303]
              transition
              hover:bg-[#D4AF37]
              hover:text-white
              dark:text-[#F8F3EA]
              dark:hover:text-[#160B0C]
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* PRODUCTOS */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-5
            py-5
          "
        >
          <div className="flex flex-col gap-4">
            {carrito.map((producto) => (
              <div
                key={producto.id}
                className="
                  rounded-2xl
                  border
                  border-[#D4AF37]/20
                  bg-white/60
                  p-4
                  dark:bg-[#160B0C]/60
                "
              >
                <div className="flex gap-4">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="
                      h-20
                      w-20
                      shrink-0
                      rounded-xl
                      object-cover
                    "
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="
                          line-clamp-2
                          text-sm
                          font-bold
                          text-[#7F0303]
                          dark:text-[#F8F3EA]
                        "
                      >
                        {producto.nombre}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          eliminarDelCarrito(producto.id)
                        }
                        aria-label={`Eliminar ${producto.nombre}`}
                        className="
                          shrink-0
                          text-[#927E70]
                          transition
                          hover:text-[#7F0303]
                          dark:hover:text-[#D4AF37]
                        "
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-semibold
                        text-[#B89563]
                        dark:text-[#D4AF37]
                      "
                    >
                      {formatearPrecio(producto.precio)}
                    </p>

                    {/* CANTIDAD */}

                    <div className="mt-3 flex items-center justify-between">
                      <div
                        className="
                          flex
                          items-center
                          overflow-hidden
                          rounded-full
                          border
                          border-[#D4AF37]/30
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            disminuirCantidad(producto.id)
                          }
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            text-[#7F0303]
                            transition
                            hover:bg-[#D4AF37]
                            hover:text-white
                            dark:text-[#F8F3EA]
                            dark:hover:text-[#160B0C]
                          "
                        >
                          <Minus size={14} />
                        </button>

                        <span
                          className="
                            flex
                            h-8
                            min-w-9
                            items-center
                            justify-center
                            border-x
                            border-[#D4AF37]/20
                            px-2
                            text-sm
                            font-bold
                            text-[#7F0303]
                            dark:text-[#F8F3EA]
                          "
                        >
                          {producto.cantidad}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            aumentarCantidad(producto.id)
                          }
                          disabled={
                            Number(producto.cantidad) >=
                            Number(producto.stock)
                          }
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            text-[#7F0303]
                            transition
                            hover:bg-[#D4AF37]
                            hover:text-white
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                            dark:text-[#F8F3EA]
                            dark:hover:text-[#160B0C]
                          "
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span
                        className="
                          text-sm
                          font-bold
                          text-[#7F0303]
                          dark:text-[#D4AF37]
                        "
                      >
                        {formatearPrecio(
                          Number(producto.precio) *
                            Number(producto.cantidad)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RESUMEN */}

        <div
          className="
            border-t
            border-[#D4AF37]/20
            bg-[#F8F3EA]
            px-6
            py-5
            dark:bg-[#241415]
          "
        >
          {/* ERROR */}

          {mensajeError && (
            <div
              className="
                mb-4
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-300
                bg-red-50
                p-4
                text-sm
                text-red-700
                dark:border-red-900
                dark:bg-red-950/30
                dark:text-red-300
              "
            >
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p>{mensajeError}</p>
            </div>
          )}

          {/* TOTAL */}

          <div className="flex items-center justify-between">
            <span
              className="
                text-base
                font-semibold
                text-[#927E70]
                dark:text-[#C8B9B5]
              "
            >
              Total
            </span>

            <span
              className="
                text-2xl
                font-bold
                text-[#7F0303]
                dark:text-[#D4AF37]
              "
            >
              {formatearPrecio(totalCarrito)}
            </span>
          </div>

          {/* COMPRAR */}

          <button
            type="button"
            onClick={realizarCompra}
            disabled={comprando}
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#7F0303]
              px-6
              py-3.5
              text-sm
              font-bold
              text-white
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#D4AF37]
              hover:shadow-lg
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
              dark:bg-[#8F1D24]
              dark:hover:bg-[#D4AF37]
              dark:hover:text-[#160B0C]
            "
          >
            {comprando ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Procesando compra...
              </>
            ) : (
              "Comprar"
            )}
          </button>

          {/* VACIAR */}

          <button
            type="button"
            onClick={vaciarCarrito}
            disabled={comprando}
            className="
              mt-3
              w-full
              rounded-full
              border
              border-[#7F0303]/20
              px-6
              py-3
              text-sm
              font-semibold
              text-[#7F0303]
              transition
              hover:bg-[#7F0303]
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-[#D4AF37]/30
              dark:text-[#F8F3EA]
              dark:hover:bg-[#8F1D24]
            "
          >
            Vaciar carrito
          </button>
        </div>
      </aside>
    </>
  );
}

export default CarritoMenu;
