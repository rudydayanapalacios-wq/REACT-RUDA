export default function Boton({ texto, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        px-6
        py-3
        rounded-full
        bg-[#D4AF37]
        text-white
        font-semibold
        transition
        hover:scale-105
        hover:shadow-lg
      "
    >
      {texto}
    </button>
  );
}