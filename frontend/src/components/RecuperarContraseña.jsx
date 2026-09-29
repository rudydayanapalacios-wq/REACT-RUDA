import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RecuperarContrasena({ correoInicial, onBack }) {
  const navigate = useNavigate();

  // ==========================================================
  // ESTADOS GENERALES
  // ==========================================================

  const [paso, setPaso] = useState(1);

  const [correo, setCorreo] = useState(correoInicial || "");

  const [codigo, setCodigo] = useState("");

  const [tokenRecuperacion, setTokenRecuperacion] = useState("");

  const [tokenRestablecimiento, setTokenRestablecimiento] =
    useState("");

  const [password, setPassword] = useState("");

  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [error, setError] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [cargando, setCargando] = useState(false);

  // ==========================================================
  // URL DE LA API
  // ==========================================================

  const apiUrl = import.meta.env.VITE_API_URL;

  // ==========================================================
  // VALIDAR CORREO
  // ==========================================================

  const validarCorreo = (valor) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!valor.trim()) {
      setError("El correo es obligatorio.");
      return false;
    }

    if (!regex.test(valor.trim())) {
      setError("Ingresa un correo válido.");
      return false;
    }

    return true;
  };

  // ==========================================================
  // CAMBIO DEL CORREO
  // ==========================================================

  const handleCorreoChange = (e) => {
    const valor = e.target.value;

    setCorreo(valor);
    setError("");
    setMensaje("");
  };

  // ==========================================================
  // CAMBIO DEL CÓDIGO
  // ==========================================================

  const handleCodigoChange = (e) => {
    const valor = e.target.value.replace(/\D/g, "");

    if (valor.length <= 6) {
      setCodigo(valor);
    }

    setError("");
    setMensaje("");
  };

  // ==========================================================
  // CAMBIO DE CONTRASEÑA
  // ==========================================================

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
    setMensaje("");
  };

  const handleConfirmarPasswordChange = (e) => {
    setConfirmarPassword(e.target.value);
    setError("");
    setMensaje("");
  };

  // ==========================================================
  // VALIDAR CONTRASEÑA
  // ==========================================================

  const validarPassword = () => {
    if (!password) {
      setError("La nueva contraseña es obligatoria.");
      return false;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "La contraseña debe contener al menos una letra mayúscula."
      );
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        "La contraseña debe contener al menos una letra minúscula."
      );
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setError(
        "La contraseña debe contener al menos un número."
      );
      return false;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError(
        "La contraseña debe contener al menos un carácter especial."
      );
      return false;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }

    return true;
  };

  // ==========================================================
  // PASO 1: SOLICITAR CÓDIGO
  // ==========================================================

  const handleEnviarCodigo = async (e) => {
    e.preventDefault();

    if (cargando) {
      return;
    }

    if (!validarCorreo(correo)) {
      return;
    }

    if (!apiUrl) {
      setError("La URL de la API no está configurada.");
      return;
    }

    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const respuesta = await fetch(
      apiUrl + "/auth/recuperar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: correo.trim().toLowerCase(),
          }),
        }
      );

      let datos = {};

      try {
        datos = await respuesta.json();
      } catch {
        datos = {};
      }

      if (!respuesta.ok) {
        setError(
          datos.detail ||
            datos.message ||
            "No se pudo enviar el código de recuperación."
        );
        return;
      }

      // Guardamos el token temporal que devuelve FastAPI.
      setTokenRecuperacion(datos.token || "");

      setMensaje(
        "Hemos enviado un código de 6 dígitos a tu correo electrónico."
      );

      setPaso(2);
    } catch (error) {
      console.error(
        "Error enviando código de recuperación:",
        error
      );

      setError(
        error.message ===
          "La URL de la API no está configurada."
          ? error.message
          : "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================================
  // PASO 2: VERIFICAR CÓDIGO
  // ==========================================================

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();

    if (cargando) {
      return;
    }

    setError("");
    setMensaje("");

    if (!codigo) {
      setError("Ingresa el código que recibiste en tu correo.");
      return;
    }

    if (codigo.length !== 6) {
      setError("El código debe tener exactamente 6 dígitos.");
      return;
    }

    if (!tokenRecuperacion) {
      setError(
        "La sesión de recuperación no es válida. Solicita un nuevo código."
      );
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        `${apiUrl}/auth/verificar-codigo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: tokenRecuperacion,
            codigo: codigo,
          }),
        }
      );

      let datos = {};

      try {
        datos = await respuesta.json();
      } catch {
        datos = {};
      }

      if (!respuesta.ok) {
        setError(
          datos.detail ||
            datos.message ||
            "El código ingresado no es correcto."
        );
        return;
      }

      setTokenRestablecimiento(datos.token || "");

      setMensaje(
        "Código verificado correctamente. Ahora puedes crear una nueva contraseña."
      );

      setPaso(3);
    } catch (error) {
      console.error(
        "Error verificando código:",
        error
      );

      setError(
        "No se pudo verificar el código. Inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================================
  // PASO 3: RESTABLECER CONTRASEÑA
  // ==========================================================

  const handleRestablecerPassword = async (e) => {
    e.preventDefault();

    if (cargando) {
      return;
    }

    setError("");
    setMensaje("");

    if (!validarPassword()) {
      return;
    }

    if (!tokenRestablecimiento) {
      setError(
        "La sesión de recuperación no es válida. Debes solicitar nuevamente el código."
      );
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        `${apiUrl}/auth/restablecer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: tokenRestablecimiento,
            nueva_password: password,
          }),
        }
      );

      let datos = {};

      try {
        datos = await respuesta.json();
      } catch {
        datos = {};
      }

      if (!respuesta.ok) {
        setError(
          datos.detail ||
            datos.message ||
            "No se pudo cambiar la contraseña."
        );
        return;
      }

      setMensaje(
        "¡Contraseña cambiada correctamente! Serás redirigido al inicio de sesión."
      );

      setPassword("");
      setConfirmarPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      console.error(
        "Error restableciendo contraseña:",
        error
      );

      setError(
        "No se pudo conectar con el servidor. Inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================================
  // VOLVER AL LOGIN
  // ==========================================================

  const volverLogin = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate("/login");
  };

  // ==========================================================
  // VOLVER AL PASO ANTERIOR
  // ==========================================================

  const volverPaso = () => {
    setError("");
    setMensaje("");

    if (paso === 2) {
      setPaso(1);
      setCodigo("");
      setTokenRecuperacion("");
      return;
    }

    if (paso === 3) {
      setPaso(2);
      setPassword("");
      setConfirmarPassword("");
      setTokenRestablecimiento("");
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-[#EFE8DF]
        px-4
        py-8
        transition-colors
        duration-500
        dark:bg-[#160B0C]
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          grid
          w-full
          max-w-7xl
          min-h-[700px]
          overflow-hidden
          rounded-[40px]
          border
          border-[#D4AF37]/25
          bg-[#F8F3EA]
          shadow-2xl
          transition-colors
          duration-500
          dark:border-[#D4AF37]/25
          dark:bg-[#241415]
          lg:grid-cols-[40%_60%]
        "
      >
        {/* ====================================================
            IMAGEN LATERAL
        ==================================================== */}

        <div
          className="
            relative
            h-72
            overflow-hidden
            sm:h-96
            lg:h-auto
          "
        >
          <img
            src="/img/tripulacion.jpg"
            alt="Tripulación MUGI"
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              hover:scale-105
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-[#160B0C]/95
              via-[#7F0303]/45
              to-transparent
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              p-6
              text-white
              sm:p-8
              lg:p-12
            "
          >
            <p
              className="
                mb-3
                text-xs
                font-semibold
                uppercase
                tracking-[0.35em]
                text-[#D4AF37]
                sm:text-sm
              "
            >
              MUGI STORE
            </p>

            <h2
              className="
                mb-4
                font-serif
                text-3xl
                font-bold
                leading-tight
                sm:text-4xl
                lg:text-5xl
              "
            >
              Recupera tu aventura
            </h2>

            <p
              className="
                max-w-md
                text-sm
                leading-relaxed
                text-white/85
                sm:text-base
                lg:text-lg
              "
            >
              Si olvidaste tu contraseña, todavía puedes volver
              a navegar con nosotros. Recupera el acceso a tu
              cuenta y continúa explorando el mundo de MUGI STORE.
            </p>
          </div>
        </div>

        {/* ====================================================
            FORMULARIO
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            justify-center
            p-6
            sm:p-8
            md:p-12
            lg:p-16
            xl:p-20
          "
        >
          {/* ==================================================
              VOLVER
          ================================================== */}

          <button
            type="button"
            onClick={paso === 1 ? volverLogin : volverPaso}
            className="
              mb-8
              self-start
              text-sm
              font-semibold
              text-[#765E52]
              transition-all
              duration-300
              hover:text-[#7F0303]
              dark:text-[#C8B9B5]
              dark:hover:text-[#D4AF37]
            "
          >
            ←{" "}
            {paso === 1
              ? "Volver al inicio de sesión"
              : "Volver"}
          </button>

          <div className="max-w-xl">
            {/* ==================================================
                INDICADOR DE PASOS
            ================================================== */}

            <div className="mb-8 flex items-center gap-3">
              {[1, 2, 3].map((numero) => (
                <div
                  key={numero}
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      text-sm
                      font-bold
                      transition-all
                      duration-300
                      ${
                        paso >= numero
                          ? "bg-[#7F0303] text-white shadow-md"
                          : "border border-[#D8BA98] text-[#765E52] dark:border-[#D4AF37]/30 dark:text-[#C8B9B5]"
                      }
                    `}
                  >
                    {numero}
                  </div>

                  {numero < 3 && (
                    <div
                      className={`
                        h-[2px]
                        w-8
                        transition-all
                        duration-300
                        ${
                          paso > numero
                            ? "bg-[#D4AF37]"
                            : "bg-[#D8BA98]/50"
                        }
                      `}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* ==================================================
                TÍTULO
            ================================================== */}

            <h1
              className="
                mb-4
                font-serif
                text-3xl
                font-bold
                text-[#7F0303]
                transition-colors
                duration-500
                dark:text-[#F8F3EA]
                md:text-4xl
                lg:text-5xl
              "
            >
              {paso === 1 && "Recuperar contraseña"}

              {paso === 2 && "Verifica tu correo"}

              {paso === 3 && "Nueva contraseña"}
            </h1>

            {/* ==================================================
                DESCRIPCIÓN
            ================================================== */}

            <p
              className="
                mb-10
                text-base
                leading-relaxed
                text-[#765E52]
                transition-colors
                duration-500
                dark:text-[#C8B9B5]
                md:text-lg
              "
            >
              {paso === 1 &&
                "Ingresa el correo asociado a tu cuenta y te enviaremos un código de recuperación."}

              {paso === 2 &&
                `Hemos enviado un código de 6 dígitos a ${correo}. Ingresa el código para continuar.`}

              {paso === 3 &&
                "Crea una nueva contraseña segura para volver a acceder a tu cuenta."}
            </p>

            {/* ==================================================
                MENSAJE
            ================================================== */}

            {mensaje && (
              <div
                role="status"
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-[#D4AF37]/40
                  bg-[#D4AF37]/10
                  p-5
                  text-sm
                  text-[#6B4D13]
                  dark:text-[#F0CC55]
                "
              >
                ✓ {mensaje}
              </div>
            )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                role="alert"
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-[#7F0303]/25
                  bg-[#7F0303]/5
                  p-4
                  text-sm
                  font-medium
                  text-[#7F0303]
                  dark:text-[#F0CC55]
                "
              >
                {error}
              </div>
            )}

            {/* ==================================================
                PASO 1 - CORREO
            ================================================== */}

            {paso === 1 && (
              <form
                onSubmit={handleEnviarCodigo}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="correo"
                    className="
                      mb-3
                      block
                      text-sm
                      font-semibold
                      text-[#3D1717]
                      dark:text-[#F8F3EA]/90
                    "
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={handleCorreoChange}
                    disabled={cargando}
                    placeholder="correo@ejemplo.com"
                    required
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-[#D8BA98]
                      bg-[#F8F3EA]
                      px-5
                      py-4
                      text-[#3D1717]
                      outline-none
                      transition-all
                      duration-300
                      placeholder:text-[#927E70]
                      focus:border-[#D4AF37]
                      focus:ring-4
                      focus:ring-[#D4AF37]/10
                      dark:border-[#D4AF37]/25
                      dark:bg-[#160B0C]
                      dark:text-[#F8F3EA]
                      dark:placeholder:text-[#C8B9B5]/60
                      dark:focus:border-[#D4AF37]
                      dark:focus:ring-[#D4AF37]/15
                    "
                  />
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="
                    w-full
                    rounded-2xl
                    bg-[#7F0303]
                    py-4
                    text-lg
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-[#7F0303]/15
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    hover:bg-[#52070A]
                    hover:shadow-xl
                    active:scale-[0.98]
                    dark:bg-[#D4AF37]
                    dark:text-[#3D1717]
                    dark:shadow-[#D4AF37]/10
                    dark:hover:bg-[#F0CC55]
                  "
                >
                  {cargando
                    ? "Enviando código..."
                    : "Enviar código"}
                </button>
              </form>
            )}

            {/* ==================================================
                PASO 2 - CÓDIGO
            ================================================== */}

            {paso === 2 && (
              <form
                onSubmit={handleVerificarCodigo}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="codigo"
                    className="
                      mb-3
                      block
                      text-sm
                      font-semibold
                      text-[#3D1717]
                      dark:text-[#F8F3EA]/90
                    "
                  >
                    Código de recuperación
                  </label>

                  <input
                    id="codigo"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={codigo}
                    onChange={handleCodigoChange}
                    disabled={cargando}
                    maxLength={6}
                    placeholder="000000"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-[#D8BA98]
                      bg-[#F8F3EA]
                      px-5
                      py-5
                      text-center
                      text-3xl
                      font-bold
                      tracking-[0.5em]
                      text-[#3D1717]
                      outline-none
                      transition-all
                      duration-300
                      placeholder:text-[#927E70]/50
                      focus:border-[#D4AF37]
                      focus:ring-4
                      focus:ring-[#D4AF37]/10
                      dark:border-[#D4AF37]/25
                      dark:bg-[#160B0C]
                      dark:text-[#F8F3EA]
                      dark:focus:border-[#D4AF37]
                      dark:focus:ring-[#D4AF37]/15
                    "
                  />

                  <p
                    className="
                      mt-3
                      text-center
                      text-sm
                      text-[#765E52]
                      dark:text-[#C8B9B5]
                    "
                  >
                    Revisa también la carpeta de spam o correo no
                    deseado.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="
                    w-full
                    rounded-2xl
                    bg-[#7F0303]
                    py-4
                    text-lg
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-[#7F0303]/15
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    hover:bg-[#52070A]
                    hover:shadow-xl
                    active:scale-[0.98]
                    dark:bg-[#D4AF37]
                    dark:text-[#3D1717]
                    dark:shadow-[#D4AF37]/10
                    dark:hover:bg-[#F0CC55]
                  "
                >
                  {cargando
                    ? "Verificando código..."
                    : "Verificar código"}
                </button>

                <button
                  type="button"
                  disabled={cargando}
                  onClick={() => {
                    setPaso(1);
                    setCodigo("");
                    setError("");
                    setMensaje("");
                  }}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#D8BA98]
                    py-3
                    text-sm
                    font-semibold
                    text-[#7F0303]
                    transition-all
                    duration-300
                    hover:border-[#D4AF37]
                    hover:bg-[#D4AF37]/5
                    dark:border-[#D4AF37]/25
                    dark:text-[#D4AF37]
                  "
                >
                  Cambiar correo
                </button>
              </form>
            )}

            {/* ==================================================
                PASO 3 - NUEVA CONTRASEÑA
            ================================================== */}

            {paso === 3 && (
              <form
                onSubmit={handleRestablecerPassword}
                className="space-y-6"
              >
                {/* NUEVA CONTRASEÑA */}

                <div>
                  <label
                    htmlFor="password"
                    className="
                      mb-3
                      block
                      text-sm
                      font-semibold
                      text-[#3D1717]
                      dark:text-[#F8F3EA]/90
                    "
                  >
                    Nueva contraseña
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        mostrarPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={handlePasswordChange}
                      disabled={cargando}
                      placeholder="Ingresa tu nueva contraseña"
                      required
                      className="
                        w-full
                        rounded-2xl
                        border
                        border-[#D8BA98]
                        bg-[#F8F3EA]
                        px-5
                        py-4
                        pr-16
                        text-[#3D1717]
                        outline-none
                        transition-all
                        duration-300
                        placeholder:text-[#927E70]
                        focus:border-[#D4AF37]
                        focus:ring-4
                        focus:ring-[#D4AF37]/10
                        dark:border-[#D4AF37]/25
                        dark:bg-[#160B0C]
                        dark:text-[#F8F3EA]
                        dark:placeholder:text-[#C8B9B5]/60
                        dark:focus:border-[#D4AF37]
                      "
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
                        text-sm
                        font-semibold
                        text-[#7F0303]
                        hover:text-[#D4AF37]
                        dark:text-[#D4AF37]
                      "
                    >
                      {mostrarPassword
                        ? "Ocultar"
                        : "Mostrar"}
                    </button>
                  </div>

                  <p
                    className="
                      mt-3
                      text-xs
                      leading-relaxed
                      text-[#765E52]
                      dark:text-[#C8B9B5]
                    "
                  >
                    Mínimo 8 caracteres, una mayúscula,
                    una minúscula, un número y un carácter
                    especial.
                  </p>
                </div>

                {/* CONFIRMAR CONTRASEÑA */}

                <div>
                  <label
                    htmlFor="confirmarPassword"
                    className="
                      mb-3
                      block
                      text-sm
                      font-semibold
                      text-[#3D1717]
                      dark:text-[#F8F3EA]/90
                    "
                  >
                    Confirmar nueva contraseña
                  </label>

                  <div className="relative">
                    <input
                      id="confirmarPassword"
                      type={
                        mostrarConfirmar
                          ? "text"
                          : "password"
                      }
                      value={confirmarPassword}
                      onChange={
                        handleConfirmarPasswordChange
                      }
                      disabled={cargando}
                      placeholder="Repite tu nueva contraseña"
                      required
                      className="
                        w-full
                        rounded-2xl
                        border
                        border-[#D8BA98]
                        bg-[#F8F3EA]
                        px-5
                        py-4
                        pr-16
                        text-[#3D1717]
                        outline-none
                        transition-all
                        duration-300
                        placeholder:text-[#927E70]
                        focus:border-[#D4AF37]
                        focus:ring-4
                        focus:ring-[#D4AF37]/10
                        dark:border-[#D4AF37]/25
                        dark:bg-[#160B0C]
                        dark:text-[#F8F3EA]
                        dark:placeholder:text-[#C8B9B5]/60
                        dark:focus:border-[#D4AF37]
                      "
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
                        text-sm
                        font-semibold
                        text-[#7F0303]
                        hover:text-[#D4AF37]
                        dark:text-[#D4AF37]
                      "
                    >
                      {mostrarConfirmar
                        ? "Ocultar"
                        : "Mostrar"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="
                    w-full
                    rounded-2xl
                    bg-[#7F0303]
                    py-4
                    text-lg
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-[#7F0303]/15
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    hover:bg-[#52070A]
                    hover:shadow-xl
                    active:scale-[0.98]
                    dark:bg-[#D4AF37]
                    dark:text-[#3D1717]
                    dark:shadow-[#D4AF37]/10
                    dark:hover:bg-[#F0CC55]
                  "
                >
                  {cargando
                    ? "Cambiando contraseña..."
                    : "Cambiar contraseña"}
                </button>
              </form>
            )}

            {/* ==================================================
                FRASE
            ================================================== */}

            <div
              className="
                mt-10
                border-t
                border-[#D4AF37]/20
                pt-6
              "
            >
              <p
                className="
                  font-serif
                  text-sm
                  italic
                  text-[#765E52]
                  dark:text-[#C8B9B5]
                "
              >
                "El verdadero tesoro es encontrar el camino de regreso."
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RecuperarContrasena;
