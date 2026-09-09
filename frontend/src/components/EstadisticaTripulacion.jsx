function EstadisticaTripulacion({
  numero,
  texto,
}) {
  return (
    <div className="text-center">
      <h3 className="text-5xl font-black">
        {numero}
      </h3>

      <p className="mt-2 text-lg">
        {texto}
      </p>
    </div>
  );
}

export default EstadisticaTripulacion;