export default function Alerta({ mensaje, tipo = "exito" }) {
  if (!mensaje) return null;

  return (
    <div
      className={`
        fixed
        top-6
        right-6
        z-[200]
        flex
        items-center
        gap-3
        rounded-2xl
        border
        px-5
        py-4
        shadow-xl
        backdrop-blur-md
        animate-[fadeIn_0.3s_ease-out]
        ${
          tipo === "exito"
            ? "border-green-300 bg-green-50 text-green-800"
            : "border-red-300 bg-red-50 text-red-800"
        }
      `}
    >
      <span className="text-xl">
        {tipo === "exito" ? "✓" : "⚠️"}
      </span>

      <span className="text-sm font-semibold">
        {mensaje}
      </span>
    </div>
  );
}