import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const { autenticado } = useAuth();
  const [carrito, setCarrito] = useState(() => {
    try {
      const carritoGuardado = localStorage.getItem("carritoMugi");

      return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    } catch (error) {
      console.error("Error al recuperar el carrito:", error);
      return [];
    }
  });

  // ============================================================
  // GUARDAR CARRITO EN LOCALSTORAGE
  // ============================================================

  useEffect(() => {
    localStorage.setItem("carritoMugi", JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
  if (!autenticado) {
    setCarrito([]);
    localStorage.removeItem("carritoMugi");
  }
}, [autenticado]);

  // ============================================================
  // AGREGAR PRODUCTO
  // ============================================================

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id
      );

      // Si el producto ya existe
      if (productoExistente) {
        // No permitir superar el stock
        if (
          Number(productoExistente.cantidad) >=
          Number(productoExistente.stock)
        ) {
          return carritoActual;
        }

        return carritoActual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
              }
            : item
        );
      }

      // No agregar productos sin stock
      if (Number(producto.stock) <= 0) {
        return carritoActual;
      }

      return [
        ...carritoActual,
        {
          ...producto,
          cantidad: 1,
        },
      ];
    });
  };

  // ============================================================
  // AUMENTAR CANTIDAD
  // ============================================================

  const aumentarCantidad = (id) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) => {
        if (item.id !== id) {
          return item;
        }

        // No superar el stock disponible
        if (Number(item.cantidad) >= Number(item.stock)) {
          return item;
        }

        return {
          ...item,
          cantidad: item.cantidad + 1,
        };
      })
    );
  };

  // ============================================================
  // DISMINUIR CANTIDAD
  // ============================================================

  const disminuirCantidad = (id) => {
    setCarrito((carritoActual) =>
      carritoActual
        .map((item) =>
          item.id === id
            ? {
                ...item,
                cantidad: item.cantidad - 1,
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  // ============================================================
  // ELIMINAR PRODUCTO
  // ============================================================

  const eliminarDelCarrito = (id) => {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== id)
    );
  };

  // ============================================================
  // VACIAR CARRITO
  // ============================================================


const vaciarCarrito = () => {
    // Vaciar el carrito en React
    setCarrito([]);

    // Eliminar el carrito guardado
    localStorage.removeItem("carritoMugi");
};


  // ============================================================
  // CANTIDAD TOTAL DE PRODUCTOS
  // ============================================================

  const cantidadProductos = carrito.reduce(
    (total, producto) => total + producto.cantidad,
    0
  );

  // ============================================================
  // TOTAL DE LA COMPRA
  // ============================================================

  const totalCarrito = carrito.reduce(
    (total, producto) =>
      total + Number(producto.precio) * producto.cantidad,
    0
  );

  // ============================================================
  // VALORES DEL CONTEXTO
  // ============================================================

  const valor = {
    carrito,
    agregarAlCarrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    cantidadProductos,
    totalCarrito,
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <CarritoContext.Provider value={valor}>
      {children}
    </CarritoContext.Provider>
  );
}

// ============================================================
// HOOK useCarrito
// ============================================================

export function useCarrito() {
  const context = useContext(CarritoContext);

  if (!context) {
    throw new Error(
      "useCarrito debe utilizarse dentro de CarritoProvider"
    );
  }

  return context;
}