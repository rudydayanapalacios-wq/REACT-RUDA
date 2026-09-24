import { useEffect, useRef, useState } from "react";
import { X, Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const SUGERENCIAS = [
  "¿Qué productos tienen?",
  "¿Cómo compro?",
  "¿Cómo consulto mi factura?",
];

function Chatbot() {
  const [abierto, setAbierto] = useState(false);

  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      tipo: "bot",
      texto:
        "¡Hola! 👋 Soy MUGI IA. Puedo ayudarte con productos, compras, carrito, facturas, PQR y preguntas frecuentes de MUGI STORE.",
    },
  ]);

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const mensajesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop =
        mensajesRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  useEffect(() => {
    if (abierto && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [abierto]);

  const enviarTexto = async (textoSinFormato) => {
    const texto = textoSinFormato.trim();

    if (!texto || cargando) {
      return;
    }

    setMensajes((anteriores) => [
      ...anteriores,
      {
        id: Date.now(),
        tipo: "usuario",
        texto: texto,
      },
    ]);

    setMensaje("");
    setCargando(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_URL}/chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensaje: texto,
        }),
        signal: controller.signal,
      });

      const datos = await response.json();

      if (!response.ok) {
        throw new Error(
          datos?.detail ||
          "No fue posible obtener una respuesta."
        );
      }

      setMensajes((anteriores) => [
        ...anteriores,
        {
          id: Date.now() + 1,
          tipo: "bot",
          texto:
            datos?.respuesta ||
            "No recibí una respuesta del asistente.",
        },
      ]);
    } catch (error) {
      console.error("ERROR CHATBOT:", error);

      setMensajes((anteriores) => [
        ...anteriores,
        {
          id: Date.now() + 2,
          tipo: "bot",
          texto:
            error.name === "AbortError"
              ? "La respuesta tardó demasiado. Revisa tu conexión e inténtalo de nuevo."
              : "Lo siento 😕, tuve un problema al procesar tu mensaje. Intenta nuevamente.",
        },
      ]);
    } finally {
      clearTimeout(timeout);
      setCargando(false);
    }
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    enviarTexto(mensaje);
  };

  const reiniciarChat = () => {
    if (cargando) {
      return;
    }

    setMensajes([
      {
        id: Date.now(),
        tipo: "bot",
        texto:
          "¡Hola! 👋 Soy MUGI IA. Puedo ayudarte con productos, compras, carrito, facturas, PQR y preguntas frecuentes de MUGI STORE.",
      },
    ]);
    setMensaje("");
  };

  const manejarTecla = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje(e);
    }
  };

  return (
    <>
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="
            fixed
            bottom-24
            right-6
            z-[9998]
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[#6E1F2B]
            text-[#F8F3EA]
            shadow-2xl
            transition
            duration-300
            hover:scale-110
            hover:bg-[#8B2938]
          "
          title="Abrir MUGI IA"
          aria-label="Abrir MUGI IA"
        >
          <img
            src="/img/TELEFONOREAL.png"
            alt="Chatbot MUGI"
            className="h-10 w-10 object-contain"
          />

          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              bg-[#C99A45]
              text-[#241415]
            "
          >
            <Sparkles size={13} />
          </span>
        </button>
      )}

      {abierto && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-[9999]
            flex
            h-[600px]
            max-h-[calc(100dvh-3rem)]
            w-[380px]
            max-w-[calc(100vw-2rem)]
            flex-col
            overflow-hidden
            rounded-[28px]
            border
            border-[#C99A45]/30
            bg-[#F8F3EA]
            shadow-2xl
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              bg-[#241415]
              px-5
              py-4
              text-[#F8F3EA]
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[#6E1F2B]
                "
              >
                <Bot size={23} />
              </div>

              <div>
                <h2 className="font-semibold">
                  MUGI IA
                </h2>

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400" />

                  <span className="text-xs text-[#D8CFC4]">
                    Asistente virtual
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reiniciarChat}
                disabled={cargando}
                className="
                  rounded-full
                  p-2
                  transition
                  hover:bg-white/10
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                title="Nueva conversación"
                aria-label="Nueva conversación"
              >
                <Trash2 size={19} />
              </button>

              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="
                  rounded-full
                  p-2
                  transition
                  hover:bg-white/10
                "
                title="Cerrar chatbot"
                aria-label="Cerrar chatbot"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          <div
            ref={mensajesRef}
            aria-live="polite"
            className="
              flex-1
              space-y-4
              overflow-y-auto
              bg-[#EFE8DF]
              p-4
            "
          >
            {mensajes.length === 1 && !cargando && (
              <div className="mb-1 flex flex-wrap gap-2">
                {SUGERENCIAS.map((sugerencia) => (
                  <button
                    key={sugerencia}
                    type="button"
                    onClick={() => enviarTexto(sugerencia)}
                    className="
                      rounded-full
                      border
                      border-[#C99A45]/50
                      bg-white
                      px-3
                      py-2
                      text-left
                      text-xs
                      font-medium
                      text-[#6E1F2B]
                      transition
                      hover:border-[#6E1F2B]
                      hover:bg-[#FFF8ED]
                    "
                  >
                    {sugerencia}
                  </button>
                ))}
              </div>
            )}

            {mensajes.map((item) => (
              <div
                key={item.id}
                className={`flex ${item.tipo === "usuario"
                  ? "justify-end"
                  : "justify-start"
                  }`}
              >
                <div
                  className={`flex max-w-[85%] items-end gap-2 ${item.tipo === "usuario"
                    ? "flex-row-reverse"
                    : "flex-row"
                    }`}
                >
                  <div
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      ${item.tipo === "usuario"
                        ? "bg-[#C99A45] text-[#241415]"
                        : "bg-[#6E1F2B] text-[#F8F3EA]"
                      }
                    `}
                  >
                    {item.tipo === "usuario" ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>

                  <div
                    className={`
                      whitespace-pre-line
                      rounded-2xl
                      px-4
                      py-3
                      text-sm
                      leading-relaxed
                      shadow-sm
                      ${item.tipo === "usuario"
                        ? "rounded-br-md bg-[#6E1F2B] text-white"
                        : "rounded-bl-md bg-white text-[#241415]"
                      }
                    `}
                  >
                    {item.texto}
                  </div>
                </div>
              </div>
            ))}

            {cargando && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-[#6E1F2B]
                      text-white
                    "
                  >
                    <Bot size={16} />
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-2xl
                      rounded-bl-md
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-[#6E1F2B]
                      shadow-sm
                    "
                  >
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    <span>Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={enviarMensaje}
            className="
              border-t
              border-[#D8CFC4]
              bg-[#F8F3EA]
              p-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-[#D8CFC4]
                bg-white
                p-2
                focus-within:border-[#C99A45]
              "
            >
              <input
                ref={inputRef}
                type="text"
                value={mensaje}
                onChange={(e) =>
                  setMensaje(e.target.value)
                }
                onKeyDown={manejarTecla}
                placeholder="Escribe tu pregunta..."
                maxLength={500}
                disabled={cargando}
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-2
                  py-2
                  text-sm
                  text-[#241415]
                  outline-none
                  placeholder:text-[#8C8177]
                "
              />

              <button
                type="submit"
                disabled={!mensaje.trim() || cargando}
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#6E1F2B]
                  text-white
                  transition
                  hover:bg-[#8B2938]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                title="Enviar mensaje"
                aria-label="Enviar mensaje"
              >
                {cargando ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <p
              className="
                mt-2
                text-center
                text-[10px]
                text-[#8C8177]
              "
            >
              MUGI IA · Atención inicial
            </p>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;