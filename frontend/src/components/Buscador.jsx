import { useState } from "react";
import "../styles/Buscador.css";

function Buscador({ onBuscar }) {
  const [texto, setTexto] = useState("");

  const buscar = (e) => {
    const valor = e.target.value;

    setTexto(valor);

    if (onBuscar) {
      onBuscar(valor);
    }
  };

  return (
    <div className="buscador">
      <span className="buscador-icono">🔎</span>

      <input
        type="text"
        placeholder="Buscar productos..."
        value={texto}
        onChange={buscar}
      />
    </div>
  );
}

export default Buscador;