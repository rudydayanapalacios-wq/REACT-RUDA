import { MessageCircle } from "lucide-react";

function WhatsAppButton() {
  const telefono = "573001234567";
  const mensaje = "Hola, quiero obtener información sobre MUGI STORE.";

  const abrirWhatsApp = () => {
    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  return (
    <button
      type="button"
      onClick={abrirWhatsApp}
      aria-label="Contactar por WhatsApp"
      className="
        fixed
        bottom-6
        right-6
        z-[100]
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        bg-[#25D366]
        text-white
        shadow-xl
        transition-all
        duration-300
        hover:scale-110
        hover:shadow-2xl
      "
    >
      <MessageCircle size={30} />
    </button>
  );
}

export default WhatsAppButton;