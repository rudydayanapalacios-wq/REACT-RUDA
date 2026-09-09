// ============================================================
// PÁGINA ¿QUIÉNES SOMOS?
// ============================================================

// ============================================================
// IMPORTACIONES
// ============================================================

import { Link } from "react-router-dom";



// ============================================================
// COMPONENTE QUIÉNES SOMOS
// ============================================================

function QuienesSomos() {
  return (
    <main
      className="
        min-h-screen
        bg-[#EFE8DF]
        text-[#52070A]
        transition-colors
        duration-300
        dark:bg-[#160B0C]
        dark:text-[#F8F3EA]
      "
    >

      {/* ======================================================
          1. HERO
      ====================================================== */}

      <section
        className="
          relative
          flex
          min-h-[620px]
          items-center
          overflow-hidden
        "
      >

        {/* ====================================================
            FONDO
        ==================================================== */}

        <img
          src="/img/cielo2.jpg"
          alt=""
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        {/* ====================================================
            CAPA OSCURA
        ==================================================== */}

        <div
          className="
            absolute
            inset-0
            bg-[#52070A]/75
            transition-colors
            duration-300
            dark:bg-[#080D12]/85
          "
        />

        {/* ====================================================
            CONTENIDO HERO
        ==================================================== */}

        <div
          className="
            relative
            z-10
            mx-auto
            grid
            w-full
            max-w-6xl
            items-center
            gap-12
            px-6
            py-20
            lg:grid-cols-2
          "
        >

          {/* ==================================================
              TEXTO
          ================================================== */}

          <div className="text-white">

            <span
              className="
                mb-5
                inline-block
                text-xs
                font-bold
                uppercase
                tracking-[0.35em]
                text-[#D4AF37]
              "
            >
              Conoce nuestra historia
            </span>

            <h1
              className="
                font-serif
                text-5xl
                font-bold
                leading-tight
                md:text-6xl
                lg:text-7xl
              "
            >
              ¿Quiénes

              <span className="block text-[#D4AF37]">
                somos?
              </span>
            </h1>

            <p
              className="
                mt-6
                max-w-xl
                text-lg
                leading-relaxed
                text-white/90
              "
            >
              En MUGI creemos que una aventura no solamente
              se vive, también se lleva contigo.
            </p>

            <p
              className="
                mt-4
                max-w-xl
                leading-relaxed
                text-white/75
              "
            >
              Creamos accesorios inspirados en el universo
              de One Piece para quienes encuentran en cada
              viaje una nueva historia que contar.
            </p>

          </div>


          {/* ==================================================
              LOGO MUGI STORE
          ================================================== */}

          <div className="relative">

            {/* MARCO DECORATIVO */}

            <div
              className="
                absolute
                -inset-4
                rotate-3
                rounded-[40px]
                border
                border-[#D4AF37]/50
              "
            />

            {/* CONTENEDOR DEL LOGO */}

            <div
              className="
                relative
                rotate-1
                overflow-hidden
                rounded-[35px]
                border-4
                border-[#D4AF37]
                bg-[#F8F3EA]
                shadow-2xl
                transition-colors
                duration-300
                dark:bg-[#241415]
              "
            >

              <div
                className="
                  flex
                  h-[430px]
                  w-full
                  items-center
                  justify-center
                  p-10
                  md:p-14
                "
              >

                <img
                  src="/img/logo.png"
                  alt="MUGI STORE"
                  className="
                    h-full
                    w-full
                    object-contain
                    transition-transform
                    duration-500
                    hover:scale-105
                  "
                />

              </div>

            </div>


            {/* ETIQUETA */}

            <div
              className="
                absolute
                -bottom-5
                -left-5
                rounded-2xl
                bg-[#7F0303]
                px-6
                py-3
                font-bold
                text-white
                shadow-xl
                transition-colors
                duration-300
                dark:bg-[#8F1D24]
              "
            >
              ⚓ Espíritu aventurero
            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          2. NUESTRA HISTORIA
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-[#EFE8DF]
          px-6
          py-24
          transition-colors
          duration-300
          dark:bg-[#160B0C]
        "
      >

        {/* PERGAMINO */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.10]
            dark:opacity-[0.04]
          "
        >

          <img
            src="/img/pergamino.png"
            alt=""
            className="
              h-full
              w-full
              object-cover
            "
          />

        </div>


        {/* CONTENIDO */}

        <div
          className="
            relative
            z-10
            mx-auto
            max-w-5xl
          "
        >

          <div
            className="
              rounded-[35px]
              border
              border-[#D4AF37]/30
              bg-[#F8F3EA]/95
              p-8
              shadow-xl
              transition-colors
              duration-300
              md:p-12
              dark:bg-[#241415]/95
              dark:border-[#6B4540]
            "
          >

            {/* TÍTULO */}

            <div className="text-center">

              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.35em]
                  text-[#D4AF37]
                "
              >
                Nuestra historia
              </span>

              <h2
                className="
                  mt-4
                  font-serif
                  text-4xl
                  font-bold
                  text-[#7F0303]
                  transition-colors
                  duration-300
                  md:text-5xl
                  dark:text-[#D4AF37]
                "
              >
                Una tienda nacida del Grand Line
              </h2>

            </div>


            {/* PÁRRAFOS */}

            <div
              className="
                mt-10
                grid
                gap-8
                leading-relaxed
                text-[#52070A]/80
                transition-colors
                duration-300
                md:grid-cols-2
                dark:text-[#F8F3EA]/80
              "
            >

              <p>
                MUGI nace de una idea sencilla: crear un espacio
                donde los fans de One Piece puedan encontrar
                accesorios que representen aquello que más
                disfrutan de esta increíble aventura.
              </p>

              <p>
                No buscamos llenar una colección de objetos.
                Queremos crear piezas que puedas incorporar
                a tu estilo y que, al mismo tiempo, tengan
                ese pequeño detalle que recuerde al mundo
                de los Sombrero de Paja.
              </p>

              <p>
                Desde collares y pulseras hasta anillos,
                aretes, relojes y diferentes accesorios,
                nuestra colección está pensada para llevar
                un pedacito del Grand Line contigo.
              </p>

              <p>
                Porque para nosotros One Piece representa
                mucho más que una historia: representa
                aventura, amistad, libertad y el valor de
                perseguir nuestros propios sueños.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          3. NUESTRA INSPIRACIÓN
      ====================================================== */}

      <section
        className="
          bg-[#F8F3EA]
          px-6
          py-24
          transition-colors
          duration-300
          dark:bg-[#241415]
        "
      >

        <div
          className="
            mx-auto
            grid
            max-w-6xl
            items-center
            gap-12
            lg:grid-cols-2
          "
        >

          {/* IMAGEN */}

          <div className="relative">

            <div
              className="
                overflow-hidden
                rounded-[35px]
                border-4
                border-[#D4AF37]
                shadow-2xl
              "
            >

              <img
                src="/img/tripulacion.jpg"
                alt="Tripulación"
                className="
                  h-[420px]
                  w-full
                  object-cover
                "
              />

            </div>

          </div>


          {/* TEXTO */}

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
              Nuestra inspiración
            </span>

            <h2
              className="
                mt-4
                font-serif
                text-4xl
                font-bold
                text-[#7F0303]
                transition-colors
                duration-300
                md:text-5xl
                dark:text-[#D4AF37]
              "
            >
              Más que una tripulación
            </h2>

            <p
              className="
                mt-6
                leading-relaxed
                text-[#52070A]/75
                transition-colors
                duration-300
                dark:text-[#F8F3EA]/75
              "
            >
              Una de las cosas que más nos inspira de One Piece
              es la forma en que cada integrante de una tripulación
              tiene su propia personalidad, sus sueños y su manera
              de expresarse.
            </p>

            <p
              className="
                mt-4
                leading-relaxed
                text-[#52070A]/75
                transition-colors
                duration-300
                dark:text-[#F8F3EA]/75
              "
            >
              Por eso queremos que nuestros accesorios también
              permitan que cada persona encuentre algo que
              represente su propio estilo.
            </p>


            {/* FRASE */}

            <div
              className="
                mt-8
                border-l-4
                border-[#D4AF37]
                pl-6
              "
            >

              <p
                className="
                  font-serif
                  text-xl
                  italic
                  text-[#7F0303]
                  dark:text-[#D4AF37]
                "
              >
                "Cada aventura comienza con un sueño."
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  text-[#52070A]/50
                  dark:text-[#F8F3EA]/50
                "
              >
                — MUGI STORE
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          4. NUESTRA IDENTIDAD
      ====================================================== */}

      <section
        className="
          bg-[#52070A]
          px-6
          py-24
          text-white
          transition-colors
          duration-300
          dark:bg-[#0B1117]
        "
      >

        <div className="mx-auto max-w-6xl">

          {/* ENCABEZADO */}

          <div className="mb-14 text-center">

            <span
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.35em]
                text-[#D4AF37]
              "
            >
              Nuestra identidad
            </span>

            <h2
              className="
                mt-4
                font-serif
                text-4xl
                font-bold
                md:text-5xl
              "
            >
              ¿Qué representa MUGI?
            </h2>

          </div>


          {/* TARJETAS */}

          <div
            className="
              grid
              gap-8
              md:grid-cols-3
            "
          >

            {/* AVENTURA */}

            <article
              className="
                rounded-3xl
                border
                border-[#D4AF37]/20
                bg-[#7F0303]/40
                p-8
                text-center
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-[#D4AF37]/60
                hover:bg-[#7F0303]/60
                dark:bg-[#241415]
                dark:hover:bg-[#30191A]
              "
            >

              <div
                className="
                  mx-auto
                  mb-6
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-2
                  border-[#D4AF37]
                "
              >

                <img
                  src="/img/bandera.jpg"
                  alt="Bandera pirata"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />

              </div>

              <h3 className="mb-3 text-2xl font-bold">
                Aventura
              </h3>

              <p className="leading-relaxed text-white/70">
                Queremos que cada accesorio recuerde que
                siempre hay un nuevo lugar por descubrir.
              </p>

            </article>


            {/* LIBERTAD */}

            <article
              className="
                rounded-3xl
                border
                border-[#D4AF37]/20
                bg-[#7F0303]/40
                p-8
                text-center
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-[#D4AF37]/60
                hover:bg-[#7F0303]/60
                dark:bg-[#241415]
                dark:hover:bg-[#30191A]
              "
            >

              <div
                className="
                  mx-auto
                  mb-6
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-[#D4AF37]
                  bg-[#7F0303]
                  text-3xl
                  dark:bg-[#8F1D24]
                "
              >
                🌊
              </div>

              <h3 className="mb-3 text-2xl font-bold">
                Libertad
              </h3>

              <p className="leading-relaxed text-white/70">
                Tu estilo es tuyo. Elige las piezas que
                realmente representen quién eres.
              </p>

            </article>


            {/* TRIPULACIÓN */}

            <article
              className="
                rounded-3xl
                border
                border-[#D4AF37]/20
                bg-[#7F0303]/40
                p-8
                text-center
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-[#D4AF37]/60
                hover:bg-[#7F0303]/60
                dark:bg-[#241415]
                dark:hover:bg-[#30191A]
              "
            >

              <div
                className="
                  mx-auto
                  mb-6
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-[#D4AF37]
                  bg-[#7F0303]
                  text-3xl
                  dark:bg-[#8F1D24]
                "
              >
                ☠
              </div>

              <h3 className="mb-3 text-2xl font-bold">
                Tripulación
              </h3>

              <p className="leading-relaxed text-white/70">
                Las mejores aventuras se comparten con
                las personas que hacen especial el viaje.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* ======================================================
          5. CIERRE
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-[#EFE8DF]
          px-6
          py-24
          transition-colors
          duration-300
          md:px-10
          md:py-32
          dark:bg-[#160B0C]
        "
      >

        {/* LÍNEA DECORATIVA */}

        <div
          className="
            absolute
            left-1/2
            top-0
            h-px
            w-32
            -translate-x-1/2
            bg-[#D4AF37]
          "
        />


        {/* OLAS */}

        <img
          src="/img/olas2.jpg"
          alt=""
          className="
            absolute
            bottom-0
            left-0
            h-48
            w-full
            object-cover
            opacity-[0.12]
            mix-blend-multiply
            dark:opacity-[0.05]
          "
        />


        {/* CONTENIDO */}

        <div
          className="
            relative
            z-10
            mx-auto
            max-w-4xl
            text-center
          "
        >

          {/* ETIQUETA */}

          <span
            className="
              inline-block
              text-xs
              font-bold
              uppercase
              tracking-[0.4em]
              text-[#D4AF37]
            "
          >
            El próximo destino
          </span>


          {/* TÍTULO */}

          <h2
            className="
              mt-5
              font-serif
              text-4xl
              font-bold
              leading-tight
              text-[#7F0303]
              transition-colors
              duration-300
              md:text-6xl
              dark:text-[#D4AF37]
            "
          >
            Tu aventura

            <span
              className="
                block
                text-[#52070A]
                dark:text-[#F8F3EA]
              "
            >
              apenas comienza
            </span>

          </h2>


          {/* DECORACIÓN */}

          <div
            className="
              mx-auto
              mt-7
              flex
              items-center
              justify-center
              gap-3
            "
          >

            <span className="h-px w-16 bg-[#D4AF37]/60" />

            <span className="text-[#D4AF37]">
              ✦
            </span>

            <span className="h-px w-16 bg-[#D4AF37]/60" />

          </div>


          {/* DESCRIPCIÓN */}

          <p
            className="
              mx-auto
              mt-7
              max-w-2xl
              text-base
              leading-relaxed
              text-[#52070A]/70
              transition-colors
              duration-300
              md:text-lg
              dark:text-[#F8F3EA]/70
            "
          >
            Explora nuestra colección y encuentra ese accesorio
            que represente tu estilo, tus aventuras y aquello
            que te inspira a seguir navegando.
          </p>


          {/* BOTÓN */}

          <div className="mt-10">

            <Link
              to="/productos"
              className="
                inline-flex
                items-center
                gap-3
                rounded-full
                bg-[#7F0303]
                px-8
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#52070A]
                hover:shadow-xl
                dark:bg-[#8F1D24]
                dark:hover:bg-[#7F0303]
              "
            >

              Explorar productos

              <span className="text-lg">
                →
              </span>

            </Link>

          </div>


          {/* FRASE FINAL */}

          <div
            className="
              mx-auto
              mt-14
              max-w-xl
              border-t
              border-[#D4AF37]/30
              pt-8
            "
          >

            <p
              className="
                font-serif
                text-lg
                italic
                text-[#7F0303]/80
                transition-colors
                duration-300
                md:text-xl
                dark:text-[#D4AF37]/80
              "
            >
              "Cada gran aventura comienza
              dando el primer paso."
            </p>

            <p
              className="
                mt-3
                text-xs
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#52070A]/50
                dark:text-[#F8F3EA]/50
              "
            >
              — MUGI.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}


// ============================================================
// EXPORTACIÓN
// ============================================================

export default QuienesSomos;