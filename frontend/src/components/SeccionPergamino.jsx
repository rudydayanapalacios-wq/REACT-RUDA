function SeccionPergamino({ titulo, children }) {
  return (
    <section
      className="
        rounded-[40px]
        bg-white/75
        p-10
        backdrop-blur-md
        shadow-xl
      "
    >
      <h2 className="mb-6 text-4xl font-bold">
        {titulo}
      </h2>

      {children}
    </section>
  );
}

export default SeccionPergamino;