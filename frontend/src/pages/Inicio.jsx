import Ruleta from "../components/Ruleta";
import Banner from "../components/Banner";
import TarjetaAventura from "../components/TarjetaAventura";
import { Link } from "react-router-dom";

function Inicio() {
  return (
    <main
      className="
        min-h-screen
        bg-[#EFE8DF]
        text-[#52070A]
        transition-colors
        duration-500
        dark:bg-[#160B0B]
        dark:text-[#F8F3EA]
      "
    >

      {/* ======================================================
          1. HERO — BANNER + RULETA
      ====================================================== */}
      <section
        className="
          w-full
          px-4
          pt-24
          pb-12
          sm:px-6
          sm:pt-28
          md:px-8
          md:pt-32
          lg:px-10
          lg:pb-16
          xl:px-12
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-7xl
            flex-col
            gap-6
            sm:gap-8
            lg:grid
            lg:grid-cols-[1.15fr_0.85fr]
            lg:items-stretch
            lg:gap-8
          "
        >

          {/* ==================================================
              BANNER
          ================================================== */}
          <div
            className="
              flex
              w-full
              min-w-0
              items-stretch
              overflow-hidden
              rounded-[28px]
              sm:rounded-[32px]
              lg:h-[520px]
            "
          >
            <div className="flex w-full min-w-0">
              <Banner />
            </div>
          </div>

          {/* ==================================================
              RULETA
          ================================================== */}
          <div
            className="
              flex
              w-full
              min-w-0
              items-stretch
              overflow-hidden
              rounded-[28px]
              sm:rounded-[32px]
              lg:h-[520px]
            "
          >
            <div className="flex w-full min-w-0">
              <Ruleta />
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================
          2. PRODUCTOS DESTACADOS
      ====================================================== */}
      <section
        className="
          px-4
          py-16
          sm:px-6
          sm:py-20
          md:px-8
          lg:px-10
          lg:py-24
          transition-colors
          duration-500
        "
      >
        <div className="mx-auto w-full max-w-6xl">

          <div className="text-center">
            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#D4AF37]
                sm:tracking-[0.35em]
              "
            >
              Nuestra tripulación recomienda
            </span>

            <h2
              className="
                mt-4
                font-serif
                text-3xl
                font-bold
                text-[#7F0303]
                dark:text-[#D4AF37]
                transition-colors
                duration-500
                sm:text-4xl
                md:text-5xl
              "
            >
              Productos destacados
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-sm
                leading-relaxed
                text-[#0F414A]
                dark:text-[#E8DCD5]/80
                transition-colors
                duration-500
                sm:text-base
              "
            >
              Descubre algunos de los accesorios favoritos de
              nuestra tripulación y lleva contigo un pedacito
              del Grand Line.
            </p>
          </div>

          <div className="mt-8 sm:mt-10">
            <TarjetaAventura
              imagen="/img/tripulacion.jpg"
              titulo="Nuestra Aventura"
              descripcion="Inspirados por el mundo de One Piece."
            />
          </div>

          <div
            className="
              mt-8
              grid
              gap-6
              sm:mt-10
              sm:gap-8
              md:grid-cols-2
              lg:grid-cols-3
            "
          >

            {/* PRODUCTO 1 */}
            <article
              className="
                group
                overflow-hidden
                rounded-[28px]
                border
                border-[#D8BA98]
                bg-[#F8F3EA]
                shadow-sm
                transition-all
                duration-500
                hover:-translate-y-2
                hover:shadow-xl
                dark:border-[#D4AF37]/20
                dark:bg-[#211313]
              "
            >
              <div className="h-52 overflow-hidden sm:h-56">
                <img
                  src="/img/sombrero-luffy.jpg"
                  alt="Sombrero de Luffy"
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                />
              </div>

              <div className="p-6 sm:p-7">
                <span
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-widest
                    text-[#D4AF37]
                  "
                >
                  Colección Luffy
                </span>

                <h3
                  className="
                    mt-2
                    text-xl
                    font-bold
                    text-[#7F0303]
                    dark:text-[#F8F3EA]
                    sm:text-2xl
                  "
                >
                  Sombrero de Luffy
                </h3>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-relaxed
                    text-[#0F414A]
                    dark:text-[#E8DCD5]/75
                  "
                >
                  El accesorio más icónico del futuro Rey
                  de los Piratas.
                </p>

                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <span
                    className="
                      text-lg
                      font-bold
                      text-[#B89563]
                      dark:text-[#D4AF37]
                      sm:text-xl
                    "
                  >
                    $89.900
                  </span>

                  <button
                    type="button"
                    className="
                      rounded-full
                      bg-[#7F0303]
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-white
                      transition-all
                      duration-300
                      hover:bg-[#D4AF37]
                      dark:bg-[#8F2026]
                      dark:hover:bg-[#D4AF37]
                      dark:hover:text-[#160B0B]
                      sm:px-5
                    "
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </article>

            {/* PRODUCTO 2 */}
            <article
              className="
                group
                overflow-hidden
                rounded-[28px]
                border
                border-[#D8BA98]
                bg-[#F8F3EA]
                shadow-sm
                transition-all
                duration-500
                hover:-translate-y-2
                hover:shadow-xl
                dark:border-[#D4AF37]/20
                dark:bg-[#211313]
              "
            >
              <div className="h-52 overflow-hidden sm:h-56">
                <img
                  src="/img/katana-zoro.jpg"
                  alt="Katana de Zoro"
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                />
              </div>

              <div className="p-6 sm:p-7">
                <span
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-widest
                    text-[#D4AF37]
                  "
                >
                  Colección Zoro
                </span>

                <h3
                  className="
                    mt-2
                    text-xl
                    font-bold
                    text-[#7F0303]
                    dark:text-[#F8F3EA]
                    sm:text-2xl
                  "
                >
                  Katana de Zoro
                </h3>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-relaxed
                    text-[#0F414A]
                    dark:text-[#E8DCD5]/75
                  "
                >
                  Inspirada en las legendarias espadas del
                  espadachín de la tripulación.
                </p>

                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <span
                    className="
                      text-lg
                      font-bold
                      text-[#B89563]
                      dark:text-[#D4AF37]
                      sm:text-xl
                    "
                  >
                    $129.900
                  </span>

                  <button
                    type="button"
                    className="
                      rounded-full
                      bg-[#7F0303]
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-white
                      transition-all
                      duration-300
                      hover:bg-[#D4AF37]
                      dark:bg-[#8F2026]
                      dark:hover:bg-[#D4AF37]
                      dark:hover:text-[#160B0B]
                      sm:px-5
                    "
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </article>

            {/* PRODUCTO 3 */}
            <article
              className="
                group
                overflow-hidden
                rounded-[28px]
                border
                border-[#D8BA98]
                bg-[#F8F3EA]
                shadow-sm
                transition-all
                duration-500
                hover:-translate-y-2
                hover:shadow-xl
                dark:border-[#D4AF37]/20
                dark:bg-[#211313]
              "
            >
              <div className="h-52 overflow-hidden sm:h-56">
                <img
                  src="/img/collar-fruta-diablo.jpg"
                  alt="Log Pose"
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                />
              </div>

              <div className="p-6 sm:p-7">
                <span
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-widest
                    text-[#D4AF37]
                  "
                >
                  Colección Grand Line
                </span>

                <h3
                  className="
                    mt-2
                    text-xl
                    font-bold
                    text-[#7F0303]
                    dark:text-[#F8F3EA]
                    sm:text-2xl
                  "
                >
                  Log Pose
                </h3>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-relaxed
                    text-[#0F414A]
                    dark:text-[#E8DCD5]/75
                  "
                >
                  El compañero perfecto para cualquier
                  aventurero que quiera explorar nuevos mares.
                </p>

                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <span
                    className="
                      text-lg
                      font-bold
                      text-[#B89563]
                      dark:text-[#D4AF37]
                      sm:text-xl
                    "
                  >
                    $74.900
                  </span>

                  <button
                    type="button"
                    className="
                      rounded-full
                      bg-[#7F0303]
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-white
                      transition-all
                      duration-300
                      hover:bg-[#D4AF37]
                      dark:bg-[#8F2026]
                      dark:hover:bg-[#D4AF37]
                      dark:hover:text-[#160B0B]
                      sm:px-5
                    "
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* ======================================================
          3. POR QUÉ ELEGIR MUGI
      ====================================================== */}
      <section
        className="
          bg-[#F8F3EA]
          px-4
          py-20
          transition-colors
          duration-500
          dark:bg-[#211313]
          sm:px-6
          md:px-8
          lg:px-10
          lg:py-24
        "
      >
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#D4AF37]
                sm:tracking-[0.35em]
              "
            >
              Nuestra tripulación
            </span>

            <h2
              className="
                mt-4
                font-serif
                text-3xl
                font-bold
                text-[#7F0303]
                transition-colors
                duration-500
                dark:text-[#D4AF37]
                sm:text-4xl
                md:text-5xl
              "
            >
              ¿Por qué elegir MUGI.?
            </h2>
          </div>

          <div
            className="
              mt-10
              grid
              gap-6
              sm:mt-14
              sm:gap-8
              md:grid-cols-3
            "
          >

            <article
              className="
                rounded-3xl
                border
                border-[#D8BA98]
                bg-[#EFE8DF]
                p-6
                text-center
                transition-colors
                duration-500
                dark:border-[#D4AF37]/20
                dark:bg-[#160B0B]
                sm:p-8
              "
            >
              <div className="text-5xl">
                ⭐
              </div>

              <h3
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-[#7F0303]
                  dark:text-[#F8F3EA]
                "
              >
                Diseños únicos
              </h3>

              <p
                className="
                  mt-4
                  text-sm
                  leading-relaxed
                  text-[#0F414A]
                  dark:text-[#E8DCD5]/75
                "
              >
                Accesorios inspirados en el universo de
                One Piece y sus grandes aventuras.
              </p>
            </article>

            <article
              className="
                rounded-3xl
                border
                border-[#D8BA98]
                bg-[#EFE8DF]
                p-6
                text-center
                transition-colors
                duration-500
                dark:border-[#D4AF37]/20
                dark:bg-[#160B0B]
                sm:p-8
              "
            >
              <div className="text-5xl">
                📦
              </div>

              <h3
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-[#7F0303]
                  dark:text-[#F8F3EA]
                "
              >
                Envíos
              </h3>

              <p
                className="
                  mt-4
                  text-sm
                  leading-relaxed
                  text-[#0F414A]
                  dark:text-[#E8DCD5]/75
                "
              >
                Preparamos cada pedido con cuidado para que
                llegue hasta ti en las mejores condiciones.
              </p>
            </article>

            <article
              className="
                rounded-3xl
                border
                border-[#D8BA98]
                bg-[#EFE8DF]
                p-6
                text-center
                transition-colors
                duration-500
                dark:border-[#D4AF37]/20
                dark:bg-[#160B0B]
                sm:p-8
              "
            >
              <div className="text-5xl">
                ❤️
              </div>

              <h3
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-[#7F0303]
                  dark:text-[#F8F3EA]
                "
              >
                Hecho con pasión
              </h3>

              <p
                className="
                  mt-4
                  text-sm
                  leading-relaxed
                  text-[#0F414A]
                  dark:text-[#E8DCD5]/75
                "
              >
                Somos fans creando productos para otros fans
                que comparten nuestra pasión.
              </p>
            </article>

          </div>
        </div>
      </section>

      {/* ======================================================
          4. EXPERIENCIA MUGI
      ====================================================== */}
      <section
        className="
          px-4
          py-20
          transition-colors
          duration-500
          sm:px-6
          sm:py-24
          md:px-8
          lg:px-10
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-6xl
            items-center
            gap-8
            sm:gap-12
            lg:grid-cols-2
          "
        >

          <div>
            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#D4AF37]
                sm:tracking-[0.35em]
              "
            >
              Más que accesorios
            </span>

            <h2
              className="
                mt-4
                font-serif
                text-3xl
                font-bold
                text-[#7F0303]
                dark:text-[#D4AF37]
                sm:text-4xl
                md:text-5xl
              "
            >
              Lleva tu aventura contigo
            </h2>

            <p
              className="
                mt-6
                leading-relaxed
                text-[#0F414A]
                dark:text-[#E8DCD5]/75
              "
            >
              En MUGI. creemos que un accesorio puede contar
              una historia. Por eso nuestra colección está
              inspirada en los personajes, lugares y momentos
              que hacen especial cada aventura.
            </p>

            <p
              className="
                mt-5
                leading-relaxed
                text-[#0F414A]
                dark:text-[#E8DCD5]/75
              "
            >
              Queremos que cada pieza que encuentres aquí
              represente algo que te inspire y que puedas
              llevar contigo mucho después de cerrar el
              navegador.
            </p>

            <Link
              to="/quienes-somos"
              className="
                mt-8
                inline-block
                rounded-full
                bg-[#7F0303]
                px-7
                py-3
                font-semibold
                text-white
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#D4AF37]
                hover:shadow-xl
                dark:bg-[#8F2026]
                dark:hover:text-[#160B0B]
                sm:px-8
              "
            >
              Conoce nuestra historia
            </Link>
          </div>

          <div
            className="
              flex
              min-h-[320px]
              items-center
              justify-center
              rounded-[32px]
              border
              border-[#D4AF37]/30
              bg-[#F8F3EA]
              shadow-lg
              transition-colors
              duration-500
              dark:bg-[#211313]
              sm:min-h-[420px]
              sm:rounded-[40px]
            "
          >
            <div className="text-center">
              <div className="text-7xl sm:text-8xl">
                ☠️
              </div>

              <h3
                className="
                  mt-6
                  font-serif
                  text-3xl
                  font-bold
                  text-[#7F0303]
                  dark:text-[#D4AF37]
                  sm:text-4xl
                "
              >
                MUGI.
              </h3>

              <p
                className="
                  mt-3
                  text-xs
                  uppercase
                  tracking-[0.25em]
                  text-[#D4AF37]
                  sm:text-sm
                  sm:tracking-[0.3em]
                "
              >
                Inspired by the Grand Line
              </p>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}

export default Inicio;
