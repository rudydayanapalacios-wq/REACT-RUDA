import "../styles/CategoriaFiltro.css";

function CategoriaFiltro({ categorias, categoriaActual, cambiarCategoria }) {
  return (
    <div className="categoria-filtro">

      {categorias.map((categoria) => (
        <button
          key={categoria}
          className={
            categoriaActual === categoria
              ? "categoria-activa"
              : ""
          }
          onClick={() => cambiarCategoria(categoria)}
        >
          {categoria}
        </button>
      ))}

    </div>
  );
}

export default CategoriaFiltro;