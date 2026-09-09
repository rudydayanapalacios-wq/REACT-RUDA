import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function ModoOscuro() {

  // ==========================================================
  // ESTADO INICIAL
  // ==========================================================

  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem("modoMugi") === "oscuro";
  });


  // ==========================================================
  // APLICAR MODO
  // ==========================================================

  useEffect(() => {

    const html = document.documentElement;

    if (modoOscuro) {

      html.classList.add("dark");

      localStorage.setItem(
        "modoMugi",
        "oscuro"
      );

    } else {

      html.classList.remove("dark");

      localStorage.setItem(
        "modoMugi",
        "claro"
      );

    }

  }, [modoOscuro]);


  // ==========================================================
  // CAMBIAR MODO
  // ==========================================================

  const cambiarModo = () => {

    setModoOscuro((actual) => !actual);

  };


  // ==========================================================
  // BOTÓN
  // ==========================================================

  return (

    <button
      type="button"
      onClick={cambiarModo}

      aria-label={
        modoOscuro
          ? "Activar modo claro"
          : "Activar modo oscuro"
      }

      title={
        modoOscuro
          ? "Modo claro"
          : "Modo oscuro"
      }

      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center

        rounded-full

        border
        border-[#D4AF37]/40

        bg-[#F8F3EA]
        text-[#7F0303]

        shadow-sm

        transition-all
        duration-300

        hover:bg-[#D4AF37]
        hover:text-white

        dark:border-[#D4AF37]/50
        dark:bg-[#241415]
        dark:text-[#D4AF37]

        dark:hover:bg-[#D4AF37]
        dark:hover:text-[#160B0C]
      "
    >

      {modoOscuro ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}

    </button>

  );
}


export default ModoOscuro;
