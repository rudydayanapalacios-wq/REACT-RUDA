import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  Activity,
  Boxes,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Clock3,
  AlertTriangle,
  ShieldCheck,
  UserRoundCheck,
  UserRound,
  Users,
  Menu,
  X,
  ShoppingCart,
  Receipt,
  MessageCircle,
  BriefcaseBusiness,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import GestionComercial from "./GestionComercial";

const API_URL = "http://127.0.0.1:8000";

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  const { usuario, token, autenticado } = useAuth();

  // ============================================================
  // MENU
  // ============================================================

  const [menuAbierto, setMenuAbierto] = useState(false);

  // ============================================================
  // CLIENTES
  // ============================================================

  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [modalCliente, setModalCliente] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState(null);

  const [formularioCliente, setFormularioCliente] = useState({
    nombres: "",
    apellidos: "",
    tipo_documento: "",
    numero_documento: "",
    direccion: "",
    telefono: "",
    email: "",
    password: "",
    rol_id: 2,
  });

  const [erroresCliente, setErroresCliente] = useState({});

  // ============================================================
  // PRODUCTOS
  // ============================================================

  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [modalProducto, setModalProducto] = useState(false);
  const [editandoProducto, setEditandoProducto] = useState(null);

  const [formularioProducto, setFormularioProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagen: "",
    estado: true,
  });

  const [erroresProducto, setErroresProducto] = useState({});

  // ============================================================
  // DASHBOARD
  // ============================================================

  const [ventas, setVentas] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(true);

  const [pqr, setPqr] = useState([]);
  const [cargandoPqr, setCargandoPqr] = useState(true);

  // ============================================================
  // FILTROS EST13 - DASHBOARD ADMINISTRATIVO
  // ============================================================

  const [filtroFechaInicioDashboard, setFiltroFechaInicioDashboard] =
    useState("");

  const [filtroFechaFinDashboard, setFiltroFechaFinDashboard] =
    useState("");

  const [filtroProductoDashboard, setFiltroProductoDashboard] =
    useState("");

  const [filtroEstadoDashboard, setFiltroEstadoDashboard] =
    useState("");

  const [filtroClienteDashboard, setFiltroClienteDashboard] =
    useState("");

  // ============================================================
  // MENSAJE
  // ============================================================

  const [mensaje, setMensaje] = useState("");

  // ============================================================
  // VISTA ACTUAL
  // ============================================================

  const vista = location.pathname.endsWith("/usuarios")
  ? "usuarios"
  : location.pathname.endsWith("/productos")
    ? "productos"
    : location.pathname.endsWith("/ventas")
      ? "ventas"
      : location.pathname.endsWith("/pqr")
        ? "pqr"
        : "resumen";

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const [paginaProductos, setPaginaProductos] = useState(1);

  const elementosPorPagina = 5;

  // ============================================================
  // IMAGEN
  // ============================================================

  const obtenerRutaImagen = (imagen) => {
    if (!imagen) return null;

    if (
      imagen.startsWith("http://") ||
      imagen.startsWith("https://")
    ) {
      return imagen;
    }

    return `/img/${imagen}`;
  };

  // ============================================================
  // ROL
  // ============================================================

  const obtenerNombreRol = (cliente) => {
    if (cliente?.rol?.nombre) return cliente.rol.nombre;

    if (cliente?.rol?.nombre_rol) return cliente.rol.nombre_rol;

    if (cliente?.rol?.rol) return cliente.rol.rol;

    if (cliente?.rol_nombre) return cliente.rol_nombre;

    if (cliente?.nombre_rol) return cliente.nombre_rol;

    const rolId = Number(
      cliente?.rol_id ??
        cliente?.rol?.id ??
        cliente?.rol?.rol_id
    );

    if (rolId === 1) return "Administrador";
    if (rolId === 2) return "Cliente";
    if (rolId === 3) return "Empleado";

    return "Sin rol";
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioMugi");

    setMenuAbierto(false);

    navigate("/login", { replace: true });
  };

  // ============================================================
  // NAVEGAR
  // ============================================================

  const navegar = (ruta) => {
    setMenuAbierto(false);
    navigate(ruta);
  };

  // ============================================================
  // INDICADORES DEL DASHBOARD
  // ============================================================

  const totalUsuarios = clientes.length;

  const totalProductos = productos.length;

  const clientesActivos = clientes.filter(
    (cliente) =>
      cliente.estado === true ||
      cliente.estado === "activo" ||
      cliente.estado === "Activo"
  ).length;

  const totalVentas = ventas.length;

  const totalFacturacion = ventas.reduce(
    (total, venta) => total + Number(venta.total || 0),
    0
  );

  // ============================================================
  // FORMATEAR MONEDA
  // ============================================================

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor);

  // ============================================================
  // CARGAR USUARIOS
  // ============================================================

  const cargarClientes = async (
    tokenActual = localStorage.getItem("token")
  ) => {
    if (!tokenActual) return;

    try {
      setCargandoClientes(true);

      const respuesta = await fetch(
        `${API_URL}/usuarios`,
        {
          headers: {
            Authorization: `Bearer ${tokenActual}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail ||
            datos.message ||
            "Error al obtener usuarios."
        );
      }

      setClientes(
        Array.isArray(datos)
          ? datos
          : datos.usuarios || []
      );
    } catch (error) {
      console.error("Error usuarios:", error);
      setMensaje(error.message);
    } finally {
      setCargandoClientes(false);
    }
  };

  // ============================================================
  // CARGAR PRODUCTOS
  // ============================================================

  const cargarProductos = async (
    tokenActual = localStorage.getItem("token")
  ) => {
    if (!tokenActual) return;

    try {
      setCargandoProductos(true);

      const respuesta = await fetch(
        `${API_URL}/productos`,
        {
          headers: {
            Authorization: `Bearer ${tokenActual}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail ||
            datos.message ||
            "Error al obtener productos."
        );
      }

      setProductos(
        Array.isArray(datos)
          ? datos
          : datos.productos || []
      );
    } catch (error) {
      console.error("Error productos:", error);
      setMensaje(error.message);
    } finally {
      setCargandoProductos(false);
    }
  };

  // ============================================================
  // CARGAR VENTAS
  // ============================================================

  const cargarVentas = async (
    tokenActual = localStorage.getItem("token")
  ) => {
    if (!tokenActual) return;

    try {
      setCargandoVentas(true);

      const respuesta = await fetch(
        `${API_URL}/ventas`,
        {
          headers: {
            Authorization: `Bearer ${tokenActual}`,
          },
        }
      );

      if (!respuesta.ok) {
        console.warn(
          "No se pudieron cargar las ventas del Dashboard."
        );

        setVentas([]);
        return;
      }

      const datos = await respuesta.json();

      setVentas(
        Array.isArray(datos)
          ? datos
          : datos.ventas || []
      );
    } catch (error) {
      console.warn(
        "Error al cargar ventas del Dashboard:",
        error
      );

      setVentas([]);
    } finally {
      setCargandoVentas(false);
    }
  };

  // ============================================================
  // CARGAR PQR
  // ============================================================

  const cargarPqr = async (
    tokenActual = localStorage.getItem("token")
  ) => {
    if (!tokenActual) return;

    try {
      setCargandoPqr(true);

      const respuesta = await fetch(
        `${API_URL}/pqr`,
        {
          headers: {
            Authorization: `Bearer ${tokenActual}`,
          },
        }
      );

      // Si todavía no existe PQR en el backend,
      // no rompemos el Dashboard.
      if (!respuesta.ok) {
        setPqr([]);
        return;
      }

      const datos = await respuesta.json();

      setPqr(
        Array.isArray(datos)
          ? datos
          : datos.pqr ||
              datos.PQR ||
              datos.pqrs ||
              []
      );
    } catch (error) {
      console.warn(
        "PQR todavía no disponible:",
        error
      );

      setPqr([]);
    } finally {
      setCargandoPqr(false);
    }
  };

  // ============================================================
  // CARGA GENERAL
  // ============================================================

  useEffect(() => {
    if (!autenticado || !usuario || !token) {
      navigate("/login", { replace: true });
      return;
    }

    const rol = Number(
      usuario?.rol_id ??
        usuario?.rol?.id ??
        usuario?.rol?.rol_id
    );

    if (rol !== 1) {
      navigate("/", { replace: true });
      return;
    }

    cargarClientes(token);
    cargarProductos(token);
    cargarVentas(token);
    cargarPqr(token);
  }, [
    autenticado,
    usuario,
    token,
    navigate,
  ]);

  // ============================================================
  // CLIENTES - CREAR
  // ============================================================

  const abrirCrearCliente = () => {
    setEditandoCliente(null);

    setFormularioCliente({
      nombres: "",
      apellidos: "",
      tipo_documento: "",
      numero_documento: "",
      direccion: "",
      telefono: "",
      email: "",
      password: "",
      rol_id: 2,
    });

    setModalCliente(true);
  };

  // ============================================================
  // CLIENTES - EDITAR
  // ============================================================

  const abrirEditarCliente = (cliente) => {
    setEditandoCliente(cliente);

    setFormularioCliente({
      nombres: cliente.nombres || "",
      apellidos: cliente.apellidos || "",
      tipo_documento:
        cliente.tipo_documento || "",
      numero_documento:
        cliente.numero_documento || "",
      direccion: cliente.direccion || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      password: "",
      rol_id: Number(
        cliente.rol_id ||
          cliente.rol?.id ||
          cliente.rol?.rol_id ||
          2
      ),
    });

    setModalCliente(true);
  };

  // ============================================================
  // CLIENTES - INPUT
  // ============================================================

  const manejarCambioCliente = (e) => {
    setFormularioCliente({
      ...formularioCliente,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================================
  // CLIENTES - GUARDAR
  // ============================================================

  // ============================================================
// CLIENTES - GUARDAR
// ============================================================

const guardarCliente = async (e) => {
  e.preventDefault();

  // VALIDACIONES
  const nombres = formularioCliente.nombres.trim();
  const apellidos = formularioCliente.apellidos.trim();
  const tipoDocumento = formularioCliente.tipo_documento.trim();
  const numeroDocumento = formularioCliente.numero_documento.trim();
  const direccion = formularioCliente.direccion.trim();
  const telefono = formularioCliente.telefono.trim();
  const email = formularioCliente.email.trim();
  const password = formularioCliente.password.trim();

  if (!nombres) {
    setMensaje("Los nombres son obligatorios.");
    return;
  }

  if (nombres.length < 2) {
    setMensaje("Los nombres deben tener mínimo 2 caracteres.");
    return;
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(nombres)) {
    setMensaje("Los nombres solo pueden contener letras y espacios.");
    return;
  }

  if (!apellidos) {
    setMensaje("Los apellidos son obligatorios.");
    return;
  }

  if (apellidos.length < 2) {
    setMensaje("Los apellidos deben tener mínimo 2 caracteres.");
    return;
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(apellidos)) {
    setMensaje("Los apellidos solo pueden contener letras y espacios.");
    return;
  }

  if (!tipoDocumento) {
    setMensaje("Debes seleccionar un tipo de documento.");
    return;
  }

  if (!numeroDocumento) {
    setMensaje("El número de documento es obligatorio.");
    return;
  }

  if (!/^[0-9]+$/.test(numeroDocumento)) {
    setMensaje("El número de documento solo puede contener números.");
    return;
  }

  if (numeroDocumento.length < 6 || numeroDocumento.length > 15) {
    setMensaje("El número de documento debe tener entre 6 y 15 números.");
    return;
  }

  if (!direccion) {
    setMensaje("La dirección es obligatoria.");
    return;
  }

  if (direccion.length < 5) {
    setMensaje("La dirección debe tener mínimo 5 caracteres.");
    return;
  }

  if (!telefono) {
    setMensaje("El teléfono es obligatorio.");
    return;
  }

  if (!/^[0-9]+$/.test(telefono)) {
    setMensaje("El teléfono solo puede contener números.");
    return;
  }

  if (telefono.length < 7 || telefono.length > 15) {
    setMensaje("El teléfono debe tener entre 7 y 15 números.");
    return;
  }

  if (!email) {
    setMensaje("El correo electrónico es obligatorio.");
    return;
  }

  const correoValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!correoValido) {
    setMensaje("Ingresa un correo electrónico válido.");
    return;
  }

  // La contraseña solo es obligatoria al CREAR.
  if (!editandoCliente && !password) {
    setMensaje("La contraseña es obligatoria.");
    return;
  }

  if (!editandoCliente && (password.length < 8 || password.length > 72)) {
    setMensaje("La contraseña debe tener entre 8 y 72 caracteres.");
    return;
  }

  const tokenActual = localStorage.getItem("token");

  try {
    const url = editandoCliente
      ? `${API_URL}/usuarios/${editandoCliente.id}`
      : `${API_URL}/usuarios`;

    const metodo = editandoCliente
      ? "PUT"
      : "POST";

    const cuerpo = {
      nombres,
      apellidos,
      tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento,
      direccion,
      telefono,
      email,
      rol_id: Number(formularioCliente.rol_id),
    };

    if (!editandoCliente) {
      cuerpo.password = password;
    }

    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenActual}`,
      },
      body: JSON.stringify(cuerpo),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.detail ||
          datos.message ||
          "No se pudo guardar el cliente."
      );
    }

    setMensaje(
      editandoCliente
        ? "Cliente actualizado correctamente."
        : "Cliente creado correctamente."
    );

    setModalCliente(false);

    await cargarClientes(tokenActual);
  } catch (error) {
    console.error(error);
    setMensaje(error.message);
  }
};
  // ============================================================
  // CLIENTES - ESTADO
  // ============================================================

  const cambiarEstadoCliente = async (
    cliente
  ) => {
    const tokenActual =
      localStorage.getItem("token");

    try {
      const respuesta = await fetch(
        `${API_URL}/usuarios/${cliente.id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenActual}`,
          },
          body: JSON.stringify({
            estado: !cliente.estado,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail ||
            datos.message ||
            "Error al cambiar estado."
        );
      }

      await cargarClientes(tokenActual);

      setMensaje(
        "Estado del cliente actualizado correctamente."
      );
    } catch (error) {
      console.error(error);
      setMensaje(error.message);
    }
  };

  // ============================================================
  // CLIENTES - ELIMINAR
  // ============================================================

  const eliminarCliente = async (
    cliente
  ) => {
    const confirmar = window.confirm(
      `¿Eliminar al cliente ${cliente.nombres} ${cliente.apellidos}?`
    );

    if (!confirmar) return;

    const tokenActual =
      localStorage.getItem("token");

    try {
      const respuesta = await fetch(
        `${API_URL}/usuarios/${cliente.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tokenActual}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail ||
            datos.message ||
            "Error al eliminar cliente."
        );
      }

      await cargarClientes(tokenActual);

      setMensaje(
        datos.message ||
          "Cliente eliminado correctamente."
      );
    } catch (error) {
      console.error(
        "Error al eliminar cliente:",
        error
      );

      setMensaje(error.message);
    }
  };

  // ============================================================
  // PRODUCTOS - CREAR
  // ============================================================

  const abrirCrearProducto = () => {
    setEditandoProducto(null);

    setFormularioProducto({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      imagen: "",
      estado: true,
    });

    setModalProducto(true);
  };

  // ============================================================
  // PRODUCTOS - EDITAR
  // ============================================================

  const abrirEditarProducto = (
    producto
  ) => {
    setEditandoProducto(producto);

    setFormularioProducto({
      nombre: producto.nombre || "",
      descripcion:
        producto.descripcion || "",
      precio: producto.precio ?? "",
      stock: producto.stock ?? "",
      imagen: producto.imagen || "",
      estado: Boolean(producto.estado),
    });

    setModalProducto(true);
  };

  // ============================================================
  // PRODUCTOS - INPUT
  // ============================================================

  const manejarCambioProducto = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormularioProducto({
      ...formularioProducto,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  // ============================================================
  // PRODUCTOS - GUARDAR
  // ============================================================

  // ============================================================
// PRODUCTOS - GUARDAR
// ============================================================

const guardarProducto = async (e) => {
  e.preventDefault();

  // VALIDACIONES
  const nombre = formularioProducto.nombre.trim();
  const descripcion = formularioProducto.descripcion?.trim() || "";
  const imagen = formularioProducto.imagen?.trim() || "";

  if (!nombre) {
    setMensaje("El nombre del producto es obligatorio.");
    return;
  }

  if (nombre.length < 2) {
    setMensaje("El nombre del producto debe tener mínimo 2 caracteres.");
    return;
  }

  if (nombre.length > 100) {
    setMensaje("El nombre del producto no puede superar 100 caracteres.");
    return;
  }

  if (!descripcion) {
    setMensaje("La descripción del producto es obligatoria.");
    return;
  }

  if (descripcion.length < 5) {
    setMensaje("La descripción debe tener mínimo 5 caracteres.");
    return;
  }

  if (descripcion.length > 500) {
    setMensaje("La descripción no puede superar 500 caracteres.");
    return;
  }

  const precio = Number(formularioProducto.precio);
  const stock = Number(formularioProducto.stock);

  if (
    formularioProducto.precio === "" ||
    Number.isNaN(precio)
  ) {
    setMensaje("El precio es obligatorio.");
    return;
  }

  if (precio <= 0) {
    setMensaje("El precio debe ser mayor que 0.");
    return;
  }

  if (!Number.isFinite(precio)) {
    setMensaje("Ingresa un precio válido.");
    return;
  }

  if (
    formularioProducto.stock === "" ||
    Number.isNaN(stock)
  ) {
    setMensaje("El stock es obligatorio.");
    return;
  }

  if (!Number.isInteger(stock)) {
    setMensaje("El stock debe ser un número entero.");
    return;
  }

  if (stock < 0) {
    setMensaje("El stock no puede ser negativo.");
    return;
  }

  if (imagen) {
    const imagenValida =
      /^(https?:\/\/|\/|\.\/).+/i.test(imagen);

    if (!imagenValida) {
      setMensaje("La imagen debe contener una URL o una ruta válida.");
      return;
    }
  }

  const tokenActual = localStorage.getItem("token");

  try {
    const url = editandoProducto
      ? `${API_URL}/productos/${editandoProducto.id}`
      : `${API_URL}/productos`;

    const metodo = editandoProducto
      ? "PUT"
      : "POST";

    const cuerpo = {
      nombre,
      descripcion,
      precio,
      stock,
      imagen,
      estado: formularioProducto.estado,
    };

    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenActual}`,
      },
      body: JSON.stringify(cuerpo),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.detail ||
          datos.message ||
          "No se pudo guardar el producto."
      );
    }

    setMensaje(
      editandoProducto
        ? "Producto actualizado correctamente."
        : "Producto creado correctamente."
    );

    setModalProducto(false);

    await cargarProductos(tokenActual);
  } catch (error) {
    console.error(error);
    setMensaje(error.message);
  }
};

  // ============================================================
  // PRODUCTOS - CAMBIAR ESTADO
  // ============================================================

  const cambiarEstadoProducto = async (
    producto
  ) => {
    const tokenActual =
      localStorage.getItem("token");

    try {
      const respuesta = await fetch(
        `${API_URL}/productos/${producto.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenActual}`,
          },
          body: JSON.stringify({
            nombre: producto.nombre,
            descripcion:
              producto.descripcion,
            precio: Number(producto.precio),
            stock: Number(producto.stock),
            imagen: producto.imagen,
            estado: !producto.estado,
          }),
        }
      );

      const datos =
        respuesta.status === 204
          ? null
          : await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos?.detail ||
            datos?.message ||
            "Error al cambiar estado."
        );
      }

      await cargarProductos(tokenActual);

      setMensaje(
        "Estado del producto actualizado correctamente."
      );
    } catch (error) {
      console.error(error);
      setMensaje(error.message);
    }
  };

  // ============================================================
  // PRODUCTOS - ELIMINAR
  // ============================================================

  const eliminarProducto = async (
    producto
  ) => {
    const confirmar = window.confirm(
      `¿Eliminar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    const tokenActual =
      localStorage.getItem("token");

    try {
      const respuesta = await fetch(
        `${API_URL}/productos/${producto.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tokenActual}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail ||
            datos.message ||
            "Error al eliminar producto."
        );
      }

      await cargarProductos(tokenActual);

      setMensaje(
        "Producto eliminado correctamente."
      );
    } catch (error) {
      console.error(error);
      setMensaje(error.message);
    }
  };

  // ============================================================
  // DATOS DEL DASHBOARD
  // ============================================================


  const totalFacturas = ventas.filter(
    (venta) =>
      venta?.numero_factura ||
      venta?.factura ||
      venta?.numeroFactura
  ).length;

  const totalPqr = pqr.length;

  const pqrPendientes = pqr.filter(
    (item) => {
      const estado = String(
        item?.estado ||
          item?.status ||
          ""
      ).toLowerCase();

      return (
        estado === "pendiente" ||
        estado === "pending" ||
        estado === "abierta" ||
        estado === "abierto"
      );
    }
  ).length;

  const usuariosActivos =
    clientes.filter(
      (cliente) => cliente.estado
    ).length;

  const productosActivos =
    productos.filter(
      (producto) => producto.estado
    ).length;


    // ============================================================
// DATOS DEL DASHBOARD DE VENTAS - EST11
// ============================================================

const ingresosVentasDashboard = ventas.reduce(
  (total, venta) =>
    total + (Number(venta?.total) || 0),
  0
);

const ticketPromedioDashboard =
  totalVentas > 0
    ? ingresosVentasDashboard / totalVentas
    : 0;

const ventasPorDia = ventas.reduce(
  (acumulado, venta) => {
    if (!venta?.fecha) return acumulado;

    const fecha = new Date(venta.fecha);

    if (Number.isNaN(fecha.getTime())) {
      return acumulado;
    }

    const clave = fecha.toISOString().slice(0, 10);

    if (!acumulado[clave]) {
      acumulado[clave] = {
        fecha: clave,
        nombre: fecha.toLocaleDateString(
          "es-CO",
          {
            day: "2-digit",
            month: "2-digit",
          }
        ),
        ventas: 0,
        ingresos: 0,
      };
    }

    acumulado[clave].ventas += 1;
    acumulado[clave].ingresos +=
      Number(venta?.total) || 0;

    return acumulado;
  },
  {}
);

const datosVentasPorDia = Object.values(
  ventasPorDia
).sort((a, b) =>
  a.fecha.localeCompare(b.fecha)
);

  // ============================================================
  // SESIÓN CARGANDO
  // ============================================================

  if (!autenticado || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFE8DF]">
        <p className="font-semibold text-[#7F0303]">
          Verificando acceso...
        </p>
      </div>
    );
  }

  // ============================================================
  // PANEL
  // ============================================================

  return (
    <section className="min-h-screen bg-[#EFE8DF] text-[#2C1B1B]">

      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR DESKTOP
        ====================================================== */}

        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#D4AF37]/10 bg-[#4A0505] p-5 text-[#F8F3EA] lg:flex">

          <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-5">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1">

              <img
                src="/img/logo.png"
                alt="Logo SENA"
                className="h-full w-full object-contain"
              />

            </div>

            <div>

              <p className="font-serif text-xl font-bold tracking-wide">
                MUGI
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                Panel de Admin
              </p>

            </div>

          </div>

          <nav className="flex-1 space-y-7 overflow-y-auto">

            <div>

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                Vista general
              </p>

              <button
                type="button"
                onClick={() =>
                  navegar("/admin")
                }
                className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-semibold transition ${
                  vista === "resumen"
                    ? "border-[#D4AF37] bg-white/10 text-white"
                    : "border-transparent text-white/65 hover:border-white/20 hover:bg-white/5 hover:text-white"
                }`}
              >
                <LayoutDashboard size={18} />
                Resumen
              </button>

            </div>

            <div>

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                Operación
              </p>

              <button
                type="button"
                onClick={() =>
                  navegar("/admin/usuarios")
                }
                className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-semibold transition ${
                  vista === "usuarios"
                    ? "border-[#D4AF37] bg-white/10 text-white"
                    : "border-transparent text-white/65 hover:border-white/20 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Users size={18} />
                Cuentas
              </button>

            </div>

            <div>

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                Catálogo
              </p>

              <button
                type="button"
                onClick={() =>
                  navegar("/admin/productos")
                }
                className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-semibold transition ${
                  vista === "productos"
                    ? "border-[#D4AF37] bg-white/10 text-white"
                    : "border-transparent text-white/65 hover:border-white/20 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Boxes size={18} />
                Productos
              </button>

            </div>

            <div>

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                Comercial
              </p>

              <button
                type="button"
                onClick={() =>
                  navegar("/admin/ventas")
                }
                className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-semibold transition ${
                  vista === "ventas"
                    ? "border-[#D4AF37] bg-white/10 text-white"
                    : "border-transparent text-white/65 hover:border-white/20 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FileText size={18} />
                Ventas
              </button>

            </div>


            <div>
  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]/60">
    Atención
  </p>

  <button
    type="button"
    onClick={() => navegar("/admin/pqr")}
    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
      vista === "pqr"
        ? "bg-[#D4AF37] text-[#4A0505]"
        : "text-[#F8F3EA]/80 hover:bg-white/10 hover:text-[#F8F3EA]"
    }`}
  >
    <MessageCircle size={18} />
    PQR
  </button>
</div>

            <div>

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                Cuenta
              </p>

              <button
                type="button"
                onClick={() =>
                  navegar("/perfil")
                }
                className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm font-semibold text-white/65 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                <UserRound size={18} />
                Editar perfil
              </button>

              <button
                type="button"
                onClick={() =>
                  navegar("/")
                }
                className="mt-1 flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm font-semibold text-white/65 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                <Home size={18} />
                Ir a inicio
              </button>

            </div>

          </nav>

          <div className="mt-6 border-t border-white/10 pt-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-[#4A0505]">
                {(usuario?.nombres?.[0] || "A").toUpperCase()}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-white">
                  {usuario?.nombres || "Administrador"}
                </p>

                <p className="truncate text-xs text-white/45">
                  {obtenerNombreRol(usuario)}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={cerrarSesion}
              className="mt-4 flex w-full items-center justify-center gap-2 border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-[#D4AF37]/40 hover:bg-white/5 hover:text-white"
            >
              <LogOut size={17} />
              Cerrar sesión
            </button>

          </div>

        </aside>

        {/* =====================================================
            ÁREA PRINCIPAL
        ====================================================== */}

        <div className="min-w-0 flex-1">

          {/* HEADER MÓVIL */}

          <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[#D8BA98] bg-[#F8F3EA] px-4 py-4 shadow-sm lg:hidden">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1">

                <img
                  src="/img/logo-sena.png"
                  alt="Logo SENA"
                  className="h-full w-full object-contain"
                />

              </div>

              <div>

                <p className="font-serif text-lg font-bold text-[#4A0505]">
                  MUGI
                </p>

                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#927E70]">
                  Administrador
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setMenuAbierto(!menuAbierto)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8BA98] bg-white text-[#7F0303]"
              aria-label="Abrir menú"
            >
              {menuAbierto ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

          </div>

          {/* MENÚ MÓVIL */}

          {menuAbierto && (
            <div className="fixed inset-x-0 top-[73px] z-50 border-b border-[#D8BA98] bg-[#4A0505] p-4 text-[#F8F3EA] shadow-2xl lg:hidden">

              <div className="space-y-1">

                <button
                  type="button"
                  onClick={() =>
                    navegar("/admin")
                  }
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold ${
                    vista === "resumen"
                      ? "bg-white/10 text-white"
                      : "text-white/70"
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Resumen
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navegar("/admin/usuarios")
                  }
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold ${
                    vista === "usuarios"
                      ? "bg-white/10 text-white"
                      : "text-white/70"
                  }`}
                >
                  <Users size={18} />
                  Cuentas
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navegar("/admin/productos")
                  }
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold ${
                    vista === "productos"
                      ? "bg-white/10 text-white"
                      : "text-white/70"
                  }`}
                >
                  <Boxes size={18} />
                  Productos
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navegar("/admin/ventas")
                  }
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold ${
                    vista === "ventas"
                      ? "bg-white/10 text-white"
                      : "text-white/70"
                  }`}
                >
                  <FileText size={18} />
                  Ventas
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navegar("/perfil")
                  }
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-white/70"
                >
                  <UserRound size={18} />
                  Editar perfil
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navegar("/")
                  }
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-white/70"
                >
                  <Home size={18} />
                  Ir a inicio
                </button>

                <div className="my-2 border-t border-white/10" />

                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-[#D4AF37]"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>

              </div>

            </div>
          )}

          {/* =================================================
              CONTENIDO
          ================================================== */}

          <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 md:px-8 lg:px-10 lg:py-8">

            {/* HEADER */}

            <div className="mb-8 flex flex-col gap-4 border-b border-[#D8BA98] pb-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#927E70]">
                  Área administrativa
                </p>

                <p className="mt-1 text-sm text-[#927E70]">
                  Gestión general de MUGI STORE
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    navegar("/")
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2.5 text-sm font-semibold text-[#7F0303] shadow-sm transition hover:border-[#D4AF37] hover:bg-white"
                >
                  <Home size={17} />
                  Inicio
                </button>

                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#7F0303] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5F0202]"
                >
                  <LogOut size={17} />
                  Cerrar sesión
                </button>

              </div>

            </div>

            {/* TÍTULO */}

            {vista !== "ventas" && (
              <div className="mb-8 border-b border-[#D8BA98] pb-8 sm:mb-10">

                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                  MUGI STORE
                </span>

                <h1 className="mt-3 font-serif text-3xl font-bold text-[#7F0303] sm:text-4xl">
                  Panel de Administrador
                </h1>

                <p className="mt-3 text-[#2C1B1B]">
                  Bienvenido,{" "}
                  {usuario.nombres ||
                    usuario.nombre ||
                    "Administrador"}
                  .
                </p>

                <p className="mt-1 text-sm font-semibold text-[#7F0303]">
                  Rol: {obtenerNombreRol(usuario)}
                </p>

              </div>
            )}

            {/* MENSAJE */}

            {mensaje && (
              <div className="mb-8 flex items-center justify-between gap-4 border-l-4 border-[#7F0303] bg-[#F8F3EA] px-5 py-4 text-sm font-medium text-[#241415] shadow-sm">

                <p>{mensaje}</p>

                <button
                  type="button"
                  onClick={() =>
                    setMensaje("")
                  }
                  className="shrink-0 text-[#241415] transition hover:text-[#7F0303]"
                >
                  ✕
                </button>

              </div>
            )}

            {/* =================================================
                VENTAS
            ================================================== */}

            {vista === "ventas" && (
              <div className="overflow-hidden">

                <div className="mb-6">

                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Comercial
                  </p>

                  <h1 className="mt-2 font-serif text-3xl font-bold text-[#7F0303] sm:text-4xl">
                    Ventas
                  </h1>

                  <p className="mt-2 text-sm text-[#927E70]">
                    Consulta y administra las operaciones
                    comerciales de MUGI STORE.
                  </p>

                </div>

                <div className="rounded-[28px] border border-[#D8BA98] bg-[#F8F3EA] p-1 shadow-sm">

                  <GestionComercial />

                </div>

              </div>
            )}




            {vista === "pqr" && (
  <div className="space-y-6">
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
        Atención
      </p>

      <h1 className="mt-2 font-serif text-3xl font-bold text-[#7F0303] sm:text-4xl">
        PQR
      </h1>

      <p className="mt-2 text-sm text-[#927E70]">
        Consulta y administra las peticiones, quejas y reclamos recibidos.
      </p>
    </div>

    <div className="overflow-hidden rounded-[28px] border border-[#D8BA98] bg-[#F8F3EA] shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#4A0505] text-[#F8F3EA]">
            <tr>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                ID
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                Asunto
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                Estado
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                Fecha
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E3D7C8]">
            {cargandoPqr ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-12 text-center text-[#927E70]"
                >
                  Cargando PQR...
                </td>
              </tr>
            ) : pqr.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-12 text-center text-[#927E70]"
                >
                  No hay PQR registradas.
                </td>
              </tr>
            ) : (
              pqr.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-[#EFE8DF]"
                >
                  <td className="px-5 py-4 font-bold text-[#7F0303]">
                    #{item.id}
                  </td>

                  <td className="px-5 py-4 capitalize">
                    {item.tipo}
                  </td>

                  <td className="px-5 py-4 font-semibold">
                    {item.asunto}
                  </td>

                  <td className="max-w-md px-5 py-4 text-[#927E70]">
                    {item.descripcion}
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={item.estado || "pendiente"}
                      onChange={(e) =>
                        actualizarEstadoPqr(
                          item.id,
                          e.target.value
                        )
                      }
                      className="rounded-lg border border-[#D8BA98] bg-white px-3 py-2 text-xs font-bold text-[#7F0303] outline-none focus:border-[#7F0303]"
                    >
                      <option value="pendiente">
                        Pendiente
                      </option>
                      <option value="en proceso">
                        En proceso
                      </option>
                      <option value="resuelta">
                        Resuelta
                      </option>
                      <option value="cerrada">
                        Cerrada
                      </option>
                    </select>
                  </td>

                  <td className="px-5 py-4 text-[#927E70]">
                    {item.fecha
                      ? new Date(item.fecha).toLocaleDateString(
                          "es-CO"
                        )
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

            {/* =================================================
                DASHBOARD / RESUMEN
            ================================================== */}

            {vista === "resumen" && (
              <div className="space-y-8">

                {/* HERO */}

                <div className="overflow-hidden rounded-[28px] bg-[#4A0505] p-6 text-[#F8F3EA] shadow-[0_18px_45px_rgba(61,23,23,0.12)] sm:p-8">

                  <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">

                    <div>

                      <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">

                        <Activity size={15} />

                        Centro de operaciones

                      </div>

                      <h2 className="max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl">
                        Todo lo importante, en un solo lugar.
                      </h2>

                      <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">
                        Dashboard administrativo de MUGI STORE
                        con información consolidada de usuarios,
                        productos, ventas, facturación y PQR.
                      </p>

                    </div>

                    <div className="border-l border-white/10 pl-6 lg:min-w-[190px]">

                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Fecha actual
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        {new Date().toLocaleDateString(
                          "es-CO",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">

                    <button
                      type="button"
                      onClick={() =>
                        navegar("/admin/usuarios")
                      }
                      className="flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold transition hover:border-[#D4AF37]/40 hover:bg-white/10"
                    >
                      <span className="flex items-center gap-3">
                        <Users size={18} />
                        Gestionar cuentas
                      </span>

                      <span>→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navegar("/admin/productos")
                      }
                      className="flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold transition hover:border-[#D4AF37]/40 hover:bg-white/10"
                    >
                      <span className="flex items-center gap-3">
                        <Boxes size={18} />
                        Gestionar productos
                      </span>

                      <span>→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navegar("/admin/ventas")
                      }
                      className="flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold transition hover:border-[#D4AF37]/40 hover:bg-white/10"
                    >
                      <span className="flex items-center gap-3">
                        <FileText size={18} />
                        Revisar ventas
                      </span>

                      <span>→</span>
                    </button>

                  </div>

                </div>

                {/* =================================================
                    CARDS EST10
                ================================================== */}

                <div>

                  <div className="mb-5">

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#927E70]">
                      Información consolidada
                    </p>

                    <h2 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">
                      Indicadores del sistema
                    </h2>

                    <p className="mt-2 text-sm text-[#927E70]">
                      Resumen general de la operación de MUGI
                      STORE.
                    </p>

                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    {/* USUARIOS */}

                    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                      <div className="flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D8BD] text-[#7F0303]">
                          <Users size={21} />
                        </div>

                        <span className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                          Usuarios
                        </span>

                      </div>

                      <p className="mt-5 text-3xl font-bold text-[#7F0303]">
                        {cargandoClientes
                          ? "..."
                          : totalUsuarios}
                      </p>

                      <p className="mt-1 text-sm text-[#927E70]">
                        Usuarios registrados
                      </p>

                    </div>

                    {/* PRODUCTOS */}

                    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                      <div className="flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D8BD] text-[#7F0303]">
                          <Boxes size={21} />
                        </div>

                        <span className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                          Productos
                        </span>

                      </div>

                      <p className="mt-5 text-3xl font-bold text-[#7F0303]">
                        {cargandoProductos
                          ? "..."
                          : totalProductos}
                      </p>

                      <p className="mt-1 text-sm text-[#927E70]">
                        Productos registrados
                      </p>

                    </div>

                   {/* CLIENTES ACTIVOS */}
<div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
  <div className="flex items-start justify-between">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D8BD] text-[#7F0303]">
      <UserRoundCheck size={21} />
    </div>

    <span className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
      Clientes activos
    </span>
  </div>

  <p className="mt-5 text-3xl font-bold text-[#7F0303]">
    {cargandoClientes ? "..." : clientesActivos}
  </p>

  <p className="mt-1 text-sm text-[#927E70]">
    Clientes con estado activo
  </p>
</div>

                    {/* VENTAS */}

                    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                      <div className="flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D8BD] text-[#7F0303]">
                          <ShoppingCart size={21} />
                        </div>

                        <span className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                          Ventas
                        </span>

                      </div>

                      <p className="mt-5 text-3xl font-bold text-[#7F0303]">
                        {cargandoVentas
                          ? "..."
                          : totalVentas}
                      </p>

                      <p className="mt-1 text-sm text-[#927E70]">
                        Operaciones registradas
                      </p>

                    </div>

                    {/* FACTURACIÓN */}

                    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                      <div className="flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D8BD] text-[#7F0303]">
                          <Receipt size={21} />
                        </div>

                        <span className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                          Facturación
                        </span>

                      </div>

                      <p className="mt-5 text-3xl font-bold text-[#7F0303]">
                        {cargandoVentas
                          ? "..."
                          : totalFacturas}
                      </p>

                      <p className="mt-1 text-sm text-[#927E70]">
                        Facturas generadas
                      </p>

                    </div>

                    {/* PQR RECIBIDAS */}

                    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                      <div className="flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D8BD] text-[#7F0303]">
                          <MessageCircle size={21} />
                        </div>

                        <span className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                          PQR
                        </span>

                      </div>

                      <p className="mt-5 text-3xl font-bold text-[#7F0303]">
                        {cargandoPqr
                          ? "..."
                          : totalPqr}
                      </p>

                      <p className="mt-1 text-sm text-[#927E70]">
                        PQR recibidas
                      </p>

                    </div>

                    {/* PQR PENDIENTES */}

                    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                      <div className="flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D8BD] text-[#7F0303]">
                          <Clock3 size={21} />
                        </div>

                        <span className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                          Pendientes
                        </span>

                      </div>

                      <p className="mt-5 text-3xl font-bold text-[#7F0303]">
                        {cargandoPqr
                          ? "..."
                          : pqrPendientes}
                      </p>

                      <p className="mt-1 text-sm text-[#927E70]">
                        PQR pendientes
                      </p>

                    </div>

                    {/* ESTADO */}

                    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                      <div className="flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5EAD9] text-[#40552B]">
                          <ShieldCheck size={21} />
                        </div>

                        <span className="text-xs font-bold uppercase tracking-wider text-[#927E70]">
                          Sistema
                        </span>

                      </div>

                      <p className="mt-5 text-2xl font-bold text-[#40552B]">
                        Activo
                      </p>

                      <p className="mt-1 text-sm text-[#927E70]">
                        Panel administrativo
                      </p>

                    </div>

                  </div>

                </div>


{/* ============================================================
    EST11 - INDICADORES DE VENTAS
============================================================ */}
<section className="mt-8">
  <div className="mb-5">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C]">
      Est11 · Dashboard de ventas
    </p>

    <h2 className="mt-1 text-2xl font-black text-[#241415]">
      Comportamiento de las ventas
    </h2>

    <p className="mt-1 text-sm text-[#6F6258]">
      Resumen de ventas e ingresos registrados en el sistema.
    </p>
  </div>

  <div className="grid gap-5 md:grid-cols-3">
    {/* TOTAL DE VENTAS */}
    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6F6258]">
            Ventas registradas
          </p>

          <p className="mt-2 text-3xl font-black text-[#241415]">
            {cargandoVentas ? "..." : totalVentas}
          </p>
        </div>

        <div className="rounded-2xl bg-[#241415] p-3 text-[#D8BA98]">
          <ShoppingCart size={22} />
        </div>
      </div>
    </div>

    {/* INGRESOS */}
    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6F6258]">
            Ingresos totales
          </p>

          <p className="mt-2 text-2xl font-black text-[#241415]">
            {cargandoVentas
              ? "..."
              : `$${ingresosVentasDashboard.toLocaleString("es-CO")}`}
          </p>
        </div>

        <div className="rounded-2xl bg-[#241415] p-3 text-[#D8BA98]">
          <Receipt size={22} />
        </div>
      </div>
    </div>

    {/* TICKET PROMEDIO */}
    <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6F6258]">
            Ticket promedio
          </p>

          <p className="mt-2 text-2xl font-black text-[#241415]">
            {cargandoVentas
              ? "..."
              : `$${ticketPromedioDashboard.toLocaleString("es-CO", {
                  maximumFractionDigits: 0,
                })}`}
          </p>
        </div>

        <div className="rounded-2xl bg-[#241415] p-3 text-[#D8BA98]">
          <Activity size={22} />
        </div>
      </div>
    </div>
  </div>
</section>


{/* ============================================================
    EST11 - GRÁFICO DE BARRAS
============================================================ */}
<section className="mt-6 rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-6 shadow-sm">
  <div className="mb-5">
    <h3 className="text-xl font-black text-[#241415]">
      Ventas por día
    </h3>

    <p className="mt-1 text-sm text-[#6F6258]">
      Cantidad de ventas registradas según la fecha.
    </p>
  </div>

  <div className="h-[320px] w-full">
    {cargandoVentas ? (
      <div className="flex h-full items-center justify-center text-sm font-semibold text-[#6F6258]">
        Cargando información de ventas...
      </div>
    ) : datosVentasPorDia.length === 0 ? (
      <div className="flex h-full items-center justify-center text-sm font-semibold text-[#6F6258]">
        No hay ventas registradas para mostrar.
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datosVentasPorDia}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="nombre"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />

          <Tooltip />

          <Bar
            dataKey="ventas"
            name="Ventas"
            fill="#6B1E2B"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
</section>


{/* ============================================================
    EST11 - GRÁFICO LINEAL
============================================================ */}
<section className="mt-6 rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-6 shadow-sm">
  <div className="mb-5">
    <h3 className="text-xl font-black text-[#241415]">
      Ingresos por día
    </h3>

    <p className="mt-1 text-sm text-[#6F6258]">
      Comportamiento de los ingresos generados por las ventas.
    </p>
  </div>

  <div className="h-[320px] w-full">
    {cargandoVentas ? (
      <div className="flex h-full items-center justify-center text-sm font-semibold text-[#6F6258]">
        Cargando información de ventas...
      </div>
    ) : datosVentasPorDia.length === 0 ? (
      <div className="flex h-full items-center justify-center text-sm font-semibold text-[#6F6258]">
        No hay ventas registradas para mostrar.
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datosVentasPorDia}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="nombre"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(valor) =>
              `$${Number(valor).toLocaleString("es-CO")}`
            }
          />

          <Tooltip
            formatter={(valor) =>
              `$${Number(valor).toLocaleString("es-CO")}`
            }
          />

          <Line
            type="monotone"
            dataKey="ingresos"
            name="Ingresos"
            stroke="#6B1E2B"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )}
  </div>
</section>

                {/* =================================================
                    ESTADO GENERAL
                ================================================== */}

                <div className="grid gap-6 lg:grid-cols-2">

                  <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-6 shadow-sm">

                    <div className="mb-6 flex items-center justify-between">

                      <div>

                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#927E70]">
                          Estado general
                        </p>

                        <h3 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">
                          Salud operativa
                        </h3>

                      </div>

                      <Activity
                        size={22}
                        className="text-[#D4AF37]"
                      />

                    </div>

                    <div className="mb-6">

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-sm font-semibold">
                          Cuentas activas
                        </span>

                        <span className="text-sm font-bold text-[#7F0303]">
                          {clientes.length > 0
                            ? Math.round(
                                (usuariosActivos /
                                  clientes.length) *
                                  100
                              )
                            : 0}
                          %
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden bg-[#E7D9C8]">

                        <div
                          className="h-full bg-[#7F0303] transition-all"
                          style={{
                            width: `${
                              clientes.length > 0
                                ? Math.round(
                                    (usuariosActivos /
                                      clientes.length) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />

                      </div>

                    </div>

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-sm font-semibold">
                          Productos activos
                        </span>

                        <span className="text-sm font-bold text-[#7F0303]">
                          {productos.length > 0
                            ? Math.round(
                                (productosActivos /
                                  productos.length) *
                                  100
                              )
                            : 0}
                          %
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden bg-[#E7D9C8]">

                        <div
                          className="h-full bg-[#D4AF37] transition-all"
                          style={{
                            width: `${
                              productos.length > 0
                                ? Math.round(
                                    (productosActivos /
                                      productos.length) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                  {/* ACCESOS */}

                  <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-6 shadow-sm">

                    <div className="mb-6">

                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#927E70]">
                        Navegación
                      </p>

                      <h3 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">
                        Accesos rápidos
                      </h3>

                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">

                      <button
                        type="button"
                        onClick={() =>
                          navegar("/admin/usuarios")
                        }
                        className="flex items-center gap-3 border border-[#D8BA98] bg-white px-4 py-4 text-left transition hover:border-[#D4AF37] hover:bg-[#EFE8DF]"
                      >

                        <Users
                          size={20}
                          className="text-[#7F0303]"
                        />

                        <div>

                          <p className="text-sm font-bold">
                            Cuentas
                          </p>

                          <p className="text-xs text-[#927E70]">
                            {clientes.length} registradas
                          </p>

                        </div>

                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navegar("/admin/productos")
                        }
                        className="flex items-center gap-3 border border-[#D8BA98] bg-white px-4 py-4 text-left transition hover:border-[#D4AF37] hover:bg-[#EFE8DF]"
                      >

                        <Boxes
                          size={20}
                          className="text-[#7F0303]"
                        />

                        <div>

                          <p className="text-sm font-bold">
                            Productos
                          </p>

                          <p className="text-xs text-[#927E70]">
                            {productos.length} registrados
                          </p>

                        </div>

                      </button>

                    </div>

                  </div>

                </div>

                {/* MOVIMIENTOS */}

                <div className="grid gap-6 lg:grid-cols-3">

                  <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-6 shadow-sm lg:col-span-2">

                    <div className="mb-6 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFE8DF] text-[#7F0303]">
                        <Clock3 size={19} />
                      </div>

                      <div>

                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#927E70]">
                          Actividad
                        </p>

                        <h3 className="font-serif text-2xl font-bold text-[#7F0303]">
                          Información actual
                        </h3>

                      </div>

                    </div>

                    <div className="space-y-3">

                      <div className="flex items-center justify-between border-b border-[#E3D7C8] pb-3">

                        <div className="flex items-center gap-3">

                          <UserRoundCheck
                            size={18}
                            className="text-[#7F0303]"
                          />

                          <span className="text-sm">
                            Cuentas registradas
                          </span>

                        </div>

                        <span className="font-bold">
                          {clientes.length}
                        </span>

                      </div>

                      <div className="flex items-center justify-between border-b border-[#E3D7C8] pb-3">

                        <div className="flex items-center gap-3">

                          <PackageCheck
                            size={18}
                            className="text-[#7F0303]"
                          />

                          <span className="text-sm">
                            Productos registrados
                          </span>

                        </div>

                        <span className="font-bold">
                          {productos.length}
                        </span>

                      </div>

                      <div className="flex items-center justify-between border-b border-[#E3D7C8] pb-3">

                        <div className="flex items-center gap-3">

                          <ShoppingCart
                            size={18}
                            className="text-[#7F0303]"
                          />

                          <span className="text-sm">
                            Ventas registradas
                          </span>

                        </div>

                        <span className="font-bold">
                          {totalVentas}
                        </span>

                      </div>

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <ShieldCheck
                            size={18}
                            className="text-[#D4AF37]"
                          />

                          <span className="text-sm">
                            Sesión administrativa
                          </span>

                        </div>

                        <span className="text-sm font-bold text-[#7F0303]">
                          Activa
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* ALERTAS */}

                  <div className="rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] p-6 shadow-sm">

                    <div className="mb-5 flex items-center gap-3">

                      <AlertTriangle
                        size={20}
                        className="text-[#D4AF37]"
                      />

                      <h3 className="font-serif text-xl font-bold text-[#7F0303]">
                        Alertas
                      </h3>

                    </div>

                    <div className="space-y-4">

                      <div className="border-l-2 border-[#D4AF37] pl-3">

                        <p className="text-sm font-semibold">
                          Revisión de inventario
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#927E70]">
                          Revisa periódicamente los productos
                          con bajo stock.
                        </p>

                      </div>

                      <div className="border-l-2 border-[#7F0303] pl-3">

                        <p className="text-sm font-semibold">
                          PQR pendientes
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#927E70]">
                          Actualmente hay{" "}
                          <strong>
                            {pqrPendientes}
                          </strong>{" "}
                          PQR pendientes de atención.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                CUENTAS
            ================================================== */}

            {vista === "usuarios" && (
              <div>

                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#927E70]">
                      Operación
                    </p>

                    <h2 className="mt-1 font-serif text-3xl font-bold text-[#7F0303]">
                      Cuentas
                    </h2>

                    <p className="mt-2 text-sm text-[#927E70]">
                      Administra los usuarios registrados
                      en MUGI STORE.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={abrirCrearCliente}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#5F0202]"
                  >
                    <UserRound size={18} />
                    Agregar cliente
                  </button>

                </div>

                <div className="overflow-hidden rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] shadow-sm">

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[900px] text-sm">

                      <thead className="bg-[#4A0505] text-[#F8F3EA]">

                        <tr>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Nombre
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Documento
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Correo
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Teléfono
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Rol
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Estado
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Acciones
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-[#E3D7C8]">

                        {cargandoClientes ? (

                          <tr>

                            <td
                              colSpan="7"
                              className="px-5 py-12 text-center text-sm text-[#927E70]"
                            >
                              Cargando cuentas...
                            </td>

                          </tr>

                        ) : clientes.length === 0 ? (

                          <tr>

                            <td
                              colSpan="7"
                              className="px-5 py-12 text-center text-sm text-[#927E70]"
                            >
                              No hay cuentas registradas.
                            </td>

                          </tr>

                        ) : (

                          clientes
                            .slice(
                              (paginaUsuarios - 1) *
                                elementosPorPagina,
                              paginaUsuarios *
                                elementosPorPagina
                            )
                            .map((cliente) => (

                              <tr
                                key={cliente.id}
                                className="transition hover:bg-[#EFE8DF]"
                              >

                                <td className="px-5 py-4">

                                  <div className="font-semibold">
                                    {cliente.nombres}{" "}
                                    {cliente.apellidos}
                                  </div>

                                </td>

                                <td className="px-5 py-4 text-[#927E70]">
                                  {cliente.numero_documento}
                                </td>

                                <td className="px-5 py-4 text-[#927E70]">
                                  {cliente.email}
                                </td>

                                <td className="px-5 py-4 text-[#927E70]">
                                  {cliente.telefono}
                                </td>

                                <td className="px-5 py-4">

                                  <span className="inline-flex rounded-lg bg-[#E8D8BD] px-3 py-1.5 text-xs font-bold text-[#7F0303]">
                                    {obtenerNombreRol(cliente)}
                                  </span>

                                </td>

                                <td className="px-5 py-4">

                                  <span
                                    className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${
                                      cliente.estado
                                        ? "bg-[#E5EAD9] text-[#40552B]"
                                        : "bg-[#EAD9D9] text-[#7F0303]"
                                    }`}
                                  >
                                    {cliente.estado
                                      ? "Activo"
                                      : "Inactivo"}
                                  </span>

                                </td>

                                <td className="px-5 py-4">

                                  <div className="flex flex-wrap gap-2">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        abrirEditarCliente(
                                          cliente
                                        )
                                      }
                                      className="rounded-lg bg-[#D4AF37] px-3 py-2 text-xs font-bold text-[#4A0505] transition hover:bg-[#C29D26]"
                                    >
                                      Editar
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        cambiarEstadoCliente(
                                          cliente
                                        )
                                      }
                                      className="rounded-lg border border-[#7F0303] px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:bg-[#7F0303] hover:text-white"
                                    >
                                      {cliente.estado
                                        ? "Desactivar"
                                        : "Activar"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        eliminarCliente(
                                          cliente
                                        )
                                      }
                                      className="rounded-lg bg-[#7F0303] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#5F0202]"
                                    >
                                      Eliminar
                                    </button>

                                  </div>

                                </td>

                              </tr>

                            ))

                        )}

                      </tbody>

                    </table>

                  </div>

                  {clientes.length > elementosPorPagina && (
                    <div className="flex flex-col gap-3 border-t border-[#D8BA98] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                      <p className="text-xs text-[#927E70]">
                        Página {paginaUsuarios} de{" "}
                        {Math.ceil(
                          clientes.length /
                            elementosPorPagina
                        )}
                      </p>

                      <div className="flex gap-2">

                        <button
                          type="button"
                          disabled={
                            paginaUsuarios === 1
                          }
                          onClick={() =>
                            setPaginaUsuarios(
                              (pagina) =>
                                Math.max(
                                  1,
                                  pagina - 1
                                )
                            )
                          }
                          className="rounded-lg border border-[#D8BA98] bg-white px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Anterior
                        </button>

                        <button
                          type="button"
                          disabled={
                            paginaUsuarios >=
                            Math.ceil(
                              clientes.length /
                                elementosPorPagina
                            )
                          }
                          onClick={() =>
                            setPaginaUsuarios(
                              (pagina) =>
                                Math.min(
                                  Math.ceil(
                                    clientes.length /
                                      elementosPorPagina
                                  ),
                                  pagina + 1
                                )
                            )
                          }
                          className="rounded-lg border border-[#D8BA98] bg-white px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Siguiente
                        </button>

                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

            {/* =================================================
                PRODUCTOS
            ================================================== */}

            {vista === "productos" && (
              <div>

                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#927E70]">
                      Catálogo
                    </p>

                    <h2 className="mt-1 font-serif text-3xl font-bold text-[#7F0303]">
                      Productos
                    </h2>

                    <p className="mt-2 text-sm text-[#927E70]">
                      Administra el catálogo y el inventario
                      de MUGI STORE.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={abrirCrearProducto}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#5F0202]"
                  >
                    <Boxes size={18} />
                    Agregar producto
                  </button>

                </div>

                <div className="overflow-hidden rounded-[24px] border border-[#D8BA98] bg-[#F8F3EA] shadow-sm">

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[950px] text-sm">

                      <thead className="bg-[#4A0505] text-[#F8F3EA]">

                        <tr>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Producto
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Descripción
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Precio
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Stock
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Estado
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Acciones
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-[#E3D7C8]">

                        {cargandoProductos ? (

                          <tr>

                            <td
                              colSpan="6"
                              className="px-5 py-12 text-center text-sm text-[#927E70]"
                            >
                              Cargando productos...
                            </td>

                          </tr>

                        ) : productos.length === 0 ? (

                          <tr>

                            <td
                              colSpan="6"
                              className="px-5 py-12 text-center text-sm text-[#927E70]"
                            >
                              No hay productos registrados.
                            </td>

                          </tr>

                        ) : (

                          productos
                            .slice(
                              (paginaProductos - 1) *
                                elementosPorPagina,
                              paginaProductos *
                                elementosPorPagina
                            )
                            .map((producto) => (

                              <tr
                                key={producto.id}
                                className="transition hover:bg-[#EFE8DF]"
                              >

                                <td className="px-5 py-4">

                                  <div className="flex items-center gap-3">

                                    {obtenerRutaImagen(
                                      producto.imagen
                                    ) ? (

                                      <img
                                        src={obtenerRutaImagen(
                                          producto.imagen
                                        )}
                                        alt={producto.nombre}
                                        className="h-12 w-12 rounded-xl border border-[#D8BA98] object-cover"
                                      />

                                    ) : (

                                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8D8BD] text-[#7F0303]">
                                        <Boxes size={20} />
                                      </div>

                                    )}

                                    <span className="font-semibold">
                                      {producto.nombre}
                                    </span>

                                  </div>

                                </td>

                                <td className="max-w-xs px-5 py-4 text-[#927E70]">

                                  <p className="line-clamp-2">
                                    {producto.descripcion ||
                                      "Sin descripción"}
                                  </p>

                                </td>

                                <td className="px-5 py-4 font-bold text-[#7F0303]">

                                  {Number(
                                    producto.precio
                                  ).toLocaleString(
                                    "es-CO",
                                    {
                                      style:
                                        "currency",
                                      currency:
                                        "COP",
                                    }
                                  )}

                                </td>

                                <td className="px-5 py-4">

                                  <span className="font-semibold">
                                    {producto.stock}
                                  </span>

                                </td>

                                <td className="px-5 py-4">

                                  <span
                                    className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${
                                      producto.estado
                                        ? "bg-[#E5EAD9] text-[#40552B]"
                                        : "bg-[#EAD9D9] text-[#7F0303]"
                                    }`}
                                  >
                                    {producto.estado
                                      ? "Activo"
                                      : "Inactivo"}
                                  </span>

                                </td>

                                <td className="px-5 py-4">

                                  <div className="flex flex-wrap gap-2">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        abrirEditarProducto(
                                          producto
                                        )
                                      }
                                      className="rounded-lg bg-[#D4AF37] px-3 py-2 text-xs font-bold text-[#4A0505] transition hover:bg-[#C29D26]"
                                    >
                                      Editar
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        cambiarEstadoProducto(
                                          producto
                                        )
                                      }
                                      className="rounded-lg border border-[#7F0303] px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:bg-[#7F0303] hover:text-white"
                                    >
                                      {producto.estado
                                        ? "Desactivar"
                                        : "Activar"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        eliminarProducto(
                                          producto
                                        )
                                      }
                                      className="rounded-lg bg-[#7F0303] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#5F0202]"
                                    >
                                      Eliminar
                                    </button>

                                  </div>

                                </td>

                              </tr>

                            ))

                        )}

                      </tbody>

                    </table>

                  </div>

                  {productos.length > elementosPorPagina && (
                    <div className="flex flex-col gap-3 border-t border-[#D8BA98] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                      <p className="text-xs text-[#927E70]">
                        Página {paginaProductos} de{" "}
                        {Math.ceil(
                          productos.length /
                            elementosPorPagina
                        )}
                      </p>

                      <div className="flex gap-2">

                        <button
                          type="button"
                          disabled={
                            paginaProductos === 1
                          }
                          onClick={() =>
                            setPaginaProductos(
                              (pagina) =>
                                Math.max(
                                  1,
                                  pagina - 1
                                )
                            )
                          }
                          className="rounded-lg border border-[#D8BA98] bg-white px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Anterior
                        </button>

                        <button
                          type="button"
                          disabled={
                            paginaProductos >=
                            Math.ceil(
                              productos.length /
                                elementosPorPagina
                            )
                          }
                          onClick={() =>
                            setPaginaProductos(
                              (pagina) =>
                                Math.min(
                                  Math.ceil(
                                    productos.length /
                                      elementosPorPagina
                                  ),
                                  pagina + 1
                                )
                            )
                          }
                          className="rounded-lg border border-[#D8BA98] bg-white px-3 py-2 text-xs font-bold text-[#7F0303] transition hover:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Siguiente
                        </button>

                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          MODAL CLIENTE
      ====================================================== */}

      {modalCliente && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#160B0C]/70 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#D4AF37]/30 bg-[#F8F3EA] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D8BA98] bg-[#F8F3EA] px-6 py-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#927E70]">
                  Gestión de cuentas
                </p>

                <h2 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">
                  {editandoCliente
                    ? "Editar cliente"
                    : "Nuevo cliente"}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setModalCliente(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8BA98] text-[#7F0303] transition hover:bg-[#EFE8DF]"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={guardarCliente}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Nombres
                  </label>

                  <input
                    type="text"
                    name="nombres"
                    value={
                      formularioCliente.nombres
                    }
                    onChange={
                      manejarCambioCliente
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                    required
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Apellidos
                  </label>

                  <input
                    type="text"
                    name="apellidos"
                    value={
                      formularioCliente.apellidos
                    }
                    onChange={
                      manejarCambioCliente
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                    required
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Tipo de documento
                  </label>

                  <input
                    type="text"
                    name="tipo_documento"
                    value={
                      formularioCliente.tipo_documento
                    }
                    onChange={
                      manejarCambioCliente
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                    required
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Número de documento
                  </label>

                  <input
                    type="text"
                    name="numero_documento"
                    value={
                      formularioCliente.numero_documento
                    }
                    onChange={
                      manejarCambioCliente
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                    required
                  />

                </div>

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-semibold">
                    Dirección
                  </label>

                  <input
                    type="text"
                    name="direccion"
                    value={
                      formularioCliente.direccion
                    }
                    onChange={
                      manejarCambioCliente
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Teléfono
                  </label>

                  <input
                    type="text"
                    name="telefono"
                    value={
                      formularioCliente.telefono
                    }
                    onChange={
                      manejarCambioCliente
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formularioCliente.email
                    }
                    onChange={
                      manejarCambioCliente
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                    required
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Rol
                  </label>

                  <select
                    name="rol_id"
                    value={
                      formularioCliente.rol_id
                    }
                    onChange={
                      manejarCambioCliente
                    }
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                  >

                    <option value="1">
                      Administrador
                    </option>

                    <option value="2">
                      Cliente
                    </option>

                    <option value="3">
                      Empleado
                    </option>

                  </select>

                </div>

                {!editandoCliente && (

                  <div>

                    <label className="mb-2 block text-sm font-semibold">
                      Contraseña
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={
                        formularioCliente.password
                      }
                      onChange={
                        manejarCambioCliente
                      }
                      className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                      required
                    />

                  </div>

                )}

              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#D8BA98] pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setModalCliente(false)
                  }
                  className="rounded-xl border border-[#D8BA98] px-5 py-3 text-sm font-bold text-[#7F0303] transition hover:bg-[#EFE8DF]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5F0202]"
                >
                  {editandoCliente
                    ? "Guardar cambios"
                    : "Crear cliente"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL PRODUCTO
      ====================================================== */}

      {modalProducto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#160B0C]/70 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#D4AF37]/30 bg-[#F8F3EA] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D8BA98] bg-[#F8F3EA] px-6 py-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#927E70]">
                  Gestión de catálogo
                </p>

                <h2 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">
                  {editandoProducto
                    ? "Editar producto"
                    : "Nuevo producto"}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setModalProducto(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8BA98] text-[#7F0303] transition hover:bg-[#EFE8DF]"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={guardarProducto}
              className="space-y-5 p-6"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Nombre
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={
                    formularioProducto.nombre
                  }
                  onChange={
                    manejarCambioProducto
                  }
                  className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                  required
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Descripción
                </label>

                <textarea
                  name="descripcion"
                  value={
                    formularioProducto.descripcion
                  }
                  onChange={
                    manejarCambioProducto
                  }
                  rows="4"
                  className="w-full resize-none rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                />

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Precio
                  </label>

                  <input
                    type="number"
                    name="precio"
                    value={
                      formularioProducto.precio
                    }
                    onChange={
                      manejarCambioProducto
                    }
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                    required
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={
                      formularioProducto.stock
                    }
                    onChange={
                      manejarCambioProducto
                    }
                    min="0"
                    className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                    required
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Imagen
                </label>

                <input
                  type="text"
                  name="imagen"
                  value={
                    formularioProducto.imagen
                  }
                  onChange={
                    manejarCambioProducto
                  }
                  placeholder="nombre-de-imagen.jpg"
                  className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#D4AF37]/20"
                />

              </div>

              {obtenerRutaImagen(
                formularioProducto.imagen
              ) && (

                <div className="overflow-hidden rounded-2xl border border-[#D8BA98] bg-white p-3">

                  <img
                    src={obtenerRutaImagen(
                      formularioProducto.imagen
                    )}
                    alt="Vista previa"
                    className="h-48 w-full object-contain"
                  />

                </div>

              )}

              <label className="flex cursor-pointer items-center gap-3 border border-[#D8BA98] bg-white px-4 py-3">

                <input
                  type="checkbox"
                  name="estado"
                  checked={
                    formularioProducto.estado
                  }
                  onChange={
                    manejarCambioProducto
                  }
                  className="h-4 w-4 accent-[#7F0303]"
                />

                <span className="text-sm font-semibold">
                  Producto activo
                </span>

              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-[#D8BA98] pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setModalProducto(false)
                  }
                  className="rounded-xl border border-[#D8BA98] px-5 py-3 text-sm font-bold text-[#7F0303] transition hover:bg-[#EFE8DF]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5F0202]"
                >
                  {editandoProducto
                    ? "Guardar cambios"
                    : "Crear producto"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}

export default Admin;
