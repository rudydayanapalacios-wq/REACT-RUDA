import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Home,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import EstructuraPanel from "../components/EstructuraPanel";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function ClientePQR() {
  const { usuario, token } = useAuth();

  // ==========================================================
  // PQR
  // ==========================================================

  const [pqr, setPqr] = useState([]);
  const [cargandoPqr, setCargandoPqr] = useState(true);
  const [errorPqr, setErrorPqr] = useState("");

  const [enviandoPqr, setEnviandoPqr] = useState(false);
  const [mensajePqr, setMensajePqr] = useState("");

  const [formularioPqr, setFormularioPqr] = useState({
    tipo: "Queja",
    asunto: "",
    descripcion: "",
  });

  // ==========================================================
  // CARGAR PQR DEL CLIENTE
  // ==========================================================

  const cargarPqr = async () => {
    if (!token) {
      setPqr([]);
      setCargandoPqr(false);
      return;
    }

    try {
      setCargandoPqr(true);
      setErrorPqr("");

      const respuesta = await fetch(`${API_URL}/pqr/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudieron cargar tus PQR."
        );
      }

      setPqr(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error("Error cargando PQR:", error);

      setPqr([]);

      setErrorPqr(
        error.message || "No se pudieron cargar tus PQR."
      );
    } finally {
      setCargandoPqr(false);
    }
  };

  useEffect(() => {
    cargarPqr();
  }, [token]);

  // ==========================================================
  // CAMBIAR FORMULARIO
  // ==========================================================

  const cambiarFormularioPqr = (campo, valor) => {
    setFormularioPqr((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  // ==========================================================
  // ENVIAR PQR
  // ==========================================================

  const enviarPqr = async (e) => {
    e.preventDefault();

    if (!token) {
      setMensajePqr(
        "Debes iniciar sesión para enviar una PQR."
      );
      return;
    }

    if (
      !formularioPqr.tipo.trim() ||
      !formularioPqr.asunto.trim() ||
      !formularioPqr.descripcion.trim()
    ) {
      setMensajePqr(
        "Completa todos los campos antes de enviar la PQR."
      );
      return;
    }

    try {
      setEnviandoPqr(true);
      setMensajePqr("");

      const respuesta = await fetch(`${API_URL}/pqr/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo: formularioPqr.tipo.trim(),
          asunto: formularioPqr.asunto.trim(),
          descripcion: formularioPqr.descripcion.trim(),
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo enviar la PQR."
        );
      }

      setMensajePqr(
        "Tu PQR fue enviada correctamente. El equipo de MUGI la revisará."
      );

      setFormularioPqr({
        tipo: "Queja",
        asunto: "",
        descripcion: "",
      });

      await cargarPqr();
    } catch (error) {
      console.error("Error enviando PQR:", error);

      setMensajePqr(
        error.message || "No se pudo enviar la PQR."
      );
    } finally {
      setEnviandoPqr(false);
    }
  };

  // ==========================================================
  // ESTADO PQR
  // ==========================================================

  const obtenerTextoEstadoPqr = (estado) => {
    if (!estado) return "Pendiente";

    const estados = {
      pendiente: "Pendiente",
      "en proceso": "En proceso",
      resuelta: "Resuelta",
      cerrada: "Cerrada",
    };

    return (
      estados[String(estado).toLowerCase()] || estado
    );
  };

  // ==========================================================
  // ESTILO ESTADO
  // ==========================================================

  const obtenerEstiloEstadoPqr = (estado) => {
    const estadoNormalizado = String(
      estado || "pendiente"
    ).toLowerCase();

    if (
      estadoNormalizado === "resuelta" ||
      estadoNormalizado === "cerrada"
    ) {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (estadoNormalizado === "en proceso") {
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    }

    return "border-orange-200 bg-orange-50 text-orange-700";
  };

  // ==========================================================
  // FORMATO FECHA
  // ==========================================================

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
      return "Sin fecha";
    }

    return fechaObj.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ==========================================================
  // CONTADORES
  // ==========================================================

  const totalPqr = pqr.length;

  const respondidas = pqr.filter(
    (item) =>
      String(item?.respuesta || "").trim() !== ""
  ).length;

  const pendientes = totalPqr - respondidas;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <EstructuraPanel
      rol="cliente"
      titulo="Cliente"
    >
      <section className="min-h-screen bg-[#EFE8DF] px-3 py-5 sm:px-5 lg:px-7">
        <div className="mx-auto max-w-[1500px]">

          {/* ==================================================
              REGRESAR
          ================================================== */}

          <div className="mb-6">
            <Link
              to="/cliente"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7F0303] transition hover:text-[#5E0202]"
            >
              <ArrowLeft size={17} />
              Volver a mi espacio
            </Link>
          </div>

          {/* ==================================================
              ENCABEZADO
          ================================================== */}

          <section className="mb-8 overflow-hidden rounded-[2rem] bg-[#241415] p-7 text-[#F8F3EA] shadow-xl sm:p-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-3xl">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles
                    size={17}
                    className="text-[#D4AF37]"
                  />

                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                    Atención al cliente
                  </span>
                </div>

                <h1 className="font-serif text-3xl font-bold sm:text-4xl">
                  Mis PQR
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#E8DDD2] sm:text-base">
                  Envía tus peticiones, quejas, reclamos o solicitudes
                  y consulta las respuestas del equipo de MUGI STORE.
                </p>

                <p className="mt-3 text-sm text-[#CFC0B4]">
                  Hola, {usuario?.nombres || "cliente"}.
                </p>
              </div>

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-[#7F0303] text-white shadow-lg">
                <MessageCircle
                  size={36}
                  strokeWidth={1.7}
                />
              </div>
            </div>
          </section>

          {/* ==================================================
              INDICADORES
          ================================================== */}

          <div className="mb-8 grid gap-5 sm:grid-cols-3">

            {/* TOTAL */}

            <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#F8F3EA] p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Total
                  </p>

                  <p className="mt-2 font-serif text-3xl font-bold text-[#7F0303]">
                    {cargandoPqr ? "..." : totalPqr}
                  </p>

                  <p className="mt-1 text-sm text-[#927E70]">
                    PQR realizadas
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7F0303] text-white">
                  <FileText size={21} />
                </div>
              </div>
            </div>

            {/* PENDIENTES */}

            <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#F8F3EA] p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Pendientes
                  </p>

                  <p className="mt-2 font-serif text-3xl font-bold text-[#7F0303]">
                    {cargandoPqr ? "..." : pendientes}
                  </p>

                  <p className="mt-1 text-sm text-[#927E70]">
                    En espera de respuesta
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE8DF] text-[#7F0303]">
                  <Clock3 size={21} />
                </div>
              </div>
            </div>

            {/* RESPONDIDAS */}

            <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#F8F3EA] p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Respondidas
                  </p>

                  <p className="mt-2 font-serif text-3xl font-bold text-[#7F0303]">
                    {cargandoPqr ? "..." : respondidas}
                  </p>

                  <p className="mt-1 text-sm text-[#927E70]">
                    Con respuesta del equipo
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <CheckCircle2 size={21} />
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              FORMULARIO
          ================================================== */}

          <section className="mb-8 rounded-[2rem] border border-[#D4AF37]/20 bg-[#F8F3EA] p-6 shadow-md sm:p-8">

            <div className="mb-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Nueva solicitud
              </p>

              <h2 className="mt-2 font-serif text-2xl font-bold text-[#7F0303]">
                Enviar una PQR
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#927E70]">
                Cuéntanos qué necesitas. Tu solicitud será enviada
                al equipo encargado para su revisión.
              </p>
            </div>

            <form
              onSubmit={enviarPqr}
              className="space-y-5"
            >

              {/* TIPO */}

              <div>
                <label
                  htmlFor="tipo-pqr"
                  className="mb-2 block text-sm font-bold text-[#241415]"
                >
                  Tipo de solicitud
                </label>

                <select
                  id="tipo-pqr"
                  value={formularioPqr.tipo}
                  onChange={(e) =>
                    cambiarFormularioPqr(
                      "tipo",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 text-sm text-[#241415] outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                >
                  <option value="Petición">
                    Petición
                  </option>

                  <option value="Queja">
                    Queja
                  </option>

                  <option value="Reclamo">
                    Reclamo
                  </option>

                  <option value="Solicitud">
                    Solicitud
                  </option>
                </select>
              </div>

              {/* ASUNTO */}

              <div>
                <label
                  htmlFor="asunto-pqr"
                  className="mb-2 block text-sm font-bold text-[#241415]"
                >
                  Asunto
                </label>

                <input
                  id="asunto-pqr"
                  type="text"
                  value={formularioPqr.asunto}
                  onChange={(e) =>
                    cambiarFormularioPqr(
                      "asunto",
                      e.target.value
                    )
                  }
                  placeholder="Escribe el asunto de tu PQR"
                  maxLength={150}
                  className="w-full rounded-xl border border-[#D8BA98] bg-white px-4 py-3 text-sm text-[#241415] outline-none transition placeholder:text-[#B2A298] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                />

                <p className="mt-1 text-right text-xs text-[#927E70]">
                  {formularioPqr.asunto.length}/150
                </p>
              </div>

              {/* DESCRIPCIÓN */}

              <div>
                <label
                  htmlFor="descripcion-pqr"
                  className="mb-2 block text-sm font-bold text-[#241415]"
                >
                  Descripción
                </label>

                <textarea
                  id="descripcion-pqr"
                  value={formularioPqr.descripcion}
                  onChange={(e) =>
                    cambiarFormularioPqr(
                      "descripcion",
                      e.target.value
                    )
                  }
                  placeholder="Describe detalladamente tu petición, queja, reclamo o solicitud..."
                  maxLength={500}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-[#D8BA98] bg-white px-4 py-3 text-sm leading-6 text-[#241415] outline-none transition placeholder:text-[#B2A298] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                />

                <p className="mt-1 text-right text-xs text-[#927E70]">
                  {formularioPqr.descripcion.length}/500
                </p>
              </div>

              {/* MENSAJE */}

              {mensajePqr && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    mensajePqr.includes("correctamente")
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {mensajePqr}
                </div>
              )}

              {/* BOTÓN */}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={enviandoPqr}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7F0303] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#5E0202] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enviandoPqr ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Enviar PQR
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ==================================================
              HISTORIAL
          ================================================== */}

          <section className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#F8F3EA] p-6 shadow-md sm:p-8">

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Historial
                </p>

                <h2 className="mt-2 font-serif text-2xl font-bold text-[#7F0303]">
                  Mis solicitudes
                </h2>

                <p className="mt-1 text-sm text-[#927E70]">
                  Consulta el estado y las respuestas de tus PQR.
                </p>
              </div>

              <button
                type="button"
                onClick={cargarPqr}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8BA98] px-4 py-2.5 text-sm font-semibold text-[#7F0303] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                <RefreshCw size={16} />
                Actualizar
              </button>
            </div>

            {/* ERROR */}

            {errorPqr && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorPqr}
              </div>
            )}

            {/* CARGANDO */}

            {cargandoPqr ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-[#927E70]">
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                  Cargando tus PQR...
                </div>
              </div>
            ) : pqr.length === 0 ? (
              /* SIN PQR */

              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4AF37]/30 bg-[#EFE8DF] px-5 text-center">
                <MessageCircle
                  size={38}
                  className="text-[#927E70]"
                />

                <h3 className="mt-4 font-serif text-xl font-bold text-[#7F0303]">
                  No tienes PQR todavía
                </h3>

                <p className="mt-2 max-w-lg text-sm leading-6 text-[#927E70]">
                  Cuando envíes una petición, queja, reclamo o
                  solicitud, aparecerá aquí su seguimiento.
                </p>
              </div>
            ) : (
              /* LISTADO */

              <div className="space-y-5">
                {pqr.map((item) => {
                  const tieneRespuesta =
                    String(
                      item?.respuesta || ""
                    ).trim() !== "";

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-[#D8BA98]/70 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                    >

                      {/* CABECERA */}

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#7F0303] px-3 py-1 text-xs font-bold text-white">
                              {item.tipo}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${obtenerEstiloEstadoPqr(
                                item.estado
                              )}`}
                            >
                              {obtenerTextoEstadoPqr(
                                item.estado
                              )}
                            </span>
                          </div>

                          <h3 className="mt-3 font-serif text-xl font-bold text-[#241415]">
                            {item.asunto}
                          </h3>

                          <p className="mt-1 text-xs text-[#927E70]">
                            Enviada el{" "}
                            {formatearFecha(item.fecha)}
                          </p>
                        </div>

                        <span className="text-xs font-semibold text-[#927E70]">
                          PQR #{item.id}
                        </span>
                      </div>

                      {/* DESCRIPCIÓN */}

                      <div className="mt-5 rounded-xl bg-[#EFE8DF] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#927E70]">
                          Tu solicitud
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#3D2929]">
                          {item.descripcion}
                        </p>
                      </div>

                      {/* RESPUESTA */}

                      <div className="mt-4 rounded-xl border border-[#D4AF37]/20 bg-[#F8F3EA] p-4">
                        <div className="flex items-center gap-2">
                          {tieneRespuesta ? (
                            <CheckCircle2
                              size={18}
                              className="text-green-700"
                            />
                          ) : (
                            <Clock3
                              size={18}
                              className="text-[#D4AF37]"
                            />
                          )}

                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7F0303]">
                            {tieneRespuesta
                              ? "Respuesta del equipo"
                              : "Respuesta pendiente"}
                          </p>
                        </div>

                        {tieneRespuesta ? (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#3D2929]">
                            {item.respuesta}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm leading-6 text-[#927E70]">
                            Tu solicitud está siendo revisada.
                            Cuando un administrador o empleado
                            responda, la respuesta aparecerá aquí.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* ==================================================
              ENLACE INICIO
          ================================================== */}

          <div className="mt-8 flex justify-center pb-5">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7F0303] transition hover:text-[#5E0202]"
            >
              <Home size={16} />
              Ir al inicio
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      </section>
    </EstructuraPanel>
  );
}

export default ClientePQR;