import { useEffect, useMemo, useState } from "react";
import EstructuraPanel from "../components/EstructuraPanel";

import {
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Mail,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function EmpleadoPQR() {
  const [pqr, setPqr] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [pqrSeleccionada, setPqrSeleccionada] = useState(null);

  const [respuesta, setRespuesta] = useState("");
  const [estado, setEstado] = useState("resuelta");
  const [enviando, setEnviando] = useState(false);

  // ==========================================================
  // OBTENER PQR
  // ==========================================================

  const obtenerPQR = async () => {
    try {
      setCargando(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/pqr/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron obtener las PQR.");
      }

      const datos = await response.json();

      setPqr(datos);

      if (pqrSeleccionada) {
        const actualizada = datos.find(
          (item) => item.id === pqrSeleccionada.id
        );

        if (actualizada) {
          setPqrSeleccionada(actualizada);
          setRespuesta(actualizada.respuesta || "");
          setEstado(actualizada.estado || "resuelta");
        }
      }
    } catch (error) {
      console.error("Error al obtener PQR:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPQR();
  }, []);

  // ==========================================================
  // SELECCIONAR PQR
  // ==========================================================

  const seleccionarPQR = (item) => {
    setPqrSeleccionada(item);
    setRespuesta(item.respuesta || "");
    setEstado(item.estado || "resuelta");
  };

  // ==========================================================
  // RESPONDER PQR
  // ==========================================================

  const responderPQR = async () => {
    if (!pqrSeleccionada) return;

    if (!respuesta.trim()) {
      alert("La respuesta es obligatoria.");
      return;
    }

    try {
      setEnviando(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/pqr/${pqrSeleccionada.id}/responder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            respuesta: respuesta.trim(),
            estado,
          }),
        }
      );

      const datos = await response.json();

      if (!response.ok) {
        throw new Error(
          datos.detail || "No se pudo responder la PQR."
        );
      }

      setPqr((actuales) =>
        actuales.map((item) =>
          item.id === datos.id ? datos : item
        )
      );

      setPqrSeleccionada(datos);
      setRespuesta(datos.respuesta || "");
      setEstado(datos.estado || "resuelta");

      alert("La PQR fue actualizada correctamente.");
    } catch (error) {
      console.error("Error al responder PQR:", error);
      alert(error.message);
    } finally {
      setEnviando(false);
    }
  };

  // ==========================================================
  // FILTRO
  // ==========================================================

  const pqrFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) {
      return pqr;
    }

    return pqr.filter((item) => {
      return (
        String(item.id).includes(texto) ||
        item.nombre_cliente?.toLowerCase().includes(texto) ||
        item.correo_cliente?.toLowerCase().includes(texto) ||
        item.asunto?.toLowerCase().includes(texto) ||
        item.tipo?.toLowerCase().includes(texto) ||
        item.descripcion?.toLowerCase().includes(texto) ||
        String(item.usuario_id).includes(texto) ||
        item.estado?.toLowerCase().includes(texto)
      );
    });
  }, [pqr, busqueda]);

  // ==========================================================
  // CONTADORES
  // ==========================================================

  const totalPQR = pqr.length;

  const pendientes = pqr.filter(
    (item) => item.estado === "pendiente"
  ).length;

  const enProceso = pqr.filter(
    (item) => item.estado === "en proceso"
  ).length;

  const respondidas = pqr.filter(
    (item) =>
      item.estado === "resuelta" ||
      item.estado === "cerrada"
  ).length;

  // ==========================================================
  // ESTADO
  // ==========================================================

  const obtenerEstiloEstado = (estadoActual) => {
    switch (estadoActual) {
      case "pendiente":
        return {
          clase:
            "bg-[#F5ECE8] text-[#6B1E2D] border-[#E7D6D0]",
          icono: <AlertCircle size={14} />,
        };

      case "en proceso":
        return {
          clase:
            "bg-[#F5F0E5] text-[#806A39] border-[#E7DDBF]",
          icono: <Clock size={14} />,
        };

      case "resuelta":
        return {
          clase:
            "bg-[#ECEFE9] text-[#50634F] border-[#D6DED2]",
          icono: <CheckCircle2 size={14} />,
        };

      case "cerrada":
        return {
          clase:
            "bg-[#F1EFEC] text-[#5C554F] border-[#DED8D1]",
          icono: <XCircle size={14} />,
        };

      default:
        return {
          clase:
            "bg-[#F1EFEC] text-[#5C554F] border-[#DED8D1]",
          icono: <Clock size={14} />,
        };
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <EstructuraPanel rol="empleado" titulo="PQR">
      <div className="w-full px-5 py-6 md:px-8 md:py-8 xl:px-10">
        <div className="mx-auto max-w-[1500px] space-y-6">

          {/* ==================================================
              ENCABEZADO
          ================================================== */}

          <section className="rounded-[26px] border border-[#DED2C6] bg-[#F8F3EA] p-6 shadow-[0_8px_30px_rgba(36,20,21,0.06)] md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7F0303] text-[#F8F3EA] shadow-sm">
                  <MessageCircle
                    size={27}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B7568]">
                    Atención al cliente
                  </p>

                  <h1 className="text-2xl font-bold text-[#241415] md:text-3xl">
                    Gestión de PQR
                  </h1>

                  <p className="mt-1 text-sm text-[#756861]">
                    Consulta, responde y administra las solicitudes de los clientes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={obtenerPQR}
                disabled={cargando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#241415] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    cargando ? "animate-spin" : ""
                  }
                />

                Actualizar
              </button>
            </div>
          </section>

          {/* ==================================================
              INDICADORES
          ================================================== */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL */}
            <div className="rounded-[22px] border border-[#E2D7CB] bg-white p-5 shadow-[0_6px_20px_rgba(36,20,21,0.04)]">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-[#806F67]">
                    Total de PQR
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#241415]">
                    {totalPQR}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E9E5] text-[#7F0303]">
                  <MessageCircle size={21} />
                </div>

              </div>
            </div>

            {/* PENDIENTES */}
            <div className="rounded-[22px] border border-[#E2D7CB] bg-white p-5 shadow-[0_6px_20px_rgba(36,20,21,0.04)]">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-[#806F67]">
                    Pendientes
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#7F0303]">
                    {pendientes}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5ECE8] text-[#7F0303]">
                  <AlertCircle size={21} />
                </div>

              </div>
            </div>

            {/* EN PROCESO */}
            <div className="rounded-[22px] border border-[#E2D7CB] bg-white p-5 shadow-[0_6px_20px_rgba(36,20,21,0.04)]">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-[#806F67]">
                    En proceso
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#806A39]">
                    {enProceso}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F0E5] text-[#806A39]">
                  <Clock size={21} />
                </div>

              </div>
            </div>

            {/* RESPONDIDAS */}
            <div className="rounded-[22px] border border-[#E2D7CB] bg-white p-5 shadow-[0_6px_20px_rgba(36,20,21,0.04)]">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-[#806F67]">
                    Respondidas
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#50634F]">
                    {respondidas}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECEFE9] text-[#50634F]">
                  <CheckCircle2 size={21} />
                </div>

              </div>
            </div>

          </section>

          {/* ==================================================
              BUSCADOR
          ================================================== */}

          <section className="rounded-[22px] border border-[#E2D7CB] bg-white p-5 shadow-[0_6px_20px_rgba(36,20,21,0.04)]">

            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#927E74]"
              />

              <input
                type="text"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
                placeholder="Buscar por nombre, correo, asunto, tipo, descripción o estado..."
                className="w-full rounded-xl border border-[#DED2C6] bg-[#F8F3EA] py-3.5 pl-11 pr-4 text-sm text-[#241415] outline-none transition placeholder:text-[#9A8980] focus:border-[#7F0303] focus:ring-2 focus:ring-[#7F0303]/10"
              />
            </div>

          </section>

          {/* ==================================================
              CONTENIDO PRINCIPAL
          ================================================== */}

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">

            {/* ==================================================
                LISTA DE PQR
            ================================================== */}

            <div className="overflow-hidden rounded-[24px] border border-[#E2D7CB] bg-white shadow-[0_6px_20px_rgba(36,20,21,0.04)]">

              <div className="border-b border-[#E8DED5] bg-[#F8F3EA] px-5 py-4">

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <h2 className="font-bold text-[#241415]">
                      Solicitudes recibidas
                    </h2>

                    <p className="mt-1 text-xs text-[#806F67]">
                      {pqrFiltradas.length} resultado
                      {pqrFiltradas.length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7F0303] text-[#F8F3EA]">
                    <MessageCircle size={17} />
                  </div>

                </div>

              </div>

              <div className="max-h-[650px] overflow-y-auto p-4">

                {cargando ? (
                  <div className="flex min-h-[300px] items-center justify-center">

                    <div className="flex flex-col items-center gap-3 text-[#806F67]">

                      <RefreshCw
                        size={25}
                        className="animate-spin text-[#7F0303]"
                      />

                      <p className="text-sm">
                        Cargando PQR...
                      </p>

                    </div>

                  </div>
                ) : pqrFiltradas.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4E9E5] text-[#7F0303]">
                      <MessageCircle size={25} />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#241415]">
                      No hay PQR
                    </h3>

                    <p className="mt-1 max-w-xs text-sm text-[#806F67]">
                      No encontramos solicitudes que coincidan con la búsqueda.
                    </p>

                  </div>
                ) : (
                  <div className="space-y-3">

                    {pqrFiltradas.map((item) => {
                      const estiloEstado =
                        obtenerEstiloEstado(
                          item.estado
                        );

                      const seleccionada =
                        pqrSeleccionada?.id === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            seleccionarPQR(item)
                          }
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            seleccionada
                              ? "border-[#7F0303] bg-[#F9F1EE] shadow-sm"
                              : "border-[#E5DBD2] bg-white hover:border-[#BCA99D] hover:bg-[#FCFAF7]"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0 flex-1">

                              {/* PQR + CLIENTE */}
                              <div className="flex items-start gap-2">

                                <span className="shrink-0 text-xs font-bold text-[#7F0303]">
                                  PQR #{item.id}
                                </span>

                                <span className="text-[#B5A49B]">
                                  •
                                </span>

                                <div className="min-w-0">

                                  <p className="truncate text-xs font-semibold text-[#241415]">
                                    {item.nombre_cliente ||
                                      `Usuario #${item.usuario_id}`}
                                  </p>

                                  <p className="mt-0.5 truncate text-[11px] text-[#806F67]">
                                    {item.correo_cliente ||
                                      "Correo no disponible"}
                                  </p>

                                </div>

                              </div>

                              <h3 className="mt-3 truncate font-semibold text-[#241415]">
                                {item.asunto}
                              </h3>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#806F67]">
                                {item.descripcion}
                              </p>

                            </div>

                            <span
                              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${estiloEstado.clase}`}
                            >
                              {estiloEstado.icono}
                              {item.estado}
                            </span>

                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-[#EDE5DE] pt-3">

                            <span className="text-[11px] font-medium text-[#8C7A71]">
                              {item.tipo}
                            </span>

                            {item.respuesta ? (
                              <span className="text-[11px] font-semibold text-[#50634F]">
                                Respondida
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-[#8C7A71]">
                                Sin respuesta
                              </span>
                            )}

                          </div>

                        </button>
                      );
                    })}

                  </div>
                )}

              </div>

            </div>

            {/* ==================================================
                DETALLE / RESPUESTA
            ================================================== */}

            <div className="rounded-[24px] border border-[#E2D7CB] bg-white shadow-[0_6px_20px_rgba(36,20,21,0.04)]">

              {!pqrSeleccionada ? (
                <div className="flex min-h-[650px] flex-col items-center justify-center px-8 text-center">

                  <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#F4E9E5] text-[#7F0303]">
                    <MessageCircle
                      size={34}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-[#241415]">
                    Selecciona una PQR
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#806F67]">
                    Selecciona una solicitud de la lista para consultar toda la información y enviar una respuesta.
                  </p>

                </div>
              ) : (
                <>
                  {/* ==================================================
                      CABECERA DETALLE
                  ================================================== */}

                  <div className="border-b border-[#E8DED5] bg-[#F8F3EA] px-6 py-5">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                      <div>

                        <div className="flex items-start gap-3">

                          <span className="rounded-lg bg-[#7F0303] px-2.5 py-1 text-xs font-bold text-[#F8F3EA]">
                            PQR #{pqrSeleccionada.id}
                          </span>

                          <div>
                            <p className="text-sm font-bold text-[#241415]">
                              {pqrSeleccionada.nombre_cliente ||
                                `Usuario #${pqrSeleccionada.usuario_id}`}
                            </p>

                            <p className="mt-0.5 text-xs text-[#806F67]">
                              {pqrSeleccionada.correo_cliente ||
                                "Correo no disponible"}
                            </p>
                          </div>

                        </div>

                        <h2 className="mt-4 text-xl font-bold text-[#241415]">
                          {pqrSeleccionada.asunto}
                        </h2>

                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                          obtenerEstiloEstado(
                            pqrSeleccionada.estado
                          ).clase
                        }`}
                      >
                        {
                          obtenerEstiloEstado(
                            pqrSeleccionada.estado
                          ).icono
                        }

                        {pqrSeleccionada.estado}
                      </span>

                    </div>

                  </div>

                  {/* ==================================================
                      INFORMACIÓN
                  ================================================== */}

                  <div className="space-y-6 p-6">

                    {/* DATOS DEL CLIENTE */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      {/* NOMBRE */}

                      <div className="rounded-xl border border-[#E5DBD2] bg-[#FCFAF7] p-4">

                        <div className="flex items-center gap-2">

                          <User
                            size={16}
                            className="text-[#7F0303]"
                          />

                          <span className="text-xs font-semibold uppercase tracking-wide text-[#927E74]">
                            Cliente
                          </span>

                        </div>

                        <p className="mt-2 text-sm font-semibold text-[#241415]">
                          {pqrSeleccionada.nombre_cliente ||
                            `Usuario #${pqrSeleccionada.usuario_id}`}
                        </p>

                      </div>

                      {/* CORREO */}

                      <div className="rounded-xl border border-[#E5DBD2] bg-[#FCFAF7] p-4">

                        <div className="flex items-center gap-2">

                          <Mail
                            size={16}
                            className="text-[#7F0303]"
                          />

                          <span className="text-xs font-semibold uppercase tracking-wide text-[#927E74]">
                            Correo electrónico
                          </span>

                        </div>

                        <p className="mt-2 break-all text-sm font-semibold text-[#241415]">
                          {pqrSeleccionada.correo_cliente ||
                            "Correo no disponible"}
                        </p>

                      </div>

                    </div>

                    {/* TIPO */}

                    <div className="rounded-xl border border-[#E5DBD2] bg-[#FCFAF7] p-4">

                      <div className="flex items-center gap-2">

                        <MessageCircle
                          size={16}
                          className="text-[#7F0303]"
                        />

                        <span className="text-xs font-semibold uppercase tracking-wide text-[#927E74]">
                          Tipo de solicitud
                        </span>

                      </div>

                      <p className="mt-2 text-sm font-semibold capitalize text-[#241415]">
                        {pqrSeleccionada.tipo}
                      </p>

                    </div>

                    {/* DESCRIPCIÓN */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <h3 className="text-sm font-bold text-[#241415]">
                          Descripción de la solicitud
                        </h3>

                      </div>

                      <div className="rounded-2xl border border-[#E5DBD2] bg-[#F8F3EA] p-5">

                        <p className="whitespace-pre-wrap text-sm leading-7 text-[#5F514A]">
                          {pqrSeleccionada.descripcion}
                        </p>

                      </div>

                    </div>

                    {/* RESPUESTA ANTERIOR */}

                    {pqrSeleccionada.respuesta && (
                      <div>

                        <h3 className="mb-2 text-sm font-bold text-[#241415]">
                          Respuesta registrada
                        </h3>

                        <div className="rounded-2xl border border-[#D6DED2] bg-[#F3F5F1] p-5">

                          <p className="whitespace-pre-wrap text-sm leading-7 text-[#50634F]">
                            {pqrSeleccionada.respuesta}
                          </p>

                          {pqrSeleccionada.respondido_por && (
                            <p className="mt-3 border-t border-[#DDE4D9] pt-3 text-xs text-[#6B7567]">
                              Respondida por usuario #
                              {pqrSeleccionada.respondido_por}
                            </p>
                          )}

                        </div>

                      </div>
                    )}

                    {/* FORMULARIO RESPUESTA */}

                    <div className="border-t border-[#E8DED5] pt-6">

                      <div className="mb-4">

                        <h3 className="text-base font-bold text-[#241415]">
                          Gestionar PQR
                        </h3>

                        <p className="mt-1 text-xs text-[#806F67]">
                          Escribe una respuesta y selecciona el nuevo estado.
                        </p>

                      </div>

                      <div className="space-y-4">

                        {/* ESTADO */}

                        <div>

                          <label
                            htmlFor="estado-pqr"
                            className="mb-2 block text-sm font-semibold text-[#4B3C36]"
                          >
                            Estado
                          </label>

                          <select
                            id="estado-pqr"
                            value={estado}
                            onChange={(e) =>
                              setEstado(e.target.value)
                            }
                            className="w-full rounded-xl border border-[#DED2C6] bg-[#F8F3EA] px-4 py-3 text-sm text-[#241415] outline-none transition focus:border-[#7F0303] focus:ring-2 focus:ring-[#7F0303]/10"
                          >
                            <option value="pendiente">
                              Pendiente
                            </option>

                            <option value="en proceso">
                              En proceso
                            </option>

                            <option value="resuelta">
                              Resuelta
                            </option>

                            <option value="cerrada">
                              Cerrada
                            </option>
                          </select>

                        </div>

                        {/* RESPUESTA */}

                        <div>

                          <label
                            htmlFor="respuesta-pqr"
                            className="mb-2 block text-sm font-semibold text-[#4B3C36]"
                          >
                            Respuesta
                          </label>

                          <textarea
                            id="respuesta-pqr"
                            value={respuesta}
                            onChange={(e) =>
                              setRespuesta(e.target.value)
                            }
                            rows={6}
                            maxLength={500}
                            placeholder="Escribe aquí la respuesta para el cliente..."
                            className="w-full resize-none rounded-xl border border-[#DED2C6] bg-[#F8F3EA] px-4 py-3 text-sm leading-6 text-[#241415] outline-none transition placeholder:text-[#9A8980] focus:border-[#7F0303] focus:ring-2 focus:ring-[#7F0303]/10"
                          />

                          <div className="mt-1 flex justify-end">

                            <span className="text-[11px] text-[#927E74]">
                              {respuesta.length}/500
                            </span>

                          </div>

                        </div>

                        {/* BOTÓN */}

                        <button
                          type="button"
                          onClick={responderPQR}
                          disabled={
                            enviando ||
                            !respuesta.trim()
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7F0303] px-5 py-3.5 text-sm font-bold text-[#F8F3EA] transition hover:bg-[#241415] disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {enviando ? (
                            <>
                              <RefreshCw
                                size={17}
                                className="animate-spin"
                              />

                              Guardando...
                            </>
                          ) : (
                            <>
                              <Send size={17} />

                              Guardar respuesta
                            </>
                          )}

                        </button>

                      </div>

                    </div>

                  </div>
                </>
              )}

            </div>

          </section>

        </div>
      </div>
    </EstructuraPanel>
  );
}

export default EmpleadoPQR;