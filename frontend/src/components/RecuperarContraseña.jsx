import { useState } from "react";
import { useNavigate } from "react-router-dom";


function RecuperarContrasena() {

  const navigate = useNavigate();

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // ==========================================================
  // VALIDAR CORREO
  // ==========================================================

  const validarCorreo = (valor) => {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!valor.trim()) {
      setError("El correo es obligatorio.");
      return false;
    }

    if (!regex.test(valor)) {
      setError("Ingresa un correo válido.");
      return false;
    }

    setError("");

    return true;
  };

  // ==========================================================
  // CAMBIO DEL CORREO
  // ==========================================================

  const handleChange = (e) => {

    const valor = e.target.value;

    setCorreo(valor);

    validarCorreo(valor);

    setMensaje("");
  };

  // ==========================================================
  // ENVIAR FORMULARIO
  // ==========================================================
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validarCorreo(correo)) {
    return;
  }

  setError("");
  setMensaje("");

  try {
    const respuesta = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/recuperar`,
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

    const datos = await respuesta.json();

    console.log("=================================");
    console.log("RESPUESTA RECUPERACIÓN");
    console.log(datos);
    console.log("=================================");

    if (!respuesta.ok) {
      setError(
        datos.detail ||
          datos.message ||
          "No se pudo enviar el correo de recuperación."
      );
      return;
    }

    setMensaje(
      datos.message ||
        `Hemos enviado instrucciones de recuperación a ${correo}`
    );
  } catch (error) {
    console.error("Error en recuperación:", error);

    setError(
      "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose."
    );
  }
};
  // ==========================================================
  // VOLVER AL LOGIN
  // ==========================================================

  const volverLogin = () => {
    navigate("/login");
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

      {/* ======================================================
          CONTENEDOR PRINCIPAL
      ====================================================== */}

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

          {/* ==================================================
              DEGRADADO
          ================================================== */}

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

          {/* ==================================================
              TEXTO SOBRE LA IMAGEN
          ================================================== */}

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
            onClick={volverLogin}

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
            ← Volver al inicio de sesión
          </button>


          <div className="max-w-xl">

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
              Recuperar contraseña
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
              Ingresa el correo asociado a tu cuenta y te
              enviaremos instrucciones para recuperar el acceso.
            </p>


            {/* ==================================================
                FORMULARIO
            ================================================== */}

            <form
              onSubmit={handleSubmit}

              className="
                space-y-6
              "
            >

              {/* ==================================================
                  CORREO
              ================================================== */}

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

                  onChange={handleChange}

                  placeholder="correo@ejemplo.com"

                  required

                  className={`
                    w-full

                    rounded-2xl

                    border

                    ${
                      error
                        ? "border-[#7F0303]"
                        : "border-[#D8BA98]"
                    }

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
                  `}
                />

                {/* ERROR */}

                {error && (

                  <p
                    className="
                      mt-3

                      text-sm

                      font-medium

                      text-[#7F0303]

                      dark:text-[#F0CC55]
                    "
                  >
                    {error}
                  </p>

                )}

              </div>


              {/* ==================================================
                  MENSAJE DE ÉXITO
              ================================================== */}

              {mensaje && (

                <div
                  className="
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
                  BOTÓN
              ================================================== */}

              <button
                type="submit"

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

                  hover:bg-[#52070A]

                  hover:shadow-xl

                  active:scale-[0.98]

                  dark:bg-[#D4AF37]

                  dark:text-[#3D1717]

                  dark:shadow-[#D4AF37]/10

                  dark:hover:bg-[#F0CC55]
                "
              >
                Recuperar contraseña
              </button>

            </form>


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