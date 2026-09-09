import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Boxes,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Clock3,
  AlertTriangle,
  FileText,
  Home,
  ShieldCheck,
  UserRoundCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:8000";

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, token, autenticado } = useAuth();

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
  });

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

  // ============================================================
  // MENSAJE
  // ============================================================

  const [mensaje, setMensaje] = useState("");
  const vista = location.pathname.endsWith("/usuarios")
    ? "usuarios"
    : location.pathname.endsWith("/productos")
      ? "productos"
      : "resumen";
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const [paginaProductos, setPaginaProductos] = useState(1);
  const elementosPorPagina = 5;
  const totalPaginasUsuarios = Math.max(1, Math.ceil(clientes.length / elementosPorPagina));
  const totalPaginasProductos = Math.max(1, Math.ceil(productos.length / elementosPorPagina));
  const clientesVisibles = clientes.slice(
    (paginaUsuarios - 1) * elementosPorPagina,
    paginaUsuarios * elementosPorPagina
  );
  const productosVisibles = productos.slice(
    (paginaProductos - 1) * elementosPorPagina,
    paginaProductos * elementosPorPagina
  );

  // ============================================================
  // OBTENER RUTA DE IMAGEN
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
  // OBTENER NOMBRE DEL ROL
  // ============================================================

  const obtenerNombreRol = (cliente) => {
    if (cliente.rol?.nombre) {
      return cliente.rol.nombre;
    }

    if (cliente.rol?.nombre_rol) {
      return cliente.rol.nombre_rol;
    }

    if (cliente.rol?.rol) {
      return cliente.rol.rol;
    }

    if (cliente.rol_nombre) {
      return cliente.rol_nombre;
    }

    if (cliente.nombre_rol) {
      return cliente.nombre_rol;
    }

    const rolId = Number(
      cliente.rol_id ??
        cliente.rol?.id ??
        cliente.rol?.rol_id
    );

    if (rolId === 1) {
      return "Administrador";
    }

    if (rolId === 2) {
      return "Cliente";
    }

    if (rolId === 3) {
      return "Empleado";
    }

    return "Sin rol";
  };

  // ============================================================
  // VERIFICAR SESION
  // ============================================================

  useEffect(() => {
    console.log("=== VERIFICANDO ACCESO ADMIN ===");
    console.log("Autenticado:", autenticado);
    console.log("Usuario:", usuario);
    console.log("Token:", token);

    if (!autenticado || !usuario || !token) {
      console.log("No hay sesión activa.");
      navigate("/login", { replace: true });
      return;
    }

    const rol = Number(
      usuario?.rol_id ??
        usuario?.rol?.id ??
        usuario?.rol?.rol_id
    );

    console.log("ROL:", rol);

    if (rol !== 1) {
      console.log("Acceso rechazado. Rol:", rol);
      navigate("/", { replace: true });
      return;
    }

    console.log("Administrador autorizado.");

    cargarClientes(token);
    cargarProductos(token);
  }, [autenticado, usuario, token, navigate]);

  // ============================================================
  // CARGAR CLIENTES
  // ============================================================

  const cargarClientes = async (
    tokenActual = localStorage.getItem("token")
  ) => {
    try {
      setCargandoClientes(true);

      const respuesta = await fetch(`${API_URL}/usuarios`, {
        headers: {
          Authorization: `Bearer ${tokenActual}`,
        },
      });

      const datos = await respuesta.json();

      console.log("Respuesta usuarios:", datos);

      if (!respuesta.ok) {
        throw new Error(
          datos.message || "Error al obtener usuarios."
        );
      }

      setClientes(Array.isArray(datos) ? datos : datos.usuarios || []);
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
    try {
      setCargandoProductos(true);

      const respuesta = await fetch(`${API_URL}/productos`, {
        headers: {
          Authorization: `Bearer ${tokenActual}`,
        },
      });

      const datos = await respuesta.json();

      console.log("Respuesta productos:", datos);

      if (!respuesta.ok) {
        throw new Error(
          datos.message || "Error al obtener productos."
        );
      }

      setProductos(Array.isArray(datos) ? datos : datos.productos || []);
    } catch (error) {
      console.error("Error productos:", error);
      setMensaje(error.message);
    } finally {
      setCargandoProductos(false);
    }
  };

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
      tipo_documento: cliente.tipo_documento || "",
      numero_documento: cliente.numero_documento || "",
      direccion: cliente.direccion || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      password: "",
      rol_id: Number(cliente.rol_id || cliente.rol?.id || 2),

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

  const guardarCliente = async (e) => {
    e.preventDefault();

    const tokenActual = localStorage.getItem("token");

    try {
      const url = editandoCliente
        ? `${API_URL}/usuarios/${editandoCliente.id}`
        : `${API_URL}/usuarios`;

      const metodo = editandoCliente ? "PUT" : "POST";

      const cuerpo = {
        nombres: formularioCliente.nombres,
        apellidos: formularioCliente.apellidos,
        tipo_documento: formularioCliente.tipo_documento,
        numero_documento: formularioCliente.numero_documento,
        direccion: formularioCliente.direccion,
        telefono: formularioCliente.telefono,
        email: formularioCliente.email,
        rol_id: Number(formularioCliente.rol_id),
      };

      if (!editandoCliente) {
        cuerpo.password = formularioCliente.password;
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
          datos.message || "No se pudo guardar el cliente."
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

  const cambiarEstadoCliente = async (cliente) => {
    const tokenActual = localStorage.getItem("token");

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
          datos.message || "Error al cambiar estado."
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

  const eliminarCliente = async (cliente) => {
    const confirmar = window.confirm(
      `¿Eliminar al cliente ${cliente.nombres} ${cliente.apellidos}?`
    );

    if (!confirmar) return;

    const tokenActual = localStorage.getItem("token");

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

      const datos = respuesta.status === 204
        ? null
        : await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || "Error al eliminar cliente."
        );
      }

      await cargarClientes(tokenActual);

      setMensaje("Cliente eliminado correctamente.");
    } catch (error) {
      console.error(error);
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

  const abrirEditarProducto = (producto) => {
    setEditandoProducto(producto);

    setFormularioProducto({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
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
    const { name, value, type, checked } = e.target;

    setFormularioProducto({
      ...formularioProducto,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ============================================================
  // PRODUCTOS - GUARDAR
  // ============================================================

  const guardarProducto = async (e) => {
    e.preventDefault();

    const tokenActual = localStorage.getItem("token");

    try {
      const url = editandoProducto
        ? `${API_URL}/productos/${editandoProducto.id}`
        : `${API_URL}/productos`;

      const metodo = editandoProducto ? "PUT" : "POST";

      const cuerpo = {
        nombre: formularioProducto.nombre,
        descripcion: formularioProducto.descripcion,
        precio: Number(formularioProducto.precio),
        stock: Number(formularioProducto.stock),
        imagen: formularioProducto.imagen,
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

      console.log("Respuesta guardar producto:", datos);

      if (!respuesta.ok) {
        throw new Error(
          datos.message || "No se pudo guardar el producto."
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

  const cambiarEstadoProducto = async (producto) => {
    const tokenActual = localStorage.getItem("token");

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
            descripcion: producto.descripcion,
            precio: Number(producto.precio),
            stock: Number(producto.stock),
            imagen: producto.imagen,
            estado: !producto.estado,
          }),
        }
      );

      const datos = respuesta.status === 204
        ? null
        : await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || "Error al cambiar estado."
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

  const eliminarProducto = async (producto) => {
    const confirmar = window.confirm(
      `¿Eliminar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    const tokenActual = localStorage.getItem("token");

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
          datos.message || "Error al eliminar producto."
        );
      }

      await cargarProductos(tokenActual);

      setMensaje("Producto eliminado correctamente.");
    } catch (error) {
      console.error(error);
      setMensaje(error.message);
    }
  };

  // ============================================================
  // CARGANDO SESION
  // ============================================================

  if (!autenticado || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFE8DF]">
        <p className="text-black">
          Verificando acceso...
        </p>
      </div>
    );
  }

  // ============================================================
  // PANEL
  // ============================================================

  return (
    <section className="min-h-screen bg-[#EFE8DF] px-3 py-5 text-[#2C1B1B] sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-[1600px] gap-6">

        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-[28px] border border-[#D4AF37]/25 bg-[#241415] p-5 text-[#F8F3EA] shadow-[0_20px_60px_rgba(61,23,23,0.16)] lg:flex">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37] text-[#3D1717]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-serif text-xl font-bold">MUGI</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">Control center</p>
            </div>
          </div>

          <nav className="mt-8 space-y-5">
            <div>
              <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Vista general</p>
            <button type="button" onClick={() => navigate("/admin")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${vista === "resumen" ? "bg-[#7F0303] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <LayoutDashboard size={18} /> Resumen
            </button>
            </div>
            <div>
              <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Operación</p>
            <button type="button" onClick={() => navigate("/admin/usuarios")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${vista === "usuarios" ? "bg-[#7F0303] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <Users size={18} /> Cuentas
            </button>
            </div>
            <div>
              <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Catálogo</p>
            <button type="button" onClick={() => navigate("/admin/productos")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${vista === "productos" ? "bg-[#7F0303] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <Boxes size={18} /> Productos
            </button>
            </div>
            <div>
              <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Comercial</p>
              <button type="button" onClick={() => navigate("/admin/ventas")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"><FileText size={18} /> Ventas</button>
            </div>
            <div>
              <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Cuenta</p>
              <button type="button" onClick={() => navigate("/perfil")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"><UserRound size={18} /> Editar perfil</button>
            </div>
            <button type="button" onClick={() => navigate("/")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
              <Home size={18} /> Ir a inicio
            </button>
          </nav>

          <div className="mt-auto rounded-2xl border border-[#D4AF37]/20 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] font-serif font-bold text-[#3D1717]">
                {(usuario.nombres || "A").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{usuario.nombres || "Administrador"}</p>
                <p className="truncate text-xs text-white/50">Administrador</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                navigate("/login", { replace: true });
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              <LogOut size={15} /> Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl">

        <div className="mb-5 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#927E70]">Área administrativa</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-2.5 text-sm font-semibold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <Home size={17} /> Volver al inicio
          </button>
        </div>

        {/* ENCABEZADO */}

        <div id="resumen" className="mb-8 sm:mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            MUGI STORE
          </span>

          <h1 className="mt-3 font-serif text-3xl font-bold text-[#7F0303] sm:text-4xl">
            Panel de Administrador
          </h1>

          <p className="mt-3 text-black">
            Bienvenido,{" "}
            {usuario.nombres ||
              usuario.nombre ||
              "Administrador"}
            .
          </p>

          <p className="mt-1 text-sm font-semibold text-[#7F0303]">
            Rol:{" "}
            {usuario.rol?.nombre ||
              usuario.rol?.nombre_rol ||
              usuario.rol_nombre ||
              (Number(usuario.rol_id) === 1
                ? "Administrador"
                : "Sin rol")}
          </p>

          {vista === "resumen" && (
            <div className="mt-7 overflow-hidden rounded-[2rem] bg-[#241415] p-6 text-[#F8F3EA] shadow-[0_18px_45px_rgba(61,23,23,0.16)] sm:p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Centro de operaciones</p>
                  <h2 className="mt-2 max-w-xl font-serif text-3xl font-bold leading-tight sm:text-4xl">Todo lo importante, en un solo lugar.</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Supervisa el catálogo, las cuentas y el movimiento comercial de MUGI STORE.</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60"><CalendarDays size={18} className="text-[#D4AF37]" />{new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => navigate("/admin/usuarios")} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"><Users size={19} className="text-[#D4AF37]" /><p className="mt-3 text-sm font-semibold">Revisar usuarios</p><p className="mt-1 text-xs text-white/45">Gestiona accesos y estados</p></button>
                <button type="button" onClick={() => navigate("/admin/productos")} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"><Boxes size={19} className="text-[#D4AF37]" /><p className="mt-3 text-sm font-semibold">Actualizar catálogo</p><p className="mt-1 text-xs text-white/45">Mantén tu inventario al día</p></button>
                <button type="button" onClick={() => navigate("/admin/ventas")} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"><FileText size={19} className="text-[#D4AF37]" /><p className="mt-3 text-sm font-semibold">Ver ventas</p><p className="mt-1 text-xs text-white/45">Consulta facturas recientes</p></button>
              </div>
            </div>
          )}

          {vista === "resumen" && (
            <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
              <div className="rounded-3xl border border-[#D8BA98] bg-[#F8F3EA] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Lectura rápida</p>
                    <h2 className="mt-2 font-serif text-2xl font-bold text-[#7F0303]">Salud operativa</h2>
                  </div>
                  <Activity className="text-[#7F0303]" size={24} />
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-xs font-semibold"><span>Usuarios activos</span><span>{clientes.length ? Math.round((clientes.filter((cliente) => cliente.estado).length / clientes.length) * 100) : 0}%</span></div>
                    <div className="h-2 rounded-full bg-[#D8BA98]/40"><div className="h-2 rounded-full bg-[#7F0303]" style={{ width: `${clientes.length ? Math.round((clientes.filter((cliente) => cliente.estado).length / clientes.length) * 100) : 0}%` }} /></div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-xs font-semibold"><span>Productos activos</span><span>{productos.length ? Math.round((productos.filter((producto) => producto.estado).length / productos.length) * 100) : 0}%</span></div>
                    <div className="h-2 rounded-full bg-[#D8BA98]/40"><div className="h-2 rounded-full bg-[#D4AF37]" style={{ width: `${productos.length ? Math.round((productos.filter((producto) => producto.estado).length / productos.length) * 100) : 0}%` }} /></div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-[#7F0303] p-6 text-white shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F0CC55]">Accesos rápidos</p>
                <h2 className="mt-2 font-serif text-2xl font-bold">Gestiona tu tienda</h2>
                <div className="mt-6 space-y-3">
                  <button type="button" onClick={() => navigate("/admin/usuarios")} className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/20"><span className="flex items-center gap-3"><UserRoundCheck size={18} /> Revisar cuentas</span><span>→</span></button>
                  <button type="button" onClick={() => navigate("/admin/productos")} className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/20"><span className="flex items-center gap-3"><PackageCheck size={18} /> Actualizar catálogo</span><span>→</span></button>
                </div>
              </div>
            </div>
          )}

          {vista === "resumen" && (
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-[#D8BA98] bg-[#F8F3EA] p-6 lg:col-span-2">
                <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Actividad</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">Últimos movimientos</h2></div><Clock3 size={21} className="text-[#7F0303]" /></div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#EFE8DF] p-3"><div className="h-2.5 w-2.5 rounded-full bg-[#7F0303]" /><p className="text-sm text-[#3D1717]">Panel conectado con FastAPI y SQL Server</p><span className="ml-auto text-xs text-[#927E70]">Ahora</span></div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#EFE8DF] p-3"><div className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" /><p className="text-sm text-[#3D1717]">Autenticación JWT activa</p><span className="ml-auto text-xs text-[#927E70]">Seguro</span></div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#EFE8DF] p-3"><div className="h-2.5 w-2.5 rounded-full bg-green-600" /><p className="text-sm text-[#3D1717]">Módulos de catálogo disponibles</p><span className="ml-auto text-xs text-[#927E70]">Listo</span></div>
                </div>
              </div>
              <div className="rounded-3xl border border-[#D8BA98] bg-[#F8F3EA] p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Atención</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#7F0303]">Alertas</h2></div><AlertTriangle size={21} className="text-[#D4AF37]" /></div><p className="mt-5 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4 text-sm leading-6 text-[#765E52]">Revisa periódicamente el stock y los estados de las cuentas desde sus módulos.</p></div>
            </div>
          )}
        </div>

        {/* MENSAJE */}

        {mensaje && (
          <div className="mb-8 rounded-2xl border border-[#D4AF37]/40 bg-[#F8F3EA] p-4 text-sm font-medium text-black">
            {mensaje}
          </div>
        )}

        {/* ======================================================
            CLIENTES
        ====================================================== */}

        {vista === "usuarios" && (
        <div id="cuentas" className="mb-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#7F0303] sm:text-3xl">
                Cuentas
              </h2>

              <p className="mt-1 text-sm text-black">
                Administra las cuentas registradas en MUGI.
              </p>
            </div>

            <button
              onClick={abrirCrearCliente}
              className="w-full rounded-full bg-[#7F0303] px-6 py-3 font-semibold text-white transition hover:bg-[#52070A] sm:w-auto"
            >
              + Agregar cliente
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#D8BA98] bg-[#F8F3EA] shadow-lg">
            {cargandoClientes ? (
              <div className="p-10 text-center text-black">
                Cargando clientes...
              </div>
            ) : clientes.length === 0 ? (
              <div className="p-10 text-center text-black">
                No hay clientes registrados.
              </div>
            ) : (
              <table className="w-full min-w-[1200px] table-fixed text-left text-black">
                <thead className="border-b border-[#D8BA98] text-black">
                  <tr>
                    <th className="w-[18%] px-6 py-4">
                      Nombre
                    </th>

                    <th className="w-[14%] px-6 py-4">
                      Documento
                    </th>

                    <th className="w-[18%] px-6 py-4">
                      Correo
                    </th>

                    <th className="w-[12%] px-6 py-4">
                      Teléfono
                    </th>

                    <th className="w-[12%] px-6 py-4">
                      Rol
                    </th>

                    <th className="w-[10%] px-6 py-4">
                      Estado
                    </th>

                    <th className="w-[16%] px-6 py-4">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {clientesVisibles.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-b border-[#D8BA98]/50"
                    >
                      <td className="px-6 py-4 font-semibold text-black">
                        {cliente.nombres}{" "}
                        {cliente.apellidos}
                      </td>

                      <td className="px-6 py-4 text-black">
                        {cliente.tipo_documento}{" "}
                        {cliente.numero_documento}
                      </td>

                      <td className="px-6 py-4 text-black">
                        {cliente.email}
                      </td>

                      <td className="px-6 py-4 text-black">
                        {cliente.telefono || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex min-w-[110px] justify-center rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-bold text-[#7F0303]">
                          {obtenerNombreRol(cliente)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex min-w-[75px] justify-center rounded-full px-3 py-1 text-xs font-bold ${
                            cliente.estado
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {cliente.estado
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>


<td className="px-6 py-4">
  <div className="flex min-w-[250px] items-center justify-center gap-2 whitespace-nowrap">
    <button
      onClick={() => abrirEditarCliente(cliente)}
      className="flex h-9 w-[78px] items-center justify-center rounded-full bg-[#D4AF37] px-3 text-xs font-bold text-black transition hover:brightness-95"
    >
      Editar
    </button>

    <button
      onClick={() => cambiarEstadoCliente(cliente)}
      className="flex h-9 w-[95px] items-center justify-center rounded-full border border-[#7F0303] px-3 text-xs font-bold text-[#7F0303] transition hover:bg-[#7F0303] hover:text-white"
    >
      {cliente.estado ? "Desactivar" : "Activar"}
    </button>

    <button
      onClick={() => eliminarCliente(cliente)}
      className="flex h-9 w-[78px] items-center justify-center rounded-full bg-[#7F0303] px-3 text-xs font-bold text-white transition hover:bg-[#52070A]"
    >
      Eliminar
    </button>
  </div>
</td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {clientes.length > elementosPorPagina && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-3 text-sm">
              <span className="text-[#765E52]">Página {paginaUsuarios} de {totalPaginasUsuarios}</span>
              <div className="flex gap-2">
                <button type="button" disabled={paginaUsuarios === 1} onClick={() => setPaginaUsuarios((pagina) => Math.max(1, pagina - 1))} className="rounded-xl border border-[#D8BA98] px-3 py-2 font-semibold text-[#7F0303] disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
                <button type="button" disabled={paginaUsuarios === totalPaginasUsuarios} onClick={() => setPaginaUsuarios((pagina) => Math.min(totalPaginasUsuarios, pagina + 1))} className="rounded-xl bg-[#7F0303] px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* ======================================================
            PRODUCTOS
        ====================================================== */}

        {vista === "productos" && (
        <div id="productos" className="mb-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#7F0303] sm:text-3xl">
                Productos
              </h2>

              <p className="mt-1 text-sm text-black">
                Administra el catálogo de productos de MUGI.
              </p>
            </div>

            <button
              onClick={abrirCrearProducto}
              className="w-full rounded-full bg-[#7F0303] px-6 py-3 font-semibold text-white transition hover:bg-[#52070A] sm:w-auto"
            >
              + Agregar producto
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#D8BA98] bg-[#F8F3EA] shadow-lg">
            {cargandoProductos ? (
              <div className="p-10 text-center text-black">
                Cargando productos...
              </div>
            ) : productos.length === 0 ? (
              <div className="p-10 text-center text-black">
                No hay productos registrados.
              </div>
            ) : (
              <table className="w-full min-w-[1100px] text-left text-black">
                <thead className="border-b border-[#D8BA98] text-black">
                  <tr>
                    <th className="px-6 py-4">
                      Producto
                    </th>

                    <th className="px-6 py-4">
                      Descripción
                    </th>

                    <th className="px-6 py-4">
                      Precio
                    </th>

                    <th className="px-6 py-4">
                      Stock
                    </th>

                    <th className="px-6 py-4">
                      Estado
                    </th>

                    <th className="px-6 py-4">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {productosVisibles.map((producto) => (
                    <tr
                      key={producto.id}
                      className="border-b border-[#D8BA98]/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {producto.imagen ? (
                            <img
                              src={obtenerRutaImagen(
                                producto.imagen
                              )}
                              alt={producto.nombre}
                              className="h-14 w-14 rounded-xl border border-[#D8BA98] object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EFE8DF] text-xs text-black">
                              Sin foto
                            </div>
                          )}

                          <span className="font-semibold text-black">
                            {producto.nombre}
                          </span>
                        </div>
                      </td>

                      <td className="max-w-xs px-6 py-4 text-black">
                        {producto.descripcion ||
                          "Sin descripción"}
                      </td>

                      <td className="px-6 py-4 font-semibold text-black">
                        $
                        {Number(
                          producto.precio
                        ).toLocaleString("es-CO")}
                      </td>

                      <td className="px-6 py-4 text-black">
                        {producto.stock}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex min-w-[75px] justify-center rounded-full px-3 py-1 text-xs font-bold ${
                            producto.estado
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {producto.estado
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                          <button
                            onClick={() =>
                              abrirEditarProducto(producto)
                            }
                            className="h-9 w-24 rounded-full bg-[#D4AF37] px-3 text-xs font-bold text-black transition hover:brightness-95"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              cambiarEstadoProducto(producto)
                            }
                            className="h-9 w-24 rounded-full border border-[#7F0303] px-3 text-xs font-bold text-[#7F0303] transition hover:bg-[#7F0303] hover:text-white"
                          >
                            {producto.estado
                              ? "Desactivar"
                              : "Activar"}
                          </button>

                          <button
                            onClick={() =>
                              eliminarProducto(producto)
                            }
                            className="h-9 w-24 rounded-full bg-[#7F0303] px-3 text-xs font-bold text-white transition hover:bg-[#52070A]"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {productos.length > elementosPorPagina && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#D8BA98] bg-[#F8F3EA] px-4 py-3 text-sm">
              <span className="text-[#765E52]">Página {paginaProductos} de {totalPaginasProductos}</span>
              <div className="flex gap-2">
                <button type="button" disabled={paginaProductos === 1} onClick={() => setPaginaProductos((pagina) => Math.max(1, pagina - 1))} className="rounded-xl border border-[#D8BA98] px-3 py-2 font-semibold text-[#7F0303] disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
                <button type="button" disabled={paginaProductos === totalPaginasProductos} onClick={() => setPaginaProductos((pagina) => Math.min(totalPaginasProductos, pagina + 1))} className="rounded-xl bg-[#7F0303] px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* ======================================================
            MODAL CLIENTE
        ====================================================== */}

        {modalCliente && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#160B0C]/70 px-4 py-6 backdrop-blur-sm"
            onClick={() => setModalCliente(false)}
          >
            <div
              className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-[#D4AF37]/30 bg-[#F8F3EA] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-[#D8BA98] px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                      MUGI STORE
                    </span>

                    <h2 className="mt-2 font-serif text-2xl font-bold text-[#7F0303] sm:text-3xl">
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D8BA98] text-xl text-[#7F0303]"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form
                onSubmit={guardarCliente}
                className="px-5 py-6 sm:px-7 sm:py-7"
              >
                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Nombres
                    </label>

                    <input
                      type="text"
                      name="nombres"
                      value={formularioCliente.nombres}
                      onChange={manejarCambioCliente}
                      required
                      className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Apellidos
                    </label>

                    <input
                      type="text"
                      name="apellidos"
                      value={formularioCliente.apellidos}
                      onChange={manejarCambioCliente}
                      required
                      className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Tipo de documento
                    </label>

                    <select
                      name="tipo_documento"
                      value={formularioCliente.tipo_documento}
                      onChange={manejarCambioCliente}
                      required
                      className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    >
                      <option value="">
                        Selecciona una opción
                      </option>

                      <option value="CC">
                        Cédula de ciudadanía
                      </option>

                      <option value="TI">
                        Tarjeta de identidad
                      </option>

                      <option value="CE">
                        Cédula de extranjería
                      </option>

                      <option value="PAS">
                        Pasaporte
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Número de documento
                    </label>

                    <input
                      type="text"
                      name="numero_documento"
                      value={
                        formularioCliente.numero_documento
                      }
                      onChange={manejarCambioCliente}
                      required
                      className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Dirección
                    </label>

                    <input
                      type="text"
                      name="direccion"
                      value={formularioCliente.direccion}
                      onChange={manejarCambioCliente}
                      className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Teléfono
                    </label>

                    <input
                      type="tel"
                      name="telefono"
                      value={formularioCliente.telefono}
                      onChange={manejarCambioCliente}
                      className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Correo electrónico
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formularioCliente.email}
                      onChange={manejarCambioCliente}
                      required
                      className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    />
                  </div>


                  <div>
  <label className="mb-2 block text-sm font-semibold text-black">
    Rol
  </label>

  <select
    name="rol_id"
    value={formularioCliente.rol_id}
    onChange={manejarCambioCliente}
    required
    className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
  >
    <option value={1}>Administrador</option>
    <option value={2}>Cliente</option>
    <option value={3}>Empleado</option>
  </select>
</div>

                  {!editandoCliente && (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Contraseña
                      </label>

                      <input
                        type="password"
                        name="password"
                        value={formularioCliente.password}
                        onChange={manejarCambioCliente}
                        required
                        minLength={8}
                        className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setModalCliente(false)
                    }
                    className="w-full rounded-full border border-[#7F0303] px-7 py-3 font-bold text-[#7F0303] sm:w-auto"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#7F0303] px-8 py-3 font-bold text-white sm:w-auto"
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

        {/* ======================================================
            MODAL PRODUCTO
        ====================================================== */}

        {modalProducto && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#160B0C]/70 px-4 py-6 backdrop-blur-sm"
            onClick={() => setModalProducto(false)}
          >
            <div
              className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-[#D4AF37]/30 bg-[#F8F3EA] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-[#D8BA98] px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                      MUGI STORE
                    </span>

                    <h2 className="mt-2 font-serif text-2xl font-bold text-[#7F0303] sm:text-3xl">
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D8BA98] text-xl text-[#7F0303]"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form
                onSubmit={guardarProducto}
                className="px-5 py-6 sm:px-7 sm:py-7"
              >
                <div className="grid gap-5">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Nombre del producto
                    </label>

                    <input
                      type="text"
                      name="nombre"
                      value={formularioProducto.nombre}
                      onChange={manejarCambioProducto}
                      required
                      maxLength={150}
                      className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Descripción
                    </label>

                    <textarea
                      name="descripcion"
                      value={
                        formularioProducto.descripcion
                      }
                      onChange={manejarCambioProducto}
                      maxLength={500}
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Precio
                      </label>

                      <input
                        type="number"
                        name="precio"
                        value={formularioProducto.precio}
                        onChange={manejarCambioProducto}
                        min="0"
                        step="0.01"
                        required
                        className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Stock
                      </label>

                      <input
                        type="number"
                        name="stock"
                        value={formularioProducto.stock}
                        onChange={manejarCambioProducto}
                        min="0"
                        required
                        className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      URL o nombre de imagen
                    </label>

                    <input
                      type="text"
                      name="imagen"
                      value={formularioProducto.imagen}
                      onChange={manejarCambioProducto}
                      maxLength={255}
                      placeholder="https://... o anillo-pirata.jpg"
                      className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-black outline-none"
                    />

                    <p className="mt-2 text-xs text-black/60">
                      Puedes colocar una URL completa o el
                      nombre de una imagen ubicada en
                      public/images/productos.
                    </p>
                  </div>

                  {formularioProducto.imagen && (
                    <div className="mt-1">
                      <p className="mb-2 text-sm font-semibold text-black">
                        Vista previa
                      </p>

                      <div className="flex min-h-40 items-center justify-center rounded-2xl border border-[#D8BA98] bg-white p-4">
                        <img
                          src={obtenerRutaImagen(
                            formularioProducto.imagen
                          )}
                          alt="Vista previa"
                          className="h-40 w-40 rounded-2xl border border-[#D8BA98] object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";

                            const mensaje =
                              e.currentTarget.parentElement?.querySelector(
                                ".mensaje-imagen"
                              );

                            if (mensaje) {
                              mensaje.classList.remove(
                                "hidden"
                              );
                            }
                          }}
                        />

                        <p className="mensaje-imagen hidden text-sm text-black">
                          No se pudo cargar la imagen.
                        </p>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 text-sm font-semibold text-black">
                    <input
                      type="checkbox"
                      name="estado"
                      checked={formularioProducto.estado}
                      onChange={manejarCambioProducto}
                      className="h-5 w-5"
                    />

                    Producto activo
                  </label>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setModalProducto(false)
                    }
                    className="w-full rounded-full border border-[#7F0303] px-7 py-3 font-bold text-[#7F0303] sm:w-auto"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#7F0303] px-8 py-3 font-bold text-white sm:w-auto"
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
      </div>
        </div>
        </div>
    </section>
  );
}

export default Admin;
