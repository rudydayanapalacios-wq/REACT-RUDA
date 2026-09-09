import { Link } from "react-router-dom";

import facebook from "../assets/icons/facebook.png";
import instagram from "../assets/icons/instagram.png";
import whatsaap from "../assets/icons/whatsaap.png";

function Footer() {
  return (

    <footer
      className="
        bg-[#52070A]
        dark:bg-[#0F0809]

        text-white

        transition-colors
        duration-500
      "
    >

      {/* ======================================================
          CONTENIDO PRINCIPAL
      ====================================================== */}

      <div className="px-6 py-16 md:px-10">

        <div
          className="
            mx-auto
            grid
            max-w-6xl
            gap-12

            md:grid-cols-2
            lg:grid-cols-4
          "
        >

          {/* ==================================================
              MARCA
          ================================================== */}

          <div className="lg:col-span-1">

            <Link
              to="/"
              className="
                font-serif
                text-4xl
                font-bold
                text-white

                transition

                hover:text-[#D4AF37]
              "
            >
              MUGI.
            </Link>

            <p
              className="
                mt-5
                text-sm
                leading-relaxed
                text-white/60
              "
            >
              Una tienda inspirada en el espíritu de aventura,
              amistad y libertad del Grand Line.
            </p>

            <p
              className="
                mt-5
                font-serif
                text-lg
                italic
                text-[#D4AF37]
              "
            >
              Inspired by the Grand Line.
            </p>

          </div>


          {/* ==================================================
              NAVEGACIÓN
          ================================================== */}

          <div>

            <h3
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#D4AF37]
              "
            >
              Explora
            </h3>

            <ul className="mt-6 space-y-4">

              <li>
                <Link
                  to="/"
                  className="
                    text-sm
                    text-white/60
                    transition
                    hover:text-white
                  "
                >
                  Inicio
                </Link>
              </li>

              <li>
                <Link
                  to="/productos"
                  className="
                    text-sm
                    text-white/60
                    transition
                    hover:text-white
                  "
                >
                  Productos
                </Link>
              </li>

              <li>
                <Link
                  to="/quienes-somos"
                  className="
                    text-sm
                    text-white/60
                    transition
                    hover:text-white
                  "
                >
                  Quiénes somos
                </Link>
              </li>

              <li>
                <Link
                  to="/contacto"
                  className="
                    text-sm
                    text-white/60
                    transition
                    hover:text-white
                  "
                >
                  Contáctanos
                </Link>
              </li>

            </ul>

          </div>


          {/* ==================================================
              INFORMACIÓN
          ================================================== */}

          <div>

            <h3
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#D4AF37]
              "
            >
              Información
            </h3>

            <ul className="mt-6 space-y-4">

              <li className="text-sm text-white/60">
                Envíos
              </li>

              <li className="text-sm text-white/60">
                Cambios y devoluciones
              </li>

              <li className="text-sm text-white/60">
                Preguntas frecuentes
              </li>

              <li className="text-sm text-white/60">
                Términos y condiciones
              </li>

            </ul>

          </div>


          {/* ==================================================
              CONTACTO
          ================================================== */}

          <div>

            <h3
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#D4AF37]
              "
            >
              Contacto
            </h3>

            <div className="mt-6 space-y-4">

              <p className="text-sm text-white/60">
                ✉ contacto@mugi.com
              </p>

              <p className="text-sm text-white/60">
                ☎ +57 300 123 4567
              </p>

              <p className="text-sm text-white/60">
                📍 Medellín, Colombia
              </p>

            </div>


            {/* ==================================================
                REDES SOCIALES
            ================================================== */}

            <div className="mt-7">

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-widest
                  text-white/40
                "
              >
                Síguenos
              </p>

              <div className="mt-4 flex items-center gap-3">

                {/* WHATSAPP */}

                <button
                  type="button"
                  aria-label="WhatsApp"
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full

                    border
                    border-white/10

                    bg-white/5

                    p-2

                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:border-[#D4AF37]
                    hover:bg-[#D4AF37]
                  "
                >
                  <img
                    src={whatsaap}
                    alt="WhatsApp"
                    className="h-7 w-7 object-contain"
                  />
                </button>


                {/* INSTAGRAM */}

                <button
                  type="button"
                  aria-label="Instagram"
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full

                    border
                    border-white/10

                    bg-white/5

                    p-2

                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:border-[#D4AF37]
                    hover:bg-[#D4AF37]
                  "
                >
                  <img
                    src={instagram}
                    alt="Instagram"
                    className="h-7 w-7 object-contain"
                  />
                </button>


                {/* FACEBOOK */}

                <button
                  type="button"
                  aria-label="Facebook"
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full

                    border
                    border-white/10

                    bg-white/5

                    p-2

                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:border-[#D4AF37]
                    hover:bg-[#D4AF37]
                  "
                >
                  <img
                    src={facebook}
                    alt="Facebook"
                    className="h-8 w-8 object-contain"
                  />
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          FRASE
      ====================================================== */}

      <div
        className="
          border-y
          border-white/10

          px-6
          py-8

          text-center
        "
      >

        <p
          className="
            font-serif
            text-xl
            italic
            text-white/80

            md:text-2xl
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
            tracking-[0.3em]
            text-[#D4AF37]
          "
        >
          — MUGI.
        </p>

      </div>


      {/* ======================================================
          COPYRIGHT
      ====================================================== */}

      <div
        className="
          mx-auto
          flex
          max-w-6xl
          flex-col
          items-center
          justify-between
          gap-3

          px-6
          py-6

          text-center

          md:flex-row
          md:text-left
        "
      >

        <p className="text-xs text-white/60">
          © 2026 MUGI. Todos los derechos reservados.
        </p>

        <p className="text-xs text-white/40">
          Hecho con pasión por la aventura.
        </p>

      </div>

    </footer>
  );
}

export default Footer;