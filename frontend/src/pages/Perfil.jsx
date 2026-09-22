import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import EstructuraPanel from "../components/EstructuraPanel";

const API_URL = import.meta.env.VITE_API_URL;

export default function Perfil() {
  const { usuario, token, iniciarSesion } = useAuth();
  const rolId = Number(usuario?.rol_id ?? usuario?.rol?.id);
  const rol = rolId === 1 ? "administrador" : rolId === 2 ? "cliente" : "empleado";
  const [formulario, setFormulario] = useState({
    nombres: "",
    apellidos: "",
    direccion: "",
    telefono: "",
    email: "",
    password: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormulario({
        nombres: usuario.nombres || "",
        apellidos: usuario.apellidos || "",
        direccion: usuario.direccion || "",
        telefono: usuario.telefono || "",
        email: usuario.email || "",
        password: "",
      });
    }
  }, [usuario]);

  const manejarCambio = (e) => {
    setFormulario((actual) => ({ ...actual, [e.target.name]: e.target.value }));
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formulario),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.detail || "No se pudo actualizar el perfil.");
      iniciarSesion(datos, token);
      setFormulario((actual) => ({ ...actual, password: "" }));
      setMensaje("Perfil actualizado correctamente.");
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <EstructuraPanel rol={rol} titulo="Mi perfil">
    <main className="min-h-screen bg-[#EFE8DF] py-3 sm:px-2 sm:py-6 lg:px-4">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border border-[#D4AF37]/25 bg-[#F8F3EA] shadow-xl sm:rounded-[2rem]">
        <div className="bg-[#7F0303] p-5 text-white sm:p-8 md:p-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-[#3D1717] sm:h-14 sm:w-14"><UserRound size={27} /></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F0CC55] sm:tracking-[0.3em]">Cuenta personal</p><h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">Editar perfil</h1></div>
          </div>
        </div>
        <form onSubmit={guardarPerfil} className="grid gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-8 md:p-10">
          {[
            ["nombres", "Nombres"],
            ["apellidos", "Apellidos"],
            ["direccion", "Dirección"],
            ["telefono", "Teléfono"],
            ["email", "Correo electrónico"],
          ].map(([nombre, etiqueta]) => (
            <label key={nombre} className={nombre === "email" ? "sm:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-semibold text-[#3D1717]">{etiqueta}</span>
              <input name={nombre} type={nombre === "email" ? "email" : "text"} value={formulario[nombre]} onChange={manejarCambio} required={nombre !== "direccion" && nombre !== "telefono"} className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-[#3D1717] outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
            </label>
          ))}
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-[#3D1717]">Nueva contraseña (opcional)</span><input name="password" type="password" value={formulario.password} onChange={manejarCambio} minLength={8} className="w-full rounded-2xl border border-[#D8BA98] bg-white px-4 py-3 text-[#3D1717] outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" /></label>
          {mensaje && <p className="sm:col-span-2 text-sm font-semibold text-[#7F0303]">{mensaje}</p>}
          <button type="submit" disabled={guardando} className="flex items-center justify-center gap-2 rounded-2xl bg-[#7F0303] px-6 py-3 font-bold text-white transition hover:bg-[#52070A] disabled:opacity-50 sm:col-span-2"><Save size={18} />{guardando ? "Guardando..." : "Guardar cambios"}</button>
        </form>
      </div>
    </main>
    </EstructuraPanel>
  );
}
