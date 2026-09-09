// ============================================================
// COMPONENTE PRODUCTO CARD
// ============================================================

function ProductoCard({
  imagen,
  titulo,
  descripcion,
  precio,
}) {
  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[32px]

        border
        border-[#D8BA98]
        dark:border-[#6B4540]

        bg-[#F8F3EA]
        dark:bg-[#241415]

        shadow-sm
        dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)]

        transition-all
        duration-300

        hover:-translate-y-2
        hover:shadow-xl

        dark:hover:border-[#D4AF37]/40
      "
    >

      {/* ======================================================
          IMAGEN
      ====================================================== */}

      <div className="h-64 w-full overflow-hidden">

        <img
          src={imagen}
          alt={titulo}
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


      {/* ======================================================
          INFORMACIÓN
      ====================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-7

          transition-colors
          duration-300
        "
      >

        {/* ====================================================
            CATEGORÍA
        ==================================================== */}

        <span
          className="
            text-xs
            font-semibold
            uppercase
            tracking-widest

            text-[#D4AF37]
          "
        >
          MUGI. COLLECTION
        </span>


        {/* ====================================================
            TÍTULO
        ==================================================== */}

        <h3
          className="
            mt-2
            min-h-[58px]

            text-2xl
            font-bold
            leading-tight

            text-[#7F0303]
            dark:text-[#F8F3EA]

            transition-colors
            duration-300
          "
        >
          {titulo}
        </h3>


        {/* ====================================================
            DESCRIPCIÓN
        ==================================================== */}

        <p
          className="
            mt-3
            min-h-[72px]

            text-sm
            leading-6

            text-[#0F414A]
            dark:text-[#E3D7D2]

            transition-colors
            duration-300
          "
        >
          {descripcion}
        </p>


        {/* ====================================================
            PRECIO + BOTÓN
        ==================================================== */}

        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            gap-4
            pt-6
          "
        >

          {/* ==================================================
              PRECIO
          ================================================== */}

          <span
            className="
              text-xl
              font-bold

              text-[#B89563]
              dark:text-[#D4AF37]

              transition-colors
              duration-300
            "
          >
            {precio}
          </span>


          {/* ==================================================
              BOTÓN
          ================================================== */}

          <button
            type="button"
            className="
              shrink-0

              rounded-full

              bg-[#7F0303]
              dark:bg-[#8F1D24]

              px-5
              py-2

              text-sm
              font-semibold
              text-white

              transition-all
              duration-300

              hover:-translate-y-1

              hover:bg-[#D4AF37]
              hover:shadow-md

              dark:hover:bg-[#D4AF37]
              dark:hover:text-[#160B0C]
            "
          >
            Ver más
          </button>

        </div>

      </div>

    </article>
  );
}


// ============================================================
// EXPORTACIÓN
// ============================================================

export default ProductoCard;