import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ============================================================
  // ESTADOS INICIALES
  // ============================================================

  const [usuario, setUsuario] = useState(() => {
    try {
      const usuarioGuardado = localStorage.getItem("usuario");

      return usuarioGuardado
        ? JSON.parse(usuarioGuardado)
        : null;
    } catch (error) {
      console.error("Error al recuperar usuario:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // ============================================================
  // INICIAR SESIÓN
  // ============================================================

  const iniciarSesion = (usuarioDatos, tokenDatos) => {
    console.log("Guardando sesión...");
    console.log("Usuario:", usuarioDatos);
    console.log("Token:", tokenDatos);

    setUsuario(usuarioDatos);
    setToken(tokenDatos);

    localStorage.setItem(
      "usuario",
      JSON.stringify(usuarioDatos)
    );

    localStorage.setItem("token", tokenDatos);
  };

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);

    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  // ============================================================
  // ESTADO DE AUTENTICACIÓN
  // ============================================================

  const autenticado = Boolean(usuario && token);

  // ============================================================
  // CONTEXTO
  // ============================================================

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        iniciarSesion,
        cerrarSesion,
        autenticado,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useAuth() {
  return useContext(AuthContext);
}