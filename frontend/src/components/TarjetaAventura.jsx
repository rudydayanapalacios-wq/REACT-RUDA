function TarjetaAventura({
  imagen,
  titulo,
  descripcion,
}) {
  return (
    <article
      className="
        overflow-hidden
        rounded-[30px]
         dark:bg-[#5e2129]
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-2xl
      "
    >
      <img
        src={imagen}
        alt={titulo}
        className="h-64 w-full object-cover"
      />

      <div className="p-6">
        <h3 className="mb-3 text-2xl font-bold">
          {titulo}
        </h3>

        <p>{descripcion}</p>
      </div>
    </article>
  );
}

export default TarjetaAventura;