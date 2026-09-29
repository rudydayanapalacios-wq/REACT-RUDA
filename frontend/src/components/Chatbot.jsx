import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Trash2,
  Move,
  Maximize2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const SUGERENCIAS = [
  "¿Qué productos tienen?",
  "¿Cuánto cuesta el Collar Dorado Premium?",
  "¿Hay Anillito disponible?",
  "¿Cómo recupero mi contraseña?",
];

function Chatbot() {
  const navigate = useNavigate();
  const { token, usuario } = useAuth();

  const [abierto, setAbierto] = useState(false);

  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      tipo: "bot",
      texto:
        "¡Hola! 👋 Soy MUGI IA. Puedo ayudarte con productos, precios, disponibilidad, compras, carrito, facturas, PQR y preguntas frecuentes de MUGI STORE.",
    },
  ]);

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const mensajesRef = useRef(null);
  const inputRef = useRef(null);
  const chatbotRef = useRef(null);

  // ==========================================================
  // POSICIÓN Y TAMAÑO DEL CHATBOT
  // ==========================================================

  const obtenerTamanoInicial = () => {
    const ancho = Math.min(390, window.innerWidth - 32);
    const alto = Math.min(620, window.innerHeight - 48);

    return {
      ancho: Math.max(280, ancho),
      alto: Math.max(420, alto),
    };
  };

  const calcularPosicionInicial = () => {
    const { ancho, alto } = obtenerTamanoInicial();

    return {
      x: Math.max(16, window.innerWidth - ancho - 24),
      y: Math.max(16, window.innerHeight - alto - 24),
    };
  };

  const posicionInicial = calcularPosicionInicial();

  const [posicion, setPosicion] = useState(posicionInicial);

  const [tamano, setTamano] = useState(() => {
    const inicial = obtenerTamanoInicial();

    return {
      ancho: inicial.ancho,
      alto: inicial.alto,
    };
  });

  // Referencias para mover
  const arrastrandoRef = useRef(false);

  const inicioArrastreRef = useRef({
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0,
  });

  // Referencias para cambiar tamaño
  const redimensionandoRef = useRef(false);

  const inicioResizeRef = useRef({
    mouseX: 0,
    mouseY: 0,
    ancho: 0,
    alto: 0,
    x: 0,
    y: 0,
  });

  // ==========================================================
  // BAJAR AUTOMÁTICAMENTE AL ÚLTIMO MENSAJE
  // ==========================================================

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  // ==========================================================
  // ENFOCAR INPUT AL ABRIR
  // ==========================================================

  useEffect(() => {
    if (abierto && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [abierto]);

  // ==========================================================
  // ESC + CLIC FUERA
  // ==========================================================

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const manejarTeclaGlobal = (e) => {
      if (e.key === "Escape") {
        setAbierto(false);
      }
    };

    const manejarClickFuera = (e) => {
      if (
        chatbotRef.current &&
        !chatbotRef.current.contains(e.target) &&
        !arrastrandoRef.current &&
        !redimensionandoRef.current
      ) {
        setAbierto(false);
      }
    };

    document.addEventListener("keydown", manejarTeclaGlobal);
    document.addEventListener("mousedown", manejarClickFuera);

    return () => {
      document.removeEventListener("keydown", manejarTeclaGlobal);
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, [abierto]);

  // ==========================================================
  // EVITAR QUE EL CHAT SE SALGA DE LA PANTALLA
  // ==========================================================

  useEffect(() => {
    const ajustarPantalla = () => {
      setPosicion((actual) => {
        const maxX = Math.max(
          16,
          window.innerWidth - tamano.ancho - 16
        );

        const maxY = Math.max(
          16,
          window.innerHeight - tamano.alto - 16
        );

        return {
          x: Math.min(Math.max(actual.x, 16), maxX),
          y: Math.min(Math.max(actual.y, 16), maxY),
        };
      });

      setTamano((actual) => {
        const maxAncho = Math.max(280, window.innerWidth - 32);
        const maxAlto = Math.max(420, window.innerHeight - 32);

        return {
          ancho: Math.min(actual.ancho, maxAncho),
          alto: Math.min(actual.alto, maxAlto),
        };
      });
    };

    window.addEventListener("resize", ajustarPantalla);

    return () => {
      window.removeEventListener("resize", ajustarPantalla);
    };
  }, [tamano.ancho, tamano.alto]);

  // ==========================================================
  // MOVER CHATBOT
  // ==========================================================

  const iniciarArrastre = (e) => {
    if (e.button !== 0) {
      return;
    }

    arrastrandoRef.current = true;

    inicioArrastreRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: posicion.x,
      y: posicion.y,
    };

    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", moverChatbot);
    document.addEventListener("mouseup", terminarArrastre);
  };

  const moverChatbot = (e) => {
    if (!arrastrandoRef.current) {
      return;
    }

    const inicio = inicioArrastreRef.current;

    const nuevoX = inicio.x + (e.clientX - inicio.mouseX);
    const nuevoY = inicio.y + (e.clientY - inicio.mouseY);

    const maxX = Math.max(
      16,
      window.innerWidth - tamano.ancho - 16
    );

    const maxY = Math.max(
      16,
      window.innerHeight - tamano.alto - 16
    );

    setPosicion({
      x: Math.min(Math.max(nuevoX, 16), maxX),
      y: Math.min(Math.max(nuevoY, 16), maxY),
    });
  };

  const terminarArrastre = () => {
    arrastrandoRef.current = false;

    document.body.style.userSelect = "";

    document.removeEventListener("mousemove", moverChatbot);
    document.removeEventListener("mouseup", terminarArrastre);
  };

  // ==========================================================
  // CAMBIAR TAMAÑO
  // ==========================================================

  const iniciarRedimension = (e) => {
    e.preventDefault();
    e.stopPropagation();

    redimensionandoRef.current = true;

    inicioResizeRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      ancho: tamano.ancho,
      alto: tamano.alto,
      x: posicion.x,
      y: posicion.y,
    };

    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", cambiarTamano);
    document.addEventListener("mouseup", terminarRedimension);
  };

  const cambiarTamano = (e) => {
    if (!redimensionandoRef.current) {
      return;
    }

    const inicio = inicioResizeRef.current;

    const diferenciaX = e.clientX - inicio.mouseX;
    const diferenciaY = e.clientY - inicio.mouseY;

    const nuevoAncho = Math.max(
      280,
      Math.min(
        inicio.ancho + diferenciaX,
        window.innerWidth - inicio.x - 16
      )
    );

    const nuevoAlto = Math.max(
      420,
      Math.min(
        inicio.alto + diferenciaY,
        window.innerHeight - inicio.y - 16
      )
    );

    setTamano({
      ancho: nuevoAncho,
      alto: nuevoAlto,
    });
  };

  const terminarRedimension = () => {
    redimensionandoRef.current = false;

    document.body.style.userSelect = "";

    document.removeEventListener("mousemove", cambiarTamano);
    document.removeEventListener("mouseup", terminarRedimension);
  };

  // ==========================================================
  // ABRIR CHATBOT
  // ==========================================================

  const abrirChatbot = () => {
    // Si no hay sesión, enviar al login
    if (!token || !usuario) {
      navigate("/login");
      return;
    }

    const nuevoTamano = obtenerTamanoInicial();

    setTamano({
      ancho: nuevoTamano.ancho,
      alto: nuevoTamano.alto,
    });

    setPosicion(calcularPosicionInicial());
    setAbierto(true);
  };

  // ==========================================================
  // ENVIAR MENSAJE
  // ==========================================================

  const enviarTexto = async (textoSinFormato) => {
    const texto = textoSinFormato.trim();

    if (!texto || cargando) {
      return;
    }

    // Seguridad adicional:
    // si la sesión desapareció mientras el chatbot estaba abierto
    if (!token || !usuario) {
      setAbierto(false);
      navigate("/login");
      return;
    }

    setMensajes((anteriores) => [
      ...anteriores,
      {
        id: Date.now(),
        tipo: "usuario",
        texto,
      },
    ]);

    setMensaje("");
    setCargando(true);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      const response = await fetch(`${API_URL}/chatbot/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          mensaje: texto,
        }),

        signal: controller.signal,
      });

      let datos = null;

      try {
        datos = await response.json();
      } catch {
        datos = null;
      }

      if (!response.ok) {
        throw new Error(
          datos?.detail ||
            datos?.respuesta ||
            "No fue posible obtener una respuesta del asistente."
        );
      }

      const respuestaBot =
        datos?.respuesta?.trim() ||
        "No recibí una respuesta del asistente.";

      setMensajes((anteriores) => [
        ...anteriores,
        {
          id: Date.now() + 1,
          tipo: "bot",
          texto: respuestaBot,
        },
      ]);
    } catch (error) {
      console.error("ERROR CHATBOT:", error);

      let mensajeError =
        "Lo siento 😕, tuve un problema al procesar tu mensaje.";

      if (error.name === "AbortError") {
        mensajeError =
          "La respuesta tardó demasiado. Revisa tu conexión e inténtalo nuevamente.";
      } else if (error.message?.includes("Failed to fetch")) {
        mensajeError =
          "No pude conectarme con el servidor de MUGI. Verifica que el backend esté funcionando.";
      } else if (error.message) {
        mensajeError = error.message;
      }

      setMensajes((anteriores) => [
        ...anteriores,
        {
          id: Date.now() + 2,
          tipo: "bot",
          texto: mensajeError,
        },
      ]);
    } finally {
      clearTimeout(timeout);
      setCargando(false);
    }
  };

  // ==========================================================
  // FORMULARIO
  // ==========================================================

  const enviarMensaje = (e) => {
    e.preventDefault();
    enviarTexto(mensaje);
  };

  // ==========================================================
  // SUGERENCIA
  // ==========================================================

  const usarSugerencia = (texto) => {
    if (cargando) {
      return;
    }

    enviarTexto(texto);
  };

  // ==========================================================
  // REINICIAR CHAT
  // ==========================================================

  const reiniciarChat = () => {
    if (cargando) {
      return;
    }

    setMensajes([
      {
        id: Date.now(),
        tipo: "bot",
        texto:
          "¡Hola! 👋 Soy MUGI IA. Puedo ayudarte con productos, precios, disponibilidad, compras, carrito, facturas, PQR y preguntas frecuentes de MUGI STORE.",
      },
    ]);

    setMensaje("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // ==========================================================
  // TECLA ENTER
  // ==========================================================

  const manejarTecla = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje(e);
    }
  };

  return (
    <>
      {/* ======================================================
          BOTÓN FLOTANTE
      ====================================================== */}

      {!abierto && (
        <button
          type="button"
          onClick={abrirChatbot}
          aria-label="Abrir asistente MUGI IA"
          style={{
            position: "fixed",
            right: "24px",
            bottom: "100px",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            border: "2px solid #D4AF37",
            background: "#7F0303",
            color: "#F8F3EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 9999,
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
          }}
        >
          <img
            src="/img/TELEFONOREAL.png"
            alt="MUGI IA"
            style={{
              width: "38px",
              height: "38px",
              objectFit: "contain",
            }}
          />
        </button>
      )}

      {/* ======================================================
          VENTANA DEL CHAT
      ====================================================== */}

      {abierto && (
        <div
          ref={chatbotRef}
          style={{
            position: "fixed",
            left: `${posicion.x}px`,
            top: `${posicion.y}px`,
            width: `${tamano.ancho}px`,
            height: `${tamano.alto}px`,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 32px)",
            minWidth: "280px",
            minHeight: "420px",
            background: "#F8F3EA",
            border: "1px solid #D4AF37",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            boxShadow: "0 15px 45px rgba(0,0,0,0.3)",
          }}
        >
          {/* ==================================================
              HEADER ARRASTRABLE
          ================================================== */}

          <div
            onMouseDown={iniciarArrastre}
            style={{
              background: "#7F0303",
              color: "#F8F3EA",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "2px solid #D4AF37",
              cursor: "move",
              userSelect: "none",
            }}
            title="Arrastra para mover MUGI IA"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "#F8F3EA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/img/TELEFONOREAL.png"
                  alt="MUGI IA"
                  style={{
                    width: "30px",
                    height: "30px",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  MUGI IA
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.85,
                  }}
                >
                  Asistente virtual
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Move
                size={17}
                style={{
                  opacity: 0.65,
                  marginRight: "2px",
                }}
              />

              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={reiniciarChat}
                disabled={cargando}
                title="Reiniciar conversación"
                aria-label="Reiniciar conversación"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "transparent",
                  color: "#F8F3EA",
                  cursor: cargando ? "not-allowed" : "pointer",
                  opacity: cargando ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={18} />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setAbierto(false)}
                title="Cerrar chatbot"
                aria-label="Cerrar chatbot"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "transparent",
                  color: "#F8F3EA",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={21} />
              </button>
            </div>
          </div>

          {/* ==================================================
              MENSAJES
          ================================================== */}

          <div
            ref={mensajesRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {mensajes.map((item) => {
              const esUsuario = item.tipo === "usuario";

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: esUsuario
                      ? "flex-end"
                      : "flex-start",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  {!esUsuario && (
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        minWidth: "30px",
                        borderRadius: "50%",
                        background: "#7F0303",
                        color: "#F8F3EA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "11px 13px",
                      borderRadius: esUsuario
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      background: esUsuario
                        ? "#7F0303"
                        : "#EFE8DF",
                      color: esUsuario
                        ? "#F8F3EA"
                        : "#4A0505",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.texto}
                  </div>

                  {esUsuario && (
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        minWidth: "30px",
                        borderRadius: "50%",
                        background: "#D4AF37",
                        color: "#4A0505",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <User size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* ==================================================
                CARGANDO
            ================================================== */}

            {cargando && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    minWidth: "30px",
                    borderRadius: "50%",
                    background: "#7F0303",
                    color: "#F8F3EA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bot size={16} />
                </div>

                <div
                  style={{
                    padding: "11px 13px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "#EFE8DF",
                    color: "#4A0505",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                  }}
                >
                  <Loader2
                    size={16}
                    style={{
                      animation: "mugiSpin 1s linear infinite",
                    }}
                  />

                  <span>MUGI IA está pensando...</span>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================
              SUGERENCIAS
          ================================================== */}

          {!cargando && mensajes.length <= 1 && (
            <div
              style={{
                padding: "0 14px 12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#7F0303",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                <Sparkles size={14} />
                Preguntas rápidas
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                }}
              >
                {SUGERENCIAS.map((sugerencia) => (
                  <button
                    key={sugerencia}
                    type="button"
                    onClick={() => usarSugerencia(sugerencia)}
                    style={{
                      border: "1px solid #D8BA98",
                      background: "#F8F3EA",
                      color: "#4A0505",
                      borderRadius: "20px",
                      padding: "7px 10px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    {sugerencia}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================
              INPUT
          ================================================== */}

          <form
            onSubmit={enviarMensaje}
            style={{
              padding: "12px",
              borderTop: "1px solid #D8BA98",
              background: "#F8F3EA",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
                background: "#EFE8DF",
                border: "1px solid #D8BA98",
                borderRadius: "15px",
                padding: "7px",
              }}
            >
              <textarea
                ref={inputRef}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={manejarTecla}
                placeholder="Escribe tu pregunta..."
                maxLength={500}
                rows={1}
                disabled={cargando}
                style={{
                  flex: 1,
                  resize: "none",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "#4A0505",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  padding: "8px",
                  maxHeight: "100px",
                }}
              />

              <button
                type="submit"
                disabled={!mensaje.trim() || cargando}
                aria-label="Enviar mensaje"
                title="Enviar mensaje"
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",
                  borderRadius: "50%",
                  border: "none",
                  background:
                    !mensaje.trim() || cargando
                      ? "#D8BA98"
                      : "#7F0303",
                  color: "#F8F3EA",
                  cursor:
                    !mensaje.trim() || cargando
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cargando ? (
                  <Loader2
                    size={18}
                    style={{
                      animation:
                        "mugiSpin 1s linear infinite",
                    }}
                  />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <div
              style={{
                marginTop: "5px",
                textAlign: "right",
                fontSize: "10px",
                color: "#8B7565",
              }}
            >
              {mensaje.length}/500
            </div>
          </form>

          {/* ==================================================
              CONTROL PARA CAMBIAR TAMAÑO
          ================================================== */}

          <div
            onMouseDown={iniciarRedimension}
            title="Arrastra para cambiar el tamaño"
            style={{
              position: "absolute",
              right: "3px",
              bottom: "3px",
              width: "22px",
              height: "22px",
              cursor: "nwse-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7F0303",
              opacity: 0.65,
              zIndex: 10,
            }}
          >
            <Maximize2 size={15} />
          </div>
        </div>
      )}

      {/* ======================================================
          ANIMACIÓN
      ====================================================== */}

      <style>
        {`
          @keyframes mugiSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </>
  );
}

export default Chatbot;
