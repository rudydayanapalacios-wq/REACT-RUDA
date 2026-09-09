function FraseDestacada({ frase }) {
  return (
    <div className="mx-auto max-w-4xl py-16 text-center">
      <p className="text-3xl italic text-white drop-shadow-lg">
        "{frase}"
      </p>
    </div>
  );
}

export default FraseDestacada;