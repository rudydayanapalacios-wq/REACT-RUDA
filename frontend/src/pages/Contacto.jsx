// ============================================================
// PÁGINA CONTACTO - MUGI STORE
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import instagram from "../assets/icons/instagram.png";
import whatsapp from "../assets/icons/whatsaap.png";
import facebook from "../assets/icons/facebook.png";

import { useAuth } from "../context/AuthContext";

// ============================================================
// COMPONENTE CONTACTO
// ============================================================

function Contacto() {
  const navigate = useNavigate();
  const { usuario, token } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL;

  // ==========================================================
  // ESTADOS PQR
  // ==========================================================

  const [tipo, setTipo] = useState("Queja");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // ==========================================================
  // ENVIAR PQR
  // ==========================================================

  const enviarPqr = async (e) => {
    e.preventDefault();

    // ========================================================
    // VERIFICAR SESIÓN
    // ========================================================

    if (!token || !usuario) {
      navigate("/login");
      return;
    }

    // ========================================================
    // VALIDAR CAMPOS
    // ========================================================

    if (
      !tipo.trim() ||
      !asunto.trim() ||
      !descripcion.trim()
    ) {
      setError(
        "Completa todos los campos antes de enviar la PQR."
      );
      setMensaje("");
      return;
    }

    try {
      setEnviando(true);
      setError("");
      setMensaje("");

      // ======================================================
      // ENVIAR PQR AL BACKEND
      // ======================================================

      const respuesta = await fetch(`${API_URL}/pqr/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          tipo: tipo.trim(),
          asunto: asunto.trim(),
          descripcion: descripcion.trim(),
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo enviar la PQR."
        );
      }

      // ======================================================
      // ÉXITO
      // ======================================================

      setMensaje(
        "Tu PQR fue enviada correctamente. El equipo de MUGI la revisará."
      );

      setError("");

      setTipo("Queja");
      setAsunto("");
      setDescripcion("");
    } catch (error) {
      console.error("Error enviando PQR:", error);

      setError(
        error.message || "No se pudo enviar la PQR."
      );

      setMensaje("");
    } finally {
      setEnviando(false);
    }
  };

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <main
      className="
        min-h-screen
        bg-[#EFE8DF]
        text-[#52070A]
        transition-colors
        duration-500
        dark:bg-[#160304]
        dark:text-[#F8F3EA]
      "
    >

      {/* ======================================================
          1. HERO
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          px-6
          pb-20
          pt-16
          md:px-10
          md:pt-24
        "
      >

        {/* DECORACIÓN SUPERIOR */}

        <div
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-80
            w-80
            rounded-full
            border
            border-[#D4AF37]/20
            dark:border-[#D4AF37]/25
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-40
            -left-32
            h-96
            w-96
            rounded-full
            border
            border-[#7F0303]/10
            dark:border-[#D4AF37]/10
          "
        />

        {/* LÍNEA DECORATIVA */}

        <div
          className="
            relative
            mx-auto
            mb-8
            h-px
            w-24
            bg-[#D4AF37]
          "
        />

        {/* CONTENIDO */}

        <div
          className="
            relative
            mx-auto
            max-w-4xl
            text-center
          "
        >

          <span
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.4em]
              text-[#D4AF37]
            "
          >
            Estamos aquí para escucharte
          </span>

          <h1
            className="
              mt-5
              font-serif
              text-5xl
              font-bold
              leading-tight
              text-[#7F0303]
              md:text-7xl
              dark:text-[#D4AF37]
            "
          >
            Contáctanos
          </h1>

          <p
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-base
              leading-relaxed
              text-[#52070A]/70
              md:text-lg
              dark:text-[#F8F3EA]/70
            "
          >
            ¿Tienes una pregunta, necesitas ayuda con tu pedido
            o simplemente quieres hablar con nuestra tripulación?
            Estamos listos para escucharte.
          </p>

        </div>
      </section>

      {/* ======================================================
          2. FORMULARIO + INFORMACIÓN
      ====================================================== */}

      <section
        className="
          px-6
          pb-24
          md:px-10
        "
      >

        <div
          className="
            mx-auto
            grid
            max-w-6xl
            gap-10
            lg:grid-cols-5
          "
        >

          {/* ==================================================
              FORMULARIO PQR
          ================================================== */}

          <div
            className="
              rounded-[40px]
              border
              border-[#D8BA98]
              bg-[#F8F3EA]
              p-8
              shadow-xl
              lg:col-span-3
              md:p-10
              dark:border-[#D4AF37]/20
              dark:bg-[#2A080A]
            "
          >

            <span
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.3em]
                text-[#D4AF37]
              "
            >
              Atención al cliente
            </span>

            <h2
              className="
                mt-4
                font-serif
                text-4xl
                font-bold
                text-[#7F0303]
                dark:text-[#F8F3EA]
              "
            >
              Envía tu PQR
            </h2>

            <p
              className="
                mt-4
                text-sm
                leading-relaxed
                text-[#52070A]/65
                dark:text-[#F8F3EA]/60
              "
            >
              Cuéntanos qué necesitas. Tu solicitud será enviada
              directamente al equipo de MUGI STORE.
            </p>

            {/* ==================================================
                AVISO DE SESIÓN
            ================================================== */}

            {!token && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-[#D4AF37]/30
                  bg-[#D4AF37]/10
                  p-4
                  text-sm
                  leading-relaxed
                  text-[#52070A]
                  dark:text-[#F8F3EA]
                "
              >
                <strong>Necesitas iniciar sesión</strong> para
                enviar una PQR. Puedes consultar el formulario,
                pero al enviarlo serás dirigido al inicio de sesión.
              </div>
            )}

            {/* ==================================================
                FORMULARIO
            ================================================== */}

            <form
              onSubmit={enviarPqr}
              className="mt-8 space-y-6"
            >

              {/* TIPO */}

              <div>
                <label
                  htmlFor="tipo"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[#52070A]
                    dark:text-[#F8F3EA]
                  "
                >
                  Tipo de solicitud *
                </label>

                <select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#D8BA98]
                    bg-white
                    px-5
                    py-3
                    text-[#52070A]
                    outline-none
                    transition
                    focus:border-[#D4AF37]
                    focus:ring-2
                    focus:ring-[#D4AF37]/20
                    dark:border-[#D4AF37]/20
                    dark:bg-[#160304]
                    dark:text-[#F8F3EA]
                  "
                >
                  <option value="Petición">
                    Petición
                  </option>

                  <option value="Queja">
                    Queja
                  </option>

                  <option value="Reclamo">
                    Reclamo
                  </option>

                  <option value="Sugerencia">
                    Sugerencia
                  </option>
                </select>
              </div>

              {/* ASUNTO */}

              <div>
                <label
                  htmlFor="asunto"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[#52070A]
                    dark:text-[#F8F3EA]
                  "
                >
                  Asunto *
                </label>

                <input
                  id="asunto"
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Escribe el asunto de tu solicitud"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#D8BA98]
                    bg-white
                    px-5
                    py-3
                    text-[#52070A]
                    outline-none
                    transition
                    placeholder:text-[#52070A]/35
                    focus:border-[#D4AF37]
                    focus:ring-2
                    focus:ring-[#D4AF37]/20
                    dark:border-[#D4AF37]/20
                    dark:bg-[#160304]
                    dark:text-[#F8F3EA]
                    dark:placeholder:text-[#F8F3EA]/30
                  "
                />
              </div>

              {/* DESCRIPCIÓN */}

              <div>
                <label
                  htmlFor="descripcion"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[#52070A]
                    dark:text-[#F8F3EA]
                  "
                >
                  Descripción *
                </label>

                <textarea
                  id="descripcion"
                  rows="6"
                  value={descripcion}
                  onChange={(e) =>
                    setDescripcion(e.target.value)
                  }
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                  className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-[#D8BA98]
                    bg-white
                    px-5
                    py-3
                    text-[#52070A]
                    outline-none
                    transition
                    placeholder:text-[#52070A]/35
                    focus:border-[#D4AF37]
                    focus:ring-2
                    focus:ring-[#D4AF37]/20
                    dark:border-[#D4AF37]/20
                    dark:bg-[#160304]
                    dark:text-[#F8F3EA]
                    dark:placeholder:text-[#F8F3EA]/30
                  "
                />
              </div>

              {/* ERROR */}

              {error && (
                <div
                  className="
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    p-4
                    text-sm
                    font-medium
                    text-red-700
                  "
                >
                  {error}
                </div>
              )}

              {/* MENSAJE ÉXITO */}

              {mensaje && (
                <div
                  className="
                    rounded-2xl
                    border
                    border-green-200
                    bg-green-50
                    p-4
                    text-sm
                    font-medium
                    text-green-700
                  "
                >
                  {mensaje}
                </div>
              )}

              {/* BOTÓN */}

              <button
                type="submit"
                disabled={enviando}
                className="
                  w-full
                  rounded-full
                  bg-[#7F0303]
                  px-8
                  py-4
                  font-bold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#D4AF37]
                  hover:text-[#52070A]
                  hover:shadow-xl
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {enviando
                  ? "Enviando PQR..."
                  : "Enviar PQR →"}
              </button>

            </form>

          </div>

          {/* ==================================================
              PANEL LATERAL
          ================================================== */}

          <aside
            className="
              rounded-[40px]
              bg-[#52070A]
              p-8
              text-white
              shadow-xl
              lg:col-span-2
              md:p-10
              dark:border
              dark:border-[#D4AF37]/20
              dark:bg-[#260506]
            "
          >

            <span
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.3em]
                text-[#D4AF37]
              "
            >
              Horarios
            </span>

            <h2
              className="
                mt-4
                font-serif
                text-4xl
                font-bold
              "
            >
              ¿Cuándo estamos?
            </h2>

            <p
              className="
                mt-5
                text-sm
                leading-relaxed
                text-white/70
              "
            >
              Nuestra tripulación está disponible para responder
              tus mensajes durante estos horarios.
            </p>

            {/* HORARIOS */}

            <div className="mt-10 space-y-5">

              <div
                className="
                  flex
                  flex-col
                  gap-1
                  border-b
                  border-white/15
                  pb-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <span className="text-white/75">
                  Lunes - Viernes
                </span>

                <span className="font-semibold text-[#D4AF37]">
                  8:00 AM - 6:00 PM
                </span>
              </div>

              <div
                className="
                  flex
                  flex-col
                  gap-1
                  border-b
                  border-white/15
                  pb-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <span className="text-white/75">
                  Sábados
                </span>

                <span className="font-semibold text-[#D4AF37]">
                  9:00 AM - 3:00 PM
                </span>
              </div>

              <div
                className="
                  flex
                  flex-col
                  gap-1
                  border-b
                  border-white/15
                  pb-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <span className="text-white/75">
                  Domingos
                </span>

                <span className="font-semibold text-[#D4AF37]">
                  Cerrado
                </span>
              </div>

            </div>

            {/* REDES */}

            <div className="mt-12">

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-[#D4AF37]
                "
              >
                Síguenos
              </p>

              <div className="mt-5 flex gap-4">

                {/* INSTAGRAM */}

                <a
                  href="#"
                  aria-label="Instagram"
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#D4AF37]/30
                    bg-white/5
                    p-3
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-[#D4AF37]
                    hover:shadow-lg
                  "
                >
                  <img
                    src={instagram}
                    alt="Instagram"
                    className="h-8 w-8 object-contain"
                  />
                </a>

                {/* WHATSAPP */}

                <a
                  href="#"
                  aria-label="WhatsApp"
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#D4AF37]/30
                    bg-white/5
                    p-3
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-[#D4AF37]
                    hover:shadow-lg
                  "
                >
                  <img
                    src={whatsapp}
                    alt="WhatsApp"
                    className="h-8 w-8 object-contain"
                  />
                </a>

                {/* FACEBOOK */}

                <a
                  href="#"
                  aria-label="Facebook"
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#D4AF37]/30
                    bg-white/5
                    p-3
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-[#D4AF37]
                    hover:shadow-lg
                  "
                >
                  <img
                    src={facebook}
                    alt="Facebook"
                    className="h-8 w-8 object-contain"
                  />
                </a>

              </div>

            </div>

            {/* FRASE */}

            <div
              className="
                mt-12
                border-t
                border-white/15
                pt-8
              "
            >

              <div className="text-4xl text-[#D4AF37]">
                ☠
              </div>

              <p
                className="
                  mt-4
                  font-serif
                  text-xl
                  italic
                  text-white/90
                "
              >
                "El mundo es más grande cuando se comparte
                la aventura."
              </p>

              <p
                className="
                  mt-3
                  text-xs
                  uppercase
                  tracking-widest
                  text-white/40
                "
              >
                — MUGI.
              </p>

            </div>

          </aside>

        </div>

      </section>

      {/* ======================================================
          3. PREGUNTAS FRECUENTES
      ====================================================== */}

      <section
        className="
          bg-[#F8F3EA]
          px-6
          py-24
          md:px-10
          dark:bg-[#1D0405]
        "
      >

        <div className="mx-auto max-w-4xl">

          {/* ENCABEZADO */}

          <div className="text-center">

            <span
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.3em]
                text-[#D4AF37]
              "
            >
              Preguntas frecuentes
            </span>

            <h2
              className="
                mt-4
                font-serif
                text-4xl
                font-bold
                text-[#7F0303]
                md:text-5xl
                dark:text-[#F8F3EA]
              "
            >
              Antes de enviarnos un mensaje
            </h2>

          </div>

          {/* FAQ */}

          <div className="mt-12 space-y-4">

            {[
              {
                pregunta:
                  "¿Cómo puedo saber el estado de mi pedido?",

                respuesta:
                  "Puedes escribirnos indicando tu número de pedido y nuestro equipo te ayudará a consultar su estado.",
              },

              {
                pregunta:
                  "¿Puedo solicitar información sobre un producto?",

                respuesta:
                  'Claro. Puedes enviar una PQR seleccionando el tipo de solicitud correspondiente y explicándonos qué producto quieres consultar.',
              },

              {
                pregunta:
                  "¿Cómo puedo comunicarme con ustedes?",

                respuesta:
                  "Puedes utilizar nuestro formulario de PQR o comunicarte mediante nuestros canales de contacto.",
              },

              {
                pregunta:
                  "¿Dónde están ubicados?",

                respuesta:
                  "Nuestra tienda se encuentra en Medellín, Colombia.",
              },
            ].map((faq, index) => (

              <details
                key={index}
                className="
                  group
                  rounded-2xl
                  border
                  border-[#D8BA98]
                  bg-[#EFE8DF]
                  p-6
                  transition-all
                  hover:border-[#D4AF37]
                  dark:border-[#D4AF37]/20
                  dark:bg-[#260506]
                "
              >

                <summary
                  className="
                    cursor-pointer
                    list-none
                    font-semibold
                    text-[#7F0303]
                    dark:text-[#D4AF37]
                  "
                >
                  {faq.pregunta}
                </summary>

                <p
                  className="
                    mt-4
                    leading-relaxed
                    text-[#52070A]/70
                    dark:text-[#F8F3EA]/65
                  "
                >
                  {faq.respuesta}
                </p>

              </details>

            ))}

          </div>

        </div>

      </section>

      {/* ======================================================
          4. CIERRE
      ====================================================== */}

      <section
        className="
          bg-[#EFE8DF]
          px-6
          py-20
          text-center
          dark:bg-[#160304]
        "
      >

        <div className="mx-auto max-w-2xl">

          <div className="text-4xl text-[#D4AF37]">
            ⚓
          </div>

          <h2
            className="
              mt-5
              font-serif
              text-3xl
              font-bold
              text-[#7F0303]
              dark:text-[#D4AF37]
            "
          >
            Siempre hay un nuevo destino
          </h2>

          <p
            className="
              mt-4
              leading-relaxed
              text-[#52070A]/65
              dark:text-[#F8F3EA]/60
            "
          >
            Gracias por formar parte de nuestra aventura.
            Estamos listos para navegar contigo.
          </p>

        </div>

      </section>

    </main>
  );
}

// ============================================================
// EXPORTACIÓN
// ============================================================

export default Contacto;
