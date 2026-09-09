import { useEffect } from "react";

export default function AlertaExito({
  mensaje,
  visible,
  onCerrar,
}) {
  useEffect(() => {
    if (!visible) return;

    const temporizador = setTimeout(() => {
      onCerrar();
    }, 3500);

    return () => clearTimeout(temporizador);
  }, [visible, onCerrar]);

  if (!visible) return null;

  return (
    <div className="fixed right-5 top-5 z-[9999] w-[calc(100%-2.5rem)] max-w-sm">
      <div
        className="
          flex
          items-start
          gap-4
          rounded-2xl
          border
          border-[#D4AF37]/40
          bg-[#F8F3EA]
          p-4
          shadow-[0_20px_50px_rgba(61,23,23,0.25)]
          animate-[slideIn_0.35s_ease-out]
          dark:border-[#D4AF37]/40
          dark:bg-[#241415]
        "
      >
        {/* ICONO */}
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#D4AF37]
            text-xl
            font-bold
            text-[#3D1717]
          "
        >
          ✓
        </div>

        {/* TEXTO */}
        <div className="flex-1">
          <p
            className="
              text-sm
              font-bold
              text-[#3D1717]
              dark:text-[#F8F3EA]
            "
          >
            ¡Operación exitosa!
          </p>

          <p
            className="
              mt-1
              text-sm
              text-[#765E52]
              dark:text-[#C8B9B5]
            "
          >
            {mensaje}
          </p>
        </div>

        {/* CERRAR */}
        <button
          type="button"
          onClick={onCerrar}
          className="
            text-lg
            text-[#927E70]
            transition-colors
            hover:text-[#7F0303]
            dark:text-[#C8B9B5]
            dark:hover:text-[#D4AF37]
          "
          aria-label="Cerrar alerta"
        >
          ×
        </button>
      </div>
    </div>
  );
}