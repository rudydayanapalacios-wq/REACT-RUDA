// ============================================================
// PÁGINA RESTABLECER CONTRASEÑA
// ============================================================

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// ============================================================
// COMPONENTE
// ============================================================

function RestablecerContrasena() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ==========================================================
  // OBTENER TOKEN DE LA URL
  // ==========================================================

  const token = searchParams.get("token");

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [formulario, setFormulario] = useState({
    password: "",
    confirmarPassword: "",
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // ==========================================================
  // VALIDACIONES
  // ==========================================================

  const validarPassword = (password) => {
    if (!password) {
      return "La contraseña es obligatoria.";
    }

    if (password.length < 8) {
      return "La contraseña debe tener mínimo 8 caracteres.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Debe contener al menos una letra mayúscula.";
    }

    if (!/[a-z]/.test(password)) {
      return "Debe contener al menos una letra minúscula.";
    }

    if (!/[0-9]/.test(password)) {
      return "Debe contener al menos un número.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(password)) {
      return "Debe contener al menos un carácter especial.";
    }

    return "";
  };

  const validarConfirmacion = (confirmarPassword, password) => {
    if (!confirmarPassword) {
      return "Debes confirmar la contraseña.";
    }

    if (confirmarPassword !== password) {
      return "Las contraseñas no coinciden.";
    }

    return "";
  };

  // ==========================================================
  // VALIDACIÓN VISUAL DE REQUISITOS
  // ==========================================================

  const requisitos = {
    longitud: formulario.password.length >= 8,
    mayuscula: /[A-Z]/.test(formulario.password),
    minuscula: /[a-z]/.test(formulario.password),
    numero: /[0-9]/.test(formulario.password),
    especial: /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(
      formulario.password
    ),
  };

  // ==========================================================
  // MANEJAR CAMBIOS
  // ==========================================================

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setErrores((anterior) => ({
      ...anterior,
      [name]: "",
      general: "",
    }));

    setMensaje("");
  };

  // ==========================================================
  // VALIDAR FORMULARIO
  // ==========================================================

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!token) {
      nuevosErrores.general =
        "El enlace de recuperación no es válido o no contiene un token.";
    }

    const errorPassword = validarPassword(formulario.password);

    if (errorPassword) {
      nuevosErrores.password = errorPassword;
    }

    const errorConfirmacion = validarConfirmacion(
      formulario.confirmarPassword,
      formulario.password
    );

    if (errorConfirmacion) {
      nuevosErrores.confirmarPassword = errorConfirmacion;
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  // ==========================================================
  // RESTABLECER CONTRASEÑA
  // ==========================================================

  const manejarSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (cargando) {
      return;
    }

    setMensaje("");

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/auth/restablecer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            nueva_password: formulario.password,
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
      console.log("RESPUESTA RESTABLECER CONTRASEÑA");
      console.log(datos);
      console.log("=================================");

      if (!respuesta.ok) {
        setErrores({
          general:
            datos.detail ||
            datos.message ||
            "No se pudo restablecer la contraseña.",
        });

        return;
      }

      setErrores({});

      setMensaje(
        datos.message ||
          "Contraseña restablecida correctamente. Serás redirigido al inicio de sesión."
      );

      // Limpiar formulario
      setFormulario({
        password: "",
        confirmarPassword: "",
      });

      // ======================================================
      // REDIRIGIR AL LOGIN
      // ======================================================

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2500);
    } catch (error) {
      console.error(
        "Error al restablecer contraseña:",
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
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#EFE8DF] text-[#52070A]">
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
        {/* ==================================================
            DECORACIONES
        ================================================== */}

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

        {/* ==================================================
            CONTENEDOR
        ================================================== */}

        <div
          className="
            relative
            z-10
            w-full
            max-w-2xl
            overflow-hidden
            rounded-[40px]
            border
            border-[#D8BA98]
            bg-[#F8F3EA]
            shadow-2xl
          "
        >
          {/* ==================================================
              CABECERA
          ================================================== */}

          <div
            className="
              bg-[#7F0303]
              px-8
              py-10
              text-center
              md:px-12
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

            <span
              className="
                mt-5
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
                mt-4
                font-serif
                text-3xl
                font-bold
                text-white
                md:text-4xl
              "
            >
              Recupera tu acceso
            </h1>

            <p
              className="
                mx-auto
                mt-3
                max-w-md
                text-sm
                leading-relaxed
                text-white/70
              "
            >
              Crea una nueva contraseña y continúa
              tu aventura.
            </p>
          </div>

          {/* ==================================================
              FORMULARIO
          ================================================== */}

          <div className="p-8 md:p-12">
            {/* ERROR GENERAL */}

            {errores.general && (
              <div
                className="
                  mb-6
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

            {/* MENSAJE ÉXITO */}

            {mensaje && (
              <div
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-green-700/20
                  bg-green-700/5
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-green-700
                "
              >
                {mensaje}
              </div>
            )}

            <form
              onSubmit={manejarSubmit}
              noValidate
              className="space-y-6"
            >
              {/* ==================================================
                  NUEVA CONTRASEÑA
              ================================================== */}

              <div>
                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[#3D1717]
                  "
                >
                  Nueva contraseña
                </label>

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
                    placeholder="••••••••"
                    autoComplete="new-password"
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

              {/* ==================================================
                  REQUISITOS
              ================================================== */}

              <div
                className="
                  rounded-2xl
                  border
                  border-[#D8BA98]
                  bg-white/60
                  p-5
                "
              >
                <p
                  className="
                    mb-3
                    text-sm
                    font-semibold
                    text-[#3D1717]
                  "
                >
                  La contraseña debe contener:
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  <p
                    className={
                      requisitos.longitud
                        ? "text-xs text-green-700"
                        : "text-xs text-[#765E52]"
                    }
                  >
                    {requisitos.longitud ? "✓" : "○"}{" "}
                    Mínimo 8 caracteres
                  </p>

                  <p
                    className={
                      requisitos.mayuscula
                        ? "text-xs text-green-700"
                        : "text-xs text-[#765E52]"
                    }
                  >
                    {requisitos.mayuscula ? "✓" : "○"}{" "}
                    Una letra mayúscula
                  </p>

                  <p
                    className={
                      requisitos.minuscula
                        ? "text-xs text-green-700"
                        : "text-xs text-[#765E52]"
                    }
                  >
                    {requisitos.minuscula ? "✓" : "○"}{" "}
                    Una letra minúscula
                  </p>

                  <p
                    className={
                      requisitos.numero
                        ? "text-xs text-green-700"
                        : "text-xs text-[#765E52]"
                    }
                  >
                    {requisitos.numero ? "✓" : "○"}{" "}
                    Un número
                  </p>

                  <p
                    className={
                      requisitos.especial
                        ? "text-xs text-green-700"
                        : "text-xs text-[#765E52]"
                    }
                  >
                    {requisitos.especial ? "✓" : "○"}{" "}
                    Un carácter especial
                  </p>
                </div>
              </div>

              {/* ==================================================
                  CONFIRMAR CONTRASEÑA
              ================================================== */}

              <div>
                <label
                  htmlFor="confirmarPassword"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[#3D1717]
                  "
                >
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <input
                    id="confirmarPassword"
                    name="confirmarPassword"
                    type={
                      mostrarConfirmar
                        ? "text"
                        : "password"
                    }
                    value={formulario.confirmarPassword}
                    onChange={manejarCambio}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`
                      w-full
                      rounded-2xl
                      border
                      ${
                        errores.confirmarPassword
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
                      setMostrarConfirmar(
                        !mostrarConfirmar
                      )
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
                    {mostrarConfirmar ? "◉" : "○"}
                  </button>
                </div>

                {errores.confirmarPassword && (
                  <p
                    className="
                      mt-2
                      text-xs
                      font-medium
                      text-[#7F0303]
                    "
                  >
                    {errores.confirmarPassword}
                  </p>
                )}
              </div>

              {/* ==================================================
                  BOTÓN
              ================================================== */}

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
                  ? "Restableciendo..."
                  : "Cambiar contraseña"}

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

            {/* ==================================================
                VOLVER AL LOGIN
            ================================================== */}

            <div
              className="
                mt-8
                border-t
                border-[#D8BA98]
                pt-7
                text-center
              "
            >
              <Link
                to="/login"
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#927E70]
                  transition-colors
                  hover:text-[#7F0303]
                "
              >
                ← Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ============================================================
// EXPORTACIÓN
// ============================================================

export default RestablecerContrasena;