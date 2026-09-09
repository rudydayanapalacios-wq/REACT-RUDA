import { Link } from "react-router-dom";

function Banner() {
  return (
    <section className="h-full w-full">
      <div
        className="
          relative
          flex
          h-full
          min-h-[600px]
          overflow-hidden
          rounded-[40px]
          border
          border-[#D4AF37]/40
          dark:border-[#D4AF37]/25
          bg-cover
          bg-center
          shadow-[0_25px_70px_rgba(80,40,20,0.18)]
          dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)]
          transition-all
          duration-500
        "
        style={{
   backgroundImage: 'url("/img/mar_arena.png")',
        }}
      >
        {/* CAPA DE LUZ */}
        <div
          className="
            absolute
            inset-0
            bg-[#F8F3EA]/55
            dark:bg-[#160B0C]/80
            transition-colors
            duration-500
          "
        />

        {/* DEGRADADO */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-br
            from-[#F8F3EA]/90
            via-transparent
            to-[#B89563]/25
            dark:from-[#160B0C]/90
            dark:via-[#241415]/60
            dark:to-[#7F0303]/40
            transition-all
            duration-500
          "
        />

        {/* MARCO INTERIOR */}
        <div
          className="
            pointer-events-none
            absolute
            inset-4
            rounded-[32px]
            border
            border-[#D4AF37]/30
            dark:border-[#D4AF37]/25
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-6
            rounded-[28px]
            border
            border-[#7F0303]/10
            dark:border-[#D4AF37]/10
          "
        />

        {/* DETALLES DECORATIVOS */}
        <div
          className="
            absolute
            -right-20
            -top-20
            h-52
            w-52
            rounded-full
            border
            border-[#D4AF37]/25
            dark:border-[#D4AF37]/20
          "
        />

        <div
          className="
            absolute
            -right-10
            -top-10
            h-32
            w-32
            rounded-full
            border
            border-[#D4AF37]/20
            dark:border-[#D4AF37]/15
          "
        />

        <div
          className="
            absolute
            bottom-10
            right-10
            text-6xl
            text-[#7F0303]/10
            dark:text-[#D4AF37]/10
          "
        >
          ⚓
        </div>

        {/* CONTENIDO */}
        <div
          className="
            relative
            z-10
            flex
            w-full
            flex-col
            justify-center
            px-8
            py-10
            md:px-12
            lg:px-14
          "
        >
          {/* ETIQUETA */}
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#D4AF37]" />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.4em]
                text-[#B89563]
                dark:text-[#D4AF37]
              "
            >
              MUGI. STORE
            </span>
          </div>

          {/* TÍTULO */}
          <h1
            className="
              mt-6
              max-w-xl
              font-serif
              text-4xl
              font-bold
              leading-[1.05]
              text-[#7F0303]
              dark:text-[#F8F3EA]
              transition-colors
              duration-500
              md:text-5xl
              lg:text-[3.6rem]
            "
          >
            Lleva la aventura
            <br />

            <span
              className="
                italic
                text-[#B89563]
                dark:text-[#D4AF37]
                transition-colors
                duration-500
              "
            >
              contigo.
            </span>
          </h1>

          {/* LÍNEA DECORATIVA */}
          <div className="mt-6 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />
            <span className="h-px w-20 bg-[#D4AF37]/70" />
            <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />
          </div>

          {/* DESCRIPCIÓN */}
          <p
            className="
              mt-6
              max-w-lg
              text-sm
              leading-7
              text-[#7F0303]/75
              dark:text-[#F8F3EA]/75
              transition-colors
              duration-500
              md:text-base
            "
          >
            Accesorios inspirados en los personajes,
            lugares y aventuras que hacen inolvidable
            el viaje por el Grand Line.
          </p>

          {/* BOTONES */}
          <div
            className="
              mt-8
              flex
              flex-wrap
              items-center
              gap-4
            "
          >
            <Link
              to="/productos"
              className="
                rounded-full
                border
                border-[#7F0303]
                dark:border-[#8F1D24]
                bg-[#7F0303]
                dark:bg-[#8F1D24]
                px-7
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-[#7F0303]/15
                dark:shadow-black/30
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#D4AF37]
                hover:bg-[#D4AF37]
                dark:hover:text-[#160B0C]
              "
            >
              Explorar colección
            </Link>

            <Link
              to="/quienes-somos"
              className="
                rounded-full
                border
                border-[#7F0303]/25
                dark:border-[#D4AF37]/30
                bg-[#F8F3EA]/50
                dark:bg-[#241415]/70
                px-6
                py-3
                text-sm
                font-semibold
                text-[#7F0303]
                dark:text-[#F8F3EA]
                backdrop-blur-sm
                transition-all
                duration-300
                hover:border-[#D4AF37]
                hover:bg-[#D4AF37]/10
              "
            >
              Nuestra historia
            </Link>
          </div>

          {/* INFORMACIÓN INFERIOR */}
          <div
            className="
              mt-8
              flex
              max-w-lg
              items-center
              gap-5
              border-t
              border-[#7F0303]/15
              dark:border-[#D4AF37]/20
              pt-5
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-[#B89563]
                  dark:text-[#D4AF37]
                "
              >
                Colección
              </p>

              <p
                className="
                  mt-1
                  font-serif
                  text-sm
                  font-semibold
                  text-[#7F0303]
                  dark:text-[#F8F3EA]
                "
              >
                Grand Line
              </p>
            </div>

            <span
              className="
                h-8
                w-px
                bg-[#7F0303]/15
                dark:bg-[#D4AF37]/20
              "
            />

            <div>
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-[#B89563]
                  dark:text-[#D4AF37]
                "
              >
                Inspiración
              </p>

              <p
                className="
                  mt-1
                  font-serif
                  text-sm
                  font-semibold
                  text-[#7F0303]
                  dark:text-[#F8F3EA]
                "
              >
                Sombrero de Paja
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
