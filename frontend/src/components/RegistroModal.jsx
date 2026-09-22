import { useEffect, useState } from "react";
import Alerta from "./Alerta";

export default function RegistroModal({
  cerrarModal,
  alRegistrar,
}) {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "",
    numeroDocumento: "",
    direccion: "",
    telefono: "",
    correo: "",
    contraseña: "",
    confirmarContraseña: "",
  });

  const [error, setError] = useState("");
  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // =====================================================
  // CERRAR MODAL CON ESC
  // =====================================================

  useEffect(() => {
    const manejarTeclaEsc = (e) => {
      if (e.key === "Escape") {
        cerrarModal();
      }
    };

    document.addEventListener("keydown", manejarTeclaEsc);

    return () => {
      document.removeEventListener("keydown", manejarTeclaEsc);
    };
  }, [cerrarModal]);

  // =====================================================
  // VALIDAR CAMPOS
  // =====================================================

  const validarCampo = (nombre, valor, valoresFormulario = formulario) => {
    let mensaje = "";

    switch (nombre) {
      case "nombre":
      case "apellido":
        if (!valor) {
          mensaje = "Este campo es obligatorio";
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) {
          mensaje = "Solo se permiten letras";
        } else if (valor.length < 2) {
          mensaje = "Mínimo 2 caracteres";
        } else if (valor.length > 30) {
          mensaje = "Máximo 30 caracteres";
        }
        break;

      case "tipoDocumento":
        if (!valor) {
          mensaje = "Selecciona un tipo de documento";
        }
        break;

      case "numeroDocumento":
        if (!valor) {
          mensaje = "Este campo es obligatorio";
        } else if (!/^\d+$/.test(valor)) {
          mensaje = "Solo números";
        } else if (valor.length < 6 || valor.length > 15) {
          mensaje = "Entre 6 y 15 dígitos";
        }
        break;

      case "direccion":
        if (!valor) {
          mensaje = "Este campo es obligatorio";
        } else if (valor.length < 5) {
          mensaje = "La dirección es demasiado corta";
        } else if (valor.length > 50) {
          mensaje = "Máximo 50 caracteres";
        }
        break;

      case "telefono":
        if (!valor) {
          mensaje = "Este campo es obligatorio";
        } else if (!/^\d+$/.test(valor)) {
          mensaje = "Solo números";
        } else if (valor.length !== 10) {
          mensaje = "Debe tener 10 dígitos";
        }
        break;

      case "correo":
        if (!valor) {
          mensaje = "Este campo es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
          mensaje = "Correo inválido";
        } else if (valor.length > 50) {
          mensaje = "Máximo 50 caracteres";
        }
        break;

      case "contraseña":
        if (!valor) {
          mensaje = "Este campo es obligatorio";
        } else if (valor.length < 8) {
          mensaje = "Mínimo 8 caracteres";
        } else if (!/[A-Z]/.test(valor)) {
          mensaje = "Debe incluir al menos una letra mayúscula";
        } else if (!/[a-z]/.test(valor)) {
          mensaje = "Debe incluir al menos una letra minúscula";
        } else if (!/\d/.test(valor)) {
          mensaje = "Debe incluir al menos un número";
        } else if (!/[^A-Za-z0-9\s]/.test(valor)) {
          mensaje = "Debe incluir al menos un carácter especial";
        } else if (new TextEncoder().encode(valor).length > 72) {
          mensaje = "Máximo 72 bytes";
        }
        break;

      case "confirmarContraseña":
        if (!valor) {
          mensaje = "Este campo es obligatorio";
        } else if (valor !== valoresFormulario.contraseña) {
          mensaje = "Las contraseñas no coinciden";
        }
        break;

      default:
        break;
    }

    setErrores((prev) => ({
      ...prev,
      [nombre]: mensaje,
    }));

    return mensaje === "";
  };

  const formularioEsValido = () => {
    const campos = Object.keys(formulario);
    let valido = true;

    campos.forEach((campo) => {
      const esValidoCampo = validarCampo(
        campo,
        formulario[campo],
        formulario
      );
      if (!esValidoCampo) valido = false;
    });

    return valido;
  };

  // =====================================================
  // MANEJAR CAMBIOS
  // =====================================================

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    const nuevoFormulario = {
      ...formulario,
      [name]: value,
    };

    setFormulario(nuevoFormulario);

    validarCampo(name, value, nuevoFormulario);

    if (name === "contraseña" && nuevoFormulario.confirmarContraseña) {
      validarCampo(
        "confirmarContraseña",
        nuevoFormulario.confirmarContraseña,
        nuevoFormulario
      );
    }

    setError("");
  };

  const generarContraseñaSegura = () => {
    const grupos = [
      "ABCDEFGHJKLMNPQRSTUVWXYZ",
      "abcdefghijkmnopqrstuvwxyz",
      "23456789",
      "!@#$%^&*()-_=+",
    ];
    const caracteres = grupos.join("");
    const valores = new Uint32Array(12);

    crypto.getRandomValues(valores);

    const contraseña = grupos.map((grupo, indice) => (
      grupo[valores[indice] % grupo.length]
    ));

    for (let indice = contraseña.length; indice < 12; indice += 1) {
      contraseña.push(
        caracteres[valores[indice] % caracteres.length]
      );
    }

    for (let indice = contraseña.length - 1; indice > 0; indice -= 1) {
      const aleatorio = new Uint32Array(1);
      crypto.getRandomValues(aleatorio);
      const posicion = aleatorio[0] % (indice + 1);
      [contraseña[indice], contraseña[posicion]] = [
        contraseña[posicion],
        contraseña[indice],
      ];
    }

    const contraseñaGenerada = contraseña.join("");
    const nuevoFormulario = {
      ...formulario,
      contraseña: contraseñaGenerada,
      confirmarContraseña: contraseñaGenerada,
    };

    setFormulario(nuevoFormulario);
    setErrores((prev) => ({
      ...prev,
      contraseña: "",
      confirmarContraseña: "",
    }));
    setError("");
  };

  // =====================================================
  // CREAR CUENTA
  // =====================================================

  const crearCuenta = async (e) => {
    e.preventDefault();
    setError("");

    if (!formularioEsValido()) {
      setError("Revisa los campos marcados en rojo.");
      return;
    }

    // =====================================================
    // DATOS QUE ENVÍA EL FRONTEND (coinciden con UsuarioCreate)
    // =====================================================

    const formData = {
      rol_id: 2, // 2 = Cliente
      nombres: formulario.nombre,
      apellidos: formulario.apellido,
      tipo_documento: formulario.tipoDocumento,
      numero_documento: formulario.numeroDocumento,
      direccion: formulario.direccion,
      telefono: formulario.telefono,
      email: formulario.correo,
      password: formulario.contraseña,
    };

    setEnviando(true);

    try {
      // =====================================================
      // CONEXIÓN CON EL BACKEND FASTAPI
      // =====================================================

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/usuarios/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      // =====================================================
      // VERIFICAR RESPUESTA
      // FastAPI devuelve el objeto de usuario directo (201),
      // o {detail: "..."} cuando hay error (400/422/500)
      // =====================================================

      if (!response.ok) {
        const mensaje =
          typeof data.detail === "string"
            ? data.detail
            : "No fue posible registrar el usuario.";
        throw new Error(mensaje);
      }

      console.log("Usuario registrado:", data);

      // =====================================================
      // GUARDAR USUARIO
      // =====================================================

      localStorage.setItem("usuarioMugi", JSON.stringify(data));

      // =====================================================
      // ALERTA POSITIVA
      // =====================================================

      setAlerta("Cuenta creada correctamente");

      setTimeout(() => {
        setAlerta("");
      }, 3000);

      // =====================================================
      // AVISAR AL COMPONENTE PADRE
      // =====================================================

      if (typeof alRegistrar === "function") {
        alRegistrar(data);
      }
    } catch (error) {
      console.error("Error al registrar:", error);

      setError(
        error.message || "No fue posible registrar el usuario."
      );
    } finally {
      setEnviando(false);
    }
  };

  // =====================================================
  // ESTILO GENERAL DE INPUTS
  // =====================================================

  const estiloInput = `
    w-full
    rounded-2xl
    border
    border-[#D8BA98]
    bg-[#F8F3EA]
    px-4
    py-3
    text-sm
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
  `;

  const claseInput = (nombre) => `
    ${estiloInput}
    ${errores[nombre] ? "border-[#7F0303]" : ""}
  `;

  const requisitosContraseña = {
    longitud: formulario.contraseña.length >= 8,
    mayuscula: /[A-Z]/.test(formulario.contraseña),
    minuscula: /[a-z]/.test(formulario.contraseña),
    numero: /\d/.test(formulario.contraseña),
    especial: /[^A-Za-z0-9\s]/.test(formulario.contraseña),
  };

  const contraseñaValida = Object.values(requisitosContraseña).every(Boolean);

  const contadorCampo = (nombre, maximo) => (
    <span className="text-[10px] text-[#927E70] dark:text-[#C8B9B5]">
      {formulario[nombre].length}/{maximo}
    </span>
  );

  const hayErrores = Object.values(errores).some((msg) => msg !== "");

  // =====================================================
  // MODAL
  // =====================================================

  return (
    <>
      <Alerta mensaje={alerta} />

      {/* FONDO DEL MODAL */}

      <div
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-start
          justify-center
          overflow-y-auto
          bg-[#160B0C]/75
          px-4
          py-6
          backdrop-blur-md
          transition-colors
          duration-500
          sm:items-center
          sm:px-6
          sm:py-8
        "
        onClick={cerrarModal}
      >
        {/* CONTENEDOR PRINCIPAL */}

        <div
          className="
            relative
            my-2
            w-full
            max-w-2xl
            max-h-[94vh]
            overflow-y-auto
            overflow-x-hidden
            rounded-[32px]
            border
            border-[#D4AF37]/30
            bg-[#EFE8DF]
            shadow-[0_25px_80px_rgba(61,23,23,0.35)]
            transition-colors
            duration-500
            dark:border-[#D4AF37]/30
            dark:bg-[#241415]
            dark:shadow-[0_25px_80px_rgba(0,0,0,0.55)]
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* FOTO SUPERIOR */}

          <div className="relative h-44 overflow-hidden sm:h-52 md:h-56">
            <img
              src="/img/tripulacion.jpg"
              alt="Tripulación MUGI"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-[#3D1717]
                via-[#7F0303]/35
                to-transparent
                dark:from-[#160B0C]
                dark:via-[#160B0C]/45
              "
            />

            <div className="absolute bottom-0 left-0 h-1 w-full bg-[#D4AF37]" />

            <div className="absolute bottom-6 left-6 right-6 sm:left-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
                MUGI STORE
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
                Únete a la tripulación
              </h2>
            </div>
          </div>

          {/* BOTÓN CERRAR */}

          <button
            type="button"
            onClick={cerrarModal}
            aria-label="Cerrar"
            className="
              absolute
              right-5
              top-5
              z-20
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/30
              bg-[#3D1717]/70
              text-xl
              text-white
              backdrop-blur-sm
              transition-all
              duration-300
              hover:rotate-90
              hover:bg-[#D4AF37]
              hover:text-[#3D1717]
              dark:bg-[#160B0C]/80
            "
          >
            ×
          </button>

          {/* CONTENIDO */}

          <div className="p-6 sm:p-8 md:p-10">
            {/* CABECERA */}

            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-[#D4AF37]/30
                  bg-[#F8F3EA]
                  p-2
                  dark:border-[#D4AF37]/30
                  dark:bg-[#160B0C]
                "
              >
                <img src="/img/logo.png" alt="MUGI" className="h-full w-full object-contain" />
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold leading-none text-[#7F0303] dark:text-[#F8F3EA]">
                  Crear cuenta
                </h2>

                <p className="mt-2 text-sm text-[#765E52] dark:text-[#C8B9B5]">
                  Completa tus datos para formar parte de MUGI.
                </p>
              </div>
            </div>

            {/* ERROR GENERAL */}

            {error && (
              <div
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-[#7F0303]/20
                  bg-[#7F0303]/5
                  px-5
                  py-4
                  text-sm
                  font-medium
                  text-[#7F0303]
                  dark:border-[#8F1D24]/40
                  dark:bg-[#8F1D24]/15
                  dark:text-[#F8F3EA]
                "
              >
                ⚠️ {error}
              </div>
            )}

            {/* FORMULARIO */}

            <form onSubmit={crearCuenta} className="space-y-6">
              {/* SECCIÓN 01 */}

              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7F0303] text-[10px] font-bold text-white dark:bg-[#8F1D24]">
                    01
                  </span>

                  <h3 className="font-serif text-lg font-bold text-[#3D1717] dark:text-[#F8F3EA]">
                    Datos personales
                  </h3>

                  <div className="h-px flex-1 bg-[#D4AF37]/25" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* NOMBRE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#3D1717] dark:text-[#F8F3EA]">
                      Nombre
                    </label>

                    <input
                      type="text"
                      name="nombre"
                      value={formulario.nombre}
                      onChange={manejarCambio}
                      placeholder="Tu nombre"
                      maxLength={30}
                      required
                      className={claseInput("nombre")}
                    />

                    {errores.nombre && (
                      <p className="mt-1.5 text-xs text-[#7F0303] dark:text-[#F0CC55]">
                        {errores.nombre}
                      </p>
                    )}
                  </div>

                  {/* APELLIDO */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#3D1717] dark:text-[#F8F3EA]">
                      Apellido
                    </label>

                    <input
                      type="text"
                      name="apellido"
                      value={formulario.apellido}
                      onChange={manejarCambio}
                      placeholder="Tu apellido"
                      maxLength={30}
                      required
                      className={claseInput("apellido")}
                    />

                    {errores.apellido && (
                      <p className="mt-1.5 text-xs text-[#7F0303] dark:text-[#F0CC55]">
                        {errores.apellido}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* DOCUMENTOS */}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* TIPO DOCUMENTO */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3D1717] dark:text-[#F8F3EA]">
                    Tipo de documento
                  </label>

                  <select
                    name="tipoDocumento"
                    value={formulario.tipoDocumento}
                    onChange={manejarCambio}
                      maxLength={30}
                    required
                    className={claseInput("tipoDocumento")}
                  >
                    <option value="">Selecciona</option>
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="TI">Tarjeta de identidad</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>

                  {errores.tipoDocumento && (
                    <p className="mt-1.5 text-xs text-[#7F0303] dark:text-[#F0CC55]">
                      {errores.tipoDocumento}
                    </p>
                  )}
                </div>

                {/* NUMERO DOCUMENTO */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3D1717] dark:text-[#F8F3EA]">
                    Número de documento
                  </label>

                  <input
                    type="text"
                    name="numeroDocumento"
                    value={formulario.numeroDocumento}
                    onChange={manejarCambio}
                    maxLength={15}
                    placeholder="123456789"
                    required
                    className={claseInput("numeroDocumento")}
                  />

                  {errores.numeroDocumento && (
                    <p className="mt-1.5 text-xs text-[#7F0303] dark:text-[#F0CC55]">
                      {errores.numeroDocumento}
                    </p>
                  )}
                </div>
              </div>

              {/* DIRECCIÓN */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#3D1717] dark:text-[#F8F3EA]">
                  Dirección
                </label>

                <input
                  type="text"
                  name="direccion"
                  value={formulario.direccion}
                  onChange={manejarCambio}
                  placeholder="Calle, carrera, número"
                  maxLength={50}
                  required
                  className={claseInput("direccion")}
                />

                {errores.direccion && (
                  <p className="mt-1.5 text-xs text-[#7F0303] dark:text-[#F0CC55]">
                    {errores.direccion}
                  </p>
                )}
              </div>

              {/* SECCIÓN 02 */}

              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7F0303] text-[10px] font-bold text-white dark:bg-[#8F1D24]">
                    02
                  </span>

                  <h3 className="font-serif text-lg font-bold text-[#3D1717] dark:text-[#F8F3EA]">
                    Datos de contacto
                  </h3>

                  <div className="h-px flex-1 bg-[#D4AF37]/25" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* CORREO */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#3D1717] dark:text-[#F8F3EA]">
                      Correo electrónico
                    </label>

                    <input
                      type="email"
                      name="correo"
                      value={formulario.correo}
                      onChange={manejarCambio}
                      placeholder="correo@ejemplo.com"
                      maxLength={50}
                      required
                      className={claseInput("correo")}
                    />

                    {errores.correo && (
                      <p className="mt-1.5 text-xs text-[#7F0303] dark:text-[#F0CC55]">
                        {errores.correo}
                      </p>
                    )}
                    <div className="mt-1 flex justify-end">
                      {contadorCampo("correo", 150)}
                    </div>
                  </div>

                  {/* TELEFONO */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#3D1717] dark:text-[#F8F3EA]">
                      Teléfono
                    </label>

                    <input
                      type="tel"
                      name="telefono"
                      value={formulario.telefono}
                      onChange={manejarCambio}
                      placeholder="3000000000"
                      maxLength={10}
                      required
                      className={claseInput("telefono")}
                    />

                    {errores.telefono && (
                      <p className="mt-1.5 text-xs text-[#7F0303] dark:text-[#F0CC55]">
                        {errores.telefono}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 03 */}

              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7F0303] text-[10px] font-bold text-white dark:bg-[#8F1D24]">
                    03
                  </span>

                  <h3 className="font-serif text-lg font-bold text-[#3D1717] dark:text-[#F8F3EA]">
                    Seguridad
                  </h3>

                  <div className="h-px flex-1 bg-[#D4AF37]/25" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* CONTRASEÑA */}
                  <div className="relative">
                    <label className="mb-2 block text-sm font-semibold text-[#3D1717] dark:text-[#F8F3EA]">
                      Contraseña
                    </label>

                    <input
                      type="password"
                      name="contraseña"
                      value={formulario.contraseña}
                      onChange={manejarCambio}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                      placeholder="Mínimo 8 caracteres"
                      maxLength={72}
                      required
                      className={claseInput("contraseña")}
                    />

                    {errores.contraseña && (
                      <p className="mt-1.5 text-xs text-[#7F0303] dark:text-[#F0CC55]">
                        {errores.contraseña}
                      </p>
                    )}

                    <div className="mt-1 flex justify-end">
                      {contadorCampo("contraseña", 72)}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                      {[
                        [requisitosContraseña.longitud, "8-72 caracteres"],
                        [requisitosContraseña.mayuscula, "Una mayúscula"],
                        [requisitosContraseña.minuscula, "Una minúscula"],
                        [requisitosContraseña.numero, "Un número"],
                        [requisitosContraseña.especial, "Un carácter especial"],
                      ].map(([cumple, texto]) => (
                        <span
                          key={texto}
                          className={cumple ? "text-green-600" : "text-[#927E70]"}
                        >
                          {cumple ? "✓" : "○"} {texto}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={generarContraseñaSegura}
                      className="mt-4 text-sm font-semibold text-[#7F0303] underline-offset-4 transition hover:underline dark:text-[#F0CC55]"
                    >
                      Generar contraseña segura
                    </button>
                  </div>

                  {/* CONFIRMAR CONTRASEÑA */}
                  <div className="relative">
                    <label className="mb-2 block text-sm font-semibold text-[#3D1717] dark:text-[#F8F3EA]">
                      Confirmar contraseña
                    </label>

                    <input
                      type="password"
                      name="confirmarContraseña"
                      value={formulario.confirmarContraseña}
                      onChange={manejarCambio}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                      placeholder="Repite la contraseña"
                      maxLength={72}
                      required
                      className={claseInput("confirmarContraseña")}
                    />

                    {errores.confirmarContraseña && (
                      <p className="mt-1.5 text-xs text-[#7F0303] dark:text-[#F0CC55]">
                        {errores.confirmarContraseña}
                      </p>
                    )}

                    <div className="mt-1 flex justify-end">
                      {contadorCampo("confirmarContraseña", 72)}
                    </div>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-[#D4AF37]/20 bg-white/40 p-4 text-sm text-[#765E52] dark:bg-[#160B0C]/40 dark:text-[#C8B9B5]">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#7F0303]"
                />
                <span>
                  Acepto los términos y condiciones y autorizo el tratamiento de mis datos personales.
                </span>
              </label>

              {/* BOTONES */}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                    disabled={hayErrores || !contraseñaValida || !aceptaTerminos || enviando}
                  className={`
                    flex-1 rounded-2xl px-6 py-4 font-semibold text-white shadow-lg
                    transition-all duration-300 active:scale-[0.98]
                    ${hayErrores || !contraseñaValida || !aceptaTerminos || enviando
                      ? "bg-[#7F0303]/40 cursor-not-allowed"
                      : "bg-[#7F0303] hover:-translate-y-1 hover:bg-[#52070A] hover:shadow-xl"}
                    dark:bg-[#D4AF37] dark:text-[#3D1717] dark:hover:bg-[#F0CC55]
                  `}
                >
                  {enviando ? "Creando cuenta..." : "Crear mi cuenta →"}
                </button>

                <button
                  type="button"
                  onClick={cerrarModal}
                  className="
                    rounded-2xl
                    border
                    border-[#D8BA98]
                    bg-[#F8F3EA]
                    px-7
                    py-4
                    font-semibold
                    text-[#765E52]
                    transition-all
                    duration-300
                    hover:border-[#D4AF37]
                    hover:bg-[#D4AF37]/10
                    hover:text-[#7F0303]
                    dark:border-[#D4AF37]/25
                    dark:bg-[#160B0C]
                    dark:text-[#F8F3EA]
                    dark:hover:border-[#D4AF37]
                    dark:hover:bg-[#D4AF37]/10
                    dark:hover:text-[#D4AF37]
                  "
                >
                  Cancelar
                </button>
              </div>

              {/* TEXTO FINAL */}

              <p className="pt-1 text-center text-xs leading-relaxed text-[#927E70] dark:text-[#C8B9B5]">
                Al crear tu cuenta podrás guardar tus datos y disfrutar de tu experiencia en MUGI STORE.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}