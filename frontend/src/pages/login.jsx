// ============================================================
// PÁGINA LOGIN
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";

import RegistroModal from "../components/RegistroModal";
import RecuperarContrasena from "../components/RecuperarContraseña.jsx";

// ============================================================
// COMPONENTE LOGIN
// ============================================================

function Login() {
  const { iniciarSesion } = useAuth();

  const {
    agregarAlCarrito,
  } = useCarrito();

  const navigate = useNavigate();

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);

  const [formulario, setFormulario] = useState({
    email: "",
    password: "",
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  // ==========================================================
  // VALIDAR CAMPO
  // ==========================================================

  const validarCampo = (nombre, valor) => {
    if (nombre === "email") {
      const email = valor.trim();

      if (!email) {
        return "El correo electrónico es obligatorio.";
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return "Ingresa un correo electrónico válido.";
      }
    }

    if (nombre === "password") {
      if (!valor) {
        return "La contraseña es obligatoria.";
      }

      if (valor.length < 8) {
        return "La contraseña debe tener mínimo 8 caracteres.";
      }
    }

    return "";
  };

  // ==========================================================
  // MANEJAR CAMBIOS
  // ==========================================================

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    const mensaje = validarCampo(name, value);

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setErrores((anterior) => ({
      ...anterior,
      [name]: mensaje,
      general: "",
    }));
  };

  // ==========================================================
  // VALIDAR LOGIN
  // ==========================================================

  const validarLogin = () => {
    const nuevosErrores = {};

    const errorEmail = validarCampo(
      "email",
      formulario.email
    );

    const errorPassword = validarCampo(
      "password",
      formulario.password
    );

    if (errorEmail) {
      nuevosErrores.email = errorEmail;
    }

    if (errorPassword) {
      nuevosErrores.password = errorPassword;
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  // ==========================================================
  // RECUPERAR PRODUCTO PENDIENTE
  // ==========================================================

  const recuperarProductoPendiente = () => {
    try {
      const productoGuardado = localStorage.getItem(
        "productoPendienteMugi"
      );

      if (!productoGuardado) {
        return;
      }

      const productoPendiente = JSON.parse(productoGuardado);

      if (!productoPendiente?.id) {
        localStorage.removeItem("productoPendienteMugi");
        return;
      }

      // Agregar al carrito
      agregarAlCarrito({
        id: productoPendiente.id,
        nombre: productoPendiente.nombre,
        descripcion: productoPendiente.descripcion,
        precio: Number(productoPendiente.precio),
        imagen: productoPendiente.imagen,
        stock: Number(productoPendiente.stock),
      });

      // Eliminarlo porque ya fue agregado
      localStorage.removeItem("productoPendienteMugi");

      console.log(
        "Producto pendiente agregado automáticamente al carrito."
      );
    } catch (error) {
      console.error(
        "Error recuperando producto pendiente:",
        error
      );

      localStorage.removeItem("productoPendienteMugi");
    }
  };

  // ==========================================================
  // INICIAR SESIÓN
  // ==========================================================

  const manejarSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (cargando) {
      return;
    }

    if (!validarLogin()) {
      return;
    }

    setCargando(true);
    setErrores({});

    try {
      const respuesta = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formulario.email.trim().toLowerCase(),
            password: formulario.password,
          }),
        }
      );

      let datos = {};

      try {
        datos = await respuesta.json();
      } catch {
        datos = {};
      }

      console.log("=================================");
      console.log("RESPUESTA LOGIN");
      console.log(datos);
      console.log("=================================");

      // ======================================================
      // LOGIN INCORRECTO
      // ======================================================

      if (!respuesta.ok || !datos.success) {
        setErrores({
          general:
            datos.message ||
            "El correo o la contraseña son incorrectos.",
        });

        return;
      }

      // ======================================================
      // VERIFICAR TOKEN
      // ======================================================

      if (!datos.token) {
        setErrores({
          general:
            "El servidor no devolvió un token de autenticación.",
        });

        return;
      }

      // ======================================================
      // OBTENER USUARIO
      // ======================================================

      const usuario =
        datos.usuario || datos.user || {};

      console.log("USUARIO RECIBIDO:");
      console.log(usuario);

      // ======================================================
      // OBTENER ROL
      // ======================================================

      const rolId = Number(
        usuario.rol_id ??
          usuario.rol?.id ??
          usuario.rol?.rol_id ??
          usuario.rol?.id_rol ??
          usuario.id_rol
      );

      console.log("ROL RECIBIDO:", usuario.rol_id);
      console.log("ROL FINAL:", rolId);

      // ======================================================
      // VALIDAR ROL
      // ======================================================

      if (![1, 2, 3].includes(rolId)) {
        console.error(
          "Rol no reconocido. Usuario:",
          usuario
        );

        setErrores({
          general:
            "El usuario inició sesión, pero su rol no está configurado correctamente.",
        });

        return;
      }

      // ======================================================
      // GUARDAR SESIÓN
      // ======================================================

      iniciarSesion(usuario, datos.token);

      // ======================================================
      // RECUPERAR PRODUCTO QUE INTENTÓ AGREGAR
      // ======================================================

      recuperarProductoPendiente();

      // ======================================================
      // REDIRECCIÓN SEGÚN ROL
      // ======================================================

      if (rolId === 1) {
        console.log("Redirigiendo a ADMIN");

        navigate("/admin", {
          replace: true,
        });

        return;
      }

      if (rolId === 2) {
        console.log("Redirigiendo a CLIENTE");

        navigate("/cliente", {
          replace: true,
        });

        return;
      }

      if (rolId === 3) {
        console.log("Redirigiendo a EMPLEADO");

        navigate("/empleado", {
          replace: true,
        });

        return;
      }
    } catch (error) {
      console.error(
        "Error al iniciar sesión:",
        error
      );

      setErrores({
        general:
          "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.",
      });
    } finally {
      setCargando(false);
    }
  };

  // ==========================================================
  // REGISTRO
  // ==========================================================

  const abrirRegistro = () => {
    setMostrarRegistro(true);
  };

  const cerrarRegistro = () => {
    setMostrarRegistro(false);
  };

  const manejarRegistro = (usuario) => {
    console.log("Usuario registrado:", usuario);

    setFormulario({
      email:
        usuario?.correo ||
        usuario?.email ||
        "",
      password: "",
    });

    setErrores({});
    setMostrarRegistro(false);
  };

  // ==========================================================
  // RECUPERAR CONTRASEÑA
  // ==========================================================

  const abrirRecuperar = () => {
    setMostrarRecuperar(true);
  };

  const cerrarRecuperar = () => {
    setMostrarRecuperar(false);
  };

  // ==========================================================
  // PANTALLA RECUPERACIÓN
  // ==========================================================

  if (mostrarRecuperar) {
    return (
      <RecuperarContrasena
        onBack={cerrarRecuperar}
      />
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <main
        className="
          min-h-screen
          bg-[#EFE8DF]
          text-[#52070A]
        "
      >
        <section
          className="
            relative
            flex
            min-h-screen
            items-center
            justify-center
            overflow-hidden
            px-6
            py-16
          "
        >
          {/* DECORACIONES */}

          <div
            className="
              absolute
              -right-40
              -top-40
              h-96
              w-96
              rounded-full
              border
              border-[#D4AF37]/20
            "
          />

          <div
            className="
              absolute
              -bottom-40
              -left-40
              h-96
              w-96
              rounded-full
              border
              border-[#7F0303]/10
            "
          />

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[500px]
              w-[500px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-[#D4AF37]/5
              blur-3xl
            "
          />

          {/* CONTENEDOR */}

          <div
            className="
              relative
              z-10
              grid
              w-full
              max-w-5xl
              overflow-hidden
              rounded-[40px]
              border
              border-[#D8BA98]
              bg-[#F8F3EA]
              shadow-2xl
              lg:grid-cols-2
            "
          >
            {/* PANEL IZQUIERDO */}

            <div
              className="
                relative
                hidden
                overflow-hidden
                bg-[#7F0303]
                p-12
                text-white
                lg:flex
                lg:flex-col
                lg:justify-between
              "
            >
              <div
                className="
                  absolute
                  -right-20
                  -top-20
                  h-64
                  w-64
                  rounded-full
                  border
                  border-[#D4AF37]/20
                "
              />

              <div
                className="
                  absolute
                  -bottom-32
                  -left-32
                  h-80
                  w-80
                  rounded-full
                  border
                  border-[#D4AF37]/10
                "
              />

              <div className="relative z-10">
                <img
                  src="/img/logo.png"
                  alt="MUGI STORE"
                  className="
                    h-24
                    w-24
                    object-contain
                  "
                />

                <span
                  className="
                    mt-8
                    inline-block
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.35em]
                    text-[#D4AF37]
                  "
                >
                  MUGI STORE
                </span>

                <h1
                  className="
                    mt-5
                    max-w-md
                    font-serif
                    text-5xl
                    font-bold
                    leading-tight
                  "
                >
                  Tu aventura
                  <span
                    className="
                      block
                      text-[#D4AF37]
                    "
                  >
                    comienza aquí.
                  </span>
                </h1>

                <p
                  className="
                    mt-6
                    max-w-md
                    leading-relaxed
                    text-white/70
                  "
                >
                  Entra a tu tripulación y continúa
                  explorando nuestra colección inspirada
                  en el Grand Line.
                </p>
              </div>

              <div
                className="
                  relative
                  z-10
                  border-t
                  border-white/20
                  pt-6
                "
              >
                <p
                  className="
                    font-serif
                    text-lg
                    italic
                    text-white/80
                  "
                >
                  "El mar siempre guarda una nueva aventura."
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-[#D4AF37]
                  "
                >
                  — MUGI
                </p>
              </div>
            </div>

            {/* PANEL DERECHO */}

            <div
              className="
                p-8
                md:p-12
                lg:p-14
              "
            >
              {/* LOGO MOBILE */}

              <div
                className="
                  mb-8
                  text-center
                  lg:hidden
                "
              >
                <img
                  src="/img/logo.png"
                  alt="MUGI STORE"
                  className="
                    mx-auto
                    h-24
                    w-24
                    object-contain
                  "
                />
              </div>

              {/* ENCABEZADO */}

              <div>
                <span
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.35em]
                    text-[#D4AF37]
                  "
                >
                  Bienvenido de nuevo
                </span>

                <h2
                  className="
                    mt-4
                    font-serif
                    text-4xl
                    font-bold
                    text-[#7F0303]
                    md:text-5xl
                  "
                >
                  Iniciar sesión
                </h2>

                <p
                  className="
                    mt-4
                    text-sm
                    leading-relaxed
                    text-[#765E52]
                  "
                >
                  Ingresa tus datos para continuar
                  tu aventura.
                </p>
              </div>

              {/* ERROR GENERAL */}

              {errores.general && (
                <div
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-[#7F0303]/20
                    bg-[#7F0303]/5
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-[#7F0303]
                  "
                >
                  {errores.general}
                </div>
              )}

              {/* FORMULARIO */}

              <form
                onSubmit={manejarSubmit}
                noValidate
                className="
                  mt-8
                  space-y-6
                "
              >
                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-[#3D1717]
                    "
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formulario.email}
                    onChange={manejarCambio}
                    placeholder="ejemplo@email.com"
                    autoComplete="email"
                    className={`
                      w-full
                      rounded-2xl
                      border
                      ${
                        errores.email
                          ? "border-[#7F0303]"
                          : "border-[#D8BA98]"
                      }
                      bg-white
                      px-5
                      py-3.5
                      text-[#3D1717]
                      outline-none
                      transition-all
                      placeholder:text-[#927E70]
                      focus:border-[#D4AF37]
                      focus:ring-2
                      focus:ring-[#D4AF37]/20
                    `}
                  />

                  {errores.email && (
                    <p
                      className="
                        mt-2
                        text-xs
                        font-medium
                        text-[#7F0303]
                      "
                    >
                      {errores.email}
                    </p>
                  )}
                </div>

                {/* CONTRASEÑA */}

                <div>
                  <div
                    className="
                      mb-2
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <label
                      htmlFor="password"
                      className="
                        text-sm
                        font-semibold
                        text-[#3D1717]
                      "
                    >
                      Contraseña
                    </label>

                    <button
                      type="button"
                      onClick={abrirRecuperar}
                      className="
                        text-xs
                        font-semibold
                        text-[#7F0303]
                        transition-colors
                        hover:text-[#D4AF37]
                      "
                    >
                      ¿La olvidaste?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        mostrarPassword
                          ? "text"
                          : "password"
                      }
                      value={formulario.password}
                      onChange={manejarCambio}
                      placeholder="********"
                      autoComplete="current-password"
                      className={`
                        w-full
                        rounded-2xl
                        border
                        ${
                          errores.password
                            ? "border-[#7F0303]"
                            : "border-[#D8BA98]"
                        }
                        bg-white
                        px-5
                        py-3.5
                        pr-14
                        text-[#3D1717]
                        outline-none
                        transition-all
                        placeholder:text-[#927E70]/60
                        focus:border-[#D4AF37]
                        focus:ring-2
                        focus:ring-[#D4AF37]/20
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarPassword(
                          !mostrarPassword
                        )
                      }
                      aria-label={
                        mostrarPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-lg
                        text-[#7F0303]
                        transition-colors
                        hover:text-[#D4AF37]
                      "
                    >
                      {mostrarPassword ? "◉" : "○"}
                    </button>
                  </div>

                  {errores.password && (
                    <p
                      className="
                        mt-2
                        text-xs
                        font-medium
                        text-[#7F0303]
                      "
                    >
                      {errores.password}
                    </p>
                  )}
                </div>

                {/* RECORDAR */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <input
                    id="recordar"
                    type="checkbox"
                    className="
                      h-4
                      w-4
                      accent-[#7F0303]
                    "
                  />

                  <label
                    htmlFor="recordar"
                    className="
                      text-sm
                      text-[#765E52]
                    "
                  >
                    Recordar mi sesión
                  </label>
                </div>

                {/* BOTÓN */}

                <button
                  type="submit"
                  disabled={cargando}
                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-full
                    bg-[#7F0303]
                    px-8
                    py-4
                    font-bold
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-[#52070A]
                    hover:shadow-xl
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {cargando
                    ? "Iniciando sesión..."
                    : "Entrar a la tripulación"}

                  {!cargando && (
                    <span
                      className="
                        text-lg
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    >
                      →
                    </span>
                  )}
                </button>
              </form>

              {/* REGISTRO */}

              <div
                className="
                  mt-8
                  border-t
                  border-[#D8BA98]
                  pt-7
                  text-center
                "
              >
                <p
                  className="
                    text-sm
                    text-[#765E52]
                  "
                >
                  ¿Todavía no tienes una cuenta?
                </p>

                <button
                  type="button"
                  onClick={abrirRegistro}
                  className="
                    mt-2
                    inline-block
                    font-semibold
                    text-[#7F0303]
                    transition-colors
                    hover:text-[#D4AF37]
                  "
                >
                  Crear una cuenta →
                </button>
              </div>

              {/* VOLVER */}

              <div
                className="
                  mt-6
                  text-center
                "
              >
                <Link
                  to="/"
                  className="
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-[#927E70]
                    transition-colors
                    hover:text-[#7F0303]
                  "
                >
                  ← Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* REGISTRO MODAL */}

      {mostrarRegistro && (
        <RegistroModal
          cerrarModal={cerrarRegistro}
          alRegistrar={manejarRegistro}
        />
      )}
    </>
  );
}

// ============================================================
// EXPORTACIÓN
// ============================================================

export default Login;